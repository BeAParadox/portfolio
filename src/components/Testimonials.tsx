import { Star } from 'lucide-react';
import { Testimonial } from '@/lib/types';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <section id="testimonials" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            Testimonials
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground mb-4">
            What Clients Say About Working Together
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Honest feedback from founders, creative directors, and business owners who trusted me with their online presence.
          </p>
        </div>

        {/* Testimonials 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {testimonials.map((test, idx) => (
            <div
              key={test.id || idx}
              className="p-8 rounded-2xl bg-surface border border-surface-border hover:border-indigo-500/40 hover:-translate-y-1 transition-all flex flex-col shadow-lg shadow-black/10"
            >
              {/* Star Rating */}
              <div className="flex gap-1 text-amber-400 mb-6" aria-label={`${test.rating || 5} out of 5 stars`}>
                {Array.from({ length: test.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-sm sm:text-base text-slate-300 italic leading-relaxed mb-6 flex-grow">
                &ldquo;{test.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="pt-4 border-t border-surface-border flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full gradient-bg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                  {test.initials || 'CL'}
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">{test.name}</div>
                  <div className="text-xs text-slate-400">{test.role}, {test.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-500 italic">
          💡 Note: The testimonials above are editable placeholder examples. You can manage, add, or replace them anytime in the Studio CMS dashboard.
        </p>

      </div>
    </section>
  );
}
