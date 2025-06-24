import { AssemblyAI } from "assemblyai"

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY!
})

function msToTime(ms: number) {
    const seconds = ms / 1000
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// export const processMeeting = async (meetingUrl: string) => {
//     const transcript = await client.transcripts.transcribe({
//         audio: meetingUrl,
//         auto_chapters: true,
//     })

//     const summaries = transcript.chapters?.map(chapter => ({
//         start: msToTime(chapter.start),
//         end: msToTime(chapter.end),
//         gist: chapter.gist,
//         headline: chapter.headline,
//         summary: chapter.summary
//     })) || []

//     if(!transcript.text) throw new Error("No transcript found")

//     return { 
//         // transcript, 
//         summaries
//     }
// }

// const FILE_URL = 'https://assembly.ai/sports_injuries.mp3'

// const response = await processMeeting(FILE_URL)
// console.log(response);

// Step 1: Submit the transcription job (fast operation)
export const submitMeetingForProcessing = async (meetingUrl: string) => {
    try {
        const transcript = await client.transcripts.submit({
            audio: meetingUrl,
            auto_chapters: true,
        });

        console.log(`Submitted transcription job with ID: ${transcript.id}`);
        return {
            transcriptId: transcript.id,
            status: transcript.status
        };
    } catch (error) {
        console.error('Error submitting transcription:', error);
        throw new Error(`Failed to submit transcription: ${error.message}`);
    }
}

// Step 2: Check transcription status (fast operation)
export const checkTranscriptionStatus = async (transcriptId: string) => {
    try {
        const transcript = await client.transcripts.get(transcriptId);
        
        console.log(`Transcription ${transcriptId} status: ${transcript.status}`);
        
        return {
            id: transcript.id,
            status: transcript.status,
            error: transcript.error
        };
    } catch (error) {
        console.error('Error checking transcription status:', error);
        throw new Error(`Failed to check status: ${error.message}`);
    }
}

// Step 3: Retrieve completed transcription results (fast operation)
export const retrieveTranscriptionResults = async (transcriptId: string) => {
    try {
        const transcript = await client.transcripts.get(transcriptId);
        
        if (transcript.status !== 'completed') {
            throw new Error(`Transcription not completed. Status: ${transcript.status}`);
        }

        if (!transcript.text) {
            throw new Error("No transcript text found");
        }

        const summaries = transcript.chapters?.map(chapter => ({
            start: msToTime(chapter.start),
            end: msToTime(chapter.end),
            gist: chapter.gist,
            headline: chapter.headline,
            summary: chapter.summary
        })) || [];

        return { summaries };
    } catch (error) {
        console.error('Error retrieving transcription results:', error);
        throw new Error(`Failed to retrieve results: ${error.message}`);
    }
}