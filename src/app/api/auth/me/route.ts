import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { user: null },
        {
          headers: {
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
          },
        }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: session.user.id,
          username: (session.user as any).username,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: (session.user as any).role,
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { user: null },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}
