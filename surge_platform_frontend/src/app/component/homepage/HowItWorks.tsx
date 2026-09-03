import { Rss, Cpu, Send } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Rss,
    title: "Connect Your RSS Feeds",
    description:
      "Add any RSS feed URL. We validate, monitor, and pull fresh content on your schedule.",
    mockup: (
      <div className="mt-4 rounded-xl bg-white border border-slate-100 shadow-sm p-4">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
          RSS Feed URL
        </p>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Rss className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs text-slate-400">https://example…</span>
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          {["techcrunch.com/feed", "vercel.com/blog/feed"].map((f) => (
            <div
              key={f}
              className="flex items-center gap-2 text-[10px] text-slate-500"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {f}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Identifies Key Topics",
    description:
      "Our AI reads, clusters, and synthesises your feed content into unique editorial themes.",
    mockup: (
      <div className="mt-4 rounded-xl bg-white border border-slate-100 shadow-sm p-4">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Topic clusters
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[
            "AI Tools",
            "Developer News",
            "CSS Updates",
            "Open Source",
            "Web Perf",
          ].map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold bg-indigo-50 text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-indigo-400 rounded-full" />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">8 articles clustered</p>
      </div>
    ),
  },
  {
    number: "03",
    icon: Send,
    title: "Generate and Publish",
    description:
      "AI writes the article and publishes directly to WordPress — no manual steps required.",
    mockup: (
      <div className="mt-4 rounded-xl bg-white border border-slate-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Publishing
          </p>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            Live
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { title: "Why AI Is Changing Dev", status: "published" },
            { title: "State of CSS 2024", status: "published" },
            { title: "React Server Comps", status: "queued" },
          ].map((a) => (
            <div
              key={a.title}
              className="flex items-center gap-2 text-[10px] text-slate-500"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  a.status === "published"
                    ? "bg-emerald-400"
                    : "bg-slate-200"
                }`}
              />
              <span className="truncate">{a.title}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-14">
        {/* Header */}
        <div className="text-center max-w-2xl flex flex-col items-center gap-4">
          <span className="inline-block text-xs font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            How it works
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Three Simple Steps To{" "}
            <span className="text-indigo-500">Automated Publishing</span>
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            Get up and running in minutes. No technical expertise required.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="rounded-2xl bg-slate-50 border border-slate-100 p-6 flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-black text-slate-100">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.description}
                </p>
                {step.mockup}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}