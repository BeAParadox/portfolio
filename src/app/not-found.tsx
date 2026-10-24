import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md w-full text-center">
        {/* Glow */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-3xl gradient-bg text-white font-mono font-black text-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/30">
            404
          </div>
        </div>

        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
          Page Not Found
        </span>

        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mb-3">
          Lost in Cyberspace?
        </h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          The page or case study you are looking for has been moved, renamed, or doesn&apos;t exist.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold gradient-bg text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Portfolio</span>
          </Link>
          <Link
            href="/#work"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-surface hover:bg-surface-hover text-foreground border border-surface-border transition-all"
          >
            <Search className="w-4 h-4 text-indigo-400" />
            <span>Browse Projects</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
