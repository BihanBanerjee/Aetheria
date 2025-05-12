// app/(protected)/qa/components/code-reference/syntax-highlight-config.tsx
'use client'

// Import required components for syntax highlighting
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/cjs/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/dist/cjs/languages/hljs/typescript';
import python from 'react-syntax-highlighter/dist/cjs/languages/hljs/python';
import bash from 'react-syntax-highlighter/dist/cjs/languages/hljs/bash';
import css from 'react-syntax-highlighter/dist/cjs/languages/hljs/css';
import html from 'react-syntax-highlighter/dist/cjs/languages/hljs/xml';
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json';
import docker from 'react-syntax-highlighter/dist/cjs/languages/hljs/dockerfile';
import yaml from 'react-syntax-highlighter/dist/cjs/languages/hljs/yaml';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/hljs/markdown';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

// Register languages
SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', html);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('docker', docker);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('markdown', markdown);

// Custom styling for syntax highlighting to match the theme
export const customCodeStyle = {
  ...atomOneDark,
  hljs: {
    ...atomOneDark.hljs,
    background: 'transparent', // Transparent background
  },
  'hljs-keyword': {
    ...atomOneDark['hljs-keyword'],
    color: '#a78bfa', // Purple
  },
  'hljs-built_in': {
    ...atomOneDark['hljs-built_in'],
    color: '#a78bfa', // Purple
  },
  'hljs-title': {
    ...atomOneDark['hljs-title'],
    color: '#60a5fa', // Blue
  },
  'hljs-function': {
    ...atomOneDark['hljs-function'],
    color: '#60a5fa', // Blue
  },
  'hljs-string': {
    ...atomOneDark['hljs-string'],
    color: '#34d399', // Green
  },
  'hljs-number': {
    ...atomOneDark['hljs-number'],
    color: '#f9a8d4', // Pink
  },
};

export { SyntaxHighlighter };