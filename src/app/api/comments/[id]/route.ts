import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteComment } from "@/server/comment.service";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing comment id" }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized: Please sign in to delete comments" },
      {
        status: 401,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  }

  try {
    const result = await deleteComment(
      session.user.id,
      id,
      session.user.role
    );
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 403 : 500;
    return NextResponse.json(
      { error: error?.message || "Failed to delete comment" },
      { status }
    );
  }
}
