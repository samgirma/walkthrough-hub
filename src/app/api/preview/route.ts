import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { renderMarkdown, extractTOC } from "@/lib/markdown";
import { checkRateLimit } from "@/lib/rate-limit";

// Maximum Markdown preview payload size: 100 KB
const MAX_PREVIEW_PAYLOAD_BYTES = 100 * 1024;

export async function POST(req: Request) {
  // 1. Authentication check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized: You must be signed in to generate markdown previews." },
      {
        status: 401,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  }

  // 2. Sliding window rate-limiting: 60 previews per minute per user
  const rateLimitKey = `preview:${session.user.id}`;
  const rateCheck = checkRateLimit(rateLimitKey, 60, 60000);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a moment before updating the preview." },
      {
        status: 429,
        headers: {
          "Retry-After": "2",
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  }

  try {
    const body = await req.json();
    const contentMd = typeof body?.contentMd === "string" ? body.contentMd : "";

    // 3. Payload size cap: 100 KB
    if (new TextEncoder().encode(contentMd).length > MAX_PREVIEW_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: "Content exceeds maximum preview size of 100 KB." },
        {
          status: 413,
          headers: {
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
          },
        }
      );
    }

    // 4. Server-side render with Shiki syntax highlighting
    const [html, toc] = await Promise.all([
      renderMarkdown(contentMd),
      extractTOC(contentMd),
    ]);

    return NextResponse.json(
      { html, toc },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to render markdown preview." },
      {
        status: 500,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}
