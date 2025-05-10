// src/app/(protected)/qa/page.tsx
'use client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react';
import React from 'react'
import AskQuestionCard from '../dashboard/ask-question-card';
import MDEditor from '@uiw/react-md-editor';
import CodeReferences from '../dashboard/code-references';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

const QAPage = () => {
  const { projectId } = useProject();
  const { data: questions } = api.project.getQuestions.useQuery({ projectId })

  const [questionIndex, setQuestionIndex] = React.useState(0)
  const question = questions?.[questionIndex]

  return (
    <Sheet>
      <AskQuestionCard />
      
      <div className='h-6'></div>
      <h1 className='text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100'>
        Saved Questions
      </h1>
      
      <div className='flex flex-col gap-3'>
        {questions?.length === 0 && (
          <div className="glassmorphism border border-white/20 p-8 text-center text-white/70 rounded-xl">
            No saved questions yet. Ask something about your codebase!
          </div>
        )}
        
        {questions?.map((question, index) => (
          <motion.div 
            key={question.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <SheetTrigger className="w-full" onClick={() => setQuestionIndex(index)}>
              <div className='flex items-center gap-4 glassmorphism border border-white/20 rounded-xl p-4 text-left hover:bg-white/5 transition-colors'>
                <img 
                  className='rounded-full h-10 w-10 ring-2 ring-indigo-400/30' 
                  height={40} 
                  width={40} 
                  src={question.user.imageUrl ?? ""} 
                  alt="User avatar"
                />

                <div className='flex-1 flex flex-col'>
                  <div className='flex justify-between items-center gap-2'>
                    <p className='text-white text-lg font-medium truncate max-w-lg'>
                      {question.question}
                    </p>
                    <span className='text-xs text-white/50 whitespace-nowrap flex items-center'>
                      <Calendar className="h-3 w-3 mr-1" />
                      {question.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className='text-white/70 truncate text-sm max-w-2xl'>
                    {question.answer}
                  </p>
                </div>
              </div>
            </SheetTrigger>
          </motion.div>
        ))}
      </div>

      {question && (
        <SheetContent className='sm:max-w-[80vw] glassmorphism border-l border-white/20'>
          <SheetHeader>
            <SheetTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              {question.question}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <MDEditor.Markdown 
              source={question.answer} 
              className='w-full overflow-auto' 
              style={{ 
                maxHeight: '40vh', 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                color: 'white',
                borderRadius: '0.5rem',
                padding: '1rem'
              }} 
            />
          </div>
          <div className="mt-6">
            <CodeReferences filesReferences={question.filesReferences ?? [] as any} />
          </div>
        </SheetContent>
      )}
    </Sheet>
  )
}

export default QAPage