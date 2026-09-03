import Link from "next/link";
import { Button } from "@/components/ui/button";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-slate-100">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-black text-xs">Z</span>
              </div>
              <span className="font-mono font-bold text-slate-800 tracking-tighter text-base">
                zerodraft.
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Your autonomous AI editorial engine. Automate content from RSS to
              published article — every day.
            </p>
            <Button
              size="sm"
              className="w-fit rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs px-4"
            >
              Get started free
            </Button>
          </div>

          {/* Link cols */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                {group}
              </p>
              <ul className="flex flex-col gap-2">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Zerodraft. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
              <Link
                key={t}
                href="#"
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}