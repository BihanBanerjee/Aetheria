// src/lib/inngest/steps/meeting/transcription.ts
import { checkTranscriptionStatus, retrieveTranscriptionResults, submitMeetingForProcessing } from "@/lib/assembly";
import { BATCH_PROCESSING_CONFIG } from "../../utils/constants";
import type { TranscriptionJob, TranscriptionStatus, MeetingSummary } from "../../types";

export const transcriptionSteps = {
  /**
   * Submits meeting for transcription processing
   */
  async submitTranscriptionJob(meetingUrl: string): Promise<TranscriptionJob> {
    console.log(`Submitting transcription job for meeting URL: ${meetingUrl}`);
    
    try {
      const job = await submitMeetingForProcessing(meetingUrl);
      console.log(`✅ Transcription job submitted with ID: ${job.transcriptId}`);
      return job;
    } catch (error) {
      console.error(`❌ Failed to submit transcription job:`, error);
      throw new Error(`Transcription submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Polls transcription status until completion
   */
  async pollTranscriptionStatus(transcriptId: string): Promise<TranscriptionStatus> {
    const { maxPolls } = BATCH_PROCESSING_CONFIG;
    let pollAttempts = 0;
    let transcriptionStatus: TranscriptionStatus;

    do {
      pollAttempts++;
      
      console.log(`Polling transcription status (attempt ${pollAttempts}/${maxPolls})`);
      transcriptionStatus = await checkTranscriptionStatus(transcriptId);
      
      console.log(`Poll ${pollAttempts}: Status = ${transcriptionStatus.status}`);

      // Check for failure
      if (transcriptionStatus.status === 'error') {
        throw new Error(`Transcription failed: ${transcriptionStatus.error}`);
      }

      // Check for timeout
      if (pollAttempts >= maxPolls && transcriptionStatus.status !== 'completed') {
        throw new Error(`Transcription timeout after ${maxPolls} polling attempts`);
      }

    } while (transcriptionStatus.status !== 'completed');

    return transcriptionStatus;
  },

  /**
   * Retrieves transcription results
   */
  async retrieveTranscriptionResults(transcriptId: string): Promise<MeetingSummary[]> {
    console.log(`Retrieving transcription results for transcript: ${transcriptId}`);
    
    try {
      const result = await retrieveTranscriptionResults(transcriptId);
      
      if (!result.summaries || result.summaries.length === 0) {
        throw new Error('No summaries generated from transcription');
      }
      
      console.log(`✅ Successfully retrieved ${result.summaries.length} discussion points`);
      return result.summaries;
    } catch (error) {
      console.error(`❌ Error retrieving transcription results:`, error);
      
      // Create fallback summary
      const fallbackSummary: MeetingSummary = {
        start: "00:00",
        end: "00:00",
        gist: "Meeting Processing Failed",
        headline: "Unable to process audio",
        summary: `Meeting audio could not be processed due to: ${error instanceof Error ? error.message : 'Unknown error'}. Please try re-uploading the meeting or contact support if the issue persists.`
      };
      
      return [fallbackSummary];
    }
  },

  /**
   * Processes complete transcription workflow
   */
  async processTranscriptionWorkflow(
    meetingUrl: string,
    onStatusUpdate?: (status: string, attempt?: number) => void
  ): Promise<MeetingSummary[]> {
    // Step 1: Submit transcription job
    const job = await this.submitTranscriptionJob(meetingUrl);
    onStatusUpdate?.('submitted');

    // Step 2: Poll for completion
    let pollAttempts = 0;
    const { maxPolls, pollIntervalSeconds } = BATCH_PROCESSING_CONFIG;
    
    let transcriptionStatus: TranscriptionStatus;
    do {
      pollAttempts++;
      onStatusUpdate?.('polling', pollAttempts);
      
      transcriptionStatus = await checkTranscriptionStatus(job.transcriptId);
      
      if (transcriptionStatus.status === 'error') {
        throw new Error(`Transcription failed: ${transcriptionStatus.error}`);
      }

      if (pollAttempts >= maxPolls && transcriptionStatus.status !== 'completed') {
        throw new Error(`Transcription timeout after ${maxPolls} polling attempts`);
      }

      // Wait before next poll (except for last iteration)
      if (transcriptionStatus.status !== 'completed') {
        await new Promise(resolve => setTimeout(resolve, pollIntervalSeconds * 1000));
      }

    } while (transcriptionStatus.status !== 'completed');

    onStatusUpdate?.('completed');

    // Step 3: Retrieve results
    return await this.retrieveTranscriptionResults(job.transcriptId);
  },

  /**
   * Creates delay for polling
   */
  createPollingDelay(seconds: number): string {
    return `${seconds}s`;
  }
};