import { prisma } from "@/lib/prisma";
import { Category, Role, Status } from "@prisma/client";

export interface AdminStats {
  totalUsers: number;
  adminUsers: number;
  totalWriteups: number;
  publicWriteups: number;
  unlistedWriteups: number;
  draftWriteups: number;
  totalViews: number;
  totalBookmarks: number;
  categoryDistribution: { category: Category; count: number }[];
}

export interface AdminUserListItem {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  role: Role;
  avatarUrl: string | null;
  image: string | null;
  createdAt: Date;
  writeupCount: number;
  bookmarkCount: number;
  accountCount: number;
}

export interface AdminWriteupListItem {
  id: string;
  title: string;
  slug: string;
  ctfName: string;
  ctfYear: number;
  category: Category;
  difficulty: string;
  status: Status;
  viewCount: number;
  readTimeMin: number;
  createdAt: Date;
  publishedAt: Date | null;
  author: {
    id: string;
    username: string | null;
    name: string | null;
    avatarUrl: string | null;
    image: string | null;
  };
  tags: string[];
  bookmarkCount: number;
}

/**
 * Platform-wide system metrics for administrators.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const [
    totalUsers,
    adminUsers,
    totalWriteups,
    publicWriteups,
    unlistedWriteups,
    draftWriteups,
    viewSum,
    totalBookmarks,
    categoryGroups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.writeup.count(),
    prisma.writeup.count({ where: { status: "PUBLIC" } }),
    prisma.writeup.count({ where: { status: "UNLISTED" } }),
    prisma.writeup.count({ where: { status: "DRAFT" } }),
    prisma.writeup.aggregate({ _sum: { viewCount: true } }),
    prisma.bookmark.count(),
    prisma.writeup.groupBy({
      by: ["category"],
      _count: { id: true },
    }),
  ]);

  const categoryDistribution = categoryGroups.map((g) => ({
    category: g.category,
    count: g._count.id,
  }));

  return {
    totalUsers,
    adminUsers,
    totalWriteups,
    publicWriteups,
    unlistedWriteups,
    draftWriteups,
    totalViews: viewSum._sum.viewCount || 0,
    totalBookmarks,
    categoryDistribution,
  };
}

/**
 * Paginated and searchable users list for admin operations.
 */
export async function getAdminUsers(params?: {
  search?: string;
  role?: Role;
  limit?: number;
  skip?: number;
}): Promise<{ users: AdminUserListItem[]; total: number }> {
  const search = params?.search?.trim();
  const role = params?.role;
  const limit = Math.min(params?.limit ?? 50, 100);
  const skip = params?.skip ?? 0;

  const where = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rawUsers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            writeups: true,
            bookmarks: true,
            accounts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.user.count({ where }),
  ]);

  const users: AdminUserListItem[] = rawUsers.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatarUrl,
    image: u.image,
    createdAt: u.createdAt,
    writeupCount: u._count.writeups,
    bookmarkCount: u._count.bookmarks,
    accountCount: u._count.accounts,
  }));

  return { users, total };
}

/**
 * Platform-wide writeups list for content moderation.
 */
export async function getAdminWriteups(params?: {
  search?: string;
  status?: Status;
  category?: Category;
  limit?: number;
  skip?: number;
}): Promise<{ writeups: AdminWriteupListItem[]; total: number }> {
  const search = params?.search?.trim();
  const status = params?.status;
  const category = params?.category;
  const limit = Math.min(params?.limit ?? 50, 100);
  const skip = params?.skip ?? 0;

  const where = {
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
            { ctfName: { contains: search, mode: "insensitive" as const } },
            { author: { username: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [rawWriteups, total] = await Promise.all([
    prisma.writeup.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        ctfName: true,
        ctfYear: true,
        category: true,
        difficulty: true,
        status: true,
        viewCount: true,
        readTimeMin: true,
        createdAt: true,
        publishedAt: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
            image: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: { name: true },
            },
          },
        },
        _count: {
          select: { bookmarks: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.writeup.count({ where }),
  ]);

  const writeups: AdminWriteupListItem[] = rawWriteups.map((w) => ({
    id: w.id,
    title: w.title,
    slug: w.slug,
    ctfName: w.ctfName,
    ctfYear: w.ctfYear,
    category: w.category,
    difficulty: w.difficulty,
    status: w.status,
    viewCount: w.viewCount,
    readTimeMin: w.readTimeMin,
    createdAt: w.createdAt,
    publishedAt: w.publishedAt,
    author: w.author,
    tags: w.tags.map((t) => t.tag.name),
    bookmarkCount: w._count.bookmarks,
  }));

  return { writeups, total };
}
