export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="w-14 h-14 rounded-2xl gradient-bg opacity-30 animate-ping absolute inset-0" />
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white font-mono font-bold text-lg shadow-xl shadow-indigo-500/25 relative animate-pulse">
            &lt;/&gt;
          </div>
        </div>
        <span className="text-xs font-mono uppercase tracking-widest text-slate-500 animate-pulse">
          Loading Portfolio...
        </span>
      </div>
    </div>
  );
}
