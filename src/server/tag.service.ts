import { prisma } from "@/lib/prisma";

export async function getPopularTags(limit = 15) {
  const tags = await prisma.tag.findMany({
    take: limit,
    include: {
      _count: {
        select: { writeups: true },
      },
    },
    orderBy: {
      writeups: {
        _count: "desc",
      },
    },
  });

  return tags.map((t) => ({
    id: t.id,
    name: t.name,
    count: t._count.writeups,
  }));
}

export async function searchTags(query: string, limit = 10) {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const tags = await prisma.tag.findMany({
    where: {
      name: { contains: clean, mode: "insensitive" },
    },
    take: limit,
    select: {
      id: true,
      name: true,
    },
  });

  return tags;
}
