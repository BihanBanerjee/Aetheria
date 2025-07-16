// src/lib/inngest/steps/common/validation.ts
import { meetingDatabase } from "../../utils/database";
import type { MeetingProcessingEventData } from "../../types";

export const validationSteps = {
  /**
   * Validates meeting access and processing status
   */
  async validateMeetingAccess(data: MeetingProcessingEventData) {
    const { meetingId, userId } = data;
    
    const meeting = await meetingDatabase.findMeetingWithAuth(meetingId, userId);

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
  },

  /**
   * Validates project exists and has required data
   */
  async validateProject(projectId: string) {
    // Add project validation logic here if needed
    // For now, this is a placeholder for future validation needs
    return { isValid: true };
  },

  /**
   * Validates user credits and permissions
   */
  async validateUserCredits(userId: string, requiredCredits: number) {
    // Add user credit validation logic here if needed
    // For now, this is a placeholder for future validation needs
    return { hasEnoughCredits: true };
  },

  /**
   * Validates GitHub URL format
   */
  validateGithubUrl(url: string): boolean {
    const githubUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/;
    return githubUrlPattern.test(url);
  },

  /**
   * Validates meeting URL format
   */
  validateMeetingUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }
};