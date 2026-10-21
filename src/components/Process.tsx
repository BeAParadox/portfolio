export default function Process() {
  const steps = [
    {
      num: '01',
      badge: 'Week 1',
      title: 'Discovery & Strategy',
      desc: 'We unpack your business objectives, target demographics, brand identity, and site architecture to build a watertight creative strategy.',
      deliverables: 'Creative brief, sitemap, content outline, technical roadmap.'
    },
    {
      num: '02',
      badge: 'Weeks 2–3',
      title: 'Wireframing & UI Design',
      desc: 'I produce clickable Figma wireframes and high-fidelity mockups. You see and test how the site looks on desktop and mobile before writing any code.',
      deliverables: 'Clickable Figma prototype, visual design system, 2 review rounds.'
    },
    {
      num: '03',
      badge: 'Weeks 4–5',
      title: 'Clean Development',
      desc: 'I write clean, semantic, and performant Next.js code. Features, animations, CMS fields, and contact forms are tested across Safari, Chrome, iOS, and Android.',
      deliverables: 'Private staging URL for review, cross-browser validation, accessibility audit.'
    },
    {
      num: '04',
      badge: 'Week 6 & Beyond',
      title: 'Launch & Handover',
      desc: 'We execute a seamless launch: domain configuration, SSL, SEO metadata setup, and analytics integration. Plus, 30 days of post-launch warranty support.',
      deliverables: 'Live production deployment, video CMS walkthrough tutorial, 30-day warranty.'
    }
  ];

  return (
    <section id="process" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            How It Works
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground mb-4">
            A Structured, Transparent 4-Step Process
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            From our initial brainstorm to final DNS launch, here is how we collaborate to bring your website to life on schedule and without stress.
          </p>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-7 rounded-2xl bg-surface border border-surface-border hover:border-indigo-500/40 hover:-translate-y-1 transition-all flex flex-col shadow-lg shadow-black/10 relative"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-indigo-500 text-indigo-400 font-mono font-extrabold text-sm flex items-center justify-center shadow-md shadow-indigo-500/20">
                  {step.num}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {step.badge}
                </span>
              </div>

              <h3 className="font-display font-bold text-xl text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 flex-grow">
                {step.desc}
              </p>

              <div className="mt-auto pt-4 border-t border-surface-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Deliverables
                </span>
                <span className="text-xs font-medium text-slate-300 block">
                  {step.deliverables}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
