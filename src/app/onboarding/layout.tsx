import React from "react";
import { SessionProvider } from "@/components/providers/session-provider";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
