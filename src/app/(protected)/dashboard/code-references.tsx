'use client';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import React from 'react';

// Importing a different syntax highlighter that might work better
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
import { tomorrowNightBlue } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

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

type Props = {
    filesReferences: {fileName: string; sourceCode: string; summary: string}[]
}

// Helper to determine language from filename
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
    
    // Debug logging
    console.log("Number of files:", filesReferences.length);
    
    return (
        <div className='w-full'>
            <h3 className="text-lg font-medium mb-2">Referenced Files</h3>
            
            <Tabs value={tab} onValueChange={setTab}>
                <div className='overflow-x-auto flex gap-2 bg-gray-200 p-1 rounded-md'>
                    {filesReferences.map((file) => (
                        <button 
                            onClick={() => setTab(file.fileName)} 
                            key={file.fileName} 
                            className={cn('px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap text-muted-foreground hover:bg-muted', 
                            {
                                'bg-primary text-primary-foreground': tab === file.fileName,
                            })}
                        >
                            {file.fileName}
                        </button>
                    ))}
                </div>
                
                {filesReferences.map(file => (
                    <TabsContent 
                        key={file.fileName} 
                        value={file.fileName} 
                        className='w-full mt-2 border rounded-md'
                    >
                        <div className="p-2 bg-gray-800 text-white rounded-t-md">
                            {file.fileName}
                        </div>
                        
                        <div className="max-h-[40vh] overflow-auto">
                            {/* Fallback rendering if syntax highlighter fails */}
                            {file.sourceCode ? (
                                <SyntaxHighlighter 
                                    language={getLanguageFromFileName(file.fileName)}
                                    style={tomorrowNightBlue}
                                    showLineNumbers={true}
                                    customStyle={{
                                        margin: 0,
                                        padding: '1rem',
                                        borderRadius: '0 0 0.375rem 0.375rem',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.5',
                                        whiteSpace: 'pre-wrap',
                                    }}
                                >
                                    {file.sourceCode.replace(/\\n/g, '\n')}
                                </SyntaxHighlighter>
                            ) : (
                                <div className="p-4 bg-gray-100 rounded-b-md">
                                    No code content available
                                </div>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default CodeReferences;