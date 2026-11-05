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
    "Search, filter, and dissect real-world capture-the-flag solutions, zero-day research, and offensive engineering writeups.",
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
  }).catch((err) => {
    console.error("[ExplorePage] Could not load writeups:", err.message);
    return { items: [], total: 0, page: 1, limit: 12, totalPages: 0 };
  });

  const categories = [
    { label: "All Categories", value: "", color: "#22D3A0" },
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
    <div className="flex flex-col w-full min-h-screen pb-16 bg-transparent">
      {/* =========================================================================
          STATIC HEADER BLOCK: Fixed at top (under navbar) as the user scrolls
      ========================================================================= */}
      <section className="sticky top-16 z-30 w-full bg-[#0B0D12]/90 backdrop-blur-xl border-b border-[#242936] py-5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="font-sans font-bold text-xl sm:text-3xl text-white tracking-tight">
                The Open Archive for{" "}
                <span className="bg-gradient-to-r from-[#22D3A0] via-[#50F0BB] to-[#38BDF8] bg-clip-text text-transparent">
                  CTF Walkthroughs
                </span>
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#94A3B8] mt-1">
                Read, search, and dissect real-world capture-the-flag solutions, zero-day research, and offensive engineering writeups.
              </p>
            </div>

            {/* Total Results Count Badge */}
            <div className="shrink-0 p-2.5 sm:p-3 rounded-xl bg-[#12151C]/90 backdrop-blur-md border border-[#242936] flex items-center gap-3 sm:gap-4 self-start md:self-auto">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#475569] uppercase tracking-wider">
                  Verified Solutions
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-[#22D3A0]">
                  {result.total} Indexed
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout: Left Filter Sidebar + Right CTF Boxes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col lg:flex-row items-start gap-8">
        
        {/* =========================================================================
            LEFT COLUMN: Static Filter Box (Scrolls within its own box only,
            chains to whole page scroll after reaching last content)
        ========================================================================= */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
          <div className="sticky top-[8.25rem] max-h-[calc(100vh-9.25rem)] overflow-y-auto p-4 rounded-2xl bg-[#12151C]/90 backdrop-blur-xl border border-[#242936] shadow-xl space-y-5 scrollbar-thin scrollbar-thumb-[#242936] hover:scrollbar-thumb-[#363E52] scrollbar-track-transparent">
            
            {/* 1. Search Box */}
            <div>
              <div className="text-[11px] font-mono uppercase text-[#475569] tracking-wider mb-2 font-semibold flex items-center gap-1.5">
                <Search className="h-3 w-3 text-[#22D3A0]" />
                <span>Search Writeups</span>
              </div>
              <form action="/explore" method="GET" className="relative">
                <input
                  name="search"
                  defaultValue={currentSearch}
                  placeholder="CVEs, authors, CTFs..."
                  className="w-full h-9 px-3 rounded-lg bg-[#0B0D12] border border-[#242936] text-xs text-white placeholder:text-[#475569] focus:outline-none focus:border-[#22D3A0] transition-colors"
                />
                {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
                {currentDifficulty && <input type="hidden" name="difficulty" value={currentDifficulty} />}
                {currentSort !== "trending" && <input type="hidden" name="sort" value={currentSort} />}
              </form>
            </div>

            {/* 2. Categories Vertical Menu */}
            <div className="pt-4 border-t border-[#242936]/60">
              <div className="text-[11px] font-mono uppercase text-[#475569] tracking-wider mb-2 font-semibold flex items-center justify-between">
                <span>Categories</span>
                {currentCategory && (
                  <Link
                    href={buildUrl({ category: undefined, page: 1 })}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Reset
                  </Link>
                )}
              </div>
              <div className="space-y-1">
                {categories.map((c) => {
                  const active = currentCategory === c.value;
                  return (
                    <Link
                      key={c.label}
                      href={buildUrl({ category: c.value || undefined, page: 1 })}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                        active
                          ? "bg-[#22D3A0]/15 text-[#22D3A0] font-semibold border border-[#22D3A0]/30 shadow-sm"
                          : "text-[#BACAC1] hover:bg-[#181C25] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="truncate">{c.label}</span>
                      </div>
                      {active && (
                        <span className="text-[9px] bg-[#22D3A0]/20 text-[#22D3A0] px-1 py-0.2 rounded font-mono">
                          active
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 3. Difficulty Selector */}
            <div className="pt-4 border-t border-[#242936]/60">
              <div className="text-[11px] font-mono uppercase text-[#475569] tracking-wider mb-2 font-semibold flex items-center justify-between">
                <span>Difficulty</span>
                {currentDifficulty && (
                  <Link
                    href={buildUrl({ difficulty: undefined, page: 1 })}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Reset
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {difficulties.map((d) => {
                  const active = currentDifficulty === d.value;
                  return (
                    <Link
                      key={d.value}
                      href={buildUrl({
                        difficulty: active ? undefined : d.value,
                        page: 1,
                      })}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                        active
                          ? "bg-[#181C25] text-white font-semibold border-[#38BDF8]/60 shadow-sm"
                          : "bg-[#0B0D12] text-[#94A3B8] border-[#242936] hover:text-white hover:border-[#363E52]"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${d.color}`} />
                      <span>{d.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 4. Sort Controls */}
            <div className="pt-4 border-t border-[#242936]/60">
              <div className="text-[11px] font-mono uppercase text-[#475569] tracking-wider mb-2 font-semibold">
                Sort By
              </div>
              <div className="flex flex-col gap-1">
                {[
                  { id: "trending", label: "Trending" },
                  { id: "latest", label: "Latest First" },
                  { id: "views", label: "Most Viewed" },
                ].map((s) => {
                  const active = currentSort === s.id;
                  return (
                    <Link
                      key={s.id}
                      href={buildUrl({ sort: s.id, page: 1 })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                        active
                          ? "bg-[#181C25] text-[#22D3A0] font-semibold border border-[#242936]"
                          : "text-[#94A3B8] hover:bg-[#181C25] hover:text-white"
                      }`}
                    >
                      <span>{s.label}</span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A0]" />}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 5. Reset All Filters Button (Last content in the box) */}
            {activeFilters.length > 0 && (
              <div className="pt-4 border-t border-[#242936]/60">
                <Link
                  href="/explore"
                  className="w-full py-2 px-3 rounded-lg bg-[#181C25] border border-rose-500/30 hover:border-rose-500/60 text-rose-300 hover:text-rose-200 text-xs font-mono flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Reset All Filters</span>
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* =========================================================================
            RIGHT COLUMN: CTF Boxes List (Writeups Grid & Pagination)
        ========================================================================= */}
        <main className="flex-1 min-w-0 w-full flex flex-col">
          
          {/* Mobile Filter Sheet Trigger & Search Bar (Visible < lg) */}
          <div className="lg:hidden flex items-center gap-2.5 w-full mb-6">
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

            <ExploreFilterSheet
              categories={categories}
              difficulties={difficulties}
              currentCategory={currentCategory}
              currentDifficulty={currentDifficulty}
              currentSort={currentSort}
              totalResults={result.total}
            />
          </div>

          {/* Active Filter Chips Ribbon */}
          {activeFilters.length > 0 && (
            <div className="w-full flex items-center gap-2 flex-wrap mb-6 p-3 rounded-xl bg-[#12151C]/70 backdrop-blur-md border border-[#242936]">
              <span className="font-mono text-[11px] text-[#475569] uppercase mr-1">
                Active:
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
                className="text-[11px] font-mono text-primary hover:underline ml-auto"
              >
                Clear All
              </Link>
            </div>
          )}

          {/* CTF Writeups Grid */}
          {result.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {result.items.map((writeup) => (
                <WriteupCard key={writeup.id} writeup={writeup} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center border border-[#242936] rounded-xl bg-[#12151C]/80 backdrop-blur-md">
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

          {/* Pagination Controls */}
          {result.totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-4">
              {/* Mobile Compact Pagination */}
              <div className="flex sm:hidden items-center justify-between w-full font-mono text-xs bg-[#12151C]/80 backdrop-blur-md p-2 rounded-xl border border-[#242936]">
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
                        : "bg-[#12151C]/90 text-[#BACAC1] border-[#242936] hover:text-white"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
