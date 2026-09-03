import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const INTEGRATIONS = [
  {
    name: "RSS / Atom",
    icon: "📡",
    description: "Pull from any public feed",
  },
  {
    name: "WordPress",
    icon: "🌐",
    description: "Direct CMS publishing via API",
  },
];

export function IntegrationsSection() {
  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
          {/* Left text */}
          <div className="flex-1 flex flex-col gap-5">
            <div>
              <span className="inline-block text-xs font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-3">
                Integrations
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Seamless Integrations
              </h2>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-sm">
                Connect to the tools you already use. Zerodraft plugs directly
                into your RSS sources and CMS with zero friction.
              </p>
            </div>
            <Button className="w-fit rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm px-5">
              View all integrations
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {/* Right integration cards */}
          <div className="flex flex-col gap-4 w-full md:w-64">
            {INTEGRATIONS.map((integ) => (
              <div
                key={integ.name}
                className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-xl">
                  {integ.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {integ.name}
                  </p>
                  <p className="text-xs text-slate-400">{integ.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}