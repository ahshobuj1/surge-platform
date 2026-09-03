"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Loader2,
  User,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface ConnectedWordpressInfo {
  siteUrl: string;
  siteName: string;
  username: string;
  canPublish?: boolean;
}

interface ConnectWordpressModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
  onSuccess: (info: ConnectedWordpressInfo) => void;
  initialSiteUrl?: string;
  initialUsername?: string;
}

interface ConnectResponse {
  id: string;
  platform: string;
  siteName?: string;
  wpUser?: {
    id: number;
    name: string;
    slug: string;
  };
  canPublish?: boolean;
}

export function ConnectWordpressModal({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
  initialSiteUrl = "",
  initialUsername = "",
}: ConnectWordpressModalProps) {
  const [siteUrl, setSiteUrl] = useState(initialSiteUrl);
  const [username, setUsername] = useState(initialUsername);
  const [applicationPassword, setApplicationPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<ConnectedWordpressInfo | null>(
    null,
  );

  const isValidUrlFormat = (val: string): boolean => {
    try {
      const parsed = new URL(val);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const isFormFilled =
    siteUrl.trim().length > 0 &&
    username.trim().length > 0 &&
    applicationPassword.trim().length > 0;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = siteUrl.trim().replace(/\/+$/, "");
    const cleanUser = username.trim();
    const cleanPass = applicationPassword.trim();

    if (!cleanUrl || !cleanUser || !cleanPass) {
      setErrorText("Please fill out all fields.");
      return;
    }

    if (!isValidUrlFormat(cleanUrl)) {
      setErrorText("Please enter a valid HTTP or HTTPS WordPress URL.");
      return;
    }

    setLoading(true);
    setErrorText(null);

    try {
      const payload = {
        workspaceId: workspaceId || "",
        siteUrl: cleanUrl,
        username: cleanUser,
        applicationPassword: cleanPass,
      };

      // Connect endpoint verifies credentials and saves AES-256 encrypted channel
      const res = await api.post<ConnectResponse>(
        "/publishing-channels/wordpress/connect",
        payload,
      );

      const info: ConnectedWordpressInfo = {
        siteUrl: cleanUrl,
        siteName: res.siteName || cleanUrl.replace(/^https?:\/\//, ""),
        username: res.wpUser?.name || cleanUser,
        canPublish: res.canPublish,
      };

      setSuccessInfo(info);

      setTimeout(() => {
        onSuccess(info);
        onClose();
        setSuccessInfo(null);
      }, 1000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to connect to WordPress. Please verify your site URL, username, and Application Password.";
      setErrorText(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent
        className="max-w-md w-full rounded-[28px] bg-white p-6 sm:p-7 border border-slate-200/80 shadow-2xl font-mono"
        showCloseButton={!loading}
      >
        <DialogHeader className="mb-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#21759B] flex items-center justify-center mb-3 shadow-2xs">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-white"
              fill="currentColor"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM3.6 12c0-.98.18-1.92.5-2.79l2.76 7.57A8.4 8.4 0 013.6 12zm8.4 8.4a8.4 8.4 0 01-2.38-.34l2.53-7.35.02-.04 2.47 6.77c.01.04.03.07.05.1A8.38 8.38 0 0112 20.4zm1.16-11.26l2.07 6.01.57 1.9a8.4 8.4 0 01-5.19-8.63l2.55.72zm4.08.6c.4.71.62 1.53.62 2.26 0 1.76-.95 5.27-1.4 6.97l-3.83-11.38c.64-.03 1.21-.1 1.21-.1.57-.07.5-.9-.07-.87 0 0-1.71.14-2.81.14-1.04 0-2.78-.14-2.78-.14-.57-.03-.64.83-.07.87 0 0 .54.07 1.11.1L11.6 14.6 9.53 8.74c.64-.03 1.21-.1 1.21-.1.57-.07.5-.9-.07-.87 0 0-1.71.14-2.81.14h-.66A8.4 8.4 0 0119.2 12c0 .64-.08 1.26-.21 1.86l-.55-1.84-1.2-3.28z" />
            </svg>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 font-mono tracking-tight">
            Connect WordPress
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-mono mt-1">
            Programmatically publish generated articles using WordPress native Application Passwords.
          </DialogDescription>
        </DialogHeader>

        {/* How to get credentials helper box */}
        <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3 text-[11px] font-mono text-slate-600 mb-4 flex flex-col gap-1">
          <p className="font-semibold text-slate-700 flex items-center gap-1">
            <span>Where to get your Application Password:</span>
          </p>
          <ol className="list-decimal list-inside space-y-0.5 text-slate-500 pl-0.5">
            <li>Open your WordPress Admin dashboard.</li>
            <li>Go to <strong className="text-slate-700">Users → Profile</strong>.</li>
            <li>Scroll down to <strong className="text-slate-700">Application Passwords</strong>.</li>
            <li>Enter &quot;Surge Platform&quot; and click <strong className="text-slate-700">Add New</strong>.</li>
          </ol>
        </div>

        {/* Form */}
        <form onSubmit={(e) => void handleConnect(e)} className="flex flex-col gap-3.5">
          {/* Site URL */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold text-slate-700 font-mono flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#21759B]" />
              WordPress Site URL
            </Label>
            <Input
              type="url"
              value={siteUrl}
              disabled={loading}
              onChange={(e) => {
                setSiteUrl(e.target.value);
                if (errorText) setErrorText(null);
              }}
              placeholder="https://mycompany.com"
              className="h-11 rounded-full border-slate-200/80 bg-white shadow-2xs text-xs font-mono px-4 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#4F62E8]/20 focus-visible:border-[#4F62E8]"
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold text-slate-700 font-mono flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#21759B]" />
              WordPress Username
            </Label>
            <Input
              type="text"
              value={username}
              disabled={loading}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorText) setErrorText(null);
              }}
              placeholder="admin"
              className="h-11 rounded-full border-slate-200/80 bg-white shadow-2xs text-xs font-mono px-4 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#4F62E8]/20 focus-visible:border-[#4F62E8]"
            />
          </div>

          {/* Application Password */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold text-slate-700 font-mono flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#21759B]" />
              Application Password
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={applicationPassword}
                disabled={loading}
                onChange={(e) => {
                  setApplicationPassword(e.target.value);
                  if (errorText) setErrorText(null);
                }}
                placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                className="h-11 rounded-full border-slate-200/80 bg-white shadow-2xs text-xs font-mono px-4 pr-11 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#4F62E8]/20 focus-visible:border-[#4F62E8]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorText && (
            <div className="flex items-start gap-2 text-xs font-mono text-red-600 bg-red-50/80 border border-red-200 rounded-xl p-3 mt-1">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Success Banner */}
          {successInfo && (
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mt-1">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>
                Connected to &quot;{successInfo.siteName}&quot; as {successInfo.username}!
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 mt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={onClose}
              className="h-11 px-5 rounded-full text-xs font-mono font-medium border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormFilled || loading}
              className={cn(
                "h-11 px-6 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2",
                isFormFilled && !loading
                  ? "bg-[#4F62E8] hover:bg-[#4353D3] text-white shadow-[0_4px_14px_rgba(79,98,232,0.3)]"
                  : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed hover:bg-slate-200",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Site...</span>
                </>
              ) : (
                <>
                  <span>Verify & Connect</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
