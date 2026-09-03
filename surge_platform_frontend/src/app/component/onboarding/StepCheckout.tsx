"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Lock, Loader2 } from "lucide-react";
import { PlanTier, BillingInterval } from "./StepPaywall";

interface StepCheckoutProps {
  plan: PlanTier;
  interval: BillingInterval;
  onBack: () => void;
  onConfirmPayment: () => Promise<void> | void;
}

export function StepCheckout({
  plan,
  interval,
  onBack,
  onConfirmPayment,
}: StepCheckoutProps) {
  const [stripeConnected, setStripeConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const price = interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  const handleConnectStripe = () => {
    setStripeConnected(true);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      if (onConfirmPayment) {
        await onConfirmPayment();
      }
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error("Payment confirmation error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Welcome to ZeroDraft!
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md">
          Your automation is now active on the <span className="font-semibold text-slate-800">{plan.name}</span> plan. Taking you to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Top navigation */}
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6 cursor-pointer self-start p-0 h-auto hover:bg-transparent"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to plans</span>
      </Button>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Plan Summary */}
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Checkout
          </h2>

          <Card className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 flex flex-col gap-3 shadow-2xs ring-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Selected Plan
            </span>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-900">
                {plan.name}
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                ${price}
                <span className="text-xs font-medium text-slate-500">/month</span>
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Billing Cycle</span>
              <span className="capitalize text-slate-800 font-semibold">{interval}</span>
            </div>
          </Card>
        </div>

        {/* Right Column: Stripe Payment Box using Card */}
        <Card className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 flex flex-col gap-5 shadow-sm ring-0">
          {/* Stripe Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#635BFF] flex items-center justify-center text-white font-black text-lg shadow-2xs">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 leading-tight">
                Stripe Payment
              </span>
              <span className="text-xs text-slate-400">
                Card, Apple Pay, Google Pay supported by Stripe
              </span>
            </div>
          </div>

          {/* Secure note */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit Secure Payment</span>
          </div>

          {/* Stripe Action Button */}
          <Button
            type="button"
            onClick={handleConnectStripe}
            className="w-full h-11 rounded-full bg-[#635BFF] hover:bg-[#5349DF] text-white text-sm font-semibold shadow-2xs transition-all cursor-pointer"
          >
            {stripeConnected ? "✓ Stripe Account Connected" : "Connect Stripe Account"}
          </Button>

          {/* Divider */}
          <div className="w-full h-px bg-slate-100 my-1" />

          {/* Confirm Payment Button */}
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full h-12 rounded-full bg-[#4F62E8] hover:bg-[#4353D3] text-white text-sm font-bold shadow-[0_4px_14px_rgba(79,98,232,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Payment...
              </span>
            ) : (
              "Confirm Payment"
            )}
          </Button>

          {/* Disclaimer */}
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            By clicking &quot;Confirm Payment&quot;, you agree to our Terms of Service. Your subscription will renew {interval}. You can cancel at any time from your settings.
          </p>
        </Card>
      </div>
    </div>
  );
}

