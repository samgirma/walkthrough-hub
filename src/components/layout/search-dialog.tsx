"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Terminal, ArrowRight, ShieldCheck, FileText, Tag, User } from "lucide-react";
import { initSearchEngine, prefetchSearchIndex, type SearchResultItem } from "@/lib/search-engine";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchEngineReady, setSearchEngineReady] = useState(false);
  const router = useRouter();
  const searchEngineRef = useRef<{ search: (q: string, limit?: number) => SearchResultItem[] } | null>(null);

  // Initialize search engine when dialog opens
  useEffect(() => {
    if (open) {
      prefetchSearchIndex();
      initSearchEngine().then((engine) => {
        searchEngineRef.current = engine;
        setSearchEngineReady(true);
      }).catch((err) => {
        console.error("[SearchDialog] Failed to initialize search engine:", err);
      });
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Global hotkeys (Cmd+K and /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Instant as-you-type search (< 16 ms, zero network requests, zero spinners)
  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelectedIndex(0);

    if (!val.trim()) {
      setResults([]);
      return;
    }

    if (searchEngineRef.current) {
      const hits = searchEngineRef.current.search(val, 8);
      setResults(hits);
    }
  };

  const handleSelectResult = (item: SearchResultItem) => {
    onOpenChange(false);
    router.push(`/w/${item.author}/${item.id || item.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        handleSelectResult(results[selectedIndex]);
      } else if (query.trim()) {
        onOpenChange(false);
        router.push(`/explore?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const quickCategories = [
    { name: "Pwn (Binary Exploitation)", category: "PWN" },
    { name: "Web Exploitation", category: "WEB" },
    { name: "Cryptography", category: "CRYPTO" },
    { name: "Reverse Engineering", category: "REVERSE" },
    { name: "Digital Forensics", category: "FORENSICS" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-[#12151C] border-[#242936] rounded-xl shadow-2xl">
        <div className="flex items-center px-4 py-3 border-b border-[#242936]">
          <Search className="h-5 w-5 text-[#94A3B8] mr-3 shrink-0" />
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => prefetchSearchIndex()}
            placeholder="Search writeups, CVEs, authors, CTFs..."
            className="w-full bg-transparent text-sm text-[#E0E2EC] placeholder:text-[#475569] focus:outline-none font-sans"
            autoFocus
          />
          <kbd className="px-2 py-0.5 rounded bg-[#181C25] border border-[#242936] text-[10px] font-mono text-[#94A3B8] select-none">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 flex flex-col gap-2">
          {query.trim() && results.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <div className="px-2 py-1 flex items-center justify-between text-[11px] font-mono text-[#475569]">
                <span>{results.length} INSTANT MATCHES</span>
                <span>Use ↑↓ to navigate, Enter to view</span>
              </div>
              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-[#181C25] border-[#22D3A0]/50 shadow-sm"
                        : "bg-[#0B0D12]/60 hover:bg-[#181C25]/80 border-[#242936]/80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className={`h-4 w-4 shrink-0 ${isSelected ? "text-[#22D3A0]" : "text-[#475569]"}`} />
                        <span className="font-sans font-semibold text-sm text-white truncate">
                          {item.title}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded border border-[#242936] bg-[#181C25] text-[#BACAC1] shrink-0">
                        {item.category}
                      </span>
                    </div>

                    {item.snippet && (
                      <p className="font-sans text-xs text-[#94A3B8] line-clamp-1 pl-6">
                        {item.snippet}
                      </p>
                    )}

                    <div className="flex items-center gap-3 pl-6 text-[11px] font-mono text-[#475569]">
                      <span className="flex items-center gap-1 text-[#BACAC1]">
                        <User className="h-3 w-3" />
                        {item.author}
                      </span>
                      {item.tags.length > 0 && (
                        <span className="flex items-center gap-1 truncate text-[#475569]">
                          <Tag className="h-3 w-3" />
                          {item.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}
                        </span>
                      )}
                      {item.matchType === "title-prefix" && (
                        <span className="ml-auto text-[10px] text-[#22D3A0] font-mono">
                          prefix match
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query.trim() && searchEngineReady ? (
            <div className="py-8 text-center flex flex-col items-center justify-center">
              <Terminal className="h-8 w-8 text-[#475569] mb-2" />
              <p className="font-sans text-sm text-[#94A3B8]">No instant results for &quot;{query}&quot;</p>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  router.push(`/explore?search=${encodeURIComponent(query.trim())}`);
                }}
                className="mt-3 text-xs font-mono text-[#22D3A0] hover:underline"
              >
                Press Enter to run full database search &rarr;
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-1">
              <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <Terminal className="h-3.5 w-3.5 text-[#22D3A0]" />
                  Quick Triage
                </span>
                <span>Jump to category</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickCategories.map((cat) => (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      router.push(`/explore?category=${cat.category}`);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B0D12] hover:bg-[#181C25] border border-[#242936] text-xs font-mono text-[#BACAC1] hover:text-[#22D3A0] transition-colors text-left group"
                  >
                    <span>{cat.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#475569] group-hover:text-[#22D3A0] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>

              <div className="mt-2 pt-3 border-t border-[#242936]/60 flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#22D3A0]" /> Zero-auth public search active
                </span>
                <span>Press Enter to query</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
