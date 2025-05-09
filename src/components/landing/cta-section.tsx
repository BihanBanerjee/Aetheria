"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-xl overflow-hidden">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Development Experience?</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              Join thousands of developers who are using Aetheria to understand, navigate, and collaborate on their codebases with AI-powered intelligence.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:translate-y-[-2px] transition duration-300"
              >
                <Link href="/sign-up">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#demo">Schedule a Demo</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}