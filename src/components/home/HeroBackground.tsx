"use client";

import React from "react";

export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none bg-[#0B0D12]"
    >
      {/* 
        <picture> with responsive AVIF / WebP srcset.
        Mobile <= 767px serves mobile crop (centered around the cyber desk figure).
        Desktop >= 768px serves the 1920x1080 full scenery.
      */}
      <picture className="absolute inset-0 w-full h-full block">
        {/* Mobile: AVIF (1x and 2x) */}
        <source
          media="(max-width: 767px)"
          type="image/avif"
          srcSet="/hero/hero-mobile.avif 1x, /hero/hero-mobile@2x.avif 2x"
        />
        {/* Mobile: WebP (1x and 2x) */}
        <source
          media="(max-width: 767px)"
          type="image/webp"
          srcSet="/hero/hero-mobile.webp 1x, /hero/hero-mobile@2x.webp 2x"
        />
        {/* Desktop: AVIF */}
        <source
          media="(min-width: 768px)"
          type="image/avif"
          srcSet="/hero/hero-desktop.avif"
        />
        {/* Desktop: WebP */}
        <source
          media="(min-width: 768px)"
          type="image/webp"
          srcSet="/hero/hero-desktop.webp"
        />
        {/* Fallback <img>: Desktop JPG */}
        <img
          src="/hero/hero-desktop.jpg"
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          loading="eager"
          alt=""
          className="w-full h-full object-cover object-[65%_center] md:object-center hero-zoom-desktop transition-transform duration-1000 ease-out"
        />
      </picture>

      {/* --- Minimal Edge Fades to keep typography crisp without obscuring the artwork --- */}

      {/* 1. Subtle top gradient so top navbar text remains crisp */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#0B0D12]/70 via-[#0B0D12]/20 to-transparent pointer-events-none" />

      {/* 2. Soft left tint behind typewriter text */}
      <div className="absolute inset-y-0 left-0 w-full sm:w-2/3 lg:w-1/2 bg-gradient-to-r from-[#0B0D12]/60 via-[#0B0D12]/20 to-transparent pointer-events-none" />
    </div>
  );
}
