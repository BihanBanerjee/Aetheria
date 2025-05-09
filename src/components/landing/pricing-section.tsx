"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-8 max-w-7xl mx-auto">
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Start free and upgrade as your needs grow. Pay only for what you use with our credit-based system.
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <PricingCard 
          title="Starter"
          description="Perfect for small projects and individual developers"
          price="Free"
          features={[
            "50 credits included",
            "1 project",
            "Vector search",
            "Commit analysis"
          ]}
          buttonText="Get Started"
          buttonLink="/sign-up"
          delay={0}
        />
        
        <PricingCard 
          title="Pro"
          description="Ideal for teams and larger projects"
          price="$19"
          period="/month"
          features={[
            "500 credits included",
            "Unlimited projects",
            "Team collaboration (5 members)",
            "Meeting summaries",
            "Priority support"
          ]}
          buttonText="Upgrade to Pro"
          buttonLink="/sign-up"
          highlighted={true}
          delay={0.1}
        />
        
        <PricingCard 
          title="Enterprise"
          description="Custom solutions for larger organizations"
          price="Custom"
          features={[
            "Custom credit packages",
            "Unlimited projects & team members",
            "Advanced security features",
            "Dedicated account manager"
          ]}
          buttonText="Contact Sales"
          buttonLink="/contact"
          buttonVariant="outline"
          delay={0.2}
        />
      </div>
      
      <motion.div 
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <p className="text-white/70 mb-8">
          Need more credits? Additional credits can be purchased at any time for $2 per 100 credits.
        </p>
        <Link 
          href="#pricing-faq" 
          className="text-indigo-300 hover:text-indigo-200 transition flex items-center justify-center"
        >
          Learn more about our pricing
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
}

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  period?: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
  buttonVariant?: "default" | "outline";
  highlighted?: boolean;
  delay: number;
}

function PricingCard({ 
  title, 
  description, 
  price, 
  period = "", 
  features, 
  buttonText, 
  buttonLink,
  buttonVariant = "default",
  highlighted = false,
  delay
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`${highlighted ? "scale-105" : ""} transition-all hover:scale-105`}
    >
      <Card className={`h-full bg-white/10 backdrop-blur-lg ${highlighted ? "border-2 border-indigo-400/50 relative" : "border-white/20"}`}>
        {highlighted && (
          <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
            Popular
          </div>
        )}
        
        <CardContent className="pt-8 pb-6">
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-white/70 mb-6">{description}</p>
          <div className="mb-6">
            <span className="text-4xl font-bold">{price}</span>
            <span className="text-white/70">{period}</span>
          </div>
          <ul className="mb-8 space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="h-5 w-5 text-green-400 mr-2" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        
        <CardFooter>
          <Button 
            asChild 
            variant={buttonVariant}
            className={`w-full ${buttonVariant === "default" ? "bg-gradient-to-r from-indigo-600 to-indigo-800 hover:translate-y-[-2px] transition duration-300" : ""}`}
          >
            <Link href={buttonLink}>{buttonText}</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}