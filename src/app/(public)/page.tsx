import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Flame, ArrowRight, Layers } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { WriteupCard } from "@/components/writeup/writeup-card";
import { getPublicWriteups } from "@/server/writeup.service";
import { getPopularTags } from "@/server/tag.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WriteupHub // Learn from every flag",
  description:
    "The open platform where cybersecurity researchers and CTF players dissect challenges, publish cryptographically verified walkthroughs, and level up together.",
};

export default async function HomePage() {
  const [trendingResult, popularTags] = await Promise.all([
    getPublicWriteups({ sort: "trending", limit: 6 }).catch((err) => {
      console.error("[HomePage] Could not load writeups:", err.message);
      return { items: [], total: 0, page: 1, limit: 6, totalPages: 0 };
    }),
    getPopularTags(8).catch((err) => {
      console.error("[HomePage] Could not load tags:", err.message);
      return [];
    }),
  ]);

  const categories = [
    { name: "All", param: "", count: "12.4k", color: "#50F0BB" },
    { name: "Web", param: "WEB", count: "4.2k", color: "#38BDF8" },
    { name: "Pwn", param: "PWN", count: "3.1k", color: "#F43F5E" },
    { name: "Crypto", param: "CRYPTO", count: "2.1k", color: "#A855F7" },
    { name: "Reverse", param: "REVERSE", count: "1.6k", color: "#FB923C" },
    { name: "Forensics", param: "FORENSICS", count: "980", color: "#14B8A6" },
    { name: "Misc", param: "MISC", count: "420", color: "#94A3B8" },
    { name: "OSINT", param: "OSINT", count: "310", color: "#EAB308" },
  ];

  return (
    <div className="relative w-full min-h-screen">
      {/* 
        Preload critical AVIF hero images for desktop and mobile
        hoisted directly into document head by React 19 / Next.js
      */}
      <link
        rel="preload"
        as="image"
        type="image/avif"
        media="(min-width: 768px)"
        href="/hero/hero-desktop.avif"
      />
      <link
        rel="preload"
        as="image"
        type="image/avif"
        media="(max-width: 767px)"
        href="/hero/hero-mobile.avif"
      />

      {/* 
        Static Hero View:
        Pinned at the top with sticky positioning (-mt-16 sticky top-0 z-0 h-[100svh])
        so it stays stationary in the viewport as the user scrolls.
      */}
      <div className="-mt-16 sticky top-0 left-0 w-full h-[100svh] z-0 overflow-hidden">
        <Hero categories={categories} />
      </div>

      {/* 
        Slide-over Webpage Content:
        Has relative z-10 and dark background, so as the user scrolls down,
        this entire section rises and slides OVER the static hero view like a curtain.
      */}
      <div className="relative z-10 bg-[#0B0D12] border-t border-[#242936] shadow-[0_-25px_60px_rgba(0,0,0,0.95)]">
        {/* Trending Section */}
        <section className="w-full py-12 sm:py-16 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-sans font-bold text-xl sm:text-2xl text-white tracking-tight">
                    Trending Writeups
                  </h2>
                  <p className="font-sans text-xs text-[#94A3B8]">
                    Peer-reviewed exploits, kernel bypasses, and verified solutions
                  </p>
                </div>
              </div>

              <Link
                href="/explore"
                className="inline-flex items-center gap-1 text-xs font-mono text-[#22D3A0] hover:underline min-h-[36px]"
              >
                <span>View full directory</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Cards Grid: 1 col on mobile, 2 at md, 3 at lg */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingResult.items.map((writeup) => (
                <WriteupCard key={writeup.id} writeup={writeup} />
              ))}
            </div>
          </div>
        </section>

        {/* Popular Topics & Tags Ribbon */}
        <section className="w-full py-8 sm:py-12 bg-[#12151C]/75 backdrop-blur-md border-t border-b border-[#242936]/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-2 shrink-0">
              <Layers className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs uppercase tracking-wider text-white">
                Indexed Exploit Tags:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {popularTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/explore?tag=${tag.name}`}
                  className="px-3 py-1.5 rounded-lg bg-[#181C25] hover:bg-[#1D2027] border border-[#242936] text-xs font-mono text-[#BACAC1] hover:text-[#22D3A0] transition-colors flex items-center gap-1.5 min-h-[36px]"
                >
                  <span>#{tag.name}</span>
                  <span className="text-[10px] text-[#475569]">({tag.count})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
