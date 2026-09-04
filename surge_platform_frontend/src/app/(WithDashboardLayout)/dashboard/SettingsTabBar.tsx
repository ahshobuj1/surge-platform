"use client";

import { cn } from "@/lib/utils";

export type SettingsTab =
  | "profile"
  | "integration"
  | "schedule"
  | "billing";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "integration", label: "Integration" },
  { id: "schedule", label: "Schedule" },
  { id: "billing", label: "Billing" },
];

interface SettingsTabBarProps {
  activeTab: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

export function SettingsTabBar({ activeTab, onChange }: SettingsTabBarProps) {
  return (
    <div className="flex items-center gap-1.5 bg-white/40 border border-white/60 backdrop-blur-xs rounded-xl p-1.5 w-fit shadow-xs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
            activeTab === tab.id
              ? "bg-white text-[#5060F0] font-semibold shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/30"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
