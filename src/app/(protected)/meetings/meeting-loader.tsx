// src/app/(protected)/meetings/meeting-loader.tsx
'use client'

import { motion } from 'framer-motion';
import { VideoIcon, Loader2 } from 'lucide-react';
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card';

const MeetingLoader = () => {
  return (
    <GlassmorphicCard className="p-8 bg-indigo-900/20">
      <motion.div
        className="flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mb-6">
          {/* Main icon with pulse effect */}
          <div className="relative z-10">
            <VideoIcon 
              className="h-16 w-16 text-indigo-200" 
              style={{ filter: "drop-shadow(0 0 8px rgba(167, 139, 250, 0.7))" }}
            />
          </div>
          
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
          Loading Meetings
        </h3>
        
        <p className="text-white/70 mb-6 text-center max-w-md">
          Retrieving your meeting data from the Aetheria platform...
        </p>
        
        {/* Loading indicator */}
        <div className="flex items-center gap-3 text-indigo-200">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="animate-pulse">Processing</span>
        </div>
      </motion.div>
    </GlassmorphicCard>
  );
};

export default MeetingLoader;