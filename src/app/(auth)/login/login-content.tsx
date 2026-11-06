"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ProviderButton } from "@/components/auth/ProviderButton";
import { GoogleIcon, GithubIcon } from "@/components/auth/BrandIcons";
import { sanitizeRedirectUrl } from "@/lib/validations/auth.schema";
import { AlertCircle, Terminal, ArrowLeft } from "lucide-react";
import type { AuthProviderName } from "@/env";

const TelegramAuthButton = dynamic(
  () =>
    import("@/components/auth/TelegramAuthButton").then(
      (mod) => mod.TelegramAuthButton
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-11 w-full rounded-xl bg-[#141822] animate-pulse border border-white/5" />
    ),
  }
);

interface LoginContentProps {
  enabledProviders: Record<AuthProviderName, boolean>;
}

export function LoginContent({ enabledProviders }: LoginContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl = sanitizeRedirectUrl(rawCallback);
  const errorParam = searchParams.get("error");

  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Map known NextAuth error codes to clear, friendly user messages
  useEffect(() => {
    if (errorParam) {
      switch (errorParam) {
        case "OAuthAccountNotLinked":
          setErrorMessage(
            "That email is already registered with another sign-in method. Please sign in with your original method, then connect this provider in Settings."
          );
          break;
        case "AccessDenied":
          setErrorMessage("Access was denied. Please grant the required permissions to continue.");
          break;
        case "Configuration":
          setErrorMessage("Authentication service misconfigured. Contact support.");
          break;
        case "Verification":
          setErrorMessage("Verification token has expired or is invalid. Please try again.");
          break;
        case "OAuthCallbackError":
        case "Callback":
          setErrorMessage("An error occurred during authentication with the provider. Please try again.");
          break;
        case "OAuthSignin":
          setErrorMessage("Unable to initiate sign in with this provider. Please try again.");
          break;
        case "CredentialsSignin":
          setErrorMessage("Telegram verification failed or signature expired. Please try again.");
          break;
        case "SessionRequired":
          setErrorMessage("Please sign in to access this page.");
          break;
        default:
          setErrorMessage("Sign-in failed. Please select your provider to try again.");
      }
    }
  }, [errorParam]);

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setErrorMessage(null);
    setLoadingProvider(provider);

    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setLoadingProvider(null);
      setErrorMessage("Could not reach authentication service. Please try again.");
    }
  };

  const handleTelegramSuccess = async (telegramUser: Record<string, unknown>) => {
    setLoadingProvider("telegram");
    setErrorMessage(null);

    try {
      const res = await signIn("telegram", {
        ...telegramUser,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setErrorMessage(res.error || "Telegram verification failed.");
        setLoadingProvider(null);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setLoadingProvider(null);
      setErrorMessage(err.message || "An unexpected error occurred during Telegram sign-in.");
    }
  };

  const handleDevSignIn = async () => {
    setLoadingProvider("dev");
    setErrorMessage(null);

    try {
      const res = await signIn("dev", {
        username: "0xNullPtr",
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setErrorMessage(res.error || "Dev login failed.");
        setLoadingProvider(null);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setLoadingProvider(null);
      setErrorMessage(err.message || "Dev login failed.");
    }
  };

  return (
    <>
      {/* Return to Public Page - Subtle low-noise link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8A93A6] hover:text-[#E0E2EC] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#5A6478] group-hover:text-[#22D3A0] group-hover:-translate-x-0.5 transition-all" />
          <span>Back to public page</span>
        </Link>
      </div>

      {/* 1. Brand Logo Icon & Header Block */}
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

        {/* 2. Terminal Prompt "$ whoami_" */}
        <div className="font-mono text-[13px] text-[#22D3A0] tracking-tight flex items-center">
          <span>$ whoami</span>
          <span className="animate-cursor-blink font-bold">_</span>
        </div>

        {/* 3. Heading "Get in." */}
        <h1 className="font-extrabold text-[36px] md:text-[40px] tracking-[-0.03em] text-[#F3F6FB] leading-[1.05] m-0">
          Get in.
        </h1>

        {/* 4. Subline */}
        <p className="text-[15px] text-[#9AA3B5] m-0 font-normal">
          Sign in or create an account.
        </p>
      </div>

      {/* Accessible Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 5. Provider Buttons: Google, GitHub, Telegram */}
      <div className="flex flex-col gap-3">
        {/* Continue with Google */}
        {enabledProviders.google && (
          <ProviderButton
            icon={<GoogleIcon size={20} />}
            label="Continue with Google"
            isLoading={loadingProvider === "google"}
            disabled={!!loadingProvider}
            onClick={() => handleOAuthSignIn("google")}
          />
        )}

        {/* Continue with GitHub */}
        {enabledProviders.github && (
          <ProviderButton
            icon={<GithubIcon size={20} />}
            label="Continue with GitHub"
            isLoading={loadingProvider === "github"}
            disabled={!!loadingProvider}
            onClick={() => handleOAuthSignIn("github")}
          />
        )}

        {/* Continue with Telegram */}
        {enabledProviders.telegram && (
          <TelegramAuthButton
            onSuccess={handleTelegramSuccess}
            onError={(err) => setErrorMessage(err)}
            disabled={!!loadingProvider}
          />
        )}

        {/* Dev-Only Login (strictly in dev mode when DEV_LOGIN=true) */}
        {enabledProviders.dev && (
          <button
            type="button"
            onClick={handleDevSignIn}
            disabled={!!loadingProvider}
            className="w-full h-[52px] rounded-[12px] border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Terminal className="w-4 h-4" />
            <span>Dev Bypass (Sign in as @0xNullPtr)</span>
          </button>
        )}
      </div>

      {/* 6. Footer Terms & Privacy Notice */}
      <p className="text-[12px] leading-relaxed text-[#8A93A6] m-0 text-center md:text-left">
        By continuing you agree to the{" "}
        <Link
          href="/terms"
          className="text-[#E8ECF4] underline underline-offset-[3px] hover:text-[#22D3A0] transition-colors"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="text-[#E8ECF4] underline underline-offset-[3px] hover:text-[#22D3A0] transition-colors"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
}
