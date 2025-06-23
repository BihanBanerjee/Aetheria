// src/lib/inngest/functions.ts
import { inngest } from "./client";
import { indexGithubRepo, loadGithubRepo } from "@/lib/github-loader";
import { pollCommits } from "@/lib/github";
import { summariseCode, generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";

export type ProjectStatus = 
  | "INITIALIZING" 
  | "LOADING_REPO"
  | "INDEXING_REPO" 
  | "POLLING_COMMITS" 
  | "DEDUCTING_CREDITS" 
  | "COMPLETED" 
  | "FAILED";

export const processProjectCreation = inngest.createFunction(
  { 
    id: "aetheria-process-project-creation",
    name: "Aetheria: Process Project Creation"
  },
  { event: "project.creation.requested" },
  async ({ event, step }) => {
    const { projectId, githubUrl, githubToken, userId, fileCount } = event.data;

    try {
      // Step 1: Load repository files
      const docs = await step.run("load-github-repo", async () => {
        await db.project.update({
          where: { id: projectId },
          data: { status: 'LOADING_REPO' }
        });
        
        const docs = await loadGithubRepo(githubUrl, githubToken);
        console.log(`Loaded ${docs.length} files for project ${projectId}`);
        
        await db.project.update({
          where: { id: projectId },
          data: { 
            status: 'INDEXING_REPO',
            totalFiles: docs.length,
            processedFiles: 0
          }
        });
        
        return docs;
      });

      // Step 2: Process files in small batches (1-2 files per step)
      const BATCH_SIZE = 2; // Smaller batches
      const totalBatches = Math.ceil(docs.length / BATCH_SIZE);
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        await step.run(`process-batch-${batchIndex}`, async () => {
          const startIndex = batchIndex * BATCH_SIZE;
          const endIndex = Math.min(startIndex + BATCH_SIZE, docs.length);
          const batch = docs.slice(startIndex, endIndex);
          
          console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} files)`);
          
          const batchResults = await Promise.allSettled(batch.map(async (doc) => {
            try {
              const summary = await summariseCode(doc);
              if (!summary || summary.trim() === "") {
                console.warn(`Empty summary for ${doc.metadata.source}, skipping`);
                return null;
              }
              
              const embedding = await generateEmbedding(summary);
              
              // Save immediately to database
              const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
                data: {
                  summary: summary,
                  sourceCode: JSON.stringify(doc.pageContent),
                  fileName: doc.metadata.source,
                  projectId,
                }
              });

              await db.$executeRaw`
                UPDATE "SourceCodeEmbedding"
                SET "summaryEmbedding" = ${embedding}::vector
                WHERE "id" = ${sourceCodeEmbedding.id}
              `;
              
              console.log(`Saved embedding for ${doc.metadata.source}`);
              return { success: true, fileName: doc.metadata.source };
            } catch (error) {
              console.error(`Error processing file ${doc.metadata.source}:`, error);
              return { success: false, fileName: doc.metadata.source, error: error.message };
            }
          }));
          
          // Update progress
          const processedCount = startIndex + batch.length;
          await db.project.update({
            where: { id: projectId },
            data: { processedFiles: processedCount }
          });
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return {
            batchIndex,
            processedFiles: processedCount,
            totalFiles: docs.length,
            results: batchResults.length
          };
        });
      }

      // Step 3: Poll commits in smaller batches
      await step.run("poll-commits", async () => {
        console.log(`Starting to poll commits for project ${projectId}`);
        
        await db.project.update({
          where: { id: projectId },
          data: { status: 'POLLING_COMMITS' }
        });
        
        // Use a modified pollCommits that processes smaller batches
        const result = await pollCommitsInBatches(projectId);
        console.log(`Successfully processed ${result.count} commits`);
        
        return result;
      });

      // Step 4: Deduct credits
      await step.run("deduct-credits", async () => {
        console.log(`Deducting ${fileCount} credits from user ${userId}`);
        
        await db.project.update({
          where: { id: projectId },
          data: { status: 'DEDUCTING_CREDITS' }
        });
        
        return await db.user.update({
          where: { id: userId },
          data: {
            credits: {
              decrement: fileCount
            }
          }
        });
      });

      // Step 5: Mark as completed
      await step.run("mark-completed", async () => {
        console.log(`Project ${projectId} processing completed successfully`);
        return await db.project.update({
          where: { id: projectId },
          data: { status: 'COMPLETED' }
        });
      });

      console.log(`Project ${projectId} fully processed and ready!`);
      return { success: true, projectId, indexedFiles: docs.length };

    } catch (error) {
      console.error(`Error processing project ${projectId}:`, error);
      
      await step.run("mark-failed", async () => {
        return await db.project.update({
          where: { id: projectId },
          data: { status: 'FAILED' }
        });
      });

      throw error;
    }
  }
);

// Helper function for processing commits in smaller batches
async function pollCommitsInBatches(projectId: string) {
  // Get project GitHub URL
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true }
  });
  
  if (!project?.githubUrl) {
    throw new Error(`Project ${projectId} has no GitHub URL`);
  }
  
  // Import the functions we need
  const { getCommitHashes } = await import("@/lib/github");
  
  const commitHashes = await getCommitHashes(project.githubUrl);
  
  // Filter unprocessed commits
  const processedCommits = await db.commit.findMany({
    where: { projectId },
    select: { commitHash: true }
  });
  
  const processedHashes = new Set(processedCommits.map(commit => commit.commitHash));
  const unprocessedCommits = commitHashes.filter(commit => !processedHashes.has(commit.commitHash));
  
  if (unprocessedCommits.length === 0) {
    return { count: 0 };
  }
  
  // Process commits in very small batches
  const COMMIT_BATCH_SIZE = 2;
  let totalProcessed = 0;
  
  for (let i = 0; i < unprocessedCommits.length; i += COMMIT_BATCH_SIZE) {
    const batch = unprocessedCommits.slice(i, i + COMMIT_BATCH_SIZE);
    
    // Process this batch with timeout protection
    const batchResults = await Promise.allSettled(batch.map(async (commit) => {
      try {
        const { aisummariseCommit } = await import("@/lib/gemini");
        const axios = (await import("axios")).default;
        
        // Get commit diff
        const { data } = await axios.get(`${project.githubUrl}/commit/${commit.commitHash}.diff`, {
          timeout: 10000
        });
        
        const summary = await aisummariseCommit(data);
        
        return await db.commit.create({
          data: {
            projectId,
            commitHash: commit.commitHash,
            commitMessage: commit.commitMessage,
            commitAuthorName: commit.commitAuthorName,
            commitAuthorAvatar: commit.commitAuthorAvatar,
            commitDate: commit.commitDate,
            summary: summary || "Failed to generate summary"
          }
        });
      } catch (error) {
        console.error(`Error processing commit ${commit.commitHash}:`, error);
        return null;
      }
    }));
    
    const successfulResults = batchResults
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .length;
    
    totalProcessed += successfulResults;
    
    // Add delay between commit batches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return { count: totalProcessed };
}

export const functions = [processProjectCreation];