"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useWorkspace } from "@/lib/context/WorkspaceContext";
import { Sparkles } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user } = useAuth();
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();

  const userName = user?.name || user?.email || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 pt-7 pb-2 gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{title}</h1>
          {workspaces.length > 0 && (
            <select
              value={activeWorkspace?.id || ""}
              onChange={(e) => switchWorkspace(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  Workspace: {w.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <p className="text-base text-muted-foreground mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="/profile"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Setup Wizard
        </a>

        <div className="flex items-center gap-2.5">
          {user?.avatarKey ? (
            <img
              src={user.avatarKey}
              alt={userName}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
              {userInitials}
            </div>
          )}
          <span className="text-base font-semibold text-foreground">{userName}</span>
        </div>
      </div>
    </div>
  );
}