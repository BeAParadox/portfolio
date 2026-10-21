'use client';

import { useState } from 'react';
import { Mail, Clock, Calendar, Check, Copy, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Profile } from '@/lib/types';

interface ContactProps {
  profile: Profile;
}

export default function Contact({ profile }: ContactProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serviceType, setServiceType] = useState('New Website');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    budget: '$4,000 – $7,000',
    message: ''
  });

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email || 'hello@yourname.dev');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          serviceType
        })
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Error submitting inquiry:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            Let&apos;s Connect
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground mb-4">
            Ready to Bring Your Vision to Life?
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Whether you have a fully scoped project or are just exploring possibilities, let&apos;s discuss how we can build something remarkable together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-8 rounded-3xl bg-surface border border-surface-border shadow-xl flex flex-col gap-6">
              
              {/* Email Item */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Email Directly
                  </h4>
                  <div className="flex items-center gap-3">
                    <a
                      href={`mailto:${profile.email || 'hello@yourname.dev'}`}
                      className="text-base font-bold text-foreground hover:text-indigo-400 transition-colors"
                    >
                      {profile.email || 'hello@yourname.dev'}
                    </a>
                    <button
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                      title="Copy email to clipboard"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Location & Timezone */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Location &amp; Working Hours
                  </h4>
                  <p className="text-sm font-semibold text-foreground">
                    {profile.location || '[City, Country]'} ({profile.timezone || 'UTC-5 / Eastern'})
                  </p>
                  <p className="text-xs text-slate-400">Typical response time: under 24 hours</p>
                </div>
              </div>

              {/* Booking Status */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Current Booking Status
                  </h4>
                  <p className="text-sm font-bold text-emerald-400">
                    ● Accepting new clients for Q1/Q2
                  </p>
                  <p className="text-xs text-slate-400">Typical project duration: 3 to 6 weeks</p>
                </div>
              </div>

            </div>

            {/* Mini FAQ Box */}
            <div className="p-7 rounded-2xl bg-surface border border-surface-border">
              <h4 className="font-bold text-sm text-foreground mb-4">Frequently Asked Questions</h4>
              <div className="flex flex-col gap-4 text-xs sm:text-sm">
                <div>
                  <strong className="text-foreground block mb-0.5">What does a typical project cost?</strong>
                  <span className="text-slate-400">Custom web projects generally range from $2,000 to $6,000 depending on complexity. Fixed-price proposals are provided before kickoff.</span>
                </div>
                <div>
                  <strong className="text-foreground block mb-0.5">How do payment terms work?</strong>
                  <span className="text-slate-400">Typically a 50% deposit upon kickoff, and the remaining 50% upon final sign-off before your domain goes live.</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-surface border border-surface-border shadow-xl">
              
              {!submitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="clientName" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="clientName"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="clientEmail" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="clientEmail"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. sarah@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="clientCompany" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Company or Current Website (Optional)
                    </label>
                    <input
                      type="text"
                      id="clientCompany"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Acme Corp or acme.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Service Pills */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      What service are you looking for?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['New Website', 'Website Redesign', 'Front-End / Dev Only', 'Care Plan'].map((type) => (
                        <button
                          type="button"
                          key={type}
                          onClick={() => setServiceType(type)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                            serviceType === type
                              ? 'gradient-bg text-white shadow-sm'
                              : 'bg-slate-900/60 text-slate-400 border border-slate-700/60 hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget Selector */}
                  <div>
                    <label htmlFor="clientBudget" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Approximate Budget (USD)
                    </label>
                    <select
                      id="clientBudget"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    >
                      <option value="$2,000 – $4,000">$2,000 – $4,000</option>
                      <option value="$4,000 – $7,000">$4,000 – $7,000</option>
                      <option value="$7,000 – $12,000">$7,000 – $12,000</option>
                      <option value="$12,000+">$12,000+</option>
                      <option value="Flexible / Let's discuss">Flexible / Let&apos;s discuss</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="clientMessage" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Project Details &amp; Goals *
                    </label>
                    <textarea
                      id="clientMessage"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell me about your business goals, target launch date, and any specific features you need..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-full text-base font-bold gradient-bg text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Project Inquiry</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-500 text-center">
                    🔒 Your privacy is respected. No spam, ever.
                  </p>
                </form>
              ) : (
                <div className="py-12 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-extrabold text-2xl text-foreground mb-3">
                    Inquiry Received!
                  </h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-8">
                    Thank you for reaching out. I have received your project details and will review them thoroughly. You&apos;ll hear back from me within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', company: '', budget: '$4,000 – $7,000', message: '' });
                    }}
                    className="px-6 py-2.5 rounded-full text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    Send another inquiry
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
