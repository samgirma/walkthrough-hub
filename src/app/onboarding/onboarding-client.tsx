"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AuthShell } from "@/components/auth/AuthShell";
import { completeOnboardingAction } from "@/server/auth.actions";
import { sanitizeUsername } from "@/lib/validations/auth.schema";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

interface OnboardingClientProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    username?: string | null;
  };
}

export function OnboardingClient({ user }: OnboardingClientProps) {
  const router = useRouter();
  const { update } = useSession();

  const [username, setUsername] = useState(() => {
    if (user.username) {
      return sanitizeUsername(user.username);
    }
    if (user.email) {
      return sanitizeUsername(user.email.split("@")[0]);
    }
    if (user.name) {
      return sanitizeUsername(user.name);
    }
    return "";
  });
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced username availability checker
  useEffect(() => {
    const clean = sanitizeUsername(username);
    if (!clean || clean.length < 3) {
      setAvailable(null);
      setStatusMessage(clean.length > 0 ? "Must be at least 3 characters" : null);
      return;
    }

    setChecking(true);
    setStatusMessage(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(clean)}`);
        const data = await res.json();
        setAvailable(data.available);
        setStatusMessage(data.available ? "Callsign available" : data.reason || "Username taken");
      } catch {
        setAvailable(null);
        setStatusMessage("Could not verify username availability.");
      } finally {
        setChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!available || isSubmitting) return;

    setIsSubmitting(true);
    const clean = sanitizeUsername(username);

    try {
      const res = await completeOnboardingAction(clean);
      if (res.success) {
        try {
          await update();
        } catch {
          // Continue to redirect even if client session update triggers after navigation
        }
        window.location.href = "/dashboard";
      } else {
        setAvailable(false);
        setStatusMessage(res.error || "Failed to set username.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setStatusMessage(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <AuthShell>
      {/* Header Block */}
      <div className="flex flex-col gap-3 md:gap-3.5">
        <Link href="/" aria-label="WriteupHub home" className="inline-block w-fit">
          <Image
            src="/brand/logo/logo-icon.svg"
            alt="WriteupHub"
            width={48}
            height={48}
            priority
            unoptimized
            className="w-[44px] h-[44px] md:w-[48px] md:h-[48px] hover:brightness-110 transition-all"
          />
        </Link>

        {/* Terminal Line */}
        <div className="font-mono text-[13px] text-[#22D3A0] tracking-tight flex items-center">
          <span>$ init --identity</span>
          <span className="animate-cursor-blink font-bold">_</span>
        </div>

        {/* Heading */}
        <h1 className="font-extrabold text-[32px] md:text-[36px] tracking-[-0.03em] text-[#F3F6FB] leading-[1.05] m-0">
          Claim callsign.
        </h1>

        <p className="text-[15px] text-[#9AA3B5] m-0 font-normal">
          Choose your unique author identity on WriteupHub.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-xs font-mono text-[#BACAC1] font-semibold">
            Username / Handle
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-[#475569] select-none">
              @
            </span>
            <input
              id="username"
              type="text"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="0x_researcher"
              maxLength={24}
              className={`w-full h-[52px] pl-8 pr-10 rounded-[12px] border bg-white/[0.04] text-[#E8ECF4] text-[15px] font-mono placeholder:text-[#475569] transition-all focus:outline-none ${
                available === true
                  ? "border-emerald-500/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  : available === false
                  ? "border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                  : "border-[#2B3142] focus:border-[#22D3A0] focus:ring-1 focus:ring-[#22D3A0]"
              }`}
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
              {checking && <Loader2 className="w-4 h-4 text-[#22D3A0] animate-spin" />}
              {!checking && available === true && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              {!checking && available === false && (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
            </div>
          </div>

          {/* Validation Feedback Message */}
          {statusMessage && (
            <p
              className={`text-xs font-mono mt-1 ${
                available === true
                  ? "text-emerald-400"
                  : available === false
                  ? "text-rose-400"
                  : "text-[#94A3B8]"
              }`}
            >
              {statusMessage}
            </p>
          )}

          <p className="text-[11px] text-[#475569] font-mono mt-1">
            3-24 characters. Letters, numbers, underscores, and hyphens.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!available || isSubmitting}
          className="h-[52px] w-full flex items-center justify-center gap-2 rounded-[12px] border border-transparent bg-gradient-to-r from-[#22D3A0] via-[#50F0BB] to-[#38BDF8] text-[#0B0D12] text-[15px] font-bold shadow-[0_0_20px_rgba(34,211,160,0.25)] hover:shadow-[0_0_25px_rgba(34,211,160,0.4)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#0B0D12]" />
          ) : (
            <>
              <span>Continue to Vault</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
