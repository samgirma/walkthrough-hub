import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleBookmark, isBookmarked } from "@/server/bookmark.service";
import { z } from "zod";

const bookmarkRequestSchema = z.object({
  writeupId: z.string().cuid(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ bookmarked: false });
  }

  const { searchParams } = new URL(req.url);
  const writeupId = searchParams.get("writeupId");
  if (!writeupId) {
    return NextResponse.json({ error: "Missing writeupId" }, { status: 400 });
  }

  try {
    const bookmarked = await isBookmarked(session.user.id, writeupId);
    return NextResponse.json({ bookmarked });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to check bookmark status" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { writeupId } = bookmarkRequestSchema.parse(body);

    const result = await toggleBookmark(session.user.id, writeupId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to toggle bookmark" },
      { status: 400 }
    );
  }
}
