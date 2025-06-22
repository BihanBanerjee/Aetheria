// Update src/app/(protected)/create/components/success-confirmation.tsx

'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card';
import { CheckCircle, ArrowRight, Clock } from 'lucide-react';

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
        
        <div className="mb-6">
          <p className="text-white/80 mb-4">
            Your project has been created and is now being processed in the background.
          </p>
          
          <div className="glassmorphism border border-white/20 p-4 rounded-lg bg-blue-900/20 mb-4">
            <div className="flex items-center gap-2 text-blue-200 mb-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">What&apos;s happening now:</span>
            </div>
            <ul className="text-sm text-white/70 space-y-1 text-left">
              <li>• Indexing your repository files with AI</li>
              <li>• Analyzing commit history</li>
              <li>• Creating vector embeddings for search</li>
              <li>• Setting up Q&A capabilities</li>
            </ul>
          </div>
          
          <p className="text-sm text-white/60">
            You can monitor the progress in the dashboard. We&apos;ll notify you when everything is ready!
          </p>
        </div>
        
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
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </GlassmorphicCard>
    </motion.div>
  );
};