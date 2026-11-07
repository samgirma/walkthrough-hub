import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCommentsForWriteup, createComment } from "@/server/comment.service";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000, "Comment cannot exceed 2000 characters"),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing writeup id" }, { status: 400 });
  }

  try {
    const data = await getCommentsForWriteup(id);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing writeup id" }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized: Please sign in to comment on writeups" },
      {
        status: 401,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  }

  try {
    const body = await req.json();
    const parsed = createCommentSchema.parse(body);

    const comment = await createComment(session.user.id, id, parsed.content);
    return NextResponse.json(comment, {
      status: 201,
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || "Failed to create comment" },
      { status: 500 }
    );
  }
}
