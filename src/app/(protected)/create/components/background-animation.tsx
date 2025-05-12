// src/app/(protected)/create/components/background-animation.tsx
'use client';
import { motion } from 'framer-motion';

export const BackgroundAnimation = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div 
        className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </div>
  );
};