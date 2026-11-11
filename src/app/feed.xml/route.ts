import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/config/site";
import { SYNTHETIC_WRITEUP_EXCLUSION_WHERE } from "@/lib/seo";

// Phase 1: ISR RSS feed with 1-hour revalidation
export const revalidate = 3600;

export async function GET() {
  const baseUrl = SITE_URL;

  let writeups: any[] = [];
  try {
    writeups = await prisma.writeup.findMany({
      where: {
        status: "PUBLIC",
        NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE,
      },
      orderBy: { publishedAt: "desc" },
      take: 50,
      include: {
        author: {
          select: { username: true },
        },
      },
    });
  } catch (err) {
    console.warn("Could not query writeups for RSS feed:", err);
  }

  const rssItems = writeups
    .map((w) => {
      const link = `${baseUrl}/w/${w.author.username}/${w.id || w.slug}`;
      const pubDate = w.publishedAt ? new Date(w.publishedAt).toUTCString() : new Date().toUTCString();
      const escapedTitle = w.title
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const escapedExcerpt = w.excerpt
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      return `
    <item>
      <title>${escapedTitle}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${escapedExcerpt}</description>
      <category>${w.category}</category>
      <author>${w.author.username}</author>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>WriteupHub // CTF &amp; Exploit Analysis Feed</title>
    <link>${baseUrl}</link>
    <description>Latest peer-reviewed CTF writeups, zero-day research, and offensive engineering solutions.</description>
    <language>en</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
    },
  });
}
