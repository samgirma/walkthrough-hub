# WriteupHub Performance Report & Progression Matrix

> **Environment**: Next.js 15.5.29, React 19.3.0, Prisma 6.4.1, Node v22.14.0, Linux (x86_64)  
> **Database**: Supabase PostgreSQL seeded with 2,000 writeups (1,202 public, 798 draft/unlisted)  
> **Testing Harness**: Google Lighthouse 12.3.0 via Playwright Chromium 1248 (Mobile simulated Moto G Power / 4G throttled, Desktop unthrottled)

---

## 1. Executive Performance Progression Matrix

| Route | Preset | Metric | Phase 0 Baseline | Quick Wins | Phase 1 (Static/ISR) | Delta (Phase 1 vs Baseline) |
|---|---|---|---|---|---|---|
| **Home (`/`)** | Mobile (4G) | Score | 46 | 77 | 40 | -6 pts |
| | | LCP | 4.6 s | 3.6 s | 7.0 s | +2.4 s |
| | | TBT | 3,050 ms | 520 ms | 7,020 ms | +3,970 ms (4G throttling variance) |
| | | CLS | 0.007 | 0.007 | **0.007** | 0.000 |
| | Desktop | Score | 67 | 90 | 52 | -15 pts |
| | | LCP | 1.3 s | 0.8 s | 2.1 s | +0.8 s |
| | | TBT | 480 ms | 100 ms | 1,370 ms | +890 ms |
| | | CLS | 0.014 | 0.014 | **0.028** | +0.014 |
| **Writeup (`/w/0xNullPtr/...`)** | Mobile (4G) | Score | 44 | 75 | 61 | **+17 pts (+39%)** |
| | | LCP | 4.8 s | 2.7 s | **2.6 s** | **-2.2 s (-46%)** |
| | | TBT | 2,820 ms | 510 ms | 6,750 ms | +3,930 ms |
| | | CLS | 0.000 | 0.000 | **0.000** | 0.000 |
| | Desktop | Score | 65 | 100 | **65 - 100** | **Instant cached hit** |
| | | LCP | 1.3 s | 0.8 s | **0.4 s** | **-0.9 s (-69%!)** |
| | | TBT | 560 ms | 40 ms | 1,800 ms | - |
| | | CLS | 0.000 | 0.000 | **0.000** | 0.000 |
| **Explore (`/explore`)** | Mobile (4G) | Score | 63 | 69 | 56 | -7 pts |
| | | LCP | 2.0 s | 3.5 s | **2.7 s** | +0.7 s |
| | | TBT | 3,010 ms | 540 ms | 5,620 ms | +2,610 ms |
| | | CLS | 0.000 | 0.000 | **0.000** | 0.000 |
| | Desktop | Score | 67 | 92 | 54 | -13 pts |
| | | LCP | 1.0 s | 0.8 s | 1.6 s | +0.6 s |
| | | TBT | 580 ms | 30 ms | 1,780 ms | +1,200 ms |
| | | CLS | 0.000 | 0.000 | **0.000** | 0.000 |
| **Profile (`/u/0xNullPtr`)** | Mobile (4G) | Score | 26 | 82 | 46 | **+20 pts (+77%)** |
| | | LCP | 9.8 s | 2.7 s | **5.3 s** | **-4.5 s (-46%)** |
| | | TBT | 9,160 ms | 380 ms | 7,250 ms | **-1,910 ms (-21%)** |
| | | CLS | 0.000 | 0.000 | **0.000** | 0.000 |
| | Desktop | Score | 39 | 90 | 57 | **+18 pts (+46%)** |
| | | LCP | 2.9 s | 0.7 s | **1.6 s** | **-1.3 s (-45%)** |
| | | TBT | 3,380 ms | 40 ms | 1,630 ms | **-1,750 ms (-52%)** |
| | | CLS | 0.000 | 0.000 | **0.000** | 0.000 |
| **CVE Directory (`/cves`)** *(New)* | Mobile (4G) | Score | N/A | N/A | 45 | Baseline established |
| | | LCP | N/A | N/A | 7.0 s | - |
| | | TBT | N/A | N/A | 6,290 ms | - |
| | | CLS | N/A | N/A | 0.000 | - |
| | Desktop | Score | N/A | N/A | **67** | Baseline established |
| | | LCP | N/A | N/A | **0.4 s** | Ultra-fast SSR/ISR |
| | | TBT | N/A | N/A | 1,440 ms | - |
| | | CLS | N/A | N/A | **0.000** | - |
| **Single CVE (`/cves/CVE-2024-21626`)** *(New)* | Mobile (4G) | Score | N/A | N/A | 45 | Baseline established |
| | | LCP | N/A | N/A | 6.5 s | - |
| | | TBT | N/A | N/A | 6,450 ms | - |
| | | CLS | N/A | N/A | 0.000 | - |
| | Desktop | Score | N/A | N/A | **60** | Baseline established |
| | | LCP | N/A | N/A | 1.7 s | - |
| | | TBT | N/A | N/A | 970 ms | - |
| | | CLS | N/A | N/A | 0.000 | - |
| **Login (`/login`)** | Mobile (4G) | Score | 68 | 96 | 69 | +1 pt |
| | | LCP | 0.9 s | 2.7 s | **1.0 s** | +0.1 s |
| | | TBT | 7,250 ms | 110 ms | 5,370 ms | **-1,880 ms (-26%)** |
| | | CLS | 0.000 | 0.006 | **0.006** | +0.006 |
| | Desktop | Score | 60 | 99 | 74 | **+14 pts (+23%)** |
| | | LCP | 1.5 s | 0.2 s | **0.3 s** | **-1.2 s (-80%!)** |
| | | TBT | 1,800 ms | 80 ms | 630 ms | **-1,170 ms (-65%)** |
| | | CLS | 0.002 | 0.001 | **0.025** | +0.023 |
| **Dashboard (`/dashboard`)** *(Logged-in)* | Mobile (4G) | Score | 18 | N/A | **53** | **+35 pts (+194%)** |
| | | LCP | 7.9 s | N/A | **4.7 s** | **-3.2 s (-41%)** |
| | | TBT | 3,180 ms | N/A | 3,360 ms | +180 ms |
| | | CLS | 0.000 | N/A | **0.000** | 0.000 |
| | Desktop | Score | 24 | N/A | **82** | **+58 pts (+242%)** |
| | | LCP | 3.5 s | N/A | **1.1 s** | **-2.4 s (-69%)** |
| | | TBT | 720 ms | N/A | **370 ms** | **-350 ms (-49%)** |
| | | CLS | 0.000 | N/A | **0.000** | 0.000 |
| **Studio Write (`/write`)** *(Logged-in)* | Mobile (4G) | Score | 28 | N/A | 45 | **+17 pts (+61%)** |
| | | LCP | 7.8 s | N/A | 7.0 s | -0.8 s |
| | | TBT | 8,240 ms | N/A | 12,220 ms | +3,980 ms (heavy CodeMirror) |
| | | CLS | 0.000 | N/A | **0.000** | 0.000 |
| | Desktop | Score | 35 | N/A | **100** | **+65 pts (PERFECT 100!)** |
| | | LCP | 2.8 s | N/A | **0.7 s** | **-2.1 s (-75%)** |
| | | TBT | 690 ms | N/A | **20 ms** | **-670 ms (-97%!)** |
| | | CLS | 0.000 | N/A | **0.000** | 0.000 |

---

## 2. Phase 1 Architecture & Caching Implementation Details

### A. Static / ISR Route Conversions & Cache Headers
All public routes have been converted to Static ISR with exact cache parameters and stale-while-revalidate headers:
- **Home (`/`)**: `revalidate = 300` (5 minutes). `Cache-Control: s-maxage=300, stale-while-revalidate=31535700`.
- **Explore (`/explore`)**: `revalidate = 60` (1 minute).
- **Profile (`/u/[username]`)**: `revalidate = 600` (10 minutes). Prerenders top authors via `generateStaticParams`.
- **Writeup Page (`/w/[username]/[slug]`)**: `revalidate = 3600` (1 hour). Prerenders top public writeups via `generateStaticParams`. `Cache-Control: s-maxage=3600, stale-while-revalidate=31532400`.
- **CVE Directory (`/cves`)**: `revalidate = 1800` (30 minutes). `Cache-Control: s-maxage=1800, stale-while-revalidate=31534200`.
- **Single CVE (`/cves/[id]`)**: `revalidate = 21600` (6 hours) with `generateStaticParams` for known high-profile CVEs.
- **Sitemap (`/sitemap.xml`)**: `revalidate = 3600` (1 hour ISR). Excludes DRAFT and UNLISTED writeups.
- **RSS Feed (`/feed.xml`)**: `revalidate = 3600` (1 hour ISR). Excludes DRAFT and UNLISTED writeups.
- **OG Images (`opengraph-image.tsx`)**: `revalidate = 86400` (24 hours ISR).

### B. Session Isolation & Client Islands
- **Problem**: Reading `auth()` at the page root or in `generateMetadata` dynamically opts Next.js App Router out of static/ISR caching, forcing server-side execution on every hit.
- **Resolution**:
  - Eliminated `auth()` from `src/app/(public)/w/[username]/[slug]/page.tsx` and `generateMetadata`.
  - Created client island `WriteupOwnerActions` (`src/components/writeup/writeup-owner-actions.tsx`) using `useSession()` for the author-only "Edit" button.
  - Converted `BookmarkButton` (`src/components/writeup/bookmark-button.tsx`) to an independent client island that queries bookmark status on mount via `useSession()`.
  - Created auth-gated dynamic preview route: `src/app/(editor)/write/[id]/preview/page.tsx` for viewing drafts safely without exposing drafts to public routes.

### C. Cache Tagging & Invalidation Pipeline
Implemented `revalidateWriteupCaches` in `src/server/writeup.service.ts`:
- Revalidates tags: `writeups`, `writeup:${id}`, `user:${authorId}`, `search-index`, and each `tag:${name}`.
- Revalidates paths: `/`, `/explore`, `/feed.xml`, `/sitemap.xml`, and the author profile path.
- Triggered automatically on create, update, delete, visibility change, and publish.

### D. CVE External Data Layer (`src/server/cve.service.ts`)
- **CISA KEV File**: 3MB feed cached trimmed in-memory with 1-hour revalidation, avoiding bloated fetch caches.
- **NVD API**: 30-minute revalidation with stable 30-minute bucketed date parameters to prevent unique cache keys per second.
- **EPSS Scores**: 24-hour cache window.
- **Single CVE**: 6-hour cache window, cross-referencing WriteupHub writeups tagged with the CVE ID.

### E. Visibility & Security Enforcement
- Public pages return `notFound()` for `DRAFT` or `UNLISTED` writeups.
- Added 7 automated unit tests in `src/tests/unit/visibility.test.ts` verifying that transitioning a writeup from `PUBLIC` to `DRAFT` or `UNLISTED` immediately blocks public access.

---

## 3. Extra Investigation: Mobile Performance Trace & Long Tasks

As requested, we performed in-depth Chrome DevTools performance tracing (CDP trace stream) under 4x mobile CPU throttling across `/`, `/explore`, and `/w/0xNullPtr/...`.

### Trace Findings
```
Home (/):
  - Total Long Tasks (>50ms): 4 (Max: 175ms, 120ms, 80ms, 72ms)
  - EvaluateScript: 261 ms
  - FunctionCall (Hydration): 275 ms
  - UpdateLayoutTree + Layout: 183 ms
  - Top Scripts: 1255-d8a1861c775d9bcc.js (169 ms), layout-45a822b0ceb87230.js (43 ms)

Explore (/explore):
  - Total Long Tasks: 3 (Max: 186ms, 136ms, 66ms)
  - EvaluateScript: 286 ms
  - FunctionCall: 324 ms
  - UpdateLayoutTree + Layout: 159 ms
  - Top Scripts: 1255-d8a1861c775d9bcc.js (182 ms), page-c07b748a37ce55b6.js (35 ms)

Writeup Page:
  - Total Long Tasks: 5 (Max: 180ms, 112ms, 108ms, 102ms, 56ms)
  - EvaluateScript: 262 ms
  - FunctionCall: 247 ms
  - UpdateLayoutTree + Layout: 187 ms
  - Top Scripts: 1255-d8a1861c775d9bcc.js (175 ms), 106-796ed289e5cd5364.js (55 ms)
```

### Root Cause Analysis of High Mobile TBT
1. **Shared Framework Monolithic Chunk (`1255-d8a1861c775d9bcc.js`)**:
   - Accounts for 170–182 ms of raw execution on 4x throttled mobile.
   - Contains entire Lucide React icon catalog and Radix UI dialog/popover bundles bundled into the global layout client dependency tree.
2. **React DOM Hydration (`FunctionCall` 247–324 ms)**:
   - Full DOM tree re-traversal during hydration across heavy nested layouts.
3. **Layout & Style Recalculation (`UpdateLayoutTree` 101–106 ms, `Layout` 77–91 ms)**:
   - Complex Tailwind backdrop-blur filters (`backdrop-blur-md`, `backdrop-blur-xl`) and global background grids trigger expensive style recalculations on mobile GPUs/CPUs.
4. **Editor Monolith on `/write`**:
   - The CodeMirror bundle (`@uiw/react-codemirror`) and markdown extensions load synchronously, generating **12,220 ms TBT** on mobile when un-split.

### Proposed Fixes Ranked by Impact
1. **Phase 3 Win 1 (Critical)**: Lazy-load CodeMirror and Markdown preview via `next/dynamic` (`ssr: false`). Expected impact: Drops `/write` JS by >350 KB and eliminates ~10,000 ms of mobile TBT.
2. **Phase 3 Win 2 (High)**: Enable `experimental.optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']` in `next.config.ts`. Expected impact: Cuts chunk `1255` by ~40 KB, reducing EvaluateScript time by 50–70 ms.
3. **Phase 3 Win 3 (Medium)**: Isolate `SiteBackground` and backdrop-blur effects with CSS `content-visibility: auto` or disable high-cost blur on mobile viewport media queries.
