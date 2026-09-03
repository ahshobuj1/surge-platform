import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTABanner() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 p-10 md:p-14 flex flex-col md:flex-row items-center gap-10">
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Left text */}
          <div className="relative z-10 flex-1 flex flex-col gap-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Ready to change the way{" "}
              <span className="text-indigo-200">you automate?</span>
            </h2>
            <p className="text-sm text-indigo-200 leading-relaxed max-w-md">
              Join hundreds of publishers who've replaced manual content work
              with Zerodraft's fully automated editorial pipeline.
            </p>
            <Button className="w-fit rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 font-semibold text-sm px-6 mt-2 shadow-md">
              Try it free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {/* Right dashboard mini mockup */}
          <div className="relative z-10 w-full md:w-72 shrink-0">
            <div className="rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 p-4 shadow-xl">
              {/* Mini sidebar + content */}
              <div className="flex gap-3 mb-3">
                <div className="w-20 flex flex-col gap-2">
                  <div className="h-3 w-14 bg-white/40 rounded-full" />
                  <div className="h-6 w-full bg-white/30 rounded-lg" />
                  <div className="h-6 w-full bg-white/10 rounded-lg" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 w-16 bg-white/40 rounded-full" />
                  <div className="grid grid-cols-2 gap-1.5">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-6 bg-white/20 rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-5 bg-white/10 rounded-lg flex items-center gap-2 px-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full" />
                    <div className="w-8 h-3 bg-white/20 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}