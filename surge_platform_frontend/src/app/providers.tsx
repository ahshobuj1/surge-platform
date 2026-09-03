"use client";

import React from "react";
import { AuthProvider } from "@/lib/context/AuthContext";
import { WorkspaceProvider } from "@/lib/context/WorkspaceContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>{children}</WorkspaceProvider>
    </AuthProvider>
  );
}
