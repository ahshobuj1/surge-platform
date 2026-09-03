"use client";

import { Suspense, useState } from "react";
import AppButton from "@/app/component/shared/AppButton";
import OtpInput from "@/app/component/auth/OtpInput";
import ZerodraftLogo from "@/app/component/shared/ZeroDraftLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { verifyOtp } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleVerify = async () => {
    if (otp.length < 6) {
      setErrorMsg("Please enter the full 6-digit OTP code.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      // Backend VerifyTokenDto only accepts { token } — the 6-digit OTP code
      await verifyOtp(otp);
      setSuccessMsg("Email verified successfully! Redirecting to setup wizard...");
      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setErrorMsg("Email address missing. Please go back to login.");
      return;
    }
    setResending(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      // Backend ResendOtpDto accepts { email }
      await api.post("/auth/resend-otp", { email });
      setSuccessMsg("A new verification code has been sent to your email.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend OTP code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-slate-50/50">
      <ZerodraftLogo />
      <Card className="w-full max-w-md border border-slate-200 bg-white shadow-xl rounded-2xl">
        <CardHeader className="pb-2 pt-8 text-center">
          <CardTitle className="text-2xl font-bold text-slate-900">
            Check your email
          </CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            Enter the 6-digit verification code sent to
            <br />
            <span className="font-semibold text-slate-900">
              {email || "your registered email"}
            </span>
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8 space-y-6">
          {errorMsg && (
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
              {successMsg}
            </div>
          )}

          <div className="flex justify-center py-2">
            <OtpInput onChange={setOtp} />
          </div>

          <AppButton type="button" onClick={handleVerify} disabled={loading} className="w-full">
            {loading ? "Verifying..." : "Verify Code"}
          </AppButton>

          <p className="text-center text-sm text-slate-500">
            Didn&apos;t receive code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-indigo-600 font-medium hover:underline disabled:opacity-50"
            >
              {resending ? "Resending..." : "Resend"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
