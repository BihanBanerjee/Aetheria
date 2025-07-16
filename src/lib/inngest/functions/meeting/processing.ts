// src/lib/inngest/functions/meeting/processing.ts
import { inngest } from "../../client";
import { 
  FUNCTION_IDS, 
  FUNCTION_NAMES, 
  CONCURRENCY_LIMITS, 
  RETRY_CONFIGS, 
  EVENT_NAMES 
} from "../../utils/constants";
import { validationSteps } from "../../steps/common/validation";
import { statusUpdateSteps } from "../../steps/common/status-updates";
import { transcriptionSteps } from "../../steps/meeting/transcription";
import { issueCreationSteps } from "../../steps/meeting/issue-creation";
import type { MeetingProcessingEventData, MeetingProcessingResult } from "../../types";

export const processMeetingFunction = inngest.createFunction(
  {
    id: FUNCTION_IDS.MEETING_PROCESSING,
    name: FUNCTION_NAMES.MEETING_PROCESSING,
    retries: RETRY_CONFIGS.MEETING_PROCESSING,
    concurrency: {
      limit: CONCURRENCY_LIMITS.MEETING_PROCESSING,
      key: "event.data.userId",
    },
  },
  { event: EVENT_NAMES.MEETING_PROCESSING_REQUESTED },
  async ({ event, step }): Promise<MeetingProcessingResult> => {
    const { meetingUrl, meetingId, projectId, userId }: MeetingProcessingEventData = event.data;

    try {
      console.log(`Starting to process meeting ${meetingId} for user ${userId}`);

      // Step 1: Validate meeting access and status
      const validationResult = await step.run("validate-meeting", async () => {
        return await validationSteps.validateMeetingAccess(event.data);
      });

      if (validationResult.alreadyProcessed) {
        return { 
          success: true, 
          meetingId,
          message: "Meeting already processed" 
        };
      }

      // Step 2: Submit transcription job
      const transcriptionJob = await step.run("submit-transcription", async () => {
        console.log(`Submitting transcription job for meeting ${meetingId}`);
        return await transcriptionSteps.submitTranscriptionJob(meetingUrl);
      });

      // Step 3: Poll for transcription completion
      const transcriptionStatus = await step.run("poll-transcription", async () => {
        return await transcriptionSteps.pollTranscriptionStatus(transcriptionJob.transcriptId);
      });

      // Step 4: Retrieve transcription results
      const meetingData = await step.run("retrieve-transcription-results", async () => {
        console.log(`Retrieving transcription results for meeting ${meetingId}`);
        return await transcriptionSteps.retrieveTranscriptionResults(transcriptionJob.transcriptId);
      });

      // Step 5: Validate and save issues
      const issueResult = await step.run("save-meeting-issues", async () => {
        console.log(`Saving ${meetingData.length} issues to database for meeting ${meetingId}`);
        
        // Validate summaries
        const validation = issueCreationSteps.validateSummaries(meetingData);
        
        if (validation.errors.length > 0) {
          console.warn(`Validation errors for meeting ${meetingId}:`, validation.errors);
        }

        // Log statistics
        issueCreationSteps.logIssueCreationStats(
          meetingId,
          meetingData.length,
          validation.validSummaries.length,
          0, // Will be updated after creation
          validation.errors
        );

        // Create issues from valid summaries
        const creationResult = await issueCreationSteps.createIssuesFromSummaries(
          meetingId,
          validation.validSummaries
        );

        console.log(`Successfully processed ${creationResult.created} issues for meeting ${meetingId}`);
        return creationResult;
      });

      // Step 6: Update meeting status
      await step.run("update-meeting-status", async () => {
        console.log(`Updating meeting ${meetingId} status to COMPLETED`);
        
        const meetingName = issueCreationSteps.extractMeetingName(meetingData);
        
        const updatedMeeting = await statusUpdateSteps.updateMeetingStatus(
          meetingId,
          'COMPLETED',
          meetingName
        );

        console.log(`Meeting ${meetingId} successfully completed with name: ${meetingName}`);
        return updatedMeeting;
      });

      console.log(`Meeting ${meetingId} processing completed successfully`);
      
      return { 
        success: true, 
        meetingId, 
        issuesCreated: issueResult.created,
        meetingName: issueCreationSteps.extractMeetingName(meetingData)
      };

    } catch (error) {
      console.error(`Error processing meeting ${meetingId}:`, error);
      
      // Mark meeting as failed with detailed error info
      await step.run("mark-meeting-failed", async () => {
        try {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return await statusUpdateSteps.updateMeetingStatus(
            meetingId,
            'COMPLETED', // Keep as COMPLETED but with error info
            `Processing Failed: ${errorMessage.substring(0, 50)}...`
          );
        } catch (dbError) {
          console.error(`Failed to update meeting status to failed:`, dbError);
          return null;
        }
      });

      throw error;
    }
  }
);