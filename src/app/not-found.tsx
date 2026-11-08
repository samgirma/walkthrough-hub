import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Terminal, ArrowLeft, Search, Compass, ShieldAlert } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "404 - Page Not Found",
  description: "The requested CTF writeup, exploit analysis, or telemetry page does not exist.",
  noindex: true,
  nofollow: true,
});

export default function NotFound() {
  const popularCategories = [
    { name: "Web Exploitation", href: "/category/web" },
    { name: "Binary Exploitation (Pwn)", href: "/category/pwn" },
    { name: "Cryptography", href: "/category/crypto" },
    { name: "Reverse Engineering", href: "/category/reverse" },
    { name: "Forensics", href: "/category/forensics" },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full p-8 rounded-2xl border border-[#242936] bg-[#12151C]/90 backdrop-blur-md shadow-2xl flex flex-col gap-6 text-center">
        {/* Error Badge */}
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8" />
          </div>
        </div>

        {/* Status & Title */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-rose-400 font-bold">
            STATUS 404 // RESOURCE NOT FOUND
          </span>
          <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Target Primitive Unreachable
          </h1>
          <p className="font-sans text-sm text-[#BACAC1] leading-relaxed max-w-md mx-auto">
            The writeup, exploit proof-of-concept, or research researcher you requested could
            not be located on this host.
          </p>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs pt-2">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-lg bg-[#22D3A0] hover:bg-[#50F0BB] text-[#0B0D12] font-bold transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return Home</span>
          </Link>

          <Link
            href="/explore"
            className="px-4 py-2.5 rounded-lg bg-[#181C25] hover:bg-[#1E232E] border border-[#242936] text-[#BACAC1] hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Search className="h-3.5 w-3.5 text-primary" />
            <span>Search Exploits</span>
          </Link>

          <Link
            href="/browse"
            className="px-4 py-2.5 rounded-lg bg-[#181C25] hover:bg-[#1E232E] border border-[#242936] text-[#BACAC1] hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Compass className="h-3.5 w-3.5 text-secondary" />
            <span>Browse Directory</span>
          </Link>
        </div>

        {/* Popular Categories Links */}
        <div className="pt-6 border-t border-[#242936]/60 flex flex-col gap-3 text-left">
          <span className="text-[11px] font-mono uppercase text-[#475569] font-semibold">
            Or explore top security disciplines:
          </span>
          <div className="flex flex-wrap gap-2">
            {popularCategories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="px-2.5 py-1 rounded bg-[#0B0D12] border border-[#242936] text-xs font-mono text-[#94A3B8] hover:text-white hover:border-[#22D3A0] transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
