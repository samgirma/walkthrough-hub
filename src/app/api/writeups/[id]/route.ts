import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getWriteupByIdForAuthor,
  updateWriteup,
  deleteWriteup,
} from "@/server/writeup.service";
import { updateWriteupSchema } from "@/lib/validations/writeup.schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const writeup = await getWriteupByIdForAuthor(id, session.user.id);
    if (!writeup) {
      return NextResponse.json({ error: "Writeup not found." }, { status: 404 });
    }
    return NextResponse.json(writeup);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch writeup." },
      { status: 403 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const json = await req.json();
    const validated = updateWriteupSchema.parse({ ...json, id });
    const writeup = await updateWriteup(session.user.id, validated);
    return NextResponse.json(writeup);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update writeup." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const result = await deleteWriteup(session.user.id, id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete writeup." },
      { status: 403 }
    );
  }
}
