// src/app/(protected)/main-content.tsx
'use client'  // Important - this makes it a client component

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
      className={`transition-all duration-300 p-3 ${
        isExpanded 
          ? 'ml-64 w-[calc(100%-16rem)]' 
          : 'ml-20 w-[calc(100%-5rem)]'
      }`}
    >
      <div className='flex items-center gap-2 glassmorphism border border-white/20 rounded-xl p-2 px-4'>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-white/70">Welcome to Aetheria</span>
          <UserButton />
        </div>
      </div>
      <div className='h-4'></div>
      {/* main content */}
      <div className='glassmorphism border border-white/20 rounded-xl overflow-y-auto h-[calc(100vh-6rem)] p-6'>
        {children}
      </div>
    </main>
  );
}