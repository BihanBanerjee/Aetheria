// src/lib/inngest/steps/common/status-updates.ts
import { projectDatabase, commitDatabase, meetingDatabase } from "../../utils/database";
import type { ProjectStatus, MeetingStatus } from "../../types";
import type { CommitProcessingStatus } from "@prisma/client";

export const statusUpdateSteps = {
  /**
   * Updates project status with optional progress data
   */
  async updateProjectStatus(
    projectId: string, 
    status: ProjectStatus, 
    progressData?: {
      totalFiles?: number;
      processedFiles?: number;
    }
  ) {
    return await projectDatabase.updateProgress(projectId, {
      status,
      ...progressData
    });
  },

  /**
   * Marks project as failed
   */
  async markProjectAsFailed(projectId: string) {
    return await projectDatabase.markAsFailed(projectId);
  },

  /**
   * Marks project as completed
   */
  async markProjectAsCompleted(projectId: string) {
    return await projectDatabase.markAsCompleted(projectId);
  },

  /**
   * Updates commit processing status
   */
  async updateCommitStatus(
    projectId: string,
    commitData: {
      commitHash: string;
      commitMessage: string;
      commitAuthorName: string;
      commitAuthorAvatar: string;
      commitDate: string;
    },
    summary: string,
    processingStatus: CommitProcessingStatus
  ) {
    return await commitDatabase.upsertCommit(projectId, {
      ...commitData,
      summary,
      processingStatus
    });
  },

  /**
   * Marks commit as processing
   */
  async markCommitAsProcessing(
    projectId: string,
    commitData: {
      commitHash: string;
      commitMessage: string;
      commitAuthorName: string;
      commitAuthorAvatar: string;
      commitDate: string;
    }
  ) {
    return await commitDatabase.markAsProcessing(projectId, commitData);
  },

  /**
   * Updates meeting status
   */
  async updateMeetingStatus(
    meetingId: string,
    status: MeetingStatus,
    name?: string
  ) {
    return await meetingDatabase.updateMeetingStatus(meetingId, status, name);
  },

  /**
   * Creates fallback commit entry for failed processing
   */
  async createFailedCommitEntry(
    projectId: string,
    commitData: {
      commitHash: string;
      commitMessage: string;
      commitAuthorName: string;
      commitAuthorAvatar: string;
      commitDate: string;
    },
    error: string
  ) {
    const summary = `Processing failed: ${error.substring(0, 100)}`;
    
    return await commitDatabase.upsertCommit(projectId, {
      ...commitData,
      summary,
      processingStatus: 'FAILED'
    });
  },

  /**
   * Logs processing progress with emojis
   */
  logProcessingProgress(
    type: 'wave' | 'batch' | 'file',
    current: number,
    total: number,
    identifier: string,
    status: 'processing' | 'completed' | 'failed'
  ) {
    const emoji = status === 'completed' ? '✅' : status === 'failed' ? '❌' : '🔄';
    const typeEmoji = type === 'wave' ? '🌊' : type === 'batch' ? '📦' : '📄';
    
    console.log(
      `${emoji} ${typeEmoji} ${type.charAt(0).toUpperCase() + type.slice(1)} ${current}/${total} - ${identifier} - Status: ${status}`
    );
  }
};