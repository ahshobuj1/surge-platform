"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user } = useAuth();

  const displayName =
    user?.fullName || user?.name || (user?.email ? user.email.split("@")[0] : "User");

  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .substring(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="flex flex-row items-center justify-between px-6 sm:px-8 pt-8 pb-5 gap-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden text-slate-700 cursor-pointer" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-normal">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-white rounded-full pl-1.5 pr-4 py-1.5 flex items-center gap-2.5 shadow-xs border border-white/80">
          {user?.avatarKey ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={user.avatarKey}
              alt={displayName}
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#5E6DF6] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
          )}
          <span className="text-sm font-semibold text-slate-700">{displayName}</span>
        </div>
      </div>
    </div>
  );
}