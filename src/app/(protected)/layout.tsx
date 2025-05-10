import { SidebarProvider } from '@/components/ui/custom-sidebar'
import React from 'react'
import { AppSidebar } from './dashboard/app-sidebar'
import { MainContent } from './main-content'

type Props = {
    children: React.ReactNode
}

const SidebarLayout = ({ children }: Props) => {
  return (
    <div className="h-full w-full bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Increased number of animated particles background */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 150 }).map((_, i) => (
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
        <div className="h-full flex"> {/* Flex container for sidebar and main content */}
          <AppSidebar />
          <MainContent>{children}</MainContent>
        </div>
      </SidebarProvider>
    </div>
  )
}

export default SidebarLayout