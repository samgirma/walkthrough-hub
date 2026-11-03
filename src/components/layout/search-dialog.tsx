"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Terminal, ArrowRight, ShieldCheck } from "lucide-react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onOpenChange(false);
    router.push(`/explore?search=${encodeURIComponent(query.trim())}`);
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
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-[#12151C] border-[#242936] rounded-xl shadow-2xl">
        <form onSubmit={handleSearch} className="flex items-center px-4 py-3 border-b border-[#242936]">
          <Search className="h-5 w-5 text-[#94A3B8] mr-3 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search writeups, CVEs, authors, CTFs..."
            className="w-full bg-transparent text-sm text-[#E0E2EC] placeholder:text-[#475569] focus:outline-none font-sans"
            autoFocus
          />
          <kbd className="px-2 py-0.5 rounded bg-[#181C25] border border-[#242936] text-[10px] font-mono text-[#94A3B8] select-none">
            ESC
          </kbd>
        </form>

        <div className="p-4 flex flex-col gap-3">
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
              <ShieldCheck className="h-3.5 w-3.5 text-[#22D3A0]" /> Zero-auth public access active
            </span>
            <span>Press Enter to query</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
