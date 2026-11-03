import { NextResponse } from "next/server";
import { registerUser } from "@/server/auth.service";
import { registerSchema } from "@/lib/validations/auth.schema";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Rate limit registration: max 5 per minute per IP
  const forwardedFor = req.headers.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  const rateCheck = checkRateLimit(`register:${clientIp}`, 5, 60000);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    const json = await req.json();
    const validated = registerSchema.parse(json);
    const user = await registerUser(validated);
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to register researcher account." },
      { status: 400 }
    );
  }
}
