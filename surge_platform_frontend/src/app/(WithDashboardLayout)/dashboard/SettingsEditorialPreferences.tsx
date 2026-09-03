"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export function SettingsEditorialPreferences() {
  const [audience, setAudience] = useState("Investors");
  const [tone, setTone] = useState("Professional");
  const [topics, setTopics] = useState<string[]>(["crypto", "politics"]);
  const [topicInput, setTopicInput] = useState("");

  const addTopic = () => {
    const val = topicInput.trim().toLowerCase();
    if (val && !topics.includes(val)) {
      setTopics((prev) => [...prev, val]);
    }
    setTopicInput("");
  };

  const handleTopicKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTopic();
    }
  };

  const removeTopic = (t: string) => {
    setTopics((prev) => prev.filter((x) => x !== t));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground">
          Editorial Preferences
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure how the AI shapes content for your audience.
        </p>
      </div>

      {/* Target Audience */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Target Audience
        </Label>
        <Input
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="h-11 rounded-xl border-slate-200 text-base text-foreground focus-visible:ring-indigo-400 focus-visible:ring-offset-0"
        />
      </div>

      {/* Writing Tone */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Writing Tone
        </Label>
        <Input
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="h-11 rounded-xl border-slate-200 text-base text-foreground focus-visible:ring-indigo-400 focus-visible:ring-offset-0"
        />
      </div>

      {/* Excluded Topics */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Excluded Topics{" "}
          <span className="normal-case font-normal text-muted-foreground">
            (optional)
          </span>
        </Label>

        {/* Tag input container */}
        <div className="min-h-11 flex flex-wrap items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-indigo-400 focus-within:ring-offset-0 cursor-text">
          {topics.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 text-xs font-medium bg-slate-100 text-muted-foreground px-2 py-0.5 rounded-full"
            >
              {t}
              <button
                onClick={() => removeTopic(t)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={handleTopicKeyDown}
            onBlur={addTopic}
            placeholder={topics.length === 0 ? "Add topic…" : "Add topic…"}
            className="flex-1 min-w-[100px] text-base outline-none bg-transparent placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button className="h-10 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-base font-semibold">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
