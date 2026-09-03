"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  excluded: string;
}

interface StepPreferencesProps {
  onContinue: (data: PreferencesData) => void;
  initialData?: Partial<PreferencesData>;
}

export function StepPreferences({ onContinue, initialData }: StepPreferencesProps) {
  const [tone, setTone] = useState(initialData?.tone || "Professional & Objective");
  const [audience, setAudience] = useState(initialData?.audience || "");
  const [excluded, setExcluded] = useState(initialData?.excluded || "");

  const canContinue = audience.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    onContinue({ tone, audience, excluded });
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-7">
          <p className="text-xs font-mono font-medium text-slate-400 mb-1.5">
            Step 2 of 4
          </p>
          <h1 className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
            Editorial Style
          </h1>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Tone dropdown */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-700 font-mono">
              Tone of Article
            </Label>
            <Select value={tone} onValueChange={(val) => setTone(val || TONE_OPTIONS[0])}>
              <SelectTrigger
                className={cn(
                  "w-full h-[52px] rounded-full border border-slate-200/80 bg-white/90 shadow-2xs text-sm font-mono text-slate-800 px-5 font-normal transition-all",
                  "focus:ring-2 focus:ring-[#4F62E8]/20 focus:border-[#4F62E8] focus:ring-offset-0"
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
            <Label className="text-xs font-semibold text-slate-700 font-mono">
              Targeted Audience
            </Label>
            <Input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. CTOs, Developers, Marketing managers"
              className={cn(
                "h-[52px] rounded-full border border-slate-200/80 bg-white/90 shadow-2xs text-sm font-mono px-5 text-slate-800 placeholder:text-slate-400 transition-all",
                "focus-visible:ring-2 focus-visible:ring-[#4F62E8]/20 focus-visible:border-[#4F62E8] focus-visible:ring-offset-0"
              )}
            />
          </div>

          {/* Excluded Topics */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-700 font-mono">
              Excluded Topics{" "}
              <span className="text-slate-400 font-normal text-xs">(optional)</span>
            </Label>
            <Input
              value={excluded}
              onChange={(e) => setExcluded(e.target.value)}
              placeholder="e.g. Politics, Crypto"
              className={cn(
                "h-[52px] rounded-full border border-slate-200/80 bg-white/90 shadow-2xs text-sm font-mono px-5 text-slate-800 placeholder:text-slate-400 transition-all",
                "focus-visible:ring-2 focus-visible:ring-[#4F62E8]/20 focus-visible:border-[#4F62E8] focus-visible:ring-offset-0"
              )}
            />
          </div>
        </div>
      </div>

      {/* Continue */}
      <div className="flex justify-end pt-8 mt-auto">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className={cn(
            "h-12 px-9 rounded-full text-sm font-mono font-semibold transition-all cursor-pointer",
            canContinue
              ? "bg-[#4F62E8] hover:bg-[#4353D3] text-white shadow-[0_4px_14px_rgba(79,98,232,0.3)]"
              : "bg-[#A3B4FA] hover:bg-[#92A5F8] text-white shadow-none cursor-not-allowed"
          )}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

