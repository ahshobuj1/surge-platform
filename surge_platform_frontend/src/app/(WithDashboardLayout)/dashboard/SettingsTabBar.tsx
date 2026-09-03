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
    <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-100 shadow-sm p-1 w-fit">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-1.5 rounded-lg text-base font-medium transition-all",
            activeTab === tab.id
              ? "bg-indigo-500 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-slate-50"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
