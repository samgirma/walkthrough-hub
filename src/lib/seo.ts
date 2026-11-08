import type { Metadata } from "next";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SOCIAL_HANDLES,
  SEO_THRESHOLDS,
} from "@/config/site";

export interface BuildMetadataOptions {
  title?: string;
  rawTitle?: string; // If provided, used without suffix template
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  nofollow?: boolean;
  ogType?: "website" | "article" | "profile";
  ogImage?: string;
  ogImageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  twitterCreator?: string;
}

/**
 * Strip Markdown tags, code fences, links, and extra whitespace to plain text.
 */
export function stripMarkdown(markdown: string): string {
  if (!markdown) return "";
  return markdown
    .replace(/```[\s\S]*?```/g, " ") // code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/[*_~]{1,3}(.*?)[*_~]{1,3}/g, "$1") // bold / italics / strikethrough
    .replace(/:::[a-zA-Z0-9_-]*(?:\[.*?\])?/g, "") // custom directives
    .replace(/<\/?[^>]+(>|$)/g, "") // HTML tags
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();
}

/**
 * Truncate text cleanly at a word boundary so titles and descriptions never cut off mid-word.
 */
export function truncateAtWordBoundary(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text;
  const sub = text.slice(0, maxLen);
  const lastSpace = sub.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.6) {
    return sub.slice(0, lastSpace).trim();
  }
  return sub.trim();
}

/**
 * Single source of truth metadata builder across all pages and layouts.
 */
export function buildMetadata(opts: BuildMetadataOptions = {}): Metadata {
  const isNoindex = opts.noindex ?? false;
  const isNofollow = opts.nofollow ?? false;

  const rawTitle = opts.rawTitle || opts.title || SITE_NAME;
  const cleanTitle = truncateAtWordBoundary(rawTitle, SEO_THRESHOLDS.MAX_TITLE_CHARS);

  const rawDesc = opts.description || SITE_DESCRIPTION;
  const cleanDesc = truncateAtWordBoundary(stripMarkdown(rawDesc), SEO_THRESHOLDS.MAX_DESC_CHARS);

  const canonicalUrl = opts.canonicalPath
    ? `${SITE_URL}${opts.canonicalPath.startsWith("/") ? "" : "/"}${opts.canonicalPath}`
    : SITE_URL;

  // Resolve absolute OG image URL
  const rawImage = opts.ogImage || DEFAULT_OG_IMAGE;
  const absoluteOgImage = rawImage.startsWith("http")
    ? rawImage
    : `${SITE_URL}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;

  const imageAlt = opts.ogImageAlt || `${cleanTitle} - ${SITE_NAME}`;

  const metadata: Metadata = {
    title: opts.rawTitle ? opts.rawTitle : cleanTitle,
    description: cleanDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: isNoindex
      ? {
          index: false,
          follow: !isNofollow,
          nocache: true,
          googleBot: {
            index: false,
            follow: !isNofollow,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      title: cleanTitle,
      description: cleanDesc,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "en_US",
      type: opts.ogType || "website",
      images: [
        {
          url: absoluteOgImage,
          width: 1200,
          height: 630,
          alt: imageAlt,
          type: "image/png",
        },
      ],
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
      ...(opts.modifiedTime ? { modifiedTime: opts.modifiedTime } : {}),
      ...(opts.authors ? { authors: opts.authors } : {}),
      ...(opts.tags ? { tags: opts.tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: cleanDesc,
      images: [absoluteOgImage],
      site: SOCIAL_HANDLES.twitter,
      ...(opts.twitterCreator ? { creator: opts.twitterCreator } : {}),
    },
  };

  return metadata;
}

/**
 * UGC Quality & Index Gate evaluator.
 * Determines whether a writeup qualifies for search engine indexation.
 */
export interface WriteupIndexCriteria {
  status: "DRAFT" | "UNLISTED" | "PUBLIC";
  contentMd: string;
  isFlagged?: boolean;
  indexOverride?: "AUTO" | "FORCE_INDEX" | "FORCE_NOINDEX";
  authorCreatedAt?: Date;
}

export function isIndexable(writeup: WriteupIndexCriteria): boolean {
  // 1. Explicit admin overrides take absolute precedence
  if (writeup.indexOverride === "FORCE_NOINDEX") return false;
  if (writeup.indexOverride === "FORCE_INDEX") return true;

  // 2. Only PUBLIC writeups are indexable
  if (writeup.status !== "PUBLIC") return false;

  // 3. Must not be flagged by moderation or spam detection
  if (writeup.isFlagged) return false;

  // 4. Word count check (minimum 300 words)
  const plainText = stripMarkdown(writeup.contentMd || "");
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  if (wordCount < SEO_THRESHOLDS.MIN_WORDS) return false;

  // 5. Heading structure check (must have at least one heading)
  const hasHeading = /^(#{1,6})\s+.+$/m.test(writeup.contentMd || "");
  if (!hasHeading) return false;

  // 6. Author trust check (account age >= 3 days)
  if (writeup.authorCreatedAt) {
    const ageMs = Date.now() - new Date(writeup.authorCreatedAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays < SEO_THRESHOLDS.MIN_AUTHOR_AGE_DAYS) {
      return false;
    }
  }

  return true;
}
