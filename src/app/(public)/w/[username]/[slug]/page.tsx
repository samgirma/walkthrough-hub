import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { Metadata } from "next";
import {
  Clock,
  Eye,
  Calendar,
  Shield,
  FileCode,
  Terminal,
  Download,
  Cpu,
  Layers,
  ArrowLeft,
  Share2,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getWriteupForViewer } from "@/server/writeup.service";
import { renderMarkdown, extractTOC } from "@/lib/markdown";
import { MarkdownViewer } from "@/components/markdown/markdown-viewer";
import { ReadingProgress } from "@/components/writeup/reading-progress";
import { BookmarkButton } from "@/components/writeup/bookmark-button";
import { StarButton } from "@/components/writeup/star-button";
import { CommentsSection } from "@/components/writeup/comments-section";
import { WriteupOwnerActions } from "@/components/writeup/writeup-owner-actions";
import { ShareModal } from "@/components/writeup/share-modal";
import {
  formatDate,
  formatCompactNumber,
  getCategoryColor,
  getDifficultyColor,
} from "@/lib/utils";
import { MobileTOCAccordion } from "./mobile-toc-sheet";
import { WriteupReaderClient } from "./writeup-reader-client";

import { buildMetadata, isIndexable, stripMarkdown } from "@/lib/seo";
import { SITE_URL, SITE_NAME } from "@/config/site";

interface WriteupPageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

// Phase 1: Static/ISR with 1-hour revalidation and on-demand cache tags
export const revalidate = 3600;
export const dynamicParams = true;

/**
 * Pre-generate the top 20 most viewed/popular public writeups at build time
 * Never exposes DRAFT or UNLISTED writeups to build parameters
 */
export async function generateStaticParams() {
  try {
    const topWriteups = await prisma.writeup.findMany({
      where: { status: "PUBLIC" },
      orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
      take: 5,
      select: {
        slug: true,
        author: {
          select: { username: true },
        },
      },
    });

    return topWriteups
      .filter((w) => w.author.username && w.slug)
      .map((w) => ({
        username: w.author.username!,
        slug: w.slug,
      }));
  } catch (err) {
    console.warn("[generateStaticParams] Could not fetch top writeups:", err);
    return [];
  }
}

export async function generateMetadata({
  params,
}: WriteupPageProps): Promise<Metadata> {
  const { username, slug } = await params;
  // Public reader metadata: no session read in metadata to ensure static ISR caching
  const writeup = await getWriteupForViewer({ username, slug });

  // DRAFT status is strictly forbidden from public access
  if (!writeup || writeup.status === "DRAFT") {
    // 1. Check if the author's username changed
    const usernameHist = await prisma.usernameHistory.findFirst({
      where: { oldUsername: username },
      include: { user: { select: { username: true } } },
    });
    if (usernameHist?.user.username) {
      permanentRedirect(`/w/${usernameHist.user.username}/${slug}`);
    }

    // 2. Check if this writeup's slug was updated
    const authorUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (authorUser) {
      const slugHist = await prisma.slugHistory.findFirst({
        where: {
          oldSlug: slug,
          writeup: { authorId: authorUser.id },
        },
        include: {
          writeup: { select: { slug: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      if (slugHist?.writeup && slugHist.writeup.status !== "DRAFT") {
        permanentRedirect(`/w/${username}/${slugHist.writeup.slug}`);
      }
    }

    return buildMetadata({
      title: "Writeup Not Found",
      noindex: true,
      nofollow: true,
    });
  }

  const isUnlisted = writeup.status === "UNLISTED";
  const indexEligible = isUnlisted
    ? false
    : isIndexable({
        status: writeup.status,
        contentMd: writeup.contentMd,
        authorCreatedAt: writeup.author.createdAt,
      });

  const rawTitle = `${writeup.title} - ${writeup.ctfName} writeup`;
  const cleanDesc = writeup.excerpt || stripMarkdown(writeup.contentMd);
  const tags = writeup.tags?.map((t) => t.tag.name) || [];

  return buildMetadata({
    title: rawTitle,
    description: cleanDesc,
    canonicalPath: `/w/${username}/${slug}`,
    noindex: !indexEligible,
    nofollow: false,
    ogType: "article",
    ogImage: `/w/${username}/${slug}/opengraph-image`,
    publishedTime: writeup.publishedAt?.toISOString(),
    modifiedTime: writeup.updatedAt.toISOString(),
    authors: [username],
    tags: [writeup.category, ...tags],
  });
}

export default async function WriteupPage({ params }: WriteupPageProps) {
  const { username, slug } = await params;

  // Zero session read in page root: reads purely public/unlisted writeup for static caching
  const writeup = await getWriteupForViewer({ username, slug });

  // If writeup is not found or is a DRAFT, check history redirects before 404
  if (!writeup || writeup.status === "DRAFT") {
    // 1. Check if the author's username changed
    const usernameHist = await prisma.usernameHistory.findFirst({
      where: { oldUsername: username },
      include: { user: { select: { username: true } } },
    });
    if (usernameHist?.user.username) {
      permanentRedirect(`/w/${usernameHist.user.username}/${slug}`);
    }

    // 2. Check if this writeup's slug was updated
    const authorUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (authorUser) {
      const slugHist = await prisma.slugHistory.findFirst({
        where: {
          oldSlug: slug,
          writeup: { authorId: authorUser.id },
        },
        include: {
          writeup: { select: { slug: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      if (slugHist?.writeup && slugHist.writeup.status !== "DRAFT") {
        permanentRedirect(`/w/${username}/${slugHist.writeup.slug}`);
      }
    }

    notFound();
  }

  // Render markdown with Shiki & sanitize (shifts markdown headings to h2 so the title is the single h1)
  const htmlContent = await renderMarkdown(writeup.contentMd);
  const toc = extractTOC(writeup.contentMd);

  const categoryStyle = getCategoryColor(writeup.category);
  const difficultyStyle = getDifficultyColor(writeup.difficulty);
  const canonicalUrl = `${SITE_URL}/w/${username}/${slug}`;
  const ogImageUrl = `${SITE_URL}/w/${username}/${slug}/opengraph-image`;
  const cleanDesc = writeup.excerpt || stripMarkdown(writeup.contentMd).slice(0, 155);

  // Server-rendered structured data (JSON-LD)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: writeup.title,
    description: cleanDesc,
    image: [ogImageUrl],
    datePublished: writeup.publishedAt
      ? writeup.publishedAt.toISOString()
      : writeup.createdAt.toISOString(),
    dateModified: writeup.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: writeup.author.username || "anonymous",
      url: `${SITE_URL}/u/${writeup.author.username || "anonymous"}`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Explore",
        item: `${SITE_URL}/explore`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: writeup.ctfName,
        item: `${SITE_URL}/explore?q=${encodeURIComponent(writeup.ctfName)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: writeup.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <div className="relative w-full min-h-screen bg-transparent pb-32 lg:pb-24">
      {/* Structured Data: Article & BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd]).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      {/* Top Reading Progress Bar */}
      <ReadingProgress />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center justify-between gap-4 mb-6 text-xs font-mono text-[#94A3B8]"
        >
          <div className="flex items-center gap-2">
            <Link
              href="/explore"
              className="flex items-center gap-1.5 hover:text-white transition-colors min-h-[36px]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Explorer</span>
            </Link>
            <span className="text-[#3A4252]">/</span>
            <span className="text-white truncate max-w-[200px] sm:max-w-none">
              {writeup.ctfName}
            </span>
          </div>

          {writeup.status === "UNLISTED" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              UNLISTED // DIRECT LINK ONLY
            </span>
          )}
        </nav>

        {/* Layout Grid: Sticky TOC on lg+, single column on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT STICKY SIDEBAR: TOC & Challenge Files (lg+ only) */}
          <aside className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col gap-6 sticky top-24 self-start">
            {/* Table of Contents Container */}
            <nav
              aria-label="Table of contents"
              className="p-4 rounded-xl border border-[#242936] bg-[#12151C]/80 backdrop-blur-md shadow-md flex flex-col gap-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#242936]/60">
                <span className="font-mono text-xs uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5 font-semibold">
                  <FileCode className="h-3.5 w-3.5 text-primary" />
                  <span>Contents</span>
                </span>
                <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                  {toc.length} sections
                </span>
              </div>

              <div className="flex flex-col gap-1 text-xs font-mono">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`py-1 text-[#BACAC1] hover:text-white transition-colors truncate ${
                      item.level === 2 ? "pl-2" : item.level >= 3 ? "pl-4" : ""
                    }`}
                  >
                    <span>{item.title}</span>
                  </a>
                ))}
                {toc.length === 0 && (
                  <span className="text-[#475569] text-xs">
                    No sections defined.
                  </span>
                )}
              </div>
            </nav>

            {/* Challenge Artifacts Widget */}
            <div className="p-4 rounded-xl border border-[#242936] bg-[#12151C] shadow-md flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#242936]/60 font-mono text-xs">
                <span className="uppercase text-[#94A3B8] font-semibold flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-secondary" />
                  <span>Challenge Files</span>
                </span>
                <span className="text-[10px] text-[#475569]">SHA256</span>
              </div>

              <div className="flex flex-col gap-2 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-[#0B0D12] border border-[#242936] flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="h-4 w-4 text-[#475569] shrink-0" />
                    <div className="flex flex-col truncate">
                      <span className="text-white text-xs truncate">target.elf</span>
                      <span className="text-[10px] text-[#475569]">ELF 64-bit • stripped</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Target binary"
                    className="p-1 text-[#94A3B8] hover:text-[#22D3A0] transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0B0D12] border border-[#242936] flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <Cpu className="h-4 w-4 text-[#475569] shrink-0" />
                    <div className="flex flex-col truncate">
                      <span className="text-white text-xs truncate">solve.py</span>
                      <span className="text-[10px] text-[#475569]">Python PoC • verified</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Exploit PoC"
                    className="p-1 text-[#94A3B8] hover:text-[#22D3A0] transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Environment Telemetry Pill */}
            <div className="p-4 rounded-xl border border-[#242936] bg-[#0B0D12] flex flex-col gap-2.5 font-mono text-xs">
              <span className="text-[10px] uppercase text-[#475569] tracking-wider font-semibold">
                Environment Telemetry
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#12151C] p-2 rounded border border-[#242936]/60">
                  <span className="text-[#475569] block text-[10px]">ARCH</span>
                  <span className="text-white font-semibold">x86_64</span>
                </div>
                <div className="bg-[#12151C] p-2 rounded border border-[#242936]/60">
                  <span className="text-[#475569] block text-[10px]">SECURITY</span>
                  <span className="text-primary font-semibold">SMEP/SMAP</span>
                </div>
                <div className="bg-[#12151C] p-2 rounded border border-[#242936]/60">
                  <span className="text-[#475569] block text-[10px]">ALLOC</span>
                  <span className="text-white font-semibold">SLUB</span>
                </div>
                <div className="bg-[#12151C] p-2 rounded border border-[#242936]/60">
                  <span className="text-[#475569] block text-[10px]">FLAG STATUS</span>
                  <span className="text-secondary font-semibold">Decrypted</span>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN ARTICLE & CONTENT (lg:col-span-8 xl:col-span-9) */}
          <article className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 min-w-0 w-full">
            {/* Mobile Collapsible TOC Accordion at top of article */}
            <MobileTOCAccordion toc={toc} />

            {/* Main Article Header Card */}
            <header className="p-4 sm:p-8 rounded-xl border border-[#242936] bg-[#12151C]/92 backdrop-blur-md shadow-lg">
              {/* Category & CTF Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className="vt-writeup-category font-mono text-xs font-semibold px-2.5 py-0.5 rounded border"
                  style={{
                    backgroundColor: categoryStyle.bg,
                    borderColor: categoryStyle.border,
                    color: categoryStyle.color,
                  }}
                >
                  {writeup.category}
                </span>

                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#BACAC1] px-2.5 py-0.5 rounded bg-[#181C25] border border-[#242936]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${difficultyStyle.dot}`}
                  />
                  <span>{writeup.difficulty}</span>
                </span>

                <span className="font-mono text-xs text-[#94A3B8] ml-auto">
                  {writeup.ctfName} &apos;{String(writeup.ctfYear).slice(-2)}
                </span>
              </div>

              {/* Title (Single H1 on page) */}
              <h1 className="vt-writeup-title font-sans font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight mb-4">
                {writeup.title}
              </h1>

              {/* Excerpt */}
              <p className="font-sans text-sm sm:text-base text-[#BACAC1] leading-relaxed mb-6">
                {writeup.excerpt}
              </p>

              {/* Meta bar & Actions */}
              <div className="pt-4 border-t border-[#242936]/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#94A3B8]">
                {/* Author Info */}
                <Link
                  href={`/u/${writeup.author.username || "anonymous"}`}
                  className="flex items-center gap-2.5 group hover:text-white transition-colors"
                >
                  {writeup.author.avatarUrl ? (
                    <Image
                      src={writeup.author.avatarUrl}
                      alt={writeup.author.username || "Author"}
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#181C25] text-primary flex items-center justify-center font-bold text-xs">
                      {(writeup.author.username || "A")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-white font-semibold group-hover:text-primary transition-colors">
                      @{writeup.author.username || "anonymous"}
                    </span>
                    <span className="text-[10px] text-[#475569]">
                      Author // Research Op
                    </span>
                  </div>
                </Link>

                {/* Telemetry info (views, read time, date) */}
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#475569]" />
                    <span>{writeup.readTimeMin} min read</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-[#475569]" />
                    <span>{formatCompactNumber(writeup.viewCount)} views</span>
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#475569]" />
                    <time
                      dateTime={
                        writeup.publishedAt
                          ? writeup.publishedAt.toISOString()
                          : writeup.createdAt.toISOString()
                      }
                    >
                      {formatDate(writeup.publishedAt || writeup.createdAt)}
                    </time>
                  </span>
                </div>

                {/* Action Buttons: Client islands */}
                <div className="flex items-center gap-2 ml-auto sm:ml-0 flex-wrap">
                  <WriteupOwnerActions
                    authorId={writeup.author.id}
                    writeupId={writeup.id}
                  />
                  <StarButton
                    writeupId={writeup.id}
                    initialStarsCount={writeup._count?.stars || 0}
                  />
                  <BookmarkButton writeupId={writeup.id} />
                  <ShareModal title={writeup.title} url={canonicalUrl} />
                </div>
              </div>
            </header>

            {/* Markdown Body Article Section */}
            <section
              aria-label="Writeup Content"
              className="p-4 sm:p-8 lg:p-10 rounded-xl border border-[#242936] bg-[#12151C] shadow-md max-w-full overflow-hidden"
            >
              <MarkdownViewer htmlContent={htmlContent} />
            </section>

            {/* Author Footer Bio Card Section */}
            <section
              aria-label="Author Profile"
              className="p-4 sm:p-6 rounded-xl border border-[#242936] bg-[#12151C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                {writeup.author.avatarUrl ? (
                  <Image
                    src={writeup.author.avatarUrl}
                    alt={writeup.author.username || "Author"}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border border-[#242936]"
                    unoptimized
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#181C25] text-primary flex items-center justify-center font-bold text-sm">
                    {(writeup.author.username || "A").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-sans font-bold text-base text-white">
                    @{writeup.author.username || "anonymous"}
                  </span>
                  <p className="font-sans text-xs text-[#94A3B8] max-w-md">
                    {writeup.author.bio || "Security researcher & CTF author."}
                  </p>
                </div>
              </div>

              <Link
                href={`/u/${writeup.author.username || "anonymous"}`}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#181C25] hover:bg-[#1D2027] text-xs font-mono text-[#BACAC1] hover:text-white border border-[#242936] transition-colors flex items-center justify-center gap-1.5 shrink-0 min-h-[44px]"
              >
                <span>View Researcher Profile</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </section>

            {/* Comments & Discussion Section */}
            <CommentsSection
              writeupId={writeup.id}
              writeupAuthorId={writeup.author.id}
              initialCommentsCount={writeup._count?.comments || 0}
            />
          </article>
        </div>
      </div>

      {/* Mobile Reader Interactive Experience */}
      <WriteupReaderClient
        writeupId={writeup.id}
        initialStarsCount={writeup._count?.stars || 0}
        title={writeup.title}
        url={canonicalUrl}
        toc={toc}
      />
    </div>
  );
}
