import { prisma } from "@/lib/prisma";

export async function toggleBookmark(userId: string, writeupId: string) {
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_writeupId: {
        userId,
        writeupId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: {
        userId_writeupId: {
          userId,
          writeupId,
        },
      },
    });
    return { bookmarked: false };
  } else {
    await prisma.bookmark.create({
      data: {
        userId,
        writeupId,
      },
    });
    return { bookmarked: true };
  }
}

export async function isBookmarked(userId: string, writeupId: string): Promise<boolean> {
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_writeupId: {
        userId,
        writeupId,
      },
    },
  });
  return !!existing;
}

export async function getUserBookmarks(userId: string, page = 1, limit = 12) {
  const skip = (page - 1) * limit;

  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        writeup: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
            tags: {
              include: { tag: true },
            },
            _count: {
              select: { bookmarks: true },
            },
          },
        },
      },
    }),
    prisma.bookmark.count({ where: { userId } }),
  ]);

  return {
    items: bookmarks.map((b) => b.writeup),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
