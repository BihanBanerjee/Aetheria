"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function CodeDemoSection() {
  return (
    <section className="py-20 px-8 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-4">Ask Your Codebase</h2>
          <p className="text-xl text-white/80 mb-8">
            Aetheria understands your code context, making it easy to get answers to your questions about any part of your repository.
          </p>
          <div className="space-y-6">
            <ExampleQuestion question="How does the billing system work?" />
            <ExampleQuestion question="What files should I modify to add a new feature to the dashboard?" />
            <ExampleQuestion question="Explain the authentication flow in this codebase." />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="h-full"
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-xl overflow-hidden h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 text-sm text-white/70">Aetheria AI Response</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 flex-1 overflow-y-auto">
                <CodeResponse />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function ExampleQuestion({ question }: { question: string }) {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-lg">
      <CardContent className="p-4">
        <div className="flex items-center mb-2">
          <div className="h-3 w-3 rounded-full bg-green-400 mr-2"></div>
          <p className="text-white/70 font-medium">Example Question</p>
        </div>
        <p className="text-white font-medium">{question}</p>
      </CardContent>
    </Card>
  );
}

function CodeResponse() {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const fullText = `<span class="text-blue-400">Analyzing billing system...</span>

The billing system in this codebase works by using Stripe for payment processing. Here's how it flows:

<span class="text-green-400">1. Credit Purchase:</span> Users buy credits via the BillingPage component <span class="text-yellow-400">(src/app/(protected)/billing/page.tsx)</span>

<span class="text-green-400">2. Checkout:</span> The createCheckOutSession function <span class="text-yellow-400">(src/lib/stripe.ts)</span> creates a Stripe checkout session

<span class="text-green-400">3. Webhook:</span> After payment, Stripe sends a webhook <span class="text-yellow-400">(src/app/api/webhook/stripe/route.ts)</span> which adds credits to the user's account

<span class="text-green-400">4. Credit Usage:</span> Credits are consumed when indexing files during project creation <span class="text-yellow-400">(src/server/api/routers/project.ts)</span>

Each file indexed consumes 1 credit.`;

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 30);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, fullText]);

  return (
    <div 
      className="text-gray-300 text-sm whitespace-pre-line"
      dangerouslySetInnerHTML={{ __html: displayedText }}
    />
  );
}