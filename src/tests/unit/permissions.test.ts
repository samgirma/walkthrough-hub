import { describe, it, expect, vi } from "vitest";
import { getWriteupByAuthorAndSlug, getPublicWriteups } from "@/server/writeup.service";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    writeup: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe("Data Layer Visibility & Permissions Enforcement", () => {
  it("blocks non-author from reading DRAFT writeups", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "author-1",
    } as any);

    vi.mocked(prisma.writeup.findUnique).mockResolvedValue({
      id: "w-1",
      authorId: "author-1",
      slug: "secret-exploit",
      status: "DRAFT",
    } as any);

    // Call as anonymous visitor -> should return null
    const anonResult = await getWriteupByAuthorAndSlug(
      "author-1",
      "secret-exploit",
      null
    );
    expect(anonResult).toBeNull();

    // Call as different user -> should return null
    const otherUserResult = await getWriteupByAuthorAndSlug(
      "author-1",
      "secret-exploit",
      "other-user-2"
    );
    expect(otherUserResult).toBeNull();

    // Call as author -> should return the draft
    const authorResult = await getWriteupByAuthorAndSlug(
      "author-1",
      "secret-exploit",
      "author-1"
    );
    expect(authorResult).not.toBeNull();
    expect(authorResult?.status).toBe("DRAFT");
  });

  it("permits any user with link to view UNLISTED writeup", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "author-1",
    } as any);

    vi.mocked(prisma.writeup.findUnique).mockResolvedValue({
      id: "w-unlisted",
      authorId: "author-1",
      slug: "team-private-notes",
      status: "UNLISTED",
    } as any);

    // Anonymous visitor with link can view
    const result = await getWriteupByAuthorAndSlug(
      "author-1",
      "team-private-notes",
      null
    );
    expect(result).not.toBeNull();
    expect(result?.status).toBe("UNLISTED");
  });

  it("strictly enforces PUBLIC status in getPublicWriteups queries", async () => {
    vi.mocked(prisma.writeup.findMany).mockResolvedValue([]);
    vi.mocked(prisma.writeup.count).mockResolvedValue(0);

    await getPublicWriteups({ search: "exploit" });

    // Verify findMany was invoked with status: 'PUBLIC'
    expect(prisma.writeup.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "PUBLIC",
        }),
      })
    );
  });
});
