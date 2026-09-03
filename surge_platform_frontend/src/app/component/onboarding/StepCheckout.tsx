"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ExternalLink,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import { PlanTier, BillingInterval } from "./StepPaywall";
import { api } from "@/lib/api";

interface StepCheckoutProps {
  plan: PlanTier;
  interval: BillingInterval;
  onBack: () => void;
  onConfirmPayment: () => Promise<void> | void;
  isCancelled?: boolean;
}

interface CheckoutResponse {
  checkoutUrl: string;
}

export function StepCheckout({
  plan,
  interval,
  onBack,
  onConfirmPayment,
  isCancelled = false,
}: StepCheckoutProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isFreeActivating, setIsFreeActivating] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const price = interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  const handleProceedStripe = async () => {
    setIsRedirecting(true);
    setErrorText(null);

    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";

      const successUrl = `${origin}/onboarding?step=completed&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/onboarding?step=checkout&cancelled=true&plan=${plan.id}`;

      const res = await api.post<CheckoutResponse>(
        "/companies/billing/checkout",
        {
          tier: plan.id,
          interval,
          successUrl,
          cancelUrl,
        },
      );

      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned from payment service.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to start checkout. Please try again.";
      setErrorText(msg);
      setIsRedirecting(false);
    }
  };

  const handleContinueStarter = async () => {
    setIsFreeActivating(true);
    setErrorText(null);

    try {
      await onConfirmPayment();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to complete onboarding. Please try again.";
      setErrorText(msg);
    } finally {
      setIsFreeActivating(false);
    }
  };

  return (
    <div className="flex flex-col w-full font-mono">
      {/* Top navigation */}
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6 cursor-pointer self-start p-0 h-auto hover:bg-transparent"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to plan selection</span>
      </Button>

      {/* Cancellation Notice Banner */}
      {isCancelled && (
        <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200/80 p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex flex-col text-xs text-amber-800">
            <span className="font-bold">Checkout was cancelled</span>
            <span className="text-amber-700 mt-0.5">
              No charges were made. You can proceed with Stripe, select a different plan, or continue with the Starter plan below.
            </span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorText && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <span className="text-xs text-red-700">{errorText}</span>
        </div>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Plan Summary */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Review & Payment
          </h2>
          <p className="text-xs text-slate-500">
            Review your selected plan and complete your automation setup.
          </p>

          <Card className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 flex flex-col gap-3 shadow-2xs ring-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Selected Plan
            </span>

            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-slate-900">
                {plan.name}
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                ${price}
                <span className="text-xs font-medium text-slate-500">/mo</span>
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Billing Cycle</span>
              <span className="capitalize text-slate-800 font-semibold">
                {interval}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Included:</span>
              {plan.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[11px]">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Stripe Checkout Action Box */}
        <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 flex flex-col gap-4 shadow-sm ring-0">
          {/* Stripe Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#635BFF] flex items-center justify-center text-white font-black text-lg shadow-2xs">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 leading-tight">
                Stripe Checkout
              </span>
              <span className="text-[11px] text-slate-400">
                Securely powered by Stripe (Cards, Apple Pay, Google Pay)
              </span>
            </div>
          </div>

          {/* Secure note */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit Encrypted Checkout</span>
          </div>

          {/* Primary Action Button: Proceed to Stripe Checkout */}
          <Button
            type="button"
            onClick={() => void handleProceedStripe()}
            disabled={isRedirecting || isFreeActivating}
            className="w-full h-12 rounded-full bg-[#4F62E8] hover:bg-[#4353D3] text-white text-xs font-bold shadow-[0_4px_14px_rgba(79,98,232,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting to Stripe...</span>
              </>
            ) : (
              <>
                <span>Proceed to Stripe Checkout</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </>
            )}
          </Button>

          {/* Divider with OR */}
          <div className="relative flex items-center justify-center my-1">
            <div className="w-full h-px bg-slate-100" />
            <span className="absolute px-3 bg-white text-[10px] uppercase font-bold text-slate-400">
              or
            </span>
          </div>

          {/* Secondary Action Button: Free Starter Tier */}
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleContinueStarter()}
            disabled={isRedirecting || isFreeActivating}
            className="w-full h-11 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isFreeActivating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Activating Automation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#4F62E8]" />
                <span>Continue with Free Starter Plan</span>
              </>
            )}
          </Button>

          {/* Disclaimer */}
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Subscriptions renew automatically {interval}. You can upgrade, downgrade, or cancel anytime from your dashboard billing settings.
          </p>
        </Card>
      </div>
    </div>
  );
}
