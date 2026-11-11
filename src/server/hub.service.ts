import { prisma } from "@/lib/prisma";
import { isIndexable, SYNTHETIC_WRITEUP_EXCLUSION_WHERE } from "@/lib/seo";
import { Category, Prisma } from "@prisma/client";

const HUB_WRITEUP_INCLUDE = {
  author: {
    select: { id: true, username: true, avatarUrl: true, createdAt: true },
  },
  tags: { include: { tag: true } },
} satisfies Prisma.WriteupInclude;

export type HubWriteupItem = Prisma.WriteupGetPayload<{
  include: typeof HUB_WRITEUP_INCLUDE;
}>;

export interface HubResult {
  writeups: HubWriteupItem[];
  totalCount: number;
  indexableCount: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const INDEXABLE_EVAL_SELECT = {
  status: true,
  title: true,
  ctfName: true,
  slug: true,
  contentMd: true,
  isFlagged: true,
  moderationStatus: true,
  indexOverride: true,
  author: { select: { createdAt: true } },
} as const;

function countIndexableWriteups(
  items: {
    status: "DRAFT" | "UNLISTED" | "PUBLIC";
    title: string;
    ctfName: string;
    slug: string;
    contentMd: string;
    isFlagged: boolean;
    moderationStatus: "APPROVED" | "FLAGGED" | "SPAM" | "REMOVED";
    indexOverride: "AUTO" | "FORCE_INDEX" | "FORCE_NOINDEX";
    author: { createdAt: Date };
  }[]
) {
  return items.filter((w) =>
    isIndexable({
      status: w.status,
      title: w.title,
      ctfName: w.ctfName,
      slug: w.slug,
      contentMd: w.contentMd,
      isFlagged: w.isFlagged,
      moderationStatus: w.moderationStatus,
      indexOverride: w.indexOverride,
      authorCreatedAt: w.author.createdAt,
    })
  ).length;
}

export async function getCategoryHub(
  categoryRaw: string,
  page: number = 1,
  limit: number = 12
): Promise<HubResult> {
  const upperCategory = categoryRaw.toUpperCase() as Category;
  const skip = (Math.max(1, page) - 1) * limit;
  const whereClause = {
    category: upperCategory,
    status: "PUBLIC" as const,
    NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE,
  };

  const [writeups, totalCount, allPublic] = await Promise.all([
    prisma.writeup.findMany({
      where: whereClause,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      skip,
      take: limit,
      include: HUB_WRITEUP_INCLUDE,
    }),
    prisma.writeup.count({ where: whereClause }),
    prisma.writeup.findMany({
      where: whereClause,
      select: INDEXABLE_EVAL_SELECT,
      take: 50,
    }),
  ]);

  const indexableCount = countIndexableWriteups(allPublic);
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    writeups,
    totalCount,
    indexableCount,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export async function getCtfHub(
  ctfSlugRaw: string,
  page: number = 1,
  limit: number = 12
): Promise<HubResult & { ctfName: string; ctfYear?: number }> {
  // Normalize slug into search terms (e.g., 'defcon-ctf-2024' -> 'defcon' or match by ctfName)
  const normalized = decodeURIComponent(ctfSlugRaw).replace(/-/g, " ").trim();
  const skip = (Math.max(1, page) - 1) * limit;

  // Extract year if present at the end
  const yearMatch = normalized.match(/\b(20\d\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : undefined;
  const nameQuery = normalized.replace(/\b20\d\d\b/, "").trim();

  const whereClause: any = {
    status: "PUBLIC",
    ctfName: { contains: nameQuery, mode: "insensitive" },
    NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE,
  };
  if (year) {
    whereClause.ctfYear = year;
  }

  const [writeups, totalCount, allPublic] = await Promise.all([
    prisma.writeup.findMany({
      where: whereClause,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      skip,
      take: limit,
      include: HUB_WRITEUP_INCLUDE,
    }),
    prisma.writeup.count({ where: whereClause }),
    prisma.writeup.findMany({
      where: whereClause,
      select: INDEXABLE_EVAL_SELECT,
      take: 50,
    }),
  ]);

  const indexableCount = countIndexableWriteups(allPublic);

  const primaryCtfName = writeups[0]?.ctfName || nameQuery.toUpperCase();
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    writeups,
    totalCount,
    indexableCount,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    ctfName: primaryCtfName,
    ctfYear: year || writeups[0]?.ctfYear,
  };
}

export async function getTagHub(
  tagRaw: string,
  page: number = 1,
  limit: number = 12
): Promise<HubResult & { tagName: string }> {
  const tagName = decodeURIComponent(tagRaw).toLowerCase().trim();
  const skip = (Math.max(1, page) - 1) * limit;

  const whereClause = {
    status: "PUBLIC" as const,
    NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE,
    tags: {
      some: {
        tag: { name: tagName },
      },
    },
  };

  const [writeups, totalCount, allPublic] = await Promise.all([
    prisma.writeup.findMany({
      where: whereClause,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      skip,
      take: limit,
      include: HUB_WRITEUP_INCLUDE,
    }),
    prisma.writeup.count({ where: whereClause }),
    prisma.writeup.findMany({
      where: whereClause,
      select: INDEXABLE_EVAL_SELECT,
      take: 50,
    }),
  ]);

  const indexableCount = countIndexableWriteups(allPublic);
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    writeups,
    totalCount,
    indexableCount,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    tagName,
  };
}

export async function getRelatedWriteups(params: {
  writeupId: string;
  category: Category;
  ctfName: string;
  authorId: string;
}) {
  const [relatedByCategoryOrCtf, moreFromAuthor, sameCtfChallenges] = await Promise.all([
    // Up to 3 related by same CTF or Category
    prisma.writeup.findMany({
      where: {
        id: { not: params.writeupId },
        status: "PUBLIC",
        NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE,
        OR: [
          { ctfName: { equals: params.ctfName, mode: "insensitive" } },
          { category: params.category },
        ],
      },
      orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        difficulty: true,
        ctfName: true,
        readTimeMin: true,
        author: { select: { username: true } },
      },
    }),
    // Up to 3 from the same author
    prisma.writeup.findMany({
      where: {
        id: { not: params.writeupId },
        authorId: params.authorId,
        status: "PUBLIC",
        NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE,
      },
      orderBy: [{ publishedAt: "desc" }],
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        difficulty: true,
        ctfName: true,
        readTimeMin: true,
        author: { select: { username: true } },
      },
    }),
    // Previous & next challenge in same CTF
    prisma.writeup.findMany({
      where: {
        ctfName: { equals: params.ctfName, mode: "insensitive" },
        status: "PUBLIC",
        NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE,
      },
      orderBy: [{ publishedAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        author: { select: { username: true } },
      },
    }),
  ]);

  // Find index of current writeup in sameCtfChallenges
  const currentIndex = sameCtfChallenges.findIndex((w) => w.id === params.writeupId);
  const prevChallenge = currentIndex > 0 ? sameCtfChallenges[currentIndex - 1] : null;
  const nextChallenge =
    currentIndex >= 0 && currentIndex < sameCtfChallenges.length - 1
      ? sameCtfChallenges[currentIndex + 1]
      : null;

  return {
    related: relatedByCategoryOrCtf,
    moreFromAuthor,
    prevChallenge,
    nextChallenge,
  };
}

export async function getAllHubSummaries() {
  try {
    const [categories, topCtfs, topTags] = await Promise.all([
      prisma.writeup.groupBy({
        by: ["category"],
        where: { status: "PUBLIC", NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE },
        _count: { id: true },
      }),
      prisma.writeup.groupBy({
        by: ["ctfName", "ctfYear"],
        where: { status: "PUBLIC", NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 12,
      }),
      prisma.writeupTag.groupBy({
        by: ["tagId"],
        where: {
          writeup: { status: "PUBLIC", NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE },
        },
        _count: { writeupId: true },
        orderBy: { _count: { writeupId: "desc" } },
        take: 20,
      }),
    ]);

    const tagIds = topTags.map((t) => t.tagId);
    const tagNames = await prisma.tag.findMany({
      where: { id: { in: tagIds } },
      select: { id: true, name: true },
    });

    const tagMap = new Map(tagNames.map((t) => [t.id, t.name]));

    return {
      categories: categories.map((c) => ({
        category: c.category,
        count: c._count.id,
      })),
      ctfs: topCtfs.map((c) => ({
        name: c.ctfName,
        year: c.ctfYear,
        count: c._count.id,
        slug: `${c.ctfName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${c.ctfYear}`,
      })),
      tags: topTags.map((t) => ({
        name: tagMap.get(t.tagId) || "tag",
        count: t._count.writeupId,
      })),
    };
  } catch (err) {
    console.warn("[hub.service] getAllHubSummaries failed:", err);
    return {
      categories: [],
      ctfs: [],
      tags: [],
    };
  }
}

export interface CategoryOverviewItem {
  category: Category;
  count: number;
  totalViews: number;
  recentWriteups: {
    id: string;
    title: string;
    ctfName: string;
    ctfYear: number;
    difficulty: string;
    readTimeMin: number;
    authorUsername: string;
  }[];
}

const ORDERED_CATEGORIES: Category[] = [
  "WEB",
  "PWN",
  "CRYPTO",
  "REVERSE",
  "FORENSICS",
  "MISC",
  "OSINT",
];

export async function getCategoriesOverview(): Promise<{
  categories: CategoryOverviewItem[];
  totalPublic: number;
}> {
  try {
    const [grouped, recentAll] = await Promise.all([
      prisma.writeup.groupBy({
        by: ["category"],
        where: { status: "PUBLIC", NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE },
        _count: { id: true },
        _sum: { viewCount: true },
      }),
      prisma.writeup.findMany({
        where: { status: "PUBLIC", NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE },
        orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
        take: 42,
        select: {
          id: true,
          title: true,
          category: true,
          ctfName: true,
          ctfYear: true,
          difficulty: true,
          readTimeMin: true,
          author: { select: { username: true } },
        },
      }),
    ]);

    const statsMap = new Map(
      grouped.map((g) => [
        g.category,
        { count: g._count.id, views: g._sum.viewCount || 0 },
      ])
    );

    const byCategory = new Map<Category, CategoryOverviewItem["recentWriteups"]>();
    for (const w of recentAll) {
      const list = byCategory.get(w.category) || [];
      if (list.length < 3) {
        list.push({
          id: w.id,
          title: w.title,
          ctfName: w.ctfName,
          ctfYear: w.ctfYear,
          difficulty: w.difficulty,
          readTimeMin: w.readTimeMin,
          authorUsername: w.author.username || "anonymous",
        });
        byCategory.set(w.category, list);
      }
    }

    const categories: CategoryOverviewItem[] = ORDERED_CATEGORIES.map((cat) => {
      const stats = statsMap.get(cat);
      return {
        category: cat,
        count: stats?.count || 0,
        totalViews: stats?.views || 0,
        recentWriteups: byCategory.get(cat) || [],
      };
    });

    const totalPublic = categories.reduce((sum, item) => sum + item.count, 0);
    return { categories, totalPublic };
  } catch (err) {
    console.warn("[hub.service] getCategoriesOverview failed:", err);
    return {
      categories: ORDERED_CATEGORIES.map((cat) => ({
        category: cat,
        count: 0,
        totalViews: 0,
        recentWriteups: [],
      })),
      totalPublic: 0,
    };
  }
}
