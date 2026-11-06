import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateUserProfile } from "@/server/auth.service";
import { updateProfileSchema } from "@/lib/validations/auth.schema";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const validated = updateProfileSchema.parse(json);
    const updated = await updateUserProfile(session.user.id, validated);
    return NextResponse.json(updated, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update profile." },
      {
        status: 400,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}
