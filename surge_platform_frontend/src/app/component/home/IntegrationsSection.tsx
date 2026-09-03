"use client";

import { Check } from "lucide-react";
import Link from "next/link";

export default function IntegrationsSection() {
  return (
    <section
      id="integrations"
      className="relative py-16 sm:py-24 overflow-hidden font-mono"
      style={{
        background: "linear-gradient(180deg, #E2DCED 0%, #ECE6F2 40%, #F4F3F0 100%)",
      }}
    >
      {/* Centered with reduced width matching the visual style */}
      <div className="relative z-10 mx-auto w-full max-w-[1060px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] sm:rounded-[32px] bg-[#F5F3F0] border border-white/80 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.03)] p-8 sm:p-12 lg:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Left Content */}
          <div className="flex-1 flex flex-col items-start gap-4 max-w-sm">
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border border-blue-400/60 bg-blue-50/60 text-[#5365D8] tracking-tight shadow-2xs">
              Integrations
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-zinc-900 leading-[1.15]">
              Seamless Integrations
            </h2>

            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-[300px]">
              Connect RSS Feeds with your CMS through our platform in a snap
            </p>

            <Link href="/signup" className="mt-2">
              <button
                type="button"
                className="bg-[#5365D8] hover:bg-[#4353C4] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold rounded-xl px-5 py-2.5 shadow-sm transition-all cursor-pointer"
              >
                Get Started Now
              </button>
            </Link>
          </div>

          {/* Right Visual Box */}
          <div className="flex-1 max-w-[420px] w-full flex justify-center">
            <div className="w-full bg-[#EAE7E1] rounded-[24px] sm:rounded-[28px] py-10 sm:py-12 px-6 sm:px-10 flex flex-col items-center justify-center gap-3 shadow-2xs">
              {/* RSS Feed Card */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 shadow-xs border border-zinc-200/50 flex items-center gap-3.5 w-full max-w-[250px]">
                {/* RSS Icon */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#EA580C] to-[#F97316] flex items-center justify-center shrink-0 shadow-2xs">
                  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-white" fill="currentColor">
                    <path d="M6.18 15.64a2.18 2.18 0 010 4.36 2.18 2.18 0 010-4.36M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 006.18 7.27V4.44M4 10.1a9.9 9.9 0 019.9 9.9h-2.83a7.07 7.07 0 00-7.07-7.07V10.1z" />
                  </svg>
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#3B82F6] flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                    <span className="text-xs font-bold text-zinc-900 tracking-tight">RSS Feed</span>
                  </div>
                  <div className="mt-1.5 flex flex-col gap-1">
                    <div className="h-1.5 w-24 bg-[#DCE4FA] rounded-full" />
                    <div className="h-1.5 w-16 bg-[#E8EEFC] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Connecting Dots */}
              <div className="flex flex-col items-center gap-1 py-1 select-none pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#93C5FD]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#93C5FD]" />
              </div>

              {/* Wordpress Card */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 shadow-xs border border-zinc-200/50 flex items-center gap-3.5 w-full max-w-[250px]">
                {/* WordPress Icon */}
                <div className="w-9 h-9 rounded-full border border-zinc-200/80 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#21759B]" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM3.6 12c0-.98.18-1.92.5-2.79l2.76 7.57A8.4 8.4 0 013.6 12zm8.4 8.4a8.4 8.4 0 01-2.38-.34l2.53-7.35.02-.04 2.47 6.77c.01.04.03.07.05.1A8.38 8.38 0 0112 20.4zm1.16-11.26l2.07 6.01.57 1.9a8.4 8.4 0 01-5.19-8.63l2.55.72zm4.08.6c.4.71.62 1.53.62 2.26 0 1.76-.95 5.27-1.4 6.97l-3.83-11.38c.64-.03 1.21-.1 1.21-.1.57-.07.5-.9-.07-.87 0 0-1.71.14-2.81.14-1.04 0-2.78-.14-2.78-.14-.57-.03-.64.83-.07.87 0 0 .54.07 1.11.1L11.6 14.6 9.53 8.74c.64-.03 1.21-.1 1.21-.1.57-.07.5-.9-.07-.87 0 0-1.71.14-2.81.14h-.66A8.4 8.4 0 0119.2 12c0 .64-.08 1.26-.21 1.86l-.55-1.84-1.2-3.28z" />
                  </svg>
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#3B82F6] flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                    <span className="text-xs font-bold text-zinc-900 tracking-tight">Wordpress</span>
                  </div>
                  <div className="mt-1.5 flex flex-col gap-1">
                    <div className="h-1.5 w-24 bg-[#DCE4FA] rounded-full" />
                    <div className="h-1.5 w-16 bg-[#E8EEFC] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}