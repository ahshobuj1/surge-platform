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
import { DashboardHeader } from "./DashboardHeader";

export function DashboardOverview() {
  return (
    <div className="flex-1 flex flex-col overflow-auto bg-slate-100 min-h-screen">
      {/* Top header bar */}
      <DashboardHeader
        title="Dashboard"
        subtitle="Overview of your automation, recent activity, and publishing status."
      />

      {/* Content */}
      <div className="flex flex-col gap-4 px-8 pb-8 pt-4">
        <SystemStatusBar {...MOCK_SYSTEM_STATUS} />
        <TodaysTheme {...MOCK_TODAYS_THEME} />

        <div className="flex gap-4 items-start">
          <div className="flex-1 min-w-0">
            <RecentlyPublished articles={MOCK_ARTICLES} />
          </div>
          <div className="w-60 shrink-0 flex flex-col gap-4">
            <JobLog jobs={MOCK_JOB_LOG} />
            <ErrorAlerts alerts={MOCK_ERROR_ALERTS} />
          </div>
        </div>
      </div>
    </div>
  );
}
