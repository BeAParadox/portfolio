import Link from 'next/link';
import { ArrowDown, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Profile } from '@/lib/types';

interface HeroProps {
  profile: Profile;
}

export default function Hero({ profile }: HeroProps) {
  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6 text-center">
        
        {/* Availability Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs sm:text-sm font-semibold mb-8 animate-fade-in">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>{profile.availability || 'Available for new projects · Q1/Q2 Booking'}</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.15] text-foreground mb-6">
          {profile.headline ? (
            profile.headline
          ) : (
            <>
              Designing &amp; building{' '}
              <span className="gradient-text">high-converting websites</span>{' '}
              that elevate your brand.
            </>
          )}
        </h1>

        {/* Short Introduction */}
        <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          {profile.intro ? (
            profile.intro
          ) : (
            <>
              Hi, I&apos;m <strong className="text-foreground">{profile.name || '[Your Name]'}</strong> — an independent freelance web designer and full-stack developer based in <strong className="text-foreground">{profile.location || '[City, Country]'}</strong>. I partner with ambitious businesses and founders to craft bespoke, ultra-fast websites that look stunning and drive measurable growth.
            </>
          )}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="#work"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold gradient-bg text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
          >
            <span>View my work</span>
            <ArrowDown className="w-4 h-4" />
          </Link>
          <Link
            href="#contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold bg-surface hover:bg-surface-hover text-foreground border border-surface-border shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <span>Let&apos;s talk</span>
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </Link>
        </div>

        {/* Trust Highlights Mini-List */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-400 mb-16">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            Free 30-min strategy call
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            Transparent fixed-price proposals
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            100% responsive &amp; SEO-ready
          </span>
        </div>

        {/* Social Proof Stats Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 sm:p-8 rounded-2xl bg-surface/80 border border-surface-border shadow-xl backdrop-blur-md">
          {(profile.stats && profile.stats.length > 0 ? profile.stats : [
            { value: "5+", label: "Years of Experience" },
            { value: "40+", label: "Websites Delivered" },
            { value: "99.8%", label: "Client Satisfaction" },
            { value: "100%", label: "On-Time Delivery" }
          ]).map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="font-display font-black text-3xl sm:text-4xl text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
