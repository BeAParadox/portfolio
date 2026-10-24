'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { Project } from '@/lib/types';

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter(p => {
    if (activeFilter === 'all') return true;
    return p.category?.toLowerCase().includes(activeFilter.toLowerCase());
  });

  return (
    <section id="work" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            Selected Work
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground mb-4">
            Recent Client Projects &amp; Case Studies
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            A curated selection of high-impact websites, responsive web apps, and digital storefronts engineered for performance and real business outcomes.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
          {[
            { id: 'all', label: `All Projects (${projects.length})` },
            { id: 'web-design', label: 'Web Design' },
            { id: 'development', label: 'Development' },
            { id: 'ecommerce', label: 'E-Commerce' },
            { id: 'redesign', label: 'Redesigns' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === tab.id
                  ? 'gradient-bg text-white shadow-md shadow-indigo-500/30'
                  : 'bg-surface hover:bg-surface-hover text-slate-400 hover:text-foreground border border-surface-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Projects 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="group rounded-2xl bg-surface border border-surface-border hover:border-indigo-500/40 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col shadow-lg shadow-black/10"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                <Image
                  src={project.image || '/images/project-1.svg'}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {project.badge && (
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 backdrop-blur-md text-white border border-white/10 shadow-sm">
                    {project.badge}
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-7 flex flex-col flex-grow">
                {/* Tech Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {(Array.isArray(project.tags) ? project.tags : []).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="font-display font-bold text-xl sm:text-2xl text-foreground mb-3 leading-snug">
                  {project.title}
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-grow">
                  {project.summary}
                </p>

                {/* Outcome Pill */}
                {project.outcome && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs sm:text-sm font-semibold text-foreground mb-6">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{project.outcome}</span>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>View Case Study</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-foreground transition-colors"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>

      {/* Case Study Modal Dialog */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-surface border border-surface-border shadow-2xl p-6 sm:p-10">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Close case study modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header Image */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8 border border-surface-border bg-slate-950">
              <Image
                src={selectedProject.image || '/images/project-1.svg'}
                alt={selectedProject.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(selectedProject.tags || []).map((tag, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground mb-4 leading-tight">
              {selectedProject.title}
            </h2>

            {/* Metadata Bar */}
            <div className="flex flex-wrap gap-6 text-xs sm:text-sm text-slate-400 pb-6 mb-6 border-b border-surface-border">
              <div><strong className="text-foreground">Client:</strong> {selectedProject.client || 'Confidential'}</div>
              <div><strong className="text-foreground">Timeline:</strong> {selectedProject.timeline || '5 Weeks'}</div>
              <div><strong className="text-foreground">Category:</strong> {selectedProject.category}</div>
            </div>

            {/* Problem & Solution */}
            {selectedProject.problem && (
              <div className="mb-6">
                <h4 className="font-bold text-base text-foreground mb-2">The Challenge</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedProject.problem}</p>
              </div>
            )}

            {selectedProject.solution && (
              <div className="mb-6">
                <h4 className="font-bold text-base text-foreground mb-2">The Solution &amp; Engineering</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedProject.solution}</p>
              </div>
            )}

            {/* Key Business Results */}
            {Array.isArray(selectedProject.results) && selectedProject.results.length > 0 && (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-surface-border mb-8">
                <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Key Business Results
                </h4>
                <ul className="flex flex-col gap-2">
                  {selectedProject.results.map((res, rIdx) => (
                    <li key={rIdx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{res}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer Modal CTA */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-surface-border">
              <Link
                href="#contact"
                onClick={() => setSelectedProject(null)}
                className="px-6 py-3 rounded-full text-sm font-bold gradient-bg text-white shadow-md shadow-indigo-500/20"
              >
                Discuss a Similar Project
              </Link>
              {selectedProject.liveUrl && (
                <a
                  href={selectedProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 inline-flex items-center gap-2"
                >
                  <span>Simulate Live Demo</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
