import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL, SEO_THRESHOLDS } from "@/config/site";
import {
  isIndexable,
  extractCveIds,
  SYNTHETIC_WRITEUP_EXCLUSION_WHERE,
} from "@/lib/seo";
import { getKevVulnerabilities, getRecentCves } from "@/server/cve.service";

// Phase 1: ISR sitemap with 1-hour revalidation and on-demand revalidation
export const revalidate = 3600;

function safeDate(value: Date | string | null | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const defaultBaseline = new Date("2026-11-01T00:00:00Z");

  // Fetch verified real writeups first so we can compute accurate lastModified timestamps
  let writeupRoutes: MetadataRoute.Sitemap = [];
  let latestWriteupDate = defaultBaseline;
  const writeupMentionedCves = new Map<string, Date>();

  try {
    const publicWriteups = await prisma.writeup.findMany({
      where: {
        status: "PUBLIC",
        NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE,
      },
      select: {
        id: true,
        title: true,
        ctfName: true,
        slug: true,
        updatedAt: true,
        contentMd: true,
        excerpt: true,
        status: true,
        isFlagged: true,
        moderationStatus: true,
        indexOverride: true,
        author: {
          select: { username: true, createdAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    });

    const verifiedWriteups = publicWriteups.filter(
      (w) =>
        w.author.username &&
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
    );

    if (verifiedWriteups[0]?.updatedAt) {
      latestWriteupDate = verifiedWriteups[0].updatedAt;
    }

    for (const w of verifiedWriteups) {
      const cves = extractCveIds(`${w.title} ${w.excerpt} ${w.contentMd}`);
      for (const cveId of cves) {
        const existingDate = writeupMentionedCves.get(cveId);
        if (!existingDate || w.updatedAt > existingDate) {
          writeupMentionedCves.set(cveId, w.updatedAt);
        }
      }
    }

    writeupRoutes = verifiedWriteups.map((w) => ({
      url: `${SITE_URL}/w/${w.author.username}/${w.id}`,
      lastModified: w.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch (err) {
    console.warn("[sitemap] Could not fetch writeups for sitemap:", err);
  }

  // Latest event update timestamp for /events
  let latestEventDate = latestWriteupDate;
  try {
    const latestEvent = await prisma.event.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });
    if (latestEvent?.updatedAt) {
      latestEventDate = latestEvent.updatedAt;
    }
  } catch {
    // Non-critical fallback
  }

  // Enriched CVE pages (CISA KEV + enriched catalog + CVEs covered by verified community writeups)
  let cveRoutes: MetadataRoute.Sitemap = [];
  let latestCveDate = defaultBaseline;
  try {
    const [kevList, recentCves] = await Promise.all([
      getKevVulnerabilities(),
      getRecentCves(),
    ]);

    const cveMap = new Map<string, Date>();

    for (const cve of recentCves) {
      if (cve.isKev || (cve.cwes && cve.cwes.length > 0)) {
        const dt = safeDate(cve.publishedDate, defaultBaseline);
        cveMap.set(cve.cveId, dt);
        if (dt > latestCveDate) latestCveDate = dt;
      }
    }

    for (const kev of kevList.slice(0, 100)) {
      if (!kev.cveID) continue;
      const dt = safeDate(kev.dateAdded, defaultBaseline);
      if (!cveMap.has(kev.cveID) || dt > cveMap.get(kev.cveID)!) {
        cveMap.set(kev.cveID, dt);
      }
      if (dt > latestCveDate) latestCveDate = dt;
    }

    for (const [cveId, dt] of writeupMentionedCves.entries()) {
      if (!cveMap.has(cveId) || dt > cveMap.get(cveId)!) {
        cveMap.set(cveId, dt);
      }
      if (dt > latestCveDate) latestCveDate = dt;
    }

    cveRoutes = Array.from(cveMap.entries()).map(([cveId, lastModified]) => ({
      url: `${SITE_URL}/cves/${cveId}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.warn("[sitemap] Could not fetch enriched CVEs for sitemap:", err);
  }

  // Core static indexable public routes (never include /login, /register, or private areas)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: latestWriteupDate,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: latestWriteupDate,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: latestWriteupDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/cves`,
      lastModified: latestCveDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: latestEventDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ctf-sites`,
      lastModified: defaultBaseline,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/browse`,
      lastModified: latestWriteupDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Qualifying Hub routes and author profile routes
  const hubRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = ["web", "pwn", "crypto", "reverse", "forensics", "misc", "osint"];
    const categoryCounts = await prisma.writeup.groupBy({
      by: ["category"],
      where: {
        status: "PUBLIC",
        NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE,
      },
      _count: { id: true },
      _max: { updatedAt: true },
    });
    const catStatsMap = new Map(
      categoryCounts.map((c) => [
        c.category.toLowerCase(),
        { count: c._count.id, lastMod: c._max.updatedAt || latestWriteupDate },
      ])
    );

    for (const cat of categories) {
      const stats = catStatsMap.get(cat);
      if (stats && stats.count >= SEO_THRESHOLDS.MIN_HUB_WRITEUPS) {
        hubRoutes.push({
          url: `${SITE_URL}/category/${cat}`,
          lastModified: stats.lastMod,
          changeFrequency: "daily",
          priority: 0.8,
        });
      }
    }

    // Active authors with at least 1 genuine public writeup
    const activeAuthors = await prisma.user.findMany({
      where: {
        writeups: {
          some: {
            status: "PUBLIC",
            NOT: SYNTHETIC_WRITEUP_EXCLUSION_WHERE,
          },
        },
      },
      select: { username: true, updatedAt: true },
      take: 500,
    });

    for (const author of activeAuthors) {
      if (author.username) {
        hubRoutes.push({
          url: `${SITE_URL}/u/${author.username}`,
          lastModified: author.updatedAt,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch (err) {
    console.warn("[sitemap] Could not fetch hubs for sitemap:", err);
  }

  return [...staticRoutes, ...writeupRoutes, ...cveRoutes, ...hubRoutes];
}
