import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Flame,
  Terminal,
  ShieldCheck,
  Search,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    getPublicWriteups({ sort: "trending", limit: 6 }),
    getPopularTags(8),
  ]);

  const categories = [
    { name: "All", param: "", count: "12.4k", color: "#50F0BB" },
    { name: "Web", param: "WEB", count: "4.2k", color: "#38BDF8" },
    { name: "Pwn", param: "PWN", count: "3.1k", color: "#F43F5E" },
    { name: "Crypto", param: "CRYPTO", count: "2.1k", color: "#A855F7" },
    { name: "Reverse", param: "REVERSE", count: "1.6k", color: "#FB923C" },
    { name: "Forensics", param: "FORENSICS", count: "980", color: "#14B8A6" },
    { name: "Misc", param: "MISC", count: "420", color: "#94A3B8" },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Hero Visual Matrix Canvas */}
      <section className="relative w-full overflow-hidden bg-[#0B0D12] py-16 lg:py-24 border-b border-[#242936]">
        {/* Ambient Backdrops */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,211,160,0.12),rgba(11,13,18,0))] pointer-events-none" />
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-[#00A6E0]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb / Telemetry Banner */}
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181C25] border border-[#242936] font-mono text-[11px] text-[#22D3A0] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A0] animate-ping" />
              SYS.INDEX // LIVE FEEDS ACTIVE
            </span>
            <span className="font-mono text-[11px] text-[#475569] hidden sm:inline">
              EPOCH_ID: 1740698421
            </span>
          </div>

          {/* Main Hero Grid: 7 / 5 Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Search */}
            <div className="lg:col-span-7 flex flex-col">
              <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] mb-5">
                Learn from <br />
                <span className="bg-gradient-to-r from-[#22D3A0] via-[#50F0BB] to-[#38BDF8] text-transparent bg-clip-text drop-shadow-[0_0_24px_rgba(34,211,160,0.3)]">
                  every flag.
                </span>
              </h1>
              <p className="font-sans text-base sm:text-lg text-[#BACAC1] max-w-xl mb-8 leading-relaxed">
                The open platform where cybersecurity learners, CTF players, and exploit researchers dissect challenges, publish cryptographically verified walkthroughs, and level up together.
              </p>

              {/* Instant Query Command Box */}
              <div className="bg-[#12151C] p-2 rounded-xl border border-[#242936] shadow-2xl max-w-2xl mb-6">
                <form
                  action="/explore"
                  method="GET"
                  className="flex flex-col sm:flex-row items-stretch gap-2"
                >
                  <div className="relative flex-1 flex items-center">
                    <Search className="absolute left-3.5 h-5 w-5 text-[#475569] pointer-events-none" />
                    <input
                      name="search"
                      placeholder="Search writeups by challenge name, CVE, CTF event, or author..."
                      className="w-full h-12 pl-11 pr-12 rounded-lg bg-[#0B0D12] text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-[#22D3A0] border border-[#242936] font-sans shadow-inner"
                    />
                    <kbd className="absolute right-3 px-2 py-0.5 rounded bg-[#181C25] border border-[#242936] font-mono text-[10px] text-[#94A3B8] select-none">
                      /
                    </kbd>
                  </div>
                  <Button
                    type="submit"
                    className="h-12 px-6 gradient-cta text-[#0B0D12] font-semibold text-sm gap-2 shrink-0 shadow-[0_0_20px_rgba(34,211,160,0.3)]"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Instant Query</span>
                  </Button>
                </form>
              </div>

              {/* Quick Category Filter Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] text-[#475569] uppercase tracking-wider mr-1">
                  Triage:
                </span>
                {categories.map((c) => (
                  <Link
                    key={c.name}
                    href={c.param ? `/explore?category=${c.param}` : "/explore"}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181C25] hover:bg-[#1D2027] border border-[#242936] font-mono text-xs text-[#BACAC1] hover:text-white transition-all"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span>{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Column: Synthesized Interactive Terminal Exploit Module */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#22D3A0]/20 to-[#38BDF8]/20 blur-xl opacity-75" />
              <div className="relative rounded-xl bg-[#12151C] border border-[#242936] shadow-2xl overflow-hidden">
                {/* Window Chrome Header */}
                <div className="px-4 py-3 bg-[#181C25] border-b border-[#242936] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-xs text-[#BACAC1]">
                      $ pwn_payload.py --verify
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0B0D12] font-mono text-[10px] text-[#22D3A0] font-semibold border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A0] animate-pulse" />
                    VERIFIED ZERO-DAY POC
                  </span>
                </div>

                {/* Terminal Payload Body */}
                <div className="p-4 font-mono text-xs bg-[#0B0D12] text-[#BACAC1] leading-relaxed overflow-x-auto">
                  <div className="text-[#475569] mb-1">
                    # [TARGET] :: glibc-2.39 | heap groom + ret2dlresolve
                  </div>
                  <div className="text-[#38BDF8]">
                    <span className="text-[#A855F7]">from</span> pwn{" "}
                    <span className="text-[#A855F7]">import</span> remote, p64, u64, ROP, ELF
                  </div>
                  <div className="text-[#BACAC1] pt-1">
                    target = remote(&apos;ctf.sec.kernel.io&apos;, 1337)
                  </div>
                  <div className="text-[#BACAC1]">
                    elf = ELF(&apos;./chall_vuln.bin&apos;)
                  </div>
                  <div className="py-1 text-[#475569]">
                    <span className="text-[#242936] mr-2">01</span>
                    libc_leak = u64(target.recvline()[:8].ljust(8, b&apos;\x00&apos;)) - 0x21b150
                  </div>
                  <div className="text-[#475569]">
                    <span className="text-[#242936] mr-2">02</span>
                    rop = ROP(elf); rop.system(next(libc.search(b&apos;/bin/sh&apos;)))
                  </div>

                  {/* Terminal Shell Dump Output Box */}
                  <div className="mt-4 p-3 rounded-lg bg-[#12151C] border border-[#242936] text-white">
                    <div className="flex items-center justify-between text-[#475569] mb-1.5 text-[10px]">
                      <span>PIPE: /dev/pts/4</span>
                      <span className="text-[#22D3A0]">PAYLOAD_STATUS: SENT (148 bytes)</span>
                    </div>
                    <div className="text-[#22D3A0] font-mono text-xs flex items-center gap-1 font-semibold">
                      <span>[+] Got shell! UID=0(root) GID=0(root)</span>
                    </div>
                    <div className="text-white font-mono text-xs flex items-center gap-1.5 mt-1">
                      <span className="text-[#38BDF8]">flag_dump&gt;</span>
                      <span className="text-[#50F0BB] font-bold">WHUB&#123;k4slr_by_p4ss_h34p_st4ck_pwn3d_32b0&#125;</span>
                      <span className="w-2 h-4 bg-[#22D3A0] animate-pulse inline-block align-middle" />
                    </div>
                  </div>
                </div>

                {/* Window Status Footer */}
                <div className="px-4 py-2 bg-[#181C25] border-t border-[#242936] flex items-center justify-between text-[#475569] font-mono text-[11px]">
                  <span className="flex items-center gap-1.5 text-[#22D3A0]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Signed: ed25519:0x8fd2...b41a
                  </span>
                  <span>SHA-256 Validated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="w-full py-16 bg-[#0B0D12]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-2xl text-white tracking-tight">
                  Trending Writeups
                </h2>
                <p className="font-sans text-xs text-[#94A3B8]">
                  Peer-reviewed exploits, kernel bypasses, and verified solutions
                </p>
              </div>
            </div>

            <Link
              href="/explore"
              className="inline-flex items-center gap-1 text-xs font-mono text-[#22D3A0] hover:underline"
            >
              <span>View full directory</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingResult.items.map((writeup) => (
              <WriteupCard key={writeup.id} writeup={writeup} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Topics & Tags Ribbon */}
      <section className="w-full py-12 bg-[#10131A] border-t border-b border-[#242936]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
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
                className="px-2.5 py-1 rounded bg-[#181C25] hover:bg-[#1D2027] border border-[#242936] text-xs font-mono text-[#BACAC1] hover:text-[#22D3A0] transition-colors flex items-center gap-1.5"
              >
                <span>#{tag.name}</span>
                <span className="text-[10px] text-[#475569]">({tag.count})</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
