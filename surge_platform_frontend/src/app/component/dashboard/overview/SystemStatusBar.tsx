import { cn } from "@/lib/utils";

interface SystemStatusBarProps {
  status: "Active" | "Paused" | "Error";
  lastRun: string;
  nextRun: string;
  feedsCount: number;
  publishedLast7d: number;
}

export function SystemStatusBar({
  status,
  lastRun,
  nextRun,
  feedsCount,
  publishedLast7d,
}: SystemStatusBarProps) {
  const stats = [
    { label: "Last Run",        value: lastRun },
    { label: "Next Run",        value: nextRun },
    { label: "Feeds",           value: feedsCount },
    { label: "Published (7d)",  value: publishedLast7d },
  ];

  return (
    <div className="w-full bg-white rounded-md shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

        {/* System Status — slate bg section */}
        <div className="bg-slate-50 px-6 py-5 sm:min-w-[190px] flex flex-col justify-center gap-2">
          <p className="text-base font-bold text-foreground">System Status</p>
          <span
            className={cn(
              "inline-block w-fit text-xs font-semibold px-3 py-1 rounded-full",
              status === "Active" && "bg-emerald-100 text-emerald-600",
              status === "Paused" && "bg-amber-100 text-amber-600",
              status === "Error"  && "bg-red-100 text-red-500"
            )}
          >
            {status}
          </span>
        </div>

        {/* Stats grid — responsive: 2x2 on mobile, row on desktop */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center gap-1 px-4 py-5 text-center"
            >
              <p className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                {stat.label}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground whitespace-nowrap">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}