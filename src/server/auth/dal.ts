import { cache } from "react";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { User, Role } from "@prisma/client";
import { sanitizeRedirectUrl } from "@/lib/validations/auth.schema";

/**
 * Request-scoped cached session retrieval.
 * Deduplicates multiple calls to auth() within a single React server render.
 */
export const getSession = cache(async () => {
  return await auth();
});

/**
 * Request-scoped fresh database read of the currently authenticated user.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return user;
});

/**
 * Requires an authenticated user session.
 * If unauthenticated, safely redirects to /login with callbackUrl.
 */
export async function requireUser(rawCallbackUrl?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    const callback = sanitizeRedirectUrl(rawCallbackUrl || "/dashboard");
    redirect(`/login?callbackUrl=${encodeURIComponent(callback)}`);
  }
  return user;
}

/**
 * Requires an authenticated user who has completed onboarding (has a chosen username).
 * If authenticated but no username, redirects to /onboarding.
 */
export async function requireOnboarded(rawCallbackUrl?: string): Promise<User & { username: string }> {
  const user = await requireUser(rawCallbackUrl);
  if (!user.username || user.username.trim().length === 0) {
    redirect("/onboarding");
  }
  return user as User & { username: string };
}

/**
 * Requires an authenticated user with a specific role (e.g. "ADMIN").
 * If role is insufficient and redirectTo is provided, redirects to that path;
 * otherwise throws an unauthorized error.
 */
export async function requireRole(role: Role, redirectTo?: string): Promise<User> {
  const user = await requireUser();
  if (user.role !== role && user.role !== "ADMIN") {
    if (redirectTo) {
      redirect(redirectTo);
    }
    throw new Error("Forbidden: Insufficient privileges.");
  }
  return user;
}

/**
 * Verifies that the authenticated user is the legitimate author of a writeup.
 * Throws notFound() for non-owners instead of leaking the writeup's existence.
 */
export async function requireWriteupOwner(writeupId: string) {
  const user = await requireUser();

  const writeup = await prisma.writeup.findUnique({
    where: { id: writeupId },
    select: {
      id: true,
      authorId: true,
      title: true,
      slug: true,
      status: true,
    },
  });

  if (!writeup || writeup.authorId !== user.id) {
    notFound();
  }

  return { user, writeup };
}
