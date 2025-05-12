// src/app/(protected)/create/components/page-header.tsx
'use client';
import { motion } from 'framer-motion';

export const PageHeader = () => {
  return (
    <motion.div 
      className="mb-8 text-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 mb-2">
        Create a New Project
      </h1>
      <p className="text-white/70 max-w-2xl mx-auto">
        Link your GitHub repository to Aetheria and let our AI analyze your codebase to provide intelligent assistance.
      </p>
    </motion.div>
  );
};