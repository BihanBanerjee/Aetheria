// app/(protected)/qa/page.tsx
'use client'

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Code } from 'lucide-react';
import useProject from '@/hooks/use-project';
import { api } from '@/trpc/react';

// Import components
import AskQuestionCard from '../dashboard/ask-question-card';
import QuestionCard from './components/question-card/question-card';
import QuestionDetail from './components/question-detail/question-detail';
import ScrollbarStyles from './components/scrollbar-styles';

const QAPage: React.FC = () => {
  const { projectId } = useProject();
  const { data: questions, isLoading } = api.project.getQuestions.useQuery({ projectId });
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

  // Handle opening a question
  const openQuestion = (index: number) => {
    setSelectedQuestionIndex(index);
  };

  // Handle closing the detail view
  const closeQuestion = () => {
    setSelectedQuestionIndex(null);
  };

  // Selected question
  const selectedQuestion = selectedQuestionIndex !== null ? questions?.[selectedQuestionIndex] : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center">
        <div className="glassmorphism border border-white/20 p-8 rounded-xl flex flex-col items-center">
          <div className="relative h-16 w-16 mb-4">
            <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
            <div className="absolute inset-1 rounded-full border-b-2 border-l-2 border-purple-400 animate-spin animate-delay-150"></div>
            <div className="absolute inset-2 rounded-full border-t-2 border-r-2 border-blue-400 animate-spin animate-delay-300 animate-reverse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-indigo-600/30 animate-pulse"></div>
            </div>
          </div>
          <p className="text-white/80 text-lg mt-2 animate-pulse">Loading your questions...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AskQuestionCard />
      
      <div className='h-6'></div>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100'>
          Saved Questions
        </h1>
        {questions && questions.length > 0 && (
          <div className="text-white/60 text-sm">
            {questions.length} {questions.length === 1 ? 'question' : 'questions'} saved
          </div>
        )}
      </div>
      
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {questions?.length === 0 && (
          <div className="glassmorphism border border-white/20 p-8 text-center text-white/70 rounded-xl col-span-2">
            <Code className="h-12 w-12 mx-auto mb-3 text-white/40" />
            <p className="text-lg">No saved questions yet. Ask something about your codebase!</p>
          </div>
        )}
        
        {questions?.map((question, index) => (
          <QuestionCard 
            key={question.id}
            question={question as any}
            index={index}
            onClick={() => openQuestion(index)}
          />
        ))}
      </div>
      
      {/* Question detail modal */}
      <AnimatePresence>
        {selectedQuestion && (
          <QuestionDetail 
            question={selectedQuestion as any} 
            onClose={closeQuestion} 
          />
        )}
      </AnimatePresence>

      {/* Custom scrollbar styles */}
      <ScrollbarStyles />
    </>
  );
};

export default QAPage;