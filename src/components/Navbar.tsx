'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, Menu, X, ArrowRight, Shield } from 'lucide-react';
import { Profile } from '@/lib/types';

interface NavbarProps {
  profile: Profile;
}

export default function Navbar({ profile }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'h-16 glass-panel shadow-lg' : 'h-20 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="#hero" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl gradient-bg text-white flex items-center justify-center font-mono font-bold text-sm shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            &lt;/&gt;
          </div>
          <div>
            <span className="font-display font-extrabold text-base tracking-tight block text-foreground">
              {profile.name || '[Your Name]'}
            </span>
            <span className="text-[11px] font-medium text-slate-400 block -mt-1 tracking-wider uppercase">
              {profile.subrole || 'Design & Code'}
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
          <Link href="#services" className="hover:text-foreground transition-colors">Services</Link>
          <Link href="#work" className="hover:text-foreground transition-colors">Selected Work</Link>
          <Link href="#about" className="hover:text-foreground transition-colors">About</Link>
          <Link href="#process" className="hover:text-foreground transition-colors">Process</Link>
          <Link href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</Link>
          <Link href="#contact" className="hover:text-foreground transition-colors">Contact</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Admin Studio Link */}
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
            title="Open Studio Admin Dashboard"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Studio CMS</span>
          </Link>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-slate-700/50 bg-slate-800/60 flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-500/50 transition-all"
            aria-label="Toggle dark/light theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Let's Talk CTA */}
          <Link
            href="#contact"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold gradient-bg text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
          >
            <span>Let&apos;s Talk</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl border border-slate-700/50 bg-slate-800/60 flex items-center justify-center text-slate-300"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-6 py-6 flex flex-col gap-4 animate-in slide-in-from-top-4">
          <Link href="#services" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-300 py-1">Services</Link>
          <Link href="#work" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-300 py-1">Selected Work</Link>
          <Link href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-300 py-1">About Me</Link>
          <Link href="#process" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-300 py-1">Process</Link>
          <Link href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-300 py-1">Testimonials</Link>
          <Link href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-300 py-1">Contact</Link>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-800 text-slate-200 border border-slate-700"
            >
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Studio CMS Dashboard</span>
            </Link>
            <Link
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold gradient-bg text-white"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
