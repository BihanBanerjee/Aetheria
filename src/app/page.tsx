import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { CodeDemoSection } from "@/components/landing/code-demo";
import { PricingSection } from "@/components/landing/pricing-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { AnimatedBackground } from "@/components/landing/animated-background";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Navigation is typically part of the layout, but adding it here for completeness */}
      <nav className="py-6 px-8 flex justify-between items-center relative z-10">
        <div className="flex items-center">
          <img src="/aetheria-logo.svg" alt="Aetheria Logo" className="h-10 w-10" />
          <span className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-size-200 animate-gradient">
            Aetheria
          </span>
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#features" className="text-white opacity-80 hover:opacity-100 transition">Features</a>
          <a href="#how-it-works" className="text-white opacity-80 hover:opacity-100 transition">How it Works</a>
          <a href="#pricing" className="text-white opacity-80 hover:opacity-100 transition">Pricing</a>
        </div>
        <div className="flex space-x-4">
          <a href="/sign-in" className="px-5 py-2 border border-white/30 rounded-lg hover:bg-white/10 transition">
            Sign In
          </a>
          <a href="/sign-up" className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-lg hover:translate-y-[-2px] transition duration-300">
            Sign Up Free
          </a>
        </div>
      </nav>
      
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CodeDemoSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}