"use client";

import Image from "next/image";
import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="relative pt-16 sm:pt-24 lg:pt-28 pb-0 overflow-hidden font-mono bg-[#F4F3F0]">
      {/* Giant Black Dotted Logo centered behind the card */}
      <div className="mx-auto w-full max-w-[1260px] px-6 sm:px-10 lg:px-12 flex justify-center pointer-events-none select-none z-0">
        <Image
          src="/Logo - Black.svg"
          alt="Zerodraft Giant Logo"
          width={1651}
          height={161}
          priority
          className="w-full h-auto object-contain opacity-95 block"
        />
      </div>

      {/* Main Wide Frosted Footer Card overlapping the lower portion of the giant logo */}
      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-3 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 md:-mt-10 lg:-mt-12">
        <div className="rounded-t-[28px] sm:rounded-t-[36px] lg:rounded-t-[40px] bg-white/75 backdrop-blur-xl border-t border-x border-white/90 shadow-[0_-10px_35px_-8px_rgba(0,0,0,0.04)] pt-8 sm:pt-10 lg:pt-12 px-6 sm:px-10 lg:px-14 pb-8 sm:pb-10">
          {/* Top Row: Brand Info (Left) + Links (Right) */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 sm:gap-10 lg:gap-16">
            {/* Left Column: Black Logo, Tagline & Get Started Button */}
            <div className="flex flex-col items-start gap-3 max-w-sm">
              <Link href="/" className="inline-block">
                <Image
                  src="/Logo - Black.svg"
                  alt="Zerodraft Logo"
                  width={140}
                  height={18}
                  className="h-4 sm:h-4.5 w-auto object-contain"
                />
              </Link>
              <p className="text-xs text-zinc-600 leading-relaxed font-mono mt-1">
                Automatically turn RSS feeds into published articles
              </p>
              <Link href="/signup" className="mt-2">
                <button
                  type="button"
                  className="bg-[#5365D8] hover:bg-[#4353C4] active:scale-[0.98] text-white text-xs font-semibold rounded-lg px-4 py-2 shadow-xs transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </Link>
            </div>

            {/* Right Columns: Navigation Links */}
            <div className="flex gap-12 sm:gap-16 lg:gap-24 text-xs font-mono">
              {/* Product Column */}
              <div>
                <h4 className="font-bold text-zinc-900 mb-3 sm:mb-3.5 tracking-tight text-xs sm:text-[13px]">
                  Product
                </h4>
                <ul className="flex flex-col gap-2 text-zinc-500">
                  <li>
                    <a href="#platform" className="hover:text-zinc-900 transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#benefits" className="hover:text-zinc-900 transition-colors">
                      Benefits
                    </a>
                  </li>
                  <li>
                    <a href="#integrations" className="hover:text-zinc-900 transition-colors">
                      Integrations
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="hover:text-zinc-900 transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:text-zinc-900 transition-colors">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              {/* Socials Column */}
              <div>
                <h4 className="font-bold text-zinc-900 mb-3 sm:mb-3.5 tracking-tight text-xs sm:text-[13px]">
                  Socials
                </h4>
                <ul className="flex flex-col gap-2 text-zinc-500">
                  <li>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-zinc-900 transition-colors"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-zinc-900 transition-colors"
                    >
                      Twitter/X
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-zinc-900 transition-colors"
                    >
                      Linkedin
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-200/70 mt-10 sm:mt-14 mb-5 sm:mb-6" />

          {/* Bottom Row */}
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <p>All rights reserved</p>
            <p className="text-zinc-800 font-medium">© 2026 Zerodraft</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
