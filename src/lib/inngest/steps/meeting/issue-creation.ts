// src/lib/inngest/steps/meeting/issue-creation.ts
import { meetingDatabase } from "../../utils/database";
import type { MeetingSummary } from "../../types";

export const issueCreationSteps = {
  /**
   * Checks if issues already exist for a meeting
   */
  async checkExistingIssues(meetingId: string) {
    const existingIssues = await meetingDatabase.findExistingIssues(meetingId);
    
    if (existingIssues.length > 0) {
      console.log(`Issues already exist for meeting ${meetingId}, skipping creation`);
      return { 
        hasExistingIssues: true, 
        existingCount: existingIssues.length 
      };
    }
    
    return { hasExistingIssues: false, existingCount: 0 };
  },

  /**
   * Creates issues from meeting summaries
   */
  async createIssuesFromSummaries(
    meetingId: string,
    summaries: MeetingSummary[]
  ) {
    console.log(`Creating ${summaries.length} issues for meeting ${meetingId}`);
    
    try {
      // Check if issues already exist
      const existingCheck = await this.checkExistingIssues(meetingId);
      
      if (existingCheck.hasExistingIssues) {
        return {
          success: true,
          created: 0,
          skipped: existingCheck.existingCount,
          message: "Issues already exist"
        };
      }

      // Create issues from summaries
      await meetingDatabase.createMeetingIssues(meetingId, summaries);
      
      console.log(`✅ Successfully created ${summaries.length} issues for meeting ${meetingId}`);
      
      return {
        success: true,
        created: summaries.length,
        skipped: 0,
        message: "Issues created successfully"
      };
    } catch (error) {
      console.error(`❌ Error creating issues for meeting ${meetingId}:`, error);
      throw new Error(`Failed to create issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Validates meeting summaries before creating issues
   */
  validateSummaries(summaries: MeetingSummary[]): {
    isValid: boolean;
    errors: string[];
    validSummaries: MeetingSummary[];
  } {
    const errors: string[] = [];
    const validSummaries: MeetingSummary[] = [];

    for (let i = 0; i < summaries.length; i++) {
      const summary = summaries[i];
      
      // Skip if summary is undefined
      if (!summary) {
        errors.push(`Summary ${i + 1}: Missing summary data`);
        continue;
      }
      
      // Validate required fields
      if (!summary.headline || summary.headline.trim() === '') {
        errors.push(`Summary ${i + 1}: Missing headline`);
        continue;
      }
      
      if (!summary.summary || summary.summary.trim() === '') {
        errors.push(`Summary ${i + 1}: Missing summary content`);
        continue;
      }
      
      if (!summary.gist || summary.gist.trim() === '') {
        errors.push(`Summary ${i + 1}: Missing gist`);
        continue;
      }

      // Validate time format (basic check)
      if (!this.isValidTimeFormat(summary.start)) {
        errors.push(`Summary ${i + 1}: Invalid start time format`);
        continue;
      }
      
      if (!this.isValidTimeFormat(summary.end)) {
        errors.push(`Summary ${i + 1}: Invalid end time format`);
        continue;
      }

      validSummaries.push(summary);
    }

    return {
      isValid: errors.length === 0,
      errors,
      validSummaries
    };
  },

  /**
   * Validates time format (MM:SS or HH:MM:SS)
   */
  isValidTimeFormat(timeStr: string): boolean {
    const timePattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
    return timePattern.test(timeStr);
  },

  /**
   * Extracts meeting name from summaries
   */
  extractMeetingName(summaries: MeetingSummary[]): string {
    if (summaries.length === 0) {
      return 'Untitled Meeting';
    }

    // Use the first summary's headline as the meeting name
    const firstSummary = summaries[0];
    if (!firstSummary || !firstSummary.headline) {
      return 'Untitled Meeting';
    }
    
    const firstHeadline = firstSummary.headline;
    
    // If it's a fallback error message, create a more user-friendly name
    if (firstHeadline === 'Unable to process audio' || firstHeadline === 'Meeting Processing Failed') {
      return 'Meeting Processing Failed';
    }

    // Truncate long headlines
    if (firstHeadline.length > 50) {
      return firstHeadline.substring(0, 47) + '...';
    }

    return firstHeadline;
  },

  /**
   * Logs issue creation statistics
   */
  logIssueCreationStats(
    meetingId: string,
    originalCount: number,
    validCount: number,
    createdCount: number,
    errors: string[]
  ) {
    console.log(`📊 Issue Creation Statistics for meeting ${meetingId}:`);
    console.log(`   Original summaries: ${originalCount}`);
    console.log(`   Valid summaries: ${validCount}`);
    console.log(`   Issues created: ${createdCount}`);
    
    if (errors.length > 0) {
      console.warn(`   Validation errors: ${errors.length}`);
      errors.forEach(error => console.warn(`     - ${error}`));
    }
  }
};