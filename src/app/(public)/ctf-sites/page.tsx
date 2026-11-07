import React from "react";
import { Metadata } from "next";
import { Globe, Terminal, ShieldCheck } from "lucide-react";
import { CtfSitesClient } from "./ctf-sites-client";

export const revalidate = 86400; // Static ISR: updates daily

export const metadata: Metadata = {
  title: "CTF Platforms & Practice Labs // Global Cybersecurity Directory",
  description:
    "Curated directory of the world's leading Capture The Flag platforms, offensive security labs, wargames, and competition calendars.",
};

export default function CtfSitesPage() {
  return (
    <div className="flex flex-col w-full min-h-screen pb-24 bg-transparent">
      {/* Header Section */}
      <section className="w-full bg-[#0B0D12]/90 backdrop-blur-xl border-b border-[#242936] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181C25] border border-[#242936] font-mono text-[11px] text-[#22D3A0]">
                <Globe className="h-3.5 w-3.5" />
                <span>GLOBAL PRACTICE LABS & PLATFORMS</span>
              </div>
              <h1 className="font-sans font-bold text-2xl sm:text-4xl text-white tracking-tight">
                Curated Directory of{" "}
                <span className="bg-gradient-to-r from-[#22D3A0] via-[#50F0BB] to-[#38BDF8] bg-clip-text text-transparent">
                  CTF Platforms & Labs
                </span>
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Explore handpicked training arenas, live competition calendars, Linux wargames, and specialized web security academies to level up your technical tradecraft.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="shrink-0 p-4 rounded-2xl bg-[#12151C]/90 backdrop-blur-md border border-[#242936] flex items-center gap-5 self-start md:self-auto">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#475569] uppercase tracking-wider">
                  Verified Ecosystem
                </span>
                <span className="font-mono text-sm font-bold text-[#22D3A0]">
                  12 Premier Platforms
                </span>
              </div>
              <div className="w-[1px] h-8 bg-[#242936]" />
              <div className="flex items-center gap-2 text-xs font-mono text-[#BACAC1]">
                <ShieldCheck className="h-4 w-4 text-[#38BDF8]" />
                <span>100% Free / Freemium</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full flex-1">
        <CtfSitesClient />
      </div>
    </div>
  );
}
