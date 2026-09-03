"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input"; // বাংলা: shadcn input import

type Props = {
  length?: number;
  onChange: (otp: string) => void;
};

export default function OtpInput({ length = 6, onChange }: Props) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // বাংলা: প্রথম input এ auto focus করার জন্য
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    onChange(newOtp.join(""));

    // বাংলা: digit দিলে next input এ focus যাবে
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // বাংলা: backspace দিলে আগের input এ focus যাবে
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
    const newOtp = [...otp];

    for (let i = 0; i < pasteData.length && i < length; i++) {
      newOtp[i] = pasteData[i];
    }

    setOtp(newOtp);
    onChange(newOtp.join(""));
  };

  return (
    <div className="flex justify-center gap-3">
      {otp.map((digit, index) => (
        <Input
          key={index}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          className="h-12 w-12 text-center text-lg font-semibold
          bg-white border border-border rounded-lg
          focus:ring-2 focus:ring-primary"
        />
      ))}
    </div>
  );
}