import { prisma } from "@/lib/prisma";
import { EventFormat, EventLocationType } from "@prisma/client";

export interface CreateEventInput {
  title: string;
  organizer: string;
  description: string;
  url: string;
  format?: EventFormat;
  locationType?: EventLocationType;
  location?: string | null;
  startDate: string | Date;
  endDate: string | Date;
  weight?: number | null;
  prizePool?: string | null;
}

export interface EventItem {
  id: string;
  title: string;
  organizer: string;
  description: string;
  url: string;
  format: EventFormat;
  locationType: EventLocationType;
  location: string | null;
  startDate: Date;
  endDate: Date;
  weight: number | null;
  prizePool: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    avatarUrl: string | null;
  };
}

/**
 * Prunes events whose day has ended and returns upcoming/ongoing events.
 */
export async function getActiveEvents(): Promise<EventItem[]> {
  const now = new Date();
  // Cutoff at beginning of today (UTC), so an event on today remains visible until the day concludes
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

  // Auto-prune events whose end date has passed
  try {
    await prisma.event.deleteMany({
      where: {
        endDate: {
          lt: startOfToday,
        },
      },
    });
  } catch (err) {
    console.warn("[EventService] Could not prune expired events:", err);
  }

  let events = await prisma.event.findMany({
    where: {
      endDate: {
        gte: startOfToday,
      },
    },
    orderBy: {
      startDate: "asc",
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Seed default curated events if empty
  if (events.length === 0) {
    events = await seedInitialEvents();
  }

  return events;
}

export async function createEvent(
  userId: string,
  input: CreateEventInput
): Promise<EventItem> {
  const title = (input.title || "").trim();
  const organizer = (input.organizer || "").trim();
  const description = (input.description || "").trim();
  const url = (input.url || "").trim();

  if (!title || title.length < 3 || title.length > 120) {
    throw new Error("Title must be between 3 and 120 characters.");
  }
  if (!organizer || organizer.length < 2 || organizer.length > 80) {
    throw new Error("Organizer name must be between 2 and 80 characters.");
  }
  if (!description || description.length < 10 || description.length > 2000) {
    throw new Error("Description must be between 10 and 2,000 characters.");
  }
  if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
    throw new Error("A valid URL starting with https:// or http:// is required.");
  }

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Valid start and end dates are required.");
  }

  if (endDate < startDate) {
    throw new Error("End date/deadline cannot be before start date.");
  }

  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  if (endDate < startOfToday) {
    throw new Error("Event deadline cannot be in the past.");
  }

  const event = await prisma.event.create({
    data: {
      userId,
      title,
      organizer,
      description,
      url,
      format: input.format || EventFormat.JEOPARDY,
      locationType: input.locationType || EventLocationType.ONLINE,
      location: input.location?.trim() || null,
      startDate,
      endDate,
      weight: typeof input.weight === "number" ? input.weight : null,
      prizePool: input.prizePool?.trim() || null,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return event;
}

export async function deleteEvent(
  userId: string,
  eventId: string,
  userRole?: string
): Promise<{ success: boolean }> {
  const existing = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, userId: true },
  });

  if (!existing) {
    throw new Error("Event not found.");
  }

  if (existing.userId !== userId && userRole !== "ADMIN") {
    throw new Error("Unauthorized: You do not have permission to delete this event.");
  }

  await prisma.event.delete({
    where: { id: eventId },
  });

  return { success: true };
}

/**
 * Populates upcoming global CTF events and security hackathons
 * if the table is currently empty.
 */
async function seedInitialEvents(): Promise<EventItem[]> {
  // Find or pick first existing user to associate default curated events
  const defaultUser = await prisma.user.findFirst({
    select: { id: true },
  });

  if (!defaultUser) return [];

  const now = new Date();
  const curYear = now.getUTCFullYear();
  const curMonth = now.getUTCMonth();

  const curatedEvents: (Omit<CreateEventInput, "startDate" | "endDate"> & {
    startDaysOffset: number;
    durationDays: number;
  })[] = [
    {
      title: "DEF CON CTF 34 Qualifiers",
      organizer: "Nautilus Institute",
      description: "The premier global Capture The Flag competition. Teams compete across intense Pwn, Reverse Engineering, Kernel Exploitation, and Cryptography challenges for a berth in the DEF CON finals.",
      url: "https://ctftime.org/event/defcon-quals",
      format: EventFormat.JEOPARDY,
      locationType: EventLocationType.ONLINE,
      location: "Worldwide / Online",
      startDaysOffset: 12,
      durationDays: 2,
      weight: 100.0,
      prizePool: "DEF CON Finals Qualification",
    },
    {
      title: "Google CTF 2027",
      organizer: "Google Information Security",
      description: "Official annual cybersecurity competition hosted by Google. Featuring state-of-the-art sandbox escapes, V8 JavaScript engine exploits, side-channel attacks, and hardware security puzzles.",
      url: "https://capturetheflag.withgoogle.com/",
      format: EventFormat.JEOPARDY,
      locationType: EventLocationType.ONLINE,
      location: "Online",
      startDaysOffset: 24,
      durationDays: 2,
      weight: 95.0,
      prizePool: "$31,337 USD Pool",
    },
    {
      title: "HITCON CTF 2026 Finals",
      organizer: "HITCON Security Team",
      description: "Elite attack-defense and jeopardy competition organized by Taiwan's leading offensive security community. High-weight scoring on CTFtime with custom zero-day style challenges.",
      url: "https://hitcon.org/",
      format: EventFormat.ATTACK_DEFENSE,
      locationType: EventLocationType.HYBRID,
      location: "Taipei, Taiwan & Online",
      startDaysOffset: 45,
      durationDays: 3,
      weight: 98.5,
      prizePool: "$20,000 USD",
    },
    {
      title: "Cyber Apocalypse Hackathon & CTF",
      organizer: "Hack The Box",
      description: "One of the largest cybersecurity hackathons and gamified CTFs globally. Over 10,000 teams battle across Web, Cloud, AI, Blockchain, and Incident Response tracks.",
      url: "https://www.hackthebox.com/events",
      format: EventFormat.HACKATHON,
      locationType: EventLocationType.ONLINE,
      location: "Global Online",
      startDaysOffset: 5,
      durationDays: 5,
      weight: 75.0,
      prizePool: "$50,000+ Prizes & Certs",
    },
    {
      title: "PlaidCTF 2027",
      organizer: "Plad-Teams / PPP",
      description: "Hosted by Carnegie Mellon University's Plaid Parliament of Pwning. Renowned for innovative cryptography, hypervisor pwn, and complex binary exploitation.",
      url: "https://plaidctf.com/",
      format: EventFormat.JEOPARDY,
      locationType: EventLocationType.ONLINE,
      location: "Online",
      startDaysOffset: 35,
      durationDays: 2,
      weight: 99.0,
      prizePool: "Trophies & Exclusive Swag",
    },
  ];

  for (const item of curatedEvents) {
    const startDate = new Date(Date.UTC(curYear, curMonth, now.getUTCDate() + item.startDaysOffset, 12, 0, 0));
    const endDate = new Date(Date.UTC(curYear, curMonth, now.getUTCDate() + item.startDaysOffset + item.durationDays, 12, 0, 0));

    await prisma.event.create({
      data: {
        userId: defaultUser.id,
        title: item.title,
        organizer: item.organizer,
        description: item.description,
        url: item.url,
        format: item.format,
        locationType: item.locationType,
        location: item.location,
        startDate,
        endDate,
        weight: item.weight,
        prizePool: item.prizePool,
      },
    });
  }

  return prisma.event.findMany({
    orderBy: { startDate: "asc" },
    include: {
      user: {
        select: { id: true, username: true, name: true, avatarUrl: true },
      },
    },
  });
}
