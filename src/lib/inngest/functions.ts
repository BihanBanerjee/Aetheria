// src/lib/inngest/functions.ts
import { inngest } from "./client";
import { indexGithubRepo } from "@/lib/github-loader";
import { pollCommits } from "@/lib/github";
import { db } from "@/server/db";

// Define the project processing status enum
export type ProjectStatus = 
  | "INITIALIZING" 
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
      // Step 1: Update project status to indexing
      await step.run("update-status-indexing", async () => {
        return await db.project.update({
          where: { id: projectId },
          data: { 
            status: 'INDEXING_REPO',
            processedFiles: 0
          }
        });
      });

      // Step 2: Index the GitHub repository
      const indexingResult = await step.run("index-github-repo", async () => {
        console.log(`Starting to index repository for project ${projectId}`);
        const result = await indexGithubRepo(projectId, githubUrl, githubToken);
        console.log(`Successfully indexed ${result} files for project ${projectId}`);
        
        // Update progress
        await db.project.update({
          where: { id: projectId },
          data: { 
            status: 'POLLING_COMMITS',
            processedFiles: result
          }
        });
        
        return result;
      });

      // Step 3: Poll commits
      await step.run("poll-commits", async () => {
        console.log(`Starting to poll commits for project ${projectId}`);
        const result = await pollCommits(projectId);
        console.log(`Successfully processed ${result.count} commits for project ${projectId}`);
        
        // Update status
        await db.project.update({
          where: { id: projectId },
          data: { 
            status: 'DEDUCTING_CREDITS'
          }
        });
        
        return result;
      });

      // Step 4: Deduct credits from user
      await step.run("deduct-credits", async () => {
        console.log(`Deducting ${fileCount} credits from user ${userId}`);
        return await db.user.update({
          where: { id: userId },
          data: {
            credits: {
              decrement: fileCount
            }
          }
        });
      });

      // Step 5: Mark project as completed
      await step.run("mark-completed", async () => {
        console.log(`Project ${projectId} processing completed successfully`);
        return await db.project.update({
          where: { id: projectId },
          data: {
            status: 'COMPLETED'
          }
        });
      });

      console.log(`Project ${projectId} fully processed and ready!`);
      return { success: true, projectId, indexedFiles: indexingResult };

    } catch (error) {
      console.error(`Error processing project ${projectId}:`, error);
      
      // Mark project as failed
      await step.run("mark-failed", async () => {
        return await db.project.update({
          where: { id: projectId },
          data: {
            status: 'FAILED'
          }
        });
      });

      throw error;
    }
  }
);

// Export individual functions - this is the pattern Inngest expects
export const functions = [processProjectCreation];