"use client";

import { useState } from "react";
import AppButton from "@/app/component/shared/AppButton";
import FormInput from "@/app/component/shared/FormInput";
import ZerodraftLogo from "@/app/component/shared/ZeroDraftLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/context/AuthContext";

type FormValues = {
  email: string;
  password: string;
};

function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await login(data.email, data.password);
      if (!res.isVerified) {
        // User email not yet verified — redirect to OTP
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-slate-50/50">
      <ZerodraftLogo />

      <Card className="w-full max-w-md border border-slate-200 bg-white shadow-xl rounded-2xl">
        <CardHeader className="pb-4 pt-8">
          <CardTitle className="text-center text-2xl font-bold text-slate-900">
            Log in to Zerodraft
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {errorMsg && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormInput
              label="Email"
              name="email"
              type="email"
              placeholder="youremail@gmail.com"
              register={register}
              error={errors.email}
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••••"
              register={register}
              error={errors.password}
            />

            <div className="flex items-center justify-between text-sm">
              <Link href="/signup" className="text-indigo-600 hover:underline">
                Don't have an account? Sign up
              </Link>
              <Link href="/forgot-password" className="text-indigo-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <AppButton type="submit" disabled={loading} className="w-full">
              {loading ? "Logging in..." : "Log in"}
            </AppButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
