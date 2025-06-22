import { z } from "zod";
import { createTRPCRouter, protectedProcedure} from "../trpc";
import { pollCommits } from "@/lib/github";
import { checkCredits } from "@/lib/github-loader";
import { inngest } from "@/lib/inngest/client";

export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure.input(
        z.object({
            name: z.string(),
            githubUrl: z.string(),
            githubToken: z.string().optional(),
        })
    ).mutation(async ({ctx, input}) => {
        const user = await ctx.db.user.findUnique({
            where: {
                id: ctx.user.userId!
            },
            select: {
                credits: true
            }
        });

        if(!user) {
            throw new Error('User not found');
        }

        const currentCredits = user.credits || 0;
        const fileCount = await checkCredits(input.githubUrl, input.githubToken ?? '');
        
        if(currentCredits < fileCount) {
            throw new Error('Insufficient credits');
        }

        // Create project with initial status
        const project = await ctx.db.project.create({
            data: {
                githubUrl: input.githubUrl,
                name: input.name,
                status: 'INITIALIZING',
                totalFiles: fileCount,
                processedFiles: 0,
                processingLogs: {
                    logs: [],
                    startedAt: new Date().toISOString()
                },
                userToProjects: {
                    create: {
                        userId: ctx.user.userId!,
                    }
                }
            }
        });

        // Trigger the background processing with Inngest
        await inngest.send({
            name: "project.creation.requested",
            data: {
                projectId: project.id,
                githubUrl: input.githubUrl,
                githubToken: input.githubToken,
                userId: ctx.user.userId!,
                fileCount
            }
        });

        return project;
    }),

    // Add new endpoint to get project status
    getProjectStatus: protectedProcedure.input(
        z.object({
            projectId: z.string(),
        })
    ).query(async ({ctx, input}) => {
        return await ctx.db.project.findUnique({
            where: {
                id: input.projectId
            },
            select: {
                id: true,
                name: true,
                status: true,
                totalFiles: true,
                processedFiles: true,
                processingLogs: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }),

    // Get all projects with status for queue view
    getProjectsWithStatus: protectedProcedure.query(async ({ctx}) => {
        const projects = await ctx.db.project.findMany({
            where: {
                userToProjects: {
                    some: {
                        userId: ctx.user.userId!
                    }
                },
                deletedAt: null
            },
            select: {
                id: true,
                name: true,
                status: true,
                totalFiles: true,
                processedFiles: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        return projects;
    }),
    getProjects: protectedProcedure.query(async ({ctx}) => {
        const projects = await ctx.db.project.findMany({
            where: {
                userToProjects: {
                    some: {
                        userId: ctx.user.userId!
                    }
                },
                deletedAt: null,
                status: 'COMPLETED' // Only show completed projects in main list
            },
        });
        return projects;
    }),
    getCommits: protectedProcedure.input(
        z.object({
            projectId: z.string(),
        })
    ).query(async ({ctx, input}) => {
        pollCommits(input.projectId).then().catch(console.error)
        const commits = await ctx.db.commit.findMany({
            where: {
                projectId: input.projectId,
            }
        })
        return commits
    }),
    saveAnswer: protectedProcedure.input(
        z.object({
            projectId: z.string(),
            question: z.string(),
            answer: z.string(),
            filesReferences: z.any()
        })
    ).mutation(async ({ctx, input}) => {
        const project = await ctx.db.question.create({
            data: {
                answer: input.answer,
                filesReferences: input.filesReferences,
                question: input.question,
                projectId: input.projectId,
                userId: ctx.user.userId!
            }
        })
        return project
    }),
    getQuestions: protectedProcedure.input(
        z.object({
            projectId: z.string()
        })).query(async({ctx, input}) => {
            return await ctx.db.question.findMany({
                where: {
                    projectId: input.projectId
                },
                include:{
                    user: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
    }),
    uploadMeeting: protectedProcedure.input(z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string()
    }))
    .mutation(async ({ctx, input}) => {
        const meeting = await ctx.db.meeting.create({
            data: {
                meetingUrl: input.meetingUrl,
                projectId: input.projectId,
                name: input.name,
                status: 'PROCESSING'
            }
        })
        return meeting
    }),
    getMeetings: protectedProcedure.input(z.object({projectId: z.string()})).query(async ({ctx, input}) => {
        return await ctx.db.meeting.findMany({
            where: {
                projectId: input.projectId
            },
            include: {
                issues: true
            }
        })
    }),
    deleteMeeting: protectedProcedure.input(z.object({
        meetingId: z.string()
    })).mutation(async ({ctx, input}) => {

        //First delete all associated issues.
        await ctx.db.issue.deleteMany({
            where: {
                meetingId: input.meetingId
            }
        });

        //Then delete the meeting
        return await ctx.db.meeting.delete({
            where: {
                id: input.meetingId
            }
        })
    }),
    getMeetingById: protectedProcedure.input(z.object({
        meetingId: z.string()
    })).query(async ({ctx, input}) => {
        return await ctx.db.meeting.findUnique({
            where: {
                id: input.meetingId
            },
            include: {
                issues: true
            }
        })
    }),
    archiveProject: protectedProcedure.input(z.object({
        projectId: z.string()
    })).mutation(async ({ctx, input}) => {
        return await ctx.db.project.update({
            where: {
                id: input.projectId
            },
            data: {
                deletedAt: new Date()
            }
        })
    }),
    getTeamMembers: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async ({ctx, input}) => {
        return await ctx.db.userToProject.findMany({
            where: {
                projectId: input.projectId
            },
            include: {
                user: true
            }
        })
    }),
    getMyCredits: protectedProcedure.query(async ({ctx}) => {
        return await ctx.db.user.findUnique({
            where: {
                id: ctx.user.userId!
            },
            select: {
                credits: true
            }
        })
    }),
    checkCredits: protectedProcedure.input(z.object({
        githubUrl: z.string(),
        githubToken: z.string().optional()
    })).mutation(async ({ctx, input}) => {
        const fileCount = await checkCredits(input.githubUrl, input.githubToken ?? '')
        const userCredits = await ctx.db.user.findUnique({
            where: {
                id: ctx.user.userId!
            },
            select: {
                credits: true
            }
        })
        return { fileCount, userCredits: userCredits?.credits || 0 }
    })
});