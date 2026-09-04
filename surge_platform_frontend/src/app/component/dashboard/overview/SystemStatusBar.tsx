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
    <div className="w-full bg-white rounded-2xl shadow-xs border border-white/60 overflow-hidden flex flex-col sm:flex-row items-stretch">
      {/* System Status — pure white section */}
      <div className="bg-white px-7 py-5 sm:w-56 flex flex-col justify-center gap-1.5 shrink-0">
        <p className="text-sm sm:text-base font-bold text-slate-900">System Status</p>
        <span
          className={cn(
            "inline-block w-fit text-xs font-semibold px-2.5 py-0.5 rounded-full",
            status === "Active" && "bg-[#DFFBE8] text-[#16A34A]",
            status === "Paused" && "bg-[#FEF6E7] text-[#D97706]",
            status === "Error"  && "bg-[#FEECEC] text-[#EF4444]"
          )}
        >
          {status}
        </span>
      </div>

      {/* Stats grid — soft tinted background section */}
      <div className="flex-1 bg-[#EEF3FE] px-4 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center text-center"
          >
            <p className="text-xs text-slate-400 font-normal whitespace-nowrap">
              {stat.label}
            </p>
            <p className="text-sm sm:text-base font-bold text-slate-900 mt-1 whitespace-nowrap">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}