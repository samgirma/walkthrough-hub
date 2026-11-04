import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Terminal,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { WriteupCard } from "@/components/writeup/writeup-card";
import { ExploreFilterSheet } from "@/app/(public)/explore/explore-filter-sheet";
import { getPublicWriteups } from "@/server/writeup.service";
import { CategoryType, DifficultyType } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore CTF Writeups // Real-time Exploit Directory",
  description:
    "Search, filter, and dissect real-world capture-the-flag writeups, zero-day research, and offensive engineering solutions.",
};

interface ExplorePageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    difficulty?: string;
    ctfName?: string;
    ctfYear?: string;
    tag?: string;
    sort?: "trending" | "latest" | "views" | "alphabetical";
    page?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;

  const currentCategory = (params.category?.toUpperCase() || "") as CategoryType | "";
  const currentDifficulty = (params.difficulty?.toUpperCase() || "") as DifficultyType | "";
  const currentSort = params.sort || "trending";
  const currentPage = parseInt(params.page || "1", 10);
  const currentSearch = params.search || "";
  const currentTag = params.tag || "";
  const currentCtf = params.ctfName || "";

  const result = await getPublicWriteups({
    search: currentSearch,
    category: currentCategory || undefined,
    difficulty: currentDifficulty || undefined,
    ctfName: currentCtf || undefined,
    tag: currentTag || undefined,
    sort: currentSort,
    page: currentPage,
    limit: 12,
  });

  const categories = [
    { label: "All Categories", value: "" },
    { label: "Web", value: "WEB", color: "#38BDF8" },
    { label: "Pwn", value: "PWN", color: "#F43F5E" },
    { label: "Crypto", value: "CRYPTO", color: "#A855F7" },
    { label: "Reverse", value: "REVERSE", color: "#FB923C" },
    { label: "Forensics", value: "FORENSICS", color: "#14B8A6" },
    { label: "Misc", value: "MISC", color: "#94A3B8" },
    { label: "OSINT", value: "OSINT", color: "#EAB308" },
  ];

  const difficulties = [
    { label: "Easy", value: "EASY", color: "bg-emerald-500" },
    { label: "Med", value: "MEDIUM", color: "bg-amber-500" },
    { label: "Hard", value: "HARD", color: "bg-red-500" },
    { label: "Insane", value: "INSANE", color: "bg-pink-500" },
  ];

  const buildUrl = (updates: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    const merged = {
      search: currentSearch || undefined,
      category: currentCategory || undefined,
      difficulty: currentDifficulty || undefined,
      ctfName: currentCtf || undefined,
      tag: currentTag || undefined,
      sort: currentSort !== "trending" ? currentSort : undefined,
      page: currentPage > 1 ? currentPage : undefined,
      ...updates,
    };

    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "") {
        q.set(k, String(v));
      }
    }

    return `/explore${q.toString() ? `?${q.toString()}` : ""}`;
  };

  const activeFilters = [
    ...(currentCategory ? [{ type: "category", label: `Category: ${currentCategory}`, url: buildUrl({ category: undefined, page: 1 }) }] : []),
    ...(currentDifficulty ? [{ type: "difficulty", label: `Diff: ${currentDifficulty}`, url: buildUrl({ difficulty: undefined, page: 1 }) }] : []),
    ...(currentSearch ? [{ type: "search", label: `Search: "${currentSearch}"`, url: buildUrl({ search: undefined, page: 1 }) }] : []),
    ...(currentTag ? [{ type: "tag", label: `#${currentTag}`, url: buildUrl({ tag: undefined, page: 1 }) }] : []),
  ];

  return (
    <div className="flex flex-col w-full min-h-screen pb-16">
      {/* Header Banner */}
      <section className="w-full bg-[#0B0D12] pt-8 pb-10 border-b border-[#242936]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Terminal Command Breadcrumb */}
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#12151C] border border-[#242936] shadow-sm">
              <span className="text-[#22D3A0] font-mono text-xs">$</span>
              <span className="font-mono text-xs text-white">
                writeuphub --feed --live
              </span>
              <span className="inline-block w-1.5 h-3 bg-[#22D3A0] animate-pulse" />
            </div>
            <span className="font-mono text-[11px] text-[#475569] hidden sm:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A0]" />
              REALTIME ARCHIVE
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-3xl">
              <h1 className="font-sans font-bold text-2xl sm:text-4xl text-white tracking-tight mb-2">
                The Open Archive for{" "}
                <span className="bg-gradient-to-r from-[#22D3A0] via-[#50F0BB] to-[#38BDF8] bg-clip-text text-transparent">
                  CTF Walkthroughs
                </span>
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#94A3B8]">
                Read, search, and dissect real-world capture-the-flag solutions, zero-day research, and offensive engineering writeups.
              </p>
            </div>

            {/* Total Results Count */}
            <div className="shrink-0 p-3 rounded-xl bg-[#12151C] border border-[#242936] flex items-center gap-4">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#475569] uppercase tracking-wider">
                  Verified Solutions
                </span>
                <span className="font-mono text-sm font-bold text-[#22D3A0]">
                  {result.total} Indexed
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Category Quick Pills (hidden on small mobile in favor of filter sheet) */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((c) => {
              const active = currentCategory === c.value;
              return (
                <Link
                  key={c.label}
                  href={buildUrl({ category: c.value || undefined, page: 1 })}
                  className={`px-3.5 py-1.5 rounded-full font-mono text-xs transition-all whitespace-nowrap border min-h-[36px] flex items-center ${
                    active
                      ? "bg-[#22D3A0] text-[#0B0D12] font-bold border-transparent shadow-[0_0_16px_rgba(34,211,160,0.3)]"
                      : "bg-[#12151C] text-[#BACAC1] border-[#242936] hover:text-white hover:border-[#363E52]"
                  }`}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filter and Query Ribbon */}
      <section className="w-full bg-[#10131A] border-b border-[#242936] py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search bar & Mobile Filters Button */}
          <div className="flex items-center gap-2.5 w-full lg:max-w-xl">
            <form action="/explore" method="GET" className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569]" />
              <input
                name="search"
                defaultValue={currentSearch}
                placeholder="Search challenges, CVEs, authors..."
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#0B0D12] border border-[#242936] text-xs text-white placeholder:text-[#475569] focus:outline-none focus:border-[#22D3A0]"
              />
              {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
              {currentDifficulty && <input type="hidden" name="difficulty" value={currentDifficulty} />}
            </form>

            {/* Mobile Filter Sheet Component */}
            <ExploreFilterSheet
              categories={categories}
              difficulties={difficulties}
              currentCategory={currentCategory}
              currentDifficulty={currentDifficulty}
              currentSort={currentSort}
              totalResults={result.total}
            />
          </div>

          {/* Desktop Difficulty & Sort Controls */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Difficulty Pills */}
            <div className="flex items-center gap-1 bg-[#12151C] p-1 rounded-lg border border-[#242936]">
              <span className="font-mono text-[10px] text-[#475569] px-1.5 uppercase">
                Diff:
              </span>
              {difficulties.map((d) => {
                const active = currentDifficulty === d.value;
                return (
                  <Link
                    key={d.value}
                    href={buildUrl({
                      difficulty: active ? undefined : d.value,
                      page: 1,
                    })}
                    className={`px-2 py-1 rounded font-mono text-[11px] flex items-center gap-1 transition-colors min-h-[32px] ${
                      active
                        ? "bg-[#181C25] text-white font-semibold border border-[#363E52]"
                        : "text-[#94A3B8] hover:text-white"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${d.color}`} />
                    <span>{d.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-1 bg-[#12151C] p-1 rounded-lg border border-[#242936] font-mono text-xs">
              <Link
                href={buildUrl({ sort: "trending", page: 1 })}
                className={`px-2.5 py-1 rounded transition-colors min-h-[32px] flex items-center ${
                  currentSort === "trending"
                    ? "bg-[#181C25] text-[#22D3A0] font-semibold"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Trending
              </Link>
              <Link
                href={buildUrl({ sort: "latest", page: 1 })}
                className={`px-2.5 py-1 rounded transition-colors min-h-[32px] flex items-center ${
                  currentSort === "latest"
                    ? "bg-[#181C25] text-[#22D3A0] font-semibold"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Latest
              </Link>
              <Link
                href={buildUrl({ sort: "views", page: 1 })}
                className={`px-2.5 py-1 rounded transition-colors min-h-[32px] flex items-center ${
                  currentSort === "views"
                    ? "bg-[#181C25] text-[#22D3A0] font-semibold"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                Views
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Active Filter Chips (shown above results with 1-click removal) */}
      {activeFilters.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] text-[#475569] uppercase mr-1">
            Active Filters:
          </span>
          {activeFilters.map((f) => (
            <Link
              key={f.type}
              href={f.url}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181C25] border border-[#242936] hover:border-rose-500/50 text-xs font-mono text-[#BACAC1] hover:text-rose-300 transition-colors group"
            >
              <span>{f.label}</span>
              <X className="h-3 w-3 text-[#475569] group-hover:text-rose-400" />
            </Link>
          ))}
          <Link
            href="/explore"
            className="text-[11px] font-mono text-primary hover:underline ml-2"
          >
            Clear All
          </Link>
        </div>
      )}

      {/* Writeups Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {result.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.items.map((writeup) => (
              <WriteupCard key={writeup.id} writeup={writeup} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center border border-[#242936] rounded-xl bg-[#12151C]">
            <Terminal className="h-10 w-10 text-[#475569] mb-3" />
            <h3 className="font-sans font-bold text-lg text-white mb-1">
              No writeups found
            </h3>
            <p className="font-sans text-xs text-[#94A3B8] max-w-sm mb-4">
              No published walkthroughs matched your current search filters. Try clearing your category or query filters.
            </p>
            <Link
              href="/explore"
              className="px-4 py-2 rounded-lg bg-[#181C25] hover:bg-[#1D2027] text-xs font-mono text-primary border border-[#242936] transition-colors min-h-[44px] inline-flex items-center"
            >
              Reset Filters
            </Link>
          </div>
        )}

        {/* Pagination Strip */}
        {result.totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center gap-4">
            {/* Mobile Compact Pagination: "Prev / Page x of y / Next" */}
            <div className="flex sm:hidden items-center justify-between w-full font-mono text-xs bg-[#12151C] p-2 rounded-xl border border-[#242936]">
              {currentPage > 1 ? (
                <Link
                  href={buildUrl({ page: currentPage - 1 })}
                  className="px-4 py-2 rounded-lg bg-[#181C25] text-white hover:bg-[#1D2027] min-h-[44px] flex items-center gap-1 border border-[#242936]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Prev</span>
                </Link>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 rounded-lg text-[#475569] min-h-[44px] flex items-center gap-1 opacity-50 cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Prev</span>
                </button>
              )}

              <span className="text-[#BACAC1] font-semibold">
                Page {currentPage} of {result.totalPages}
              </span>

              {currentPage < result.totalPages ? (
                <Link
                  href={buildUrl({ page: currentPage + 1 })}
                  className="px-4 py-2 rounded-lg bg-[#181C25] text-white hover:bg-[#1D2027] min-h-[44px] flex items-center gap-1 border border-[#242936]"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 rounded-lg text-[#475569] min-h-[44px] flex items-center gap-1 opacity-50 cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Desktop Full Pagination */}
            <div className="hidden sm:flex items-center justify-center gap-2 font-mono text-xs">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildUrl({ page: p })}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors min-h-[40px] ${
                    p === currentPage
                      ? "bg-[#22D3A0] text-[#0B0D12] font-bold border-transparent"
                      : "bg-[#12151C] text-[#BACAC1] border-[#242936] hover:text-white"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
