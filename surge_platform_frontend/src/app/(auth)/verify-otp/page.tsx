"use client";

import { Suspense, useState } from "react";
import AppButton from "@/app/component/shared/AppButton";
import OtpInput from "@/app/component/auth/OtpInput";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { api, ApiError } from "@/lib/api";

function EmailQueryText() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";
  return <span>{email || "your registered email"}</span>;
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const { verifyOtp } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify || otp).trim();
    if (code.length < 6) {
      setErrorMsg("Please enter the full 6-digit verification code.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await verifyOtp(code);
      setSuccessMsg("Email verified successfully! Redirecting to setup...");
      setTimeout(() => {
        if (res.user?.isOnboarded) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Invalid OTP code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setErrorMsg("");
    if (value.length === 6) {
      handleVerify(value);
    }
  };

  const handleResend = async () => {
    let email = "";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      email = params.get("email") || "";
    }
    if (!email) {
      setErrorMsg("Email address missing. Please go back to login.");
      return;
    }
    setResending(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.post("/auth/resend-otp", { email });
      setSuccessMsg("A new verification code has been sent to your email.");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to resend verification code.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-[28px] border border-white/80 p-8 sm:p-9 shadow-[0_20px_50px_-15px_rgba(79,90,140,0.18)]">
      <h1 className="text-center text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Check your email
      </h1>

      <p className="text-center text-xs sm:text-[13px] text-slate-500 mb-6 leading-relaxed">
        Please enter the 6-digit code we sent to{" "}
        <span className="font-semibold text-slate-700">
          <Suspense fallback={<span>your registered email</span>}>
            <EmailQueryText />
          </Suspense>
        </span>
      </p>

      {errorMsg && (
        <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 rounded-2xl border border-red-200 text-center animate-in fade-in duration-200">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 text-xs text-emerald-600 bg-emerald-50 rounded-2xl border border-emerald-200 text-center animate-in fade-in duration-200">
          {successMsg}
        </div>
      )}

      <div className="py-2">
        <OtpInput onChange={handleOtpChange} disabled={loading} />
      </div>

      <div className="pt-4">
        <AppButton
          type="button"
          onClick={() => handleVerify()}
          disabled={loading || otp.length < 6}
          className="w-full"
        >
          {loading ? "Verifying..." : "Verify Code"}
        </AppButton>
      </div>

      <p className="text-center text-xs sm:text-[13px] text-slate-500 pt-4">
        Didn&apos;t receive code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || loading}
          className="text-[#4F62E8] font-semibold hover:underline disabled:opacity-50"
        >
          {resending ? "Resending..." : "Resend"}
        </button>
      </p>
    </div>
  );
}
