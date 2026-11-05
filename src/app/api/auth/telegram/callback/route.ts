import { NextRequest, NextResponse } from "next/server";
import { verifyTelegramAuth } from "@/lib/telegram-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const entries: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    entries[key] = value;
  });

  const result = verifyTelegramAuth(entries);
  if (!result.valid || !result.data) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "TelegramAuthError");
    return NextResponse.redirect(loginUrl);
  }

  // Verification passed; redirect back to login where client will complete signIn with validated payload
  // Or store temporary cookie for signIn completion
  const tg = result.data;
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("tg_auth", "verified");
  loginUrl.searchParams.set("tg_id", String(tg.id));

  return NextResponse.redirect(loginUrl);
}
