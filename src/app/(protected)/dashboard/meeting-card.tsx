// src/app/(protected)/dashboard/meeting-card.tsx
'use client'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css';
import { useDropzone } from 'react-dropzone'
import React from 'react'
import { uploadFile } from '@/lib/firebase'
import { Presentation, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useProject from '@/hooks/use-project'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { api } from '@/trpc/react'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { motion } from 'framer-motion'

const MeetingCard = () => {
    const { project } = useProject();
    const processMeeting = useMutation({mutationFn: async (data: {meetingUrl: string, meetingId: string, projectId: string}) => {
        const { meetingUrl, meetingId, projectId } = data
        const response = await axios.post('/api/process-meeting', { meetingUrl, meetingId, projectId })
        return response.data
    }})
    const [isUploading, setIsUploading] = React.useState(false)
    const [progress, setProgress] = React.useState(0)
    const router = useRouter()
    const uploadMeeting = api.project.uploadMeeting.useMutation()
    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'audio/*': ['.mp3', '.wav', '.m4a'],
        },
        multiple: false,
        maxSize: 50_000_000,
        onDrop: async (acceptedFiles) => {
            if(!project) return
            setIsUploading(true)
            console.log(acceptedFiles)
            const file = acceptedFiles[0]
            if(!file) return
            const downloadUrl = await uploadFile(file as File, setProgress) as string
            uploadMeeting.mutate({ 
                projectId: project.id, 
                meetingUrl: downloadUrl, 
                name: file.name
            }, {
                onSuccess: (meeting) => {
                    toast.success('Meeting uploaded successfully')
                    router.push('/meetings')
                    processMeeting.mutateAsync({meetingUrl: downloadUrl, meetingId: meeting.id, projectId: project.id})
                },
                onError: () => {
                    toast.error('Failed to upload meeting')
                }
            })
            window.alert(downloadUrl)
            setIsUploading(false)
        }
    }) 
    
    return (
        <GlassmorphicCard 
            className='col-span-2 flex flex-col items-center justify-center p-8 cursor-pointer border-dashed border-2 hover:border-indigo-400/50 transition-colors'
            {...getRootProps()}
        >
            {!isUploading && (
                <motion.div 
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="p-3 rounded-full bg-indigo-600/20 mb-3">
                        <Presentation className='h-8 w-8 text-indigo-200 animate-pulse' />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Create a new meeting 
                    </h3>
                    <p className='text-center text-white/70 mb-4'>
                        Analyze your meeting with Aetheria
                        <br />
                        Powered by AI.
                    </p>
                    <Button 
                        disabled={isUploading}
                        className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900"
                    >
                        <Upload className='-ml-0.5 mr-1.5 h-5 w-5' aria-hidden='true'/>
                        Upload Meeting
                        <input className='hidden' {...getInputProps()} />
                    </Button>
                </motion.div>
            )}
            {isUploading && (
                <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="relative" style={{ width: 100, height: 100 }}>
                        {/* Add a glowing background for the progress circle */}
                        <div 
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(79,70,229,0.1) 50%, rgba(0,0,0,0) 70%)",
                                filter: "blur(5px)",
                            }}
                        />
                        
                        {/* Add a border around the progress to make it stand out */}
                        <div className="absolute inset-[-4px] rounded-full border-2 border-indigo-500/30" />
                        
                        {/* Enhanced CircularProgressbar - strokeWidth is a direct prop, not part of buildStyles */}
                        <CircularProgressbar 
                            value={progress} 
                            text={`${progress}%`} 
                            strokeWidth={8}
                            styles={buildStyles({
                                // Make the path color more vibrant
                                pathColor: '#818cf8',
                                
                                // Make the trail more visible with higher opacity
                                trailColor: 'rgba(255, 255, 255, 0.3)',
                                
                                // Add depth to the percentage number
                                textColor: '#ffffff',
                                
                                // Smooth transitions
                                pathTransitionDuration: 0.5,
                            })}
                        />
                        
                        {/* Add an animated glow effect for visual engagement */}
                        {progress > 0 && (
                            <motion.div 
                                className="absolute inset-[-10px] rounded-full border-2 border-indigo-500/20"
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        )}
                    </div>
                    <p className='text-sm text-white/80 text-center mt-4 font-medium'>
                        Uploading your meeting...
                    </p>
                </motion.div>
            )}
        </GlassmorphicCard>
    )
}

export default MeetingCard