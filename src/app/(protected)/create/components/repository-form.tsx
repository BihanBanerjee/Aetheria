// src/app/(protected)/create/components/repository-form.tsx
'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassmorphicCard, GlassmorphicCardTitle } from '@/components/ui/glassmorphic-card';
import { Github, Info, Layers, CodeIcon, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { UseFormRegister, UseFormHandleSubmit } from 'react-hook-form';

// Type definition for form inputs
type FormInput = {
  repoUrl: string
  projectName: string
  githubToken?: string
}

interface RepositoryFormProps {
  register: UseFormRegister<FormInput>;
  handleSubmit: UseFormHandleSubmit<FormInput>;
  onSubmit: (data: FormInput) => void;
  isLoading: boolean;
}

export const RepositoryForm: React.FC<RepositoryFormProps> = ({ 
  register, 
  handleSubmit, 
  onSubmit,
  isLoading
}) => {
  return (
    <motion.div
      key="step1"
      className='flex flex-col md:flex-row items-stretch gap-8'
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Left side - illustration */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="absolute -inset-10 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <Image 
            src="/undraw_github.svg" 
            alt="GitHub Illustration" 
            width={320} 
            height={320}
            className="filter drop-shadow-xl relative z-10"
          />
          
          {/* Animated highlights */}
          <motion.div 
            className="absolute -top-6 -right-6 h-12 w-12 rounded-full bg-indigo-500/20 z-0"
            animate={{ 
              y: [0, -10, 0], 
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <div className="h-full w-full flex items-center justify-center">
              <Layers className="h-6 w-6 text-indigo-200" />
            </div>
          </motion.div>
          
          <motion.div 
            className="absolute -bottom-4 -left-4 h-10 w-10 rounded-full bg-purple-500/20 z-0"
            animate={{ 
              y: [0, 10, 0], 
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <div className="h-full w-full flex items-center justify-center">
              <CodeIcon className="h-5 w-5 text-purple-200" />
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Right side - form */}
      <div className="flex-1">
        <GlassmorphicCard className="bg-indigo-900/20 border-indigo-500/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-indigo-600/30 shadow-lg shadow-indigo-600/20">
              <Github className="h-6 w-6 text-indigo-200" />
            </div>
            <GlassmorphicCardTitle>
              Link your GitHub Repository
            </GlassmorphicCardTitle>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <label className="block text-white/80 mb-1.5 text-sm font-medium">Project Name</label>
                <Input 
                  {...register('projectName', {required: true})} 
                  placeholder='My Awesome Project' 
                  required
                  className="bg-white/10 border-white/20 text-white h-11 shadow-inner shadow-indigo-500/10 focus:border-indigo-400 transition-all"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <label className="block text-white/80 mb-1.5 text-sm font-medium">GitHub URL</label>
                <Input 
                  {...register('repoUrl', {required: true})} 
                  placeholder='https://github.com/username/repo' 
                  type='url' 
                  required
                  className="bg-white/10 border-white/20 text-white h-11 shadow-inner shadow-indigo-500/10 focus:border-indigo-400 transition-all"
                />
                <p className="mt-1 text-xs text-white/60 flex items-center">
                  <Info className="h-3 w-3 mr-1 inline-block" />
                  Enter the full URL to your GitHub repository
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <label className="block text-white/80 mb-1.5 text-sm font-medium">GitHub Token (Optional)</label>
                <Input 
                  {...register('githubToken')} 
                  placeholder='For private repositories' 
                  className="bg-white/10 border-white/20 text-white h-11 shadow-inner shadow-indigo-500/10 focus:border-indigo-400 transition-all"
                />
                <p className="mt-1.5 text-xs text-white/60 flex items-start">
                  <Info className="h-3 w-3 mr-1 mt-0.5 inline-block shrink-0" />
                  <span>Required for private repositories. Create a token with repo scope in your <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:underline">GitHub settings</a>.</span>
                </p>
              </motion.div>
            </div>
            
            <motion.div
              className="pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Button 
                type='submit' 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 h-11 font-medium shadow-lg shadow-indigo-800/20 hover:translate-y-[-1px] transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Check Credits
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </GlassmorphicCard>
      </div>
    </motion.div>
  );
};