"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 19,
    yearlyPrice: 15,
    tagline: "Great for getting started.",
    features: ["5 RSS Feeds", "Weekly Publishing"],
    popular: false,
  },
  {
    name: "Pro",
    monthlyPrice: 49,
    yearlyPrice: 39,
    tagline: "Great for getting started.",
    features: ["10 RSS Feeds", "Daily Publishing"],
    popular: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: 99,
    yearlyPrice: 79,
    tagline: "Great for getting started.",
    features: ["15 RSS Feeds", "Flexible Publishing", "Multiple Publishing Daily"],
    popular: false,
  },
];

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section
      id="pricing"
      className="relative py-20 sm:py-28 overflow-hidden font-mono"
      style={{
        background: "linear-gradient(180deg, #F4F3F0 0%, #ECE6EE 45%, #E2DCED 100%)",
      }}
    >
      {/* Halftone Radial Dots Pattern centered behind the pricing cards */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-0 select-none"
        aria-hidden="true"
      >
        <Image
          src="/pattern.png"
          alt="Background Dots Pattern"
          width={1300}
          height={950}
          className="w-[1100px] sm:w-[1250px] md:w-[1350px] max-w-none opacity-80 mix-blend-multiply object-contain pointer-events-none"
        />
      </div>

      {/* Ambient background glow safely centered within section */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-white/95 blur-[75px] pointer-events-none z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-[980px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-12">
          <span className="inline-flex items-center px-3.5 py-0.5 rounded-full text-xs font-semibold border border-blue-400/60 bg-blue-50/60 text-[#1D68EE] mb-3.5 tracking-tight shadow-2xs">
            Our Pricing
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-[40px] font-bold tracking-tight text-zinc-900 leading-[1.18] sm:leading-[1.15]">
            Choose The Best
            <br />
            Plan That Suites You
          </h2>

          <p className="mt-3 text-xs sm:text-[13px] text-zinc-500 leading-relaxed max-w-md mx-auto">
            Flexible pricing built for every stage
            <br className="hidden sm:inline" /> from startup to scale, no hidden fees
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-3.5 mt-7">
            <span
              className={`text-xs sm:text-[13px] font-semibold transition-colors ${
                !isYearly ? "text-zinc-900" : "text-zinc-400"
              }`}
            >
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-7 rounded-full bg-[#1D68EE] p-1 transition-colors focus:outline-none cursor-pointer shadow-xs"
              aria-label="Toggle Monthly/Yearly billing"
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  isYearly ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={`text-xs sm:text-[13px] font-medium transition-colors ${
                isYearly ? "text-zinc-900 font-semibold" : "text-zinc-400"
              }`}
            >
              Yearly
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          {plans.map((plan, index) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

            if (plan.popular) {
              return (
                <div key={index} className="h-full flex flex-col">
                  <div className="flex flex-col rounded-[28px] bg-[#1868F2] p-[3px] shadow-[0_12px_36px_-6px_rgba(24,104,242,0.25)] flex-1 select-none transition-all duration-300">
                    {/* Most Popular Label (Outside the white card) */}
                    <div className="h-8 flex items-center justify-center text-white text-xs font-semibold tracking-normal select-none">
                      Most Popular
                    </div>

                    {/* Inner White Card - exactly matching height with Starter & Enterprise */}
                    <div className="bg-white rounded-[24px] p-6 sm:p-7 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                          {plan.name}
                        </h3>

                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">
                            ${price}
                          </span>
                          <span className="text-xs text-zinc-400 font-normal">
                            /month
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-zinc-500 leading-relaxed mb-6">
                          {plan.tagline}
                        </p>

                        <div className="mb-3">
                          <p className="text-xs font-bold text-zinc-800 tracking-tight">
                            What&apos;s included
                          </p>
                        </div>

                        <ul className="flex flex-col gap-3">
                          {plan.features.map((feature, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2.5 text-xs text-zinc-600 font-normal"
                            >
                              <div className="w-4 h-4 rounded-full border border-zinc-300 flex items-center justify-center shrink-0 text-zinc-400">
                                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                              </div>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-8 pt-2">
                        <Link href="/signup" className="block w-full">
                          <button
                            type="button"
                            className="w-full h-11 rounded-[14px] text-sm font-semibold bg-[#1868F2] hover:bg-[#1456CC] text-white shadow-xs transition-all cursor-pointer"
                          >
                            Get Started
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={index} className="h-full flex flex-col md:pt-8">
                <div className="rounded-[28px] bg-white p-6 sm:p-7 border border-slate-200/60 shadow-xs hover:shadow-md flex flex-col justify-between flex-1 transition-all duration-300 select-none">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                      {plan.name}
                    </h3>

                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">
                        ${price}
                      </span>
                      <span className="text-xs text-zinc-400 font-normal">
                        /month
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-zinc-500 leading-relaxed mb-6">
                      {plan.tagline}
                    </p>

                    <div className="mb-3">
                      <p className="text-xs font-bold text-zinc-800 tracking-tight">
                        What&apos;s included
                      </p>
                    </div>

                    <ul className="flex flex-col gap-3">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2.5 text-xs text-zinc-600 font-normal"
                        >
                          <div className="w-4 h-4 rounded-full border border-zinc-300 flex items-center justify-center shrink-0 text-zinc-400">
                            <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-2">
                    <Link href="/signup" className="block w-full">
                      <button
                        type="button"
                        className="w-full h-11 rounded-[14px] text-sm font-semibold bg-[#1868F2] hover:bg-[#1456CC] text-white shadow-xs transition-all cursor-pointer"
                      >
                        Get Started
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}