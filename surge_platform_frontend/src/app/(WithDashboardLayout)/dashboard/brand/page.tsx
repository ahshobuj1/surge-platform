"use client";

import { useState, useEffect, KeyboardEvent, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { X, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "../DashboardHeader";
import { useWorkspace } from "@/lib/context/WorkspaceContext";
import { api } from "@/lib/api";
import { ToneProfile } from "@/lib/types";

type FormValues = {
  name: string;
  targetAudience: { value: string }[];
  writingTone: string;
  excludedTopics: { value: string }[];
};

const AUDIENCE_PRESETS = [
  "Tech Founders",
  "Marketers & Growth Leads",
  "Software Engineers",
  "C-Suite Executives",
  "Small Business Owners",
];

function BrandsPage() {
  const { activeWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [activeProfile, setActiveProfile] = useState<ToneProfile | null>(null);
  const [toneProfiles, setToneProfiles] = useState<ToneProfile[]>([]);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [audienceInput, setAudienceInput] = useState("");
  const [customToneMode, setCustomToneMode] = useState(false);
  const audienceInputRef = useRef<HTMLInputElement>(null);
  const topicInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "Default Brand Tone",
      targetAudience: [{ value: "Tech Enthusiasts" }, { value: "Founders" }],
      // writingTone: "Professional, Analytical, Concise",
      excludedTopics: [{ value: "crypto" }, { value: "politics" }],
    },
  });

  const {
    fields: audienceFields,
    append: appendAudience,
    remove: removeAudience,
    replace: replaceAudience,
  } = useFieldArray({
    control: form.control,
    name: "targetAudience",
  });

  const {
    fields: topicFields,
    append: appendTopic,
    remove: removeTopic,
    replace: replaceTopic,
  } = useFieldArray({
    control: form.control,
    name: "excludedTopics",
  });

  const fetchToneProfiles = async () => {
    if (!activeWorkspace?.id) return;
    setLoading(true);
    try {
      // 1. Fetch available tone profiles from backend
      try {
        const tpRes = await api.get<ToneProfile[]>("/tone-profiles");
        if (Array.isArray(tpRes)) {
          setToneProfiles(tpRes);
        }
      } catch (e) {
        console.error("Failed to load /tone-profiles list:", e);
      }

      // 2. Fetch active workspace details which contains queueConfig
      const ws = await api.get<any>(`/workspaces/${activeWorkspace.id}`);
      const qc = ws?.queueConfig || {};
      if (qc.targetAudience || qc.brandVoice || qc.editorialRules || qc.name) {
        form.setValue("name", qc.name || "Default Brand Tone");
        form.setValue("writingTone", qc.brandVoice || "Professional, Analytical, Concise");

        // Parse targetAudience into tags
        const audienceList = Array.isArray(qc.targetAudience)
          ? qc.targetAudience
          : typeof qc.targetAudience === "string"
          ? qc.targetAudience.split(",").map((s: string) => s.trim()).filter(Boolean)
          : ["Tech Enthusiasts", "Founders"];
        replaceAudience(audienceList.map((val: string) => ({ value: val })));

        // Parse editorial rules
        const rules = Array.isArray(qc.editorialRules)
          ? qc.editorialRules
          : typeof qc.editorialRules === "string"
          ? qc.editorialRules.split(",").map((s: string) => s.trim())
          : ["crypto", "politics"];
        replaceTopic(rules.map((val: string) => ({ value: val })));
      }
    } catch (err) {
      console.error("Failed to load brand preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToneProfiles();
  }, [activeWorkspace?.id]);

  const addAudienceTag = (valToAdd?: string) => {
    const val = (valToAdd || audienceInput).trim();
    const exists = audienceFields.some((f) => f.value.toLowerCase() === val.toLowerCase());
    if (val && !exists) {
      appendAudience({ value: val });
    }
    setAudienceInput("");
  };

  const handleAudienceKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addAudienceTag();
    }
    if (e.key === "Backspace" && !audienceInput && audienceFields.length > 0) {
      removeAudience(audienceFields.length - 1);
    }
  };

  const addTopicTag = () => {
    const val = topicInput.trim();
    const exists = topicFields.some((f) => f.value.toLowerCase() === val.toLowerCase());
    if (val && !exists) {
      appendTopic({ value: val });
    }
    setTopicInput("");
  };

  const handleTopicKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTopicTag();
    }
    if (e.key === "Backspace" && !topicInput && topicFields.length > 0) {
      removeTopic(topicFields.length - 1);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!activeWorkspace?.id) return;
    setErrorMsg("");
    setSaved(false);

    const payload = {
      name: data.name || "Default Brand Tone",
      targetAudience: data.targetAudience.map((a) => a.value).join(", "),
      brandVoice: data.writingTone,
      editorialRules: data.excludedTopics.map((t) => t.value),
    };

    try {
      // Primary: Save workspace brand configuration via PATCH /workspaces/:id/queue-config
      await api.patch(`/workspaces/${activeWorkspace.id}/queue-config`, payload);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error("Failed to save brand preferences via workspace, trying fallback:", err);
      try {
        if (activeProfile?.id) {
          await api.patch(`/tone-profiles/${activeProfile.id}`, payload);
        } else {
          const created = await api.post<ToneProfile>("/tone-profiles", payload);
          setActiveProfile(created);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (fallbackErr: any) {
        setErrorMsg(fallbackErr.message || err.message || "Failed to save brand preferences.");
      }
    }
  };

  const currentToneValue = form.watch("writingTone");

  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-screen overflow-auto">
      <DashboardHeader
        title="Brand Tone & Style"
        subtitle="Configure how AI shapes editorial voice and tone for your audience."
      />

      <div className="px-4 sm:px-8 pb-8 pt-4">
        {errorMsg && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
            <p className="text-base text-muted-foreground">
              Define the guidelines that govern AI content generation across all feeds and platforms.
            </p>

            {/* BRAND PROFILE NAME */}
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Profile Name
              </Label>
              <Input
                {...form.register("name")}
                className="h-11 rounded-xl border border-slate-200 bg-white text-base text-foreground focus-visible:ring-2 focus-visible:ring-indigo-300"
              />
            </div>

            {/* TARGET AUDIENCE (TAG PILLS) */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Target Audience Tags
              </span>

              <div
                className="min-h-11 flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-indigo-300 cursor-text"
                onClick={() => audienceInputRef.current?.focus()}
              >
                {audienceFields.map((field, index) => (
                  <span
                    key={field.id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200"
                  >
                    {field.value}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAudience(index);
                      }}
                      className="text-emerald-500 hover:text-emerald-800 transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <input
                  ref={audienceInputRef}
                  value={audienceInput}
                  onChange={(e) => setAudienceInput(e.target.value)}
                  onKeyDown={handleAudienceKeyDown}
                  onBlur={() => addAudienceTag()}
                  placeholder="Type target audience & press Enter..."
                  className="flex-1 min-w-44 text-sm text-slate-800 outline-none bg-transparent"
                />
              </div>

              {/* Audience Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-slate-400 font-medium mr-1">Suggestions:</span>
                {AUDIENCE_PRESETS.map((preset) => {
                  const isAdded = audienceFields.some(
                    (f) => f.value.toLowerCase() === preset.toLowerCase()
                  );
                  return (
                    <button
                      key={preset}
                      type="button"
                      disabled={isAdded}
                      onClick={() => addAudienceTag(preset)}
                      className={cn(
                        "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium transition-colors border",
                        isAdded
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 cursor-pointer"
                      )}
                    >
                      <Plus className="w-3 h-3" />
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* WRITING TONE SELECTION */}
            <div className="flex flex-col gap-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Writing Tone & Brand Voice
              </Label>

              <select
                value={currentToneValue}
                onChange={(e) => form.setValue("writingTone", e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer shadow-xs"
              >
                <option value="" disabled>
                  -- Select Brand Tone --
                </option>
                {/* Current active tone option if custom */}
                {currentToneValue &&
                  !toneProfiles.some((tp) => tp.name === currentToneValue) && (
                    <option value={currentToneValue}>
                      {currentToneValue}
                    </option>
                  )}

                {/* Backend Tone Profiles */}
                {toneProfiles.map((tp) => (
                  <option key={tp.id} value={tp.name}>
                    {tp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* EXCLUDED TOPICS */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Excluded Topics & Keywords
              </span>

              <div
                className="min-h-11 flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-indigo-300 cursor-text"
                onClick={() => topicInputRef.current?.focus()}
              >
                {topicFields.map((field, index) => (
                  <span
                    key={field.id}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold"
                  >
                    {field.value}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTopic(index);
                      }}
                      className="text-indigo-400 hover:text-indigo-700 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <input
                  ref={topicInputRef}
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={handleTopicKeyDown}
                  onBlur={addTopicTag}
                  placeholder="Add topic & press Enter..."
                  className="flex-1 min-w-25 text-base text-muted-foreground outline-none bg-transparent"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Press Enter or comma to add an excluded topic
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                className="h-10 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold shadow-md transition-all"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-white border border-slate-200 shadow-lg rounded-2xl px-4 py-3 transition-all duration-300",
          saved
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-2 pointer-events-none"
        )}
      >
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        <span className="text-sm font-semibold text-slate-800">Brand Preferences Saved</span>
      </div>
    </div>
  );
}

export default BrandsPage;