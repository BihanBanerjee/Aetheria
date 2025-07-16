// src/lib/inngest/types/index.ts
import type { CommitProcessingStatus } from "@prisma/client";

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

// Project Creation Event Data
export interface ProjectCreationEventData {
  projectId: string;
  githubUrl: string;
  githubToken?: string;
  userId: string;
  fileCount: number;
}

// Commit Processing Event Data
export interface CommitProcessingEventData {
  projectId: string;
  commit: {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
  };
  githubUrl: string;
  commitIndex: number;
  totalCommits: number;
  waveIndex: number;
  totalWaves: number;
  delaySeconds?: number;
}

// Meeting Processing Event Data
export interface MeetingProcessingEventData {
  meetingUrl: string;
  meetingId: string;
  projectId: string;
  userId: string;
}

// Processing Results
export interface ProjectProcessingResult {
  success: boolean;
  projectId: string;
  indexedFiles?: number;
  error?: string;
}

export interface CommitProcessingResult {
  success: boolean;
  commitHash: string;
  processingStatus: CommitProcessingStatus;
  savedCommitId?: string;
  fallbackCommitId?: string;
  waveIndex: number;
  error?: string;
}

export interface MeetingProcessingResult {
  success: boolean;
  meetingId: string;
  issuesCreated?: number;
  meetingName?: string;
  message?: string;
}

// Batch Processing Types
export interface BatchProcessingConfig {
  smallBatchSize: number;
  waveSize: number;
  waveDelaySeconds: number;
  maxPolls: number;
  pollIntervalSeconds: number;
}

// Transcription Types
export interface TranscriptionJob {
  transcriptId: string;
}

export interface TranscriptionStatus {
  status: 'processing' | 'completed' | 'error';
  error?: string;
}

export interface MeetingSummary {
  start: string;
  end: string;
  gist: string;
  headline: string;
  summary: string;
}