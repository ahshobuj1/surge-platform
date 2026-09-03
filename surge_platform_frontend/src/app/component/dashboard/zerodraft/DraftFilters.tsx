"use client";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FilterStatus } from "./types";

const STATUS_FILTERS: FilterStatus[] = ["All", "Draft", "Published", "Failed", "Retried"];

interface DraftFiltersProps {
  search:        string;
  activeFilter:  FilterStatus;
  autoPosting:   boolean;
  onSearch:      (val: string) => void;
  onFilter:      (f: FilterStatus) => void;
  onAutoPosting: (val: boolean) => void;
}

export function DraftFilters({
  search,
  activeFilter,
  autoPosting,
  onSearch,
  onFilter,
  onAutoPosting,
}: DraftFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search drafts..."
              className="w-full pl-9 pr-4 h-10 rounded-xl border border-slate-200 bg-white text-base sm:text-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => onFilter(f)}
              className={cn(
              "px-3 py-1.5 rounded-lg text-sm sm:text-base font-semibold transition-colors",
              activeFilter === f
                ? "bg-indigo-600 text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-slate-200"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Auto posting */}
      <div className="flex items-center gap-2 sm:ml-auto">
        <span className="text-base sm:text-lg font-medium text-muted-foreground">Auto posting</span>
        <Switch
          checked={autoPosting}
          onCheckedChange={onAutoPosting}
          className="data-[state=checked]:bg-indigo-500"
        />
      </div>
    </div>
  );
}