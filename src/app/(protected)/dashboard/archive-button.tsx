// src/app/(protected)/dashboard/archive-button.tsx
'use client'
import { Button } from '@/components/ui/button'
import useProject from '@/hooks/use-project'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react'
import { Archive } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

const ArchiveButton = () => {
    const archiveProject = api.project.archiveProject.useMutation()
    const { projectId } = useProject()
    const refetch = useRefetch()

    return (
        <Button 
            disabled={archiveProject.isPending} 
            size="sm" 
            variant="destructive" 
            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
            onClick={() => {
                const confirm = window.confirm('Are you sure you want to archive this project?')
                if(confirm) archiveProject.mutate({projectId}, {
                    onSuccess: () => {
                        toast.success('Project archived successfully')
                        refetch()
                    },
                    onError: () => {
                        toast.error('Failed to archive project')
                    }
                })
            }}
        >
            <Archive className="h-4 w-4 mr-1" />
            Archive
        </Button>
    )
}

export default ArchiveButton