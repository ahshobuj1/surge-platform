"use client";

import { useState, useEffect } from "react";
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
import { CheckCircle2, Zap, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/context/WorkspaceContext";
import { api } from "@/lib/api";
import { Workspace } from "@/lib/types";

const TIMEZONES = [
  "GMT +6 (Dhaka)",
  "UTC",
  "GMT -5 (EST)",
  "GMT -8 (PST)",
  "GMT +5:30 (IST)",
  "GMT +1 (CET)",
];

export function SettingsSchedule() {
  const { activeWorkspace } = useWorkspace();
  const [publishTime, setPublishTime] = useState("03:00");
  const [timezone, setTimezone] = useState("GMT +6 (Dhaka)");
  const [automation, setAutomation] = useState(true);
  const [emailOnFailure, setEmailOnFailure] = useState(true);
  const [emailOnRetry, setEmailOnRetry] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState<{
    show: boolean;
    type: "on" | "off";
    title: string;
    message: string;
  }>({
    show: false,
    type: "on",
    title: "",
    message: "",
  });

  // Load workspace config on mount
  useEffect(() => {
    const loadConfig = async () => {
      if (!activeWorkspace?.id) return;
      try {
        const ws = await api.get<Workspace>(`/workspaces/${activeWorkspace.id}`);
        const config = ws.queue_config;
        if (config) {
          setAutomation(config.autoPost ?? true);
          if (config.postingTimes && config.postingTimes.length > 0) {
            setPublishTime(config.postingTimes[0]);
          }
        }
      } catch (err) {
        console.warn("Could not load workspace config:", err);
      }
    };
    loadConfig();
  }, [activeWorkspace?.id]);

  const handleAutomationToggle = async (val: boolean) => {
    setAutomation(val);
    if (!activeWorkspace?.id) return;
    try {
      await api.patch(`/workspaces/${activeWorkspace.id}/auto-post`, { autoPost: val });
      setToast({
        show: true,
        type: val ? "on" : "off",
        title: val ? "Auto-post Enabled" : "Auto-post Paused",
        message: val
          ? "Scheduled content will publish automatically according to queue."
          : "Automatic publishing is paused. Drafts will wait for manual approval.",
      });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
    } catch (err: any) {
      console.error("Failed to toggle autoPost:", err);
      setAutomation(!val);
    }
  };

  const handleSave = async () => {
    if (!activeWorkspace?.id) return;
    setSaving(true);
    setErrorMsg("");
    setSaved(false);
    try {
      await api.patch(`/workspaces/${activeWorkspace.id}/queue-config`, {
        autoPost: automation,
        postingTimes: [publishTime],
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save schedule settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-6 relative">
      <h2 className="text-lg font-bold text-foreground">Schedule</h2>

      {errorMsg && (
        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Publish time + timezone */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Publish Time
          </Label>
          <div className="relative flex items-center h-11 border border-slate-200 rounded-xl px-3 bg-white focus-within:ring-2 focus-within:ring-indigo-400 focus-within:ring-offset-0">
            <input
              type="time"
              value={publishTime}
              onChange={(e) => setPublishTime(e.target.value)}
              className="text-base text-foreground font-medium bg-transparent outline-none flex-1"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Runs daily at {publishTime}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Timezone
          </Label>
          <Select value={timezone} onValueChange={(val) => setTimezone(val || "GMT +6 (Dhaka)")}>
            <SelectTrigger className="h-11 rounded-xl border-slate-200 text-base text-foreground focus:ring-indigo-400 focus:ring-offset-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-0 shadow-lg">
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz} className="text-base">
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-4">
        <ToggleRow
          label="Automation (Auto-post)"
          description="Pause to stop all scheduled publishing"
          checked={automation}
          onChange={handleAutomationToggle}
        />
        <ToggleRow
          label="Email on Failure"
          description="Get notified when a job fails"
          checked={emailOnFailure}
          onChange={setEmailOnFailure}
        />
        <ToggleRow
          label="Email on Successful Retry"
          description="Notify when a retry succeeds"
          checked={emailOnRetry}
          onChange={setEmailOnRetry}
        />
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        <div
          className={cn(
            "flex items-center gap-2 transition-all duration-300",
            saved ? "opacity-100" : "opacity-0"
          )}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-semibold text-emerald-600">Schedule saved</span>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !activeWorkspace}
          className="h-10 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Toast Notification */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-white border shadow-xl rounded-2xl p-4 max-w-sm transition-all duration-300 transform",
          toast.type === "on" ? "border-emerald-200" : "border-amber-200",
          toast.show
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {toast.type === "on" ? (
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <PauseCircle className="w-4 h-4 text-amber-600" />
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-bold text-slate-900">{toast.title}</p>
          <p className="text-xs text-slate-600 leading-relaxed">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-base font-semibold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-indigo-500"
      />
    </div>
  );
}
