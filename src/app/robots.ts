import { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const allowAi = process.env.AI_BOTS_ALLOWED !== "false";

  const standardRules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: [
        "/",
        "/explore",
        "/w/",
        "/u/",
        "/cves",
        "/events",
        "/ctf-sites",
        "/category/",
        "/ctf/",
        "/tag/",
        "/feed.xml",
        "/sitemap.xml",
        "/sitemap/",
        "/robots.txt",
        "/login",
        "/register",
      ],
      disallow: [
        "/api/",
        "/dashboard/",
        "/write/",
        "/settings/",
        "/onboarding/",
      ],
    },
  ];

  // Configurable AI-crawler policy (default allowed, opt-out via AI_BOTS_ALLOWED="false")
  if (!allowAi) {
    const aiBots = [
      "GPTBot",
      "ChatGPT-User",
      "CCBot",
      "anthropic-ai",
      "Claude-Web",
      "Google-Extended",
      "Bytespider",
    ];

    standardRules.push({
      userAgent: aiBots,
      disallow: ["/"],
    });
  }

  return {
    rules: standardRules,
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
