// src/app/(protected)/dashboard/team-members.tsx
'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react';
import React from 'react'
import { motion } from 'framer-motion';

const TeamMembers = () => {
    const { projectId } = useProject();
    const { data: members } = api.project.getTeamMembers.useQuery({ projectId })
    
    if (!members || members.length === 0) {
        return null;
    }
    
    return (
        <div className="glassmorphism border border-white/20 px-3 py-2 rounded-xl">
            <p className="text-xs text-white/60 mb-1">Team</p>
            <div className='flex items-center gap-1'>
                {members?.map((member, index) => (
                    <motion.div 
                        key={member.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.1 }}
                        className="relative group"
                    >
                        <img 
                            src={member.user.imageUrl ?? ''} 
                            alt={member.user.firstName || ''} 
                            height={30} 
                            width={30} 
                            className='rounded-full ring-2 ring-indigo-400/30 hover:ring-indigo-400 transition-all' 
                        />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {member.user.firstName || 'Team Member'}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default TeamMembers