'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime errors to monitoring service in production
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md w-full p-8 rounded-3xl bg-surface border border-surface-border text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="font-display font-extrabold text-2xl text-foreground mb-2">
          Something went wrong
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
          An unexpected application error occurred. You can attempt to refresh the component or return to the home page.
        </p>

        {error.digest && (
          <div className="text-[11px] font-mono text-slate-500 bg-slate-900/60 p-2 rounded-lg border border-slate-800 mb-6">
            Error Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold gradient-bg text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-surface hover:bg-surface-hover text-foreground border border-surface-border transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
