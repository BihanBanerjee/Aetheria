// src/app/api/process-meeting/route.ts
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { inngest } from "@/lib/inngest/client";

const bodyParser = z.object({
    meetingUrl: z.string(),
    projectId: z.string(),
    meetingId: z.string()
})

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if(!userId) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }
    
    try {
        const body = await req.json();
        const { meetingUrl, projectId, meetingId } = bodyParser.parse(body);
        
        // Verify the meeting exists and belongs to the user
        const meeting = await db.meeting.findFirst({
            where: {
                id: meetingId,
                project: {
                    userToProjects: {
                        some: {
                            userId: userId
                        }
                    }
                }
            }
        });

        if (!meeting) {
            return NextResponse.json({error: 'Meeting not found or unauthorized'}, {status: 404});
        }

        // Trigger the background processing with Inngest
        await inngest.send({
            name: "meeting.processing.requested",
            data: {
                meetingUrl,
                meetingId,
                projectId
            }
        });

        console.log(`Meeting processing job queued for meeting ${meetingId}`);
        
        return NextResponse.json({
            success: true, 
            message: 'Meeting processing started',
            meetingId
        }, {status: 200});

    } catch(error) {
        console.error('Error queuing meeting processing:', error);
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}