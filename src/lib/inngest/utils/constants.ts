// src/lib/inngest/utils/constants.ts
import type { BatchProcessingConfig } from "../types";

export const BATCH_PROCESSING_CONFIG: BatchProcessingConfig = {
  smallBatchSize: 2,        // Process only 2 files per step (30 seconds each max)
  waveSize: 3,              // Process 3 commits simultaneously
  waveDelaySeconds: 20,     // 20 seconds between waves
  maxPolls: 20,             // Maximum 20 polls = ~10 minutes max wait time
  pollIntervalSeconds: 30,  // Wait 30 seconds between polls
};

export const FUNCTION_IDS = {
  PROJECT_CREATION: "aetheria-process-project-creation",
  COMMIT_PROCESSING: "aetheria-process-single-commit",
  MEETING_PROCESSING: "aetheria-process-meeting",
} as const;

export const FUNCTION_NAMES = {
  PROJECT_CREATION: "Aetheria: Process Project Creation",
  COMMIT_PROCESSING: "Process Single Commit",
  MEETING_PROCESSING: "Aetheria: Process Meeting Recording",
} as const;

export const CONCURRENCY_LIMITS = {
  PROJECT_CREATION: 2,
  COMMIT_PROCESSING: 5,
  MEETING_PROCESSING: 3,
} as const;

export const RETRY_CONFIGS = {
  PROJECT_CREATION: 1,
  COMMIT_PROCESSING: 2,
  MEETING_PROCESSING: 1,
} as const;

export const TIMEOUTS = {
  FILE_PROCESSING: 30000,    // 30 seconds
  COMMIT_DIFF_FETCH: 15000,  // 15 seconds
  BATCH_DELAY: 2000,         // 2 seconds
  RANDOM_DELAY_MAX: 3000,    // 3 seconds
} as const;

export const EVENT_NAMES = {
  PROJECT_CREATION_REQUESTED: "project.creation.requested",
  COMMIT_PROCESS_REQUESTED: "project.commit.process.requested",
  MEETING_PROCESSING_REQUESTED: "meeting.processing.requested",
} as const;