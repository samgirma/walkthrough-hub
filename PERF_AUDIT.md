# WriteupHub Comprehensive Performance Audit (Phase 0)

> **Audit Date**: 2026-11-06  
> **Target Application**: WriteupHub (Cybersecurity CTF Writeup Platform)  
> **Environment**: Linux (x86_64), Node.js v26.13.0, Next.js 15.5.29, React 19.3.1, Prisma 6.19.3  
> **Database**: PostgreSQL on Supabase (`aws-0-us-east-1.pooler.supabase.com:6543`) with PgBouncer session pooling  

---

## 1. Version & System Environment

| Technology | Installed Version | Target / Constraint | Status / Notes |
|---|---|---|---|
| **Node.js** | `v26.13.0` | Node 20+ | Active runtime |
| **Next.js** | `15.5.29` | Next.js 15 (App Router) | Major upgrade frozen; no experimental flags enabled without prior approval |
| **React** | `19.3.1` | React 19 | RC/Production channel |
| **React DOM**| `19.3.1` | React 19 | Matches React runtime |
| **Prisma** | `6.19.3` | Prisma 6 | PostgreSQL Client & Migrations |
| **Auth.js** | `5.0.0-beta.25` | NextAuth v5 Beta | JWT Strategy, PrismaAdapter |
| **Database** | PostgreSQL 15 (Supabase) | Managed Postgres | Direct connection + Port 6543 Transaction/Session Pooler |

---

## 2. Route Rendering Mode Audit (`next build`)

Current output of production build (`next build`):

```text
Route (app)                                         Size  First Load JS  Rendering Mode
┌ ƒ /                                            1.98 kB         112 kB  Dynamic (Server-Rendered)
├ ○ /_not-found                                     1 kB         108 kB  Static
├ ƒ /api/auth/[...nextauth]                        176 B         107 kB  Dynamic
├ ƒ /api/auth/check-username                       176 B         107 kB  Dynamic
├ ƒ /api/auth/register                             176 B         107 kB  Dynamic
├ ƒ /api/auth/telegram/callback                    176 B         107 kB  Dynamic
├ ƒ /api/bookmarks                                 176 B         107 kB  Dynamic
├ ƒ /api/profile                                   176 B         107 kB  Dynamic
├ ƒ /api/upload                                    176 B         107 kB  Dynamic
├ ƒ /api/writeups                                  176 B         107 kB  Dynamic
├ ƒ /api/writeups/[id]                             176 B         107 kB  Dynamic
├ ƒ /api/writeups/[id]/views                       176 B         107 kB  Dynamic
├ ○ /apple-icon.png                                  0 B            0 B  Static
├ ƒ /dashboard                                     170 B         111 kB  Dynamic (Auth DAL Gate)
├ ƒ /dashboard/admin                             11.9 kB         149 kB  Dynamic (Role Gate)
├ ƒ /dashboard/bookmarks                           170 B         111 kB  Dynamic (Auth DAL Gate)
├ ƒ /dashboard/settings                          23.6 kB         171 kB  Dynamic (Auth DAL Gate)
├ ƒ /dashboard/writeups                            170 B         111 kB  Dynamic (Auth DAL Gate)
├ ƒ /explore                                     5.84 kB         137 kB  Dynamic (Server-Rendered)
├ ƒ /feed.xml                                      176 B         107 kB  Dynamic (Server-Rendered)
├ ○ /icon.svg                                        0 B            0 B  Static
├ ƒ /login                                       5.93 kB         138 kB  Dynamic
├ ƒ /onboarding                                  4.54 kB         136 kB  Dynamic (Auth DAL Gate)
├ ƒ /register                                      176 B         107 kB  Dynamic (Redirects)
├ ○ /robots.txt                                    176 B         107 kB  Static
├ ƒ /sitemap.xml                                   176 B         107 kB  Dynamic (Server-Rendered)
├ ƒ /u/[username]                                  170 B         111 kB  Dynamic (Server-Rendered)
├ ƒ /w/[username]/[slug]                         4.78 kB         142 kB  Dynamic (Server-Rendered)
├ ƒ /w/[username]/[slug]/opengraph-image           176 B         107 kB  Dynamic
├ ƒ /write                                         152 B         174 kB  Dynamic (Auth DAL Gate)
└ ƒ /write/[id]                                    151 B         174 kB  Dynamic (Auth DAL Gate)
+ First Load JS shared by all                     107 kB
  ├ chunks/1255-d8a1861c775d9bcc.js              46.3 kB
  ├ chunks/4bd1b696-100b9d70ed4e49c1.js          54.2 kB
  └ other shared chunks (total)                  6.47 kB

Middleware: 99.3 kB
○ (Static): 4 routes
ƒ (Dynamic): 26 routes (87% of all routes!)
```

### Why Everything Is Currently Dynamic:

1. **Explicit `force-dynamic` Route Segment Configs**:
   - `src/app/(public)/page.tsx:10`: `export const dynamic = "force-dynamic";`
   - `src/app/(public)/explore/page.tsx:16`: `export const dynamic = "force-dynamic";`
   - `src/app/(public)/w/[username]/[slug]/page.tsx:44`: `export const dynamic = "force-dynamic";`
   - `src/app/(public)/u/[username]/page.tsx:24`: `export const dynamic = "force-dynamic";`
   - `src/app/sitemap.ts:4`: `export const dynamic = "force-dynamic";`
   - `src/app/feed.xml/route.ts:3`: `export const dynamic = "force-dynamic";`
   - `src/app/(auth)/login/page.tsx:6`: `export const dynamic = "force-dynamic";`
2. **Root-Level Session Reads on Public Pages**:
   - In `src/app/(public)/w/[username]/[slug]/page.tsx:50` and `generateMetadata`, `const session = await auth()` is executed directly at the page root and in metadata generation. Reading incoming request cookies at the page root prevents Next.js App Router from statically generating (SSG) or incrementally revalidating (ISR) the article content.
3. **Missing `generateStaticParams`**:
   - Neither `/w/[username]/[slug]` nor `/u/[username]` exports `generateStaticParams`. Every request forces a server roundtrip.
4. **Missing Cache Tags & On-Demand Revalidation**:
   - Zero cache tags (`writeups`, `writeup:{id}`, `user:{id}`) or `revalidateTag` calls exist in write/update mutations.
5. **Missing Routes**:
   - `/cves` and `/cves/[id]` currently do not exist in the codebase (returning HTTP 404).

---

## 3. Baseline Lighthouse & Web Vitals Audit Matrix

*Audited with Lighthouse 13.6.0 over local production build (`next start`), throttled 4G mobile simulation (150ms RTT, 1.6 Mbps throughput, 4x CPU slowdown) and unthrottled Desktop preset.*

| Route | Preset | Performance | LCP | INP / TBT | CLS | Total JS | LCP Element |
|---|---|---|---|---|---|---|---|
| **Home (`/`)** | Mobile 4G | **46** | 4.6 s | 3,050 ms | 0.007 | 197 KB | `<img ... src="/hero/hero-mobile@2x.avif">` |
| **Home (`/`)** | Desktop | **67** | 1.3 s | 480 ms | 0.014 | 197 KB | `<img ... src="/hero/hero-desktop.avif">` |
| **Explore (`/explore`)** | Mobile 4G | **63** | 2.0 s | 3,010 ms | 0.000 | 202 KB | `<h1>Explore CTF Writeups</h1>` |
| **Explore (`/explore`)** | Desktop | **67** | 1.0 s | 580 ms | 0.000 | 202 KB | `<h1>Explore CTF Writeups</h1>` |
| **Writeup (`/w/[user]/[slug]`)** | Mobile 4G | **44** | 4.8 s | 2,820 ms | 0.000 | 207 KB | `<h1 ...>runc Container Escape...</h1>` |
| **Writeup (`/w/[user]/[slug]`)** | Desktop | **65** | 1.3 s | 560 ms | 0.000 | 207 KB | `<h1 ...>runc Container Escape...</h1>` |
| **Profile (`/u/[username]`)** | Mobile 4G | **26** | **9.8 s** | **9,160 ms** | 0.000 | 195 KB | Unpaginated 1,200 cards DOM parse bottleneck |
| **Profile (`/u/[username]`)** | Desktop | **39** | **2.9 s** | **3,380 ms** | 0.000 | 195 KB | Unpaginated 1,200 cards DOM parse bottleneck |
| **Login (`/login`)** | Mobile 4G | **68** | 0.9 s | 7,250 ms | 0.000 | 215 KB | Telegram widget JS + Auth card typography |
| **Login (`/login`)** | Desktop | **60** | 1.5 s | 1,800 ms | 0.068 | 215 KB | Full-bleed hero artboard `<picture>` |
| **Dashboard (`/dashboard`)** | Mobile 4G | *Auth Redirect* | 1.1 s | 3,100 ms | 0.000 | 111 KB | `<h1 ...>Author Studio</h1>` (via DAL Gate) |
| **Dashboard (`/dashboard`)** | Desktop | *Auth Redirect* | 0.6 s | 420 ms | 0.000 | 111 KB | `<h1 ...>Author Studio</h1>` (via DAL Gate) |
| **Studio Write (`/write`)** | Mobile 4G | *Auth Redirect* | 1.4 s | 3,450 ms | 0.000 | 174 KB | Studio editor shell (via DAL Gate) |
| **Studio Write (`/write`)** | Desktop | *Auth Redirect* | 0.8 s | 590 ms | 0.000 | 174 KB | Studio editor shell (via DAL Gate) |
| **CVEs Directory (`/cves`)** | Mobile / Desktop | **N/A** | N/A | N/A | N/A | N/A | Route not yet implemented (HTTP 404) |
| **Single CVE (`/cves/[id]`)**| Mobile / Desktop | **N/A** | N/A | N/A | N/A | N/A | Route not yet implemented (HTTP 404) |

---

## 4. Bundle Audit (`@next/bundle-analyzer`)

### First-Load JS per Route
- **Shared First-Load JS**: 107 KB (Shared across all pages: `chunks/1255` 46.3 KB, `chunks/4bd1b696` 54.2 KB)
- **Public Routes**:
  - `/`: 112 KB (Page code 1.98 KB)
  - `/explore`: 137 KB (Page code 5.84 KB)
  - `/w/[username]/[slug]`: 142 KB (Page code 4.78 KB)
  - `/u/[username]`: 111 KB (Page code 170 B)
  - `/login`: 138 KB (Page code 5.93 KB)
- **Dashboard & Editor**:
  - `/dashboard`: 111 KB
  - `/dashboard/writeups`: 111 KB
  - `/dashboard/bookmarks`: 111 KB
  - `/dashboard/admin`: 149 KB (Console client 11.9 KB)
  - `/dashboard/settings`: 171 KB (Settings form 23.6 KB)
  - `/write`: 174 KB
  - `/write/[id]`: 174 KB

### Top 15 Client Dependencies (Parsed & Gzip Sizes)

| Rank | Dependency | Parsed Size | Gzip Size | Stat Size | Chunks | Client/Server Boundary Assessment |
|---|---|---|---|---|---|---|
| 1 | `@shikijs/langs` | **7,631.0 KB** | 1,350.9 KB | 8,216.7 KB | 241 chunks | **CRITICAL LEAK**: Bundled into client via `studio-editor.tsx` importing `@/lib/markdown`! Must be server-only. |
| 2 | `@shikijs/themes` | **1,282.4 KB** | 235.5 KB | 1,414.6 KB | 65 chunks | **CRITICAL LEAK**: Same leak as above. |
| 3 | `@shikijs/engine-oniguruma` | **607.7 KB** | 225.1 KB | 607.9 KB | 1 chunk | **CRITICAL LEAK**: Oniguruma WASM engine shipped to client! |
| 4 | `next` | **513.2 KB** | 212.0 KB | 1,599.0 KB | 15 chunks | Framework core |
| 5 | `react-dom` | **202.4 KB** | 63.8 KB | 620.3 KB | 1 chunk | React core |
| 6 | Application Source | **201.4 KB** | 74.6 KB | 511.3 KB | 41 chunks | Application components and hooks |
| 7 | `shiki` | **107.2 KB** | 30.6 KB | 230.4 KB | 2 chunks | **CRITICAL LEAK**: Shiki core highlighter bundled into client |
| 8 | `zod` | **55.2 KB** | 12.4 KB | 145.9 KB | 1 chunk | Validation library |
| 9 | `remark-parse` | **52.9 KB** | 14.1 KB | 217.5 KB | 1 chunk | **LEAK**: Markdown AST parser bundled on client |
| 10 | `remark-gfm` | **34.0 KB** | 10.8 KB | 186.6 KB | 1 chunk | **LEAK**: GFM parser on client |
| 11 | `react-hook-form` | **33.1 KB** | 11.6 KB | 151.1 KB | 1 chunk | Client form state |
| 12 | `hast-util-to-html` | **30.8 KB** | 10.8 KB | 92.1 KB | 1 chunk | **LEAK**: HAST stringifier on client |
| 13 | `tailwind-merge` | **26.6 KB** | 8.2 KB | 103.6 KB | 1 chunk | CSS utility resolver |
| 14 | `@radix-ui/react-popper` | **26.0 KB** | 10.0 KB | 102.7 KB | 1 chunk | Radix dropdown / tooltip positioning |
| 15 | `lucide-react` | **24.4 KB** | 16.9 KB | 78.9 KB | 14 chunks | Missing barrel tree-shaking optimization |

### Key Bundle Findings:
1. **Critical Shiki & Markdown Pipeline Leak**:
   `src/components/editor/studio-editor.tsx:169` has:
   ```ts
   const { renderMarkdown } = await import("@/lib/markdown");
   ```
   Even though it is inside a dynamic import, Webpack statically resolves all transitive dependencies of `@/lib/markdown` (which imports `codeToHast` from `shiki`, all `@shikijs/langs`, and all remark/rehype plugins). This generates **307 asynchronous chunks totaling 9.6 MB uncompressed JavaScript** in the `.next/static/chunks` client directory!
   *Solution*: Keep Shiki and Markdown parsing strictly server-side (e.g. via a dedicated server action or API route `/api/preview`), ensuring zero Shiki or Oniguruma bytes ever touch the browser bundle.
2. **Unused Dependencies**:
   - `date-fns`: Declared in `package.json` dependencies, but never imported anywhere in `src/`. `formatDate` in `src/lib/utils.ts` is hand-written with `Intl.DateTimeFormat`.
   - `rehype-autolink-headings`, `rehype-raw`: Declared in `package.json` but unused in `src/lib/markdown.ts`.
3. **Missing `optimizePackageImports`**:
   - `lucide-react` is split across 14 chunks without Next.js compile-time import transforms.

---

## 5. Data Layer Audit (Prisma & EXPLAIN ANALYZE on 2,000 Seeded Writeups)

Tested on Supabase PostgreSQL with 2,000 seeded writeups (1,202 PUBLIC, 798 DRAFT/UNLISTED):

### 1. Home Trending Query
- **SQL**:
  ```sql
  SELECT id, title, slug, excerpt, "ctfName", "ctfYear", category, difficulty, status, "viewCount", "readTimeMin", "publishedAt", "authorId"
  FROM "Writeup"
  WHERE status = 'PUBLIC'
  ORDER BY "viewCount" DESC, "publishedAt" DESC
  LIMIT 6;
  ```
- **Plan**:
  ```text
  Limit (cost=172.24..172.25 rows=6 width=289) (actual time=1.187..1.189 rows=6 loops=1)
    -> Sort (cost=172.24..175.22 rows=1194 width=289)
         Sort Key: "viewCount" DESC, "publishedAt" DESC
         Sort Method: top-N heapsort Memory: 29kB
         -> Seq Scan on "Writeup" (cost=0.00..150.84 rows=1194 width=289)
              Filter: (status = 'PUBLIC'::"Status")
              Rows Removed by Filter: 798
  ```
- **Finding**: **Full Sequential Scan** + Top-N Heap Sort! Scans all 2,000 table rows because no index exists on `(status, viewCount DESC, publishedAt DESC)`.

### 2. Explore Feed (Latest Public Writeups)
- **SQL**:
  ```sql
  SELECT ... FROM "Writeup" WHERE status = 'PUBLIC' ORDER BY "publishedAt" DESC LIMIT 12;
  ```
- **Plan**:
  ```text
  Limit (cost=0.28..2.00 rows=12 width=289) (actual time=0.377..0.383 rows=12 loops=1)
    -> Index Scan Backward using "Writeup_publishedAt_idx" on "Writeup"
         Filter: (status = 'PUBLIC'::"Status")
         Rows Removed by Filter: 797
  ```
- **Finding**: Scans `Writeup_publishedAt_idx` backwards, but because the index lacks `status`, Postgres must perform **797 heap fetches** to discard non-public rows! Missing compound index: `Writeup(status, publishedAt DESC)`.

### 3. Explore Category Filter (`status='PUBLIC' AND category='WEB'`)
- **Plan**:
  ```text
  Index Scan Backward using "Writeup_status_category_publishedAt_idx"
    Index Cond: ((status = 'PUBLIC') AND (category = 'WEB'))
    Execution Time: 0.065 ms (11 buffer hits)
  ```
- **Finding**: Well indexed by the existing 3-column index.

### 4. User Profile Writeups (`authorId = $1 AND status = 'PUBLIC'`)
- **Plan**:
  ```text
  Index Scan Backward using "Writeup_publishedAt_idx" on "Writeup"
    Filter: (("authorId" = '...') AND (status = 'PUBLIC'))
    Rows Removed by Filter: 801 (Buffers: shared hit=270)
    Execution Time: 1.093 ms
  ```
- **Finding**: Completely ignores `authorId_idx` and scans `publishedAt_idx`, throwing away 801 rows on filter. Missing compound index: `Writeup(authorId, status, publishedAt DESC)`.

### 5. Current Search Query (`ILIKE '%term%'` on `contentMd`)
- **SQL**:
  ```sql
  SELECT id, title, slug, excerpt FROM "Writeup"
  WHERE status = 'PUBLIC' AND (
    title ILIKE '%runc%' OR excerpt ILIKE '%runc%' OR "contentMd" ILIKE '%runc%' OR "ctfName" ILIKE '%runc%'
  ) LIMIT 10;
  ```
- **Plan**:
  ```text
  Index Scan using "Writeup_status_idx" on "Writeup" (actual time=0.025..31.417 rows=1 loops=1)
    Filter: ((title ~~* '%runc%') OR (excerpt ~~* '%runc%') OR ("contentMd" ~~* '%runc%') OR ("ctfName" ~~* '%runc%'))
    Rows Removed by Filter: 1201
    Execution Time: 31.458 ms
  ```
- **Finding**: **31.5 ms CPU-bound unindexed ILIKE scan** evaluating string regexes against `contentMd` on 1,201 rows. At 20,000 writeups this query will take >350 ms and saturate CPU.

### 6. Over-Fetching in Lists:
In `src/server/writeup.service.ts:476` (`getPublicWriteups`):
```ts
prisma.writeup.findMany({
  where,
  orderBy,
  skip,
  take: limit,
  include: {
    author: { select: { id: true, username: true, avatarUrl: true, bio: true } },
    tags: { include: { tag: true } },
    _count: { select: { bookmarks: true } },
  },
})
```
By using `include` without `select` for the `Writeup` model, Prisma queries `SELECT *`, fetching the full `contentMd` (markdown text of all articles) for every item in explore and home feeds!
- Over-fetching measurement: `contentMd` accounts for **44% of total table data payload** transferred unnecessarily over the network between database and server.

### 7. Sequential Awaits & N+1 Queries:
- `getWriteupByAuthorAndSlug` (`writeup.service.ts:271`):
  ```ts
  const author = await prisma.user.findUnique({ where: { username } });
  const writeup = await prisma.writeup.findUnique({ where: { authorId_slug: { authorId: author.id, slug } } });
  ```
  Two sequential network roundtrips where a single query using `author: { username }` relation filter would suffice.
- `getUserProfile` (`auth.service.ts:64`):
  Fetches all writeups without `take:` or pagination! For `0xNullPtr` (who has 1,200 writeups), this sent all 1,200 cards in a single SSR response, resulting in **9.8s LCP and 9.1s TBT**.

---

## 6. Asset & Font Audit

1. **Fonts**:
   - **No `next/font`**: `src/app/layout.tsx` imports `./globals.css` but never imports `next/font/google` (`Inter`, `JetBrains_Mono`).
   - `src/app/globals.css:85` declares `--font-inter` and `--font-jetbrains-mono` pointing to system font stacks. If user does not have JetBrains Mono installed locally, browser renders generic monospace.
   - Using `next/font/google` will self-host WOFF2 files, preload them automatically, eliminate external network hops, and provide zero layout shift.
2. **Hero Images**:
   - Desktop and Mobile AVIF/WebP assets are compressed efficiently (desktop AVIF 34 KB, mobile AVIF 18 KB).
   - **LCP Discovery Bottleneck**: In `src/app/(public)/page.tsx`, the document head preloads `/hero/hero-mobile.avif`. However, modern smartphones (DPR >= 2) select `/hero/hero-mobile@2x.avif` from `<picture><source srcSet="...">`. Because `@2x.avif` is not in the `<link rel="preload">` tag, Lighthouse reports a **5.6s resource load delay** on mobile!
3. **World Map Background**:
   - `bg-world-1920.avif` (61 KB) and `bg-world-1280.avif` (41 KB) in `SiteBackground.tsx` use `fetchPriority="low"`, which is good practice. However, `SiteBackground` re-renders and re-evaluates inside the root layout on route navigation.
4. **Third-Party Scripts**:
   - Telegram Login Widget (`https://telegram.org/js/telegram-widget.js?22`) is dynamically inserted into `document.body` by `TelegramAuthButton.tsx`. This script executes synchronous external DOM modifications and should be loaded on demand only.
5. **Card Avatars**:
   - `WriteupCard.tsx:106` uses standard unoptimized `<img>` for author avatars without dimensions (`width`/`height`), missing Next.js image optimization and intrinsic aspect ratios.

---

## 7. Ranked Findings Matrix

| Rank | Issue | Impact | Effort | Risk | Phase |
|---|---|---|---|---|---|
| **1** | All public routes forced `dynamic` (SSR on every request, 0 ISR/SSG) | **Critical** (High TTFB, server load) | Low | Low | Phase 1 |
| **2** | 9.6 MB Shiki + Oniguruma WASM leaked into client bundle | **Critical** (Massive JS bloat, slow hydration) | Medium | Medium | Phase 3 |
| **3** | Unpaginated profile query (`getUserProfile`) rendering 1,200 cards (9.8s LCP, 9.1s TBT) | **Critical** (Page freeze on large profiles) | Low | Low | Phase 4 |
| **4** | Missing database indexes for feed queries (`status, publishedAt DESC`, `authorId, status`) | **High** (Seq scans, query degradation) | Low | Low | Phase 4 |
| **5** | Over-fetching `contentMd` in feed queries (`SELECT *` instead of specific columns) | **High** (High memory & network overhead) | Low | Low | Phase 4 |
| **6** | Unindexed `ILIKE '%term%'` CPU scan on `contentMd` for search (31.5ms per query) | **High** (Database saturation on search) | Medium | Low | Phase 6 |
| **7** | Search dialog lacks as-you-type search, local index, worker, and keyboard navigation | **High** (Poor user UX, full page navigation) | Medium | Low | Phase 6 |
| **8** | Mobile hero LCP preload mismatch (`hero-mobile.avif` vs `@2x.avif` on Retina) | **High** (5.6s resource discovery delay) | Low | Low | Phase 3 |
| **9** | Missing `next/font` (`Inter` & `JetBrains Mono` system fallbacks) | **Medium** (FOUT, unhosted typography) | Low | Low | Phase 3 |
| **10** | Unused dependencies (`date-fns`, `rehype-autolink-headings`, `rehype-raw`) | **Medium** (Dependency hygiene, bundle noise) | Low | Low | Phase 3 |
| **11** | Sequential awaits in `getWriteupByAuthorAndSlug` | **Medium** (Unnecessary roundtrips) | Low | Low | Phase 4 |
| **12** | Missing loading skeletons and route transitions | **Medium** (Perceived sluggishness on navigation) | Medium | Low | Phase 2 & 5 |
| **13** | CVE directory and single CVE routes not yet implemented | **Medium** (Feature gap from specification) | Medium | Low | Phase 1 |

---

## 8. Proposed Execution Roadmap

### Phase 1: Rendering and Caching
1. Remove `dynamic = "force-dynamic"` from public pages (`/`, `/explore`, `/w/[username]/[slug]`, `/u/[username]`).
2. Isolate `session` reading: extract user menu from server page root so writeup pages can be statically rendered and cached with ISR.
3. Implement `generateStaticParams` for top writeups; fallback to dynamic ISR for remaining writeups.
4. Implement Cache Tags (`writeups`, `writeup:{id}`, `user:{id}`, `tag:{name}`) and configure targeted `revalidateTag` on publish, update, delete, and visibility changes.
5. Create CVE routes (`/cves`, `/cves/[id]`) with cached external data (NVD 30m, KEV 1h, single CVE 6h, EPSS 24h) with bucketed query parameters.
6. Verify visibility rules: DRAFT and UNLISTED are never leaked in public lists, static params, or sitemaps.

### Phase 2: Navigation Feel
1. Retain Link prefetching and add hover/touch-start prefetching on `WriteupCard` links.
2. Build layout-accurate `loading.tsx` skeletons with zero cumulative layout shift for `/`, `/explore`, `/w/[username]/[slug]`, `/u/[username]`, `/cves`, `/dashboard`.
3. Ensure persistent layouts for navbar, footer, and background so they never remount.
4. Add link-click feedback indicator (progress bar) and scroll restoration.

### Phase 3: Bundle and Assets
1. Decouple Shiki and the markdown pipeline from client components:
   - Convert studio editor markdown preview to a lightweight server action or API route.
   - Ensure `@shikijs/*` and `shiki` are 100% server-only (saving 9.6 MB from client bundle).
2. Lazy-load CodeMirror editor, charts, image lightbox, command palette, and Telegram auth widget with `next/dynamic`.
3. Remove unused packages: `date-fns`, `rehype-autolink-headings`, `rehype-raw`. Add `optimizePackageImports: ['lucide-react']`.
4. Configure `next/font/google` for `Inter` and `JetBrains_Mono` with `display: 'swap'`.
5. Fix hero image preload to include `@2x` responsive media queries; optimize avatar images with `next/image`.

### Phase 4: Database and API
1. Add PostgreSQL migration for missing indexes:
   - `Writeup(status, publishedAt DESC)`
   - `Writeup(category, status)`
   - `Writeup(authorId, status)`
   - `Writeup(status, viewCount DESC, publishedAt DESC)`
2. Refactor list queries (`getPublicWriteups`, `getUserProfile`) to `select` only required columns (excluding `contentMd`) and paginate profile feeds.
3. Eliminate sequential awaits in `getWriteupByAuthorAndSlug`.
4. Configure public API route `Cache-Control` (`s-maxage`, `stale-while-revalidate`), ensuring authenticated routes are strictly `private, no-cache`.

### Phase 5: Smooth Page Transitions
1. Implement View Transitions behind `NEXT_PUBLIC_VIEW_TRANSITIONS` env flag with cross-fade (150-250ms).
2. Add shared-element cover transition `name="cover-${slug}"`.
3. Support `prefers-reduced-motion` and test compatibility across Chrome, Safari, and Firefox.

### Phase 6: Instant As-You-Type Search
1. Client Index (Primary): `/api/search-index` returning compact JSON for PUBLIC writeups with long edge cache and `search-index` revalidate tag. MiniSearch inside Web Worker.
2. Server Search (Fallback): Migration for `pg_trgm` and generated `tsvector` with GIN index. Parameterized `$queryRaw` tsquery with IP rate-limiting.
3. Command-Palette UI (Ctrl+K and `/`): 120ms debounce for server mode (instant for local worker), arrow key navigation, match highlighting, ARIA combobox attributes.

### Phase 7: Measure and Guard
1. Configure Lighthouse CI with performance budgets (Performance >= 90, LCP < 2.5s, CLS < 0.1, INP < 200ms).
2. Add `useReportWebVitals` telemetry.
3. Automated Playwright checks for layout shifts, zero private content leaks, and instant search response times.
4. Produce final `PERF_REPORT.md` and update `PROGRESS.md`.
