import { Rss, Layers, Globe, RefreshCw } from "lucide-react";

const FEATURES = [
  {
    icon: Rss,
    title: "Automated RSS Collection",
    description:
      "Connect any RSS feed and let the system automatically pull fresh content on your schedule — hourly, daily, or custom intervals.",
    color: "bg-indigo-50 text-indigo-500",
  },
  {
    icon: Layers,
    title: "AI Editorial Clustering",
    description:
      "Our AI groups related articles into coherent themes and generates editorial-quality drafts tailored to your audience.",
    color: "bg-violet-50 text-violet-500",
  },
  {
    icon: Globe,
    title: "Direct CMS Publishing",
    description:
      "Publish polished articles directly to WordPress with one click — no copy-paste, no reformatting, no manual work.",
    color: "bg-sky-50 text-sky-500",
  },
  {
    icon: RefreshCw,
    title: "Automated Monitoring",
    description:
      "Real-time job logs, failure alerts, and automatic retries keep your publishing pipeline running without intervention.",
    color: "bg-emerald-50 text-emerald-500",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-14">
        {/* Header */}
        <div className="text-center max-w-2xl flex flex-col items-center gap-4">
          <span className="inline-block text-xs font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Features
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Powerful Automation For{" "}
            <span className="text-indigo-500">AI-Driven Publishing</span>
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            Everything you need to run a fully automated editorial pipeline —
            from raw RSS feeds to published articles.
          </p>
        </div>

        {/* 2×2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group rounded-2xl border border-slate-100 bg-slate-50/60 p-6 hover:shadow-md hover:border-indigo-100 transition-all duration-200"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${feat.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}