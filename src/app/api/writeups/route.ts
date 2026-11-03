import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createWriteup, getPublicWriteups } from "@/server/writeup.service";
import { createWriteupSchema, filterWriteupSchema } from "@/lib/validations/writeup.schema";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const validated = createWriteupSchema.parse(json);
    const writeup = await createWriteup(session.user.id, validated);
    return NextResponse.json(writeup, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create writeup." },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = filterWriteupSchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  }

  const result = await getPublicWriteups(parsed.data);
  return NextResponse.json(result);
}
