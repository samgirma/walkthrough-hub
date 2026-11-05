"use client";

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

      {/* Main Content: Edge-to-Edge Container with Animated Typewriter Heading */}
      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 xl:px-16 my-auto py-8">
        <div className="max-w-5xl flex flex-col items-start">
          {/* Animated "CTF Walkthrough" Typewriter (writes, pauses, clears, repeats continuously) */}
          <TypewriterHeading />
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
