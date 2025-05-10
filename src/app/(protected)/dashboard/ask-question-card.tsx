// src/app/(protected)/dashboard/ask-question-card.tsx
'use client'
import MDEditor from '@uiw/react-md-editor'
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import useProject from '@/hooks/use-project'
import Image from 'next/image';
import React from 'react'
import { askQuestion } from './actions';
import { readStreamableValue } from 'ai/rsc';
import CodeReferences from './code-references';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';
import { Bot, Save } from 'lucide-react';
import { GlassmorphicCard, GlassmorphicCardHeader, GlassmorphicCardTitle, GlassmorphicCardContent } from '@/components/ui/glassmorphic-card';

const AskQuestionCard = () => {
    const { project } = useProject();
    const [open, setOpen] = React.useState(false);
    const [question, setQuestion] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [filesReferences, setFilesReferences] = React.useState<{fileName: string; sourceCode: string; summary: string}[]>([]);
    const [answer, setAnswer] = React.useState('');
    const saveAnswer = api.project.saveAnswer.useMutation();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setAnswer('')
        setFilesReferences([])
        e.preventDefault();
        if(!project?.id) {
            return;
        }
        setLoading(true)
        
        const { output, filesReferences } = await askQuestion(question, project.id)
        setOpen(true)
        setFilesReferences(filesReferences)

        for await (const delta of readStreamableValue(output)) {
            if(delta) {
                setAnswer(ans => ans + delta)
            }
        }
        setLoading(false)
    }

    const refetch = useRefetch();

    return (
        <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='sm:max-w-[80vw] max-h-[90vh] overflow-hidden flex flex-col glassmorphism border border-white/20'>
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <DialogTitle className="flex items-center">
                            <Image src="/logo.png" alt="aetheria" width={40} height={40} className="filter drop-shadow-lg" />
                            <span className="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                                AI Response
                            </span>
                        </DialogTitle>  
                        <Button 
                            disabled={saveAnswer.isPending} 
                            variant={'outline'} 
                            className="border-white/20 bg-white/10 text-white ml-auto"
                            onClick={() => {
                                saveAnswer.mutate({
                                    projectId: project!.id,
                                    question,
                                    answer,
                                    filesReferences
                                }, {
                                    onSuccess: () => {
                                        toast.success('Answer saved successfully')
                                        refetch();
                                    },
                                    onError: () => {
                                        toast.error('Failed to save answer')
                                    }
                                })
                            }}
                        >
                            <Save className="h-4 w-4 mr-1" />
                            Save Answer
                        </Button> 
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto space-y-4 w-full pr-2">
                    <div className="w-full">
                        <MDEditor.Markdown 
                            source={answer} 
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
                    
                    <CodeReferences filesReferences={filesReferences} />
                </div>
                
                <div className="mt-4">
                    <Button 
                        type="button" 
                        onClick={() => {setOpen(false)}} 
                        className='w-full bg-gradient-to-r from-indigo-600 to-indigo-800'
                    >
                        Close 
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
        <GlassmorphicCard className='relative col-span-3'>
            <GlassmorphicCardHeader>
                <GlassmorphicCardTitle className="flex items-center">
                    <Bot className="h-5 w-5 mr-2" />
                    Ask a question
                </GlassmorphicCardTitle>
            </GlassmorphicCardHeader>
            <GlassmorphicCardContent>
                <form onSubmit={onSubmit}>
                    <Textarea 
                        placeholder='Which file should I edit to change the home page?' 
                        value={question} 
                        onChange={(e) => setQuestion(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                    <div className="h-4"></div>
                    <Button 
                        type='submit' 
                        disabled={loading} 
                        className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900"
                    >
                        {loading ? (
                            <>
                                <span className="animate-pulse">Thinking...</span>
                            </>
                        ) : (
                            <>Ask Aetheria!</>
                        )}
                    </Button>
                </form>
            </GlassmorphicCardContent>
        </GlassmorphicCard>
        </>
    )
}

export default AskQuestionCard