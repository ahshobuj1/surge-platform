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
import { AlertCircle, ArrowRight, Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { PlanId } from "./StepPaywall";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"];
const TIMEZONES = ["UTC", "EST", "PST", "CST", "IST", "CET"];
const FREQUENCIES = ["Everyday", "Weekly", "Bi-Weekly", "Monthly"];
const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

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
  onUpgradePlan?: (tier: PlanId) => void;
  planTier?: PlanId;
  initialData?: Partial<ScheduleData>;
  workspaceId?: string;
}

// Compact pill time picker
function TimePill({
  value,
  onChange,
  onDelete,
}: {
  value: TimeSlot;
  onChange: (v: TimeSlot) => void;
  onDelete?: () => void;
}) {
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
  workspaceId,
}: StepScheduleProps) {
  const [frequency, setFrequency] = useState(initialData?.frequency || "Everyday");
  const [weekday, setWeekday] = useState(initialData?.weekday || "Monday");
  const [mainTime, setMainTime] = useState<TimeSlot>(
    initialData?.mainTime || { hour: "9", minute: "00", period: "AM" },
  );
  const [timezone, setTimezone] = useState(initialData?.timezone || "UTC");
  const [autoStart, setAutoStart] = useState(initialData?.autoStart ?? true);
  const [multiRuns, setMultiRuns] = useState<TimeSlot[]>(
    initialData?.multiRuns || [
      { hour: "9", minute: "00", period: "AM" },
      { hour: "3", minute: "00", period: "PM" },
    ],
  );
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const isWeekly = frequency === "Weekly" || frequency === "Bi-Weekly";
  const isEnterprise = planTier === "enterprise";

  // Dynamic next run label
  const nextRunDay = isWeekly
    ? weekday
    : frequency === "Everyday"
      ? "Tomorrow"
      : "1st of next month";
  const formattedHour = mainTime.hour.replace(/^0+/, "") || "1";
  const nextRunLabel = `${nextRunDay} at ${formattedHour}:${mainTime.minute} ${mainTime.period} ${timezone}`;

  const addRun = () => {
    setMultiRuns((prev) => [
      ...prev,
      { hour: "6", minute: "00", period: "PM" },
    ]);
  };

  const updateRun = (idx: number, v: TimeSlot) => {
    setMultiRuns((prev) => prev.map((s, i) => (i === idx ? v : s)));
  };

  const deleteRun = (idx: number) => {
    setMultiRuns((prev) => prev.filter((_, i) => i !== idx));
  };

  const formatTimeSlot24h = (slot: TimeSlot): string => {
    let h = parseInt(slot.hour, 10);
    if (isNaN(h)) h = 9;
    if (slot.period === "PM" && h < 12) h += 12;
    if (slot.period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${slot.minute}`;
  };

  const handleCompleteSetup = async () => {
    setSaving(true);
    setErrorText(null);

    try {
      if (workspaceId) {
        const postingTimes = [formatTimeSlot24h(mainTime)];
        if (isEnterprise) {
          multiRuns.forEach((slot) => {
            const t24 = formatTimeSlot24h(slot);
            if (!postingTimes.includes(t24)) {
              postingTimes.push(t24);
            }
          });
        }

        const frequencyHours =
          frequency === "Weekly"
            ? 168
            : frequency === "Bi-Weekly"
              ? 336
              : frequency === "Monthly"
                ? 720
                : 24;

        await api.patch(`/workspaces/${workspaceId}/queue-config`, {
          autoPost: autoStart,
          fetchFrequencyHours: frequencyHours,
          postingTimes,
          timezone,
          publishingFrequency: frequency,
          publishingWeekday: isWeekly ? weekday : undefined,
        });
      }

      onComplete({
        frequency,
        weekday,
        mainTime,
        timezone,
        autoStart,
        multiRuns,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to persist schedule configuration.";
      setErrorText(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col justify-between h-full font-mono">
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-mono font-medium text-slate-400 mb-1.5">
            Step 4 of 4
          </p>
          <h1 className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
            Schedule
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Configure when articles should automatically generate and publish.
          </p>
        </div>

        {/* Form Body */}
        <div className="flex flex-col gap-4">
          {/* Publish Time */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-700 font-mono">
              Publishing Schedule
            </Label>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Frequency dropdown */}
              <Select
                value={frequency}
                onValueChange={(val) => setFrequency(val || "Everyday")}
              >
                <SelectTrigger className="h-10 min-w-[105px] rounded-full border border-slate-200/80 bg-white shadow-2xs text-xs font-mono font-normal text-slate-800 px-4 focus:ring-2 focus:ring-[#3B6BF6]/20 focus:border-[#3B6BF6]">
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
                <Select
                  value={weekday}
                  onValueChange={(val) => setWeekday(val || "Monday")}
                >
                  <SelectTrigger className="h-10 min-w-[110px] rounded-full border border-slate-200/80 bg-white shadow-2xs text-xs font-mono font-normal text-slate-800 px-4 focus:ring-2 focus:ring-[#3B6BF6]/20 focus:border-[#3B6BF6]">
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
              <Select
                value={timezone}
                onValueChange={(v) => setTimezone(v ?? "UTC")}
              >
                <SelectTrigger className="h-10 min-w-[85px] rounded-full border border-slate-200/80 bg-white shadow-2xs text-xs font-mono font-normal text-slate-800 px-3 focus:ring-2 focus:ring-[#3B6BF6]/20 focus:border-[#3B6BF6]">
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
          <div className="h-11 px-5 rounded-full bg-[#FAF9F6] border border-slate-200/70 text-xs font-mono shadow-2xs flex items-center">
            <span className="text-slate-400 font-normal mr-2">
              Next scheduled run:
            </span>
            <span className="font-bold text-slate-800">{nextRunLabel}</span>
          </div>

          {/* Auto-Start toggle card */}
          <div className="flex items-center justify-between px-6 py-4 rounded-[20px] bg-[#FAF9F6]/80 border border-slate-200/70 shadow-2xs font-mono">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900">
                Auto-Start Automation
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically poll feeds and publish without manual trigger
              </p>
            </div>
            <Switch
              checked={autoStart}
              onCheckedChange={setAutoStart}
              className="data-[state=checked]:bg-[#4F62E8]"
            />
          </div>

          {/* Plan & Automation Tier selection card */}
          <div className="flex items-center justify-between px-6 py-4 rounded-[20px] bg-[#FAF9F6]/80 border border-slate-200/70 shadow-2xs font-mono">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 capitalize">
                  Current Plan: {planTier}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-semibold uppercase">
                  {isEnterprise ? "Multiple Daily Runs" : "Daily Publishing"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isEnterprise
                  ? "Flexible scheduling and multiple daily publishing runs active."
                  : "Daily publishing active. Need multiple runs per day? Choose a plan."}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUpgradePlan?.(planTier)}
              className="h-9 px-4 rounded-full border-slate-300 text-xs font-mono font-semibold text-[#4F62E8] hover:bg-indigo-50 hover:text-[#4353D3] transition-colors cursor-pointer shrink-0 ml-4"
            >
              Choose Plan
            </Button>
          </div>

          {/* Multiple Daily Runs if Enterprise */}
          {isEnterprise && (
            <div className="flex flex-col gap-3 px-6 py-4 rounded-[20px] bg-[#FAF9F6]/80 border border-slate-200/70 shadow-2xs font-mono">
              <p className="text-xs sm:text-sm font-semibold text-slate-900">
                Multiple Daily Runs
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {multiRuns.map((slot, idx) => (
                  <TimePill
                    key={idx}
                    value={slot}
                    onChange={(v) => updateRun(idx, v)}
                    onDelete={
                      multiRuns.length > 1 ? () => deleteRun(idx) : undefined
                    }
                  />
                ))}
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

          {/* Error Banner */}
          {errorText && (
            <div className="flex items-center gap-2 text-xs font-mono text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Area */}
      <div className="flex justify-between items-center pt-8 mt-auto border-t border-slate-100">
        <p className="text-xs font-mono text-slate-400">
          Save schedule & proceed to plan review.
        </p>

        <Button
          type="button"
          onClick={() => void handleCompleteSetup()}
          disabled={saving}
          className="h-12 px-8 rounded-full bg-[#4F62E8] hover:bg-[#4353D3] text-white text-xs font-mono font-semibold shadow-[0_4px_14px_rgba(79,98,232,0.3)] transition-all cursor-pointer flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Schedule...</span>
            </>
          ) : (
            <>
              <span>Review & Choose Plan</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}