// src/app/(protected)/meetings/page.tsx
'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'
import MeetingCard from '../dashboard/meeting-card'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'
import { Calendar, Clock, Eye, Trash2, VideoIcon } from 'lucide-react'
import { GlassmorphicCard, GlassmorphicCardTitle } from '@/components/ui/glassmorphic-card'
import { motion } from 'framer-motion'
import MeetingLoader from './meeting-loader'

const MeetingsPage = () => {
    const { projectId } = useProject()
    const { data: meetings, isLoading } = api.project.getMeetings.useQuery({ projectId }, {
        refetchInterval: 3000 // Poll every 3 seconds for real-time updates
    })
    const deleteMeeting = api.project.deleteMeeting.useMutation()
    const refetch = useRefetch()
    
    return (
        <div className="text-white">
            <MeetingCard />
            <div className="h-10"></div>
            <h1 className='text-2xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100'>
                Your Meetings
            </h1>
            
            {isLoading && <MeetingLoader />}
            
            {meetings && meetings.length === 0 && !isLoading && (
                <GlassmorphicCard className="p-8 text-center">
                    <VideoIcon className="h-12 w-12 mx-auto mb-3 text-white/40" />
                    <p>No meetings found. Upload one to get started!</p>
                </GlassmorphicCard>
            )}
            
            {meetings && meetings.length > 0 && (
                <div className="space-y-4">
                    {meetings.map((meeting, index) => (
                        <motion.div
                            key={meeting.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <GlassmorphicCard className="hover:bg-white/5 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-full bg-indigo-600/20">
                                                <VideoIcon className='h-5 w-5 text-indigo-200' />
                                            </div>
                                            <GlassmorphicCardTitle className="text-xl">
                                                {meeting.name}
                                            </GlassmorphicCardTitle>
                                            {meeting.status === 'PROCESSING' && (
                                                <div className="relative inline-flex">
                                                    {/* Outer glow effect */}
                                                    <span className="absolute -inset-0.5 rounded-full bg-amber-400/20 blur-sm"></span>
                                                    
                                                    {/* Pulsing ring for extra visibility */}
                                                    <span className="absolute -inset-1 rounded-full bg-amber-400/10 animate-ping opacity-75"></span>
                                                    
                                                    {/* Main badge with gradient background */}
                                                    <Badge className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium px-3 py-1 border border-amber-400/50 shadow-md">
                                                        <div className="flex items-center gap-1.5">
                                                            {/* Animated dot indicator */}
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                                            </span>
                                                            Processing
                                                        </div>
                                                    </Badge>
                                                </div>
                                            )}
                                            {meeting.status === 'COMPLETED' && meeting.issues.length === 0 && (
                                                <Badge className="bg-red-500/20 text-red-200 border-red-500/30">
                                                    Processing Failed
                                                </Badge>
                                            )}
                                        </div>
                                        <div className='flex items-center gap-4 text-sm text-white/60'>
                                            <div className='flex items-center'>
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {meeting.createdAt.toLocaleDateString()}
                                            </div>
                                            <div className='flex items-center'>
                                                <Clock className="h-4 w-4 mr-1" />
                                                {meeting.createdAt.toLocaleTimeString()}
                                            </div>
                                            <div>
                                                {meeting.status === 'PROCESSING' 
                                                    ? 'Processing in progress...' 
                                                    : `${meeting.issues.length} issues identified`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        {meeting.status === 'COMPLETED' && meeting.issues.length > 0 && (
                                            <Link href={`/meetings/${meeting.id}`}>
                                                <Button 
                                                    size='sm' 
                                                    variant='outline'
                                                    className="border-white/20 bg-white/10 text-white"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View Details
                                                </Button>
                                            </Link>
                                        )}
                                        
                                        {meeting.status === 'PROCESSING' && (
                                            <Button 
                                                size='sm' 
                                                variant='outline'
                                                disabled
                                                className="border-amber-400/20 bg-amber-400/10 text-amber-200 cursor-not-allowed"
                                            >
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-200 mr-1"></div>
                                                Processing...
                                            </Button>
                                        )}
                                        
                                        <Button 
                                            disabled={deleteMeeting.isPending} 
                                            size='sm' 
                                            variant='destructive'
                                            className="bg-red-600/30 text-white hover:bg-red-600/50"
                                            onClick={() => deleteMeeting.mutate({ meetingId: meeting.id }, {
                                                onSuccess: () => {
                                                    toast.success('Meeting deleted successfully')
                                                    refetch()
                                                }
                                            })}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </GlassmorphicCard>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MeetingsPage