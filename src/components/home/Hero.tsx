"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Zap, BookOpen, PenLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "@/components/home/HeroBackground";

interface HeroProps {
  categories?: {
    name: string;
    param: string;
    count?: string;
    color?: string;
  }[];
}

const DEFAULT_CATEGORIES = [
  { name: "All", param: "", count: "12.4k", color: "#50F0BB" },
  { name: "Web", param: "WEB", count: "4.2k", color: "#38BDF8" },
  { name: "Pwn", param: "PWN", count: "3.1k", color: "#F43F5E" },
  { name: "Crypto", param: "CRYPTO", count: "2.1k", color: "#A855F7" },
  { name: "Reverse", param: "REVERSE", count: "1.6k", color: "#FB923C" },
  { name: "Forensics", param: "FORENSICS", count: "980", color: "#14B8A6" },
  { name: "Misc", param: "MISC", count: "420", color: "#94A3B8" },
  { name: "OSINT", param: "OSINT", count: "310", color: "#EAB308" },
];

export function Hero({ categories = DEFAULT_CATEGORIES }: HeroProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when user presses '/' key (desktop only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section className="relative w-full min-h-[100svh] lg:min-h-[85vh] flex flex-col justify-end lg:justify-center overflow-hidden border-b border-[#242936]">
      {/* Optimized Background Art with <picture>, AVIF/WebP srcset and overlays */}
      <HeroBackground />

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pb-16 lg:py-24">
        <div className="max-w-3xl flex flex-col items-start">
          
          {/* Telemetry Badge (Stagger 1) */}
          <div className="hero-animate hero-delay-1 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12151C]/90 border border-[#242936] text-[11px] font-mono text-[#22D3A0] shadow-sm mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A0] animate-ping" />
            <span>SYS.STATUS // CTF REPOSITORY ONLINE</span>
          </div>

          {/* Fluid Headline (Stagger 2) */}
          <h1 className="hero-animate hero-delay-2 text-fluid-hero font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
            Learn from{" "}
            <span className="bg-gradient-to-r from-[#22D3A0] via-[#50F0BB] to-[#38BDF8] text-transparent bg-clip-text drop-shadow-[0_0_24px_rgba(34,211,160,0.35)]">
              every flag.
            </span>
          </h1>

          {/* Subtext (Stagger 3) */}
          <p className="hero-animate hero-delay-3 text-base sm:text-lg text-[#BACAC1] max-w-xl mb-6 sm:mb-8 leading-relaxed font-sans drop-shadow-sm">
            The open platform where cybersecurity learners, CTF players, and exploit researchers dissect challenges, publish cryptographically verified walkthroughs, and level up together.
          </p>

          {/* Big Search Input (Stagger 4) */}
          <div className="hero-animate hero-delay-4 w-full max-w-2xl bg-[#12151C]/95 p-2 rounded-xl border border-[#242936] shadow-2xl backdrop-blur-md mb-5">
            <form
              action="/explore"
              method="GET"
              className="flex flex-col sm:flex-row items-stretch gap-2"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3.5 h-5 w-5 text-[#94A3B8] pointer-events-none" />
                <input
                  ref={searchInputRef}
                  name="search"
                  placeholder="Search writeups by challenge, CVE, CTF, author..."
                  className="w-full h-12 pl-11 pr-12 rounded-lg bg-[#0B0D12] text-sm text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#22D3A0] focus:ring-1 focus:ring-[#22D3A0] border border-[#242936] font-sans shadow-inner"
                />
                {/* Keyboard shortcut hint hidden on touch devices via media query */}
                <kbd className="absolute right-3 hidden md:inline-flex items-center justify-center px-2 py-0.5 rounded bg-[#181C25] border border-[#242936] font-mono text-[10px] text-[#94A3B8] select-none pointer-events-none">
                  /
                </kbd>
              </div>

              <Button
                type="submit"
                className="h-12 px-6 gradient-cta text-[#0B0D12] font-semibold text-sm gap-2 shrink-0 shadow-[0_0_20px_rgba(34,211,160,0.3)] min-h-[44px]"
              >
                <Zap className="h-4 w-4" />
                <span>Explore</span>
              </Button>
            </form>
          </div>

          {/* Category Quick-filter Chips (Horizontal scroll with snap on mobile, wrap on desktop) */}
          <div className="hero-animate hero-delay-5 w-full max-w-2xl flex items-center gap-2 mb-6 sm:mb-8">
            <span className="font-mono text-[11px] text-[#94A3B8] uppercase tracking-wider shrink-0 hidden sm:inline">
              Triage:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 sm:pb-0 sm:flex-wrap w-full">
              {categories.map((c) => (
                <Link
                  key={c.name}
                  href={c.param ? `/explore?category=${c.param}` : "/explore"}
                  className="snap-start shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181C25]/90 hover:bg-[#1D2027] border border-[#242936] font-mono text-xs text-[#BACAC1] hover:text-white transition-all min-h-[36px]"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: c.color || "#22D3A0" }}
                  />
                  <span>{c.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Buttons: Stacked full-width on mobile, inline on desktop */}
          <div className="hero-animate hero-delay-5 w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link href="/explore" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto min-h-[44px] px-6 gradient-cta text-[#0B0D12] font-bold text-sm gap-2 shadow-[0_0_20px_rgba(34,211,160,0.25)] hover:shadow-[0_0_25px_rgba(34,211,160,0.4)]"
              >
                <BookOpen className="h-4 w-4 stroke-[2.5]" />
                <span>Browse All Writeups</span>
              </Button>
            </Link>

            <Link href="/write" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-h-[44px] px-6 bg-[#12151C]/80 hover:bg-[#181C25] border-[#242936] hover:border-[#363E52] text-white font-mono text-xs gap-2"
              >
                <PenLine className="h-4 w-4 text-[#22D3A0]" />
                <span>Publish a Writeup</span>
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
