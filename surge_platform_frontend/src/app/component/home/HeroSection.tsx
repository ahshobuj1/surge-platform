"use client";

import Image from "next/image";
import Link from "next/link";
import FloatingIconCard from "./FloatingIconCard";

const TRUSTED_LOGOS = [
  { src: "/trust-1.png", alt: "Partner 1", width: 95, height: 38 },
  { src: "/trust-2.png", alt: "Partner 2", width: 105, height: 34 },
  { src: "/trust-3.png", alt: "Partner 3", width: 125, height: 38 },
  { src: "/trust-4.png", alt: "Partner 4", width: 85, height: 34 },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 sm:pt-20 pb-12 sm:pb-16 bg-[#F4F3F0]">
      {/* Soft glowing ambient light highlight in upper-left */}
      <div
        className="absolute top-6 left-[10%] sm:left-[16%] w-56 sm:w-72 h-56 sm:h-72 rounded-full bg-white/90 blur-[60px] pointer-events-none z-0"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="relative mx-auto max-w-5xl">
        {/* Floating 3D icon badges with fixed tilt and gentle floating levitation */}
        {/* Top-Left: RSS Badge */}
        <FloatingIconCard
          type="rss"
          delay={0}
          duration={5}
          className="hidden sm:block absolute left-2 sm:left-4 md:left-8 lg:left-12 top-1 sm:top-2 md:top-3"
        />

        {/* Top-Right: WordPress Badge */}
        <FloatingIconCard
          type="wordpress"
          delay={0.8}
          duration={5.8}
          className="hidden sm:block absolute right-2 sm:right-4 md:right-8 lg:right-12 top-2 sm:top-3 md:top-5"
        />

        {/* Mid-Left: Settings Dual Gears Badge */}
        <FloatingIconCard
          type="settings"
          delay={0.4}
          duration={4.8}
          className="hidden sm:block absolute left-3 sm:left-6 md:left-10 lg:left-16 top-36 sm:top-40 md:top-44"
        />

        {/* Mid-Right: Blue Wireframe Globe Badge */}
        <FloatingIconCard
          type="globe"
          delay={1.2}
          duration={6}
          className="hidden sm:block absolute right-3 sm:right-6 md:right-10 lg:right-16 top-36 sm:top-40 md:top-44"
        />

        {/* Hero Central Content */}
        <div className="mx-auto max-w-3xl text-center relative z-10 pt-1">
          <h1 className="font-mono text-xl sm:text-3xl md:text-[34px] lg:text-[38px] font-bold text-[#5365D8] tracking-tight leading-[1.2] mx-auto">
            Turn RSS Feeds Into Published
            <br className="hidden sm:inline" />{" "}
            Articles Automatically
          </h1>

          <p className="font-mono mt-3.5 text-xs sm:text-[13px] text-zinc-500 leading-relaxed max-w-xl sm:max-w-2xl mx-auto px-4">
            Connect your RSS feeds and let the platform collect articles, organize
            them into themes, generate complete posts, and publish them directly
            to your website
          </p>

          {/* CTA Buttons */}
          <div className="mt-6 flex items-center justify-center gap-3 font-mono">
            <Link href="/signup">
              <button
                type="button"
                className="bg-[#5365D8] hover:bg-[#4353C4] active:scale-[0.98] text-white text-xs font-semibold rounded-md px-4.5 py-2 shadow-xs transition-all cursor-pointer tracking-tight"
              >
                Get Started
              </button>
            </Link>

            <a href="#features">
              <button
                type="button"
                className="bg-[#EEF1FD] hover:bg-[#E3E8FC] active:scale-[0.98] text-[#5365D8] border border-[#D2DBFA] text-xs font-semibold rounded-md px-4 py-2 transition-all cursor-pointer tracking-tight"
              >
                How it works
              </button>
            </a>
          </div>
        </div>
        </div>

        {/* Dashboard Preview Banner with Centered Halftone Background Pattern */}
        <div className="relative mt-10 sm:mt-12 flex items-center justify-center">
          {/* Halftone Radial Dot Pattern centered directly behind the dashboard card */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-[1] select-none"
            aria-hidden="true"
          >
            <Image
              src="/pattern.png"
              alt="Radial Halftone Background Pattern"
              width={1400}
              height={1400}
              priority
              className="max-w-none w-[980px] sm:w-[1150px] md:w-[1280px] h-auto object-contain opacity-95"
            />
          </div>

          {/* Dashboard Preview Card */}
          <div className="relative z-10 w-full max-w-[780px] sm:max-w-[840px] md:max-w-[880px] rounded-xl sm:rounded-2xl p-1 bg-white/70 backdrop-blur-xs border border-white/90 shadow-[0_16px_40px_-12px_rgba(83,101,216,0.14),0_8px_16px_-4px_rgba(0,0,0,0.05)]">
            <Image
              src="/banner.jpg"
              alt="Zerodraft Dashboard Overview"
              width={1920}
              height={1200}
              priority
              className="w-full h-auto rounded-[10px] sm:rounded-[18px] object-cover"
            />
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="mt-10 sm:mt-12 text-center font-mono relative z-10">
          <h2 className="text-xs font-bold text-zinc-700 tracking-tight uppercase">
            Trusted by
          </h2>

          <div className="mt-3.5 flex items-center justify-center flex-wrap gap-6 sm:gap-10 md:gap-12 opacity-85">
            {TRUSTED_LOGOS.map((logo, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center grayscale opacity-65 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  className="h-5 sm:h-6 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}