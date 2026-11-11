import React from "react";
import { ChevronDown } from "lucide-react";
import { HeroBackground } from "@/components/home/HeroBackground";
import { TypewriterHeading } from "@/components/home/TypewriterHeading";

interface HeroProps {
  categories?: {
    name: string;
    param: string;
    count?: string;
    color?: string;
  }[];
}

export function Hero({}: HeroProps) {
  return (
    <section className="relative w-full h-[100svh] min-h-[100svh] flex flex-col justify-between overflow-hidden border-b border-[#242936]/60">
      {/* Background Cyber Artwork filling 100% of the screen */}
      <HeroBackground />

      {/* Top spacer matching fixed navbar height */}
      <div className="h-16 shrink-0" aria-hidden="true" />

      {/* Main Content: Edge-to-Edge Container with Animated Typewriter & Semantic H1 */}
      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 xl:px-16 my-auto py-8">
        <div className="w-full max-w-7xl flex flex-col items-start gap-3 sm:gap-4">
          {/* Decorative animated showcase (single-line typewriter) */}
          <TypewriterHeading />

          {/* Semantic primary H1 for search engines & accessibility */}
          <h1 className="font-sans font-extrabold text-[clamp(1.3rem,2.6vw,2.15rem)] text-[#E0E2EC] tracking-tight max-w-4xl leading-snug drop-shadow-[0_2px_16px_rgba(11,13,18,0.85)]">
            Open Intelligence Archive for Verified{" "}
            <span className="text-[#50F0BB]">CTF Writeups</span> &amp;{" "}
            <span className="text-[#38BDF8]">CVE Research</span>
          </h1>
        </div>
      </div>

      {/* Subtle Scroll Indicator at Bottom */}
      <div className="relative z-10 w-full px-4 sm:px-8 pb-5 flex items-center justify-end text-[11px] font-mono text-[#94A3B8] select-none pointer-events-none">
        <div className="flex items-center gap-1.5 text-[#BACAC1] animate-bounce">
          <span>SCROLL</span>
          <ChevronDown className="h-3.5 w-3.5 text-[#22D3A0]" />
        </div>
      </div>
    </section>
  );
}
