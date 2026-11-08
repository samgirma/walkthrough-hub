import React, { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginContent } from "./login-content";
import { getEnabledProviders } from "@/env";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Login",
  description: "Sign in to your WriteupHub account to publish CTF walkthroughs and security research.",
  canonicalPath: "/login",
  noindex: true,
  nofollow: false,
});

export default function LoginPage() {
  const enabledProviders = getEnabledProviders();

  return (
    <AuthShell>
      <Suspense fallback={<div className="h-[300px] w-full animate-pulse bg-white/[0.02] rounded-xl" />}>
        <LoginContent enabledProviders={enabledProviders} />
      </Suspense>
    </AuthShell>
  );
}
