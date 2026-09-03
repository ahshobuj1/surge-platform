"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Upload, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api";
import { User } from "@/lib/types";

// ── Schema ───────────────────────────────────────────────────────────────────
const formSchema = z
  .object({
    fullName:        z.string().min(1, "Full name is required"),
    email:           z.string().email(),
    phoneNumber:     z.string().optional(),
    companyName:     z.string().optional(),
    mailingAddress:  z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword:     z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (d) => !d.newPassword || d.newPassword === d.confirmPassword,
    { message: "Passwords do not match", path: ["confirmPassword"] }
  );

type FormValues = z.infer<typeof formSchema>;

// ── Password input ────────────────────────────────────────────────────────────
function PasswordInput({
  field,
  placeholder = "••••••••",
}: {
  field: React.InputHTMLAttributes<HTMLInputElement> & { value?: string };
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        {...field}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="h-11 rounded-xl border border-slate-200 bg-white pr-10 text-base text-foreground shadow-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-0"
      />
      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const [avatar, setAvatar]   = useState<string | null>(null);
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef          = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName:        "",
      email:           "",
      phoneNumber:     "",
      companyName:     "",
      mailingAddress:  "",
      currentPassword: "",
      newPassword:     "",
      confirmPassword: "",
    },
  });

  // Load user profile data from GET /users/me
  useEffect(() => {
    if (user) {
      form.setValue("fullName", user.fullName || user.name || "");
      form.setValue("email", user.email || "");
      form.setValue("phoneNumber", user.phoneNumber || "");
      if (user.avatarKey) {
        setAvatar(user.avatarKey);
      }
    }
  }, [user, form]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setErrorMsg("");
    try {
      // PATCH /users/me — UpdateCurrentUserDto accepts { fullName, phoneNumber, avatarKey }
      await api.patch("/users/me", {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber || undefined,
      });

      // Refresh user context so header updates
      await refreshUser();

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save profile changes.");
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file: File, maxWidth = 400, maxHeight = 400, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File size must be under 10MB.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // Compress avatar image to 400x400 max resolution
      const compressedDataUrl = await compressImage(file, 400, 400, 0.85);
      setAvatar(compressedDataUrl);

      let finalAvatarKey = compressedDataUrl;
      try {
        const presigned = await api.post<{ uploadUrl: string; objectName: string }>(
          "/storage/presigned-upload",
          { fileName: file.name, contentType: file.type }
        );

        if (presigned?.uploadUrl) {
          await fetch(presigned.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (presigned.objectName) {
            finalAvatarKey = presigned.objectName;
          }
        }
      } catch (storageErr) {
        console.warn("Presigned upload skipped, saving compressed image directly:", storageErr);
      }

      // Always update user avatar key via PATCH /users/me
      await api.patch("/users/me", { avatarKey: finalAvatarKey });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile picture.");
    } finally {
      setLoading(false);
    }
  };

  const displayName = user?.fullName || user?.name || form.watch("fullName") || "User";
  const displayEmail = user?.email || form.watch("email") || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-auto">
      <div className="">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

            {/* ── Profile Card ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">

              {errorMsg && (
                <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                  {errorMsg}
                </div>
              )}

              {/* Avatar row */}
              <div className="flex items-center gap-5 mb-8">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-100">
                  {avatar ? (
                    <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Name + email + upload */}
                <div className="flex flex-col gap-1">
                  <p className="text-2xl font-bold text-foreground">
                    {displayName}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {displayEmail}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-muted-foreground border border-slate-200 px-4 cursor-pointer py-2 hover:bg-slate-50 transition-colors w-fit"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>

              {/* ── Personal Information ── */}
              <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
                <p className="text-base text-muted-foreground">Manage your personal and account information.</p>
              </div>

              <div className="flex flex-col gap-5">
                {/* Full Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1 space-y-0">
                        <FormLabel className="text-sm font-semibold text-muted-foreground">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11 rounded-xl border border-slate-200 bg-white text-base text-foreground shadow-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-0"
                          />
                        </FormControl>
                        <FormMessage className="text-sm text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1 space-y-0">
                        <FormLabel className="text-sm font-semibold text-muted-foreground">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled
                            className="h-11 rounded-xl border border-slate-200 bg-slate-50 text-base text-muted-foreground shadow-none cursor-not-allowed"
                          />
                        </FormControl>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                          <Lock className="w-3 h-3" />
                          Email cannot be changed
                        </p>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Phone + Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1 space-y-0">
                        <FormLabel className="text-sm font-semibold text-muted-foreground">
                          Phone Number{" "}
                          <span className="font-normal text-muted-foreground">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="+1 (555) 000-0000"
                            className="h-11 rounded-xl border border-slate-200 bg-white text-base text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-0"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1 space-y-0">
                        <FormLabel className="text-sm font-semibold text-muted-foreground">
                          Company Name{" "}
                          <span className="font-normal text-muted-foreground">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Acme Corp"
                            className="h-11 rounded-xl border border-slate-200 bg-white text-base text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-0"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Mailing Address */}
                <FormField
                  control={form.control}
                  name="mailingAddress"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1 space-y-0">
                      <FormLabel className="text-sm font-semibold text-muted-foreground">
                        Mailing Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="123 Main St, Suite 100, City, State, ZIP"
                          className="h-11 rounded-xl border border-slate-200 bg-white text-base text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-0"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* ── Divider ── */}
              <div className="border-t border-slate-100 my-8" />

              {/* ── Change Password ── */}
              <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-xl font-bold text-foreground">Change Password</h2>
                <p className="text-base text-muted-foreground">Update your password to keep your account secure.</p>
              </div>

              <div className="flex flex-col gap-5">
                {/* Current Password */}
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1 space-y-0 max-w-sm">
                      <FormLabel className="text-sm font-semibold text-muted-foreground">
                        Current Password
                      </FormLabel>
                      <FormControl>
                        <PasswordInput field={field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-400" />
                    </FormItem>
                  )}
                />

                {/* New + Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1 space-y-0">
                        <FormLabel className="text-sm font-semibold text-muted-foreground">
                          New Password
                        </FormLabel>
                        <FormControl>
                          <PasswordInput field={field} />
                        </FormControl>
                        <FormMessage className="text-sm text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1 space-y-0">
                        <FormLabel className="text-sm font-semibold text-muted-foreground">
                          Confirm New Password
                        </FormLabel>
                        <FormControl>
                          <PasswordInput field={field} />
                        </FormControl>
                        <FormMessage className="text-sm text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
                {/* Success message */}
                <div
                  className={cn(
                    "flex items-center gap-2 transition-all duration-300",
                    saved ? "opacity-100" : "opacity-0"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-base font-semibold text-emerald-600">
                    Profile updated successfully
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 sm:ml-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => form.reset()}
                    className="h-11 px-5 rounded-xl text-base font-semibold text-muted-foreground hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-base font-semibold shadow-md transition-all disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}

export default ProfileSettings;