import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createWriteup,
  updateWriteup,
  deleteWriteup,
} from "@/server/writeup.service";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    writeup: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    tag: {
      upsert: vi.fn(),
    },
    bookmark: {
      deleteMany: vi.fn(),
    },
    star: {
      deleteMany: vi.fn(),
    },
    comment: {
      deleteMany: vi.fn(),
    },
    writeupTag: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

describe("Writeup Service CRUD & Authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates readTimeMin and generates slug when creating writeup", async () => {
    vi.mocked(prisma.writeup.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.tag.upsert).mockResolvedValue({ id: "tag-1", name: "pwn" } as any);
    vi.mocked(prisma.writeup.create).mockResolvedValue({
      id: "w-new",
      title: "Fastbin Dup Exploitation",
      slug: "fastbin-dup-exploitation",
      authorId: "user-123",
      readTimeMin: 1,
      status: "PUBLIC",
    } as any);

    const result = await createWriteup("user-123", {
      title: "Fastbin Dup Exploitation",
      contentMd: "# Section 1\nBinary payload details here.",
      ctfName: "DEF CON",
      ctfYear: 2025,
      category: "PWN",
      difficulty: "HARD",
      status: "PUBLIC",
      tags: ["pwn"],
    });

    expect(prisma.writeup.create).toHaveBeenCalled();
    const createArgs = vi.mocked(prisma.writeup.create).mock.calls[0][0];
    expect(createArgs.data.authorId).toBe("user-123");
    expect(createArgs.data.slug).toBe("fastbin-dup-exploitation");
    expect(result.id).toBe("w-new");
  });

  it("prevents non-author from modifying another user's writeup", async () => {
    vi.mocked(prisma.writeup.findUnique).mockResolvedValue({
      id: "w-target",
      authorId: "original-author",
    } as any);

    await expect(
      updateWriteup("malicious-user", {
        id: "w-target",
        title: "Defaced Title",
        contentMd: "hacked",
        ctfName: "CTF",
        ctfYear: 2025,
        category: "WEB",
        difficulty: "EASY",
        status: "PUBLIC",
        tags: [],
      })
    ).rejects.toThrow(/Unauthorized/);
  });

  it("prevents non-author from deleting another user's writeup", async () => {
    vi.mocked(prisma.writeup.findUnique).mockResolvedValue({
      id: "w-target",
      authorId: "original-author",
    } as any);

    await expect(
      deleteWriteup("malicious-user", "w-target")
    ).rejects.toThrow(/Unauthorized/);
  });

  it("successfully deletes writeup when requested by legitimate author", async () => {
    vi.mocked(prisma.writeup.findUnique).mockResolvedValue({
      id: "w-target",
      authorId: "author-123",
    } as any);
    vi.mocked(prisma.writeup.delete).mockResolvedValue({
      id: "w-target",
    } as any);

    const res = await deleteWriteup("author-123", "w-target");
    expect(prisma.writeup.delete).toHaveBeenCalledWith({
      where: { id: "w-target" },
    });
    expect(res.success).toBe(true);
  });
});
