// Update src/app/(protected)/dashboard/page.tsx

'use client'
import useProject from '@/hooks/use-project';
import { ExternalLink, Github, GitCommit } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import CommitLog from './commit-log';
import AskQuestionCard from './ask-question-card';
import MeetingCard from './meeting-card';
import ArchiveButton from './archive-button';
import TeamMembers from './team-members';
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card';
import dynamic from 'next/dynamic';
import ProjectQueue from './project-queue'; // Add this import
import { api } from '@/trpc/react';

const InviteButton = dynamic(() => import('./invite-button'), {
  ssr: false
})

const DashboardPage = () => {
    const { project, projectId } = useProject();
    const { data: commits } = api.project.getCommits.useQuery({ projectId });
    
    // Show commit processing message only if project is completed but no commits exist yet
    const showCommitProcessingMessage = project?.status === 'COMPLETED' && (!commits || commits.length === 0);
    
  return (
    <div className="text-white">
      {/* Add the Project Queue at the top */}
      <ProjectQueue />
      
      {/* Commit Processing Status Message */}
      {showCommitProcessingMessage && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <GitCommit className="h-5 w-5 animate-pulse text-blue-300" />
            <div>
              <span className="text-blue-200 font-medium">
                🎉 Project ready to use!
              </span>
              <p className="text-blue-200/80 text-sm mt-1">
                Files have been indexed and you can start asking questions. Commit analysis is running in the background.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className='flex items-center justify-between flex-wrap gap-y-4'>
        <GlassmorphicCard className='w-fit px-4 py-3 bg-indigo-900/40'>
          <div className="flex items-center">
            <Github className='size-5 text-white' />
            <div className="ml-2">
              <p className='text-sm font-sm text-white'>
                This project is linked to {' '}
                <Link href={project?.githubUrl ?? ""} className='inline-flex items-center text-blue-200 hover:underline'>
                {project?.githubUrl}
                <ExternalLink className='ml-1 size-4' />
                </Link>
              </p>
            </div>
          </div>
        </GlassmorphicCard>
        
        <div className='flex items-center gap-4'>
          <TeamMembers />
          <InviteButton />
          <ArchiveButton /> 
        </div>
      </div>

      <div className="mt-6">
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-5'>
          <AskQuestionCard />
          <MeetingCard />
        </div>
      </div>

      <div className="mt-10"></div>
      <h2 className="text-2xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">Recent Commits</h2>
      <CommitLog />
    </div>
  )
}

export default DashboardPage