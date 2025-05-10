// src/app/(protected)/layout.tsx
import { SidebarProvider } from '@/components/ui/custom-sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'
import { AppSidebar } from './dashboard/app-sidebar'
import { MainContent } from './main-content'  // Moved to a separate file

type Props = {
    children: React.ReactNode
}

const SidebarLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Add animated particles background */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white opacity-30"
            style={{
              width: `${Math.random() * 8 + 2}px`,
              height: `${Math.random() * 8 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 15}s linear infinite`
            }}
          />
        ))}
      </div>
      
      <SidebarProvider defaultExpanded={true}>
        <AppSidebar />
        <MainContent>{children}</MainContent>
      </SidebarProvider>
    </div>
  )
}

export default SidebarLayout