"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Lock, Plus } from "lucide-react";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"];
const TIMEZONES = ["UTC", "EST", "PST", "CST", "IST", "CET"];
const FREQUENCIES = ["Everyday", "Weekly", "Monthly"];
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Change to "pro" or "enterprise" to unlock features
const PLAN: "free" | "pro" | "enterprise" = "free";

interface TimeSlot {
  hour: string;
  minute: string;
  period: string;
}

interface StepScheduleProps {
  onComplete: () => void;
}

// Compact time pill used in both main picker and Multiple Daily Runs
function TimePill({
  value,
  onChange,
}: {
  value: TimeSlot;
  onChange: (v: TimeSlot) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 h-11 px-3 rounded-2xl bg-white shadow-sm border border-slate-200">
      <select
        value={value.hour}
        onChange={(e) => onChange({ ...value, hour: e.target.value })}
        className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer w-6 text-center appearance-none"
      >
        {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="text-slate-500 font-bold text-sm"> : </span>
      <select
        value={value.minute}
        onChange={(e) => onChange({ ...value, minute: e.target.value })}
        className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer w-6 text-center appearance-none"
      >
        {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <select
        value={value.period}
        onChange={(e) => onChange({ ...value, period: e.target.value })}
        className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer ml-1 appearance-none"
      >
        {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5 shrink-0" />
    </div>
  );
}

export function StepSchedule({ onComplete }: StepScheduleProps) {
  const [frequency, setFrequency] = useState("Everyday");
  const [weekday, setWeekday] = useState("Monday");
  const [mainTime, setMainTime] = useState<TimeSlot>({ hour: "9", minute: "00", period: "AM" });
  const [timezone, setTimezone] = useState("UTC");
  const [autoStart, setAutoStart] = useState(false);
  const [multiRuns, setMultiRuns] = useState<TimeSlot[]>([
    { hour: "9", minute: "00", period: "AM" },
    { hour: "3", minute: "00", period: "PM" },
  ]);

  const isWeekly = frequency === "Weekly";
  const isEveryday = frequency === "Everyday";
  const isPro = PLAN === "pro" || PLAN === "enterprise";

  // Label logic
  const publishLabel = isEveryday ? "Publish time" : isWeekly ? "Publish time" : "Weekly Publish time";

  // Next run
  const nextRunDay = isWeekly ? weekday : "Tomorrow";
  const nextRunLabel = `${nextRunDay} at ${mainTime.hour}:${mainTime.minute} ${timezone}`;

  const addRun = () => {
    setMultiRuns((prev) => [...prev, { hour: "12", minute: "00", period: "PM" }]);
  };

  const updateRun = (idx: number, v: TimeSlot) => {
    setMultiRuns((prev) => prev.map((s, i) => (i === idx ? v : s)));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">
          Step 4 of 4
        </p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Schedule</h1>
      </div>

      {/* Publish Time */}
      <div className="flex flex-col gap-2.5">
        <Label className="text-sm font-semibold text-slate-700">{publishLabel}</Label>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Frequency dropdown — hidden when showing fixed "Monday" (Image 1 state) */}
          {/* Show frequency only when NOT in the "Monday-only" locked weekly state */}
          <Select value={frequency} onValueChange={(val) => setFrequency(val || "Daily")}>
            <SelectTrigger className="h-11 w-[120px] rounded-2xl border border-slate-200 bg-white shadow-sm text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg">
              {FREQUENCIES.map((f) => (
                <SelectItem key={f} value={f} className="text-sm font-medium">{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Weekday — only when Weekly */}
          {isWeekly && (
            <Select value={weekday} onValueChange={(val) => setWeekday(val || "Monday")}>
              <SelectTrigger className="h-11 w-[120px] rounded-2xl border border-slate-200 bg-white shadow-sm text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg">
                {WEEKDAYS.map((d) => (
                  <SelectItem key={d} value={d} className="text-sm font-medium">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Time pill */}
          <TimePill value={mainTime} onChange={setMainTime} />

          {/* Timezone */}
          <Select value={timezone} onValueChange={(v) => setTimezone(v ?? "UTC")}>
            <SelectTrigger className="h-11 w-[90px] rounded-2xl border border-slate-200 bg-white shadow-sm text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-0">
              <SelectValue placeholder="TZ" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg">
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz} className="text-sm font-medium">{tz}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Next Run */}
      <div className="flex items-center px-4 py-3.5 rounded-2xl bg-white/80 border border-slate-100 shadow-sm">
        <span className="text-sm text-slate-500">
          Next Run: <span className="font-bold text-slate-800">{nextRunLabel}</span>
        </span>
      </div>

      {/* Auto-Start toggle */}
      <div className="flex items-center justify-between px-4 py-4 rounded-2xl bg-white/80 border border-slate-100 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-800">Auto-Start Immediately</p>
          <p className="text-xs text-slate-400 mt-0.5">System will begin polling feeds now</p>
        </div>
        <Switch
          checked={autoStart}
          onCheckedChange={setAutoStart}
          className="data-[state=checked]:bg-indigo-500"
        />
      </div>

      {/* Locked: Everyday → Upgrade to Enterprise (2 rows) */}
      {!isPro && isEveryday && (
        <div className="flex items-center justify-between px-4 py-4 rounded-2xl bg-white/80 border border-slate-100 shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span className="text-sm">Flexible publishing</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span className="text-sm">Multiple Daily Runs</span>
            </div>
          </div>
          <button className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 whitespace-nowrap ml-4">
            Upgrade to Enterprise
          </button>
        </div>
      )}

      {/* Locked: Weekly + free → Upgrade to Enterprise (2 rows) */}
      {!isPro && isWeekly && (
        <div className="flex items-center justify-between px-4 py-4 rounded-2xl bg-white/80 border border-slate-100 shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span className="text-sm">Flexible publishing</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span className="text-sm">Multiple Daily Runs</span>
            </div>
          </div>
          <button className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 whitespace-nowrap ml-4">
            Upgrade to Enterprise
          </button>
        </div>
      )}

      {/* Locked: Monthly/other + free → Upgrade to Pro (1 row) */}
      {!isPro && !isEveryday && !isWeekly && (
        <div className="flex items-center justify-between px-4 py-4 rounded-2xl bg-white/80 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span className="text-sm">Multiple Daily Runs</span>
          </div>
          <button className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 whitespace-nowrap ml-4">
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* Multiple Daily Runs — Pro unlocked (Image 4) */}
      {isPro && (
        <div className="flex flex-col gap-3 px-4 py-4 rounded-2xl bg-white/80 border border-slate-100 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">Multiple Daily Runs</p>
          <div className="flex flex-wrap items-center gap-2">
            {multiRuns.map((slot, idx) => (
              <TimePill
                key={idx}
                value={slot}
                onChange={(v) => updateRun(idx, v)}
              />
            ))}
            {/* + Add Run button */}
            <button
              onClick={addRun}
              className="inline-flex items-center gap-1.5 h-11 px-4 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Run
            </button>
          </div>
        </div>
      )} 

      {/* Complete Setup */}
      <div className="flex justify-end pt-1">
        <Button
          onClick={onComplete}
          className="h-11 px-8 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold shadow-md transition-all"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );
}