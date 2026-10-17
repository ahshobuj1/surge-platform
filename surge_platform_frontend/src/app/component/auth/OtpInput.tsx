"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { OtpInputProps } from "@/lib/types";

export default function OtpInput({ length = 6, value = "", onChange, disabled = false }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (value) {
      const chars = value.replace(/\D/g, "").slice(0, length).split("");
      while (chars.length < length) chars.push("");
      setOtp(chars);
    }
  }, [value, length]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    onChange(newOtp.join(""));

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (disabled) return;
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    e.preventDefault();

    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
    const newOtp = [...otp];

    for (let i = 0; i < pasteData.length && i < length; i++) {
      newOtp[i] = pasteData[i];
    }

    setOtp(newOtp);
    onChange(newOtp.join(""));

    const focusIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex justify-center items-center gap-2 sm:gap-2.5">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          className={cn(
            "h-12 w-11 sm:w-12 text-center text-lg font-bold text-slate-900",
            "bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl",
            "shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-all",
            "focus:border-[#4F62E8] focus:ring-2 focus:ring-indigo-100",
            "disabled:bg-slate-50 disabled:text-slate-400"
          )}
        />
      ))}
    </div>
  );
}