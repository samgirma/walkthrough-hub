"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Terminal, Shield, Zap, Globe, Sparkles } from "lucide-react";

const ROTATING_TEXTS = [
  "CTF Walkthroughs",
  "Zero-Day Exploits",
  "Vulnerability Research",
  "Kernel & Pwn Solutions",
  "Binary Decompilations",
];

export function TypewriterHeading() {
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const currentTarget = ROTATING_TEXTS[textIndex];

  useEffect(() => {
    // If reduced motion is requested, display full text immediately
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayText(ROTATING_TEXTS[0]);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    if (!isDeleting) {
      // Writing phase: typing letter-by-letter
      if (displayText.length < currentTarget.length) {
        const nextCharDelay = 100 + Math.random() * 30;
        timeoutId = setTimeout(() => {
          setDisplayText(currentTarget.slice(0, displayText.length + 1));
        }, nextCharDelay);
      } else {
        // Full text reached: pause so it's fully readable
        timeoutId = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      // Deleting phase: backspacing letter-by-letter
      if (displayText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentTarget.slice(0, displayText.length - 1));
        }, 45);
      } else {
        // Completely cleared: switch to next text and start typing
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % ROTATING_TEXTS.length);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, isDeleting, currentTarget]);

  return (
    <div className="flex flex-col items-start gap-6 select-none max-w-4xl">
      {/* Live System Status Beacon */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12151C]/90 border border-[#242936] font-mono text-[11px] text-[#BACAC1] shadow-lg backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22D3A0] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22D3A0]" />
        </span>
        <span className="text-white font-semibold">WRITEUPHUB TELEMETRY</span>
        <span className="text-[#475569]">{"//"}</span>
        <span className="text-[#22D3A0]">OPEN OFFENSIVE INTELLIGENCE</span>
      </div>

      {/* Main Animated Title */}
      <div className="flex items-center min-h-[1.25em]">
        <h1 className="font-mono text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white flex items-center drop-shadow-[0_0_35px_rgba(34,211,160,0.35)]">
          <span className="bg-gradient-to-r from-white via-[#E0E2EC] to-[#50F0BB] bg-clip-text text-transparent">
            {displayText}
          </span>
          <span
            aria-hidden="true"
            className="inline-block w-2 sm:w-3 md:w-4 lg:w-5 h-[0.82em] bg-[#22D3A0] ml-2 animate-pulse shadow-[0_0_15px_#22D3A0] align-middle"
          />
        </h1>
      </div>

      {/* Punchy Animated System Description */}
      <div className="space-y-4">
        <p className="font-sans text-sm sm:text-base md:text-lg text-[#BACAC1] max-w-2xl leading-relaxed">
          The open intelligence archive for verified exploit solutions, memory corruption analyses, and real-time zero-day breakdowns. Built for offensive security researchers and defensive engineers.
        </p>

        {/* Feature Highlights Ribbon */}
        <div className="flex items-center gap-2 flex-wrap font-mono text-xs text-[#94A3B8]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181C25]/80 border border-[#242936]">
            <Shield className="h-3 w-3 text-[#22D3A0]" />
            <span>Verified PoCs</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181C25]/80 border border-[#242936]">
            <Zap className="h-3 w-3 text-[#38BDF8]" />
            <span>Real-time CVEs</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181C25]/80 border border-[#242936]">
            <Globe className="h-3 w-3 text-amber-400" />
            <span>Global CTF Events</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181C25]/80 border border-[#242936]">
            <Terminal className="h-3 w-3 text-purple-400" />
            <span>Multi-Arch Decomp</span>
          </span>
        </div>

        {/* Hero Quick Navigation CTAs */}
        <div className="flex items-center gap-3 pt-2 flex-wrap font-mono text-xs">
          <Link
            href="/explore"
            className="px-5 py-3 rounded-xl gradient-cta text-[#0B0D12] font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,160,0.3)] hover:shadow-[0_0_25px_rgba(34,211,160,0.5)] transition-all min-h-[44px]"
          >
            <span>Explore Writeups</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/ctf-sites"
            className="px-4 py-3 rounded-xl bg-[#12151C]/90 hover:bg-[#181C25] text-white border border-[#242936] hover:border-[#363E52] transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <Globe className="h-3.5 w-3.5 text-[#22D3A0]" />
            <span>CTF Platforms</span>
          </Link>

          <Link
            href="/events"
            className="px-4 py-3 rounded-xl bg-[#12151C]/90 hover:bg-[#181C25] text-white border border-[#242936] hover:border-[#363E52] transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Live Tournaments</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
