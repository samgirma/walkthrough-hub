import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteEvent } from "@/server/event.service";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized: Please sign in to delete events" },
      {
        status: 401,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  }

  try {
    const result = await deleteEvent(
      session.user.id,
      id,
      session.user.role
    );
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    const status = err.message?.includes("Unauthorized") ? 403 : 500;
    return NextResponse.json(
      { error: err?.message || "Failed to delete event" },
      { status }
    );
  }
}
