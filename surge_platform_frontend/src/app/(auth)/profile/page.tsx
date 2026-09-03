"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";
import AppButton from "@/app/component/shared/AppButton";
import { useAuth } from "@/lib/context/AuthContext";
import { api, ApiError } from "@/lib/api";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [nameError, setNameError] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.name || "");
      if (user.avatarKey) {
        setAvatar(user.avatarKey);
      }
    }
  }, [user]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFullName(val);
    if (val.trim().length > 0 && val.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
    } else {
      setNameError("");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload an image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result as string);
      setErrorMsg("");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameError) return;

    setLoading(true);
    setErrorMsg("");

    try {
      if (avatar || fullName.trim()) {
        await api.patch("/users/me", {
          fullName: fullName.trim() || undefined,
          avatarKey: avatar || undefined,
        });
        await refreshUser();
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to update profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-[28px] border border-white/80 p-8 sm:p-9 shadow-[0_20px_50px_-15px_rgba(79,90,140,0.18)]">
      <h1 className="text-center text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Complete your profile
      </h1>

      <p className="text-center text-xs sm:text-[13px] text-slate-500 mb-6 leading-relaxed">
        Add your photo and name to personalize your workspace
      </p>

      {errorMsg && (
        <div className="mb-4 p-3 text-xs sm:text-sm text-red-600 bg-red-50 rounded-2xl border border-red-200 text-center animate-in fade-in duration-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar Upload Circle with soft ambient shadow */}
        <div className="flex flex-col items-center justify-center my-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-full bg-slate-50/70 border border-slate-200/80 shadow-[0_4px_16px_rgba(79,90,140,0.08)] hover:shadow-[0_6px_20px_rgba(79,90,140,0.14)] hover:border-[#4F62E8] flex items-center justify-center cursor-pointer overflow-hidden relative group transition-all"
            title="Upload profile photo"
          >
            {avatar ? (
              <>
                <img
                  src={avatar}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  title="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-[#4F62E8]/80 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 stroke-[1.8]" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>

        {/* Full Name Input */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-slate-700 ml-1 block">
            Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={handleNameChange}
            placeholder="Enter your name"
            disabled={loading}
            className={`h-11 w-full rounded-full bg-white border px-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-all focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
              nameError
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-200 focus:border-[#4F62E8] focus:ring-indigo-100"
            }`}
          />
          {nameError && (
            <p className="text-red-500 text-xs px-2 pt-0.5">{nameError}</p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <AppButton
            type="submit"
            disabled={loading || Boolean(nameError)}
            className="w-full"
          >
            {loading ? "Saving..." : "Continue"}
          </AppButton>
        </div>
      </form>
    </div>
  );
}