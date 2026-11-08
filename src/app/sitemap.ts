import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL, SEO_THRESHOLDS } from "@/config/site";
import { isIndexable } from "@/lib/seo";
import { getKevVulnerabilities } from "@/server/cve.service";

// Phase 1: ISR sitemap with 1-hour revalidation and on-demand revalidation
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // Static indexable public routes (never include /login, /register, or private areas)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/cves`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ctf-sites`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/browse`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Hub routes and author profile routes
  let hubRoutes: MetadataRoute.Sitemap = [];
  try {
    // 1. Category Hubs with at least SEO_THRESHOLDS.MIN_HUB_WRITEUPS public writeups
    const categories = ["web", "pwn", "crypto", "reverse", "forensics", "misc", "osint"];
    const categoryCounts = await prisma.writeup.groupBy({
      by: ["category"],
      where: { status: "PUBLIC" },
      _count: { id: true },
    });
    const catCountMap = new Map(categoryCounts.map((c) => [c.category.toLowerCase(), c._count.id]));

    for (const cat of categories) {
      if ((catCountMap.get(cat) || 0) >= SEO_THRESHOLDS.MIN_HUB_WRITEUPS) {
        hubRoutes.push({
          url: `${SITE_URL}/category/${cat}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.8,
        });
      }
    }

    // 2. Author profiles with at least 1 public writeup
    const activeAuthors = await prisma.user.findMany({
      where: {
        writeups: { some: { status: "PUBLIC" } },
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

  // Dynamic public indexable writeups
  let writeupRoutes: MetadataRoute.Sitemap = [];
  try {
    const publicWriteups = await prisma.writeup.findMany({
      where: { status: "PUBLIC" },
      select: {
        slug: true,
        updatedAt: true,
        contentMd: true,
        status: true,
        author: {
          select: { username: true, createdAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    });

    writeupRoutes = publicWriteups
      .filter((w) =>
        w.author.username &&
        isIndexable({
          status: w.status,
          contentMd: w.contentMd,
          authorCreatedAt: w.author.createdAt,
        })
      )
      .map((w) => ({
        url: `${SITE_URL}/w/${w.author.username}/${w.slug}`,
        lastModified: w.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      }));
  } catch (err) {
    console.warn("[sitemap] Could not fetch writeups for sitemap:", err);
  }

  // Include indexable CVEs (only KEV-listed or community-researched vulnerabilities)
  let cveRoutes: MetadataRoute.Sitemap = [];
  try {
    const kevList = await getKevVulnerabilities();
    cveRoutes = kevList.slice(0, 100).map((cve) => ({
      url: `${SITE_URL}/cves/${cve.cveID}`,
      lastModified: cve.dateAdded ? new Date(cve.dateAdded) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (err) {
    console.warn("[sitemap] Could not fetch KEV list for sitemap:", err);
  }

  return [...staticRoutes, ...hubRoutes, ...writeupRoutes, ...cveRoutes];
}
