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
import { Card } from "@/components/ui/card";
import { Clock, Lock, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"];
const TIMEZONES = ["UTC", "EST", "PST", "CST", "IST", "CET"];
const FREQUENCIES = ["Weekly", "Bi-Weekly", "Everyday", "Monthly"];
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export interface TimeSlot {
  hour: string;
  minute: string;
  period: string;
}

export interface ScheduleData {
  frequency: string;
  weekday: string;
  mainTime: TimeSlot;
  timezone: string;
  autoStart: boolean;
  multiRuns: TimeSlot[];
}

interface StepScheduleProps {
  onComplete: (data: ScheduleData) => void;
  onUpgradePlan?: (tier: "starter" | "pro" | "enterprise") => void;
  planTier?: "starter" | "pro" | "enterprise" | "free";
  initialData?: Partial<ScheduleData>;
}

// Compact pill time picker matching Figma
function TimePill({
  value,
  onChange,
  onDelete,
}: {
  value: TimeSlot;
  onChange: (v: TimeSlot) => void;
  onDelete?: () => void;
}) {
  // Format hour display without leading 0 for single digit
  const normalizedHour = value.hour.replace(/^0+/, "") || "1";

  return (
    <div className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full bg-white shadow-2xs border border-slate-200/80 font-mono text-xs text-slate-800">
      <select
        value={normalizedHour}
        onChange={(e) => onChange({ ...value, hour: e.target.value })}
        className="bg-transparent text-xs font-mono text-slate-800 outline-none cursor-pointer w-5 text-center appearance-none"
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-slate-400 font-mono text-xs">:</span>
      <select
        value={value.minute}
        onChange={(e) => onChange({ ...value, minute: e.target.value })}
        className="bg-transparent text-xs font-mono text-slate-800 outline-none cursor-pointer w-6 text-center appearance-none"
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={value.period}
        onChange={(e) => onChange({ ...value, period: e.target.value })}
        className="bg-transparent text-xs font-mono text-slate-800 outline-none cursor-pointer ml-0.5 appearance-none"
      >
        {PERIODS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <Clock className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="text-slate-400 hover:text-red-500 ml-1 p-0.5 cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export function StepSchedule({
  onComplete,
  onUpgradePlan,
  planTier = "starter",
  initialData,
}: StepScheduleProps) {
  const [frequency, setFrequency] = useState(initialData?.frequency || "Everyday");
  const [weekday, setWeekday] = useState(initialData?.weekday || "Monday");
  const [mainTime, setMainTime] = useState<TimeSlot>(
    initialData?.mainTime || { hour: "9", minute: "00", period: "AM" }
  );
  const [timezone, setTimezone] = useState(initialData?.timezone || "UTC");
  const [autoStart, setAutoStart] = useState(initialData?.autoStart ?? false);
  const [multiRuns, setMultiRuns] = useState<TimeSlot[]>(
    initialData?.multiRuns || [
      { hour: "9", minute: "00", period: "AM" },
      { hour: "3", minute: "00", period: "PM" },
    ]
  );

  const isWeekly = frequency === "Weekly" || frequency === "Bi-Weekly";
  const isEnterprise = planTier === "enterprise";

  // Dynamic next run string
  const nextRunDay = isWeekly ? weekday : frequency === "Everyday" ? "Tomorrow" : "1st of next month";
  const formattedHour = mainTime.hour.replace(/^0+/, "") || "1";
  const nextRunLabel = `${nextRunDay} at ${formattedHour}:${mainTime.minute} ${timezone}`;

  const addRun = () => {
    setMultiRuns((prev) => [...prev, { hour: "6", minute: "00", period: "PM" }]);
  };

  const updateRun = (idx: number, v: TimeSlot) => {
    setMultiRuns((prev) => prev.map((s, i) => (i === idx ? v : s)));
  };

  const deleteRun = (idx: number) => {
    setMultiRuns((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCompleteSetup = () => {
    onComplete({
      frequency,
      weekday,
      mainTime,
      timezone,
      autoStart,
      multiRuns,
    });
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-7">
          <p className="text-[11px] font-mono font-medium text-slate-400 mb-1">
            Step 4 of 4
          </p>
          <h1 className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
            Schedule
          </h1>
        </div>

        {/* Form Body */}
        <div className="flex flex-col gap-4">
          {/* Publish Time */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-700 font-mono">Publish time</Label>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Frequency dropdown */}
              <Select value={frequency} onValueChange={(val) => setFrequency(val || "Everyday")}>
                <SelectTrigger className="h-10 min-w-[105px] rounded-full border border-slate-200/80 bg-white shadow-2xs text-xs font-mono font-normal text-slate-800 px-4 focus:ring-2 focus:ring-[#3B6BF6]/20 focus:border-[#3B6BF6] focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-slate-100 shadow-xl p-1 bg-white font-mono">
                  {FREQUENCIES.map((f) => (
                    <SelectItem
                      key={f}
                      value={f}
                      className="rounded-xl text-xs font-mono py-2 px-3 cursor-pointer"
                    >
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Weekday — only when Weekly / Bi-Weekly */}
              {isWeekly && (
                <Select value={weekday} onValueChange={(val) => setWeekday(val || "Monday")}>
                  <SelectTrigger className="h-10 min-w-[110px] rounded-full border border-slate-200/80 bg-white shadow-2xs text-xs font-mono font-normal text-slate-800 px-4 focus:ring-2 focus:ring-[#3B6BF6]/20 focus:border-[#3B6BF6] focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-slate-100 shadow-xl p-1 bg-white font-mono">
                    {WEEKDAYS.map((d) => (
                      <SelectItem
                        key={d}
                        value={d}
                        className="rounded-xl text-xs font-mono py-2 px-3 cursor-pointer"
                      >
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Time slot pill */}
              <TimePill value={mainTime} onChange={setMainTime} />

              {/* Timezone */}
              <Select value={timezone} onValueChange={(v) => setTimezone(v ?? "UTC")}>
                <SelectTrigger className="h-10 min-w-[85px] rounded-full border border-slate-200/80 bg-white shadow-2xs text-xs font-mono font-normal text-slate-800 px-3 focus:ring-2 focus:ring-[#3B6BF6]/20 focus:border-[#3B6BF6] focus:ring-offset-0">
                  <SelectValue placeholder="TZ" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-slate-100 shadow-xl p-1 bg-white font-mono">
                  {TIMEZONES.map((tz) => (
                    <SelectItem
                      key={tz}
                      value={tz}
                      className="rounded-xl text-xs font-mono py-2 px-3 cursor-pointer"
                    >
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Next Run Banner pill */}
          <div className="h-12 px-6 rounded-full bg-[#FAF9F6]/80 border border-slate-200/70 text-xs font-mono shadow-2xs flex items-center">
            <span className="text-slate-400 font-normal mr-1.5">
              Next Run:
            </span>
            <span className="font-bold text-slate-800">{nextRunLabel}</span>
          </div>

          {/* Auto-Start toggle card */}
          <div className="flex items-center justify-between px-6 py-4 rounded-[20px] bg-[#FAF9F6]/80 border border-slate-200/70 shadow-2xs font-mono">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900">Auto-Start Immediately</p>
              <p className="text-[11px] text-slate-400 mt-0.5">System will begin polling feeds now</p>
            </div>
            <Switch
              checked={autoStart}
              onCheckedChange={setAutoStart}
              className="data-[state=checked]:bg-[#3B6BF6]"
            />
          </div>

          {/* Feature Gates & Plan Lock Info card */}
          {!isEnterprise ? (
            <div className="flex items-center justify-between px-6 py-5 rounded-[20px] bg-[#FAF9F6]/80 border border-slate-200/70 shadow-2xs font-mono">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">Flexible publishing</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">Multiple Daily Runs</span>
                </div>
              </div>
              <Button
                type="button"
                variant="link"
                onClick={() => onUpgradePlan?.("enterprise")}
                className="text-xs font-mono font-semibold text-[#1868F2] hover:underline cursor-pointer whitespace-nowrap ml-4 p-0 h-auto"
              >
                Upgrade to Enterprise
              </Button>
            </div>
          ) : (
            /* Enterprise Unlocked: Multiple Daily Runs card */
            <div className="flex flex-col gap-3 px-6 py-5 rounded-[20px] bg-[#FAF9F6]/80 border border-slate-200/70 shadow-2xs font-mono">
              <p className="text-xs sm:text-sm font-semibold text-slate-900">Multiple Daily Runs</p>
              <div className="flex flex-wrap items-center gap-3">
                {multiRuns.map((slot, idx) => (
                  <TimePill
                    key={idx}
                    value={slot}
                    onChange={(v) => updateRun(idx, v)}
                    onDelete={multiRuns.length > 1 ? () => deleteRun(idx) : undefined}
                  />
                ))}
                {/* + Add Run pill button with dashed border */}
                <button
                  type="button"
                  onClick={addRun}
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-dashed border-[#818CF8] bg-transparent text-[#4F62E8] hover:bg-[#EEF2FF] text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Run
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complete Setup */}
      <div className="flex justify-end pt-8 mt-auto">
        <Button
          type="button"
          onClick={handleCompleteSetup}
          className="h-11 px-8 rounded-full bg-[#3B6BF6] hover:bg-[#2557E0] text-white text-xs font-mono font-semibold shadow-xs transition-all cursor-pointer"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );
}