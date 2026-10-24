import Link from 'next/link';
import { Palette, Code, Smartphone, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { Service } from '@/lib/types';

interface ServicesProps {
  services: Service[];
}

const serviceIcons: Record<string, React.ReactNode> = {
  'serv-1': <Palette className="w-6 h-6 text-indigo-400" />,
  'serv-2': <Code className="w-6 h-6 text-indigo-400" />,
  'serv-3': <Smartphone className="w-6 h-6 text-indigo-400" />,
  'serv-4': <ShieldCheck className="w-6 h-6 text-indigo-400" />,
};

export default function Services({ services }: ServicesProps) {
  return (
    <section id="services" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            Services
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground mb-4">
            Specialized Web Solutions for Growing Brands
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            From bespoke Figma designs to full-stack Next.js engineering, I provide end-to-end digital solutions tailored to your unique business goals.
          </p>
        </div>

        {/* Services 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => (
            <div
              key={service.id || index}
              className="group p-8 rounded-2xl bg-surface border border-surface-border hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col shadow-lg shadow-black/10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {serviceIcons[service.id] || <Palette className="w-6 h-6 text-indigo-400" />}
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700/60">
                  {service.price}
                </span>
              </div>

              <h3 className="font-display font-bold text-2xl text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                {service.description}
              </p>

              <div className="mt-auto pt-6 border-t border-surface-border flex flex-col gap-2.5 mb-6">
                {(Array.isArray(service.deliverables) ? service.deliverables : []).map((item, dIdx) => (
                  <div key={dIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="#contact"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-400 group-hover:text-indigo-300 group-hover:gap-2.5 transition-all"
              >
                <span>Inquire about this</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Solo Freelancer Advantage Card */}
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-surface to-slate-900/80 border border-surface-border shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 block">
                The Advantage
              </span>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-foreground leading-snug">
                Why work directly with a solo specialist?
              </h3>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">Direct Communication</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">No account managers or middle-men. You collaborate directly with the creator.</p>
                </div>
              </div>
              <div className="flex gap-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">Transparent Pricing</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Zero bloated agency overhead. You pay strictly for high-caliber design &amp; code.</p>
                </div>
              </div>
              <div className="flex gap-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">Agile Speed</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Decisions and iterations happen in hours, not months. Fast and responsive feedback loops.</p>
                </div>
              </div>
              <div className="flex gap-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">Unified Vision</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Because I design and write the code, nothing is ever lost in translation from Figma to Next.js.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
