import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usernameSchema, sanitizeUsername } from "@/lib/validations/auth.schema";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("username") || "";
  const cleaned = sanitizeUsername(raw);

  const session = await auth();
  const currentUserId = session?.user?.id;

  const parsed = usernameSchema.safeParse(cleaned);
  if (!parsed.success) {
    return NextResponse.json({
      available: false,
      reason: parsed.error.errors[0]?.message || "Invalid username format.",
    });
  }

  const existing = await prisma.user.findUnique({
    where: { username: cleaned },
    select: { id: true },
  });

  if (existing && existing.id !== currentUserId) {
    return NextResponse.json({
      available: false,
      reason: "This username is already taken.",
    });
  }

  return NextResponse.json({
    available: true,
    username: cleaned,
  });
}
