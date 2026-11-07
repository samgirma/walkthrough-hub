import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  eventFindMany: vi.fn(),
  eventDeleteMany: vi.fn(),
  eventCreate: vi.fn(),
  eventFindUnique: vi.fn(),
  eventDelete: vi.fn(),
  userFindFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    event: {
      findMany: mocks.eventFindMany,
      deleteMany: mocks.eventDeleteMany,
      create: mocks.eventCreate,
      findUnique: mocks.eventFindUnique,
      delete: mocks.eventDelete,
    },
    user: {
      findFirst: mocks.userFindFirst,
    },
  },
}));

import {
  getActiveEvents,
  createEvent,
  deleteEvent,
} from "@/server/event.service";
import { EventFormat, EventLocationType } from "@prisma/client";

describe("Event Service (Global CTF Events & Hackathons with Auto-Pruning)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getActiveEvents & Auto-Pruning", () => {
    it("prunes expired events whose day has ended and returns active ones", async () => {
      const activeEvent = {
        id: "ev-1",
        title: "DEF CON Quals",
        organizer: "Nautilus",
        description: "Premier global CTF",
        url: "https://ctftime.org/event/1",
        format: EventFormat.JEOPARDY,
        locationType: EventLocationType.ONLINE,
        location: "Online",
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 172800000),
        weight: 100,
        prizePool: "$20,000",
        userId: "u1",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: "u1", username: "nautilus", name: "Organizer", avatarUrl: null },
      };

      mocks.eventDeleteMany.mockResolvedValue({ count: 2 });
      mocks.eventFindMany.mockResolvedValue([activeEvent]);

      const result = await getActiveEvents();

      expect(mocks.eventDeleteMany).toHaveBeenCalledWith({
        where: {
          endDate: {
            lt: expect.any(Date),
          },
        },
      });

      expect(mocks.eventFindMany).toHaveBeenCalledWith({
        where: {
          endDate: {
            gte: expect.any(Date),
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

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("DEF CON Quals");
    });
  });

  describe("createEvent", () => {
    it("creates an event when valid input is supplied", async () => {
      const futureStart = new Date(Date.now() + 86400000 * 2);
      const futureEnd = new Date(Date.now() + 86400000 * 4);

      const created = {
        id: "ev-new",
        title: "Hack The Box Cyber Apocalypse",
        organizer: "Hack The Box",
        description: "Massive annual hacking tournament.",
        url: "https://hackthebox.com",
        format: EventFormat.HACKATHON,
        locationType: EventLocationType.ONLINE,
        location: "Online",
        startDate: futureStart,
        endDate: futureEnd,
        weight: 80,
        prizePool: "$50,000",
        userId: "u-creator",
        user: { id: "u-creator", username: "htb", name: "HTB", avatarUrl: null },
      };

      mocks.eventCreate.mockResolvedValue(created);

      const event = await createEvent("u-creator", {
        title: "Hack The Box Cyber Apocalypse",
        organizer: "Hack The Box",
        description: "Massive annual hacking tournament.",
        url: "https://hackthebox.com",
        format: EventFormat.HACKATHON,
        startDate: futureStart.toISOString(),
        endDate: futureEnd.toISOString(),
        weight: 80,
        prizePool: "$50,000",
      });

      expect(event.id).toBe("ev-new");
      expect(mocks.eventCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "u-creator",
            title: "Hack The Box Cyber Apocalypse",
          }),
        })
      );
    });

    it("rejects event if title is too short", async () => {
      await expect(
        createEvent("u1", {
          title: "ab",
          organizer: "Organizer",
          description: "This is a detailed description of the event.",
          url: "https://example.com",
          startDate: new Date(Date.now() + 10000).toISOString(),
          endDate: new Date(Date.now() + 20000).toISOString(),
        })
      ).rejects.toThrow("Title must be between 3 and 120 characters.");
    });

    it("rejects event if url is invalid", async () => {
      await expect(
        createEvent("u1", {
          title: "Valid Title",
          organizer: "Organizer",
          description: "This is a detailed description of the event.",
          url: "invalid-url",
          startDate: new Date(Date.now() + 10000).toISOString(),
          endDate: new Date(Date.now() + 20000).toISOString(),
        })
      ).rejects.toThrow("A valid URL starting with https:// or http:// is required.");
    });

    it("rejects event if endDate is before startDate", async () => {
      const now = Date.now();
      await expect(
        createEvent("u1", {
          title: "Valid Title",
          organizer: "Organizer",
          description: "This is a detailed description of the event.",
          url: "https://example.com",
          startDate: new Date(now + 86400000 * 2).toISOString(),
          endDate: new Date(now + 86400000 * 1).toISOString(),
        })
      ).rejects.toThrow("End date/deadline cannot be before start date.");
    });
  });

  describe("deleteEvent", () => {
    it("allows event creator to delete their event", async () => {
      mocks.eventFindUnique.mockResolvedValue({ id: "ev-1", userId: "u-creator" });
      mocks.eventDelete.mockResolvedValue({});

      const result = await deleteEvent("u-creator", "ev-1", "USER");
      expect(result).toEqual({ success: true });
      expect(mocks.eventDelete).toHaveBeenCalledWith({ where: { id: "ev-1" } });
    });

    it("allows ADMIN to delete any event", async () => {
      mocks.eventFindUnique.mockResolvedValue({ id: "ev-1", userId: "u-creator" });
      mocks.eventDelete.mockResolvedValue({});

      const result = await deleteEvent("u-admin", "ev-1", "ADMIN");
      expect(result).toEqual({ success: true });
    });

    it("rejects unauthorized deletion", async () => {
      mocks.eventFindUnique.mockResolvedValue({ id: "ev-1", userId: "u-creator" });

      await expect(deleteEvent("attacker", "ev-1", "USER")).rejects.toThrow(
        "Unauthorized: You do not have permission to delete this event."
      );
      expect(mocks.eventDelete).not.toHaveBeenCalled();
    });
  });
});
