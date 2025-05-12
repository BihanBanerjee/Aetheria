// src/app/(protected)/meetings/meeting-details-loader.tsx
'use client'

import { motion } from 'framer-motion';
import { VideoIcon, Presentation, ListFilter, Loader2 } from 'lucide-react';

const MeetingDetailsLoader = () => {
  return (
    <div className="h-96 flex items-center justify-center">
      <motion.div 
        className="glassmorphism border border-white/20 p-8 rounded-xl bg-indigo-900/20 max-w-md w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center">
          {/* Animated icon group */}
          <div className="relative mb-6">
            {/* Main presentation icon */}
            <div className="relative z-20 flex items-center justify-center">
              <Presentation 
                className="h-14 w-14 text-indigo-200" 
                style={{ filter: "drop-shadow(0 0 8px rgba(167, 139, 250, 0.7))" }}
              />
              
              {/* Secondary icons */}
              <motion.div
                className="absolute"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <motion.div 
                  className="absolute -top-10 -left-10"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <VideoIcon className="h-6 w-6 text-indigo-300/60" />
                </motion.div>
                <motion.div 
                  className="absolute -bottom-10 -right-10"
                  animate={{ opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <ListFilter className="h-6 w-6 text-purple-300/60" />
                </motion.div>
              </motion.div>
            </div>
            
            {/* Animated rings */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <motion.div 
                className="absolute h-20 w-20 rounded-full border border-indigo-400/30"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute h-24 w-24 rounded-full border border-indigo-400/20"
                animate={{ scale: [1, 1.6, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              />
              <motion.div 
                className="absolute h-28 w-28 rounded-full border border-indigo-400/10"
                animate={{ scale: [1, 1.7, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 mb-3">
            Loading Meeting Details
          </h3>
          
          {/* Progress bar */}
          <div className="w-full max-w-xs mb-4">
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <p className="text-white/70 mb-4">
              Processing discussion points and generating insights...
            </p>
            
            {/* Loading indicator */}
            <div className="flex items-center gap-2 text-indigo-200">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="animate-pulse text-sm">Analyzing content</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MeetingDetailsLoader;