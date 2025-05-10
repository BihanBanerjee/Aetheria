// src/app/(protected)/dashboard/page.tsx
'use client'
import useProject from '@/hooks/use-project';
import { ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import CommitLog from './commit-log';
import AskQuestionCard from './ask-question-card';
import MeetingCard from './meeting-card';
import ArchiveButton from './archive-button';
import InviteButton from './invite-button';
import TeamMembers from './team-members';
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card';

const DashboardPage = () => {
    const { project } = useProject();
  return (
    <div className="text-white">
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