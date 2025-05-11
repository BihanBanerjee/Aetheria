// app/(protected)/qa/components/question-detail/tab-content.tsx
'use client'

import React from 'react';
import { FileText, Code } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import CodeReferenceWrapper from '../code-reference/code-reference-wrapper';
import { cleanSourceCode } from '../code-reference/language-utils';

// Types
interface Question {
  answer: string;
  filesReferences?: {
    fileName: string;
    sourceCode: string;
  }[];
}

interface AnswerTabContentProps {
  question: Question;
}

export const AnswerTabContent: React.FC<AnswerTabContentProps> = ({ question }) => {
  return (
    <div className="absolute inset-0 transition-all duration-300 p-6 opacity-100 z-10">
      <div className="flex items-start mb-4">
        <div className="bg-indigo-600/30 p-2 rounded-full mr-3">
          <FileText className="h-5 w-5 text-indigo-200" />
        </div>
        <h3 className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
          AI Answer
        </h3>
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
  );
};

interface CodeTabContentProps {
  question: Question;
  codeWrapperRef: React.RefObject<{ activeFileIndex: number }>;
}

export const CodeTabContent: React.FC<CodeTabContentProps> = ({ question, codeWrapperRef }) => {
  return (
    <div className="absolute inset-0 transition-all duration-300 p-6 opacity-100 z-10">
      <div className="flex items-start mb-4">
        <div className="bg-indigo-600/30 p-2 rounded-full mr-3">
          <Code className="h-5 w-5 text-indigo-200" />
        </div>
        <h3 className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
          Referenced Files
        </h3>
      </div>
      <div className="h-[calc(100%-3rem)] glassmorphism border border-indigo-500/20 rounded-xl p-4 bg-indigo-950/30 shadow-inner">
        <CodeReferenceWrapper 
          ref={codeWrapperRef}
          filesReferences={question.filesReferences ?? []} 
        />
      </div>
    </div>
  );
};

export const getActiveTabContent = (
  activeTab: string,
  question: Question,
  codeWrapperRef: React.RefObject<{ activeFileIndex: number }>
): JSX.Element => {
  if (activeTab === 'answer') {
    return <AnswerTabContent question={question} />;
  } else {
    return <CodeTabContent question={question} codeWrapperRef={codeWrapperRef} />;
  }
};

// Helper function to get content for clipboard based on active tab
export const getClipboardContent = (
  activeTab: string, 
  question: Question, 
  codeWrapperRef: { activeFileIndex: number }
): { content: string; filename?: string } => {
  if (activeTab === 'answer') {
    return { content: question.answer };
  } else if (activeTab === 'code' && question.filesReferences?.length > 0) {
    const activeFileIndex = codeWrapperRef.activeFileIndex;
    const activeFile = question.filesReferences[activeFileIndex];
    
    if (activeFile) {
      return { 
        content: cleanSourceCode(activeFile.sourceCode),
        filename: activeFile.fileName
      };
    }
  }
  
  return { content: '' };
};