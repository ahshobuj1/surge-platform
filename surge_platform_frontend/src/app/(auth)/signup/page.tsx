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
  name: string;
  email: string;
  password: string;
};

export default function Signup() {
  const { signup } = useAuth();
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
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await signup(data.email, data.password, data.name);
      const params = new URLSearchParams({ email: data.email });
      if (res.otp) {
        params.set("otp", res.otp);
      }
      router.push(`/verify-otp?${params.toString()}`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        // Map backend field errors to form inputs
        if (err.data && typeof err.data === "object" && "errors" in err.data) {
          const backendErrors = (
            err.data as { errors?: Array<{ field?: string; message: string }> }
          ).errors;
          if (Array.isArray(backendErrors)) {
            backendErrors.forEach((e) => {
              if (e.field === "email" || e.field === "password" || e.field === "name" || e.field === "fullName") {
                const targetField = (e.field === "fullName" ? "name" : e.field) as keyof FormValues;
                setError(targetField, {
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
        setErrorMsg("Registration failed. Please check your information and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-[28px] border border-white/80 p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(79,90,140,0.18)]">
      <h1 className="text-center text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-6">
        Sign Up
      </h1>

      {errorMsg && (
        <div className="mb-4 p-3 text-xs sm:text-sm text-red-600 bg-red-50 rounded-2xl border border-red-200 text-center animate-in fade-in duration-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput<FormValues>
          label="Name"
          name="name"
          type="text"
          placeholder="Enter your name"
          disabled={loading}
          register={register}
          rules={{
            required: "Name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
          }}
          error={errors.name}
        />

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
        />

        <div className="pt-2">
          <AppButton
            type="submit"
            disabled={loading || !isValid}
            className="w-full"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </AppButton>
        </div>

        <p className="text-center text-xs sm:text-[13px] text-slate-500 pt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-[#4F62E8] font-semibold hover:underline">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}
