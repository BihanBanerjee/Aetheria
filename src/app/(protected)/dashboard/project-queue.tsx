// src/app/(protected)/dashboard/project-queue.tsx
'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { api } from '@/trpc/react';
import { GlassmorphicCard, GlassmorphicCardHeader, GlassmorphicCardTitle, GlassmorphicCardContent } from '@/components/ui/glassmorphic-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertCircle, Loader2, FileText, GitCommit, Calculator } from 'lucide-react';

type ProjectStatus = 
  | "INITIALIZING" 
  | "INDEXING_REPO" 
  | "POLLING_COMMITS" 
  | "DEDUCTING_CREDITS" 
  | "COMPLETED" 
  | "FAILED";

const getStatusConfig = (status: ProjectStatus) => {
  switch (status) {
    case 'INITIALIZING':
      return {
        icon: <Clock className="h-4 w-4" />,
        color: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
        label: 'Initializing',
        progress: 10
      };
    case 'INDEXING_REPO':
      return {
        icon: <FileText className="h-4 w-4" />,
        color: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
        label: 'Indexing Repository',
        progress: 40
      };
    case 'POLLING_COMMITS':
      return {
        icon: <GitCommit className="h-4 w-4" />,
        color: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
        label: 'Processing Commits',
        progress: 70
      };
    case 'DEDUCTING_CREDITS':
      return {
        icon: <Calculator className="h-4 w-4" />,
        color: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
        label: 'Finalizing',
        progress: 90
      };
    case 'COMPLETED':
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'bg-green-500/20 text-green-200 border-green-500/30',
        label: 'Completed',
        progress: 100
      };
    case 'FAILED':
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        color: 'bg-red-500/20 text-red-200 border-red-500/30',
        label: 'Failed',
        progress: 0
      };
    default:
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        color: 'bg-gray-500/20 text-gray-200 border-gray-500/30',
        label: 'Processing',
        progress: 50
      };
  }
};

const ProjectQueue: React.FC = () => {
  const { data: projects, isLoading } = api.project.getProjectsWithStatus.useQuery(
    undefined,
    {
      refetchInterval: 2000, // Poll every 2 seconds for real-time updates
    }
  );

  // Filter out completed projects older than 1 hour for a cleaner queue view
  const recentProjects = projects?.filter(project => {
    if (project.status === 'COMPLETED') {
      const completedTime = new Date(project.updatedAt).getTime();
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      return completedTime > oneHourAgo;
    }
    return true;
  }) || [];

  const activeProjects = recentProjects.filter(p => 
    p.status !== 'COMPLETED' && p.status !== 'FAILED'
  );

  if (isLoading) {
    return (
      <GlassmorphicCard className="animate-pulse">
        <GlassmorphicCardHeader>
          <GlassmorphicCardTitle>Loading Queue...</GlassmorphicCardTitle>
        </GlassmorphicCardHeader>
      </GlassmorphicCard>
    );
  }

  if (recentProjects.length === 0) {
    return null; // Don't show queue if empty
  }

  return (
    <GlassmorphicCard className="mb-6">
      <GlassmorphicCardHeader>
        <GlassmorphicCardTitle className="flex items-center gap-2">
          <Loader2 className={`h-5 w-5 ${activeProjects.length > 0 ? 'animate-spin' : ''}`} />
          Processing Queue
          {activeProjects.length > 0 && (
            <Badge className="ml-2 bg-indigo-600/50">
              {activeProjects.length} active
            </Badge>
          )}
        </GlassmorphicCardTitle>
      </GlassmorphicCardHeader>
      <GlassmorphicCardContent>
        <div className="space-y-4">
          {recentProjects.map((project, index) => {
            const statusConfig = getStatusConfig(project.status as ProjectStatus);
            const progressPercentage = project.totalFiles ? 
              Math.min((project.processedFiles || 0) / project.totalFiles * 100, statusConfig.progress) : 
              statusConfig.progress;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="glassmorphism border border-white/10 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {statusConfig.icon}
                      <h3 className="font-medium text-white truncate">
                        {project.name}
                      </h3>
                    </div>
                  </div>
                  <Badge className={`${statusConfig.color} px-2 py-1 text-xs font-medium`}>
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white/70">
                    <span>Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-2 bg-white/10"
                  />
                  
                  {project.totalFiles && (
                    <div className="flex justify-between text-xs text-white/60">
                      <span>Files: {project.processedFiles || 0} / {project.totalFiles}</span>
                      <span>
                        Started {new Date(project.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>

                {project.status === 'FAILED' && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-200 text-sm">
                    Processing failed. Please try creating the project again.
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </GlassmorphicCardContent>
    </GlassmorphicCard>
  );
};

export default ProjectQueue;