// app/(protected)/qa/components/code-reference/code-reference-wrapper.tsx
'use client'

import React, { useState, useMemo } from 'react';
import { getLanguageFromFileName, cleanSourceCode } from '@/utils/code/language-utils';
import { SyntaxHighlighter, customCodeStyle } from '@/utils/code/syntax-highlight-config';

// Types
interface FileReference {
  fileName: string;
  sourceCode: string;
}

interface CodeReferenceWrapperProps {
  filesReferences: FileReference[];
}

// Component to render code content with proper memoization
interface CodeContentProps {
  sourceCode: string;
  language: string;
  isLargeFile: boolean;
  fileName: string;
}

const CodeContent: React.FC<CodeContentProps> = ({ sourceCode, language, isLargeFile, fileName }) => {
  // Clean the code - moved outside of the mapping function
  const cleanedCode = useMemo(() => cleanSourceCode(sourceCode), [sourceCode]);
  
  return (
    <SyntaxHighlighter 
      language={language}
      style={customCodeStyle}
      showLineNumbers={true}
      wrapLines={!isLargeFile}
      customStyle={{
        margin: 0,
        padding: '1rem',
        borderRadius: '0 0 0.375rem 0.375rem',
        fontSize: '0.9rem',
        lineHeight: '1.5',
        height: '100%',
        maxHeight: 'none',
        overflow: 'auto',
        background: 'rgba(30, 41, 59, 0.7)',
      }}
    >
      {cleanedCode}
    </SyntaxHighlighter>
  );
};

// Enhanced CodeReferenceWrapper component with syntax highlighting
const CodeReferenceWrapper = React.forwardRef<{ activeFileIndex: number }, CodeReferenceWrapperProps>((props, ref) => {
  // Store the active file both as the fileName and the index
  const [activeFile, setActiveFile] = useState(props.filesReferences[0]?.fileName || '');
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  
  // Update both the active file name and index when changing tabs
  const handleFileChange = (fileName: string, index: number) => {
    setActiveFile(fileName);
    setActiveFileIndex(index);
  };
  
  // Expose the active file index to the parent via ref
  React.useImperativeHandle(ref, () => ({
    activeFileIndex
  }));
  
  if (props.filesReferences.length === 0) {
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
        {props.filesReferences.map((file, index) => (
          <button
            key={file.fileName}
            onClick={() => handleFileChange(file.fileName, index)}
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
        {props.filesReferences.map((file) => {
          if (file.fileName !== activeFile) return null;
          
          const language = getLanguageFromFileName(file.fileName);
          
          // Check file size and apply optimization for large files
          const isLargeFile = file.sourceCode && file.sourceCode.length > 10000;
          
          return (
            <div key={file.fileName} className="h-full flex flex-col">
              <div className="p-2 bg-indigo-800/40 border-b border-indigo-500/20 text-white rounded-t-md flex justify-between items-center">
                <span>{file.fileName}</span>
                <span className="text-xs text-white/60 italic">Referenced by AI</span>
              </div>
              
              <div className="flex-1 overflow-auto bg-gradient-to-br from-indigo-900/40 to-purple-900/30 backdrop-blur-sm rounded-b-md">
                {file.sourceCode ? (
                  <CodeContent 
                    sourceCode={file.sourceCode}
                    language={language}
                    isLargeFile={isLargeFile}
                    fileName={file.fileName}
                  />
                
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
});

// Add display name for the forwardRef component
CodeReferenceWrapper.displayName = 'CodeReferenceWrapper';

export default CodeReferenceWrapper;