"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepAddFeedsProps {
  onContinue: (feedData?: { url: string; isValid: boolean }) => void;
  initialUrl?: string;
}

type FeedStatus = "idle" | "active" | "inactive";

export function StepAddFeeds({ onContinue, initialUrl = "https://example.com/feed.xml" }: StepAddFeedsProps) {
  const [url, setUrl] = useState(initialUrl);
  const [feedStatus, setFeedStatus] = useState<FeedStatus>("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  const isValidUrl = (testUrl: string): boolean => {
    try {
      const parsed = new URL(testUrl);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleAdd = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setErrorText("Please enter an RSS feed URL");
      setFeedStatus("inactive");
      return;
    }

    if (!isValidUrl(trimmed)) {
      setErrorText("Please enter a valid URL (e.g. https://example.com/feed.xml)");
      setFeedStatus("inactive");
      return;
    }

    // Toggle or validate feed
    if (trimmed.includes("invalid") || trimmed.includes("broken")) {
      setErrorText("Feed unreachable or invalid XML format");
      setFeedStatus("inactive");
    } else {
      setErrorText(null);
      setFeedStatus("active");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const canContinue = feedStatus === "active";

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-7">
          <p className="text-xs font-mono font-medium text-slate-400 mb-1.5">
            Step 1 of 1
          </p>
          <h1 className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
            Add Sources
          </h1>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-2.5">
          <Label className="text-xs font-semibold text-slate-700 font-mono">
            RSS Feed URL
          </Label>

          <div className="flex items-center gap-3">
            {/* Input with inline status badge */}
            <div className="relative flex-1">
              <Input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setFeedStatus("idle");
                  setErrorText(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com/feed.xml"
                className={cn(
                  "h-[52px] rounded-full border border-slate-200/80 bg-white/90 shadow-2xs text-sm font-mono px-6 pr-28 text-slate-800 placeholder:text-slate-400 transition-all",
                  "focus-visible:ring-2 focus-visible:ring-[#4F62E8]/20 focus-visible:border-[#4F62E8] focus-visible:ring-offset-0",
                  feedStatus === "inactive" && "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-100",
                  feedStatus === "active" && "border-emerald-300 focus-visible:border-emerald-500 focus-visible:ring-emerald-100"
                )}
              />

              {/* Status pill inside input using shadcn Badge */}
              {feedStatus !== "idle" && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Badge
                    variant="outline"
                    className={cn(
                      "flex items-center gap-1 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full shadow-2xs transition-all h-6 border",
                      feedStatus === "active" && "text-emerald-600 bg-emerald-50 border-emerald-200",
                      feedStatus === "inactive" && "text-red-500 bg-red-50 border-red-200"
                    )}
                  >
                    {feedStatus === "active" ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        Active
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 stroke-[2.5]" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
              )}
            </div>

            {/* Add button */}
            <Button
              type="button"
              onClick={handleAdd}
              className="h-[52px] px-8 rounded-full bg-[#EBECEF] hover:bg-[#E2E4E8] text-[#161922] font-mono font-semibold text-sm shadow-none border-0 transition-colors cursor-pointer"
            >
              Add
            </Button>
          </div>

          {errorText && (
            <p className="text-xs font-mono text-red-500 font-medium px-2 mt-0.5">
              {errorText}
            </p>
          )}
        </div>
      </div>

      {/* Footer Continue */}
      <div className="flex justify-end pt-8 mt-auto">
        <Button
          type="button"
          onClick={() => onContinue({ url, isValid: feedStatus === "active" })}
          disabled={!canContinue}
          className={cn(
            "h-12 px-9 rounded-full text-sm font-mono font-semibold transition-all cursor-pointer",
            canContinue
              ? "bg-[#4F62E8] hover:bg-[#4353D3] text-white shadow-[0_4px_14px_rgba(79,98,232,0.3)]"
              : "bg-[#A3B4FA] hover:bg-[#92A5F8] text-white shadow-none cursor-not-allowed"
          )}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

