"use client";

import Image from "next/image";

const benefits = [
  {
    iconSrc: "/icons/clock.svg",
    title: "Save Hours of Manual Work",
    description: "Automatically collect articles, generate content, and publish posts without manual writing or editing.",
  },
  {
    iconSrc: "/icons/calender.svg",
    title: "Publish Content Consistently",
    description: "Keep your website active with fresh articles generated and published on a reliable schedule.",
  },
  {
    iconSrc: "/icons/write.svg",
    title: "Turn News Into Insights",
    description: "AI analyzes multiple sources and transforms them into meaningful editorial articles.",
  },
  {
    iconSrc: "/icons/gear.svg",
    title: "An Autonomous Content Engine",
    description: "Once configured, the system continuously discovers topics and publishes articles automatically.",
  },
  {
    iconSrc: "/icons/bar-up.svg",
    title: "Scale Without Any Hassle",
    description: "Produce more content without expanding your editorial team.",
  },
  {
    iconSrc: "/icons/block.svg",
    title: "Stay in Control",
    description: "Monitor automation status, publishing activity, and system health from a simple dashboard.",
  },
];

export default function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="relative py-20 sm:py-28 overflow-hidden font-mono"
      style={{
        background: "linear-gradient(180deg, #E2DCED 0%, #ECE6F2 40%, #F4F3F0 100%)",
      }}
    >
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold border border-blue-400/60 bg-blue-50/60 text-[#5365D8] mb-4 tracking-tight shadow-2xs">
            Benefits
          </span>

          <h2 className="text-2xl sm:text-4xl md:text-[42px] font-bold tracking-tight text-zinc-900 leading-[1.18] sm:leading-[1.15]">
            Content Publishing Fully
            <br />
            On Autopilot
          </h2>
          <p className="mt-3.5 text-xs sm:text-sm md:text-[14px] text-zinc-600 leading-relaxed max-w-xl mx-auto">
            From article discovery to writing and publishing, the system runs your entire editorial pipeline automatically.
          </p>
        </div>

        {/* Cards Grid: 1440 Max Width, 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-md rounded-[22px] sm:rounded-[26px] p-2 sm:p-2.5 border border-white/90 shadow-[0_6px_25px_-6px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="p-5 sm:p-6 flex flex-col gap-4">
                {/* Dedicated SVG icon from public/icons folder */}
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FE] border border-[#DCE4FD] flex items-center justify-center shadow-2xs">
                  <Image
                    src={benefit.iconSrc}
                    alt={benefit.title}
                    width={22}
                    height={22}
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 mb-2 tracking-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-zinc-500 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}