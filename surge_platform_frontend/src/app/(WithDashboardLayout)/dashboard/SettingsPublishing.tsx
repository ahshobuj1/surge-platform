"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Power,
  RefreshCw,
  Info,
  ShieldCheck,
} from "lucide-react";
import { useWorkspace } from "@/lib/context/WorkspaceContext";
import { api, ApiError } from "@/lib/api";
import { PublishingChannel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ValidatedWpResponse {
  isValid: boolean;
  siteUrl: string;
  siteName: string;
  siteDescription?: string;
  user: {
    id: number;
    name: string;
    slug: string;
    roles?: string[];
  };
  canPublish: boolean;
}

interface UpcomingPlatform {
  id: string;
  name: string;
  category: "Social" | "CMS";
  description: string;
  iconBg: string;
  iconColor: string;
}

const UPCOMING_PLATFORMS: UpcomingPlatform[] = [
  {
    id: "webflow",
    name: "Webflow",
    category: "CMS",
    description: "Direct CMS Collection sync for Webflow sites and blogs.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: "ghost",
    name: "Ghost",
    category: "CMS",
    description: "Publish stories via Ghost Admin API and webhooks.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    id: "medium",
    name: "Medium",
    category: "CMS",
    description: "Syndicate drafts and stories to Medium publications.",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-800",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "Social",
    description: "Publish articles and post updates to profiles and company pages.",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-700",
  },
  {
    id: "twitter",
    name: "X / Twitter",
    category: "Social",
    description: "Automate thread generation and key takeaway summaries.",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-900",
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "Social",
    description: "Distribute blog highlights and links directly to Facebook Pages.",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
];

export function SettingsPublishing() {
  const { activeWorkspace } = useWorkspace();
  const [channels, setChannels] = useState<PublishingChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  // Form State
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [applicationPassword, setApplicationPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Feedback states
  const [validationResult, setValidationResult] = useState<ValidatedWpResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const refreshChannels = async () => {
    if (!activeWorkspace?.id) return;
    try {
      setLoading(true);
      const res = await api.get<PublishingChannel[]>(
        `/publishing-channels?workspaceId=${activeWorkspace.id}`
      );
      setChannels(Array.isArray(res) ? res : []);
    } catch {
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadInitialChannels() {
      if (!activeWorkspace?.id) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const res = await api.get<PublishingChannel[]>(
          `/publishing-channels?workspaceId=${activeWorkspace.id}`
        );
        if (!cancelled) {
          setChannels(Array.isArray(res) ? res : []);
        }
      } catch {
        if (!cancelled) {
          setChannels([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialChannels();

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace?.id]);

  const wpChannel = channels.find(
    (c) => c.platform?.toLowerCase() === "wordpress"
  );

  const handleTestConnection = async () => {
    const cleanUrl = siteUrl.trim();
    const cleanUser = username.trim();
    const cleanPass = applicationPassword.trim();

    if (!cleanUrl || !cleanUser || !cleanPass) {
      setErrorMsg("Please fill in Site URL, Username, and Application Password to test.");
      return;
    }

    setTesting(true);
    setErrorMsg("");
    setValidationResult(null);

    try {
      const res = await api.post<ValidatedWpResponse>("/publishing-channels/wordpress/validate", {
        siteUrl: cleanUrl,
        username: cleanUser,
        applicationPassword: cleanPass,
      });

      setValidationResult(res);
      setSuccessMsg(`Connection verified! Connected to "${res.siteName}" as ${res.user.name}.`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to connect to WordPress. Please verify your URL and Application Password.");
      }
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    if (!activeWorkspace?.id) {
      setErrorMsg("Please select an active workspace first.");
      return;
    }

    const cleanUrl = siteUrl.trim();
    const cleanUser = username.trim();
    const cleanPass = applicationPassword.trim();

    if (!cleanUrl || !cleanUser || !cleanPass) {
      setErrorMsg("Please fill in Site URL, Username, and Application Password.");
      return;
    }

    setConnecting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const connected = await api.post<PublishingChannel>("/publishing-channels/wordpress/connect", {
        workspaceId: activeWorkspace.id,
        siteUrl: cleanUrl,
        username: cleanUser,
        applicationPassword: cleanPass,
      });

      setChannels((prev) => {
        const withoutOld = prev.filter((c) => c.platform?.toLowerCase() !== "wordpress");
        return [connected, ...withoutOld];
      });

      setSiteUrl("");
      setUsername("");
      setApplicationPassword("");
      setValidationResult(null);
      setIsEditing(false);
      setSuccessMsg(`WordPress channel connected successfully to "${connected.channelName}"!`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to connect WordPress. Please check your credentials.");
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleToggleActive = async (channel: PublishingChannel) => {
    setTogglingId(channel.id);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const updated = await api.patch<PublishingChannel>(`/publishing-channels/${channel.id}`, {
        isActive: !channel.isActive,
      });

      setChannels((prev) =>
        prev.map((c) => (c.id === channel.id ? { ...c, isActive: updated.isActive } : c))
      );

      setSuccessMsg(`WordPress channel ${updated.isActive ? "activated" : "paused"}.`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to update channel status.");
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    setDisconnectingId(id);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await api.delete(`/publishing-channels/${id}`);
      setChannels((prev) => prev.filter((c) => c.id !== id));
      setIsEditing(false);
      setSuccessMsg("WordPress channel disconnected successfully.");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to disconnect channel.");
      }
    } finally {
      setDisconnectingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full font-sans pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Integrations & Publishing
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
          Connect your content management system to automatically publish AI-generated drafts.
        </p>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 text-xs font-medium text-red-700 bg-red-50 rounded-2xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── 1. ACTIVE INTEGRATION: WORDPRESS ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-white/80 flex flex-col gap-6">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0073AA] flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312L5.438 12.87A7.962 7.962 0 0 1 4.024 12c0-2.316.985-4.403 2.569-5.867l4.088 11.234a8.03 8.03 0 0 1-1.325.115c-.29 0-.665-.034-.665-.034-.403-.035-.461-.634-.058-.634 0 0 .605.035 1.152.035.548 0 1.18-.035 1.18-.035.404 0 .346.6-.057.634 0 0-.374.034-.664.034-.345 0-.893-.058-1.554-.173L12 21.975A9.97 9.97 0 0 0 12 22c5.523 0 10-4.477 10-10 0-4.148-2.527-7.705-6.136-9.213L18.59 12.95c.783-.49 1.386-1.295 1.386-2.42 0-1.642-1.18-2.822-2.706-2.822-.173 0-.317.029-.461.058l3.167 9.43A7.973 7.973 0 0 1 12 20c-.576 0-1.123-.058-1.642-.173l3.542-10.297c.547-1.44.922-2.593.922-3.514 0-1.325-.518-2.39-1.93-2.39-.748 0-1.468.375-2.072 1.008l-3.8 11.06L4.72 9.07C5.9 7.227 7.8 6 10 6c.547 0 1.094.086 1.613.23l-2.707 7.885 3.097-8.985Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">WordPress REST API</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  Available Now
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct publishing to your WordPress blog using secure Application Passwords.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {wpChannel ? (
              <span
                className={cn(
                  "text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5",
                  wpChannel.isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                )}
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    wpChannel.isActive ? "bg-emerald-500" : "bg-amber-500"
                  )}
                />
                {wpChannel.isActive ? "Connected & Active" : "Connected (Paused)"}
              </span>
            ) : (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-[#5060F0] border border-blue-200">
                Ready to Connect
              </span>
            )}
          </div>
        </div>

        {/* State A: WordPress Already Connected & Not in edit mode */}
        {wpChannel && !isEditing ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Site Details Box */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Target Website
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {wpChannel.credentials?.siteName || wpChannel.channelName || "WordPress Site"}
                  </p>
                  {wpChannel.credentials?.siteUrl && (
                    <a
                      href={wpChannel.credentials.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#5060F0] hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span className="truncate">{wpChannel.credentials.siteUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                </div>
              </div>

              {/* Author / Account Box */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Author Account
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {wpChannel.credentials?.username || "Authenticated User"}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Application Password
                  </p>
                </div>
              </div>

              {/* Publishing Status Box */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Publishing Status
                </span>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">
                    {wpChannel.isActive ? "Publishing Enabled" : "Publishing Paused"}
                  </p>
                  <button
                    onClick={() => handleToggleActive(wpChannel)}
                    disabled={togglingId === wpChannel.id}
                    title={wpChannel.isActive ? "Pause publishing" : "Enable publishing"}
                    className={cn(
                      "p-1.5 rounded-full transition-colors cursor-pointer",
                      wpChannel.isActive
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    )}
                  >
                    {togglingId === wpChannel.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2 rounded-full transition-colors cursor-pointer"
                >
                  Update Credentials
                </button>
                <button
                  onClick={() => refreshChannels()}
                  disabled={loading}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                  Refresh
                </button>
              </div>

              <button
                onClick={() => handleDisconnect(wpChannel.id)}
                disabled={disconnectingId === wpChannel.id}
                className="border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-xs px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {disconnectingId === wpChannel.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Disconnect Channel
              </button>
            </div>
          </div>
        ) : (
          /* State B: Connect / Update WordPress Form */
          <div className="flex flex-col gap-5">
            {/* Guide Info Box */}
            <div className="bg-blue-50/60 border border-blue-200/70 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-semibold text-blue-950">How to get an Application Password:</p>
                <p className="mt-1 text-blue-800">
                  In your WordPress Admin Dashboard, go to <strong>Users → Profile</strong>, scroll
                  down to <strong>Application Passwords</strong>, enter a name (e.g.{" "}
                  <em>Surge Platform</em>), click <strong>Add New Application Password</strong>, and
                  paste the key below.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Site URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  WordPress Site URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => {
                    setSiteUrl(e.target.value);
                    setErrorMsg("");
                  }}
                  placeholder="https://myblog.com"
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5060F0]/20 focus:border-[#5060F0]"
                />
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  WordPress Username / Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg("");
                  }}
                  placeholder="admin"
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5060F0]/20 focus:border-[#5060F0]"
                />
              </div>

              {/* Application Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Application Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={applicationPassword}
                  onChange={(e) => {
                    setApplicationPassword(e.target.value);
                    setErrorMsg("");
                  }}
                  placeholder="•••• •••• •••• ••••"
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5060F0]/20 focus:border-[#5060F0]"
                />
              </div>
            </div>

            {/* Validation Preview if Tested */}
            {validationResult && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Verified: <strong>{validationResult.siteName}</strong> (Author:{" "}
                    {validationResult.user.name}) · Can Publish:{" "}
                    {validationResult.canPublish ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
              {isEditing && wpChannel ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setErrorMsg("");
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel Edit
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing || !siteUrl || !username || !applicationPassword}
                  className="border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-semibold text-xs px-5 py-2.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {testing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Test Connection
                </button>

                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={connecting || !siteUrl || !username || !applicationPassword}
                  className="bg-[#4F62E8] hover:bg-[#4353D3] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {connecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isEditing ? "Save & Reconnect" : "Connect WordPress"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. UPCOMING INTEGRATIONS (ROADMAP) ── */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Upcoming Integrations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Additional CMS and social platforms currently in development.
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase">
            Coming Soon
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {UPCOMING_PLATFORMS.map((platform) => (
            <div
              key={platform.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3 opacity-80 hover:opacity-100 transition-opacity"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs",
                      platform.iconBg,
                      platform.iconColor
                    )}
                  >
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{platform.name}</h4>
                    <span className="text-[10px] font-medium text-slate-500">
                      {platform.category} Integration
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  Soon
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">{platform.description}</p>

              <button
                disabled
                className="w-full text-center py-2 text-xs font-semibold text-slate-400 bg-slate-50 rounded-xl border border-slate-200/60 cursor-not-allowed"
              >
                In Development
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SettingsPublishing;

