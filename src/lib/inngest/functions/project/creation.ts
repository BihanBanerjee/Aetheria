// src/lib/inngest/functions/project/creation.ts
import { inngest } from "../../client";
import { 
  FUNCTION_IDS, 
  FUNCTION_NAMES, 
  CONCURRENCY_LIMITS, 
  RETRY_CONFIGS, 
  EVENT_NAMES 
} from "../../utils/constants";
import { statusUpdateSteps } from "../../steps/common/status-updates";
import { fileProcessingSteps } from "../../steps/project/file-processing";
import { commitQueueingSteps } from "../../steps/project/commit-queueing";
import { creditDeductionSteps } from "../../steps/project/credit-deduction";
import { batchProcessingUtils } from "../../utils/batch-processing";
import { projectDatabase } from "../../utils/database";
import type { ProjectCreationEventData, ProjectProcessingResult } from "../../types";

export const processProjectCreation = inngest.createFunction(
  { 
    id: FUNCTION_IDS.PROJECT_CREATION,
    name: FUNCTION_NAMES.PROJECT_CREATION,
    retries: RETRY_CONFIGS.PROJECT_CREATION,
    concurrency: {
      limit: CONCURRENCY_LIMITS.PROJECT_CREATION,
      key: "event.data.userId",
    },
  },
  { event: EVENT_NAMES.PROJECT_CREATION_REQUESTED },
  async ({ event, step }): Promise<ProjectProcessingResult> => {
    const { projectId, githubUrl, githubToken, userId, fileCount }: ProjectCreationEventData = event.data;

    try {
      // Step 1: Load repository files
      const docs = await step.run("load-github-repo", async () => {
        await statusUpdateSteps.updateProjectStatus(projectId, 'LOADING_REPO');
        
        const docs = await fileProcessingSteps.loadRepositoryFiles(githubUrl, githubToken);
        console.log(`Loaded ${docs.length} files for project ${projectId}`);
        
        await statusUpdateSteps.updateProjectStatus(projectId, 'INDEXING_REPO', {
          totalFiles: docs.length,
          processedFiles: 0
        });
        
        return docs;
      });

      // Step 2: Process files in small batches
      await step.run("process-files", async () => {
        const progressUpdater = async (processedFiles: number) => {
          await statusUpdateSteps.updateProjectStatus(projectId, 'INDEXING_REPO', {
            processedFiles
          });
        };

        const result = await fileProcessingSteps.processAllFiles(
          docs,
          projectId,
          progressUpdater
        );

        console.log(`File processing completed: ${result.totalProcessed} processed, ${result.totalErrors} errors`);
        return result;
      });

      // Step 3: Queue commits for processing
      const queueResult = await step.run("queue-commit-processing", async () => {
        await statusUpdateSteps.updateProjectStatus(projectId, 'POLLING_COMMITS');

        const project = await projectDatabase.getProject(projectId);
        
        if (!project?.githubUrl) {
          throw new Error(`Project ${projectId} has no GitHub URL`);
        }
        
        const commitHashes = await commitQueueingSteps.getCommitHashes(project.githubUrl);
        const unprocessedCommits = await commitQueueingSteps.filterUnprocessedCommits(
          projectId,
          commitHashes
        );

        commitQueueingSteps.logQueueingStats(
          commitHashes.length,
          commitHashes.length - unprocessedCommits.length,
          unprocessedCommits.length
        );

        return await commitQueueingSteps.queueCommitsForProcessing(
          projectId,
          project.githubUrl,
          unprocessedCommits
        );
      });

      // Step 4: Deduct credits
      await step.run("deduct-credits", async () => {
        await statusUpdateSteps.updateProjectStatus(projectId, 'DEDUCTING_CREDITS');
        
        return await creditDeductionSteps.deductCredits(userId, fileCount);
      });

      // Step 5: Mark as completed
      await step.run("mark-completed", async () => {
        return await statusUpdateSteps.markProjectAsCompleted(projectId);
      });

      console.log(`✅ Project ${projectId} fully processed! Commits are being processed in background.`);
      
      return { 
        success: true, 
        projectId, 
        indexedFiles: docs.length 
      };

    } catch (error) {
      console.error(`❌ Error processing project ${projectId}:`, error);
      
      await step.run("mark-failed", async () => {
        return await statusUpdateSteps.markProjectAsFailed(projectId);
      });

      throw error;
    }
  }
);