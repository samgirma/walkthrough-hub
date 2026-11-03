"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Terminal,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid email address or password. Please verify credentials.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#E0E2EC] flex flex-col justify-center items-center px-4 relative overflow-hidden py-12 selection:bg-[#22D3A0] selection:text-[#003828]">
      {/* Ambient Cybernetic Optical Flares */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(#181c25_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[360px] bg-[#22D3A0]/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 w-[380px] h-[280px] bg-[#38BDF8]/10 rounded-full blur-[100px]" />

      {/* Decorative Telemetry HUD */}
      <div className="hidden lg:flex flex-col gap-1 absolute left-8 top-12 font-mono text-[10px] text-[#475569] select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>CLUSTER: US-EAST-SEC01</span>
        </div>
        <span>TLS: TLS_AES_256_GCM_SHA384</span>
        <span>AUTH_PROTOCOL: FIDO2_WEBAUTHN_L3</span>
      </div>

      <div className="hidden lg:flex flex-col items-end gap-1 absolute right-8 top-12 font-mono text-[10px] text-[#475569] select-none">
        <span>SESSION_KEY: 0x7F9B...4CE1</span>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>ZERO_KNOWLEDGE_PROOF: READY</span>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-[440px] relative z-10 flex flex-col items-center">
        {/* Top Header Strip */}
        <div className="w-full flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(34,211,160,0.7)]" />
            <span className="font-mono text-[11px] uppercase text-[#94A3B8] tracking-wider">
              GATEWAY // AUTH_STAGE_01
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-primary bg-[#181C25] border border-[#242936] px-2 py-0.5 rounded">
            <Lock className="h-3 w-3" />
            <span>E2EE 4096-BIT</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="w-full bg-[#12151C] border border-[#242936] rounded-xl p-6 sm:p-8 shadow-2xl relative">
          {/* Top Neon Accent Bar */}
          <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#22D3A0] to-transparent opacity-80" />

          {/* Mode Switcher Segmented Tabs */}
          <div className="w-full bg-[#0B0D12] p-1 rounded-xl flex items-center mb-6 border border-[#242936]">
            <button
              type="button"
              className="flex-1 py-1.5 text-center rounded-lg font-mono text-xs font-semibold bg-[#181C25] text-primary shadow-sm"
            >
              Sign In
            </button>
            <Link
              href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="flex-1 py-1.5 text-center rounded-lg font-mono text-xs font-medium text-[#94A3B8] hover:text-white transition-colors"
            >
              Create Account
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="font-sans font-bold text-xl text-white tracking-tight mb-1 flex items-center gap-2">
              <span>Welcome back</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#181C25] border border-[#242936] text-primary">
                RESEARCHER
              </span>
            </h1>
            <p className="font-sans text-xs text-[#94A3B8]">
              Access your CTF writeups, telemetry feeds, and zero-day archives.
            </p>
          </div>

          {/* GitHub Auth Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl })}
              className="w-full bg-[#181C25] hover:bg-[#1D2027] border border-[#242936] text-white py-2.5 px-3 rounded-lg font-mono text-xs font-medium flex items-center justify-center gap-2 transition-all hover:border-[#363E52]"
            >
              <Github className="h-4 w-4 text-white" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center my-5">
            <div className="w-full h-px bg-[#242936]" />
            <span className="absolute bg-[#12151C] px-3 font-mono text-[10px] text-[#475569] tracking-wider uppercase">
              or continue with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="font-mono text-xs text-[#BACAC1] flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>Researcher Email</span>
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nullptr@writeuphub.sec"
                className="font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="font-mono text-xs text-[#BACAC1] flex items-center gap-1.5"
              >
                <KeyRound className="h-3.5 w-3.5 text-primary" />
                <span>Passphrase</span>
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="font-mono text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 gradient-cta text-[#0B0D12] font-semibold text-xs tracking-wide uppercase gap-2 shadow-[0_0_16px_rgba(34,211,160,0.3)]"
            >
              <span>{loading ? "Decrypting Session..." : "Authorize Access"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#242936]/60 text-center text-xs font-mono text-[#94A3B8]">
            <Link href="/" className="hover:text-white transition-colors">
              ← Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center text-slate-500 font-mono text-xs">
          Loading authentication interface...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
