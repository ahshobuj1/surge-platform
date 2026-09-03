"use client";

import { useState } from "react";
import AppButton from "@/app/component/shared/AppButton";
import FormInput from "@/app/component/shared/FormInput";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { api, ApiError } from "@/lib/api";

type RequestResetFormValues = {
  email: string;
};

type ResetPasswordFormValues = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const requestForm = useForm<RequestResetFormValues>({
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordFormValues>({
    mode: "onChange",
    defaultValues: {
      token: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleRequestReset = async (data: RequestResetFormValues) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.post("/auth/request-password-reset", { email: data.email });
      setEmail(data.email);
      setSuccessMsg("A password reset code has been sent to your email.");
      setStep("reset");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.data && typeof err.data === "object" && "errors" in err.data) {
          const backendErrors = (
            err.data as { errors?: Array<{ field?: string; message: string }> }
          ).errors;
          if (Array.isArray(backendErrors)) {
            backendErrors.forEach((e) => {
              if (e.field === "email") {
                requestForm.setError("email", {
                  type: "server",
                  message: e.message,
                });
              }
            });
          }
        }
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to send reset code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormValues) => {
    if (data.newPassword !== data.confirmPassword) {
      resetForm.setError("confirmPassword", {
        type: "validate",
        message: "Passwords do not match",
      });
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.post("/auth/reset-password", {
        token: data.token.trim(),
        newPassword: data.newPassword,
      });
      setSuccessMsg("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.data && typeof err.data === "object" && "errors" in err.data) {
          const backendErrors = (
            err.data as { errors?: Array<{ field?: string; message: string }> }
          ).errors;
          if (Array.isArray(backendErrors)) {
            backendErrors.forEach((e) => {
              if (e.field === "token" || e.field === "newPassword") {
                resetForm.setError(e.field as keyof ResetPasswordFormValues, {
                  type: "server",
                  message: e.message,
                });
              }
            });
          }
        }
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to reset password. Please check your reset code.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-[28px] border border-white/80 p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(79,90,140,0.18)]">
      <h1 className="text-center text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
        {step === "request" ? "Forgot Password" : "Reset Password"}
      </h1>

      <p className="text-center text-xs sm:text-[13px] text-slate-500 mb-6 leading-relaxed">
        {step === "request"
          ? "Enter your email address to receive a password reset code."
          : `Enter the code sent to ${email}`}
      </p>

      {errorMsg && (
        <div className="mb-4 p-3 text-xs sm:text-sm text-red-600 bg-red-50 rounded-2xl border border-red-200 text-center animate-in fade-in duration-200">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 text-xs sm:text-sm text-emerald-600 bg-emerald-50 rounded-2xl border border-emerald-200 text-center animate-in fade-in duration-200">
          {successMsg}
        </div>
      )}

      {step === "request" ? (
        <form onSubmit={requestForm.handleSubmit(handleRequestReset)} className="space-y-4">
          <FormInput<RequestResetFormValues>
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            disabled={loading}
            register={requestForm.register}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please provide a valid email address",
              },
            }}
            error={requestForm.formState.errors.email}
          />

          <div className="pt-2">
            <AppButton
              type="submit"
              disabled={loading || !requestForm.formState.isValid}
              className="w-full"
            >
              {loading ? "Sending code..." : "Continue"}
            </AppButton>
          </div>

          <p className="text-center text-xs sm:text-[13px] text-slate-500 pt-2">
            Remember your password?{" "}
            <Link href="/login" className="text-[#4F62E8] font-semibold hover:underline">
              Back to Log In
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
          <FormInput<ResetPasswordFormValues>
            label="Reset Code"
            name="token"
            type="text"
            placeholder="Enter 6-digit code"
            disabled={loading}
            register={resetForm.register}
            rules={{
              required: "Reset code is required",
              minLength: {
                value: 6,
                message: "Reset code must be exactly 6 digits",
              },
            }}
            error={resetForm.formState.errors.token}
          />

          <FormInput<ResetPasswordFormValues>
            label="New Password"
            name="newPassword"
            type="password"
            placeholder="••••••••"
            disabled={loading}
            register={resetForm.register}
            rules={{
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
            error={resetForm.formState.errors.newPassword}
          />

          <FormInput<ResetPasswordFormValues>
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            disabled={loading}
            register={resetForm.register}
            rules={{
              required: "Please confirm your password",
              validate: (val) =>
                val === resetForm.watch("newPassword") ||
                "Passwords do not match",
            }}
            error={resetForm.formState.errors.confirmPassword}
          />

          <div className="pt-2">
            <AppButton
              type="submit"
              disabled={loading || !resetForm.formState.isValid}
              className="w-full"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </AppButton>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep("request");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="text-[#4F62E8] font-semibold hover:underline"
            >
              Different email
            </button>
            <Link href="/login" className="text-[#4F62E8] font-semibold hover:underline">
              Back to Log In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
