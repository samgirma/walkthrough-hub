"use client";

import React, { useState, useMemo } from "react";
import { Search, ExternalLink, Globe, Shield, Terminal, Star, CheckCircle2 } from "lucide-react";
import { CTF_SITES, CtfSite } from "@/lib/ctf-sites-data";

export function CtfSitesClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    <div className="w-full space-y-8 font-sans">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#12151C]/90 backdrop-blur-md border border-[#242936] shadow-xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search platforms, skills (e.g. heap, burp, wargame, web)..."
            className="w-full bg-[#181C25] border border-[#242936] focus:border-[#22D3A0] rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-[#475569] focus:outline-none transition-colors min-h-[44px]"
          />
        </div>

        {/* Total Badge */}
        <div className="flex items-center gap-2 font-mono text-xs px-3 py-2 rounded-xl bg-[#181C25] border border-[#242936] text-[#BACAC1] shrink-0 self-start md:self-auto">
          <Globe className="h-4 w-4 text-[#22D3A0]" />
          <span>{filteredSites.length} of {CTF_SITES.length} Platforms</span>
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

      {/* Grid of Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSites.map((site) => {
          return (
            <div
              key={site.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-[#12151C]/90 backdrop-blur-md border border-[#242936] hover:border-[#363E52] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group relative"
            >
              <div>
                {/* Header: Title + Category badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: site.color }}
                    />
                    <h2 className="font-sans font-bold text-lg text-white group-hover:text-[#22D3A0] transition-colors tracking-tight">
                      {site.name}
                    </h2>
                  </div>

                  {site.featured && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold flex items-center gap-1">
                      <Star className="h-2.5 w-2.5 fill-amber-400" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Subtitle Badges: Category & Difficulty */}
                <div className="flex items-center gap-2 mb-4 font-mono text-[11px] flex-wrap">
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

                {/* Description */}
                <p className="text-xs text-[#94A3B8] leading-relaxed mb-5 font-sans">
                  {site.description}
                </p>

                {/* Key Features List */}
                <div className="space-y-1.5 mb-5 pt-3 border-t border-[#242936]/60">
                  {site.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#BACAC1]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#22D3A0] shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Tags Ribbon */}
                <div className="flex items-center gap-1.5 flex-wrap mb-6">
                  {site.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#181C25] text-[#475569] border border-[#242936]/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#181C25] hover:bg-[#22D3A0] text-white hover:text-[#0B0D12] border border-[#242936] hover:border-transparent font-mono text-xs font-bold transition-all min-h-[44px]"
              >
                <span>Launch Platform</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
