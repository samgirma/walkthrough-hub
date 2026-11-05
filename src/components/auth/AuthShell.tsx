import React from "react";

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="relative w-full min-h-[100svh] overflow-x-hidden overflow-y-auto bg-[#0B0D12] font-sans flex flex-col justify-end md:justify-center md:items-start select-none">
      {/* 
        Responsive Full-Bleed Artwork:
        - Desktop: hero-desktop.* (AVIF/WebP/JPG fallback), object-position 68% center
        - Mobile: hero-mobile.* (1x & @2x srcset), object-position 64% 30%
      */}
      <picture className="absolute inset-0 w-full h-full block pointer-events-none select-none">
        {/* Mobile AVIF (1x and 2x) */}
        <source
          media="(max-width: 767px)"
          type="image/avif"
          srcSet="/hero/hero-mobile.avif 1x, /hero/hero-mobile@2x.avif 2x"
        />
        {/* Mobile WebP (1x and 2x) */}
        <source
          media="(max-width: 767px)"
          type="image/webp"
          srcSet="/hero/hero-mobile.webp 1x, /hero/hero-mobile@2x.webp 2x"
        />
        {/* Desktop AVIF */}
        <source
          media="(min-width: 768px)"
          type="image/avif"
          srcSet="/hero/hero-desktop.avif"
        />
        {/* Desktop WebP */}
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
          className="w-full h-full object-cover object-[64%_30%] md:object-[68%_center]"
        />
      </picture>

      {/* --- Desktop Gradient Overlays (>= 768px) --- */}
      {/* 1. Horizontal gradient: dark left-hand side behind the card */}
      <div
        className="hidden md:block absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(11,13,18,0.94) 0%, rgba(11,13,18,0.62) 42%, rgba(11,13,18,0.18) 100%)",
        }}
      />
      {/* 2. Bottom-center radial vignette */}
      <div
        className="hidden md:block absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 120%, rgba(11,13,18,0.7), transparent 60%)",
        }}
      />

      {/* --- Mobile Gradient Overlay (< 768px) --- */}
      {/* Vertical fade: transparent top, deep black bottom where content sits */}
      <div
        className="block md:hidden absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(11,13,18,0.15) 30%, rgba(11,13,18,0.90) 54%, #0B0D12 72%)",
        }}
      />

      {/* 
        Content Placement Container:
        - Desktop: Left aligned with padding-left clamp(24px, 9vw, 140px), padded card.
        - Mobile: Bottom-aligned content without card box, padding 0 24px 32px + safe-area inset.
      */}
      <div className="relative z-10 w-full md:w-auto md:min-h-[100svh] md:flex md:items-center px-6 md:px-0 py-8 md:py-12 box-border md:pl-[clamp(24px,9vw,140px)] pb-[max(32px,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-[400px] mx-auto md:mx-0 box-border p-0 md:p-[36px] rounded-none md:rounded-[20px] bg-transparent md:bg-[rgba(14,17,24,0.74)] md:backdrop-blur-[14px] border-none md:border md:border-white/[0.09] shadow-none md:shadow-[0_30px_80px_rgba(0,0,0,0.55),0_0_70px_rgba(34,211,160,0.08)] flex flex-col gap-6 md:gap-[28px]">
          {children}
        </div>
      </div>
    </main>
  );
}
