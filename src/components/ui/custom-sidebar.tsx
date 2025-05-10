// src/components/ui/custom-sidebar.tsx
'use client'

import React, { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Context for sidebar state management
type SidebarContextType = {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProviderProps {
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function SidebarProvider({ 
  children, 
  defaultExpanded = true 
}: SidebarProviderProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <SidebarContext.Provider value={{ isExpanded, setIsExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Main Sidebar Component
interface SidebarProps {
  children: ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  const { isExpanded } = useSidebarContext();
  
  return (
    <aside 
      className={cn(
        "glassmorphism fixed left-0 top-0 z-40 h-full transition-all duration-300 border border-white/20 rounded-r-xl shadow-xl overflow-hidden",
        isExpanded ? "w-64" : "w-20",
        className
      )}
    >
      <div className="h-full flex flex-col">
        {children}
      </div>
    </aside>
  );
}

// Sidebar Header
interface SidebarHeaderProps {
  children: ReactNode;
  className?: string;
}

export function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return (
    <div className={cn("flex items-center p-4 border-b border-white/10", className)}>
      {children}
      <div className="ml-auto">
        <ToggleSidebarButton />
      </div>
    </div>
  );
}

// Toggle Button
function ToggleSidebarButton() {
  const { isExpanded, setIsExpanded } = useSidebarContext();
  
  return (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
    >
      {isExpanded ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      )}
    </button>
  );
}

// Sidebar Content
interface SidebarContentProps {
  children: ReactNode;
  className?: string;
}

export function SidebarContent({ children, className }: SidebarContentProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto py-4", className)}>
      {children}
    </div>
  );
}

// Sidebar Group
interface SidebarGroupProps {
  children: ReactNode;
  className?: string;
}

export function SidebarGroup({ children, className }: SidebarGroupProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

// Sidebar Group Label
interface SidebarGroupLabelProps {
  children: ReactNode;
  className?: string;
}

export function SidebarGroupLabel({ children, className }: SidebarGroupLabelProps) {
  const { isExpanded } = useSidebarContext();
  
  if (!isExpanded) return null;
  
  return (
    <div className={cn("px-4 mb-2 text-xs uppercase font-semibold text-white/60", className)}>
      {children}
    </div>
  );
}

// Sidebar Group Content
interface SidebarGroupContentProps {
  children: ReactNode;
  className?: string;
}

export function SidebarGroupContent({ children, className }: SidebarGroupContentProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {children}
    </div>
  );
}

// Sidebar Menu
interface SidebarMenuProps {
  children: ReactNode;
  className?: string;
}

export function SidebarMenu({ children, className }: SidebarMenuProps) {
  return (
    <ul className={cn("space-y-1 px-3", className)}>
      {children}
    </ul>
  );
}

// Sidebar Menu Item
interface SidebarMenuItemProps {
  children: ReactNode;
  className?: string;
}

export function SidebarMenuItem({ children, className }: SidebarMenuItemProps) {
  return (
    <li className={cn("", className)}>
      {children}
    </li>
  );
}

// Sidebar Menu Button
interface SidebarMenuButtonProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
  asChild?: boolean;
}

export function SidebarMenuButton({ 
  children, 
  className, 
  active = false,
  onClick,
  asChild = false
}: SidebarMenuButtonProps) {
  const { isExpanded } = useSidebarContext();
  
  if (asChild) {
    return (
      <div className={cn(
        "flex items-center rounded-md py-2 px-3 text-sm transition-colors",
        active ? "bg-white/20 text-white shadow-md" : "text-white/80 hover:bg-white/10 hover:text-white",
        isExpanded ? "" : "justify-center px-2",
        className
      )}>
        {children}
      </div>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center rounded-md py-2 px-3 text-sm transition-colors",
        active ? "bg-white/20 text-white shadow-md" : "text-white/80 hover:bg-white/10 hover:text-white",
        isExpanded ? "" : "justify-center px-2",
        className
      )}
    >
      {children}
    </button>
  );
}

// Sidebar Footer
interface SidebarFooterProps {
  children: ReactNode;
  className?: string;
}

export function SidebarFooter({ children, className }: SidebarFooterProps) {
  return (
    <div className={cn("mt-auto p-4 border-t border-white/10", className)}>
      {children}
    </div>
  );
}