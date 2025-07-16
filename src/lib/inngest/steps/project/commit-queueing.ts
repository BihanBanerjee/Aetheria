// src/lib/inngest/steps/project/commit-queueing.ts
import { commitDatabase } from "../../utils/database";
import { batchProcessingUtils } from "../../utils/batch-processing";
import { BATCH_PROCESSING_CONFIG } from "../../utils/constants";



export const commitQueueingSteps = {
  /**
   * Gets commit hashes from GitHub repository
   */
  async getCommitHashes(githubUrl: string) {
    const { getCommitHashes } = await import("@/lib/github");
    return await getCommitHashes(githubUrl);
  },

  /**
   * Filters out already processed commits
   */
  async filterUnprocessedCommits(
    projectId: string,
    commitHashes: Array<{
      commitHash: string;
      commitMessage: string;
      commitAuthorName: string;
      commitAuthorAvatar: string;
      commitDate: string;
    }>
  ) {
    const processedCommits = await commitDatabase.findProcessedCommits(projectId);
    
    return batchProcessingUtils.filterUnprocessedCommits(
      commitHashes,
      processedCommits
    );
  },

  /**
   * Queues commits for processing in waves
   */
  async queueCommitsForProcessing(
    projectId: string,
    githubUrl: string,
    unprocessedCommits: Array<{
      commitHash: string;
      commitMessage: string;
      commitAuthorName: string;
      commitAuthorAvatar: string;
      commitDate: string;
    }>
  ) {
    if (unprocessedCommits.length === 0) {
      console.log("No unprocessed commits found");
      return {
        queuedCommits: 0,
        waves: 0,
        estimatedTimeSeconds: 0
      };
    }

    return await batchProcessingUtils.queueCommitsInWaves(
      projectId,
      githubUrl,
      unprocessedCommits
    );
  },

  /**
   * Estimates processing time for commits
   */
  estimateProcessingTime(commitCount: number): number {
    const { waveSize, waveDelaySeconds } = BATCH_PROCESSING_CONFIG;
    const totalWaves = Math.ceil(commitCount / waveSize);
    return totalWaves * waveDelaySeconds;
  },

  /**
   * Logs commit queueing statistics
   */
  logQueueingStats(
    totalCommits: number,
    processedCommits: number,
    queuedCommits: number
  ) {
    console.log(`📊 Commit Processing Statistics:`);
    console.log(`   Total commits in repository: ${totalCommits}`);
    console.log(`   Already processed: ${processedCommits}`);
    console.log(`   Queued for processing: ${queuedCommits}`);
  }
};