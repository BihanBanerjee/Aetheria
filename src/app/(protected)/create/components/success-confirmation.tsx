// src/app/(protected)/create/components/success-confirmation.tsx
'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card';
import { CheckCircle } from 'lucide-react';

interface SuccessConfirmationProps {
  onCreateAnother: () => void;
}

export const SuccessConfirmation: React.FC<SuccessConfirmationProps> = ({ onCreateAnother }) => {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto text-center"
    >
      <GlassmorphicCard className="bg-indigo-900/20 border-indigo-500/30 p-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2
          }}
          className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center mb-6"
        >
          <CheckCircle className="h-10 w-10 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 mb-4">
          Project Created Successfully!
        </h2>
        
        <p className="text-white/80 mb-8">
          Your project has been created and is being indexed. You can now start exploring and asking questions about your codebase.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={onCreateAnother}
            variant="outline" 
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            Create Another
          </Button>
          
          <Button 
            onClick={() => {
              window.location.href = '/dashboard';
            }}
            className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 shadow-lg shadow-indigo-800/20"
          >
            Go to Dashboard
          </Button>
        </div>
      </GlassmorphicCard>
    </motion.div>
  );
};