// src/app/(protected)/dashboard/commit-loader.tsx
'use client'

import { motion } from 'framer-motion';
import { GitCommit, Loader2, GitBranch, GitPullRequest } from 'lucide-react';

const CommitLoader = () => {
  return (
    <div className="glassmorphism border border-white/20 rounded-xl p-8 flex flex-col items-center justify-center">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mb-6">
          {/* Main icon with pulse effect */}
          <div className="relative z-10">
            <GitCommit 
              className="h-14 w-14 text-indigo-200" 
              style={{ filter: "drop-shadow(0 0 8px rgba(167, 139, 250, 0.7))" }}
            />
          </div>
          
          {/* Animated orbiting icons */}
          <motion.div
            className="absolute"
            style={{ width: '100%', height: '100%', top: 0, left: 0 }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <motion.div 
              className="absolute -top-10 -left-8"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <GitBranch className="h-6 w-6 text-indigo-300/60" />
            </motion.div>
            <motion.div 
              className="absolute -bottom-8 -right-10"
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <GitPullRequest className="h-6 w-6 text-purple-300/60" />
            </motion.div>
          </motion.div>
          
          {/* Animated rings */}
          <div className="absolute inset-0 -z-10">
            <motion.div 
              className="absolute inset-[-4px] rounded-full border border-indigo-400/30"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute inset-[-8px] rounded-full border border-indigo-400/20"
              animate={{ scale: [1, 1.6, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
            <motion.div 
              className="absolute inset-[-12px] rounded-full border border-indigo-400/10"
              animate={{ scale: [1, 1.7, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 mb-3">
          Loading Commits
        </h3>
        
        {/* Commit history animation */}
        <div className="my-5 flex flex-col items-center">
          <div className="h-24 w-1 bg-white/20 relative mb-1">
            {/* Animated dot moving down the commit history line */}
            <motion.div 
              className="absolute left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-indigo-400"
              initial={{ top: "-5%" }}
              animate={{ top: "105%" }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          <GitCommit className="h-5 w-5 text-indigo-400/80" />
        </div>
        
        <p className="text-white/70 mb-4">
          Fetching commit history...
        </p>
        
        {/* Loading indicator */}
        <div className="flex items-center gap-2 text-indigo-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="animate-pulse text-sm">Analyzing repository</span>
        </div>
      </motion.div>
    </div>
  );
};

export default CommitLoader;