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
  "Conversational & Friendly",
  "Formal & Academic",
  "Bold & Opinionated",
  "Witty & Playful",
];

interface StepPreferencesProps {
  onContinue: () => void;
}

export function StepPreferences({ onContinue }: StepPreferencesProps) {
  const [tone, setTone] = useState("Professional & Objective");
  const [audience, setAudience] = useState("");
  const [excluded, setExcluded] = useState("");

  const canContinue = audience.trim().length > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">
          Step 2 of 4
        </p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Editorial Style
        </h1>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-5">
        {/* Tone dropdown */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-slate-700">
            Tone of Article
          </Label>
          <Select value={tone} onValueChange={(val) => setTone(val || "")}>
            <SelectTrigger
              className={cn(
                "w-full rounded-2xl border-0 bg-white/70 shadow-sm text-sm text-slate-700",
                "focus:ring-2 focus:ring-indigo-400 focus:ring-offset-0"
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-0 shadow-lg p-2">
              {TONE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt} className="">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Targeted Audience */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-slate-700">
            Targeted Audience
          </Label>
          <Input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. CTOs, Developers, Marketing managers"
            className={cn(
              "h-12 rounded-2xl border-0 bg-white/70 shadow-sm text-sm",
              "focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-0",
              "placeholder:text-slate-400 text-slate-700"
            )}
          />
        </div>

        {/* Excluded Topics */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-slate-700">
            Excluded Topics{" "}
            <span className="text-slate-400 font-normal">(optional)</span>
          </Label>
          <Input
            value={excluded}
            onChange={(e) => setExcluded(e.target.value)}
            placeholder="e.g. Politics, Fashion"
            className={cn(
              "h-12 rounded-2xl border-0 bg-white/70 shadow-sm text-sm",
              "focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-0",
              "placeholder:text-slate-400 text-slate-700"
            )}
          />
        </div>
      </div>

      {/* Continue */}
      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            "h-11 px-8 rounded-2xl text-sm font-semibold transition-all",
            canContinue
              ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-md"
              : "bg-indigo-200 text-indigo-300 cursor-not-allowed"
          )}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
