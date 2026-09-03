"use client";

import Image from "next/image";
import Link from "next/link";

export default function CTASection() {
  return (
    <section
      className="relative py-16 sm:py-24 overflow-hidden font-mono"
      style={{
        background: "linear-gradient(180deg, #F4F3F0 0%, #EBE5F2 40%, #F4F3F0 100%)",
      }}
    >
      {/* Reduced width container matching the screenshot */}
      <div className="relative z-10 mx-auto w-full max-w-[1060px] px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[28px] sm:rounded-[36px] bg-[#F5F3F0] border border-white/90 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          {/* Soft ambient glow in lower left */}
          <div
            className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-[#5365D8]/20 blur-[60px] pointer-events-none z-0"
            aria-hidden="true"
          />

          {/* Left Content */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-14 lg:pr-4 flex-1 flex flex-col items-start gap-4">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#5365D8] leading-[1.15]">
              Ready to change the way
              <br />
              you automate ?
            </h2>

            <p className="text-xs sm:text-[13.5px] text-zinc-600 leading-relaxed max-w-sm">
              Join thousands of users who made they workflows and
              <br className="hidden sm:inline" /> automation an integral part of therir business
            </p>

            <div className="mt-3">
              <Link href="/signup">
                <button
                  type="button"
                  className="bg-[#5365D8] hover:bg-[#4353C4] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold rounded-xl px-7 py-3 shadow-md shadow-[#5365D8]/20 transition-all cursor-pointer"
                >
                  Try Now
                </button>
              </Link>
            </div>
          </div>

          {/* Right Image Mockup - Bleeds to right and bottom edges with rounded top-left corner */}
          <div className="relative z-10 w-full lg:w-[56%] self-end pt-3 sm:pt-6 lg:pt-8 pl-6 sm:pl-10 lg:pl-0 flex justify-end">
            <div className="w-full relative rounded-tl-2xl overflow-hidden border-t border-l border-zinc-200/70 shadow-lg bg-white">
              <Image
                src="/cta.jpg"
                alt="Zerodraft automation dashboard preview"
                width={1400}
                height={875}
                priority
                loading="eager"
                className="w-full h-auto object-cover object-left-top block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}