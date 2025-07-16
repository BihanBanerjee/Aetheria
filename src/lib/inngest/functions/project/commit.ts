// src/lib/inngest/functions/project/commit.ts
import { inngest } from "../../client";
import { 
  FUNCTION_IDS, 
  FUNCTION_NAMES, 
  CONCURRENCY_LIMITS, 
  RETRY_CONFIGS, 
  EVENT_NAMES,
  TIMEOUTS 
} from "../../utils/constants";
import { statusUpdateSteps } from "../../steps/common/status-updates";
import { batchProcessingUtils } from "../../utils/batch-processing";
import type { CommitProcessingEventData, CommitProcessingResult } from "../../types";
import type { CommitProcessingStatus } from "@prisma/client";

export const processSingleCommit = inngest.createFunction(
  {
    id: FUNCTION_IDS.COMMIT_PROCESSING,
    name: FUNCTION_NAMES.COMMIT_PROCESSING,
    retries: RETRY_CONFIGS.COMMIT_PROCESSING,
    concurrency: {
      limit: CONCURRENCY_LIMITS.COMMIT_PROCESSING,
      key: "global"
    }
  },
  { event: EVENT_NAMES.COMMIT_PROCESS_REQUESTED },
  async ({ event, step }): Promise<CommitProcessingResult> => {
    const { 
      projectId, 
      commit, 
      githubUrl, 
      commitIndex, 
      totalCommits, 
      waveIndex,
      totalWaves,
      delaySeconds 
    }: CommitProcessingEventData = event.data;

    try {
      // Step 1: Mark as processing
      await step.run("mark-processing", async () => {
        return await statusUpdateSteps.markCommitAsProcessing(projectId, commit);
      });

      // Step 2: Apply wave delay
      if (delaySeconds && delaySeconds > 0) {
        await step.sleep("wave-delay", batchProcessingUtils.createDelay(delaySeconds));
      }

      // Step 3: Apply random delay within wave
      const randomDelay = batchProcessingUtils.generateRandomDelay();
      if (randomDelay > 0) {
        await step.sleep("random-delay", batchProcessingUtils.createMillisecondDelay(randomDelay));
      }

      // Step 4: Process the commit
      const result = await step.run("process-commit", async () => {
        try {
          console.log(`🌊 Wave ${waveIndex + 1}/${totalWaves} - Processing commit ${commitIndex + 1}/${totalCommits}: ${commit.commitHash.substring(0, 8)}`);
          
          // Get commit diff
          const diffData = await fetchCommitDiff(githubUrl, commit.commitHash);
          
          // Generate AI summary
          const { summary, processingStatus } = await generateCommitSummary(diffData, commit);
          
          // Update in database
          const updatedCommit = await statusUpdateSteps.updateCommitStatus(
            projectId,
            commit,
            summary,
            processingStatus
          );
          
          statusUpdateSteps.logProcessingProgress(
            'wave',
            waveIndex + 1,
            totalWaves,
            commit.commitHash.substring(0, 8),
            processingStatus === 'COMPLETED' ? 'completed' : 'failed'
          );
          
          return { 
            success: processingStatus === 'COMPLETED', 
            commitHash: commit.commitHash,
            processingStatus,
            savedCommitId: updatedCommit.id,
            waveIndex
          };
          
        } catch (error) {
          console.error(`❌ Wave ${waveIndex + 1} - Error processing commit ${commit.commitHash}:`, error);
          
          // Mark as failed in database
          const failedCommit = await statusUpdateSteps.createFailedCommitEntry(
            projectId,
            commit,
            error instanceof Error ? error.message : 'Unknown error'
          );
          
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error',
            commitHash: commit.commitHash,
            processingStatus: 'FAILED' as CommitProcessingStatus,
            fallbackCommitId: failedCommit.id,
            waveIndex
          };
        }
      });

      return result;

    } catch (error) {
      console.error(`Failed to process commit ${commit.commitHash}:`, error);
      throw error;
    }
  }
);

/**
 * Fetches commit diff from GitHub
 */
async function fetchCommitDiff(githubUrl: string, commitHash: string): Promise<string> {
  try {
    const axios = (await import("axios")).default;
    
    const { data } = await axios.get(
      `${githubUrl}/commit/${commitHash}.diff`, 
      { 
        timeout: TIMEOUTS.COMMIT_DIFF_FETCH,
        headers: { 'Accept': 'application/vnd.github.v3.diff' }
      }
    );
    
    return data;
  } catch (error) {
    console.error(`Error fetching diff for commit ${commitHash}:`, error);
    return "Unable to fetch commit diff";
  }
}

/**
 * Generates AI summary for commit
 */
async function generateCommitSummary(
  diffData: string,
  commit: { commitHash: string; commitMessage: string }
): Promise<{ summary: string; processingStatus: CommitProcessingStatus }> {
  try {
    const { aisummariseCommit } = await import("@/lib/gemini");
    
    const summary = await aisummariseCommit(diffData);
    
    if (summary && summary.trim().length > 0 && !summary.includes("Failed to")) {
      return { summary, processingStatus: 'COMPLETED' };
    } else {
      return {
        summary: `Processing failed: Unable to generate AI summary for commit ${commit.commitMessage || commit.commitHash.substring(0, 8)}`,
        processingStatus: 'FAILED'
      };
    }
  } catch (error) {
    console.error(`Error summarizing commit ${commit.commitHash}:`, error);
    return {
      summary: `Processing failed: ${error instanceof Error ? error.message : 'AI summary generation failed'}`,
      processingStatus: 'FAILED'
    };
  }
}