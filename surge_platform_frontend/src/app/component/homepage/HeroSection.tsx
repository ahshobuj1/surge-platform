import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rss, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-4 overflow-hidden bg-gradient-to-b from-slate-50 via-indigo-50/40 to-white">
      {/* Background dot grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Soft glow blob */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto gap-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full">
          <Sparkles className="w-3 h-3" />
          AI-Powered Content Automation
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
          Your Autonomous AI{" "}
          <span className="text-indigo-500">Editorial Engine</span>
        </h1>

        {/* Sub */}
        <p className="text-base md:text-lg text-slate-500 max-w-xl leading-relaxed">
          Automatically collect, cluster, and publish AI-written articles from
          your RSS feeds — directly to your WordPress site, every single day.
        </p>

        {/* CTA row */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Button
            size="lg"
            className="rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 shadow-md shadow-indigo-200"
          >
            Get started free
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Link
            href="#how-it-works"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors underline-offset-4 hover:underline"
          >
            See how it works
          </Link>
        </div>

        {/* Mini trust line */}
        <p className="text-xs text-slate-400 font-medium">
          No credit card required · Setup in 5 minutes
        </p>
      </div>

      {/* Dashboard preview mockup */}
      <div className="relative z-10 mt-14 w-full max-w-4xl mx-auto">
        <div className="rounded-2xl border border-slate-200 shadow-2xl shadow-indigo-100/60 overflow-hidden bg-white">
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
            <div className="ml-3 flex-1 bg-slate-100 rounded-md h-5 max-w-xs" />
          </div>

          {/* Mock dashboard body */}
          <div className="flex bg-gradient-to-br from-slate-50 to-indigo-50/30 min-h-[280px]">
            {/* Sidebar */}
            <div className="w-32 border-r border-slate-100 bg-white/60 p-4 flex flex-col gap-3">
              <div className="h-3 w-16 bg-slate-800 rounded-full" />
              <div className="mt-2 flex flex-col gap-2">
                <div className="h-7 w-full bg-indigo-500 rounded-lg" />
                <div className="h-7 w-full bg-slate-100 rounded-lg" />
                <div className="h-7 w-full bg-slate-100 rounded-lg" />
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-5 flex flex-col gap-4">
              <div className="h-4 w-24 bg-slate-300 rounded-full" />

              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-3">
                {["System Status", "Last Run", "Next Run", "Published"].map(
                  (label, i) => (
                    <div
                      key={label}
                      className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm"
                    >
                      <div className="h-2 w-16 bg-slate-200 rounded-full mb-2" />
                      <div
                        className={`h-4 w-12 rounded-full ${
                          i === 0
                            ? "bg-emerald-200"
                            : "bg-indigo-200"
                        }`}
                      />
                    </div>
                  )
                )}
              </div>

              {/* Table mock */}
              <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col gap-2">
                <div className="h-3 w-32 bg-slate-300 rounded-full mb-1" />
                {[
                  "emerald",
                  "emerald",
                  "red",
                  "amber",
                  "emerald",
                ].map((color, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0"
                  >
                    <div className="h-2.5 flex-1 bg-slate-100 rounded-full" />
                    <div className="h-2.5 w-14 bg-slate-100 rounded-full" />
                    <div
                      className={`h-4 w-16 rounded-full bg-${color}-100`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div className="w-40 border-l border-slate-100 p-4 flex flex-col gap-3">
              <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
                <div className="h-2.5 w-12 bg-slate-300 rounded-full mb-3" />
                {["done", "done", "running"].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-10 bg-slate-100 rounded-full" />
                    <div className="h-2 flex-1 bg-slate-100 rounded-full" />
                    <div
                      className={`w-2 h-2 rounded-full ${
                        s === "done" ? "bg-emerald-400" : "bg-indigo-300"
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-200 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <div className="h-2 w-20 bg-slate-200 rounded-full" />
                    <div className="h-1.5 w-16 bg-slate-100 rounded-full" />
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-200 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <div className="h-2 w-16 bg-slate-200 rounded-full" />
                    <div className="h-1.5 w-14 bg-slate-100 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}