// src/components/code/code-content.tsx
'use client'

import React, { useMemo } from 'react';
import { SyntaxHighlighter, customCodeStyle } from '@/utils/code/syntax-highlight-config';
import { cleanSourceCode } from '@/utils/code/language-utils';

// Component to render code content with proper memoization
interface CodeContentProps {
  sourceCode: string;
  language: string;
  isLargeFile?: boolean;
  fileName?: string;
  showLineNumbers?: boolean;
  customStyle?: React.CSSProperties;
}

const CodeContent: React.FC<CodeContentProps> = ({ 
  sourceCode, 
  language, 
  isLargeFile = false,
  showLineNumbers = true,
  customStyle = {}
}) => {
  // Clean the code - moved outside of the mapping function
  const cleanedCode = useMemo(() => cleanSourceCode(sourceCode), [sourceCode]);
  
  return (
    <SyntaxHighlighter 
      language={language}
      style={customCodeStyle}
      showLineNumbers={showLineNumbers}
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
        ...customStyle
      }}
    >
      {cleanedCode}
    </SyntaxHighlighter>
  );
};

export default CodeContent;