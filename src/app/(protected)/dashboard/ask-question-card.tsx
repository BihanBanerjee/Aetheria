'use client'
import MDEditor from '@uiw/react-md-editor'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <DialogContent className='sm:max-w-[80vw] max-h-[90vh] overflow-hidden flex flex-col'>
            <DialogHeader>
                <div className="flex items-center gap-2">
                    <DialogTitle>
                        <Image src="/logo.png" alt="aetheria" width={40} height={40} />
                    </DialogTitle>  
                    <Button disabled={saveAnswer.isPending} variant={'outline'} onClick={ () => {
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
                    } }>
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
                            backgroundColor: 'oklch(0.21 0.006 285.885)', // same as --card in dark mode
                            color: 'oklch(0.985 0 0)' // same as --card-foreground in dark mode
                        }}
                    />
                </div>
                
                <CodeReferences filesReferences={filesReferences} />
            </div>
            
            <div className="mt-4">
                <Button type="button" onClick={() => {setOpen(false)}} className='w-full'>
                    Close 
                </Button>
            </div>
        </DialogContent>
    </Dialog>
    <Card className='relative col-span-3'>
        <CardHeader>
            <CardTitle>
                Ask a question
            </CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={onSubmit}>
                <Textarea placeholder='Which file should I edit to change the home page?' value={question} onChange={(e) => setQuestion(e.target.value)} />
                <div className="h-4"></div>
                <Button type='submit' disabled={loading}>
                    Ask Aetheria!
                </Button>
            </form>
        </CardContent>
    </Card>
    </>
  )
}

export default AskQuestionCard