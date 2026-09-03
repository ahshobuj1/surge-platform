"use client";

import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

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
      className={`w-full h-11 rounded-full 
      bg-blue-700 cursor-pointer hover:bg-blue-600
      text-white font-medium shadow-md
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}`}
    >
      {children}
    </Button>
  );
}
