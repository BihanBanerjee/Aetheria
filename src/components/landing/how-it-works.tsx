"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-8 max-w-7xl mx-auto">
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Getting started with Aetheria is simple. Connect your repositories and start exploring your codebase with AI-powered assistance.
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <StepCard 
          number={1}
          title="Connect Repository"
          description="Link your GitHub repository to Aetheria with a few clicks. Provide a GitHub token for private repositories."
          delay={0}
        />
        
        <StepCard 
          number={2}
          title="Indexing & Analysis"
          description="Aetheria analyzes your codebase, creating vector embeddings and summaries for intelligent search and Q&A."
          delay={0.1}
        />
        
        <StepCard 
          number={3}
          title="Ask Questions"
          description="Start asking questions about your codebase in natural language and get intelligent, context-aware answers."
          delay={0.2}
        />
      </div>
      
      {/* Demo Video */}
      <motion.div 
        id="demo"
        className="mt-20 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="aspect-w-16 aspect-h-9 relative rounded-lg overflow-hidden">
          <Image 
            src="/api/placeholder/720/1280" 
            alt="Aetheria Demo" 
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  delay: number;
}

function StepCard({ number, title, description, delay }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-center">
        <CardContent className="pt-8 pb-6">
          <div className="h-16 w-16 rounded-full bg-blue-600/50 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
            {number}
          </div>
          <h3 className="text-xl font-semibold mb-4">{title}</h3>
          <p className="text-white/70">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}