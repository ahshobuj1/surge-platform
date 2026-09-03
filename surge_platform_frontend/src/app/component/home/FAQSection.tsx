"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does your platform automate RSS feed collection?",
    answer:
      "We poll your configured RSS feeds at regular intervals, ingest full metadata and article content, deduplicate incoming stories, and normalize them for clustering and processing.",
  },
  {
    question: "Can I review and approve content before it is published?",
    answer:
      "Yes. You can run in fully automatic mode or require editorial sign-off, giving your team complete control through optional draft review steps.",
  },
  {
    question: "Which CMS platforms and destinations are supported?",
    answer:
      "We offer native direct integrations with WordPress, Ghost, Webflow, Shopify, custom Webhooks, and REST APIs for proprietary content stacks.",
  },
  {
    question: "How does AI create coherent editorial articles from multiple feeds?",
    answer:
      "Our AI pipeline clusters related stories from disparate sources into thematic groups, synthesizes key narratives and takeaways, and writes original, structured articles tailored to your brand voice.",
  },
  {
    question: "Can I try the platform before committing?",
    answer:
      "Absolutely. We offer a 14-day free trial with access to our core automation pipeline so you can evaluate the platform risk-free.",
  },
];

export default function FAQSection() {
  return (
    <section
      id="faq"
      className="relative py-20 sm:py-28 overflow-hidden font-mono"
      style={{
        background: "linear-gradient(180deg, #E2DCED 0%, #EBE5F2 40%, #F4F3F0 100%)",
      }}
    >
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold border border-blue-400/60 bg-blue-50/60 text-[#5365D8] mb-4 tracking-tight shadow-2xs">
            FAQ&apos;s
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-[42px] font-bold tracking-tight text-zinc-900 leading-[1.18] sm:leading-[1.15]">
            Common Questions
            <br />
            With Clear Answers
          </h2>
          <p className="mt-3.5 text-xs sm:text-sm md:text-[14px] text-zinc-600 leading-relaxed max-w-xl mx-auto">
            Everything you need to know about setting up and automating your content pipeline.
          </p>
        </div>

        {/* FAQ Items Accordion */}
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full space-y-3.5">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/90 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] px-5 sm:px-6 py-1 overflow-hidden"
              >
                <AccordionTrigger className="text-left text-xs sm:text-sm font-bold text-zinc-900 hover:no-underline hover:text-[#5365D8] transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-1 text-xs sm:text-[13px] text-zinc-500 leading-relaxed border-t border-zinc-100/80">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}