"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Search,
  GitCommit,
  AlertCircle,
  MessageSquare,
  Users,
  Github
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-8 max-w-7xl mx-auto">
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Aetheria brings AI-powered intelligence to your development workflow, making it easier to understand and navigate complex codebases.
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Search className="h-6 w-6" />}
          title="Vector Search"
          description="Find exactly what you need in your codebase with semantic search powered by vector embeddings. Ask questions in natural language and get relevant file references."
          delay={0}
        />
        
        <FeatureCard 
          icon={<GitCommit className="h-6 w-6" />}
          title="Commit Analysis"
          description="Automatically analyze and summarize commits to understand changes over time. Get AI-generated insights on what changed and why."
          delay={0.1}
        />
        
        <FeatureCard 
          icon={<AlertCircle className="h-6 w-6" />}
          title="Meeting Summaries"
          description="Upload meeting recordings and get AI-powered summaries with key discussion points, action items, and decisions made."
          delay={0.2}
        />
        
        <FeatureCard 
          icon={<MessageSquare className="h-6 w-6" />}
          title="Context-Aware Q&A"
          description="Ask questions about your codebase and get intelligent answers with relevant code snippets and explanations."
          delay={0.3}
        />
        
        <FeatureCard 
          icon={<Users className="h-6 w-6" />}
          title="Team Collaboration"
          description="Invite team members to your projects, share insights, and collaborate efficiently with a shared context of your codebase."
          delay={0.4}
        />
        
        <FeatureCard 
          icon={<Github className="h-6 w-6" />}
          title="GitHub Integration"
          description="Connect your GitHub repositories seamlessly and let Aetheria analyze your codebase, commits, and project structure automatically."
          delay={0.5}
        />
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="h-full bg-white/10 backdrop-blur-lg border-white/20 hover:translate-y-[-5px] transition duration-300">
        <CardContent className="pt-6">
          <div className="h-12 w-12 rounded-full bg-indigo-600/50 flex items-center justify-center mb-4">
            {icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-white/70">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}