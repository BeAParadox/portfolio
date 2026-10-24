import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Clock, Github, Linkedin, Twitter, Dribbble, ArrowRight, Download } from 'lucide-react';
import { Profile } from '@/lib/types';

interface AboutProps {
  profile: Profile;
}

export default function About({ profile }: AboutProps) {
  const pillars = profile.pillars && profile.pillars.length > 0 ? profile.pillars : [
    { title: 'User-Centric Intent', desc: 'Layout, hierarchy, and micro-interactions planned around conversion.' },
    { title: 'Speed as a Feature', desc: 'Blazing-fast load times, 95+ Core Web Vitals, zero bloat.' },
    { title: 'Radical Reliability', desc: 'Fixed milestones, weekly Loom updates, no surprise costs.' },
    { title: 'Inclusive & Accessible', desc: 'Engineered according to WCAG 2.1 AA accessibility guidelines.' }
  ];

  const skills = profile.skills && profile.skills.length > 0 ? profile.skills : [
    'Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'Figma', 'Node.js',
    'REST & GraphQL APIs', 'Shopify Liquid', 'WordPress / CMS', 'SEO Optimization', 'Git / GitHub', 'WCAG 2.1 AA'
  ];

  return (
    <section id="about" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Avatar & Profile Card */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-3xl bg-surface border border-surface-border text-center shadow-xl relative">
              <div className="relative w-44 h-44 mx-auto mb-6">
                <Image
                  src={profile.avatarUrl || '/images/avatar.svg'}
                  alt={`Portrait of ${profile.name || 'Developer'}`}
                  fill
                  className="rounded-full object-cover border-4 border-slate-800 shadow-xl shadow-indigo-500/20"
                />
              </div>

              <h3 className="font-display font-bold text-2xl text-foreground mb-1">
                {profile.name || '[Your Name]'}
              </h3>
              <p className="text-sm font-semibold text-indigo-400 mb-6">
                {profile.role || 'Freelance Web Designer & Developer'}
              </p>

              <div className="flex flex-col gap-3 py-6 border-y border-surface-border text-left mb-6">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{profile.location || '[City, Country]'} · Remote Worldwide</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{profile.experience || '5+ Years Experience'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{profile.timezone || 'UTC-5 (EST) / Global Flexibility'}</span>
                </div>
              </div>

              {/* Social Profiles */}
              <div className="flex items-center justify-center gap-3">
                {profile.socials?.github && (
                  <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-500 transition-colors" aria-label="GitHub">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {profile.socials?.linkedin && (
                  <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-500 transition-colors" aria-label="LinkedIn">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {profile.socials?.twitter && (
                  <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-500 transition-colors" aria-label="Twitter">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {profile.socials?.dribbble && (
                  <a href={profile.socials.dribbble} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-500 transition-colors" aria-label="Dribbble">
                    <Dribbble className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Core Principles */}
          <div className="lg:col-span-7">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
              About Me
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mb-6 leading-tight">
              Bridging the Gap Between Design &amp; Full-Stack Code
            </h2>

            <div className="space-y-4 text-base text-slate-300 leading-relaxed mb-8">
              {profile.bio ? (
                <p>{profile.bio}</p>
              ) : (
                <>
                  <p>
                    I am a multidisciplinary web creator with over <strong>{profile.experience || '5+ years'}</strong> of experience turning complex brand requirements into bespoke, user-centric web applications.
                  </p>
                  <p>
                    Most clients struggle with a dilemma: designers who build pretty wireframes that are impossible to build, or developers who write functional code that looks neglected. <strong>I bring both disciplines under one roof.</strong> That means cohesive aesthetics, pixel-perfect execution, and clean Next.js code that loads in under 1 second.
                  </p>
                </>
              )}
            </div>

            {/* Dynamic Core Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {pillars.map((pillar, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-surface border border-surface-border">
                  <h4 className="font-bold text-sm text-foreground mb-1">{pillar.title}</h4>
                  <p className="text-xs text-slate-400">{pillar.desc}</p>
                </div>
              ))}
            </div>

            {/* Dynamic Tech Stack Pills */}
            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Core Toolstack
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-md text-xs font-mono font-medium bg-slate-800/80 text-slate-200 border border-slate-700/60"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold gradient-bg text-white shadow-md shadow-indigo-500/25"
              >
                <span>Work with me</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`mailto:${profile.email || 'hello@yourname.dev'}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-surface hover:bg-surface-hover text-foreground border border-surface-border"
              >
                <Download className="w-4 h-4" />
                <span>Download Credentials</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
