"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Rss,
  Share2,
  UserCheck,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import { useWorkspace } from "@/lib/context/WorkspaceContext";
import { api } from "@/lib/api";
import { ToneProfile } from "@/lib/types";
import ZerodraftLogo from "@/app/component/shared/ZeroDraftLogo";

const AUDIENCE_PRESETS = [
  "Tech Founders",
  "Marketers & Growth Leads",
  "Software Engineers",
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";

export function ProfileSetup() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const { activeWorkspace } = useWorkspace();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1: Profile & Brand
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [brandName, setBrandName] = useState("Default Brand Tone");
  const [audienceTags, setAudienceTags] = useState<string[]>([
    "Tech Enthusiasts",
    "Founders",
  ]);
  const [audienceInput, setAudienceInput] = useState("");
  const [writingTone, setWritingTone] = useState("Professional, Analytical, Concise");
  const [toneProfiles, setToneProfiles] = useState<ToneProfile[]>([]);
  const [customToneMode, setCustomToneMode] = useState(false);

  // Step 2: Multiple RSS Sources
  const [rssFeeds, setRssFeeds] = useState<{ url: string; name: string }[]>([
    { url: "", name: "" },
  ]);

  const addRssFeed = () => {
    setRssFeeds((prev) => [...prev, { url: "", name: "" }]);
  };

  const removeRssFeed = (index: number) => {
    setRssFeeds((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRssFeed = (index: number, field: "url" | "name", value: string) => {
    setRssFeeds((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Step 3: CMS & Publishing Channels
  const [selectedCms, setSelectedCms] = useState<
    "WORDPRESS" | "WEBFLOW" | "GHOST" | "MEDIUM" | "CUSTOM"
  >("WORDPRESS");
  const [cmsUrl, setCmsUrl] = useState("");
  const [cmsApiKey, setCmsApiKey] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audienceInputRef = useRef<HTMLInputElement>(null);

  // Load tone profiles & current user details
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.name || "");
      if (user.avatarKey) setAvatar(user.avatarKey);
    }
    const loadTones = async () => {
      try {
        const res = await api.get<ToneProfile[]>("/tone-profiles");
        if (Array.isArray(res)) setToneProfiles(res);
      } catch (e) {
        console.warn("Could not load tone profiles:", e);
      }
    };
    loadTones();
  }, [user]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Audience tag helpers
  const addAudienceTag = (valToAdd?: string) => {
    const val = (valToAdd || audienceInput).trim();
    if (val && !audienceTags.some((t) => t.toLowerCase() === val.toLowerCase())) {
      setAudienceTags((prev) => [...prev, val]);
    }
    setAudienceInput("");
  };

  const handleAudienceKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addAudienceTag();
    }
    if (e.key === "Backspace" && !audienceInput && audienceTags.length > 0) {
      setAudienceTags((prev) => prev.slice(0, -1));
    }
  };

  const removeAudienceTag = (index: number) => {
    setAudienceTags((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Step 1 & Proceed to Step 2
  const handleStep1Next = async () => {
    if (!activeWorkspace?.id) {
      setStep(2);
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      if (avatar || fullName) {
        await api.patch("/users/me", {
          fullName: fullName || undefined,
          avatarKey: avatar || undefined,
        });
        await refreshUser();
      }

      await api.patch(`/workspaces/${activeWorkspace.id}/queue-config`, {
        name: brandName,
        targetAudience: audienceTags.join(", "),
        brandVoice: writingTone,
      });

      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save brand profile.");
    } finally {
      setLoading(false);
    }
  };

  // Save Step 2 (Multiple RSS Feeds) & Proceed to Step 3
  const handleStep2Next = async (skip = false) => {
    if (!skip && activeWorkspace?.id) {
      const validFeeds = rssFeeds.filter((f) => f.url.trim().length > 0);
      if (validFeeds.length > 0) {
        setLoading(true);
        setErrorMsg("");
        try {
          for (const feed of validFeeds) {
            await api.post(`/workspaces/${activeWorkspace.id}/rss-sources`, {
              feedUrl: feed.url.trim(),
              url: feed.url.trim(),
              name: feed.name.trim() || undefined,
            });
          }
        } catch (err: any) {
          const msg = Array.isArray(err.message)
            ? err.message.join(", ")
            : err.message || "Failed to add RSS Feed URL.";
          setErrorMsg(msg);
          setLoading(false);
          return;
        }
        setLoading(false);
      }
    }
    setStep(3);
  };

  // Finish Onboarding Setup
  const handleFinishOnboarding = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      if (cmsUrl && activeWorkspace?.id) {
        try {
          await api.post("/publishing-channels", {
            workspaceId: activeWorkspace.id,
            platform: selectedCms,
            channelName: cmsUrl,
            credentials: {
              siteUrl: cmsUrl,
              apiKey: cmsApiKey,
              applicationPassword: cmsApiKey,
            },
          });
        } catch (e) {
          console.warn("Could not save CMS channel during onboarding:", e);
        }
      }

      // Trigger first batch digest if workspace is active
      if (activeWorkspace?.id) {
        try {
          await api.post("/ai-prompts/batch-digest", {
            workspaceId: activeWorkspace.id,
          });
        } catch (e) {
          console.warn("Batch digest trigger skipped:", e);
        }
      }

      router.push("/dashboard/zerodraft");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to finish onboarding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 flex flex-col gap-8">
        {/* Step Indicator Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ZerodraftLogo size="sm" className="mb-0" />
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                Wizard
              </span>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Step {step} of 3
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 text-sm text-red-700 bg-red-50 rounded-2xl border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: WORKSPACE & BRAND PROFILE */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                <UserCheck className="w-6 h-6 text-indigo-600" />
                Configure Brand & Audience
              </h1>
              <p className="text-sm text-slate-500">
                Define your profile name, target audience, and editorial tone for AI generation.
              </p>
            </div>

            {/* Profile Avatar & Full Name */}
            <div className="flex items-center gap-5 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center cursor-pointer overflow-hidden relative shrink-0 group hover:border-indigo-400 transition-all shadow-sm"
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <div className="flex flex-col gap-1.5 flex-1">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Full Name
                </Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  className="h-11 bg-white border-slate-200 text-slate-900 text-sm focus-visible:ring-2 focus-visible:ring-indigo-300"
                />
              </div>
            </div>

            {/* Target Audience Tags */}
            <div className="flex flex-col gap-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Target Audience Tags
              </Label>
              <div
                className="min-h-12 flex flex-wrap items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-indigo-300 cursor-text"
                onClick={() => audienceInputRef.current?.focus()}
              >
                {audienceTags.map((tag, index) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAudienceTag(index);
                      }}
                      className="text-indigo-500 hover:text-indigo-800 ml-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                <input
                  ref={audienceInputRef}
                  value={audienceInput}
                  onChange={(e) => setAudienceInput(e.target.value)}
                  onKeyDown={handleAudienceKeyDown}
                  onBlur={() => addAudienceTag()}
                  placeholder="Type audience & press Enter..."
                  className="flex-1 min-w-44 text-sm text-slate-900 outline-none bg-transparent placeholder:text-slate-400"
                />
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-slate-500 font-medium mr-1">
                  Suggestions:
                </span>
                {AUDIENCE_PRESETS.map((preset) => {
                  const isAdded = audienceTags.some(
                    (t) => t.toLowerCase() === preset.toLowerCase()
                  );
                  return (
                    <button
                      key={preset}
                      type="button"
                      disabled={isAdded}
                      onClick={() => addAudienceTag(preset)}
                      className={cn(
                        "inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg font-medium transition-colors border",
                        isAdded
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 cursor-pointer shadow-sm"
                      )}
                    >
                      <Plus className="w-3 h-3" />
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Writing Tone Selection */}
            <div className="flex flex-col gap-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Writing Tone & Brand Voice
              </Label>
              <select
                value={writingTone}
                onChange={(e) => setWritingTone(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer shadow-xs"
              >
                <option value="" disabled>
                  -- Select Tone Profile --
                </option>
                {writingTone &&
                  !toneProfiles.some((tp) => tp.name === writingTone) && (
                    <option value={writingTone}>{writingTone}</option>
                  )}
                {toneProfiles.map((tp) => (
                  <option key={tp.id} value={tp.name}>
                    {tp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleStep1Next}
                disabled={loading}
                className="h-11 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-indigo-600/20"
              >
                {loading ? "Saving..." : "Next: Add RSS Source"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: RSS FEED INGESTION SOURCE */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                <Rss className="w-6 h-6 text-indigo-600" />
                Add RSS Content Feed
              </h1>
              <p className="text-sm text-slate-500">
                Connect your favorite industry news blog or website RSS feed for automated article ingestion.
              </p>
            </div>

            <div className="flex flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
              {rssFeeds.map((feed, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3.5 p-4.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                      Feed #{index + 1}
                    </span>
                    {rssFeeds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRssFeed(index)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        RSS Feed URL *
                      </Label>
                      <Input
                        value={feed.url}
                        onChange={(e) => updateRssFeed(index, "url", e.target.value)}
                        placeholder="https://techcrunch.com/feed/"
                        className="h-10 bg-white border-slate-200 text-slate-900 text-xs focus-visible:ring-2 focus-visible:ring-indigo-300"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Feed Name (Optional)
                      </Label>
                      <Input
                        value={feed.name}
                        onChange={(e) => updateRssFeed(index, "name", e.target.value)}
                        placeholder="e.g. Industry News"
                        className="h-10 bg-white border-slate-200 text-slate-900 text-xs focus-visible:ring-2 focus-visible:ring-indigo-300"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                onClick={addRssFeed}
                variant="outline"
                className="h-10 border-dashed border-indigo-300 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100/60 text-xs font-semibold flex items-center justify-center gap-1.5 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                + Add Another RSS Feed
              </Button>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="h-11 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleStep2Next(true)}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors"
                >
                  Skip for now
                </button>

                <Button
                  onClick={() => handleStep2Next(false)}
                  disabled={loading}
                  className="h-11 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  {loading ? "Saving..." : "Next: Connect Channels"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PUBLISHING CHANNELS & FINISH */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                <Share2 className="w-6 h-6 text-indigo-600" />
                Connect Publishing Channels
              </h1>
              <p className="text-sm text-slate-500">
                Connect your LinkedIn, Facebook, or WordPress blog to enable automated post publishing.
              </p>
            </div>

            {/* Social OAuth Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900">LinkedIn</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `${API_BASE_URL}/publishing-channels/oauth/linkedin/authorize?workspaceId=${activeWorkspace?.id}`)
                  }
                  className="text-xs h-7 px-2.5 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                >
                  Connect
                </Button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Facebook className="w-4 h-4 text-blue-700" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900">Facebook</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `${API_BASE_URL}/publishing-channels/oauth/facebook/authorize?workspaceId=${activeWorkspace?.id}`)
                  }
                  className="text-xs h-7 px-2.5 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                >
                  Connect
                </Button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <Twitter className="w-4 h-4 text-slate-900" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900">Twitter / X</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `${API_BASE_URL}/publishing-channels/oauth/linkedin/authorize?workspaceId=${activeWorkspace?.id}`)
                  }
                  className="text-xs h-7 px-2.5 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                >
                  Connect
                </Button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0">
                    <Instagram className="w-4 h-4 text-pink-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900">Instagram</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `${API_BASE_URL}/publishing-channels/oauth/facebook/authorize?workspaceId=${activeWorkspace?.id}`)
                  }
                  className="text-xs h-7 px-2.5 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                >
                  Connect
                </Button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-sky-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900">Bluesky</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `${API_BASE_URL}/publishing-channels/oauth/linkedin/authorize?workspaceId=${activeWorkspace?.id}`)
                  }
                  className="text-xs h-7 px-2.5 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                >
                  Connect
                </Button>
              </div>
            </div>

            {/* Multi-CMS & Blog Integration */}
            <div className="flex flex-col gap-3.5 p-4.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                  CMS & Blog Publishing Platform
                </span>
                <span className="text-xs font-medium text-slate-500">Optional</span>
              </div>

              {/* CMS Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 rounded-xl bg-slate-200/60 border border-slate-200">
                {[
                  { id: "WORDPRESS", label: "WordPress" },
                  { id: "WEBFLOW", label: "Webflow" },
                  { id: "GHOST", label: "Ghost" },
                  { id: "MEDIUM", label: "Medium" },
                  { id: "CUSTOM", label: "Webhook" },
                ].map((cms) => (
                  <button
                    key={cms.id}
                    type="button"
                    onClick={() => setSelectedCms(cms.id as any)}
                    className={cn(
                      "text-xs font-semibold py-1.5 px-2 rounded-lg transition-all text-center",
                      selectedCms === cms.id
                        ? "bg-white text-indigo-700 shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {cms.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Inputs based on selected CMS */}
              <div className="flex flex-col gap-2 pt-1">
                {selectedCms === "WORDPRESS" && (
                  <>
                    <Input
                      value={cmsUrl}
                      onChange={(e) => setCmsUrl(e.target.value)}
                      placeholder="WordPress Site URL (https://blog.example.com)"
                      className="h-10 bg-white border-slate-200 text-slate-900 text-xs focus-visible:ring-2 focus-visible:ring-indigo-300"
                    />
                    <Input
                      type="password"
                      value={cmsApiKey}
                      onChange={(e) => setCmsApiKey(e.target.value)}
                      placeholder="Application Password / Token"
                      className="h-10 bg-white border-slate-200 text-slate-900 text-xs focus-visible:ring-2 focus-visible:ring-indigo-300"
                    />
                  </>
                )}

                {selectedCms === "WEBFLOW" && (
                  <>
                    <Input
                      value={cmsUrl}
                      onChange={(e) => setCmsUrl(e.target.value)}
                      placeholder="Webflow Site URL / Collection ID"
                      className="h-10 bg-white border-slate-200 text-slate-900 text-xs focus-visible:ring-2 focus-visible:ring-indigo-300"
                    />
                    <Input
                      type="password"
                      value={cmsApiKey}
                      onChange={(e) => setCmsApiKey(e.target.value)}
                      placeholder="Webflow API Token"
                      className="h-10 bg-white border-slate-200 text-slate-900 text-xs focus-visible:ring-2 focus-visible:ring-indigo-300"
                    />
                  </>
                )}

                {selectedCms === "GHOST" && (
                  <>
                    <Input
                      value={cmsUrl}
                      onChange={(e) => setCmsUrl(e.target.value)}
                      placeholder="Ghost Blog URL (https://myghostblog.com)"
                      className="h-10 bg-white border-slate-200 text-slate-900 text-xs focus-visible:ring-2 focus-visible:ring-indigo-300"
                    />
                    <Input
                      type="password"
                      value={cmsApiKey}
                      onChange={(e) => setCmsApiKey(e.target.value)}
                      placeholder="Ghost Admin API Key"
                      className="h-10 bg-white border-slate-200 text-slate-900 text-xs focus-visible:ring-2 focus-visible:ring-indigo-300"
                    />
                  </>
                )}

                {selectedCms === "MEDIUM" && (
                  <>
                    <Input
                      value={cmsUrl}
                      onChange={(e) => setCmsUrl(e.target.value)}
                      placeholder="Medium Publication or Profile Username"
                      className="h-10 bg-white border-slate-200 text-slate-900 text-xs focus-visible:ring-2 focus-visible:ring-indigo-300"
                    />
                    <Input
                      type="password"
                      value={cmsApiKey}
                      onChange={(e) => setCmsApiKey(e.target.value)}
                      placeholder="Medium Integration Token"
                      className="h-10 bg-white border-slate-200 text-slate-900 text-xs focus-visible:ring-2 focus-visible:ring-indigo-300"
                    />
                  </>
                )}

                {selectedCms === "CUSTOM" && (
                  <>
                    <Input
                      value={cmsUrl}
                      onChange={(e) => setCmsUrl(e.target.value)}
                      placeholder="Webhook Endpoint URL (https://api.mywebsite.com/posts)"
                      className="h-10 bg-white border-slate-200 text-slate-900 text-xs focus-visible:ring-2 focus-visible:ring-indigo-300"
                    />
                    <Input
                      type="password"
                      value={cmsApiKey}
                      onChange={(e) => setCmsApiKey(e.target.value)}
                      placeholder="Secret Token / Bearer Key (Optional)"
                      className="h-10 bg-white border-slate-200 text-slate-900 text-xs focus-visible:ring-2 focus-visible:ring-indigo-300"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="h-11 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleFinishOnboarding}
                disabled={loading}
                className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                {loading ? "Finalizing Setup..." : "Finish & Generate First Digest"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileSetup;