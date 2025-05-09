"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="pt-10 pb-20 px-8 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 items-center gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your AI-Powered{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-size-200 animate-gradient">
              Code Companion
            </span>
          </h1>
          <p className="text-xl mb-8 text-white/80 leading-relaxed">
            Aetheria uses AI to understand your codebase, analyze commits, and summarize meetings - bringing context-aware intelligence to your repositories.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <FeatureBubble color="indigo" text="Vector Search" />
            <FeatureBubble color="blue" text="Commit Analysis" />
            <FeatureBubble color="purple" text="Meeting Summaries" />
            <FeatureBubble color="green" text="Context-Aware Q&A" />
          </div>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:translate-y-[-2px] transition duration-300">
              <Link href="/sign-up">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#demo">Watch Demo</a>
            </Button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="repo-demo-container h-96 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl overflow-hidden"
        >
          <div className="h-full w-full relative">
            <Image 
              src="/api/placeholder/600/1200" 
              alt="Aetheria Interface Demo" 
              fill
              className="object-cover repo-demo transition-transform duration-10000 hover:translate-y-[-88%]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureBubble({ color, text }: { color: string; text: string }) {
  const colorClasses = {
    indigo: "bg-indigo-600/30 text-indigo-200",
    blue: "bg-blue-600/30 text-blue-200",
    purple: "bg-purple-600/30 text-purple-200",
    green: "bg-green-600/30 text-green-200",
  };

  return (
    <div
      className={`px-4 py-2 backdrop-blur-md rounded-full ${colorClasses[color as keyof typeof colorClasses]} transition-transform hover:scale-105 duration-300`}
    >
      <span>{text}</span>
    </div>
  );
}