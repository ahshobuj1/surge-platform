"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4">
      <nav className="w-full max-w-6xl bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-sm px-5 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <span className="text-white font-black text-xs">Z</span>
          </div>
          <span className="font-mono font-bold text-slate-800 tracking-tighter text-base">
            zerodraft.
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-slate-600 font-medium hover:text-slate-900 transition-colors"
          >
            Sign in
          </Link>
          <Button
            size="sm"
            className="rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4"
          >
            Get started
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-slate-600"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-20 inset-x-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-5 flex flex-col gap-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-700 hover:text-indigo-500 transition-colors py-1"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/dashboard" className="text-sm text-slate-600 font-medium py-1">
              Sign in
            </Link>
            <Button className="rounded-xl bg-indigo-500 text-white text-sm font-semibold w-full">
              Get started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}