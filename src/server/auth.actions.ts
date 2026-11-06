"use server";

import { signIn, auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeRedirectUrl, usernameSchema, sanitizeUsername } from "@/lib/validations/auth.schema";
import { verifyTelegramAuth } from "@/lib/telegram-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function signInOAuthAction(provider: "google" | "github", rawRedirectTo?: string) {
  const safeRedirect = sanitizeRedirectUrl(rawRedirectTo);
  await signIn(provider, { redirectTo: safeRedirect });
}

export async function completeOnboardingAction(rawUsername: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please sign in first." };
    }

    // Rate limit onboarding attempts per user
    const rl = checkRateLimit(`onboarding:${session.user.id}`, 10, 60000);
    if (!rl.success) {
      return { success: false, error: "Too many attempts. Please wait a minute." };
    }

    const clean = sanitizeUsername(rawUsername);
    const parsed = usernameSchema.safeParse(clean);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid username." };
    }

    const username = parsed.data;

    // Uniqueness check
    const existing = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existing && existing.id !== session.user.id) {
      return { success: false, error: "This username is already taken. Please choose another." };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { username },
    });

    return { success: true, username };
  } catch (error: any) {
    console.error("[completeOnboardingAction] Error:", error);
    return { success: false, error: error?.message || "Failed to save username. Please try again." };
  }
}

export async function unlinkProviderAction(provider: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const userId = session.user.id;

  // Check how many linked authentication methods the user has
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { id: true, provider: true },
  });

  // Guard: User must maintain at least one sign-in method
  if (accounts.length <= 1) {
    return {
      success: false,
      error: "Cannot disconnect the only sign-in method on your account.",
    };
  }

  const targetAccount = accounts.find((a) => a.provider === provider);
  if (!targetAccount) {
    return { success: false, error: `No linked ${provider} account found.` };
  }

  await prisma.account.delete({
    where: { id: targetAccount.id },
  });

  return { success: true };
}

export async function linkTelegramAccountAction(payload: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in first." };
  }

  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  // Rate limit linking per IP
  const rl = checkRateLimit(`link-telegram:${ip}`, 5, 60000);
  if (!rl.success) {
    return { success: false, error: "Too many linking attempts. Please wait." };
  }

  const result = verifyTelegramAuth(payload);
  if (!result.valid || !result.data) {
    return { success: false, error: result.error || "Telegram verification failed." };
  }

  const providerAccountId = String(result.data.id);

  // Check if this Telegram ID is already linked to another user
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "telegram",
        providerAccountId,
      },
    },
  });

  if (existingAccount) {
    if (existingAccount.userId === session.user.id) {
      return { success: true, message: "Telegram account is already linked." };
    }
    return {
      success: false,
      error: "This Telegram account is already linked to another WriteupHub user.",
    };
  }

  await prisma.account.create({
    data: {
      userId: session.user.id,
      type: "credentials",
      provider: "telegram",
      providerAccountId,
    },
  });

  return { success: true };
}

export async function deleteAccountAction(confirmUsername: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true },
  });

  if (!user) {
    return { success: false, error: "User not found." };
  }

  const expectedHandle = user.username || "DELETE";
  if (confirmUsername.trim() !== expectedHandle) {
    return {
      success: false,
      error: `Handle confirmation mismatch. Please type '${expectedHandle}' to confirm deletion.`,
    };
  }

  // Deleting user cascades to accounts, writeups, bookmarks, and sessions per schema
  await prisma.user.delete({
    where: { id: user.id },
  });

  return { success: true };
}

export async function loadMoreUserWriteupsAction(
  username: string,
  cursor: string,
  limit = 12
) {
  const { getUserProfile } = await import("@/server/auth.service");
  const profile = await getUserProfile(username, { limit, cursor });
  if (!profile) {
    return { writeups: [], nextCursor: null };
  }
  return {
    writeups: profile.writeups,
    nextCursor: profile.nextCursor,
  };
}
