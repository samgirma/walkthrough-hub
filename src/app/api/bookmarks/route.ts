import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleBookmark } from "@/server/bookmark.service";
import { z } from "zod";

const bookmarkRequestSchema = z.object({
  writeupId: z.string().cuid(),
});

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
