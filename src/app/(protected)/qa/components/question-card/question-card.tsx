// app/(protected)/qa/components/question-card/question-card.tsx
'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card';

// Types
interface User {
  imageUrl: string;
  firstName?: string;
}

interface Question {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  user: User;
  filesReferences?: {
    fileName: string;
    sourceCode: string;
  }[];
}

interface QuestionCardProps {
  question: Question;
  index: number;
  onClick: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, onClick }) => {
  return (
    <motion.div 
      key={question.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <GlassmorphicCard className='border border-white/20 hover:border-indigo-400/30 hover:bg-white/5 transition-all hover:translate-y-[-2px] hover:shadow-lg'>
        <div className='p-4'>
          <div className='flex justify-between items-start mb-3'>
            <div className='flex items-center'>
              <div className='flex-shrink-0 mr-3'>
                <img 
                  src={question.user.imageUrl || ''}
                  alt={question.user.firstName || 'User'}
                  className='rounded-full h-10 w-10 ring-2 ring-indigo-400/30 object-cover'
                />
              </div>
              <div>
                <h3 className='text-lg font-medium line-clamp-1 text-white'>
                  {question.question}
                </h3>
              </div>
            </div>
            <span className='text-xs text-white/50 whitespace-nowrap flex items-center'>
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(question.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className='bg-white/5 rounded-md p-3 h-24 overflow-hidden relative'>
            <p className='text-white/70 text-sm line-clamp-4'>
              {question.answer}
            </p>
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-indigo-900/40 to-transparent"></div>
          </div>
          
          <div className='flex justify-between items-center mt-3 text-sm'>
            <span className='text-white/50'>
              {question.filesReferences?.length || 0} file references
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/20 bg-white/10 text-white hover:bg-indigo-600/50"
            >
              View Details
            </Button>
          </div>
        </div>
      </GlassmorphicCard>
    </motion.div>
  );
};

export default QuestionCard;