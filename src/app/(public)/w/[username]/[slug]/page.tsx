import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import { auth } from "@/lib/auth";
import { getWriteupByAuthorAndSlug } from "@/server/writeup.service";
import { isBookmarked } from "@/server/bookmark.service";
import { renderMarkdown, extractTOC } from "@/lib/markdown";
import { MarkdownViewer } from "@/components/markdown/markdown-viewer";
import { ReadingProgress } from "@/components/writeup/reading-progress";
import { BookmarkButton } from "@/components/writeup/bookmark-button";
import { ShareModal } from "@/components/writeup/share-modal";
import {
  formatDate,
  formatCompactNumber,
  getCategoryColor,
  getDifficultyColor,
} from "@/lib/utils";

interface WriteupPageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: WriteupPageProps): Promise<Metadata> {
  const { username, slug } = await params;
  const session = await auth();
  const writeup = await getWriteupByAuthorAndSlug(
    username,
    slug,
    session?.user?.id
  );

  if (!writeup) {
    return {
      title: "Writeup Not Found | WriteupHub",
    };
  }

  const isUnlisted = writeup.status === "UNLISTED";
  const url = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/w/${username}/${slug}`;

  return {
    title: `${writeup.title} // ${writeup.ctfName} Writeup`,
    description: writeup.excerpt,
    alternates: {
      canonical: url,
    },
    robots: isUnlisted
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "article",
      title: `${writeup.title} | WriteupHub`,
      description: writeup.excerpt,
      url,
      publishedTime: writeup.publishedAt?.toISOString(),
      authors: [username],
      images: [
        {
          url: `${url}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: writeup.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: writeup.title,
      description: writeup.excerpt,
      images: [`${url}/opengraph-image`],
    },
  };
}

export default async function WriteupPage({ params }: WriteupPageProps) {
  const { username, slug } = await params;
  const session = await auth();

  const writeup = await getWriteupByAuthorAndSlug(
    username,
    slug,
    session?.user?.id
  );

  if (!writeup) {
    notFound();
  }

  // Check if current authenticated user has bookmarked this writeup
  const bookmarked = session?.user?.id
    ? await isBookmarked(session.user.id, writeup.id)
    : false;

  // Render markdown with Shiki & sanitize
  const htmlContent = await renderMarkdown(writeup.contentMd);
  const toc = extractTOC(writeup.contentMd);

  const categoryStyle = getCategoryColor(writeup.category);
  const difficultyStyle = getDifficultyColor(writeup.difficulty);
  const currentUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/w/${username}/${slug}`;

  return (
    <div className="relative w-full min-h-screen bg-[#0B0D12] pb-24">
      {/* Top Reading Progress Bar */}
      <ReadingProgress />

      <div className="max-w-7xl mx-auto px-6 pt-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6 text-xs font-mono text-[#94A3B8]">
          <Link
            href="/explore"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Explorer</span>
          </Link>

          {writeup.status === "UNLISTED" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              UNLISTED // ZERO-AUTH LINK ACCESS
            </span>
          )}

          {writeup.status === "DRAFT" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 font-semibold text-[11px]">
              DRAFT // AUTHOR ONLY
            </span>
          )}
        </div>

        {/* 3-Column Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT STICKY SIDEBAR: TOC & Challenge Files (3 cols) */}
          <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 sticky top-24 self-start">
            {/* Table of Contents Container */}
            <nav
              aria-label="Table of contents"
              className="p-4 rounded-xl border border-[#242936] bg-[#12151C] shadow-md flex flex-col gap-3"
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
                {toc.map((item, idx) => (
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

          {/* MAIN ARTICLE & CONTENT (9 cols) */}
          <main className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Document Area */}
            <div className="p-6 sm:p-8 rounded-xl border border-[#242936] bg-[#12151C] shadow-lg">
              {/* Category & CTF Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded border"
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

              {/* Title */}
              <h1 className="font-sans font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight mb-4">
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
                  href={`/u/${writeup.author.username}`}
                  className="flex items-center gap-2.5 group hover:text-white transition-colors"
                >
                  {writeup.author.avatarUrl ? (
                    <img
                      src={writeup.author.avatarUrl}
                      alt={writeup.author.username}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#181C25] text-primary flex items-center justify-center font-bold text-xs">
                      {writeup.author.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-white font-semibold group-hover:text-primary transition-colors">
                      @{writeup.author.username}
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
                  {writeup.publishedAt && (
                    <span className="hidden sm:flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#475569]" />
                      <span>{formatDate(writeup.publishedAt)}</span>
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                  <BookmarkButton
                    writeupId={writeup.id}
                    initialBookmarked={bookmarked}
                    userId={session?.user?.id}
                  />
                  <ShareModal title={writeup.title} url={currentUrl} />
                </div>
              </div>
            </div>

            {/* Markdown Body Article */}
            <div className="p-6 sm:p-10 rounded-xl border border-[#242936] bg-[#12151C] shadow-md">
              <MarkdownViewer htmlContent={htmlContent} />
            </div>

            {/* Author Footer Bio Card */}
            <div className="p-6 rounded-xl border border-[#242936] bg-[#12151C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {writeup.author.avatarUrl ? (
                  <img
                    src={writeup.author.avatarUrl}
                    alt={writeup.author.username}
                    className="w-12 h-12 rounded-full object-cover border border-[#242936]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#181C25] text-primary flex items-center justify-center font-bold text-sm">
                    {writeup.author.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-sans font-bold text-base text-white">
                    @{writeup.author.username}
                  </span>
                  <p className="font-sans text-xs text-[#94A3B8] max-w-md">
                    {writeup.author.bio || "Security researcher & CTF author."}
                  </p>
                </div>
              </div>

              <Link
                href={`/u/${writeup.author.username}`}
                className="px-4 py-2 rounded-lg bg-[#181C25] hover:bg-[#1D2027] text-xs font-mono text-[#BACAC1] hover:text-white border border-[#242936] transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>View Researcher Profile</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
