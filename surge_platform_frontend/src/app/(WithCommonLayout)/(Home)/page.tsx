"use client"
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Badge from "../../component/shared/BadgeButton";
import IntegrationsSection from "../../component/home/IntegrationsSection";
import FAQSection from "../../component/home/FAQSection";
import BenefitsSection from "@/app/component/home/BenefitsSection";
import HeroSection from "@/app/component/home/HeroSection";
import HowItWorksSection from "@/app/component/home/HowItWorksSection";
import PricingSection from "@/app/component/home/PricingSection";
import CTASection from "@/app/component/home/CTASection";
import FooterSection from "@/app/component/home/FooterSection";

const integrations = ["Semrush", "WordPress", "Webflow", "Google Docs", "Notion", "HubSpot"];

const pricing = [
  { name: "Basic", price: "$19", users: "2 seats" },
  { name: "Pro", price: "$49", users: "10 seats", featured: true },
  { name: "Enterprise", price: "$99", users: "Unlimited seats" },
];
const bentoFeatures = [
  {
    title: "RSS Feed Collection",
    description: "Collect articles automatically from multiple RSS feeds and organize them in one place.",
    colSpan: "col-span-12 md:col-span-5",
  },
  {
    title: "Editorial Topic Grouping",
    description: "Related stories are grouped into meaningful topics to create focused articles.",
    colSpan: "col-span-12 md:col-span-7",
  },
  {
    title: "Automation Monitoring",
    description: "Track system status, publishing activity, and failures from a simple dashboard.",
    colSpan: "col-span-12 md:col-span-7",
  },
  {
    title: "Automatic Article Generation",
    description: "Complete posts are generated based on the collected articles and topics.",
    colSpan: "col-span-12 md:col-span-5",
  },
];



function App() {
  return (
    <div className="bg-[#F4F3F0] text-zinc-900 font-mono selection:bg-[#5365D8]/20">
      <header className="fixed inset-x-0 top-0 z-50 bg-[#F4F3F0]/90 backdrop-blur-md border-b border-zinc-200/30">
        <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/zerodraft.svg"
              alt="Zerodraft Logo"
              width={100}
              height={26}
              priority
              className="object-contain h-5 sm:h-5.5 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {[
              ["Features", "#platform"],
              ["Benefits", "#benefits"],
              ["Integrations", "#integrations"],
              ["Pricing", "#pricing"],
              ["FAQ", "#faq"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-950 transition-colors tracking-tight"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/signup">
              <button
                type="button"
                className="bg-[#5365D8] hover:bg-[#4353C4] active:scale-[0.98] text-white text-xs font-semibold rounded-md px-3.5 py-1.5 transition-all shadow-xs cursor-pointer tracking-tight"
              >
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <HeroSection />
        <section
          id="platform"
          className="relative py-10 sm:py-14 lg:py-16 overflow-hidden font-mono"
          style={{
            background: "linear-gradient(180deg, #F4F3F0 0%, #ECE6EE 45%, #E2DCED 100%)",
          }}
        >
          {/* Top-Left circular glow orb matching screenshot safely within section bounds */}
          <div
            className="absolute top-6 left-[8%] w-44 sm:w-56 h-44 sm:h-56 rounded-full bg-white/90 blur-[40px] pointer-events-none z-0"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-12 xl:px-16">
            {/* Section Header */}
            <div className="mx-auto max-w-2xl text-center mb-6 sm:mb-8">
              <span className="inline-flex items-center px-3.5 py-0.5 rounded-full text-[11px] font-semibold border border-blue-400/60 bg-blue-50/60 text-[#5365D8] mb-2.5 tracking-tight shadow-2xs">
                Unique Features
              </span>
              <h2 className="text-xl sm:text-2xl md:text-[30px] lg:text-[34px] font-bold tracking-tight text-zinc-900 leading-[1.18]">
                Powerful Tools For
                <br />
                Automated Publishing
              </h2>
              <p className="mt-2 text-xs sm:text-[13px] text-zinc-600 max-w-xl mx-auto leading-relaxed">
                Everything you need to turn content streams into fully published articles
              </p>
            </div>

            {/* Asymmetric Bento Grid (2x2) with viewport-fitting compact card heights */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 lg:gap-5">
              {bentoFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`${feature.colSpan} bg-white/80 backdrop-blur-md rounded-[20px] sm:rounded-[24px] p-3 sm:p-3.5 lg:p-4 border border-white/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between`}
                >
                  {/* Visual Canvas Area - Compact to fit within viewport */}
                  <div className="h-36 sm:h-44 md:h-48 lg:h-[190px] w-full rounded-[14px] sm:rounded-[18px] bg-[#F7F5F2] border border-zinc-200/50 flex items-center justify-center relative overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-white/40 border border-white/70 flex items-center justify-center opacity-30" />
                  </div>

                  {/* Card Content */}
                  <div className="pt-3 pb-0.5 px-0.5">
                    <h3 className="text-xs sm:text-sm lg:text-[15px] font-bold text-zinc-900 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-[11px] sm:text-xs text-zinc-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <BenefitsSection />
        <HowItWorksSection />
        <IntegrationsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>

      <FooterSection />
    </div>
  );
}

export default App

// function Page() {
//   return <HomePage />;
// }

// export default Page;