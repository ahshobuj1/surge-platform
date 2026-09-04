"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import { DashboardHeader } from "../DashboardHeader";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/context/WorkspaceContext";
import { useAuth } from "@/lib/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { RssFeed } from "@/lib/types";

interface SubscriptionDetails {
  tier: "starter" | "pro" | "business";
  tierName: string;
  status: string;
  limits: {
    maxRssSources: number;
    maxChannels: number;
    monthlyPosts: number;
  };
  usage: {
    rssFeeds: number;
    channels: number;
    postsCount: number;
  };
}

function formatLastChecked(dateString?: string): string {
  if (!dateString) return "Last checked just now";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Last checked just now";
  if (diffMins < 60) return `Last checked ${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Last checked ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `Last checked on ${new Date(dateString).toLocaleDateString()}`;
}

function SourcesPage() {
  const { activeWorkspace } = useWorkspace();
  const { company } = useAuth();
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [subDetails, setSubDetails] = useState<SubscriptionDetails | null>(null);

  const reloadSubscription = async () => {
    try {
      const res = await api.get<SubscriptionDetails>("/companies/billing/subscription");
      if (res) {
        setSubDetails(res);
      }
    } catch {
      // Fallback to company context or defaults
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      if (!activeWorkspace?.id) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const [feedsRes, subRes] = await Promise.allSettled([
          api.get<RssFeed[]>(`/workspaces/${activeWorkspace.id}/rss-sources`),
          api.get<SubscriptionDetails>("/companies/billing/subscription"),
        ]);

        if (!cancelled) {
          if (feedsRes.status === "fulfilled" && Array.isArray(feedsRes.value)) {
            setFeeds(feedsRes.value);
          } else {
            setFeeds([]);
          }

          if (subRes.status === "fulfilled" && subRes.value) {
            setSubDetails(subRes.value);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace?.id]);

  // Subscription Limits
  const tierName =
    subDetails?.tierName ||
    (company?.subscriptionTier === "business"
      ? "Business"
      : company?.subscriptionTier === "starter"
      ? "Starter"
      : "Pro");

  const maxFeeds =
    subDetails?.limits?.maxRssSources ||
    (company?.subscriptionTier === "business"
      ? 50
      : company?.subscriptionTier === "starter"
      ? 5
      : 20);

  const isAtLimit = feeds.length >= maxFeeds;
  const usedPercent = Math.min(100, Math.round((feeds.length / (maxFeeds || 1)) * 100));
  const frequencyHours = activeWorkspace?.queue_config?.fetchFrequencyHours || 4;

  const handleAdd = async () => {
    let targetUrl = newUrl.trim();
    if (!targetUrl) return;

    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      new URL(targetUrl);
    } catch {
      setError("Please enter a valid RSS feed URL (e.g. https://techcrunch.com/feed/).");
      return;
    }

    if (isAtLimit) {
      setError(`You have reached the maximum allowed RSS feeds (${maxFeeds}) for your ${tierName} plan. Please upgrade to add more.`);
      return;
    }

    if (!activeWorkspace?.id) {
      setError("Please select an active workspace first.");
      return;
    }

    setAdding(true);
    setError("");
    try {
      const created = await api.post<RssFeed>(`/workspaces/${activeWorkspace.id}/rss-sources`, {
        feedUrl: targetUrl,
      });
      setFeeds((prev) => [created, ...prev]);
      setNewUrl("");
      void reloadSubscription();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add feed. Please verify the URL and try again.");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!activeWorkspace?.id) return;
    try {
      await api.delete(`/workspaces/${activeWorkspace.id}/rss-sources/${id}?force=true`);
      setFeeds((prev) => prev.filter((f) => f.id !== id));
      void reloadSubscription();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete feed.");
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-auto font-sans">
      <DashboardHeader
        title="Sources"
        subtitle="Add and manage RSS feeds used for content collection."
      />

      <div className="px-6 sm:px-8 pb-12 w-full flex flex-col gap-6">
        {/* Main Clean Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-white/80 flex flex-col gap-6 w-full">
          {/* Card Top Title & Limit Bar */}
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">RSS Feeds</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs sm:text-sm font-medium text-slate-500">
                {feeds.length} / {maxFeeds} feeds used
              </span>
              <span className="bg-[#EEF1FE] text-[#5E6DF6] text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {tierName}
              </span>
            </div>
            <div className="w-44 sm:w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-[#5E6DF6] h-full rounded-full transition-all duration-500"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
          </div>

          {/* Feeds List */}
          <div className="flex flex-col divide-y divide-slate-100 my-1">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                Loading RSS feeds...
              </div>
            ) : feeds.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No RSS feeds connected yet. Add your first feed below.
              </div>
            ) : (
              feeds.map((feed) => {
                const isError = feed.status === "error";
                const displayUrl = feed.feedUrl.replace(/^https?:\/\//i, "");

                return (
                  <div
                    key={feed.id}
                    className="flex items-center justify-between py-4 first:pt-2 last:pb-2 gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          isError ? "bg-red-500" : "bg-emerald-500"
                        )}
                      />
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {displayUrl}
                        </p>
                        {isError ? (
                          <p className="text-xs text-red-500 mt-0.5">
                            Invalid feed URL · Unable to reach
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 mt-0.5">
                            Checked every {frequencyHours} {frequencyHours === 1 ? "hour" : "hours"} ·{" "}
                            {formatLastChecked(feed.lastFetchedAt || feed.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(feed.id)}
                      title="Remove Feed"
                      className="text-red-400 hover:text-red-600 transition-colors p-1 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5 stroke-[1.75]" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Add New RSS Feed Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleAdd();
            }}
            className="mt-2"
          >
            <div className="rounded-full bg-slate-100/70 border border-slate-200/60 p-1.5 pl-5 flex items-center justify-between gap-3 shadow-2xs">
              <input
                type="text"
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value);
                  setError("");
                }}
                placeholder="https://example.com/feed"
                disabled={adding || isAtLimit}
                className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 flex-1 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={adding || isAtLimit || !newUrl.trim()}
                className="bg-[#4F62E8] hover:bg-[#4353D3] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm px-6 h-9 rounded-full shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                {adding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Add
              </button>
            </div>
          </form>

          {/* Subscription Limit Warning Notice */}
          {isAtLimit && (
            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 px-4">
              <span>
                You have reached your {tierName} plan limit of {maxFeeds} feeds.
              </span>
              <Link
                href="/dashboard/settings"
                className="text-[#5E6DF6] font-semibold hover:underline shrink-0 ml-2"
              >
                Upgrade Plan
              </Link>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 text-xs font-medium text-red-700 bg-red-50 rounded-2xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SourcesPage;