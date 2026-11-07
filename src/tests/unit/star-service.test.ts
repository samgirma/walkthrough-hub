import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  writeupFindUnique: vi.fn(),
  starFindUnique: vi.fn(),
  starCreate: vi.fn(),
  starDelete: vi.fn(),
  starCount: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    writeup: {
      findUnique: mocks.writeupFindUnique,
    },
    star: {
      findUnique: mocks.starFindUnique,
      create: mocks.starCreate,
      delete: mocks.starDelete,
      count: mocks.starCount,
    },
  },
}));

import { toggleStar, getStarStatus } from "@/server/star.service";

describe("Star Service (Writeup Star & Analytics)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stars a public writeup when not yet starred", async () => {
    mocks.writeupFindUnique.mockResolvedValue({
      id: "w1",
      status: "PUBLIC",
      authorId: "author-1",
    });
    mocks.starFindUnique.mockResolvedValue(null);
    mocks.starCreate.mockResolvedValue({ userId: "u1", writeupId: "w1" });
    mocks.starCount.mockResolvedValue(1);

    const result = await toggleStar("u1", "w1");

    expect(result).toEqual({ starred: true, totalStars: 1 });
    expect(mocks.starCreate).toHaveBeenCalledWith({
      data: { userId: "u1", writeupId: "w1" },
    });
  });

  it("unstars a writeup when already starred", async () => {
    mocks.writeupFindUnique.mockResolvedValue({
      id: "w1",
      status: "PUBLIC",
      authorId: "author-1",
    });
    mocks.starFindUnique.mockResolvedValue({ userId: "u1", writeupId: "w1" });
    mocks.starDelete.mockResolvedValue({});
    mocks.starCount.mockResolvedValue(0);

    const result = await toggleStar("u1", "w1");

    expect(result).toEqual({ starred: false, totalStars: 0 });
    expect(mocks.starDelete).toHaveBeenCalledWith({
      where: {
        userId_writeupId: { userId: "u1", writeupId: "w1" },
      },
    });
  });

  it("rejects non-existent writeup", async () => {
    mocks.writeupFindUnique.mockResolvedValue(null);

    await expect(toggleStar("u1", "missing-id")).rejects.toThrow("Writeup not found");
  });

  it("prevents non-author from starring a DRAFT writeup", async () => {
    mocks.writeupFindUnique.mockResolvedValue({
      id: "w-draft",
      status: "DRAFT",
      authorId: "author-1",
    });

    await expect(toggleStar("other-user", "w-draft")).rejects.toThrow("Writeup not found");
    expect(mocks.starCreate).not.toHaveBeenCalled();
  });

  it("allows author to star their own DRAFT writeup", async () => {
    mocks.writeupFindUnique.mockResolvedValue({
      id: "w-draft",
      status: "DRAFT",
      authorId: "author-1",
    });
    mocks.starFindUnique.mockResolvedValue(null);
    mocks.starCreate.mockResolvedValue({});
    mocks.starCount.mockResolvedValue(1);

    const result = await toggleStar("author-1", "w-draft");
    expect(result.starred).toBe(true);
  });

  it("returns starred: false and count for public anonymous visitors", async () => {
    mocks.starCount.mockResolvedValue(42);

    const status = await getStarStatus("w1", null);
    expect(status).toEqual({ starred: false, totalStars: 42 });
    expect(mocks.starFindUnique).not.toHaveBeenCalled();
  });

  it("returns user's starred status for signed in users", async () => {
    mocks.starFindUnique.mockResolvedValue({ userId: "u1", writeupId: "w1" });
    mocks.starCount.mockResolvedValue(5);

    const status = await getStarStatus("w1", "u1");
    expect(status).toEqual({ starred: true, totalStars: 5 });
  });
});
