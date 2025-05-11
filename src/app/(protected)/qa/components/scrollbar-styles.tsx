// app/(protected)/qa/components/scrollbar-styles.tsx
'use client'

import React from 'react';

// Custom scrollbar styles component
export const ScrollbarStyles: React.FC = () => {
  return (
    <style jsx global>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(99, 102, 241, 0.5);
        border-radius: 3px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(99, 102, 241, 0.7);
      }
      
      .custom-scrollbar-x::-webkit-scrollbar {
        height: 6px;
      }
      
      .custom-scrollbar-x::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
      }
      
      .custom-scrollbar-x::-webkit-scrollbar-thumb {
        background: rgba(99, 102, 241, 0.5);
        border-radius: 3px;
      }
      
      .custom-scrollbar-x::-webkit-scrollbar-thumb:hover {
        background: rgba(99, 102, 241, 0.7);
      }
    `}</style>
  );
};

export default ScrollbarStyles;