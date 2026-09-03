"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Users,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const TONE_OPTIONS = [
  "Professional & Objective",
  "Conversational & Engaging",
  "Authoritative & Thought-Leadership",
  "Technical & In-depth",
  "Casual & Punchy",
];

export interface PreferencesData {
  tone: string;
  audience: string;
  audiencesList?: string[];
  excluded: string;
  excludedList?: string[];
}

interface StepPreferencesProps {
  onContinue: (data: PreferencesData) => void;
  initialData?: Partial<PreferencesData>;
  workspaceId?: string;
}

function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const item of raw.split(",")) {
    const trimmed = item.trim();
    const lower = trimmed.toLowerCase();
    if (trimmed.length >= 2 && trimmed.length <= 50 && !seen.has(lower)) {
      seen.add(lower);
      tags.push(trimmed);
    }
  }
  return tags;
}

export function StepPreferences({
  onContinue,
  initialData,
  workspaceId,
}: StepPreferencesProps) {
  const [tone, setTone] = useState(
    initialData?.tone || "Professional & Objective",
  );
  const [audience, setAudience] = useState(initialData?.audience || "");
  const [excluded, setExcluded] = useState(initialData?.excluded || "");
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const parsedAudiences = useMemo(() => parseTags(audience), [audience]);
  const parsedExcluded = useMemo(() => parseTags(excluded), [excluded]);

  const hasAudienceInput = audience.trim().length > 0;
  const isAudienceValid = parsedAudiences.length > 0;

  const handleRemoveAudienceTag = (tagToRemove: string) => {
    const updated = parsedAudiences.filter(
      (t) => t.toLowerCase() !== tagToRemove.toLowerCase(),
    );
    setAudience(updated.join(", "));
  };

  const handleRemoveExcludedTag = (tagToRemove: string) => {
    const updated = parsedExcluded.filter(
      (t) => t.toLowerCase() !== tagToRemove.toLowerCase(),
    );
    setExcluded(updated.join(", "));
  };

  const handleContinue = async () => {
    if (!isAudienceValid) {
      setErrorText(
        "Please provide at least one valid audience role (min 2 characters each).",
      );
      return;
    }

    setSaving(true);
    setErrorText(null);

    const payload = {
      tone: tone.trim(),
      audience: parsedAudiences.join(", "),
      excluded: parsedExcluded.join(", "),
    };

    try {
      if (workspaceId) {
        await api.patch(`/workspaces/${workspaceId}/preferences`, payload);
      }

      onContinue({
        tone: payload.tone,
        audience: payload.audience,
        audiencesList: parsedAudiences,
        excluded: payload.excluded,
        excludedList: parsedExcluded,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to save editorial preferences. Please try again.";
      setErrorText(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-mono font-medium text-slate-400 mb-1.5">
            Step 2 of 4
          </p>
          <h1 className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
            Editorial Style
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Tailor the AI writing persona and target audience for your workspace.
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Tone dropdown */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4F62E8]" />
                Tone of Article
              </Label>
              <span className="text-[11px] text-slate-400 font-mono">
                Writing voice
              </span>
            </div>
            <Select
              value={tone}
              onValueChange={(val) => setTone(val || TONE_OPTIONS[0])}
            >
              <SelectTrigger
                className={cn(
                  "w-full h-[50px] rounded-full border border-slate-200/80 bg-white/90 shadow-2xs text-sm font-mono text-slate-800 px-5 font-normal transition-all",
                  "focus:ring-2 focus:ring-[#4F62E8]/20 focus:border-[#4F62E8] focus:ring-offset-0",
                )}
              >
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-slate-100 shadow-xl p-1 bg-white font-mono">
                {TONE_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt}
                    value={opt}
                    className="rounded-xl text-xs font-mono py-2.5 px-3 focus:bg-[#EEF1FB] focus:text-[#4F62E8] cursor-pointer"
                  >
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Targeted Audience */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700 font-mono flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#4F62E8]" />
                Targeted Audience
              </Label>
              <span className="text-[11px] text-slate-400 font-mono">
                Comma-separated (min 1 required)
              </span>
            </div>
            <Input
              value={audience}
              disabled={saving}
              onChange={(e) => {
                setAudience(e.target.value);
                if (errorText) setErrorText(null);
              }}
              placeholder="e.g. CTOs, Software Engineers, Tech Founders"
              className={cn(
                "h-[50px] rounded-full border border-slate-200/80 bg-white/90 shadow-2xs text-sm font-mono px-5 text-slate-800 placeholder:text-slate-400 transition-all",
                "focus-visible:ring-2 focus-visible:ring-[#4F62E8]/20 focus-visible:border-[#4F62E8] focus-visible:ring-offset-0",
                hasAudienceInput &&
                  !isAudienceValid &&
                  "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-100",
                isAudienceValid &&
                  "border-emerald-300 focus-visible:border-emerald-500 focus-visible:ring-emerald-100",
              )}
            />

            {/* Live Audience Chips */}
            {parsedAudiences.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1 px-1">
                {parsedAudiences.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-50/80 text-indigo-700 border-indigo-200/80 shadow-2xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAudienceTag(tag)}
                      className="hover:text-red-500 transition-colors cursor-pointer ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <span className="text-[10px] font-mono text-emerald-600 font-medium ml-1">
                  ✓ {parsedAudiences.length} role{parsedAudiences.length > 1 ? "s" : ""} targeted
                </span>
              </div>
            )}

            {hasAudienceInput && !isAudienceValid && (
              <p className="text-xs font-mono text-red-500 font-medium px-2 mt-0.5">
                Each audience role must contain 2 to 50 characters.
              </p>
            )}
          </div>

          {/* Excluded Topics */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700 font-mono">
                Excluded Topics{" "}
                <span className="text-slate-400 font-normal text-xs font-mono">
                  (optional)
                </span>
              </Label>
              <span className="text-[11px] text-slate-400 font-mono">
                Comma-separated
              </span>
            </div>
            <Input
              value={excluded}
              disabled={saving}
              onChange={(e) => {
                setExcluded(e.target.value);
                if (errorText) setErrorText(null);
              }}
              placeholder="e.g. Politics, Crypto, Gossip"
              className={cn(
                "h-[50px] rounded-full border border-slate-200/80 bg-white/90 shadow-2xs text-sm font-mono px-5 text-slate-800 placeholder:text-slate-400 transition-all",
                "focus-visible:ring-2 focus-visible:ring-[#4F62E8]/20 focus-visible:border-[#4F62E8] focus-visible:ring-offset-0",
              )}
            />

            {/* Live Excluded Chips */}
            {parsedExcluded.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1 px-1">
                {parsedExcluded.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border-slate-200 shadow-2xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExcludedTag(tag)}
                      className="hover:text-red-500 transition-colors cursor-pointer ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Area with Error & Continue */}
      <div className="flex flex-col gap-3 pt-6 mt-auto border-t border-slate-100">
        {errorText && (
          <div className="flex items-start gap-2 text-xs font-mono text-red-600 font-medium bg-red-50/70 border border-red-200/70 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{errorText}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <p className="text-xs font-mono text-slate-400">
            {isAudienceValid
              ? "✓ Preferences ready. Click Continue to proceed."
              : "Specify at least one targeted audience role."}
          </p>

          <Button
            type="button"
            onClick={() => void handleContinue()}
            disabled={!isAudienceValid || saving}
            className={cn(
              "h-12 px-9 rounded-full text-sm font-mono font-semibold transition-all cursor-pointer flex items-center gap-2",
              isAudienceValid && !saving
                ? "bg-[#4F62E8] hover:bg-[#4353D3] text-white shadow-[0_4px_14px_rgba(79,98,232,0.3)]"
                : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed hover:bg-slate-200",
            )}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
