"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  UpdateProfileInput,
} from "@/lib/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  User,
  Mail,
  Github,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Upload,
  Calendar,
  Shield,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SettingsFormProps {
  user: {
    id: string;
    username: string;
    email: string;
    bio: string | null;
    avatarUrl: string | null;
    githubUrl: string | null;
    createdAt: Date;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      bio: user.bio || "",
      avatarUrl: user.avatarUrl || "",
      githubUrl: user.githubUrl || "",
    },
  });

  const avatarUrl = watch("avatarUrl");
  const bio = watch("bio") || "";

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload avatar image");
      }

      setValue("avatarUrl", data.url, { shouldDirty: true });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: UpdateProfileInput) => {
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccessMsg("Profile settings updated successfully!");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {successMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Public Profile</CardTitle>
              <CardDescription>
                This information will be displayed on your public author profile at{" "}
                <span className="font-mono text-primary text-xs">/u/{user.username}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Username (Read Only) */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={user.username}
                    readOnly
                    disabled
                    className="pl-9 bg-[#181C25]/50 border-[#242936] text-slate-400 cursor-not-allowed font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Username is permanent and used for your unique author URLs.
                </p>
              </div>

              {/* Email (Read Only) */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={user.email}
                    readOnly
                    disabled
                    className="pl-9 bg-[#181C25]/50 border-[#242936] text-slate-400 cursor-not-allowed font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Used for security notices and account verification.
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Author Bio
                  </label>
                  <span
                    className={`font-mono text-[11px] ${
                      bio.length > 280 ? "text-amber-400" : "text-slate-500"
                    }`}
                  >
                    {bio.length}/300
                  </span>
                </div>
                <Textarea
                  {...register("bio")}
                  placeholder="CTF player specializing in binary exploitation and web application vulnerabilities..."
                  rows={4}
                  className="bg-[#181C25] border-[#242936] focus:border-primary text-slate-200 resize-none text-sm"
                />
                {errors.bio && (
                  <p className="text-xs text-rose-400">{errors.bio.message}</p>
                )}
                <p className="text-[11px] text-slate-500">
                  Brief summary of your specialization, team, or CTF accomplishments.
                </p>
              </div>

              {/* Avatar URL & Upload */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Avatar Image
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      {...register("avatarUrl")}
                      placeholder="https://..."
                      className="pl-9 bg-[#181C25] border-[#242936] focus:border-primary text-slate-200 font-mono text-xs"
                    />
                  </div>
                  <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#181C25] hover:bg-[#202532] border border-[#242936] text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition-colors duration-150 whitespace-nowrap">
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-primary" />
                    )}
                    <span>{isUploading ? "Uploading..." : "Upload Local"}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                {errors.avatarUrl && (
                  <p className="text-xs text-rose-400">
                    {errors.avatarUrl.message}
                  </p>
                )}
                <p className="text-[11px] text-slate-500">
                  Supports PNG, JPEG, WebP, or GIF up to 5MB.
                </p>
              </div>

              {/* GitHub Profile URL */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  GitHub Profile URL
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    {...register("githubUrl")}
                    placeholder="https://github.com/username"
                    className="pl-9 bg-[#181C25] border-[#242936] focus:border-primary text-slate-200 font-mono text-xs"
                  />
                </div>
                {errors.githubUrl && (
                  <p className="text-xs text-rose-400">
                    {errors.githubUrl.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-4 border-t border-[#242936]">
              <Button
                type="submit"
                disabled={isSaving || !isDirty}
                className="bg-primary hover:bg-primary-hover text-[#0B0D12] font-semibold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Col: Persona Preview & Account Info */}
        <div className="space-y-6">
          {/* Live Persona Card Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-slate-400">
                Persona Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center p-6 pt-0">
              <div className="relative w-20 h-20 rounded-full border-2 border-primary/40 p-1 mb-4 bg-[#181C25]">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#202532] flex items-center justify-center text-slate-400 font-bold text-xl">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-white text-base">
                {user.username}
              </h3>
              <p className="font-mono text-xs text-primary mb-3">
                @{user.username}
              </p>
              <p className="text-xs text-slate-400 line-clamp-3 italic mb-4">
                {bio || "No bio added yet. Add a bio to tell the community about your CTF journey."}
              </p>
              {watch("githubUrl") && (
                <a
                  href={watch("githubUrl")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span className="font-mono">GitHub Profile</span>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Account Security & Metadata */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-slate-400">
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#242936]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Account Status
                </span>
                <span className="text-emerald-400 font-mono font-medium">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#242936]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Member Since
                </span>
                <span className="text-slate-300 font-mono">
                  {formatDate(user.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400 font-mono text-[11px]">
                  User ID
                </span>
                <span className="font-mono text-[10px] text-slate-500 truncate max-w-[150px]">
                  {user.id}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
