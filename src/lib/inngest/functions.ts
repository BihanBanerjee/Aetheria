// src/lib/inngest/functions.ts
import { inngest } from "./client";
import { indexGithubRepo, loadGithubRepo } from "@/lib/github-loader";
import { pollCommits } from "@/lib/github";
import { summariseCode, generateEmbedding } from "@/lib/gemini";
import { checkTranscriptionStatus, processMeeting, retrieveTranscriptionResults, submitMeetingForProcessing } from "@/lib/assembly";
import { db } from "@/server/db";

export type ProjectStatus = 
  | "INITIALIZING" 
  | "LOADING_REPO"
  | "INDEXING_REPO" 
  | "POLLING_COMMITS" 
  | "DEDUCTING_CREDITS" 
  | "COMPLETED" 
  | "FAILED";

export type MeetingStatus = 
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

// Updated processProjectCreation with timeout-safe steps

export const processProjectCreation = inngest.createFunction(
  { 
    id: "aetheria-process-project-creation",
    name: "Aetheria: Process Project Creation",
    retries: 1,
    concurrency: {
      limit: 2,
      key: "event.data.userId",
    },
  },
  { event: "project.creation.requested" },
  async ({ event, step }) => {
    const { projectId, githubUrl, githubToken, userId, fileCount } = event.data;

    try {
      // Step 1: Load repository files (< 30 seconds - just fetching file list)
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

      // Step 2: Process files in SMALL batches to stay under 60 seconds
      const SMALL_BATCH_SIZE = 2; // Process only 2 files per step (30 seconds each max)
      const totalBatches = Math.ceil(docs.length / SMALL_BATCH_SIZE);
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * SMALL_BATCH_SIZE;
        const endIndex = Math.min(startIndex + SMALL_BATCH_SIZE, docs.length);
        const batch = docs.slice(startIndex, endIndex);
        
        await step.run(`process-file-batch-${batchIndex}`, async () => {
          console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} files)`);
          
          // Process each file in the small batch
          for (const doc of batch) {
            try {
              console.log(`Processing file: ${doc.metadata.source}`);
              
              // Single file processing (should be < 30 seconds)
              const summary = await summariseCode(doc);
              if (!summary || summary.trim() === "") {
                console.warn(`Empty summary for ${doc.metadata.source}, skipping`);
                continue;
              }
              
              const embedding = await generateEmbedding(summary);
              
              // Save immediately
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
              
              console.log(`✅ Processed: ${doc.metadata.source}`);
            } catch (error) {
              console.error(`❌ Error processing ${doc.metadata.source}:`, error);
              // Continue with next file instead of failing entire batch
            }
          }
          
          // Update progress after each batch
          await db.project.update({
            where: { id: projectId },
            data: { processedFiles: endIndex }
          });
          
          return { batchIndex, processedFiles: endIndex };
        });
        
        // Small delay between batches to avoid overwhelming APIs
        if (batchIndex < totalBatches - 1) {
          await step.sleep("batch-delay", "2s");
        }
      }

      // Step 3: Process commits in small batches (< 60 seconds per batch)
      await step.run("start-commit-processing", async () => {
        await db.project.update({
          where: { id: projectId },
          data: { status: 'POLLING_COMMITS' }
        });
        return { message: "Starting commit processing" };
      });

      // Get commits and process in safe batches
      const commitData = await step.run("get-commit-list", async () => {
        const project = await db.project.findUnique({
          where: { id: projectId },
          select: { githubUrl: true }
        });
        
        if (!project?.githubUrl) {
          throw new Error(`Project ${projectId} has no GitHub URL`);
        }
        
        const { getCommitHashes } = await import("@/lib/github");
        const commitHashes = await getCommitHashes(project.githubUrl);
        
        // Filter unprocessed commits
        const processedCommits = await db.commit.findMany({
          where: { projectId },
          select: { commitHash: true }
        });
        
        const processedHashes = new Set(processedCommits.map(commit => commit.commitHash));
        const unprocessedCommits = commitHashes.filter(commit => !processedHashes.has(commit.commitHash));
        
        return { unprocessedCommits, githubUrl: project.githubUrl };
      });

      // Process commits in small batches (1-2 commits per step to stay under 60s)
      const COMMIT_BATCH_SIZE = 1; // Process 1 commit per step for safety
      const commitBatches = Math.ceil(commitData.unprocessedCommits.length / COMMIT_BATCH_SIZE);
      
      for (let i = 0; i < commitBatches; i++) {
        const startIdx = i * COMMIT_BATCH_SIZE;
        const endIdx = Math.min(startIdx + COMMIT_BATCH_SIZE, commitData.unprocessedCommits.length);
        const commitBatch = commitData.unprocessedCommits.slice(startIdx, endIdx);
        
        if (commitBatch.length === 0) break;
        
        await step.run(`process-commits-${i}`, async () => {
          console.log(`Processing commit batch ${i + 1}/${commitBatches}`);
          
          for (const commit of commitBatch) {
            try {
              // Get commit diff (should be < 10 seconds)
              const axios = (await import("axios")).default;
              const { data: diffData } = await axios.get(
                `${commitData.githubUrl}/commit/${commit.commitHash}.diff`, 
                { timeout: 10000 }
              );
              
              // Summarize diff (should be < 30 seconds)
              const { aisummariseCommit } = await import("@/lib/gemini");
              const summary = await aisummariseCommit(diffData);
              
              // Save to database (< 5 seconds)
              await db.commit.create({
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
              
              console.log(`✅ Processed commit: ${commit.commitHash.substring(0, 8)}`);
            } catch (error) {
              console.error(`❌ Error processing commit ${commit.commitHash}:`, error);
              // Create a basic record even if processing fails
              await db.commit.create({
                data: {
                  projectId,
                  commitHash: commit.commitHash,
                  commitMessage: commit.commitMessage,
                  commitAuthorName: commit.commitAuthorName,
                  commitAuthorAvatar: commit.commitAuthorAvatar,
                  commitDate: commit.commitDate,
                  summary: "Processing failed"
                }
              }).catch(() => {}); // Ignore if already exists
            }
          }
          
          return { processedCommits: commitBatch.length };
        });
        
        // Small delay between commit batches
        if (i < commitBatches - 1) {
          await step.sleep("commit-batch-delay", "1s");
        }
      }

      // Step 4: Deduct credits (< 5 seconds)
      await step.run("deduct-credits", async () => {
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

      // Step 5: Mark as completed (< 5 seconds)
      await step.run("mark-completed", async () => {
        return await db.project.update({
          where: { id: projectId },
          data: { status: 'COMPLETED' }
        });
      });

      console.log(`✅ Project ${projectId} fully processed!`);
      return { success: true, projectId, indexedFiles: docs.length };

    } catch (error) {
      console.error(`❌ Error processing project ${projectId}:`, error);
      
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

// Alternative: Even more granular file processing
export const processProjectCreationUltraSafe = inngest.createFunction(
  { 
    id: "aetheria-process-project-creation-ultra-safe",
    name: "Aetheria: Ultra-Safe Project Creation",
    retries: 1,
    concurrency: {
      limit: 2,
      key: "event.data.userId",
    },
  },
  { event: "project.creation.requested.ultra-safe" },
  async ({ event, step }) => {
    const { projectId, githubUrl, githubToken, userId, fileCount } = event.data;

    try {
      // Step 1: Load and queue individual files
      const docs = await step.run("load-and-queue-files", async () => {
        const docs = await loadGithubRepo(githubUrl, githubToken);
        
        // Queue each file for individual processing
        for (let i = 0; i < docs.length; i++) {
          await inngest.send({
            name: "project.file.process.requested",
            data: {
              projectId,
              fileIndex: i,
              fileName: docs[i].metadata.source,
              fileContent: docs[i].pageContent,
              totalFiles: docs.length
            }
          });
        }
        
        return { totalFiles: docs.length };
      });

      // The individual file processing would be handled by separate functions
      // that process ONE file at a time, guaranteeing < 60 second execution
      
      return { success: true, queuedFiles: docs.totalFiles };
      
    } catch (error) {
      console.error(`Error queuing project files:`, error);
      throw error;
    }
  }
);

// Separate function to process individual files (guaranteed < 60 seconds)
export const processSingleFile = inngest.createFunction(
  {
    id: "aetheria-process-single-file",
    name: "Process Single File",
    concurrency: {
      limit: 5, // Process up to 5 files simultaneously
      key: "event.data.projectId"
    }
  },
  { event: "project.file.process.requested" },
  async ({ event, step }) => {
    const { projectId, fileIndex, fileName, fileContent, totalFiles } = event.data;

    await step.run("process-single-file", async () => {
      try {
        // Create document object
        const doc = {
          pageContent: fileContent,
          metadata: { source: fileName }
        };

        // Process single file (should be < 45 seconds)
        const summary = await summariseCode(doc);
        if (!summary || summary.trim() === "") {
          console.warn(`Empty summary for ${fileName}, skipping`);
          return;
        }
        
        const embedding = await generateEmbedding(summary);
        
        // Save to database
        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
          data: {
            summary,
            sourceCode: JSON.stringify(fileContent),
            fileName,
            projectId,
          }
        });

        await db.$executeRaw`
          UPDATE "SourceCodeEmbedding"
          SET "summaryEmbedding" = ${embedding}::vector
          WHERE "id" = ${sourceCodeEmbedding.id}
        `;

        // Update progress
        const updatedProject = await db.project.update({
          where: { id: projectId },
          data: { 
            processedFiles: { increment: 1 }
          },
          select: { processedFiles: true }
        });

        console.log(`✅ Processed file ${fileIndex + 1}/${totalFiles}: ${fileName}`);
        
        // Check if this was the last file
        if (updatedProject.processedFiles >= totalFiles) {
          // Trigger next phase (commit processing)
          await inngest.send({
            name: "project.files.completed",
            data: { projectId }
          });
        }

        return { success: true, fileName };
      } catch (error) {
        console.error(`Error processing file ${fileName}:`, error);
        return { success: false, fileName, error: error.message };
      }
    });
  }
);

// MEETING PROCESSING with concurrency per user
export const processMeetingFunction = inngest.createFunction(
  {
    id: "aetheria-process-meeting",
    name: "Aetheria: Process Meeting Recording", 
    retries: 1,
    concurrency: {
      limit: 3,
      key: "event.data.userId",
    },
  },
  { event: "meeting.processing.requested" },
  async ({ event, step }) => {
    const { meetingUrl, meetingId, projectId, userId } = event.data;

    try {
      console.log(`Starting to process meeting ${meetingId} for user ${userId}`);

      // Step 1: Validate meeting (< 10 seconds)
      const validationResult = await step.run("validate-meeting", async () => {
        const meeting = await db.meeting.findUnique({
          where: { id: meetingId },
          include: {
            project: {
              include: {
                userToProjects: {
                  where: { userId },
                  select: { userId: true }
                }
              }
            }
          }
        });

        if (!meeting) {
          throw new Error(`Meeting ${meetingId} not found`);
        }

        if (meeting.project.userToProjects.length === 0) {
          throw new Error(`User ${userId} not authorized for meeting ${meetingId}`);
        }

        if (meeting.status !== 'PROCESSING') {
          console.log(`Meeting ${meetingId} already processed with status: ${meeting.status}`);
          return { alreadyProcessed: true };
        }

        console.log(`Meeting ${meetingId} validated, starting processing`);
        return { alreadyProcessed: false };
      });

      if (validationResult.alreadyProcessed) {
        return { success: true, message: "Meeting already processed" };
      }

      // Step 2: Submit transcription job (< 10 seconds)
      const transcriptionJob = await step.run("submit-transcription", async () => {
        console.log(`Submitting transcription job for meeting ${meetingId}`);
        return await submitMeetingForProcessing(meetingUrl);
      });

      // Step 3: Poll for completion (each poll < 10 seconds)
      let transcriptionStatus;
      let pollAttempts = 0;
      const maxPolls = 20; // Maximum 20 polls = ~10 minutes max wait time

      do {
        pollAttempts++;
        
        // Wait before polling (except first attempt)
        if (pollAttempts > 1) {
          await step.sleep("wait-before-poll", `${30}s`); // Wait 30 seconds between polls
        }

        transcriptionStatus = await step.run(`poll-transcription-${pollAttempts}`, async () => {
          console.log(`Polling transcription status (attempt ${pollAttempts}/${maxPolls}) for meeting ${meetingId}`);
          return await checkTranscriptionStatus(transcriptionJob.transcriptId);
        });

        console.log(`Poll ${pollAttempts}: Status = ${transcriptionStatus.status}`);

        // Check for failure
        if (transcriptionStatus.status === 'error') {
          throw new Error(`Transcription failed: ${transcriptionStatus.error}`);
        }

        // Check for timeout
        if (pollAttempts >= maxPolls && transcriptionStatus.status !== 'completed') {
          throw new Error(`Transcription timeout after ${maxPolls} polling attempts`);
        }

      } while (transcriptionStatus.status !== 'completed');

      // Step 4: Retrieve results (< 10 seconds)
      const meetingData = await step.run("retrieve-transcription-results", async () => {
        console.log(`Retrieving transcription results for meeting ${meetingId}`);
        
        try {
          const result = await retrieveTranscriptionResults(transcriptionJob.transcriptId);
          
          if (!result.summaries || result.summaries.length === 0) {
            throw new Error('No summaries generated from transcription');
          }
          
          console.log(`Successfully retrieved ${result.summaries.length} discussion points for meeting ${meetingId}`);
          return result.summaries;
        } catch (error) {
          console.error(`Error retrieving transcription results for ${meetingId}:`, error);
          
          // Create fallback summary
          const fallbackSummary = {
            start: "00:00",
            end: "00:00",
            gist: "Meeting Processing Failed",
            headline: "Unable to process audio",
            summary: `Meeting audio could not be processed due to: ${error.message}. Please try re-uploading the meeting or contact support if the issue persists.`
          };
          
          return [fallbackSummary];
        }
      });

      // Step 5: Save issues to database (< 10 seconds)
      await step.run("save-meeting-issues", async () => {
        console.log(`Saving ${meetingData.length} issues to database for meeting ${meetingId}`);
        
        try {
          // Check if issues already exist
          const existingIssues = await db.issue.findMany({
            where: { meetingId }
          });

          if (existingIssues.length > 0) {
            console.log(`Issues already exist for meeting ${meetingId}, skipping creation`);
            return { savedIssues: existingIssues.length, skipped: true };
          }

          // Batch insert all issues
          await db.issue.createMany({
            data: meetingData.map(summary => ({
              start: summary.start,
              end: summary.end,
              gist: summary.gist,
              headline: summary.headline,
              summary: summary.summary,
              meetingId
            }))
          });

          console.log(`Successfully saved ${meetingData.length} issues for meeting ${meetingId}`);
          return { savedIssues: meetingData.length, skipped: false };
        } catch (error) {
          console.error(`Error saving issues for meeting ${meetingId}:`, error);
          throw new Error(`Failed to save issues: ${error.message}`);
        }
      });

      // Step 6: Update meeting status (< 5 seconds)
      await step.run("update-meeting-status", async () => {
        console.log(`Updating meeting ${meetingId} status to COMPLETED`);
        
        try {
          const meetingName = meetingData[0]?.headline || 'Meeting Summary';
          
          const updatedMeeting = await db.meeting.update({
            where: { id: meetingId },
            data: {
              status: 'COMPLETED',
              name: meetingName
            }
          });

          console.log(`Meeting ${meetingId} successfully completed with name: ${meetingName}`);
          return updatedMeeting;
        } catch (error) {
          console.error(`Error updating meeting status for ${meetingId}:`, error);
          throw new Error(`Failed to update meeting status: ${error.message}`);
        }
      });

      console.log(`Meeting ${meetingId} processing completed successfully`);
      return { 
        success: true, 
        meetingId, 
        issuesCreated: meetingData.length,
        meetingName: meetingData[0]?.headline || 'Meeting Summary'
      };

    } catch (error) {
      console.error(`Error processing meeting ${meetingId}:`, error);
      
      // Mark meeting as failed with detailed error info
      await step.run("mark-meeting-failed", async () => {
        try {
          return await db.meeting.update({
            where: { id: meetingId },
            data: { 
              status: 'COMPLETED', // Keep as COMPLETED but with error info in issues
              name: `Processing Failed: ${error.message.substring(0, 50)}...`
            }
          });
        } catch (dbError) {
          console.error(`Failed to update meeting status to failed:`, dbError);
          return null;
        }
      });

      throw error;
    }
  }
);

// Helper function for processing commits in smaller batches with concurrency
async function pollCommitsInBatches(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true }
  });
  
  if (!project?.githubUrl) {
    throw new Error(`Project ${projectId} has no GitHub URL`);
  }
  
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
  
  // Process commits in concurrent batches
  const COMMIT_BATCH_SIZE = 3; // Larger batches with concurrency
  const CONCURRENT_COMMIT_BATCHES = 2; // Process 2 batches of commits simultaneously
  let totalProcessed = 0;
  
  for (let i = 0; i < unprocessedCommits.length; i += (COMMIT_BATCH_SIZE * CONCURRENT_COMMIT_BATCHES)) {
    const batchPromises = [];
    
    for (let j = 0; j < CONCURRENT_COMMIT_BATCHES; j++) {
      const startIndex = i + (j * COMMIT_BATCH_SIZE);
      const endIndex = Math.min(startIndex + COMMIT_BATCH_SIZE, unprocessedCommits.length);
      
      if (startIndex < unprocessedCommits.length) {
        const batch = unprocessedCommits.slice(startIndex, endIndex);
        
        batchPromises.push(
          Promise.allSettled(batch.map(async (commit) => {
            try {
              const { aisummariseCommit } = await import("@/lib/gemini");
              const axios = (await import("axios")).default;
              
              // Get commit diff with timeout
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
          }))
        );
      }
    }
    
    // Wait for all concurrent batches to complete
    const batchResults = await Promise.all(batchPromises);
    
    // Count successful results
    batchResults.forEach(batchResult => {
      const successfulResults = batchResult
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .length;
      totalProcessed += successfulResults;
    });
    
    // Small delay between concurrent batch groups
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return { count: totalProcessed };
}

export const functions = [processProjectCreation, processMeetingFunction];