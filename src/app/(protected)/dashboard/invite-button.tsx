// src/app/(protected)/dashboard/invite-button.tsx
'use client'
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useProject from '@/hooks/use-project'
import { UserPlus } from 'lucide-react';
import React, { useState } from 'react'
import { toast } from 'sonner';

const InviteButton = () => {
    const { projectId } = useProject();
    const [open, setOpen] = useState(false)
  
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="glassmorphism border border-white/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                            Invite Team Members
                        </DialogTitle>
                    </DialogHeader>
                    <p className='text-sm text-white/70'>
                        Ask them to copy and paste this link
                    </p>
                    <Input 
                        className='mt-4 bg-white/10 border-white/20 text-white' 
                        readOnly 
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/join/${projectId}`)
                            toast.success('Link copied to clipboard')
                        }}
                        value={`${window.location.origin}/join/${projectId}`}
                    />
                </DialogContent>
            </Dialog>
            <Button 
                size='sm' 
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900"
            >
                <UserPlus className="h-4 w-4 mr-1" />
                Invite Members
            </Button>
        </>
    )
}

export default InviteButton