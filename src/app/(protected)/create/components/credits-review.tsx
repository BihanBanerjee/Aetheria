// src/app/(protected)/create/components/credits-review.tsx
'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GlassmorphicCard, GlassmorphicCardTitle } from '@/components/ui/glassmorphic-card';
import { CheckCircle, AlertCircle, Github, Layers, Loader2 } from 'lucide-react';

interface CreditsData {
  fileCount: number;
  userCredits: number;
}

interface CreditsReviewProps {
  projectName: string;
  repoUrl: string;
  githubToken?: string;
  creditsData: CreditsData;
  hasEnoughCredits: boolean;
  isCreating: boolean;
  onBack: () => void;
  onCreateProject: () => void;
}

export const CreditsReview: React.FC<CreditsReviewProps> = ({
  projectName,
  repoUrl,
  creditsData,
  hasEnoughCredits,
  isCreating,
  onBack,
  onCreateProject
}) => {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      <GlassmorphicCard className="bg-indigo-900/20 border-indigo-500/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-indigo-600/30 shadow-lg shadow-indigo-600/20">
            <Layers className="h-6 w-6 text-indigo-200" />
          </div>
          <GlassmorphicCardTitle>
            Repository Analysis
          </GlassmorphicCardTitle>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center">
              <Github className="h-5 w-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">{projectName}</h3>
              <p className="text-white/70 text-sm">{repoUrl}</p>
            </div>
          </div>
          
          <div className="glassmorphism border border-white/20 p-5 rounded-xl bg-indigo-900/30">
            <h3 className="text-lg font-medium mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Repository Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-white/70">Total Files</span>
                <span className="font-semibold text-white">{creditsData?.fileCount}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-white/70">Credits Required</span>
                <span className="font-semibold text-white">{creditsData?.fileCount}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white/70">Credits Available</span>
                <span className="font-semibold text-white">{creditsData?.userCredits}</span>
              </div>
            </div>
          </div>
          
          <div className={`glassmorphism border p-4 rounded-xl ${hasEnoughCredits ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10'}`}>
            {hasEnoughCredits ? (
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">
                    You have enough credits to create this project
                  </p>
                  <p className="text-white/70 text-sm mt-1">
                    {creditsData?.userCredits - creditsData?.fileCount} credits will remain after creation
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">
                    Not enough credits
                  </p>
                  <p className="text-white/70 text-sm mt-1">
                    You need {creditsData?.fileCount - creditsData?.userCredits} more credits to create this project
                  </p>
                  <Button 
                    className="mt-3 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 shadow-lg shadow-indigo-800/20 text-sm"
                    size="sm"
                    onClick={() => window.location.href = '/billing'}
                  >
                    Purchase Credits
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-4 pt-2">
            <Button 
              onClick={onBack}
              variant="outline" 
              className="flex-1 border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              Back
            </Button>
            
            <Button 
              onClick={onCreateProject}
              disabled={!hasEnoughCredits || isCreating}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 shadow-lg shadow-indigo-800/20"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </div>
      </GlassmorphicCard>
    </motion.div>
  );
};