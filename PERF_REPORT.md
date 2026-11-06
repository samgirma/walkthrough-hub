# WriteupHub Performance Report & Progression Matrix

> **Environment**: Next.js 15.5.29, React 19.3.0, Prisma 6.4.1, Node v22.14.0, Linux (x86_64)  
> **Database**: Supabase PostgreSQL seeded with 2,000 writeups (1,202 public, 798 draft/unlisted)  
> **Testing Harness**: Google Lighthouse 12.3.0 via Playwright Chromium 1248 (Mobile simulated Moto G Power / 4G throttled, Desktop unthrottled)

---

## 1. Executive Performance Progression Matrix

| Route | Preset | Metric | Phase 0 Baseline | Quick Wins | Delta / Improvement |
|---|---|---|---|---|---|
| **Home (`/`)** | Mobile (4G) | Score | 46 | **77** | **+31 pts (+67%)** |
| | | LCP | 4.6 s | **3.6 s** | **-1.0 s (-22%)** |
| | | TBT | 3,050 ms | **520 ms** | **-2,530 ms (-83%)** |
| | | CLS | 0.007 | 0.007 | 0.000 |
| | Desktop | Score | 67 | **90** | **+23 pts (+34%)** |
| | | LCP | 1.3 s | **0.8 s** | **-0.5 s (-38%)** |
| | | TBT | 480 ms | **100 ms** | **-380 ms (-79%)** |
| | | CLS | 0.014 | 0.014 | 0.000 |
| **Profile (`/u/0xNullPtr`)** | Mobile (4G) | Score | 26 | **82** | **+56 pts (+215%)** |
| | | LCP | 9.8 s | **2.7 s** | **-7.1 s (-72%)** |
| | | TBT | 9,160 ms | **380 ms** | **-8,780 ms (-96%)** |
| | | CLS | 0.000 | 0.000 | 0.000 |
| | Desktop | Score | 39 | **90** | **+51 pts (+131%)** |
| | | LCP | 2.9 s | **0.7 s** | **-2.2 s (-76%)** |
| | | TBT | 3,380 ms | **40 ms** | **-3,340 ms (-99%)** |
| | | CLS | 0.000 | 0.000 | 0.000 |
| **Writeup (`/w/0xNullPtr/...`)** | Mobile (4G) | Score | 44 | **75** | **+31 pts (+70%)** |
| | | LCP | 4.8 s | **2.7 s** | **-2.1 s (-44%)** |
| | | TBT | 2,820 ms | **510 ms** | **-2,310 ms (-82%)** |
| | | CLS | 0.000 | 0.000 | 0.000 |
| | Desktop | Score | 65 | **100** | **+35 pts (PERFECT 100)** |
| | | LCP | 1.3 s | **0.8 s** | **-0.5 s (-38%)** |
| | | TBT | 560 ms | **40 ms** | **-520 ms (-93%)** |
| | | CLS | 0.000 | 0.000 | 0.000 |
| **Explore (`/explore`)** | Mobile (4G) | Score | 63 | **69** | **+6 pts** |
| | | LCP | 2.0 s | 3.5 s | +1.5 s (cold query) |
| | | TBT | 3,010 ms | **540 ms** | **-2,470 ms (-82%)** |
| | | CLS | 0.000 | 0.000 | 0.000 |
| | Desktop | Score | 67 | **92** | **+25 pts (+37%)** |
| | | LCP | 1.0 s | **0.8 s** | **-0.2 s (-20%)** |
| | | TBT | 580 ms | **30 ms** | **-550 ms (-95%)** |
| | | CLS | 0.000 | 0.000 | 0.000 |
| **Login (`/login`)** | Mobile (4G) | Score | 68 | **96** | **+28 pts (+41%)** |
| | | LCP | 0.9 s | 2.7 s | +1.8 s |
| | | TBT | 7,250 ms | **110 ms** | **-7,140 ms (-98%)** |
| | | CLS | 0.000 | 0.006 | +0.006 |
| | Desktop | Score | 60 | **99** | **+39 pts (+65%)** |
| | | LCP | 1.5 s | **0.2 s** | **-1.3 s (-87%)** |
| | | TBT | 1,800 ms | **80 ms** | **-1,720 ms (-96%)** |
| | | CLS | 0.002 | 0.001 | -0.001 |

---

## 2. Quick Wins Analysis & Observations

### Quick Win 1: Mobile Hero LCP Preload Optimization
- **Problem in Baseline**: The previous manual preload targeted `/hero/hero-desktop.avif` on desktop, but on mobile browsers with high device pixel ratio (DPR > 1.5), the browser selected `hero-mobile@2x.avif` which had no preload tag. The image download had to wait for DOM construction and layout discovery, causing a 5.6s resource load delay.
- **Resolution**:
  - Removed `"use client"` directives from `HeroBackground.tsx` and `Hero.tsx` to render the hero section entirely server-side.
  - Added matching responsive preload in `page.tsx`:
    ```tsx
    <link
      rel="preload"
      as="image"
      type="image/avif"
      media="(max-width: 767px)"
      imageSrcSet="/hero/hero-mobile.avif 1x, /hero/hero-mobile@2x.avif 2x"
      fetchPriority="high"
    />
    ```
- **Result**: Mobile LCP dropped from 4.6s to 3.6s (-1.0s). Desktop LCP dropped from 1.3s to 0.8s (-0.5s).

### Quick Win 2: Profile Page Cursor Pagination & Field Pruning
- **Problem in Baseline**: Profile page (`/u/[username]`) fetched and rendered all 1,200 writeups authored by `0xNullPtr` in a single query. Generating and hydrating 1,200 DOM cards resulted in 9.8s LCP and a catastrophic 9,160 ms TBT on mobile (and 3,380 ms TBT on desktop).
- **Resolution**:
  - Updated `getUserProfile` in `src/server/auth.service.ts` to implement cursor-based pagination with `limit: 12` (`take: limit + 1`).
  - Pruned Prisma query to select only card fields: `id, title, slug, excerpt, category, difficulty, ctfName, eventYear, publishedAt, viewCount, readingTime, tags, author`.
  - Added `loadMoreUserWriteupsAction` server action in `src/server/auth.actions.ts`.
  - Created client island `ProfileWriteupsFeed` in `src/app/(public)/u/[username]/profile-writeups-feed.tsx` with progressive "Load More" button.
- **Result**: Mobile LCP dropped from 9.8s to 2.7s (-7.1s). Mobile TBT dropped from 9,160ms to 380ms (-8,780ms, a 96% reduction!). Desktop score rose from 39 to 90.

### Quick Win 3: Narrowing Middleware Matcher
- **Problem in Baseline**: Next.js Edge Middleware executed on every incoming request, including public pages (`/`, `/explore`, `/w/[username]/[slug]`, `/u/[username]`), running session token decoding and edge routing overhead (99.4 KB middleware chunk).
- **Resolution**: Narrowed matcher in `src/middleware.ts` to protected routes only:
  ```ts
  export const config = {
    matcher: ["/dashboard/:path*", "/write/:path*", "/onboarding"],
  };
  ```
- **Result**: Public pages completely bypass the edge middleware layer, reducing TTFB and eliminating edge JS execution overhead.

### Quick Win 4: Self-Hosted `next/font`, Lazy Telegram Widget, and `next/image` Avatars
- **Problem in Baseline**:
  - Fonts were loaded via external Google Fonts `@import` inside `globals.css`, blocking page rendering.
  - The Telegram authentication script was loaded eagerly on `/login`, injecting external scripts and executing heavy JS on the main thread (7,250 ms TBT).
  - Avatars across cards and navbar used raw `<img>` tags without explicit dimensions, causing layout shift and missing AVIF/WebP optimization.
- **Resolution**:
  - Switched font loading to `next/font/google` in `src/app/layout.tsx` for `Inter` and `JetBrains_Mono` with `display: "swap"` and CSS variables `--font-inter` and `--font-mono`.
  - Dynamically imported `TelegramAuthButton` via `next/dynamic` (`ssr: false`) inside `src/app/(auth)/login/login-content.tsx` and `connected-accounts.tsx` so the script is only loaded when activated.
  - Converted avatar images in `WriteupCard`, `Navbar`, and profile/writeup pages to `next/image` with explicit `width`, `height`, and modern responsive sizing.
- **Result**:
  - Login Mobile TBT dropped from 7,250ms to 110ms (-98%!). Desktop score jumped to 99.
  - Writeup page desktop score achieved a perfect 100/100.
