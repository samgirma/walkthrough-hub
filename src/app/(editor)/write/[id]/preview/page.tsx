import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  ArrowLeft,
  Share2,
  Bookmark,
  ExternalLink,
  PenLine,
  AlertTriangle,
} from "lucide-react";
import { requireWriteupOwner } from "@/server/auth/dal";
import { getWriteupByIdForAuthor } from "@/server/writeup.service";
import { renderMarkdown, extractTOC } from "@/lib/markdown";
import { MarkdownViewer } from "@/components/markdown/markdown-viewer";
import { ReadingProgress } from "@/components/writeup/reading-progress";
import {
  formatDate,
  formatCompactNumber,
  getCategoryColor,
  getDifficultyColor,
} from "@/lib/utils";
import { MobileTOCAccordion } from "@/app/(public)/w/[username]/[slug]/mobile-toc-sheet";

interface DraftPreviewPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Draft Preview // WriteupHub Studio",
  robots: { index: false, follow: false },
};

export default async function DraftPreviewPage({
  params,
}: DraftPreviewPageProps) {
  const { id } = await params;
  const { user } = await requireWriteupOwner(id);
  const writeup = await getWriteupByIdForAuthor(id, user.id);

  if (!writeup) {
    notFound();
  }

  const htmlContent = await renderMarkdown(writeup.contentMd);
  const toc = extractTOC(writeup.contentMd);

  const categoryStyle = getCategoryColor(writeup.category);
  const difficultyStyle = getDifficultyColor(writeup.difficulty);

  return (
    <div className="relative w-full min-h-screen bg-[#0B0D12] text-[#E0E2EC] pb-32 lg:pb-24">
      <ReadingProgress />

      {/* Top Warning Banner for Draft */}
      <div className="w-full bg-purple-950/60 border-b border-purple-500/30 px-4 py-2.5 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-purple-300">
            <AlertTriangle className="h-4 w-4 text-purple-400 shrink-0" />
            <span className="font-semibold">
              DRAFT PREVIEW MODE // Strictly Private to Author (@{user.username})
            </span>
          </div>
          <Link
            href={`/write/${writeup.id}`}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-colors"
          >
            <PenLine className="h-3 w-3" />
            <span>Return to Editor</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between gap-4 mb-6 text-xs font-mono text-[#94A3B8]">
          <Link
            href={`/write/${writeup.id}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors min-h-[36px]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Editor</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            STATUS: {writeup.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* TOC Sidebar */}
          <aside className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col gap-6 sticky top-24 self-start">
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
              </div>
            </nav>
          </aside>

          {/* Main Article */}
          <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 min-w-0 w-full">
            <MobileTOCAccordion toc={toc} />

            <div className="p-4 sm:p-8 rounded-xl border border-[#242936] bg-[#12151C]/92 backdrop-blur-md shadow-lg">
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

              <h1 className="font-sans font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight mb-4">
                {writeup.title}
              </h1>

              <p className="font-sans text-sm sm:text-base text-[#BACAC1] leading-relaxed mb-6">
                {writeup.excerpt}
              </p>

              <div className="pt-4 border-t border-[#242936]/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#94A3B8]">
                <div className="flex items-center gap-2.5">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.username || "Author"}
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#181C25] text-primary flex items-center justify-center font-bold text-xs">
                      {(user.username || "A")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-white font-semibold">
                    @{user.username || "author"}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#475569]" />
                    <span>{writeup.readTimeMin} min read</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-8 lg:p-10 rounded-xl border border-[#242936] bg-[#12151C] shadow-md max-w-full overflow-hidden">
              <MarkdownViewer htmlContent={htmlContent} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
