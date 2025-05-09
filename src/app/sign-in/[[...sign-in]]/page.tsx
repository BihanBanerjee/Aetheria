'use client'

import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'
import { aetheriaClerkTheme } from '@/styles/clerkTheme'

export default function Page() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 py-8">
      {/* Abstract tech background patterns */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Tech circuit pattern overlay */}
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M20 20 L80 20 L80 80 L20 80 Z" fill="none" stroke="white" strokeWidth="1" />
                <path d="M20 20 L50 50 L80 20" fill="none" stroke="white" strokeWidth="1" />
                <circle cx="20" cy="20" r="4" fill="white" />
                <circle cx="80" cy="20" r="4" fill="white" />
                <circle cx="80" cy="80" r="4" fill="white" />
                <circle cx="20" cy="80" r="4" fill="white" />
                <circle cx="50" cy="50" r="4" fill="white" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit-pattern)" />
          </svg>
        </div>
      </div>

      {/* Animated floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 75 }).map((_, i) => (
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

      {/* Logo and app name with gradient styling */}
      <div className="flex flex-col justify-center items-center mb-8 mt-4">
        {/* SVG Logo */}
        <div className="w-24 h-24 mb-3">
          <Image 
            src="/aetheria-logo.svg" 
            alt="Aetheria Logo" 
            width={96} 
            height={96} 
            priority 
          />
        </div>
        
        {/* App name and tagline with styles */}
        <div className="text-center title-container">
          <h1 className="mb-1 gradient-title">Aetheria</h1>
          <p className="tech-tagline gradient-title">AI-Powered Code Intelligence</p>
        </div>
      </div>

      {/* Updated sign-in container - single glassmorphism container */}
      <div className="z-10 w-full max-w-md bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-indigo-600/15 shadow-xl shadow-indigo-500/15">
        <SignIn appearance={aetheriaClerkTheme} />
      </div>

      {/* Feature bubbles */}
      <div className="mt-12 flex flex-wrap justify-center gap-2 px-4">
        <div className="feature-bubble vector">Vector Search</div>
        <div className="feature-bubble commit">Commit Analysis</div>
        <div className="feature-bubble meeting">Meeting Summaries</div>
      </div>
    </div>
  )
}