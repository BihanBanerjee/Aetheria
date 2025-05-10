// src/app/(protected)/qa/page.tsx
'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react';
import React, { useState } from 'react'
import AskQuestionCard from '../dashboard/ask-question-card';
import MDEditor from '@uiw/react-md-editor';
import CodeReferences from '../dashboard/code-references';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Code, FileText, ChevronLeft, Clock, X, Save, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card';
import { toast } from 'sonner';
import Image from 'next/image';

// Custom CodeReferenceWrapper component with fixed glassmorphic effect
const CodeReferenceWrapper = ({ filesReferences }) => {
  const [activeFile, setActiveFile] = useState(filesReferences[0]?.fileName || '');
  
  if (filesReferences.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-white/50">No file references available</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* File tabs */}
      <div className="flex items-center overflow-x-auto pb-2 mb-2 custom-scrollbar-x">
        {filesReferences.map((file, index) => (
          <button
            key={file.fileName}
            onClick={() => setActiveFile(file.fileName)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap mr-2 ${
              activeFile === file.fileName 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {file.fileName}
          </button>
        ))}
      </div>
      
      {/* File content */}
      <div className="flex-1 overflow-hidden">
        {filesReferences.map((file) => {
          if (file.fileName !== activeFile) return null;
          
          return (
            <div key={file.fileName} className="h-full flex flex-col">
              <div className="p-2 bg-indigo-800/40 border-b border-indigo-500/20 text-white rounded-t-md flex justify-between items-center">
                <span>{file.fileName}</span>
                <span className="text-xs text-white/60 italic">Referenced by AI</span>
              </div>
              
              <div className="flex-1 overflow-auto bg-gradient-to-br from-indigo-900/40 to-purple-900/30 backdrop-blur-sm rounded-b-md">
                {file.sourceCode ? (
                  <pre className="h-full p-4 text-white/90 overflow-auto custom-scrollbar">
                    <code className="font-mono">{file.sourceCode.replace(/\\n/g, '\n')}</code>
                  </pre>
                ) : (
                  <div className="p-4 text-white/70">
                    No code content available
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// QuestionDetail component for displaying a selected question
const QuestionDetail = ({ question, onClose }) => {
  const [activeTab, setActiveTab] = useState('answer'); // 'answer' or 'code'
  
  // Copy answer to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(question.answer);
    toast.success('Answer copied to clipboard');
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-indigo-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Main content */}
      <motion.div 
        className="bg-transparent w-full max-w-6xl h-[85vh] z-10 flex flex-col rounded-xl overflow-hidden relative glassmorphism border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Top bar with controls */}
        <div className="flex items-center justify-between p-4 border-b border-indigo-500/20 bg-gradient-to-r from-indigo-900/60 to-purple-900/40">
          <div className="flex items-center">
            <button 
              onClick={onClose}
              className="p-2 mr-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-white/70" />
            </button>
            <div className="flex items-center">
              <div className="mr-3">
                <img 
                  src={question.user.imageUrl || ''}
                  alt="User"
                  className="h-8 w-8 rounded-full ring-2 ring-indigo-400/30"
                />
              </div>
              <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 line-clamp-1 mr-4">
                {question.question}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center text-xs text-white/50 mr-2">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(question.createdAt).toLocaleDateString()}
            </div>
            <button 
              onClick={copyToClipboard}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title="Copy answer"
            >
              <Copy className="h-4 w-4 text-white/70" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title="Close"
            >
              <X className="h-4 w-4 text-white/70" />
            </button>
          </div>
        </div>
        
        {/* Content area with tabs */}
        <div className="flex flex-1 overflow-hidden">
          {/* Tab navigation */}
          <div className="w-16 shrink-0 bg-gradient-to-b from-indigo-900/40 to-purple-900/30 border-r border-indigo-500/20 flex flex-col items-center pt-4">
            <button
              onClick={() => setActiveTab('answer')}
              className={`p-3 rounded-lg mb-2 w-12 flex flex-col items-center justify-center ${activeTab === 'answer' ? 'bg-indigo-600/70 text-white' : 'text-white/50 hover:bg-white/10'}`}
              title="Answer"
            >
              <FileText className="h-5 w-5 mb-1" />
              <span className="text-xs">Answer</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`p-3 rounded-lg mb-2 w-12 flex flex-col items-center justify-center ${activeTab === 'code' ? 'bg-indigo-600/70 text-white' : 'text-white/50 hover:bg-white/10'}`}
              title="Code"
            >
              <Code className="h-5 w-5 mb-1" />
              <span className="text-xs">Code</span>
            </button>
          </div>
          
          {/* Content area */}
          <div className="flex-1 overflow-hidden flex flex-col relative bg-gradient-to-br from-indigo-900/20 to-purple-900/10">
            {/* Answer tab */}
            <div 
              className={`absolute inset-0 transition-all duration-300 p-6 ${
                activeTab === 'answer' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="flex items-start mb-4">
                <div className="bg-indigo-600/30 p-2 rounded-full mr-3">
                  <FileText className="h-5 w-5 text-indigo-200" />
                </div>
                <h3 className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">AI Answer</h3>
              </div>
              <div className="h-[calc(100%-3rem)] overflow-auto pr-2 custom-scrollbar">
                <MDEditor.Markdown 
                  source={question.answer} 
                  className='w-full overflow-auto custom-markdown' 
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                    color: 'white',
                    borderRadius: '0.5rem',
                    padding: '1.5rem'
                  }} 
                />
              </div>
            </div>
            
            {/* Code tab - using the custom wrapper instead of CodeReferences component */}
            <div 
              className={`absolute inset-0 transition-all duration-300 p-6 ${
                activeTab === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="flex items-start mb-4">
                <div className="bg-indigo-600/30 p-2 rounded-full mr-3">
                  <Code className="h-5 w-5 text-indigo-200" />
                </div>
                <h3 className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">Referenced Files</h3>
              </div>
              <div className="h-[calc(100%-3rem)] glassmorphism border border-indigo-500/20 rounded-xl p-4 bg-indigo-950/30 shadow-inner">
                <CodeReferenceWrapper filesReferences={question.filesReferences ?? []} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const QAPage = () => {
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

  // Add a loader component
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
          <motion.div 
            key={question.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => openQuestion(index)}
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
        ))}
      </div>
      
      {/* Question detail modal */}
      <AnimatePresence>
        {selectedQuestion && (
          <QuestionDetail 
            question={selectedQuestion} 
            onClose={closeQuestion} 
          />
        )}
      </AnimatePresence>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
        
        .custom-scrollbar-x::-webkit-scrollbar {
          height: 6px;
        }
        
        .custom-scrollbar-x::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        
        .custom-scrollbar-x::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar-x::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
      `}</style>
    </>
  )
}

export default QAPage