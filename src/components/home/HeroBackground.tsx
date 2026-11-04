"use client";

import React from "react";

export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none"
      style={{
        backgroundColor: "#0B0D12",
        // Inline base64 dark cyber placeholder prevents any flash before image paint
        backgroundImage:
          'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 9\'%3E%3Crect width=\'16\' height=\'9\' fill=\'%230B0D12\'/%3E%3Ccircle cx=\'11\' cy=\'5\' r=\'4\' fill=\'%2312151C\' filter=\'blur(2px)\'/%3E%3Ccircle cx=\'8\' cy=\'1\' r=\'3\' fill=\'%23381A22\' opacity=\'0.3\' filter=\'blur(2px)\'/%3E%3C/svg%3E")',
        backgroundSize: "cover",
      }}
    >
      {/* 
        <picture> with responsive AVIF / WebP srcset.
        Mobile <= 767px serves 1x & @2x mobile crop (centered around the terminal/desk figure).
        Desktop >= 768px serves the 1920x1080 full scenery.
      */}
      <picture className="w-full h-full block">
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
          className="absolute inset-0 h-full w-full object-cover hero-zoom-desktop transition-transform duration-1000 ease-out"
          style={{
            objectPosition: "var(--hero-img-pos, 65% center)",
          }}
        />
      </picture>

      {/* Dynamic media-query inline style for CSS variables controlling object position */}
      <style jsx>{`
        img {
          --hero-img-pos: var(--hero-pos-mobile, 65% center);
        }
        @media (min-width: 768px) {
          img {
            --hero-img-pos: var(--hero-pos-desktop, center center);
          }
        }
      `}</style>

      {/* --- Overlays for WCAG AA readability over the busiest illustration areas --- */}

      {/* 1. Top-to-bottom depth gradient: darker at top & bottom so navbar and hero bottom merge seamlessly */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D12]/75 via-[#0B0D12]/40 to-[#0B0D12]" />

      {/* 2. Desktop Left-to-right gradient: ensures high-contrast readability behind text column */}
      <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#0B0D12]/95 via-[#0B0D12]/65 to-transparent w-full" />

      {/* 3. Subtle radial vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, transparent 20%, rgba(11, 13, 18, 0.6) 80%, rgba(11, 13, 18, 0.95) 100%)",
        }}
      />

      {/* 4. Fine cyber grid texture overlay (CSS only, no extra network images) */}
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #242936 1px, transparent 1px), linear-gradient(to bottom, #242936 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
