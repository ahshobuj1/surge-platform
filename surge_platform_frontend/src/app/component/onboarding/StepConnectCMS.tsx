"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Globe, Unlink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ConnectWordpressModal,
  ConnectedWordpressInfo,
} from "./ConnectWordpressModal";

interface Platform {
  id: string;
  name: string;
  category: "CMS" | "Social";
  disabled?: boolean;
  comingSoon?: boolean;
  icon: React.ReactNode;
}

interface StepConnectPlatformsProps {
  onContinue: (connectedPlatformIds: string[]) => void;
  initialConnected?: string[];
  workspaceId?: string;
}

const WordpressIcon = () => (
  <div className="w-10 h-10 rounded-xl bg-[#21759B] flex items-center justify-center shrink-0 shadow-2xs">
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM3.6 12c0-.98.18-1.92.5-2.79l2.76 7.57A8.4 8.4 0 013.6 12zm8.4 8.4a8.4 8.4 0 01-2.38-.34l2.53-7.35.02-.04 2.47 6.77c.01.04.03.07.05.1A8.38 8.38 0 0112 20.4zm1.16-11.26l2.07 6.01.57 1.9a8.4 8.4 0 01-5.19-8.63l2.55.72zm4.08.6c.4.71.62 1.53.62 2.26 0 1.76-.95 5.27-1.4 6.97l-3.83-11.38c.64-.03 1.21-.1 1.21-.1.57-.07.5-.9-.07-.87 0 0-1.71.14-2.81.14-1.04 0-2.78-.14-2.78-.14-.57-.03-.64.83-.07.87 0 0 .54.07 1.11.1L11.6 14.6 9.53 8.74c.64-.03 1.21-.1 1.21-.1.57-.07.5-.9-.07-.87 0 0-1.71.14-2.81.14h-.66A8.4 8.4 0 0119.2 12c0 .64-.08 1.26-.21 1.86l-.55-1.84-1.2-3.28z" />
    </svg>
  </div>
);

const SquarespaceIcon = () => (
  <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0 shadow-2xs">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5l-4-4 1.41-1.41L10.5 13.67l5.59-5.59L17.5 9.5l-7 7z" />
    </svg>
  </div>
);

const WixIcon = () => (
  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs opacity-80">
    <span className="font-black text-slate-700 text-xs tracking-tighter font-mono">
      WiX
    </span>
  </div>
);

const LinkedInIcon = () => (
  <div className="w-10 h-10 rounded-xl bg-[#0A66C2]/80 flex items-center justify-center shrink-0 shadow-2xs">
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5 text-white"
      fill="currentColor"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  </div>
);

const InstagramIcon = () => (
  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFDC80]/80 via-[#FD1D1D]/80 to-[#833AB4]/80 flex items-center justify-center shrink-0 shadow-2xs">
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5 text-white"
      fill="currentColor"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  </div>
);

const FacebookIcon = () => (
  <div className="w-10 h-10 rounded-xl bg-[#1877F2]/80 flex items-center justify-center shrink-0 shadow-2xs">
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5 text-white"
      fill="currentColor"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  </div>
);

const PLATFORM_LIST: Platform[] = [
  {
    id: "wordpress",
    name: "WordPress",
    category: "CMS",
    disabled: false,
    icon: <WordpressIcon />,
  },
  {
    id: "squarespace",
    name: "Squarespace",
    category: "CMS",
    disabled: true,
    comingSoon: true,
    icon: <SquarespaceIcon />,
  },
  {
    id: "wix",
    name: "Wix",
    category: "CMS",
    disabled: true,
    comingSoon: true,
    icon: <WixIcon />,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "Social",
    disabled: true,
    comingSoon: true,
    icon: <LinkedInIcon />,
  },
  {
    id: "instagram",
    name: "Instagram",
    category: "Social",
    disabled: true,
    comingSoon: true,
    icon: <InstagramIcon />,
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "Social",
    disabled: true,
    comingSoon: true,
    icon: <FacebookIcon />,
  },
];

export function StepConnectPlatforms({
  onContinue,
  initialConnected = [],
  workspaceId,
}: StepConnectPlatformsProps) {
  const [isWpConnected, setIsWpConnected] = useState<boolean>(
    initialConnected.includes("wordpress"),
  );
  const [wpInfo, setWpInfo] = useState<ConnectedWordpressInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWordpressConnected = (info: ConnectedWordpressInfo) => {
    setIsWpConnected(true);
    setWpInfo(info);
  };

  const handleDisconnectWordpress = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWpConnected(false);
    setWpInfo(null);
  };

  const handleCardClick = (platformId: string) => {
    if (platformId === "wordpress") {
      setIsModalOpen(true);
    }
  };

  const handleContinue = () => {
    const connectedIds: string[] = [];
    if (isWpConnected) connectedIds.push("wordpress");
    onContinue(connectedIds);
  };

  const canContinue = isWpConnected;

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-mono font-medium text-slate-400 mb-1.5">
            Step 3 of 4
          </p>
          <h1 className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
            Connect Platforms
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Connect your publishing channels to programmatically publish generated content.
          </p>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mt-1">
          {PLATFORM_LIST.map((platform) => {
            const isWordpress = platform.id === "wordpress";
            const isConnected = isWordpress && isWpConnected;

            return (
              <Card
                key={platform.id}
                onClick={() => !platform.disabled && handleCardClick(platform.id)}
                className={cn(
                  "flex-row items-center gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 shadow-2xs group select-none ring-0 relative overflow-hidden",
                  isConnected
                    ? "border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50/80 cursor-pointer shadow-sm"
                    : isWordpress
                    ? "border-slate-200 hover:border-[#4F62E8] hover:bg-indigo-50/30 bg-white/90 cursor-pointer"
                    : "border-slate-200/60 bg-slate-50/40 opacity-60 cursor-not-allowed",
                )}
              >
                {/* Platform Icon */}
                <div className="shrink-0">{platform.icon}</div>

                {/* Details */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-bold text-slate-900 truncate font-mono">
                      {platform.name}
                    </span>
                    {platform.comingSoon && (
                      <Badge
                        variant="outline"
                        className="text-[9px] font-mono font-semibold px-1.5 py-0 h-4 border-slate-200 text-slate-400 bg-slate-100 shrink-0"
                      >
                        Soon
                      </Badge>
                    )}
                  </div>

                  {/* Status Indicator */}
                  {isConnected ? (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] font-mono font-semibold text-emerald-700 flex items-center gap-1 truncate">
                        <Check className="w-3 h-3 stroke-[3]" />
                        {wpInfo?.siteName ? wpInfo.siteName : "Connected"}
                      </span>
                      <button
                        type="button"
                        onClick={handleDisconnectWordpress}
                        title="Disconnect"
                        className="text-[10px] font-mono text-slate-400 hover:text-red-500 transition-colors ml-1"
                      >
                        <Unlink className="w-3 h-3" />
                      </button>
                    </div>
                  ) : isWordpress ? (
                    <span className="text-[11px] font-mono font-semibold text-[#4F62E8] group-hover:underline mt-1 inline-flex items-center gap-1">
                      <span>Click to Connect</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400 mt-1">
                      In Development
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Connected Details Preview Card */}
        {isWpConnected && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate font-mono">
                  {wpInfo?.siteName || "WordPress Blog"}
                </p>
                <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                  {wpInfo?.siteUrl || "Connected via REST API"} • Ready to receive articles
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-8 px-3 rounded-full text-xs font-mono border-emerald-300 text-emerald-800 hover:bg-emerald-100 shrink-0 cursor-pointer"
            >
              Change Site
            </Button>
          </div>
        )}
      </div>

      {/* Footer Area */}
      <div className="flex justify-between items-center pt-8 mt-auto border-t border-slate-100">
        <p className="text-xs font-mono text-slate-400">
          {canContinue
            ? "✓ WordPress verified. Click Continue to proceed."
            : "Connect your WordPress site to proceed."}
        </p>

        <Button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className={cn(
            "h-12 px-9 rounded-full text-sm font-mono font-semibold transition-all cursor-pointer flex items-center gap-2",
            canContinue
              ? "bg-[#4F62E8] hover:bg-[#4353D3] text-white shadow-[0_4px_14px_rgba(79,98,232,0.3)]"
              : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed hover:bg-slate-200",
          )}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* WordPress Connect Modal */}
      <ConnectWordpressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceId={workspaceId}
        onSuccess={handleWordpressConnected}
        initialSiteUrl={wpInfo?.siteUrl}
        initialUsername={wpInfo?.username}
      />
    </div>
  );
}