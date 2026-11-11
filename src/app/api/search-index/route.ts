import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { SYNTHETIC_WRITEUP_EXCLUSION_WHERE } from "@/lib/seo";

export const revalidate = 3600;

export interface SearchDoc {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  tags: string[];
  snippet: string;
}

const getCachedSearchIndex = unstable_cache(
  async (): Promise<SearchDoc[]> => {
    const writeups = await prisma.writeup.findMany({
      where: {
        status: "PUBLIC",
        NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        excerpt: true,
        author: {
          select: {
            username: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    return writeups.map((w) => ({
      id: w.id,
      title: w.title,
      slug: w.slug,
      category: w.category,
      author: w.author.username || "anonymous",
      tags: w.tags.map((t) => t.tag.name),
      snippet: (w.excerpt || "").slice(0, 90),
    }));
  },
  ["search-index-data"],
  {
    revalidate: 3600,
    tags: ["search-index"],
  }
);

export async function GET() {
  try {
    const data = await getCachedSearchIndex();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[search-index] Error generating index:", error);
    return NextResponse.json({ error: "Failed to load search index" }, { status: 500 });
  }
}
