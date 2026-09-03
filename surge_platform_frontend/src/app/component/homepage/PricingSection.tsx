"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Cycle = "Monthly" | "Annual";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 19,
    description: "Perfect for individual bloggers and small sites.",
    features: ["5 RSS feeds", "Daily publishing", "WordPress integration", "Email alerts"],
    cta: "Get started",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 49,
    description: "For growing teams that need more power and control.",
    features: [
      "20 RSS feeds",
      "Daily publishing",
      "WordPress integration",
      "Priority support",
      "Custom tone settings",
    ],
    cta: "Get started",
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 99,
    description: "For agencies and publishers at scale.",
    features: [
      "50 RSS feeds",
      "Multiple runs / day",
      "WordPress integration",
      "Team access",
      "API access",
      "Dedicated support",
    ],
    cta: "Get started",
    highlighted: false,
  },
];

export function PricingSection() {
  const [cycle, setCycle] = useState<Cycle>("Monthly");

  const getPrice = (monthly: number) =>
    cycle === "Annual" ? Math.round(monthly * 0.8) : monthly;

  return (
    <section id="pricing" className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-12">
        {/* Header */}
        <div className="text-center max-w-2xl flex flex-col items-center gap-4">
          <span className="inline-block text-xs font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Pricing
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Choose The Best{" "}
            <span className="text-indigo-500">Plan That Suites You</span>
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            Start free, scale when you're ready. No hidden fees.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center bg-slate-100 rounded-full p-1 gap-1">
          {(["Monthly", "Annual"] as Cycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={cn(
                "px-5 py-1.5 rounded-full text-sm font-semibold transition-all",
                cycle === c
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {c}
              {c === "Annual" && (
                <span className="ml-1.5 text-[10px] font-bold text-emerald-500">
                  -20%
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border p-7 flex flex-col gap-5 transition-all",
                plan.highlighted
                  ? "bg-indigo-500 border-indigo-500 text-white shadow-xl shadow-indigo-200 scale-105"
                  : "bg-white border-slate-100 text-slate-800 shadow-sm"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-indigo-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm border border-indigo-100">
                  Most Popular
                </div>
              )}

              <div>
                <p
                  className={cn(
                    "text-sm font-bold mb-1",
                    plan.highlighted ? "text-indigo-100" : "text-slate-500"
                  )}
                >
                  {plan.name}
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black">
                    ${getPrice(plan.monthlyPrice)}
                  </span>
                  <span
                    className={cn(
                      "text-sm mb-1 font-medium",
                      plan.highlighted ? "text-indigo-200" : "text-slate-400"
                    )}
                  >
                    /mo
                  </span>
                </div>
                <p
                  className={cn(
                    "text-xs mt-1 leading-relaxed",
                    plan.highlighted ? "text-indigo-200" : "text-slate-400"
                  )}
                >
                  {plan.description}
                </p>
              </div>

              <ul className="flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                        plan.highlighted
                          ? "bg-white/20"
                          : "bg-indigo-50"
                      )}
                    >
                      <Check
                        className={cn(
                          "w-2.5 h-2.5",
                          plan.highlighted ? "text-white" : "text-indigo-500"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        plan.highlighted ? "text-indigo-100" : "text-slate-600"
                      )}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "mt-auto rounded-xl text-sm font-semibold py-2.5",
                  plan.highlighted
                    ? "bg-white text-indigo-600 hover:bg-indigo-50"
                    : "bg-indigo-500 hover:bg-indigo-600 text-white"
                )}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}