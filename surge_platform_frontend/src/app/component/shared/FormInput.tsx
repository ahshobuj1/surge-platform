"use client";

import { Label } from "@/components/ui/label";
import {
  FieldError,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import React from "react";

type FormInputProps<T extends FieldValues = FieldValues> = {
  label: string;
  name: Path<T>;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  rules?: RegisterOptions<T, Path<T>>;
  error?: FieldError;
  rightLabel?: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export default function FormInput<T extends FieldValues = FieldValues>({
  label,
  name,
  type = "text",
  placeholder,
  register,
  rules,
  error,
  rightLabel,
  className,
  disabled,
}: FormInputProps<T>) {
  return (
    <div className="space-y-1.5 text-left">
      <div className="flex items-center justify-between px-1">
        <Label className="text-xs font-semibold text-slate-700">
          {label}
        </Label>
        {rightLabel}
      </div>

      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name, rules)}
        className={cn(
          "h-11 w-full rounded-full bg-white border border-slate-200 px-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-all focus:border-[#4F62E8] focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-400",
          error && "border-red-400 focus:border-red-500 focus:ring-red-100",
          className
        )}
      />

      {error && (
        <p className="text-red-500 text-xs px-2 pt-0.5 animate-in fade-in duration-150">
          {error.message}
        </p>
      )}
    </div>
  );
}