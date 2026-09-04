"use client";

import { useState, useEffect } from "react";
import { Check, Trash2, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import { api, ApiError } from "@/lib/api";

type BillingCycle = "Monthly" | "Annual";

interface SubscriptionDetails {
  tier: "starter" | "pro" | "business";
  tierName: string;
  status: string;
  limits: {
    maxRssSources: number;
    maxChannels: number;
    monthlyPosts: number;
  };
  usage: {
    rssFeeds: number;
    channels: number;
    postsCount: number;
  };
  stripeCustomerId: string | null;
}

interface PlanItem {
  id: "starter" | "pro" | "business";
  name: string;
  price: number;
  annualPrice: number;
  features: string[];
}

const PLANS: PlanItem[] = [
  {
    id: "starter",
    name: "Starter",
    price: 19,
    annualPrice: 15,
    features: ["5 RSS Feeds", "Daily Publishing"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    annualPrice: 39,
    features: ["20 RSS Feeds", "Daily Publishing"],
  },
  {
    id: "business",
    name: "Business",
    price: 99,
    annualPrice: 79,
    features: ["15 RSS Feeds", "Flexible Publishing", "Flexible Publishing"],
  },
];

interface PaymentMethodItem {
  id: string;
  brand: "stripe" | "visa";
  last4: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
}

export function SettingsBilling() {
  const { company } = useAuth();
  const [cycle, setCycle] = useState<BillingCycle>("Monthly");
  const [loading, setLoading] = useState(false);
  const [subDetails, setSubDetails] = useState<SubscriptionDetails | null>(null);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([
    {
      id: "pm_1",
      brand: "stripe",
      last4: "4832",
      expMonth: "09",
      expYear: "27",
      isDefault: true,
    },
    {
      id: "pm_2",
      brand: "visa",
      last4: "4832",
      expMonth: "09",
      expYear: "27",
      isDefault: false,
    },
  ]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchSubscription() {
      try {
        setLoading(true);
        const data = await api.get<SubscriptionDetails>("/companies/billing/subscription");
        if (!isCancelled && data) {
          setSubDetails(data);
        }
      } catch {
        // Fallback gracefully to company context or defaults if backend subscription is not yet populated
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void fetchSubscription();

    return () => {
      isCancelled = true;
    };
  }, []);

  const currentTier: "starter" | "pro" | "business" =
    (subDetails?.tier as "starter" | "pro" | "business") ||
    (company?.subscriptionTier as "starter" | "pro" | "business") ||
    "pro";

  const handleUpgrade = async (planId: "starter" | "pro" | "business") => {
    setUpgradingPlan(planId);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await api.post<{ checkoutUrl: string }>("/companies/billing/checkout", {
        tier: planId,
        interval: cycle.toLowerCase(),
      });
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to initiate Stripe checkout.");
      }
    } finally {
      setUpgradingPlan(null);
    }
  };

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await api.post<{ portalUrl: string }>("/companies/billing/portal");
      if (res?.portalUrl) {
        window.location.href = res.portalUrl;
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(
          err.statusCode === 400
            ? "No active Stripe customer found. Please subscribe to a plan first."
            : err.message
        );
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to open Stripe billing portal.");
      }
    } finally {
      setPortalLoading(false);
    }
  };

  const handleMakeDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((pm) => ({
        ...pm,
        isDefault: pm.id === id,
      }))
    );
    setSuccessMsg("Default payment method updated.");
  };

  const handleDeleteMethod = (id: string) => {
    const item = paymentMethods.find((p) => p.id === id);
    if (item?.isDefault) {
      setErrorMsg("Cannot delete default payment method. Set another card as default first.");
      return;
    }
    setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
    setSuccessMsg("Payment method removed.");
  };

  // Usage stats
  const feedsUsed = subDetails?.usage?.rssFeeds ?? 3;
  const feedsMax = subDetails?.limits?.maxRssSources ?? 5;
  const feedsPercentage = Math.min(100, Math.round((feedsUsed / (feedsMax || 1)) * 100));

  return (
    <div className="flex flex-col gap-6 w-full font-sans pb-12">
      {/* Page Subtitle */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Billing & Subscription
        </h2>
      </div>

      {/* Error & Success notifications */}
      {errorMsg && (
        <div className="p-4 text-xs font-medium text-red-700 bg-red-50 rounded-2xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. CURRENT PLAN Banner */}
      <div className="rounded-2xl p-6 sm:p-7 text-white shadow-sm bg-gradient-to-r from-[#5E6DF6] via-[#6867F4] to-[#7663F2] relative overflow-hidden flex flex-col justify-between gap-5">
        <div>
          <p className="text-[11px] font-bold text-white/80 uppercase tracking-widest">
            CURRENT PLAN · {cycle.toUpperCase()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">$49</span>
              <span className="text-sm font-medium text-white/85">/ month</span>
            </div>
            <p className="text-xs text-white/80 mt-1 font-normal">
              Renews on April 10, 2026
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handleUpgrade("pro")}
              disabled={upgradingPlan === "pro"}
              className="bg-white hover:bg-slate-50 text-[#5E6DF6] font-semibold text-xs px-5 py-2.5 rounded-full shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {upgradingPlan === "pro" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Upgrade Plan
            </button>
            <button
              onClick={handleOpenPortal}
              disabled={portalLoading}
              className="bg-white/15 hover:bg-white/25 text-white font-medium text-xs px-5 py-2.5 rounded-full border border-white/30 backdrop-blur-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {portalLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              )}
              Manage Billing
            </button>
          </div>
        </div>
      </div>

      {/* 2. PLAN LIMITS */}
      <div className="bg-white rounded-2xl p-6 border border-white/80 shadow-xs flex flex-col gap-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          PLAN LIMITS
        </h3>

        {/* Row 1: Feeds */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-slate-900">Feeds</span>
            <span className="text-xs font-semibold text-slate-500">
              {loading ? "..." : `${feedsUsed}/${feedsMax} used`}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#5E6DF6] h-full rounded-full transition-all duration-500"
              style={{ width: `${feedsPercentage}%` }}
            />
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Row 2: Publish Frequency */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-slate-900">Publish Frequency</span>
          <span className="text-sm font-medium text-slate-700">Daily</span>
        </div>
      </div>

      {/* 3. PLANS Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            PLANS
          </h3>

          {/* Billing cycle toggle */}
          <div className="bg-white/60 border border-slate-200/80 p-0.5 rounded-full flex items-center shadow-2xs">
            <button
              onClick={() => setCycle("Monthly")}
              className={cn(
                "px-4 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
                cycle === "Monthly"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle("Annual")}
              className={cn(
                "px-4 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
                cycle === "Annual"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Annual
            </button>
          </div>
        </div>

        {/* 3 Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentTier;
            const price = cycle === "Annual" ? plan.annualPrice : plan.price;

            return (
              <div
                key={plan.id}
                className={cn(
                  "bg-white rounded-2xl p-6 flex flex-col justify-between transition-all",
                  isCurrent
                    ? "border-2 border-[#5E6DF6] shadow-sm relative"
                    : "border border-slate-200/80 shadow-xs"
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-900">{plan.name}</h4>
                    {isCurrent && (
                      <span className="bg-[#EEF1FE] text-[#5E6DF6] text-[10px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full uppercase">
                        CURRENT PLAN
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">${price}</span>
                    <span className="text-xs font-medium text-slate-500">/ month</span>
                  </div>

                  <ul className="space-y-2 mt-5 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={`${plan.id}-feat-${idx}`}
                        className="flex items-center gap-2 text-xs font-medium text-slate-700"
                      >
                        <Check className="w-4 h-4 text-[#5E6DF6] stroke-[2.5] shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {isCurrent ? (
                    <button
                      disabled
                      className="bg-[#EEF1FE] text-[#5E6DF6] font-semibold text-xs py-2.5 rounded-full w-full text-center cursor-default"
                    >
                      Current Plan
                    </button>
                  ) : plan.id === "starter" ? (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgradingPlan === plan.id}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2.5 rounded-full w-full text-center transition-colors cursor-pointer"
                    >
                      {upgradingPlan === plan.id ? "Redirecting..." : "Downgrade"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgradingPlan === plan.id}
                      className="bg-[#5E6DF6] hover:bg-[#4E5DE6] text-white font-semibold text-xs py-2.5 rounded-full w-full text-center shadow-xs transition-colors cursor-pointer"
                    >
                      {upgradingPlan === plan.id ? "Redirecting..." : "Upgrade Now"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. PAYMENT METHODS */}
      <div className="bg-white rounded-2xl p-6 border border-white/80 shadow-xs flex flex-col gap-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          PAYMENT METHODS
        </h3>

        <div className="flex flex-col divide-y divide-slate-100">
          {paymentMethods.map((pm) => (
            <div key={pm.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {pm.brand === "stripe" ? (
                  <div className="w-10 h-7 rounded-md bg-[#635BFF] flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="text-white font-extrabold text-[11px] tracking-tight">stripe</span>
                  </div>
                ) : (
                  <div className="w-10 h-7 rounded-md bg-[#1A1F71] flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="text-white font-black italic text-[11px] tracking-wider">VISA</span>
                  </div>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800">
                    Visa •••• {pm.last4}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">
                    Expires {pm.expMonth} / {pm.expYear}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {pm.isDefault ? (
                  <span className="bg-[#EEF1FE] text-[#5E6DF6] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                    Default
                  </span>
                ) : (
                  <button
                    onClick={() => handleMakeDefault(pm.id)}
                    className="text-xs font-medium text-[#5E6DF6] hover:underline cursor-pointer"
                  >
                    Make default
                  </button>
                )}

                <button
                  onClick={() => handleDeleteMethod(pm.id)}
                  title="Remove payment method"
                  className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-3 flex flex-col gap-1.5">
          <button
            onClick={handleOpenPortal}
            disabled={portalLoading}
            className="text-xs font-semibold text-[#5E6DF6] hover:underline cursor-pointer flex items-center gap-1.5 w-fit"
          >
            + Add new payment method
          </button>
          <p className="text-xs text-slate-400 font-normal">
            Note: A default payment method is required to maintain an active subscription.
          </p>
        </div>
      </div>

      {/* 5. Cancel Subscription */}
      <div className="bg-white rounded-2xl p-6 border border-white/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-red-600">Cancel Subscription</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Cancelling your subscription will downgrade your account to the free tier at the end of
            your current billing period.
          </p>
        </div>

        <button
          onClick={() => setCancelModalOpen(true)}
          className="border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-xs px-5 py-2.5 rounded-full transition-colors shrink-0 cursor-pointer"
        >
          Cancel Subscription
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-100 flex flex-col gap-4">
            <h4 className="text-lg font-bold text-slate-900">Cancel Subscription?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel? You will keep your current Pro benefits until the end
              of the billing period, after which your account will revert to the Starter tier.
            </p>
            <div className="flex items-center justify-end gap-3 mt-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-5 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Keep Subscription
              </button>
              <button
                onClick={() => {
                  setCancelModalOpen(false);
                  void handleOpenPortal();
                }}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Continue to Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
