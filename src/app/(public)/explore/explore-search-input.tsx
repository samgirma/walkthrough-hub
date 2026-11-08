"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, User, X } from "lucide-react";
import { initSearchEngine, prefetchSearchIndex, type SearchResultItem } from "@/lib/search-engine";

interface ExploreSearchInputProps {
  defaultValue?: string;
  category?: string;
  difficulty?: string;
  sort?: string;
  isMobile?: boolean;
}

export function ExploreSearchInput({
  defaultValue = "",
  category,
  difficulty,
  sort,
  isMobile = false,
}: ExploreSearchInputProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchEngineRef = useRef<{ search: (q: string, limit?: number) => SearchResultItem[] } | null>(null);

  // Close results panel on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ensureEngine = async () => {
    prefetchSearchIndex();
    if (!searchEngineRef.current) {
      try {
        const engine = await initSearchEngine();
        searchEngineRef.current = engine;
      } catch (err) {
        console.error("[ExploreSearchInput] Failed to load search engine:", err);
      }
    }
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelectedIndex(0);

    if (!val.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (searchEngineRef.current) {
      const hits = searchEngineRef.current.search(val, 6);
      setResults(hits);
      setIsOpen(hits.length > 0);
    } else {
      ensureEngine().then(() => {
        if (searchEngineRef.current && val.trim()) {
          const hits = searchEngineRef.current.search(val, 6);
          setResults(hits);
          setIsOpen(hits.length > 0);
        }
      });
    }
  };

  const handleSelectResult = (item: SearchResultItem) => {
    setIsOpen(false);
    router.push(`/w/${item.author}/${item.id || item.slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    const q = new URLSearchParams();
    if (query.trim()) q.set("search", query.trim());
    if (category) q.set("category", category);
    if (difficulty) q.set("difficulty", difficulty);
    if (sort && sort !== "trending") q.set("sort", sort);

    router.push(`/explore${q.toString() ? `?${q.toString()}` : ""}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelectResult(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          name="search"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => {
            ensureEngine();
            if (results.length > 0) setIsOpen(true);
          }}
          onMouseEnter={ensureEngine}
          onTouchStart={ensureEngine}
          onKeyDown={handleKeyDown}
          placeholder={isMobile ? "Search challenges, CVEs, authors..." : "CVEs, authors, CTFs..."}
          className={`w-full rounded-lg bg-[#0B0D12] border border-[#242936] text-xs text-white placeholder:text-[#475569] focus:outline-none focus:border-[#22D3A0] transition-colors ${
            isMobile ? "h-10 pl-9 pr-8" : "h-9 px-3 pr-7"
          }`}
        />

        {isMobile && (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569] pointer-events-none" />
        )}

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {/* Instant As-You-Type Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#12151C] border border-[#242936] rounded-xl shadow-2xl overflow-hidden p-1.5 max-h-80 overflow-y-auto">
          <div className="px-2 py-1 text-[10px] font-mono text-[#475569] flex items-center justify-between border-b border-[#242936]/60 mb-1">
            <span>INSTANT WRITEUP MATCHES</span>
            <span>Enter to open</span>
          </div>
          {results.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectResult(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-left p-2 rounded-lg border transition-all flex flex-col gap-1 mb-1 last:mb-0 ${
                  isSelected
                    ? "bg-[#181C25] border-[#22D3A0]/40 shadow-sm"
                    : "bg-transparent border-transparent hover:bg-[#181C25]/60"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileText className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-[#22D3A0]" : "text-[#475569]"}`} />
                    <span className="font-sans font-medium text-xs text-white truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded border border-[#242936] bg-[#0B0D12] text-[#BACAC1] shrink-0">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#475569] pl-5">
                  <span className="flex items-center gap-1 text-[#BACAC1]">
                    <User className="h-2.5 w-2.5" />
                    {item.author}
                  </span>
                  {item.matchType === "title-prefix" && (
                    <span className="text-[#22D3A0]">prefix match</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
