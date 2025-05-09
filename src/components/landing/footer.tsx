"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Facebook, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <div className="flex items-center mb-4">
            <Image src="/aetheria-logo.svg" alt="Aetheria Logo" width={32} height={32} />
            <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-size-200 animate-gradient">
              Aetheria
            </span>
          </div>
          <p className="text-white/70 mb-4">
            Context-aware repository intelligence powered by AI.
          </p>
          <div className="flex space-x-4">
            <SocialLink href="https://github.com" icon={<Github className="h-5 w-5" />} />
            <SocialLink href="https://facebook.com" icon={<Facebook className="h-5 w-5" />} />
            <SocialLink href="https://twitter.com" icon={<Twitter className="h-5 w-5" />} />
            <SocialLink href="https://linkedin.com" icon={<Linkedin className="h-5 w-5" />} />
          </div>
        </div>
        
        {/* Links Column 1 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Product</h3>
          <ul className="space-y-2">
            <FooterLink href="#features">Features</FooterLink>
            <FooterLink href="#pricing">Pricing</FooterLink>
            <FooterLink href="#">API</FooterLink>
            <FooterLink href="#">Integrations</FooterLink>
            <FooterLink href="#">Changelog</FooterLink>
          </ul>
        </div>
        
        {/* Links Column 2 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Resources</h3>
          <ul className="space-y-2">
            <FooterLink href="#">Documentation</FooterLink>
            <FooterLink href="#">Blog</FooterLink>
            <FooterLink href="#">Community</FooterLink>
            <FooterLink href="#">Case Studies</FooterLink>
            <FooterLink href="#">Help Center</FooterLink>
          </ul>
        </div>
        
        {/* Links Column 3 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            <FooterLink href="#">About</FooterLink>
            <FooterLink href="#">Careers</FooterLink>
            <FooterLink href="#">Press</FooterLink>
            <FooterLink href="#">Contact</FooterLink>
            <FooterLink href="#">Privacy Policy</FooterLink>
          </ul>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-white/10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="text-white/50 text-sm mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} Aetheria. All rights reserved.
        </p>
        <div className="flex space-x-6">
          <Link href="#" className="text-white/50 hover:text-white transition text-sm">
            Terms of Service
          </Link>
          <Link href="#" className="text-white/50 hover:text-white transition text-sm">
            Privacy Policy
          </Link>
          <Link href="#" className="text-white/50 hover:text-white transition text-sm">
            Cookie Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-white/70 hover:text-white transition">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <Link 
      href={href}
      className="text-white/70 hover:text-white transition"
      target="_blank"
      rel="noopener noreferrer"
    >
      {icon}
    </Link>
  );
}