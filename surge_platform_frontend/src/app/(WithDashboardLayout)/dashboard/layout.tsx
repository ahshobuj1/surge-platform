"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { DashboardSidebar } from "./DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user && !user.isOnboarded) {
        router.replace("/onboarding");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

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
