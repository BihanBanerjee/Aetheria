'use client'

import { SignUp } from '@clerk/nextjs'
import Image from 'next/image'
import { aetheriaClerkTheme } from '@/styles/clerkTheme'


export default function Page() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 py-8">
      {/* Abstract tech background patterns */}
      {/* Code Network Pattern Overlay - represents code repositories and connections */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="code-network-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                {/* Repository nodes */}
                <circle cx="40" cy="40" r="5" fill="white" opacity="0.8" />
                <circle cx="160" cy="40" r="3" fill="white" opacity="0.6" />
                <circle cx="40" cy="160" r="4" fill="white" opacity="0.7" />
                <circle cx="160" cy="160" r="6" fill="white" opacity="0.9" />
                <circle cx="100" cy="100" r="7" fill="white" opacity="1" />
                <circle cx="70" cy="130" r="3" fill="white" opacity="0.6" />
                <circle cx="130" cy="70" r="4" fill="white" opacity="0.7" />
                
                {/* Connection lines */}
                <path d="M40 40 L100 100" stroke="white" strokeWidth="0.5" opacity="0.5" />
                <path d="M160 40 L100 100" stroke="white" strokeWidth="0.5" opacity="0.5" />
                <path d="M40 160 L100 100" stroke="white" strokeWidth="0.5" opacity="0.5" />
                <path d="M160 160 L100 100" stroke="white" strokeWidth="0.5" opacity="0.5" />
                <path d="M70 130 L100 100" stroke="white" strokeWidth="0.5" opacity="0.5" />
                <path d="M130 70 L100 100" stroke="white" strokeWidth="0.5" opacity="0.5" />
                
                {/* Code snippets (abstract representations) */}
                <rect x="30" y="35" width="20" height="2" fill="white" opacity="0.4" />
                <rect x="35" y="39" width="10" height="2" fill="white" opacity="0.4" />
                
                <rect x="150" y="35" width="20" height="2" fill="white" opacity="0.4" />
                <rect x="155" y="39" width="10" height="2" fill="white" opacity="0.4" />
                
                <rect x="30" y="155" width="20" height="2" fill="white" opacity="0.4" />
                <rect x="35" y="159" width="10" height="2" fill="white" opacity="0.4" />
                
                <rect x="150" y="155" width="20" height="2" fill="white" opacity="0.4" />
                <rect x="155" y="159" width="10" height="2" fill="white" opacity="0.4" />
                
                {/* Vector/AI representation */}
                <path d="M95 95 L105 95 L105 105 L95 105 Z" fill="none" stroke="white" strokeWidth="0.7" opacity="0.7" />
                <path d="M90 90 L110 90 L110 110 L90 110 Z" fill="none" stroke="white" strokeWidth="0.4" opacity="0.5" />
                <path d="M85 85 L115 85 L115 115 L85 115 Z" fill="none" stroke="white" strokeWidth="0.2" opacity="0.3" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#code-network-pattern)" />
          </svg>
        </div>
      </div>

      {/* Animated floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 80 }).map((_, i) => (
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

      {/* Logo and app name */}
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
        
        {/* App name and tagline with styles  */}
        <div className="text-center title-container">
          <h1 className="mb-1 gradient-title">Aetheria</h1>
          <p className="tech-tagline gradient-title">Context-Aware Repository Intelligence</p>
        </div>
      </div>

      {/* Updated sign-up container - single glassmorphism container */}
      <div className="z-10 w-full max-w-md bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-indigo-600/15 shadow-xl shadow-indigo-500/15">
        <SignUp appearance={aetheriaClerkTheme} />
      </div>

      {/* Feature bubbles */}
      <div className="mt-8 flex flex-wrap justify-center gap-2 px-4">
        <div className="feature-bubble vector">Vector Search</div>
        <div className="feature-bubble commit">Commit Analysis</div>
        <div className="feature-bubble meeting">Meeting Summaries</div>
      </div>
    </div>
  )
}