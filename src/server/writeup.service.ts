import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";
import { calculateReadingTime } from "@/lib/reading-time";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  CreateWriteupInput,
  UpdateWriteupInput,
  FilterWriteupInput,
  filterWriteupSchema,
} from "@/lib/validations/writeup.schema";
import { Prisma, Status } from "@prisma/client";
import { revalidateTag, revalidatePath } from "next/cache";
import { notifyIndexNow } from "@/server/indexnow.service";

function safeRevalidateTag(tag: string) {
  try {
    revalidateTag(tag);
  } catch {
    // Graceful no-op in test/offline environments
  }
}

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful no-op in test/offline environments
  }
}

export function revalidateWriteupCaches(options: {
  writeupId: string;
  authorId: string;
  authorUsername?: string | null;
  slug?: string;
  previousSlug?: string;
  tags?: string[];
}) {
  safeRevalidateTag("writeups");
  safeRevalidateTag(`writeup:${options.writeupId}`);
  safeRevalidateTag(`user:${options.authorId}`);
  safeRevalidateTag("search-index");

  if (options.tags) {
    for (const tag of options.tags) {
      safeRevalidateTag(`tag:${tag.toLowerCase().trim()}`);
    }
  }

  safeRevalidatePath("/");
  safeRevalidatePath("/explore");
  safeRevalidatePath("/sitemap.xml");
  safeRevalidatePath("/feed.xml");
  safeRevalidatePath("/api/search-index");

  if (options.authorUsername) {
    safeRevalidatePath(`/u/${options.authorUsername}`);
    if (options.slug) {
      safeRevalidatePath(`/w/${options.authorUsername}/${options.slug}`);
      notifyIndexNow([`/w/${options.authorUsername}/${options.slug}`]).catch(() => {});
    }
    if (options.previousSlug && options.previousSlug !== options.slug) {
      safeRevalidatePath(`/w/${options.authorUsername}/${options.previousSlug}`);
    }
  }
}

/**
 * Generate a unique slug for a given author.
 * If author already has writeup with slug 'x', increments to 'x-2', etc.
 */
async function resolveUniqueSlug(
  authorId: string,
  baseTitle: string,
  customSlug?: string,
  excludeWriteupId?: string
): Promise<string> {
  const initialSlug = customSlug ? generateSlug(customSlug) : generateSlug(baseTitle);
  let slug = initialSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.writeup.findUnique({
      where: {
        authorId_slug: {
          authorId,
          slug,
        },
      },
    });

    if (!existing || existing.id === excludeWriteupId) {
      return slug;
    }

    counter++;
    slug = `${initialSlug}-${counter}`;
  }
}

/**
 * Extract clean plain text excerpt from Markdown content.
 */
function createExcerptFromMarkdown(contentMd: string, maxLen = 220): string {
  const cleaned = contentMd
    .replace(/^#+\s+.*$/gm, "") // headers
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // links
    .replace(/:::.*?:::/gs, "") // custom callouts
    .replace(/[*_~>-]/g, " ") // formatting
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.substring(0, maxLen).trim() + "...";
}

export async function createWriteup(
  authorId: string,
  input: CreateWriteupInput
) {
  const slug = await resolveUniqueSlug(authorId, input.title, input.slug);
  const excerpt =
    input.excerpt?.trim() || createExcerptFromMarkdown(input.contentMd);
  const readTimeMin = calculateReadingTime(input.contentMd);
  const publishedAt =
    input.status === "PUBLIC" || input.status === "UNLISTED"
      ? new Date()
      : null;

  // Process tags: connect or create
  const tagConnects: { id: string }[] = [];
  if (input.tags && input.tags.length > 0) {
    for (const tagName of input.tags) {
      const cleanName = tagName.trim().toLowerCase();
      if (!cleanName) continue;
      const tag = await prisma.tag.upsert({
        where: { name: cleanName },
        update: {},
        create: { name: cleanName },
      });
      tagConnects.push({ id: tag.id });
    }
  }

  const writeup = await prisma.writeup.create({
    data: {
      authorId,
      title: input.title.trim(),
      slug,
      excerpt,
      contentMd: input.contentMd,
      coverImageUrl: input.coverImageUrl || null,
      ctfName: input.ctfName.trim(),
      ctfYear: input.ctfYear,
      category: input.category,
      difficulty: input.difficulty,
      status: input.status,
      readTimeMin,
      publishedAt,
      tags: {
        create: tagConnects.map((tag) => ({
          tag: { connect: { id: tag.id } },
        })),
      },
    },
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
    },
  });

  if (writeup.status === "PUBLIC" || writeup.status === "UNLISTED") {
    revalidateWriteupCaches({
      writeupId: writeup.id,
      authorId,
      authorUsername: writeup.author?.username,
      slug: writeup.slug,
      tags: input.tags,
    });
  }

  return writeup;
}

export async function updateWriteup(
  authorId: string,
  input: UpdateWriteupInput
) {
  // Authorization check: author must own writeup
  const existing = await prisma.writeup.findUnique({
    where: { id: input.id },
    include: {
      author: { select: { username: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!existing) {
    throw new Error("Writeup not found.");
  }

  if (existing.authorId !== authorId) {
    throw new Error("Unauthorized: You do not have permission to modify this writeup.");
  }

  // Resolve slug if title or slug changed
  let slug = existing.slug;
  if (
    (input.title && input.title !== existing.title) ||
    (input.slug && input.slug !== existing.slug)
  ) {
    slug = await resolveUniqueSlug(
      authorId,
      input.title || existing.title,
      input.slug,
      existing.id
    );
  }

  const contentMd = input.contentMd ?? existing.contentMd;
  const excerpt = input.excerpt
    ? input.excerpt.trim()
    : input.contentMd
    ? createExcerptFromMarkdown(contentMd)
    : existing.excerpt;
  const readTimeMin = input.contentMd
    ? calculateReadingTime(contentMd)
    : existing.readTimeMin;

  let publishedAt = existing.publishedAt;
  if (
    !publishedAt &&
    (input.status === "PUBLIC" || input.status === "UNLISTED")
  ) {
    publishedAt = new Date();
  }

  // Handle tags if provided
  if (input.tags) {
    // Delete existing WriteupTag relations
    await prisma.writeupTag.deleteMany({
      where: { writeupId: existing.id },
    });

    for (const tagName of input.tags) {
      const cleanName = tagName.trim().toLowerCase();
      if (!cleanName) continue;
      const tag = await prisma.tag.upsert({
        where: { name: cleanName },
        update: {},
        create: { name: cleanName },
      });
      await prisma.writeupTag.create({
        data: {
          writeupId: existing.id,
          tagId: tag.id,
        },
      });
    }
  }

  // If slug has changed, record old slug in SlugHistory for 301 redirects
  if (slug !== existing.slug) {
    await prisma.slugHistory.create({
      data: {
        writeupId: existing.id,
        oldSlug: existing.slug,
      },
    });
  }

  const updated = await prisma.writeup.update({
    where: { id: existing.id },
    data: {
      title: input.title ? input.title.trim() : undefined,
      slug,
      excerpt,
      contentMd,
      coverImageUrl:
        input.coverImageUrl !== undefined
          ? input.coverImageUrl || null
          : undefined,
      ctfName: input.ctfName ? input.ctfName.trim() : undefined,
      ctfYear: input.ctfYear,
      category: input.category,
      difficulty: input.difficulty,
      status: input.status,
      readTimeMin,
      publishedAt,
    },
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
    },
  });

  revalidateWriteupCaches({
    writeupId: existing.id,
    authorId,
    authorUsername: updated.author?.username || existing.author?.username,
    slug: updated.slug,
    previousSlug: existing.slug,
    tags: input.tags || existing.tags?.map((t) => t.tag.name) || [],
  });

  return updated;
}

export async function deleteWriteup(authorId: string, writeupId: string) {
  const existing = await prisma.writeup.findUnique({
    where: { id: writeupId },
    include: {
      author: { select: { username: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!existing) {
    throw new Error("Writeup not found.");
  }

  if (existing.authorId !== authorId) {
    throw new Error("Unauthorized: You do not have permission to delete this writeup.");
  }

  await prisma.writeupTag.deleteMany({ where: { writeupId } });
  await prisma.bookmark.deleteMany({ where: { writeupId } });
  await prisma.star.deleteMany({ where: { writeupId } });
  await prisma.comment.deleteMany({ where: { writeupId } });
  await prisma.writeup.delete({ where: { id: writeupId } });

  revalidateWriteupCaches({
    writeupId,
    authorId,
    authorUsername: existing.author?.username,
    slug: existing.slug,
    tags: existing.tags?.map((t) => t.tag.name) || [],
  });

  return { success: true };
}

/**
 * Public Reader Query with strict Data-Layer Authorization:
 * - DRAFT: only author can view (returns null for non-author)
 * - UNLISTED: anyone with link can view (returns writeup with isUnlisted: true)
 * - PUBLIC: anyone can view
 */
export async function getWriteupByAuthorAndSlug(
  username: string,
  slug: string,
  currentUserId?: string | null
) {
  const author = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!author) {
    return null;
  }

  const writeup = await prisma.writeup.findUnique({
    where: {
      authorId_slug: {
        authorId: author.id,
        slug,
      },
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          bio: true,
          githubUrl: true,
          createdAt: true,
        },
      },
      tags: {
        include: { tag: true },
      },
      _count: {
        select: { bookmarks: true, stars: true, comments: true },
      },
    },
  });

  if (!writeup) {
    return null;
  }

  // Data layer status enforcement
  if (writeup.status === "DRAFT") {
    // Only the author can view drafts
    if (!currentUserId || currentUserId !== writeup.authorId) {
      return null;
    }
  }

  return writeup;
}

/**
 * Single Unified Viewer Query:
 * Enforces visibility rules consistently across public reader, editor, and API:
 * - DRAFT: owner only (returns null if viewer is not the author)
 * - UNLISTED: anyone with direct link can view
 * - PUBLIC: everyone can view
 */
export async function getWriteupForViewer(
  target: { id?: string; username?: string; slug?: string },
  viewerUserId?: string | null
) {
  if (target.username && target.slug) {
    return await getWriteupByAuthorAndSlug(target.username, target.slug, viewerUserId);
  }

  if (!target.id) return null;

  const writeup = await prisma.writeup.findUnique({
    where: { id: target.id },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          bio: true,
          githubUrl: true,
          createdAt: true,
        },
      },
      tags: {
        include: { tag: true },
      },
      _count: {
        select: { bookmarks: true, stars: true, comments: true },
      },
    },
  });

  if (!writeup) return null;

  // Strict visibility enforcement
  if (writeup.status === "DRAFT") {
    if (!viewerUserId || viewerUserId !== writeup.authorId) {
      return null;
    }
  }

  return writeup;
}

/**
 * Get writeup by ID for author editor
 */
export async function getWriteupByIdForAuthor(writeupId: string, authorId: string) {
  const writeup = await prisma.writeup.findUnique({
    where: { id: writeupId },
    include: {
      tags: {
        include: { tag: true },
      },
    },
  });

  if (!writeup) return null;
  if (writeup.authorId !== authorId) {
    throw new Error("Unauthorized: You do not own this writeup.");
  }

  return writeup;
}

/**
 * Public Feed Query:
 * Strictly returns only PUBLIC writeups.
 * Excludes DRAFT and UNLISTED completely from lists and search.
 */
export async function getPublicWriteups(rawFilters: FilterWriteupInput = {}) {
  const filters = filterWriteupSchema.parse(rawFilters);
  const {
    category,
    difficulty,
    ctfName,
    ctfYear,
    tag,
    author,
    search,
    sort,
    page,
    limit,
  } = filters;

  const skip = (page - 1) * limit;

  // Build where conditions
  const where: Prisma.WriteupWhereInput = {
    status: Status.PUBLIC, // Strictly PUBLIC only
  };

  if (category) {
    where.category = category;
  }

  if (difficulty) {
    where.difficulty = difficulty;
  }

  if (ctfName) {
    where.ctfName = { contains: ctfName, mode: "insensitive" };
  }

  if (ctfYear) {
    where.ctfYear = ctfYear;
  }

  if (author) {
    where.author = { username: author };
  }

  if (tag) {
    where.tags = {
      some: {
        tag: { name: tag.toLowerCase() },
      },
    };
  }

  if (search && search.trim().length > 0) {
    const term = search.trim();
    where.OR = [
      { title: { contains: term, mode: "insensitive" } },
      { excerpt: { contains: term, mode: "insensitive" } },
      { contentMd: { contains: term, mode: "insensitive" } },
      { ctfName: { contains: term, mode: "insensitive" } },
    ];
  }

  // Determine sort order
  let orderBy: Prisma.WriteupOrderByWithRelationInput[];
  switch (sort) {
    case "latest":
      orderBy = [{ publishedAt: "desc" }, { createdAt: "desc" }];
      break;
    case "views":
      orderBy = [{ viewCount: "desc" }];
      break;
    case "alphabetical":
      orderBy = [{ title: "asc" }];
      break;
    case "trending":
    default:
      orderBy = [{ viewCount: "desc" }, { publishedAt: "desc" }];
      break;
  }

  const [items, total] = await Promise.all([
    prisma.writeup.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        ctfName: true,
        ctfYear: true,
        category: true,
        difficulty: true,
        status: true,
        viewCount: true,
        readTimeMin: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
        tags: {
          include: { tag: true },
        },
        _count: {
          select: { bookmarks: true, stars: true, comments: true },
        },
      },
    }),
    prisma.writeup.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get Author Writeups for Dashboard
 */
export async function getAuthorWriteups(
  authorId: string,
  status?: Status
) {
  const where: Prisma.WriteupWhereInput = { authorId };
  if (status) {
    where.status = status;
  }

  const writeups = await prisma.writeup.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      ctfName: true,
      ctfYear: true,
      category: true,
      difficulty: true,
      status: true,
      viewCount: true,
      readTimeMin: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
      tags: { include: { tag: true } },
      _count: { select: { bookmarks: true } },
    },
  });

  return writeups;
}

/**
 * Increment view count with IP/session rate-limiting
 */
export async function recordWriteupView(writeupId: string, clientIp: string) {
  const rateLimitKey = `view:${writeupId}:${clientIp}`;
  // Allow at most 1 view increment per 30 minutes per IP
  const rateCheck = checkRateLimit(rateLimitKey, 1, 30 * 60 * 1000);

  if (!rateCheck.success) {
    return { incremented: false };
  }

  await prisma.writeup.update({
    where: { id: writeupId },
    data: {
      viewCount: { increment: 1 },
    },
  });

  return { incremented: true };
}

/**
 * Get dashboard overview statistics for author
 */
export async function getAuthorDashboardMetrics(authorId: string) {
  const [writeups, bookmarksCount] = await Promise.all([
    prisma.writeup.findMany({
      where: { authorId },
      select: {
        status: true,
        viewCount: true,
      },
    }),
    prisma.bookmark.count({
      where: { userId: authorId },
    }),
  ]);

  const totalWriteups = writeups.length;
  const totalViews = writeups.reduce((acc, w) => acc + w.viewCount, 0);
  const publishedCount = writeups.filter((w) => w.status === "PUBLIC").length;
  const draftCount = writeups.filter((w) => w.status === "DRAFT").length;
  const unlistedCount = writeups.filter((w) => w.status === "UNLISTED").length;

  return {
    totalWriteups,
    totalViews,
    publishedCount,
    draftCount,
    unlistedCount,
    bookmarksCount,
  };
}
