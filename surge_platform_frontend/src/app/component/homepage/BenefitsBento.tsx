import {
  Zap,
  BarChart2,
  Eye,
  Calendar,
  Clock,
  Shield,
} from "lucide-react";

const BENEFITS = [
  {
    icon: Zap,
    title: "Automate of Hours of Work",
    description:
      "What used to take a team of writers hours now happens automatically every morning before you wake up.",
  },
  {
    icon: BarChart2,
    title: "Maintain Publishing Consistency",
    description:
      "Never miss a publishing day. Automated schedules ensure content goes out reliably, every single time.",
  },
  {
    icon: Eye,
    title: "Contextual AI Insights",
    description:
      "AI identifies trending topics across your feeds and clusters them into meaningful editorial themes.",
  },
  {
    icon: Calendar,
    title: "Full Automation and Monitoring",
    description:
      "Set it and forget it. Job logs, retry mechanisms, and email alerts keep you informed without interruption.",
  },
  {
    icon: Clock,
    title: "Scales Without Any New Hires",
    description:
      "Grow from 1 article a day to 50 without adding headcount. Your editorial engine scales infinitely.",
  },
  {
    icon: Shield,
    title: "Stay In Control",
    description:
      "Review, edit, or override any article before it publishes. Full transparency at every step.",
  },
];

export function BenefitsBento() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-14">
        {/* Header */}
        <div className="text-center max-w-2xl flex flex-col items-center gap-4">
          <span className="inline-block text-xs font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Benefits
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Content Publishing Fully{" "}
            <span className="text-indigo-500">On Autopilot</span>
          </h2>
        </div>

        {/* 3×2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 flex flex-col gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-indigo-500 w-[18px] h-[18px]" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">{b.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}