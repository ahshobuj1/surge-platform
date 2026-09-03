"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspace } from "@/lib/context/WorkspaceContext";
import { api } from "@/lib/api";
import { PublishingChannel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Linkedin, Facebook, Twitter, Instagram, Globe, Plus } from "lucide-react";

export function SettingsPublishing() {
  const { activeWorkspace } = useWorkspace();
  const [channels, setChannels] = useState<PublishingChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // CMS State
  const [selectedCms, setSelectedCms] = useState<
    "WORDPRESS" | "WEBFLOW" | "GHOST" | "MEDIUM" | "CUSTOM"
  >("WORDPRESS");
  const [cmsUrl, setCmsUrl] = useState("");
  const [cmsApiKey, setCmsApiKey] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";

  const fetchChannels = async () => {
    if (!activeWorkspace?.id) return;
    setLoading(true);
    try {
      const res = await api.get<PublishingChannel[]>(
        `/publishing-channels?workspaceId=${activeWorkspace.id}`
      );
      setChannels(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to fetch publishing channels:", err);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [activeWorkspace?.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const connectedPlatform = urlParams.get("connected");
      const oauthError = urlParams.get("error");

      if (connectedPlatform) {
        setSuccessMsg(`Successfully connected ${connectedPlatform.toUpperCase()} channel!`);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (oauthError) {
        setErrorMsg(`OAuth Authorization Failed: ${oauthError}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleConnectOAuth = (platform: "linkedin" | "facebook" | "wordpress") => {
    if (!activeWorkspace?.id) return;
    window.location.href = `${API_BASE_URL}/publishing-channels/oauth/${platform}/authorize?workspaceId=${activeWorkspace.id}`;
  };

  const handleConnectCms = async () => {
    if (!cmsUrl || !activeWorkspace?.id) {
      setErrorMsg("Please enter the Site / Endpoint URL.");
      return;
    }

    setConnecting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const newChannel = await api.post<PublishingChannel>("/publishing-channels", {
        workspaceId: activeWorkspace.id,
        platform: selectedCms,
        channelName: cmsUrl,
        credentials: {
          siteUrl: cmsUrl,
          apiKey: cmsApiKey,
          applicationPassword: cmsApiKey,
        },
      });
      setChannels((prev) => [...prev, newChannel]);
      setCmsUrl("");
      setCmsApiKey("");
      setSuccessMsg(`${selectedCms} platform connected successfully!`);
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to connect ${selectedCms} channel.`);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      await api.delete(`/publishing-channels/${id}`);
      setChannels((prev) => prev.filter((c) => c.id !== id));
      setSuccessMsg("Channel disconnected successfully.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to disconnect channel.");
    }
  };

  const linkedInChannels = channels.filter(
    (c) => c.platform?.toUpperCase() === "LINKEDIN"
  );
  const facebookChannels = channels.filter(
    (c) => c.platform?.toUpperCase() === "FACEBOOK"
  );

  return (
    <div className="flex flex-col gap-6">
      {errorMsg && (
        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
          {successMsg}
        </div>
      )}

      {/* Connected Channels List */}
      {channels.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-900">Connected Channels</h2>
          <div className="flex flex-col gap-2">
            {channels.map((ch) => (
              <div key={ch.id} className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 uppercase">
                    {ch.platform}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{ch.channelName}</span>
                </div>
                <button
                  onClick={() => handleDisconnect(ch.id)}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OAuth Platforms */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-900">Social OAuth Channels</h2>
        <p className="text-sm text-slate-500">
          Connect your social profiles & channels for automated content distribution.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* LinkedIn */}
          <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between shadow-xs bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Linkedin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">LinkedIn</p>
                <p className="text-xs text-slate-500">
                  {linkedInChannels.length > 0 ? `${linkedInChannels.length} connected` : "Not connected"}
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleConnectOAuth("linkedin")}
              variant={linkedInChannels.length > 0 ? "outline" : "default"}
              className="text-xs h-9 px-3"
            >
              {linkedInChannels.length > 0 ? "Connected" : "Connect"}
            </Button>
          </div>

          {/* Facebook */}
          <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between shadow-xs bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Facebook className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Facebook Page</p>
                <p className="text-xs text-slate-500">
                  {facebookChannels.length > 0 ? `${facebookChannels.length} connected` : "Not connected"}
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleConnectOAuth("facebook")}
              variant={facebookChannels.length > 0 ? "outline" : "default"}
              className="text-xs h-9 px-3"
            >
              {facebookChannels.length > 0 ? "Connected" : "Connect"}
            </Button>
          </div>

          {/* Twitter / X */}
          <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between shadow-xs bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <Twitter className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Twitter / X</p>
                <p className="text-xs text-slate-500">Not connected</p>
              </div>
            </div>
            <Button
              onClick={() => handleConnectOAuth("linkedin")}
              variant="outline"
              className="text-xs h-9 px-3"
            >
              Connect
            </Button>
          </div>

          {/* Instagram */}
          <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between shadow-xs bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0">
                <Instagram className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Instagram</p>
                <p className="text-xs text-slate-500">Not connected</p>
              </div>
            </div>
            <Button
              onClick={() => handleConnectOAuth("facebook")}
              variant="outline"
              className="text-xs h-9 px-3"
            >
              Connect
            </Button>
          </div>

          {/* Bluesky / Threads */}
          <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between shadow-xs bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Bluesky / Threads</p>
                <p className="text-xs text-slate-500">Not connected</p>
              </div>
            </div>
            <Button
              onClick={() => handleConnectOAuth("linkedin")}
              variant="outline"
              className="text-xs h-9 px-3"
            >
              Connect
            </Button>
          </div>
        </div>
      </div>

      {/* Multi-CMS & Blog Integration */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">CMS & Blog Publishing Platform</h2>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            REST API & Webhooks
          </span>
        </div>

        {/* CMS Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200">
          {[
            { id: "WORDPRESS", label: "WordPress" },
            { id: "WEBFLOW", label: "Webflow" },
            { id: "GHOST", label: "Ghost" },
            { id: "MEDIUM", label: "Medium" },
            { id: "CUSTOM", label: "Custom Webhook" },
          ].map((cms) => (
            <button
              key={cms.id}
              type="button"
              onClick={() => setSelectedCms(cms.id as any)}
              className={cn(
                "text-xs font-semibold py-2 px-3 rounded-lg transition-all text-center",
                selectedCms === cms.id
                  ? "bg-white text-indigo-700 shadow-sm font-bold border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {cms.label}
            </button>
          ))}
        </div>

        {/* Dynamic Inputs based on selected CMS */}
        <div className="flex flex-col gap-4">
          {selectedCms === "WORDPRESS" && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-slate-700">Site URL</Label>
                <Input
                  value={cmsUrl}
                  onChange={(e) => setCmsUrl(e.target.value)}
                  placeholder="https://blog.example.com"
                  className="h-11 rounded-xl border-slate-200 text-base"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-slate-700">Application Password</Label>
                <Input
                  type="password"
                  value={cmsApiKey}
                  onChange={(e) => setCmsApiKey(e.target.value)}
                  placeholder="•••• •••• •••• ••••"
                  className="h-11 rounded-xl border-slate-200 text-base"
                />
              </div>
            </>
          )}

          {selectedCms === "WEBFLOW" && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-slate-700">Webflow Site URL / Collection ID</Label>
                <Input
                  value={cmsUrl}
                  onChange={(e) => setCmsUrl(e.target.value)}
                  placeholder="https://my-webflow-site.webflow.io"
                  className="h-11 rounded-xl border-slate-200 text-base"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-slate-700">Webflow API Token</Label>
                <Input
                  type="password"
                  value={cmsApiKey}
                  onChange={(e) => setCmsApiKey(e.target.value)}
                  placeholder="Bearer token from Webflow Admin"
                  className="h-11 rounded-xl border-slate-200 text-base"
                />
              </div>
            </>
          )}

          {selectedCms === "GHOST" && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-slate-700">Ghost Blog URL</Label>
                <Input
                  value={cmsUrl}
                  onChange={(e) => setCmsUrl(e.target.value)}
                  placeholder="https://myghostblog.com"
                  className="h-11 rounded-xl border-slate-200 text-base"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-slate-700">Ghost Admin API Key</Label>
                <Input
                  type="password"
                  value={cmsApiKey}
                  onChange={(e) => setCmsApiKey(e.target.value)}
                  placeholder="Admin API key string"
                  className="h-11 rounded-xl border-slate-200 text-base"
                />
              </div>
            </>
          )}

          {selectedCms === "MEDIUM" && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-slate-700">Medium Username / Publication</Label>
                <Input
                  value={cmsUrl}
                  onChange={(e) => setCmsUrl(e.target.value)}
                  placeholder="@username or Publication Name"
                  className="h-11 rounded-xl border-slate-200 text-base"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-slate-700">Medium Integration Token</Label>
                <Input
                  type="password"
                  value={cmsApiKey}
                  onChange={(e) => setCmsApiKey(e.target.value)}
                  placeholder="Integration token from Medium Settings"
                  className="h-11 rounded-xl border-slate-200 text-base"
                />
              </div>
            </>
          )}

          {selectedCms === "CUSTOM" && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-slate-700">Webhook Endpoint URL</Label>
                <Input
                  value={cmsUrl}
                  onChange={(e) => setCmsUrl(e.target.value)}
                  placeholder="https://api.mywebsite.com/v1/posts/receive"
                  className="h-11 rounded-xl border-slate-200 text-base"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-slate-700">Secret Token / Bearer Key (Optional)</Label>
                <Input
                  type="password"
                  value={cmsApiKey}
                  onChange={(e) => setCmsApiKey(e.target.value)}
                  placeholder="Optional authorization secret"
                  className="h-11 rounded-xl border-slate-200 text-base"
                />
              </div>
            </>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleConnectCms}
              disabled={connecting}
              className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {connecting ? "Connecting..." : `Connect ${selectedCms === "CUSTOM" ? "Webhook" : selectedCms.charAt(0) + selectedCms.slice(1).toLowerCase()}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPublishing;
