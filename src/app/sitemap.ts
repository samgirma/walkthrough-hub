import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/config/site";
import { isIndexable } from "@/lib/seo";
import { getKevVulnerabilities } from "@/server/cve.service";

// Phase 1: ISR sitemap with 1-hour revalidation and on-demand revalidation
export const revalidate = 3600;

export async function generateSitemaps() {
  // Support sitemap chunking up to 10,000 URLs per file
  try {
    const totalCount = await prisma.writeup.count({
      where: { status: "PUBLIC" },
    });
    const chunks = Math.max(1, Math.ceil(totalCount / 10000));
    return Array.from({ length: chunks }, (_, i) => ({ id: i }));
  } catch {
    return [{ id: 0 }];
  }
}

export default async function sitemap({
  id,
}: {
  id?: number;
}): Promise<MetadataRoute.Sitemap> {
  const chunkId = Number(id || 0);
  const pageSize = 10000;

  // Static indexable public routes (never include /login, /register, or private areas)
  const staticRoutes: MetadataRoute.Sitemap = chunkId === 0
    ? [
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
      ]
    : [];

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
      skip: chunkId * pageSize,
      take: pageSize,
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
  if (chunkId === 0) {
    try {
      const kevList = await getKevVulnerabilities();
      cveRoutes = kevList.slice(0, 50).map((cve) => ({
        url: `${SITE_URL}/cves/${cve.cveID}`,
        lastModified: cve.dateAdded ? new Date(cve.dateAdded) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    } catch (err) {
      console.warn("[sitemap] Could not fetch KEV list for sitemap:", err);
    }
  }

  return [...staticRoutes, ...writeupRoutes, ...cveRoutes];
}
