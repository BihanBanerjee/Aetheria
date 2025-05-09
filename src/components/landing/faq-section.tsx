"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export function FAQSection() {
  return (
    <section id="pricing-faq" className="py-20 px-8 max-w-7xl mx-auto">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Find answers to common questions about Aetheria.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <FAQCard
          question="What are credits and how do they work?"
          answer="Credits are used to index files in your repositories. Each file requires 1 credit to index. Once indexed, you can ask unlimited questions about that file without using additional credits."
          delay={0}
        />

        <FAQCard
          question="Do I need a GitHub token?"
          answer="A GitHub token is optional for public repositories but required for private repositories. We recommend using a token with read-only permissions for security."
          delay={0.1}
        />

        <FAQCard
          question="How are meeting recordings processed?"
          answer="Meeting recordings are transcribed and then analyzed by our AI to identify key discussion points, decisions, and action items. We support common audio formats like MP3, WAV, and M4A."
          delay={0.2}
        />

        <FAQCard
          question="Is my code and data secure?"
          answer="Yes, we take security seriously. Your code is processed securely, and we never store the actual source code long-term - only the vector embeddings and summaries needed for search functionality."
          delay={0.3}
        />

        <FAQCard
          question="Can I collaborate with my team?"
          answer="Yes, you can invite team members to your projects. They'll have access to the same context-aware search and Q&A features, making collaboration and knowledge sharing easier."
          delay={0.4}
        />

        <FAQCard
          question="What programming languages are supported?"
          answer="Aetheria supports all popular programming languages including JavaScript, TypeScript, Python, Rust, Java, C++, Go, and many more. Our vector search and context understanding is language-agnostic."
          delay={0.5}
        />
      </div>

      <div className="mt-16">
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          <AccordionItem value="item-1" className="border-white/20">
            <AccordionTrigger className="text-white text-lg font-medium">
              Is there a limit to how many questions I can ask?
            </AccordionTrigger>
            <AccordionContent className="text-white/70">
              No, once your files are indexed, you can ask unlimited questions about your codebase. The credit system only applies to indexing files, not to the number of questions you can ask.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-white/20">
            <AccordionTrigger className="text-white text-lg font-medium">
              Can I import repositories from GitLab or Bitbucket?
            </AccordionTrigger>
            <AccordionContent className="text-white/70">
              Currently, we support GitHub repositories directly. For GitLab or Bitbucket repositories, you can mirror them to GitHub or contact us for enterprise solutions.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-white/20">
            <AccordionTrigger className="text-white text-lg font-medium">
              How long does it take to index a repository?
            </AccordionTrigger>
            <AccordionContent className="text-white/70">
              Indexing time depends on the size of your repository. Small to medium repositories (up to 500 files) are typically indexed within a few minutes. Larger repositories may take longer.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}

interface FAQCardProps {
  question: string;
  answer: string;
  delay: number;
}

function FAQCard({ question, answer, delay }: FAQCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="h-full bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3">{question}</h3>
          <p className="text-white/70">{answer}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}