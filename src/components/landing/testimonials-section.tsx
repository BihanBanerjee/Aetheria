"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

export function TestimonialsSection() {
  return (
    <section className="py-20 px-8 max-w-7xl mx-auto">
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4">What Developers Are Saying</h2>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Hear from developers who have transformed their workflow with Aetheria.
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <TestimonialCard
          name="Sarah Chen"
          role="Lead Developer, TechStart"
          testimonial="Aetheria has cut our onboarding time by 60%. New developers can understand our codebase in days instead of weeks by simply asking questions."
          delay={0}
        />
        
        <TestimonialCard
          name="Marcus Johnson"
          role="CTO, CodeFlow"
          testimonial="The meeting summaries feature alone is worth the price. Getting AI-generated summaries of our technical discussions has transformed how we document decisions."
          delay={0.1}
        />
        
        <TestimonialCard
          name="Priya Sharma"
          role="Senior Engineer, DevMetrics"
          testimonial="The commit analysis gives us insights into our development patterns that we never had before. It's helping us improve our code quality and documentation."
          delay={0.2}
        />
      </div>
    </section>
  );
}

interface TestimonialCardProps {
  name: string;
  role: string;
  testimonial: string;
  delay: number;
}

function TestimonialCard({ name, role, testimonial, delay }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="h-full bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-8">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-full bg-gray-300 mr-4 relative overflow-hidden">
              <Image
                src={`/api/placeholder/48/48?text=${name.charAt(0)}`} 
                alt={name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-semibold">{name}</h4>
              <p className="text-white/70 text-sm">{role}</p>
            </div>
          </div>
          <p className="text-white/80 italic mb-4">
            "{testimonial}"
          </p>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}