'use client';

import Link from 'next/link';
import { ArrowUp, Shield } from 'lucide-react';
import { Profile } from '@/lib/types';

interface FooterProps {
  profile: Profile;
}

export default function Footer({ profile }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto border-t border-surface-border bg-slate-950/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-surface-border">
          
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link href="#hero" className="flex items-center gap-3 mb-4 group inline-flex">
              <div className="w-9 h-9 rounded-xl gradient-bg text-white flex items-center justify-center font-mono font-bold text-xs shadow-md shadow-indigo-500/20">
                &lt;/&gt;
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                {profile.name || '[Your Name]'}
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
              Independent freelance web designer &amp; developer crafting bespoke, high-converting Next.js digital experiences for ambitious businesses worldwide.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Navigation</h4>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-slate-400">
              <Link href="#services" className="hover:text-foreground transition-colors">Services</Link>
              <Link href="#work" className="hover:text-foreground transition-colors">Selected Work</Link>
              <Link href="#about" className="hover:text-foreground transition-colors">About Me</Link>
              <Link href="#process" className="hover:text-foreground transition-colors">My Process</Link>
              <Link href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</Link>
              <Link href="#contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Services</h4>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-slate-400">
              <Link href="#services" className="hover:text-foreground transition-colors">Website Design (UI/UX)</Link>
              <Link href="#services" className="hover:text-foreground transition-colors">Custom Web Development</Link>
              <Link href="#services" className="hover:text-foreground transition-colors">Responsive Redesigns</Link>
              <Link href="#services" className="hover:text-foreground transition-colors">Support &amp; Maintenance</Link>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Connect</h4>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-slate-400">
              {profile.socials?.github && (
                <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
              )}
              {profile.socials?.linkedin && (
                <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">LinkedIn</a>
              )}
              {profile.socials?.twitter && (
                <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Twitter / X</a>
              )}
              <a href={`mailto:${profile.email || 'hello@yourname.dev'}`} className="hover:text-indigo-400 transition-colors">
                {profile.email || 'hello@yourname.dev'}
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} {profile.name || '[Your Name]'}. All rights reserved. Built with Next.js 14, React &amp; Tailwind CSS.
          </div>
          
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Studio Admin</span>
            </Link>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 font-semibold text-slate-400 hover:text-foreground transition-colors"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
