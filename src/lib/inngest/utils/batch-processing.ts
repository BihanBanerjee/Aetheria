// src/lib/inngest/utils/batch-processing.ts
import { BATCH_PROCESSING_CONFIG, TIMEOUTS } from "./constants";
import { inngest } from "../client";
import { EVENT_NAMES } from "./constants";
import type { CommitProcessingEventData } from "../types";

export const batchProcessingUtils = {
  /**
   * Creates batches from an array of items
   */
  createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  },

  /**
   * Calculates total number of batches needed
   */
  calculateTotalBatches(itemCount: number, batchSize: number): number {
    return Math.ceil(itemCount / batchSize);
  },

  /**
   * Generates a random delay for wave processing
   */
  generateRandomDelay(maxDelay: number = TIMEOUTS.RANDOM_DELAY_MAX): number {
    return Math.floor(Math.random() * maxDelay);
  },

  /**
   * Queues commits for wave processing
   */
  async queueCommitsInWaves(
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
    const { waveSize, waveDelaySeconds } = BATCH_PROCESSING_CONFIG;
    const totalWaves = Math.ceil(unprocessedCommits.length / waveSize);
    
    console.log(`Queuing ${unprocessedCommits.length} commits for processing`);
    
    for (let waveIndex = 0; waveIndex < totalWaves; waveIndex++) {
      const startIndex = waveIndex * waveSize;
      const endIndex = Math.min(startIndex + waveSize, unprocessedCommits.length);
      const waveCommits = unprocessedCommits.slice(startIndex, endIndex);
      
      // Queue all commits in this wave to start at the same time
      for (let i = 0; i < waveCommits.length; i++) {
        const commit = waveCommits[i];
        const globalIndex = startIndex + i;
        
        // Skip if commit is undefined (should not happen but TypeScript safety)
        if (!commit) {
          console.warn(`Skipping undefined commit at index ${globalIndex}`);
          continue;
        }
        
        const eventData: CommitProcessingEventData = {
          projectId,
          commit,
          githubUrl,
          commitIndex: globalIndex,
          totalCommits: unprocessedCommits.length,
          waveIndex,
          totalWaves,
          delaySeconds: waveIndex * waveDelaySeconds
        };
        
        await inngest.send({
          name: EVENT_NAMES.COMMIT_PROCESS_REQUESTED,
          data: eventData
        });
      }
    }
    
    const estimatedTime = totalWaves * waveDelaySeconds;
    console.log(`📊 Queued ${unprocessedCommits.length} commits in ${totalWaves} waves. Estimated completion: ${estimatedTime} seconds`);
    
    return { 
      queuedCommits: unprocessedCommits.length,
      waves: totalWaves,
      estimatedTimeSeconds: estimatedTime
    };
  },

  /**
   * Processes file batches with proper progress tracking
   */
  async processFileBatches<T>(
    items: T[],
    batchSize: number,
    processor: (batch: T[], batchIndex: number) => Promise<void>,
    progressUpdater?: (processedCount: number) => Promise<void>
  ): Promise<void> {
    const totalBatches = this.calculateTotalBatches(items.length, batchSize);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, items.length);
      const batch = items.slice(startIndex, endIndex);
      
      console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} items)`);
      
      await processor(batch, batchIndex);
      
      // Update progress if updater provided
      if (progressUpdater) {
        await progressUpdater(endIndex);
      }
    }
  },

  /**
   * Creates a delay promise for step processing
   */
  createDelay(seconds: number): string {
    return `${seconds}s`;
  },

  /**
   * Creates a millisecond delay promise
   */
  createMillisecondDelay(milliseconds: number): string {
    return `${milliseconds}ms`;
  },

  /**
   * Filters unprocessed commits from a list
   */
  filterUnprocessedCommits(
    allCommits: Array<{
      commitHash: string;
      commitMessage: string;
      commitAuthorName: string;
      commitAuthorAvatar: string;
      commitDate: string;
    }>,
    processedCommits: Array<{ commitHash: string }>
  ) {
    const processedHashes = new Set(processedCommits.map(commit => commit.commitHash));
    return allCommits.filter(commit => !processedHashes.has(commit.commitHash));
  }
};