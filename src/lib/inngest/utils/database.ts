// src/lib/inngest/utils/database.ts
import { db } from "@/server/db";
import type { CommitProcessingStatus } from "@prisma/client";
import type { ProjectStatus, MeetingStatus } from "../types";

export const projectDatabase = {
  async updateStatus(projectId: string, status: ProjectStatus) {
    return await db.project.update({
      where: { id: projectId },
      data: { status }
    });
  },

  async updateProgress(projectId: string, data: {
    status?: ProjectStatus;
    totalFiles?: number;
    processedFiles?: number;
  }) {
    return await db.project.update({
      where: { id: projectId },
      data
    });
  },

  async getProject(projectId: string) {
    return await db.project.findUnique({
      where: { id: projectId },
      select: { githubUrl: true }
    });
  },

  async markAsFailed(projectId: string) {
    return await db.project.update({
      where: { id: projectId },
      data: { status: 'FAILED' }
    });
  },

  async markAsCompleted(projectId: string) {
    return await db.project.update({
      where: { id: projectId },
      data: { status: 'COMPLETED' }
    });
  }
};

export const commitDatabase = {
  async findProcessedCommits(projectId: string) {
    return await db.commit.findMany({
      where: { projectId },
      select: { commitHash: true }
    });
  },

  async upsertCommit(projectId: string, commitData: {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
    summary: string;
    processingStatus: CommitProcessingStatus;
  }) {
    return await db.commit.upsert({
      where: {
        projectId_commitHash: {
          projectId,
          commitHash: commitData.commitHash
        }
      },
      update: {
        summary: commitData.summary,
        processingStatus: commitData.processingStatus,
        updatedAt: new Date()
      },
      create: {
        projectId,
        ...commitData
      }
    });
  },

  async markAsProcessing(projectId: string, commitData: {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
  }) {
    return await db.commit.upsert({
      where: {
        projectId_commitHash: {
          projectId,
          commitHash: commitData.commitHash
        }
      },
      update: {
        processingStatus: 'PROCESSING'
      },
      create: {
        projectId,
        commitHash: commitData.commitHash,
        commitMessage: commitData.commitMessage,
        commitAuthorName: commitData.commitAuthorName,
        commitAuthorAvatar: commitData.commitAuthorAvatar,
        commitDate: commitData.commitDate,
        summary: "Processing in progress...",
        processingStatus: 'PROCESSING'
      }
    });
  }
};

export const sourceCodeDatabase = {
  async createEmbedding(data: {
    summary: string;
    sourceCode: string;
    fileName: string;
    projectId: string;
  }) {
    return await db.sourceCodeEmbedding.create({
      data
    });
  },

  async updateEmbedding(id: string, embedding: number[]) {
    return await db.$executeRaw`
      UPDATE "SourceCodeEmbedding"
      SET "summaryEmbedding" = ${embedding}::vector
      WHERE "id" = ${id}
    `;
  }
};

export const userDatabase = {
  async deductCredits(userId: string, fileCount: number) {
    return await db.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: fileCount
        }
      }
    });
  }
};

export const meetingDatabase = {
  async findMeetingWithAuth(meetingId: string, userId: string) {
    return await db.meeting.findUnique({
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
  },

  async updateMeetingStatus(meetingId: string, status: MeetingStatus, name?: string) {
    return await db.meeting.update({
      where: { id: meetingId },
      data: { 
        status,
        ...(name && { name })
      }
    });
  },

  async createMeetingIssues(meetingId: string, issuesData: Array<{
    start: string;
    end: string;
    gist: string;
    headline: string;
    summary: string;
  }>) {
    return await db.issue.createMany({
      data: issuesData.map(issue => ({
        ...issue,
        meetingId
      }))
    });
  },

  async findExistingIssues(meetingId: string) {
    return await db.issue.findMany({
      where: { meetingId }
    });
  }
};