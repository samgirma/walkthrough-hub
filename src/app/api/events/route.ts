import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActiveEvents, createEvent } from "@/server/event.service";
import { z } from "zod";
import { EventFormat, EventLocationType } from "@prisma/client";

const createEventSchema = z.object({
  title: z.string().min(3).max(120),
  organizer: z.string().min(2).max(80),
  description: z.string().min(10).max(2000),
  url: z.string().url("Must be a valid URL"),
  format: z.nativeEnum(EventFormat).default(EventFormat.JEOPARDY),
  locationType: z.nativeEnum(EventLocationType).default(EventLocationType.ONLINE),
  location: z.string().optional().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  weight: z.number().min(0).max(200).optional().nullable(),
  prizePool: z.string().max(100).optional().nullable(),
});

export async function GET() {
  try {
    const events = await getActiveEvents();
    return NextResponse.json(
      { events, total: events.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load events" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized: Please sign in to post events" },
      {
        status: 401,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  }

  try {
    const body = await req.json();
    const parsed = createEventSchema.parse(body);

    const event = await createEvent(session.user.id, parsed);
    return NextResponse.json(event, {
      status: 201,
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message || "Invalid event input" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err?.message || "Failed to create event" },
      { status: 400 }
    );
  }
}
