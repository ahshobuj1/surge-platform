"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api";
import { User } from "@/lib/types";
import { DashboardSidebar } from "./DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      if (isLoading) return;

      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      if (user && !user.isOnboarded) {
        // Double-check with backend in case user was just marked onboarded
        try {
          const fresh = await api.get<User>("/users/me");
          if (!cancelled) {
            if (fresh?.isOnboarded) {
              await refreshUser();
              return;
            }
            router.replace("/onboarding");
          }
        } catch {
          if (!cancelled) {
            router.replace("/onboarding");
          }
        }
      }
    }

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated, user, router, refreshUser]);

  if (isLoading || !isAuthenticated || (user && !user.isOnboarded)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">
            {isLoading ? "Verifying authentication..." : "Redirecting to setup..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-full flex dashboard-scale bg-slate-50/50">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
