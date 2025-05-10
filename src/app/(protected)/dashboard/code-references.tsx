// src/app/(protected)/dashboard/code-references.tsx
'use client';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import React from 'react';
import { motion } from 'framer-motion';

// Keep your existing syntax highlighter imports and setup
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

// Register languages (keep your existing registrations)
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

type Props = {
    filesReferences: {fileName: string; sourceCode: string; summary: string}[]
}

// Keep your existing helper function
const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Simple mapping for common file types
    switch (extension) {
        case 'js':
            return 'javascript';
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'py':
            return 'python';
        case 'sh':
            return 'bash';
        case 'css':
            return 'css';
        case 'html':
            return 'html';
        case 'json':
            return 'json';
        case 'yml':
        case 'yaml':
            return 'yaml';
        case 'md':
            return 'markdown';
        default:
            return 'typescript'; // Default fallback
    }
};

const CodeReferences = ({ filesReferences }: Props) => {
    const [tab, setTab] = React.useState(filesReferences[0]?.fileName || '');
    
    if (filesReferences.length === 0) {
        return null;
    }
    
    return (
        <motion.div 
            className='w-full glassmorphism border border-white/20 p-4'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h3 className="text-lg font-medium mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                Referenced Files
            </h3>
            
            <Tabs value={tab} onValueChange={setTab}>
                <div className='overflow-x-auto flex gap-2 bg-white/5 p-2 rounded-md backdrop-blur-sm'>
                    {filesReferences.map((file, index) => (
                        <motion.button 
                            onClick={() => setTab(file.fileName)} 
                            key={file.fileName} 
                            className={cn('px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap', 
                            {
                                'bg-indigo-600 text-white': tab === file.fileName,
                                'text-white/70 hover:text-white hover:bg-white/10': tab !== file.fileName
                            })}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                            {file.fileName}
                        </motion.button>
                    ))}
                </div>
                
                {filesReferences.map(file => (
                    <TabsContent 
                        key={file.fileName} 
                        value={file.fileName} 
                        className='w-full mt-2 border border-white/10 rounded-md overflow-hidden'
                    >
                        <div className="p-2 bg-black/30 text-white backdrop-blur-sm rounded-t-md flex justify-between items-center">
                            <span>{file.fileName}</span>
                            <span className="text-xs text-white/60 italic">Referenced by AI</span>
                        </div>
                        
                        <div className="max-h-[40vh] overflow-auto">
                            {file.sourceCode ? (
                                <SyntaxHighlighter 
                                    language={getLanguageFromFileName(file.fileName)}
                                    style={atomOneDark}
                                    showLineNumbers={true}
                                    customStyle={{
                                        margin: 0,
                                        padding: '1rem',
                                        borderRadius: '0 0 0.375rem 0.375rem',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.5',
                                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    }}
                                >
                                    {file.sourceCode.replace(/\\n/g, '\n')}
                                </SyntaxHighlighter>
                            ) : (
                                <div className="p-4 bg-black/20 rounded-b-md text-white/70">
                                    No code content available
                                </div>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </motion.div>
    );
};

export default CodeReferences;