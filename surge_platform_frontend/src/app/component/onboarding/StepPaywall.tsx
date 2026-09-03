"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type PlanId = "starter" | "pro" | "enterprise";
export type BillingInterval = "monthly" | "yearly";

export interface PlanTier {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  isPopular?: boolean;
  features: string[];
}

export const PLAN_TIERS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 19,
    yearlyPrice: 15,
    description: "Great for getting started.",
    features: [
      "5 RSS Feeds",
      "3 Publishing Channels",
      "50 Monthly Posts",
      "Daily Publishing",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: "Best for growing content creators.",
    isPopular: true,
    features: [
      "20 RSS Feeds",
      "10 Publishing Channels",
      "200 Monthly Posts",
      "Priority AI Generation",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 99,
    yearlyPrice: 79,
    description: "For agencies & high-volume publishers.",
    features: [
      "50 RSS Feeds",
      "25 Publishing Channels",
      "1,000 Monthly Posts",
      "Multiple Daily Runs",
    ],
  },
];

interface StepPaywallProps {
  onSelectPlan: (plan: PlanTier, interval: BillingInterval) => void;
  defaultPlanId?: PlanId;
  defaultInterval?: BillingInterval;
}

export function StepPaywall({
  onSelectPlan,
  defaultInterval = "monthly",
}: StepPaywallProps) {
  const [interval, setInterval] = useState<BillingInterval>(defaultInterval);

  const isYearly = interval === "yearly";

  const handleChoosePlan = (plan: PlanTier) => {
    onSelectPlan(plan, interval);
  };

  return (
    <div className="flex flex-col items-center justify-between w-full">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Activate Your Automation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2.5">
          Your system is ready to start publishing. Choose a plan to begin.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span
            className={cn(
              "text-xs font-semibold transition-colors cursor-pointer",
              !isYearly ? "text-slate-900" : "text-slate-400"
            )}
            onClick={() => setInterval("monthly")}
          >
            Monthly
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={(checked) => setInterval(checked ? "yearly" : "monthly")}
            className="data-[state=checked]:bg-[#1868F2]"
          />
          <span
            className={cn(
              "text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1",
              isYearly ? "text-slate-900" : "text-slate-400"
            )}
            onClick={() => setInterval("yearly")}
          >
            Yearly
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-6 items-stretch">
        {PLAN_TIERS.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

          if (plan.isPopular) {
            return (
              <div key={plan.id} className="h-full flex flex-col">
                <div className="flex flex-col rounded-[28px] bg-[#1868F2] p-[3px] shadow-lg flex-1 select-none">
                  {/* Most Popular Label (Outside of the white main card) */}
                  <div className="h-8 flex items-center justify-center text-white text-xs font-semibold tracking-normal select-none">
                    Most Popular
                  </div>

                  {/* Inner White Card - exactly matching height with Starter & Enterprise */}
                  <div className="bg-white rounded-[24px] p-6 sm:p-7 flex flex-col justify-between flex-1">
                    <div className="flex flex-col">
                      <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>

                      <div className="flex items-baseline gap-1.5 mt-2">
                        <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                          ${price}
                        </span>
                        <span className="text-xs font-normal text-slate-400">/month</span>
                      </div>

                      <p className="text-xs text-slate-400 mt-2 mb-6">{plan.description}</p>

                      {/* What's Included */}
                      <div>
                        <p className="text-xs font-bold text-slate-900 mb-3">
                          What&apos;s included
                        </p>
                        <ul className="flex flex-col gap-3">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-600 font-normal">
                              <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                              </div>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Button */}
                    <div className="mt-8 pt-2">
                      <Button
                        type="button"
                        onClick={() => handleChoosePlan(plan)}
                        className="w-full h-11 rounded-[14px] text-sm font-semibold bg-[#1868F2] hover:bg-[#1456CC] text-white shadow-xs transition-all cursor-pointer"
                      >
                        Get Started
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={plan.id} className="h-full flex flex-col md:pt-8">
              <div className="rounded-[28px] bg-white p-6 sm:p-7 border border-slate-200/60 shadow-xs flex flex-col justify-between flex-1 transition-all duration-200 select-none">
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>

                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      ${price}
                    </span>
                    <span className="text-xs font-normal text-slate-400">/month</span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 mb-6">{plan.description}</p>

                  {/* What's Included */}
                  <div>
                    <p className="text-xs font-bold text-slate-900 mb-3">
                      What&apos;s included
                    </p>
                    <ul className="flex flex-col gap-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-600 font-normal">
                          <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Button */}
                <div className="mt-8 pt-2">
                  <Button
                    type="button"
                    onClick={() => handleChoosePlan(plan)}
                    className="w-full h-11 rounded-[14px] text-sm font-semibold bg-[#1868F2] hover:bg-[#1456CC] text-white shadow-xs transition-all cursor-pointer"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

