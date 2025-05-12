// src/app/(protected)/dashboard/code-references.tsx
'use client';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import React from 'react';
import { motion } from 'framer-motion';
import { getLanguageFromFileName } from '@/utils/code/language-utils';
import CodeContent from '@/components/code/code-content';

type Props = {
    filesReferences: {fileName: string; sourceCode: string; summary: string}[]
    className?: string
}

const CodeReferences = ({ filesReferences, className }: Props) => {
    const [tab, setTab] = React.useState(filesReferences[0]?.fileName || '');
    
    if (filesReferences.length === 0) {
        return null;
    }
    
    return (
        <motion.div 
            className={cn('w-full glassmorphism border border-white/20 p-4 h-full flex flex-col', className)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h3 className="text-lg font-medium mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 flex-shrink-0">
                Referenced Files
            </h3>
            
            <Tabs value={tab} onValueChange={setTab} className="flex flex-col h-full">
                <div className='overflow-x-auto flex gap-2 bg-white/5 p-2 rounded-md flex-shrink-0'>
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
                
                <div className="flex-1 overflow-hidden mt-2">
                    {filesReferences.map(file => (
                        <TabsContent 
                            key={file.fileName} 
                            value={file.fileName} 
                            className='w-full h-full border border-white/10 rounded-md overflow-hidden'
                        >
                            <div className="p-2 bg-indigo-900/30 text-white rounded-t-md flex justify-between items-center flex-shrink-0">
                                <span>{file.fileName}</span>
                                <span className="text-xs text-white/60 italic">Referenced by AI</span>
                            </div>
                            
                            <div className="flex-1 overflow-auto h-full bg-indigo-900/20">
                                {file.sourceCode ? (
                                    <CodeContent 
                                        sourceCode={file.sourceCode}
                                        language={getLanguageFromFileName(file.fileName)}
                                        customStyle={{
                                            borderRadius: '0 0 0.375rem 0.375rem',
                                            background: 'rgba(30, 41, 59, 0.7)',
                                        }}
                                    />
                                ) : (
                                    <div className="p-4 bg-indigo-900/20 rounded-b-md text-white/70">
                                        No code content available
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </motion.div>
    );
};

export default CodeReferences;