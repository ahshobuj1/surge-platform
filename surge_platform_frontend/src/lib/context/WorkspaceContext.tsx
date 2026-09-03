"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Workspace } from "../types";
import { api } from "../api";
import { useAuth } from "./AuthContext";

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoadingWorkspaces: boolean;
  switchWorkspace: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState<boolean>(true);

  const fetchWorkspaces = async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setIsLoadingWorkspaces(false);
      return;
    }

    setIsLoadingWorkspaces(true);
    try {
      const data = await api.get<Workspace[]>("/workspaces");
      const list = Array.isArray(data) ? data : [];
      setWorkspaces(list);

      // Restore active workspace from localStorage or select first
      const savedWorkspaceId = typeof window !== "undefined" ? localStorage.getItem("activeWorkspaceId") : null;
      const found = list.find((w) => w.id === savedWorkspaceId) || list[0] || null;
      setActiveWorkspace(found);
      if (found && typeof window !== "undefined") {
        localStorage.setItem("activeWorkspaceId", found.id);
      }
    } catch (err) {
      console.error("Failed to fetch workspaces:", err);
      setWorkspaces([]);
      setActiveWorkspace(null);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [isAuthenticated]);

  const switchWorkspace = (workspaceId: string) => {
    const target = workspaces.find((w) => w.id === workspaceId);
    if (target) {
      setActiveWorkspace(target);
      if (typeof window !== "undefined") {
        localStorage.setItem("activeWorkspaceId", target.id);
      }
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        isLoadingWorkspaces,
        switchWorkspace,
        refreshWorkspaces: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
