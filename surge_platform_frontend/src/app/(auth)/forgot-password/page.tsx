"use client";

import { useState } from "react";
import AppButton from "@/app/component/shared/AppButton";
import FormInput from "@/app/component/shared/FormInput";
import ZerodraftLogo from "@/app/component/shared/ZeroDraftLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";

type RequestResetFormValues = {
  email: string;
};

type ResetPasswordFormValues = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const requestForm = useForm<RequestResetFormValues>();
  const resetForm = useForm<ResetPasswordFormValues>();

  const handleRequestReset = async (data: RequestResetFormValues) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.post("/auth/request-password-reset", { email: data.email });
      setEmail(data.email);
      setSuccessMsg("A password reset code has been sent to your email.");
      setStep("reset");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormValues) => {
    if (data.newPassword !== data.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      // ResetPasswordDto only accepts { token, newPassword } — no email
      await api.post("/auth/reset-password", {
        token: data.token,
        newPassword: data.newPassword,
      });
      setSuccessMsg("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password. Please check your reset code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-slate-50/50">
      <ZerodraftLogo />

      <Card className="w-full max-w-md border border-slate-200 bg-white shadow-xl rounded-2xl">
        <CardHeader className="pb-2 pt-8">
          <CardTitle className="text-center text-2xl font-bold text-slate-900">
            {step === "request" ? "Forgot Password" : "Reset Password"}
          </CardTitle>
          <p className="text-center text-sm text-slate-600 mt-2">
            {step === "request"
              ? "Enter your email to receive a password reset code"
              : `Enter the reset code sent to ${email}`}
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {errorMsg && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
              {successMsg}
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={requestForm.handleSubmit(handleRequestReset)} className="space-y-5">
              <FormInput
                label="Email"
                name="email"
                type="email"
                placeholder="youremail@gmail.com"
                register={requestForm.register}
                error={requestForm.formState.errors.email}
              />
              <AppButton type="submit" disabled={loading} className="w-full">
                {loading ? "Sending..." : "Send Reset Code"}
              </AppButton>
              <p className="text-center text-sm">
                <Link href="/login" className="text-indigo-600 hover:underline">
                  Back to Login
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <FormInput
                label="Reset Code"
                name="token"
                type="text"
                placeholder="Enter reset code"
                register={resetForm.register}
                error={resetForm.formState.errors.token}
              />
              <FormInput
                label="New Password"
                name="newPassword"
                type="password"
                placeholder="••••••••••"
                register={resetForm.register}
                error={resetForm.formState.errors.newPassword}
              />
              <FormInput
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••••"
                register={resetForm.register}
                error={resetForm.formState.errors.confirmPassword}
              />
              <AppButton type="submit" disabled={loading} className="w-full">
                {loading ? "Resetting..." : "Reset Password"}
              </AppButton>
              <p className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => { setStep("request"); setErrorMsg(""); setSuccessMsg(""); }}
                  className="text-indigo-600 hover:underline"
                >
                  Use a different email
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPasswordPage;
