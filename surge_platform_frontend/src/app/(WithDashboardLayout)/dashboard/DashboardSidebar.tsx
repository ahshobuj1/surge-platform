"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import ZerodraftLogo from "@/app/component/shared/ZeroDraftLogo";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Zerodrafts", href: "/dashboard/zerodraft" },
  { label: "Brands", href: "/dashboard/brand" },
  { label: "Sources", href: "/dashboard/sources" },
  { label: "Settings", href: "/dashboard/settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <Sidebar className="border-r border-slate-200/70 bg-white">
      <SidebarHeader className="pt-8 pb-6 px-6">
        <div className="px-2 flex items-center justify-start">
          <ZerodraftLogo size="md" className="mb-0 justify-start" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-6 py-0">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className={cn(
                        "px-4 py-2.5 h-auto rounded-xl text-base font-medium transition-colors cursor-pointer",
                        isActive
                          ? "bg-[#5070FF] text-white hover:bg-[#4363F3] hover:text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-12 px-2">
          <button
            onClick={() => logout()}
            className="px-4 py-2 text-base font-medium text-slate-400 hover:text-slate-700 transition-colors w-full text-left cursor-pointer"
          >
            Log out
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
