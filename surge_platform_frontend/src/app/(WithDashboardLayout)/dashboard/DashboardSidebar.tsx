"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import ZerodraftLogo from "@/app/component/shared/ZeroDraftLogo";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Zerodraft", href: "/dashboard/zerodraft" },
  { label: "Brand", href: "/dashboard/brand" },
  { label: "Sources", href: "/dashboard/sources" },
  { label: "Settings", href: "/dashboard/settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white/90 border border-slate-200 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-foreground" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-64 h-full bg-white/95 p-4 border-r border-slate-200/60">
            <div className="px-2 mb-2 flex items-center justify-between">
              <ZerodraftLogo size="sm" className="mb-0 justify-start" />
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-foreground" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-base font-medium transition-colors",
                      isActive
                            ? "bg-indigo-500 text-white"
                            : "text-muted-foreground hover:bg-slate-100"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto">
              <button
                onClick={() => logout()}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-6 pt-6 pb-8 px-4 bg-white/30 min-h-screen border-r border-slate-200/60">
        {/* Logo */}
        <div className="px-3 pt-1 mb-2 flex items-center">
          <ZerodraftLogo size="sm" className="mb-0 justify-start" />
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-base font-medium transition-colors",
                  isActive ? "bg-indigo-500 text-white" : "text-muted-foreground hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

          <div className="mt-auto">
          <button
            onClick={() => logout()}
            className="px-3 py-2 text-base text-muted-foreground hover:text-foreground transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
