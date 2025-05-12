// src/app/(protected)/meetings/[meetingId]/issues-list.tsx
'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api, type RouterOutputs } from '@/trpc/react'
import { Clock, CornerDownRight, VideoIcon } from 'lucide-react'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassmorphicCard, GlassmorphicCardContent, GlassmorphicCardHeader, GlassmorphicCardTitle } from '@/components/ui/glassmorphic-card'
import MeetingDetailsLoader from '../meeting-details-loader'

type Props = {
    meetingId: string
}

const IssuesList = ({ meetingId }: Props) => {
    const {data: meeting, isLoading} = api.project.getMeetingById.useQuery({
        meetingId
    }, {
        refetchInterval: 4000
    })
    
    if(isLoading || !meeting) {
        return <MeetingDetailsLoader />;
    }
    
    return (
        <div className='p-8 text-white'>
            <div className='max-w-5xl mx-auto'>
                <div className='glassmorphism border border-white/20 p-6 rounded-xl mb-10'>
                    <div className='flex items-center gap-6'>
                        <div className='flex rounded-full border border-indigo-400/30 bg-indigo-900/30 p-4'>
                            <VideoIcon className='h-8 w-8 text-indigo-200' />
                        </div>
                        <div>
                            <h1 className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100'>
                                {meeting.name}
                            </h1>
                            <div className='flex items-center gap-4 mt-1 text-white/60'>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {meeting.createdAt.toLocaleDateString()}
                                </div>
                                <div>{meeting.issues.length} discussion points</div>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mb-6 text-white">Discussion Points</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meeting.issues.map((issue, index) => (
                        <motion.div
                            key={issue.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <IssueCard issue={issue} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function IssueCard({ issue }: { issue: NonNullable<RouterOutputs["project"]["getMeetingById"]>["issues"][number]}) {
    const [open, setOpen] = useState(false)
    
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="glassmorphism border border-white/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                            {issue.gist}
                        </DialogTitle>
                        <DialogDescription className="text-white/70">
                            {issue.headline}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>{issue.start} - {issue.end}</span>
                    </div>
                    
                    <div className="glassmorphism border border-white/20 p-4 mt-2 bg-indigo-900/20">
                        <p className="italic text-white leading-relaxed">
                            "{issue.summary}"
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
            
            <GlassmorphicCard className="h-full flex flex-col hover:bg-indigo-900/10 transition-colors cursor-pointer" onClick={() => setOpen(true)}>
                <GlassmorphicCardHeader>
                    <GlassmorphicCardTitle className="line-clamp-1">
                        {issue.gist}
                    </GlassmorphicCardTitle>
                </GlassmorphicCardHeader>
                <GlassmorphicCardContent className="flex-1">
                    <p className="text-white/80 line-clamp-2 mb-4">
                        {issue.headline}
                    </p>
                    <div className="mt-auto">
                        <Button 
                            onClick={(e) => { 
                                e.stopPropagation();
                                setOpen(true);
                            }}
                            className="w-full bg-indigo-600/50 hover:bg-indigo-600/70"
                        >
                            <CornerDownRight className="h-4 w-4 mr-1" />
                            View Details
                        </Button>
                    </div>
                </GlassmorphicCardContent>
            </GlassmorphicCard>
        </>
    )
}

export default IssuesList