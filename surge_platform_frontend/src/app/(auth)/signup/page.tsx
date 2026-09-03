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
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function Signup() {
  const { signup } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    if (data.password !== data.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      await signup(data.email, data.password, data.name);
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Please try again.");
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
            Create an Account
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {errorMsg && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              label="Full Name"
              name="name"
              type="text"
              placeholder="John Doe"
              register={register}
              error={errors.name}
            />

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

            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••••"
              register={register}
              error={errors.confirmPassword}
            />

            <div className="flex justify-end text-sm pt-1">
              <Link href="/login" className="text-indigo-600 hover:underline">
                Already have an account? Log in
              </Link>
            </div>

            <AppButton type="submit" disabled={loading} className="w-full">
              {loading ? "Creating account..." : "Sign Up"}
            </AppButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Signup;
