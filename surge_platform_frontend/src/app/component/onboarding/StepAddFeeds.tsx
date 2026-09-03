"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle, Loader2, Rss, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export interface ValidatedFeedInfo {
  url: string;
  isValid: boolean;
  title?: string;
  description?: string;
  itemCount?: number;
  latestArticle?: string;
}

interface StepAddFeedsProps {
  onContinue: (feedData?: ValidatedFeedInfo) => void;
  initialUrl?: string;
  workspaceId?: string;
}

type FeedStatus = "idle" | "validating" | "active" | "inactive";

interface BackendValidationResponse {
  isValid: boolean;
  feedUrl: string;
  title: string;
  description: string;
  itemCount: number;
  latestItem?: {
    title: string;
    link: string;
    pubDate?: string;
  } | null;
}

export function StepAddFeeds({
  onContinue,
  initialUrl = "",
  workspaceId,
}: StepAddFeedsProps) {
  const [url, setUrl] = useState(
    initialUrl === "https://example.com/feed.xml" ? "" : initialUrl,
  );
  const [feedStatus, setFeedStatus] = useState<FeedStatus>(
    initialUrl && initialUrl !== "https://example.com/feed.xml"
      ? "active"
      : "idle",
  );
  const [feedDetails, setFeedDetails] = useState<{
    title: string;
    description?: string;
    itemCount: number;
    latestTitle?: string;
  } | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const isValidUrlFormat = (testUrl: string): boolean => {
    try {
      const parsed = new URL(testUrl);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleValidateAndAdd = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setErrorText("Please enter an RSS feed URL");
      setFeedStatus("inactive");
      return;
    }

    if (!isValidUrlFormat(trimmed)) {
      setErrorText("Please enter a valid HTTP or HTTPS URL (e.g. https://techcrunch.com/feed/)");
      setFeedStatus("inactive");
      return;
    }

    setFeedStatus("validating");
    setErrorText(null);

    try {
      const endpoint = workspaceId
        ? `/workspaces/${workspaceId}/rss-sources/validate`
        : `/workspaces/rss-sources/validate`;

      const res = await api.post<BackendValidationResponse>(endpoint, {
        url: trimmed,
      });

      if (res?.isValid) {
        setFeedStatus("active");
        setFeedDetails({
          title: res.title || "RSS Feed",
          description: res.description,
          itemCount: res.itemCount ?? 0,
          latestTitle: res.latestItem?.title,
        });
        setErrorText(null);
      } else {
        setFeedStatus("inactive");
        setFeedDetails(null);
        setErrorText("The provided URL is not a recognized RSS or Atom feed.");
      }
    } catch (err: unknown) {
      setFeedStatus("inactive");
      setFeedDetails(null);
      const message =
        err instanceof Error
          ? err.message
          : "Could not reach or validate the RSS feed. Please check the URL and try again.";
      setErrorText(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (feedStatus !== "validating") {
        void handleValidateAndAdd();
      }
    }
  };

  const handleResetFeed = () => {
    setFeedStatus("idle");
    setFeedDetails(null);
    setErrorText(null);
  };

  const canContinue = feedStatus === "active";

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-7">
          <p className="text-xs font-mono font-medium text-slate-400 mb-1.5">
            Step 1 of 4
          </p>
          <h1 className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
            Add Sources
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Connect an RSS or Atom feed. We will verify that it is live and readable.
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3">
          <Label className="text-xs font-semibold text-slate-700 font-mono">
            RSS Feed URL
          </Label>

          <div className="flex items-center gap-3">
            {/* Input with inline status badge */}
            <div className="relative flex-1">
              <Input
                type="url"
                value={url}
                disabled={feedStatus === "validating"}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (feedStatus !== "idle") {
                    setFeedStatus("idle");
                    setFeedDetails(null);
                    setErrorText(null);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="https://techcrunch.com/feed/"
                className={cn(
                  "h-[52px] rounded-full border border-slate-200/80 bg-white/90 shadow-2xs text-sm font-mono px-6 pr-32 text-slate-800 placeholder:text-slate-400 transition-all",
                  "focus-visible:ring-2 focus-visible:ring-[#4F62E8]/20 focus-visible:border-[#4F62E8] focus-visible:ring-offset-0",
                  feedStatus === "inactive" &&
                    "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-100",
                  feedStatus === "active" &&
                    "border-emerald-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-100",
                )}
              />

              {/* Status pill inside input */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                {feedStatus === "validating" && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full h-6 border text-indigo-600 bg-indigo-50 border-indigo-200"
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking
                  </Badge>
                )}
                {feedStatus === "active" && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full shadow-2xs transition-all h-6 border text-emerald-600 bg-emerald-50 border-emerald-200"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                    Verified
                  </Badge>
                )}
                {feedStatus === "inactive" && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full shadow-2xs transition-all h-6 border text-red-500 bg-red-50 border-red-200"
                  >
                    <AlertCircle className="w-3 h-3 stroke-[2.5]" />
                    Invalid
                  </Badge>
                )}
              </div>
            </div>

            {/* Validate / Add button */}
            <Button
              type="button"
              onClick={() => void handleValidateAndAdd()}
              disabled={feedStatus === "validating" || !url.trim()}
              className="h-[52px] px-8 rounded-full bg-[#4F62E8] hover:bg-[#4353D3] text-white font-mono font-semibold text-sm shadow-[0_2px_8px_rgba(79,98,232,0.25)] border-0 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {feedStatus === "validating" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Verifying
                </>
              ) : (
                "Verify Feed"
              )}
            </Button>
          </div>

          {/* Inline Error Text */}
          {errorText && (
            <div className="flex items-start gap-1.5 text-xs font-mono text-red-600 font-medium px-2 mt-1">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Verified Feed Preview Card (Single Feed Constraint) */}
          {feedStatus === "active" && feedDetails && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 transition-all flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <Rss className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate font-mono">
                      {feedDetails.title}
                    </p>
                    <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      {feedDetails.itemCount} articles found
                    </span>
                  </div>
                  {feedDetails.latestTitle ? (
                    <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
                      Latest: &quot;{feedDetails.latestTitle}&quot;
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
                      Ready for content generation
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFeed}
                className="text-xs font-mono text-slate-500 hover:text-slate-800 shrink-0"
              >
                Change
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Continue */}
      <div className="flex justify-between items-center pt-8 mt-auto border-t border-slate-100">
        <p className="text-xs font-mono text-slate-400">
          {canContinue
            ? "✓ Source verified. Click Continue to proceed."
            : "Verify an RSS source to unlock the next step."}
        </p>
        <Button
          type="button"
          onClick={() =>
            onContinue({
              url: url.trim(),
              isValid: feedStatus === "active",
              title: feedDetails?.title,
              description: feedDetails?.description,
              itemCount: feedDetails?.itemCount,
              latestArticle: feedDetails?.latestTitle,
            })
          }
          disabled={!canContinue}
          className={cn(
            "h-12 px-9 rounded-full text-sm font-mono font-semibold transition-all cursor-pointer flex items-center gap-2",
            canContinue
              ? "bg-[#4F62E8] hover:bg-[#4353D3] text-white shadow-[0_4px_14px_rgba(79,98,232,0.3)]"
              : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed hover:bg-slate-200",
          )}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
