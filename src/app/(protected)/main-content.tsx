'use client'

import { useSidebarContext } from '@/components/ui/custom-sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'

type MainContentProps = {
  children: React.ReactNode
}

export function MainContent({ children }: MainContentProps) {
  const { isExpanded } = useSidebarContext();
  
  return (
    <main 
      className={`relative flex-1 flex flex-col h-full transition-all duration-300 ${
        isExpanded 
          ? 'ml-64 w-[calc(100%-16rem)]' 
          : 'ml-20 w-[calc(100%-5rem)]'
      }`}
    >
      {/* Use flex column with flex-1 for the main container */}
      <div className="flex flex-col h-full p-3">
        {/* Header - fixed height */}
        <div className='flex items-center gap-2 glassmorphism border border-white/20 rounded-xl p-2 px-4 shrink-0'>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-white/70">Welcome to Aetheria</span>
            <UserButton />
          </div>
        </div>
        
        {/* Fixed spacing */}
        <div className='h-4 shrink-0'></div>
        
        {/* Main content area - fills remaining space with flex-1 */}
        <div className='glassmorphism border border-white/20 rounded-xl overflow-y-auto flex-1 p-6'>
          {children}
        </div>
      </div>
    </main>
  );
}