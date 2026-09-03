const LOGOS = [
  { name: "Loom", style: "font-black tracking-tighter" },
  { name: "LOCTIO", style: "font-mono font-bold tracking-widest" },
  { name: "Loopteam", style: "font-semibold italic" },
  { name: "⌀⌀⌀", style: "font-mono text-lg" },
  { name: "Orbit", style: "font-light tracking-widest uppercase text-xs" },
];

export function TrustedBy() {
  return (
    <section className="py-14 bg-white border-y border-slate-100">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-8">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Trusted by fast-growing teams
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
          {LOGOS.map((logo) => (
            <span
              key={logo.name}
              className={`text-slate-300 hover:text-slate-500 transition-colors text-base select-none ${logo.style}`}
            >
              {logo.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}