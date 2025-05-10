// src/app/(protected)/create/page.tsx
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useRefetch from '@/hooks/use-refetch';
import { api } from '@/trpc/react';
import { AlertCircle, Github, Info } from 'lucide-react';
import React from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { GlassmorphicCard, GlassmorphicCardTitle } from '@/components/ui/glassmorphic-card';
import Image from 'next/image';

type FormInput = {
    repoUrl: string
    projectName: string
    githubToken?: string
}

const CreatePage = () => {
    const {register, handleSubmit, reset} = useForm<FormInput>()
    const createProject = api.project.createProject.useMutation()
    const checkCredits = api.project.checkCredits.useMutation()
    const refetch = useRefetch();
    
    function onSubmit(data: FormInput) {
        if(!!checkCredits.data) {
            createProject.mutate({
                name: data.projectName,
                githubUrl: data.repoUrl,
                githubToken: data.githubToken
            }, {
                onSuccess: () => {
                    toast.success('Project created successfully')
                    refetch()
                    reset()
                },
                onError: () => {
                    toast.error('Failed to create project')
                }
            })
        } else {
            checkCredits.mutate({
                githubUrl: data.repoUrl,
                githubToken: data.githubToken
            })   
        }
    }

    const hasEnoughCredits = checkCredits?.data?.userCredits 
        ? checkCredits?.data?.fileCount <= checkCredits?.data?.userCredits 
        : true

    return (
        <div className='h-full flex items-center justify-center py-12 text-white'>
            <motion.div
                className='flex flex-col md:flex-row items-center gap-12 max-w-4xl'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex-1 flex justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Image 
                            src="/undraw_github.svg" 
                            alt="GitHub Illustration" 
                            width={300} 
                            height={300}
                            className="filter drop-shadow-xl"
                        />
                    </motion.div>
                </div>
                
                <div className="flex-1">
                    <GlassmorphicCard className="bg-indigo-900/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-full bg-indigo-600/20">
                                <Github className="h-6 w-6 text-indigo-200" />
                            </div>
                            <GlassmorphicCardTitle>
                                Link your GitHub Repository
                            </GlassmorphicCardTitle>
                        </div>
                        
                        <p className='text-white/70 mb-6'>
                            Enter the URL of your repository to link it to Aetheria.
                            Our AI will analyze the codebase to provide intelligent assistance.
                        </p>
                        
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-white/80 mb-1 text-sm">Project Name</label>
                                <Input 
                                    {...register('projectName', {required: true})} 
                                    placeholder='My Awesome Project' 
                                    required
                                    className="bg-white/10 border-white/20 text-white"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-white/80 mb-1 text-sm">GitHub URL</label>
                                <Input 
                                    {...register('repoUrl', {required: true})} 
                                    placeholder='https://github.com/username/repo' 
                                    type='url' 
                                    required
                                    className="bg-white/10 border-white/20 text-white"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-white/80 mb-1 text-sm">GitHub Token (Optional)</label>
                                <Input 
                                    {...register('githubToken')} 
                                    placeholder='For private repositories' 
                                    className="bg-white/10 border-white/20 text-white"
                                />
                                <p className="mt-1 text-xs text-white/60">
                                    Required for private repositories. Create a token with repo scope.
                                </p>
                            </div>
                            
                            {!!checkCredits.data && (
                                <div className='glassmorphism border border-white/20 p-4 rounded-xl bg-purple-900/20 mt-4'>
                                    <div className='flex items-center gap-2'>
                                        <Info className='size-4 text-indigo-200' />
                                        <p className='text-white text-sm'>
                                            You will be charged <strong>{checkCredits.data?.fileCount}</strong> credits for this repository.
                                        </p>
                                    </div>
                                    <p className='text-indigo-200 ml-6 text-sm mt-1'>
                                        You have <strong>{checkCredits.data?.userCredits}</strong> credits remaining.
                                    </p>
                                    
                                    {!hasEnoughCredits && (
                                        <div className="mt-3 flex items-center gap-2 text-red-300 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            <p>You don't have enough credits. Please purchase more.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="pt-4">
                                <Button 
                                    type='submit' 
                                    disabled={createProject.isPending || checkCredits.isPending || !hasEnoughCredits}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900"
                                >
                                    {!!checkCredits.data ? 'Create Project' : 'Check Credits'}
                                </Button>
                            </div>
                        </form>
                    </GlassmorphicCard>
                </div>
            </motion.div>
        </div>
    )
}

export default CreatePage