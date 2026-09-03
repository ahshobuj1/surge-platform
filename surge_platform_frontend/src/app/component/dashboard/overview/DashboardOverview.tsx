"use client";

import { useEffect, useState } from "react";
import { SystemStatusBar } from "./SystemStatusBar";
import { TodaysTheme } from "./TodaysTheme";
import { RecentlyPublished } from "./RecentlyPublished";
import { JobLog } from "./JobLog";
import { ErrorAlerts } from "./ErrorAlerts";
import {
  MOCK_ERROR_ALERTS,
  MOCK_JOB_LOG,
  MOCK_TODAYS_THEME,
} from "./mock-data";
import { DashboardHeader } from "@/app/(WithDashboardLayout)/dashboard/DashboardHeader";
import { useWorkspace } from "@/lib/context/WorkspaceContext";
import { api } from "@/lib/api";
import { WorkspaceAnalyticsResponse } from "@/lib/types";
import { Article, ArticleStatus } from "./types";

export function DashboardOverview() {
  const { activeWorkspace } = useWorkspace();
  const [analytics, setAnalytics] = useState<WorkspaceAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!activeWorkspace?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await api.get<WorkspaceAnalyticsResponse>(
          `/workspaces/${activeWorkspace.id}/analytics`
        );
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [activeWorkspace?.id]);

  // Map live analytics to SystemStatusBar props
  const systemStatus = analytics
    ? {
        status: (analytics.overview.failed > 0 ? "Error" : "Active") as "Active" | "Paused" | "Error",
        lastRun: "Recently",
        nextRun: "Scheduled",
        feedsCount: analytics.overview.activeRssFeeds,
        publishedLast7d: analytics.overview.published,
      }
    : {
        status: "Active" as const,
        lastRun: "—",
        nextRun: "—",
        feedsCount: 0,
        publishedLast7d: 0,
      };

  // Map audit logs to RecentlyPublished articles
  const recentArticles: Article[] = (analytics?.auditLogs || []).map((log) => ({
    id: log.id,
    title: log.channel?.channelName || log.channelId || "Unknown Channel",
    time: new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    source: log.channel?.platform || "Unknown",
    status: (log.status === "success" ? "Published" : log.status === "failed" ? "Failed" : "Retried") as ArticleStatus,
    preview: log.platformPostUrl || log.errorMessage || "No details available",
  }));

  // Map analytics to TodaysTheme
  const todaysTheme = analytics
    ? {
        theme: `${analytics.overview.totalDrafts} total drafts`,
        sourced: analytics.overview.activeRssFeeds,
        generated: analytics.overview.totalDrafts,
      }
    : MOCK_TODAYS_THEME;

  return (
    <div className="flex-1 flex flex-col bg-muted/40 min-h-screen overflow-auto max-w-full">
      <DashboardHeader
        title="Dashboard"
        subtitle="Overview of your automation, recent activity, and publishing status."
      />
      <div className="flex flex-col gap-4 px-4 sm:px-8 pb-8 pt-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            Loading dashboard analytics...
          </div>
        ) : (
          <>
            {/* Analytics stats row */}
            {analytics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-slate-100 p-4 text-center shadow-sm">
                  <p className="text-sm text-muted-foreground">Total Drafts</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.overview.totalDrafts}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4 text-center shadow-sm">
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-3xl font-bold text-emerald-600">{analytics.overview.published}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4 text-center shadow-sm">
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-3xl font-bold text-indigo-600">{analytics.overview.successRatePercent}%</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4 text-center shadow-sm">
                  <p className="text-sm text-muted-foreground">Active Channels</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.overview.activeChannels}</p>
                </div>
              </div>
            )}

            <SystemStatusBar {...systemStatus} />
            <TodaysTheme data={todaysTheme} />
            <div className="flex gap-4 items-start flex-col lg:flex-row">
              <div className="flex-1 w-full">
                <RecentlyPublished articles={recentArticles.length > 0 ? recentArticles : []} />
              </div>
              <div className="flex flex-col gap-4 w-full lg:w-96">
                <JobLog jobs={MOCK_JOB_LOG} />
                <ErrorAlerts alerts={analytics?.overview.failed ? MOCK_ERROR_ALERTS : []} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}