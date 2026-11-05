import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OnboardingClient } from "./onboarding-client";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth();

  // If unauthenticated, redirect to login
  if (!session?.user?.id) {
    redirect("/login");
  }

  // If user already has chosen a username in session, send straight to dashboard
  if (session.user.username) {
    redirect("/dashboard");
  }

  // Check DB directly in case user has already completed onboarding
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, name: true, email: true },
  });

  if (dbUser?.username) {
    redirect("/dashboard");
  }

  return (
    <OnboardingClient
      user={{
        ...session.user,
        name: dbUser?.name || session.user.name,
        email: dbUser?.email || session.user.email,
      }}
    />
  );
}
