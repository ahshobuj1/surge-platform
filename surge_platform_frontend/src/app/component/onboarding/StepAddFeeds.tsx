"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepAddFeedsProps {
  onContinue: () => void;
}

type FeedStatus = "idle" | "active" | "inactive";

export function StepAddFeeds({ onContinue }: StepAddFeedsProps) {
  const [url, setUrl] = useState("https://example.com/feed.xml");
  const [feedStatus, setFeedStatus] = useState<FeedStatus>("idle");

  const handleAdd = () => {
    if (!url.trim()) return;
    // Simulate validation — toggle between active/inactive for demo
    setFeedStatus((prev) =>
      prev === "active" ? "inactive" : "active"
    );
  };

  const canContinue = feedStatus === "active";

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">
          Step 1 of 4
        </p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Add Sources
        </h1>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium text-slate-700">
          RSS Feed URL
        </Label>

        <div className="flex items-center gap-3">
          {/* Input with status badge */}
          <div className="relative flex-1">
            <Input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setFeedStatus("idle");
              }}
              placeholder="https://example.com/feed.xml"
              className={cn(
                "h-12 rounded-2xl border-0 bg-white/70 shadow-sm text-sm pr-24",
                "focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-0",
                "placeholder:text-slate-400 text-slate-700"
              )}
            />

            {/* Status pill inside input */}
            {feedStatus !== "idle" && (
              <div
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                  feedStatus === "active" &&
                    "text-emerald-600",
                  feedStatus === "inactive" &&
                    "text-red-400"
                )}
              >
                {feedStatus === "active" ? (
                  <>
                    <Check className="w-3 h-3" />
                    Active
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3" />
                    Inactive
                  </>
                )}
              </div>
            )}
          </div>

          {/* Add button */}
          <Button
            onClick={handleAdd}
            variant="outline"
            className="h-12 px-6 rounded-2xl border-0 bg-white shadow-sm text-sm font-semibold text-slate-700 hover:bg-white/90"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Continue */}
      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            "h-11 px-8 rounded-2xl text-sm font-semibold transition-all",
            canContinue
              ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-md"
              : "bg-indigo-200 text-indigo-300 cursor-not-allowed"
          )}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
