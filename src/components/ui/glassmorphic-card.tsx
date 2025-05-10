// src/components/ui/glassmorphic-card.tsx
import { cn } from '@/lib/utils';
import React from 'react';

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function GlassmorphicCard({ children, className, ...props }: GlassmorphicCardProps) {
  return (
    <div 
      className={cn(
        'glassmorphism border border-white/20 rounded-xl p-4 shadow-lg', 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassmorphicCardHeader({ children, className, ...props }: GlassmorphicCardProps) {
  return (
    <div className={cn('pb-2 mb-2', className)} {...props}>
      {children}
    </div>
  );
}

export function GlassmorphicCardTitle({ children, className, ...props }: GlassmorphicCardProps) {
  return (
    <h3 className={cn('text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100', className)} {...props}>
      {children}
    </h3>
  );
}

export function GlassmorphicCardContent({ children, className, ...props }: GlassmorphicCardProps) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

export function GlassmorphicCardFooter({ children, className, ...props }: GlassmorphicCardProps) {
  return (
    <div className={cn('pt-4 mt-4 border-t border-white/10', className)} {...props}>
      {children}
    </div>
  );
}