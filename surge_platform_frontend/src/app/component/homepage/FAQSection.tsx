"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How does the RSS feed collection work?",
    a: "You add any public RSS feed URL to your account. Zerodraft checks those feeds on your chosen schedule (hourly, every 4 hours, or daily) and pulls the latest articles automatically.",
  },
  {
    q: "Can I customise the writing style?",
    a: "Yes — in the Editorial Preferences section you can set the tone (Professional, Conversational, Bold, etc.), your target audience, and topics to exclude. The AI applies these preferences to every generated article.",
  },
  {
    q: "Which CMS platforms are supported?",
    a: "Currently we support WordPress via the Application Password API. Ghost, Webflow, and Contentful integrations are on the roadmap for later this year.",
  },
  {
    q: "Is my content fully automated?",
    a: "It can be. You can choose to review and approve articles before publishing, or enable full auto-publish mode where articles go live on schedule without any manual action.",
  },
  {
    q: "Can I try it before paying?",
    a: "Yes — all plans come with a 7-day free trial. No credit card required to get started.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-4 bg-slate-50">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-12">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-4">
          <span className="inline-block text-xs font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            FAQ
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Common Questions{" "}
            <span className="text-indigo-500">With Clear Answers</span>
          </h2>
          <p className="text-sm text-slate-500">
            Everything you need to know before getting started.
          </p>
        </div>

        {/* Accordion */}
        <div className="w-full flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-semibold text-slate-800">
                  {faq.q}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
                    open === i && "rotate-180"
                  )}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}