"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api";

type BillingCycle = "Monthly" | "Annual";

interface Plan {
  id: "starter" | "pro" | "business";
  name: string;
  price: number;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 19,
    features: ["5 RSS feeds", "3 Publishing channels", "Daily publishing"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    features: ["20 RSS feeds", "10 Publishing channels", "Custom schedule & AI tone"],
  },
  {
    id: "business",
    name: "Business",
    price: 99,
    features: ["50 RSS feeds", "25 Publishing channels", "Multiple runs / day"],
  },
];

export function SettingsBilling() {
  const { company } = useAuth();
  const [cycle, setCycle] = useState<BillingCycle>("Monthly");
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const currentTier = company?.subscriptionTier || "starter";

  const handleUpgrade = async (planId: string) => {
    setUpgradingPlan(planId);
    setErrorMsg("");
    try {
      const res = await api.post<{ checkoutUrl: string }>("/companies/billing/checkout", {
        tier: planId,
        interval: cycle.toLowerCase(),
      });
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate Stripe checkout.");
    } finally {
      setUpgradingPlan(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {errorMsg && (
        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Current plan banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white shadow-md">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">
          Active Subscription
        </p>
        <p className="text-4xl font-bold mt-1 capitalize">
          {currentTier} Plan
        </p>
        <p className="text-xs text-indigo-200 mt-1">Managed securely via Stripe Billing</p>
      </div>

      {/* Plans comparison */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Available Plans
          </p>
          <div className="flex items-center bg-white border border-slate-200 rounded-full p-0.5 text-xs font-semibold">
            {(["Monthly", "Annual"] as BillingCycle[]).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className={cn(
                  "px-3 py-1 rounded-full transition-all",
                  cycle === c ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentTier;
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative bg-white rounded-2xl border p-5 flex flex-col gap-3 transition-all",
                  isCurrent ? "border-indigo-500 shadow-md ring-2 ring-indigo-500/20" : "border-slate-200 shadow-sm"
                )}
              >
                {isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full">
                    Current Plan
                  </div>
                )}
                <div>
                  <p className="text-base font-bold text-slate-900">{plan.name}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    ${cycle === "Annual" ? Math.round(plan.price * 0.8) : plan.price}
                    <span className="text-sm font-normal text-slate-500"> /mo</span>
                  </p>
                </div>
                <ul className="flex flex-col gap-1.5 my-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || upgradingPlan === plan.id}
                  variant={isCurrent ? "outline" : "default"}
                  size="sm"
                  className={cn(
                    "mt-auto rounded-xl text-xs font-semibold h-10",
                    isCurrent ? "border-slate-300 text-slate-500" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  )}
                >
                  {isCurrent
                    ? "Active Plan"
                    : upgradingPlan === plan.id
                    ? "Redirecting..."
                    : "Select Plan"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
