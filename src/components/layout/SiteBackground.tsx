import React from "react";

export function SiteBackground() {
  return (
    <>
      {/* 
        Low-priority preloads for the global world map background.
        Placed with fetchPriority="low" so it never competes with the critical hero image LCP.
      */}
      <link
        rel="preload"
        as="image"
        type="image/avif"
        media="(min-width: 1024px)"
        href="/bg/bg-world-1920.avif"
        fetchPriority="low"
      />
      <link
        rel="preload"
        as="image"
        type="image/avif"
        media="(max-width: 1023px)"
        href="/bg/bg-world-1280.avif"
        fetchPriority="low"
      />

      {/* 
        Fixed Global Background Container
        Using fixed positioning rather than background-attachment: fixed (which breaks on iOS Safari).
      */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none select-none overflow-hidden bg-[#0B0D12]"
      >
        {/* World Map Picture Element - Native browser image decoding & responsive art direction */}
        <picture className="absolute inset-0 w-full h-full block site-world-bg">
          <source
            media="(min-width: 1024px)"
            type="image/avif"
            srcSet="/bg/bg-world-1920.avif"
          />
          <source
            media="(min-width: 1024px)"
            type="image/webp"
            srcSet="/bg/bg-world-1920.webp"
          />
          <source
            media="(min-width: 1024px)"
            srcSet="/bg/bg-world-1920.jpg"
          />
          <source
            media="(max-width: 1023px)"
            type="image/avif"
            srcSet="/bg/bg-world-1280.avif"
          />
          <source
            media="(max-width: 1023px)"
            type="image/webp"
            srcSet="/bg/bg-world-1280.webp"
          />
          <img
            src="/bg/bg-world-1920.jpg"
            alt=""
            fetchPriority="low"
            decoding="async"
            className="w-full h-full object-cover object-top opacity-60 dark:opacity-55 transition-opacity duration-700"
          />
        </picture>

        {/* Overlay 1: Subtle top & bottom vignette to protect nav & footer text readability */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11, 13, 18, 0.45) 0%, transparent 22%, transparent 78%, rgba(11, 13, 18, 0.8) 100%)",
          }}
        />

        {/* Overlay 2: Faint Cyber Matrix Grid Texture (4% opacity) */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "linear-gradient(to right, #22D3A0 1px, transparent 1px), linear-gradient(to bottom, #22D3A0 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>
    </>
  );
}
