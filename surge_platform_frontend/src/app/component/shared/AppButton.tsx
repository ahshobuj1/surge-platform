"use client";

import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AppButtonProps = {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

export default function AppButton({
  children,
  type = "button",
  onClick,
  className = "",
  disabled = false,
}: AppButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full h-11 rounded-full bg-[#4F62E8] hover:bg-[#4353D3] text-white font-semibold text-sm cursor-pointer shadow-[0_4px_14px_rgba(79,98,232,0.3)] hover:shadow-[0_6px_20px_rgba(79,98,232,0.4)] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none",
        className
      )}
    >
      {children}
    </Button>
  );
}
