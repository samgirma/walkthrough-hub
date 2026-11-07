import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleStar, getStarStatus } from "@/server/star.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing writeup id" }, { status: 400 });
  }

  const session = await auth();
  const userId = session?.user?.id || null;

  try {
    const status = await getStarStatus(id, userId);
    return NextResponse.json(status, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to get star status" },
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
      { error: "Unauthorized: Please sign in to star writeups" },
      {
        status: 401,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  }

  try {
    const result = await toggleStar(session.user.id, id);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update star" },
      { status: 500 }
    );
  }
}
