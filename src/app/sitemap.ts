import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Phase 1: ISR sitemap with 1-hour revalidation and on-demand revalidation
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cves`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic public writeups (only PUBLIC status!)
  let writeupRoutes: MetadataRoute.Sitemap = [];
  try {
    const publicWriteups = await prisma.writeup.findMany({
      where: { status: "PUBLIC" },
      select: {
        slug: true,
        updatedAt: true,
        author: {
          select: { username: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    });

    writeupRoutes = publicWriteups.map((w) => ({
      url: `${baseUrl}/w/${w.author.username}/${w.slug}`,
      lastModified: w.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    // If DB is unreachable during build or cold start, proceed with static routes
    console.warn("Could not fetch writeups for sitemap:", err);
  }

  return [...staticRoutes, ...writeupRoutes];
}
