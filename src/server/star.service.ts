import { prisma } from "@/lib/prisma";

export async function toggleStar(userId: string, writeupId: string) {
  // Check writeup exists and enforce visibility
  const writeup = await prisma.writeup.findUnique({
    where: { id: writeupId },
    select: { id: true, status: true, authorId: true },
  });

  if (!writeup) {
    throw new Error("Writeup not found");
  }

  // DRAFT: only author can interact
  if (writeup.status === "DRAFT" && writeup.authorId !== userId) {
    throw new Error("Writeup not found");
  }

  const existing = await prisma.star.findUnique({
    where: {
      userId_writeupId: {
        userId,
        writeupId,
      },
    },
  });

  let starred = false;
  if (existing) {
    await prisma.star.delete({
      where: {
        userId_writeupId: {
          userId,
          writeupId,
        },
      },
    });
    starred = false;
  } else {
    await prisma.star.create({
      data: {
        userId,
        writeupId,
      },
    });
    starred = true;
  }

  const totalStars = await prisma.star.count({
    where: { writeupId },
  });

  return { starred, totalStars };
}

export async function getStarStatus(writeupId: string, userId?: string | null) {
  if (userId) {
    const [existing, totalStars] = await Promise.all([
      prisma.star.findUnique({
        where: {
          userId_writeupId: {
            userId,
            writeupId,
          },
        },
      }),
      prisma.star.count({ where: { writeupId } }),
    ]);

    return {
      starred: !!existing,
      totalStars,
    };
  }

  const totalStars = await prisma.star.count({ where: { writeupId } });
  return {
    starred: false,
    totalStars,
  };
}
