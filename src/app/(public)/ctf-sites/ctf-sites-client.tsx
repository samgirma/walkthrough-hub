"use client";

import React, { useState, useMemo } from "react";
import { Search, ExternalLink, Globe, Star, ArrowUpRight } from "lucide-react";
import { CTF_SITES } from "@/lib/ctf-sites-data";
import { PlatformLogo } from "@/components/ctf-sites/PlatformLogos";

export function CtfSitesClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTouchId, setActiveTouchId] = useState<string | null>(null);

  const categories = [
    "ALL",
    "Platforms & Labs",
    "Wargames & Pwn",
    "Web Security",
    "Cryptography & RE",
    "Directory & Competitions",
  ];

  const filteredSites = useMemo(() => {
    return CTF_SITES.filter((site) => {
      const matchesCategory =
        selectedCategory === "ALL" || site.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        site.name.toLowerCase().includes(q) ||
        site.description.toLowerCase().includes(q) ||
        site.category.toLowerCase().includes(q) ||
        site.tags.some((t) => t.toLowerCase().includes(q)) ||
        site.features.some((f) => f.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full space-y-8 font-sans pb-12">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#12151C]/90 backdrop-blur-md border border-[#242936] shadow-xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search platforms, skills (e.g. heap, burp, wargame, web, crypto)..."
            className="w-full bg-[#181C25] border border-[#242936] focus:border-[#22D3A0] rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-[#475569] focus:outline-none transition-colors min-h-[44px]"
          />
        </div>

        {/* Total Badge */}
        <div className="flex items-center gap-2 font-mono text-xs px-3.5 py-2 rounded-xl bg-[#181C25] border border-[#242936] text-[#BACAC1] shrink-0 self-start md:self-auto">
          <Globe className="h-4 w-4 text-[#22D3A0]" />
          <span>
            {filteredSites.length} of {CTF_SITES.length} Platforms
          </span>
        </div>
      </div>

      {/* Category Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap min-h-[40px] flex items-center gap-1.5 ${
                active
                  ? "bg-[#22D3A0] text-[#0B0D12] font-bold border-transparent shadow-[0_0_15px_rgba(34,211,160,0.25)]"
                  : "bg-[#12151C]/80 text-[#BACAC1] border-[#242936] hover:bg-[#181C25] hover:text-white"
              }`}
            >
              {cat === "ALL" ? "All Platforms" : cat}
            </button>
          );
        })}
      </div>

      {/* Grid of Clickable Platform Logo Cards with Hover Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredSites.map((site) => {
          const isTouchActive = activeTouchId === site.id;

          return (
            <a
              key={site.id}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${site.name} - ${site.category}`}
              onClick={(e) => {
                // On touch screens, first tap reveals details, second tap or clicking CTA navigates
                if (
                  typeof window !== "undefined" &&
                  window.matchMedia("(hover: none)").matches &&
                  activeTouchId !== site.id
                ) {
                  e.preventDefault();
                  setActiveTouchId(site.id);
                }
              }}
              className="group relative h-72 rounded-2xl bg-[#12151C]/90 backdrop-blur-md border border-[#242936] hover:border-[#22D3A0]/60 focus-visible:border-[#22D3A0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3A0]/40 transition-all duration-300 overflow-hidden cursor-pointer shadow-lg hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] select-none"
            >
              {/* Background Brand Color Glow */}
              <div
                className="absolute inset-0 opacity-15 group-hover:opacity-35 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${site.color}35 0%, transparent 72%)`,
                }}
              />

              {/* Featured Badge on Logo (Rest State) */}
              {site.featured && (
                <div className="absolute top-3 right-3 z-10 transition-opacity duration-200 group-hover:opacity-0">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold flex items-center gap-1">
                    <Star className="h-2.5 w-2.5 fill-amber-400" />
                    <span>Featured</span>
                  </span>
                </div>
              )}

              {/* REST STATE: Platform Icon / Logo Image Only */}
              <div className="flex flex-col items-center justify-center h-full p-6 transition-transform duration-300 group-hover:scale-105">
                <PlatformLogo
                  id={site.id}
                  className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* HOVER / FOCUS / TOUCH STATE: Texts Revealed with Smooth Blur Overlay */}
              <div
                className={`absolute inset-0 bg-[#0B0D12]/95 backdrop-blur-md p-5 flex flex-col justify-between transition-all duration-300 z-20 border border-[#22D3A0]/50 rounded-2xl ${
                  isTouchActive
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-visible:opacity-100 group-focus-visible:pointer-events-auto"
                }`}
              >
                {/* Header: Platform Name & Badges */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: site.color }}
                      />
                      <h3 className="font-sans font-bold text-base text-white tracking-tight truncate">
                        {site.name}
                      </h3>
                    </div>

                    <ArrowUpRight className="h-4 w-4 text-[#22D3A0] shrink-0" />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-[#181C25] border border-[#242936] text-[#BACAC1]">
                      {site.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md border font-semibold ${
                        site.difficulty === "Beginner"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : site.difficulty === "Intermediate"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : site.difficulty === "Advanced"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                      }`}
                    >
                      {site.difficulty}
                    </span>
                  </div>
                </div>

                {/* Description Text */}
                <p className="text-xs text-[#CBD5E1] leading-relaxed line-clamp-4 font-sans">
                  {site.description}
                </p>

                {/* Tags & Action Link */}
                <div className="space-y-3 pt-2 border-t border-[#242936]/80">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {site.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#181C25] text-[#94A3B8] border border-[#242936]/60 truncate"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between font-mono text-xs font-bold text-[#22D3A0]">
                    <span>Visit Platform</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
