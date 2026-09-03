"use client";

import { useState } from "react";
import AppButton from "@/app/component/shared/AppButton";
import FormInput from "@/app/component/shared/FormInput";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/context/AuthContext";
import { ApiError } from "@/lib/api";

type FormValues = {
  email: string;
  password: string;
};

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await login(data.email, data.password);
      if (!res.isVerified) {
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.isVerified === false) {
          router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
          return;
        }

        // Map backend field errors to form fields
        if (err.data && typeof err.data === "object" && "errors" in err.data) {
          const backendErrors = (
            err.data as { errors?: Array<{ field?: string; message: string }> }
          ).errors;
          if (Array.isArray(backendErrors)) {
            backendErrors.forEach((e) => {
              if (e.field === "email" || e.field === "password") {
                setError(e.field as keyof FormValues, {
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
        setErrorMsg("Failed to log in. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-[28px] border border-white/80 p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(79,90,140,0.18)]">
      <h1 className="text-center text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-6">
        Log In
      </h1>

      {errorMsg && (
        <div className="mb-4 p-3 text-xs sm:text-sm text-red-600 bg-red-50 rounded-2xl border border-red-200 text-center animate-in fade-in duration-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput<FormValues>
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          disabled={loading}
          register={register}
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Please provide a valid email address",
            },
          }}
          error={errors.email}
        />

        <FormInput<FormValues>
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          disabled={loading}
          register={register}
          rules={{
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          }}
          error={errors.password}
          rightLabel={
            <Link
              href="/forgot-password"
              className="text-xs text-[#4F62E8] font-medium hover:underline"
            >
              Forgot password?
            </Link>
          }
        />

        <div className="pt-2">
          <AppButton
            type="submit"
            disabled={loading || !isValid}
            className="w-full"
          >
            {loading ? "Logging in..." : "Log In"}
          </AppButton>
        </div>

        <p className="text-center text-xs text-slate-500 pt-2">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-[#4F62E8] font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
