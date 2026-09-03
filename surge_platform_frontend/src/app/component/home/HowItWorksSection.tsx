"use client";

import Image from "next/image";

const steps = [
  {
    title: "Connect Your RSS Feeds",
    description:
      "The platform continuously collects and organizes new articles from these feeds.",
    imageSrc: "/how-it-work/Image container.png",
    imageAlt: "Connect Your RSS Feeds preview",
  },
  {
    title: "Editorial Topic Grouping",
    description:
      "Specific topics are grouped into meaningful topics to create focused articles.",
    imageSrc: "/how-it-work/Frame 2147227399.png",
    imageAlt: "Editorial Topic Grouping preview",
  },
  {
    title: "Generate and Publish",
    description:
      "The system writes a complete article, publishes it directly to your CMS",
    imageSrc: "/how-it-work/Frame 2147227410.png",
    imageAlt: "Generate and Publish preview",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-16 sm:py-24 lg:py-28 overflow-hidden font-mono"
      style={{
        background: "linear-gradient(180deg, #F4F3F0 0%, #ECE6EE 45%, #E2DCED 100%)",
      }}
    >
      {/* Ambient background glow safely within section */}
      <div
        className="absolute top-10 left-[10%] w-56 sm:w-72 h-56 sm:h-72 rounded-full bg-white/90 blur-[60px] pointer-events-none z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold border border-blue-400/60 bg-blue-50/60 text-[#5365D8] mb-4 tracking-tight shadow-2xs">
            How it works
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-[42px] font-bold tracking-tight text-zinc-900 leading-[1.18] sm:leading-[1.15]">
            Powerful Tools For Automated
            <br />
            Publishing
          </h2>
          <p className="mt-3 text-xs sm:text-sm md:text-[14px] text-zinc-600 leading-relaxed max-w-xl mx-auto">
            Everything you need to turn content streams into fully published articles
          </p>
        </div>

        {/* Steps Grid: 1440 Max Width, 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-7 items-stretch">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white/85 backdrop-blur-md border border-white/90 rounded-[24px] sm:rounded-[28px] pt-6 sm:pt-7 px-5 sm:px-6 shadow-[0_6px_25px_-6px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Text content */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs sm:text-[13px] text-zinc-500 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Visual image canvas from public/how-it-work */}
              <div className="mt-6 sm:mt-8 -mx-5 sm:-mx-6 -mb-0.5 flex items-end justify-center overflow-hidden">
                <Image
                  src={step.imageSrc}
                  alt={step.imageAlt}
                  width={355}
                  height={228}
                  className="w-full h-auto object-contain max-h-[220px]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}