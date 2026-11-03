import React from "react";
import Link from "next/link";
import { Terminal, Rss, FileCode, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#242936] bg-[#0B0D12] text-[#94A3B8] text-xs font-mono py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#242936]/60">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#22D3A0] to-[#38BDF8] flex items-center justify-center text-[#0B0D12]">
                <Terminal className="h-3.5 w-3.5 stroke-[2.5]" />
              </div>
              <span className="font-sans font-bold text-base text-white tracking-tight">
                Writeup<span className="text-[#22D3A0]">Hub</span>
              </span>
            </Link>
            <p className="text-[#BACAC1] max-w-md font-sans text-xs">
              Open-access CTF publishing platform. Cryptographically structured, zero-auth public reading, and developer-grade dark aesthetic.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/explore"
              className="hover:text-[#22D3A0] transition-colors"
            >
              Explore Feed
            </Link>
            <span className="text-[#363E52]">/</span>
            <Link
              href="/feed.xml"
              className="flex items-center gap-1 hover:text-[#22D3A0] transition-colors"
              target="_blank"
            >
              <Rss className="h-3.5 w-3.5 text-amber-500" />
              <span>RSS Feed</span>
            </Link>
            <span className="text-[#363E52]">/</span>
            <Link
              href="/sitemap.xml"
              className="flex items-center gap-1 hover:text-[#22D3A0] transition-colors"
              target="_blank"
            >
              <FileCode className="h-3.5 w-3.5 text-sky-400" />
              <span>Sitemap</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#475569]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#22D3A0]" />
            <span>ENCRYPTED TELEMETRY // SEC-LEVEL 3 ARCHIVE</span>
          </div>

          <div className="flex items-center gap-1">
            <span>Built for offensive security researchers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
