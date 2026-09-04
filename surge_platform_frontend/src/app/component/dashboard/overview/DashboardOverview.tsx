"use client";

import { SystemStatusBar } from "./SystemStatusBar";
import { TodaysTheme } from "./TodaysTheme";
import { RecentlyPublished } from "./RecentlyPublished";
import { JobLog } from "./JobLog";
import { ErrorAlerts } from "./ErrorAlerts";
import {
  MOCK_ARTICLES,
  MOCK_ERROR_ALERTS,
  MOCK_JOB_LOG,
  MOCK_SYSTEM_STATUS,
  MOCK_TODAYS_THEME,
} from "./mock-data";
import { DashboardHeader } from "@/app/(WithDashboardLayout)/dashboard/DashboardHeader";

export function DashboardOverview() {
  const systemStatus = MOCK_SYSTEM_STATUS;
  const articles = MOCK_ARTICLES;

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-auto max-w-full">
      <DashboardHeader
        title="Dashboard"
        subtitle="Overview of your automation, recent activity, and publishing status."
      />
      <div className="flex flex-col gap-5 px-6 sm:px-8 pb-10 pt-2">
        <SystemStatusBar {...systemStatus} />
        <TodaysTheme data={MOCK_TODAYS_THEME} />
        <div className="flex gap-5 items-start flex-col lg:flex-row">
          <div className="flex-1 min-w-0 w-full">
            <RecentlyPublished articles={articles} />
          </div>
          <div className="flex flex-col gap-5 w-full lg:w-80 shrink-0">
            <JobLog jobs={MOCK_JOB_LOG} />
            <ErrorAlerts alerts={MOCK_ERROR_ALERTS} />
          </div>
        </div>
      </div>
    </div>
  );
}