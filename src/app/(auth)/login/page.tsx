import React, { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginContent } from "./login-content";
import { getEnabledProviders } from "@/env";

export const dynamic = "force-dynamic";

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
