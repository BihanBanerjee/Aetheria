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

// PROJECT CREATION with concurrency per user
export const processProjectCreation = inngest.createFunction(
  { 
    id: "aetheria-process-project-creation",
    name: "Aetheria: Process Project Creation",
    retries: 1,
    concurrency: {
      limit: 2, // Allow max 2 projects per user simultaneously
      key: "event.data.userId", // Key by userId to prevent one user from overloading
    },
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

      // Step 2: Process files in concurrent batches
      const BATCH_SIZE = 3; // Slightly larger batches since we have concurrency control
      const totalBatches = Math.ceil(docs.length / BATCH_SIZE);
      
      // Process multiple batches concurrently (but limited by concurrency settings)
      const CONCURRENT_BATCHES = 3; // Process 3 batches at once
      
      for (let i = 0; i < totalBatches; i += CONCURRENT_BATCHES) {
        const batchPromises = [];
        
        for (let j = 0; j < CONCURRENT_BATCHES && (i + j) < totalBatches; j++) {
          const batchIndex = i + j;
          const startIndex = batchIndex * BATCH_SIZE;
          const endIndex = Math.min(startIndex + BATCH_SIZE, docs.length);
          const batch = docs.slice(startIndex, endIndex);
          
          batchPromises.push(
            step.run(`process-batch-${batchIndex}`, async () => {
              console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} files)`);
              
              // Process files in this batch concurrently
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
              
              return {
                batchIndex,
                results: batchResults.length,
                processedFiles: endIndex
              };
            })
          );
        }
        
        // Wait for all concurrent batches to complete
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Update progress after each set of concurrent batches
        const maxProcessedFiles = Math.min((i + CONCURRENT_BATCHES) * BATCH_SIZE, docs.length);
        await step.run(`update-progress-${i}`, async () => {
          return await db.project.update({
            where: { id: projectId },
            data: { processedFiles: maxProcessedFiles }
          });
        });
        
        // Small delay to avoid overwhelming the APIs
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Step 3: Poll commits (can also be done concurrently with file processing)
      await step.run("poll-commits", async () => {
        console.log(`Starting to poll commits for project ${projectId}`);
        
        await db.project.update({
          where: { id: projectId },
          data: { status: 'POLLING_COMMITS' }
        });
        
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