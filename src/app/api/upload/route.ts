import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { storageService } from "@/server/storage.service";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit uploads: 10 per minute per user
  const rateLimit = checkRateLimit(`upload:${session.user.id}`, 10, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Upload limit exceeded. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in request." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await storageService.uploadImage(
      buffer,
      file.name,
      file.type
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "File upload failed." },
      { status: 400 }
    );
  }
}
