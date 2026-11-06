# WriteupHub Rigorous Performance Report & Progression Matrix

> **Harness & Benchmark Environment (Verified)**:  
> - **Runtime**: Node.js `v26.13.0`  
> - **Lighthouse**: `13.6.0` (`--chrome-flags="--headless --no-sandbox --disable-dev-shm-usage --disable-gpu"`)  
> - **Browser**: Google Chrome for Testing `156.0.8078.4` (via Playwright cache)  
> - **Frameworks**: Next.js `15.5.29`, React `19.3.0`  
> - **ORM / Database**: Prisma `@prisma/client` `6.19.3`, Supabase PostgreSQL (seeded with 2,000 writeups: 1,202 public, 798 draft/unlisted)  
> - **OS**: Linux x86_64  
> - **Note on Environment Consistency**: Prisma was **not** downgraded; `6.19.3` has been installed in `package-lock.json` throughout. Earlier drafts contained placeholder template headers from Phase 0 (`6.4.1` from `^6.4.0` in `package.json`). All measurements now reflect the verified `6.19.3` runtime.

---

## 1. Rigorous 5-Run Benchmark Matrix (Medians & Min–Max Ranges)

**Measurement Protocol**:
- Build: `npm run build` (production build) -> `npm run start` (production server).
- Each URL pre-warmed with **2 consecutive requests** prior to benchmarking to prime server cache/ISR.
- **5 separate runs** per route and preset under identical machine load. Mobile and Desktop run in separate independent batches.
- Recorded metrics: **Performance Score**, **LCP (ms)**, **TBT (ms)**, **CLS**, and **TTFB (ms)**. All numbers reported as `Median (Min - Max)`.

### Desktop Benchmark (Unthrottled)

| Route | Runs | Performance Score | LCP (ms) | TBT (ms) | CLS | TTFB (ms) | Status / Notes |
|---|---|---|---|---|---|---|---|
| **Home (`/`)** | 5 | **100 (100 - 100)** | **686 (682 - 725)** | **30 (19 - 37)** | 0.014 (0.014 - 0.014) | **6 (5 - 12)** | **PERFECT 100** across all 5 runs. Instant static response. |
| **Writeup (`/w/...`)** | 5 | **100 (100 - 100)** | **252 (251 - 779)** | **39 (26 - 71)** | 0.000 (0.000 - 0.000) | **9 (6 - 16)** | **PERFECT 100** across all 5 runs. LCP under 300 ms. |
| **Explore (`/explore`)** | 5 | 56 (56 - 100) | 1,441 (736 - 1,555) | 1,161 (19 - 1,436) | 0.000 (0.000 - 0.000) | 95 (14 - 107) | High variance between warm runs (100 score, 742ms) and re-fetches (56 score). |
| **Profile (`/u/0xNullPtr`)** | 5 | 61 (59 - 64) | 1,426 (1,204 - 1,548) | 1,396 (976 - 1,529) | 0.000 (0.000 - 0.000) | 59 (34 - 70) | Consistent 59–64 score. Down from 3,380ms TBT in Phase 0. |
| **CVE Directory (`/cves`)** | 5 | 64 (63 - 64) | 1,494 (1,430 - 1,576) | 913 (869 - 1,042) | 0.000 (0.000 - 0.000) | 33 (26 - 40) | Highly repeatable score (63–64). Zero layout shift. |
| **Single CVE (`/cves/CVE-...`)** | 5 | 60 (51 - 63) | 1,652 (1,457 - 2,154) | 1,167 (881 - 2,238) | 0.000 (0.000 - 0.000) | 31 (26 - 194) | Outlier run 5 had 194ms TTFB during NVD re-validation. |
| **Login (`/login`)** | 5 | 64 (61 - 70) | 442 (310 - 1,676) | 1,090 (891 - 2,406) | 0.001 (0.001 - 0.002) | 82 (78 - 158) | LCP median is 442 ms. Telegram widget lazy-loaded. |

---

### Mobile Benchmark (Simulated 4G / 4x CPU Throttling)

| Route | Runs | Performance Score | LCP (ms) | TBT (ms) | CLS | TTFB (ms) | Status / Notes |
|---|---|---|---|---|---|---|---|
| **Home (`/`)** | 5 | 38 (37 - 42) | 7,076 (6,290 - 7,607) | 8,648 (6,366 - 11,365) | 0.007 (0.007 - 0.007) | 48 (37 - 68) | Regressed under Lantern simulated 4G due to backdrop blur & icon chunks. |
| **Writeup (`/w/...`)** | 5 | 61 (43 - 63) | 2,528 (2,227 - 6,676) | 9,392 (7,779 - 10,865) | 0.000 (0.000 - 0.000) | 63 (55 - 69) | Real LCP is 2.2–2.5 s on 4 out of 5 runs. Zero CLS. |
| **Explore (`/explore`)** | 5 | 57 (52 - 58) | 2,718 (2,532 - 3,425) | 8,023 (7,734 - 8,869) | 0.000 (0.000 - 0.000) | 99 (80 - 108) | Very consistent scores (52–58), LCP ~2.7s. |
| **Profile (`/u/0xNullPtr`)** | 5 | 54 (40 - 64) | 3,566 (2,339 - 6,726) | 7,742 (6,733 - 9,156) | 0.000 (0.000 - 0.000) | 44 (41 - 63) | Down from 9.8s baseline LCP. High Lantern TBT penalty. |
| **CVE Directory (`/cves`)** | 5 | 45 (42 - 46) | 6,648 (6,106 - 7,340) | 6,283 (5,707 - 8,121) | 0.000 (0.000 - 0.000) | 34 (29 - 48) | Baseline established. Low TTFB (34ms). |
| **Single CVE (`/cves/CVE-...`)** | 5 | 43 (41 - 44) | 6,793 (6,690 - 7,239) | 7,822 (7,336 - 9,157) | 0.000 (0.000 - 0.000) | 40 (34 - 71) | Stable across all 5 runs (41–44). |
| **Login (`/login`)** | 5 | **69 (68 - 70)** | **979 (960 - 1,048)** | 6,506 (5,690 - 7,165) | 0.006 (0.006 - 0.006) | 81 (70 - 162) | **Sub-second LCP (979 ms)** on throttled mobile. |

---

## 2. Reconciling Mobile TBT: Lantern Simulation vs. Real DevTools Trace

### The Discrepancy
- **Lighthouse CLI Report**: Total Blocking Time (TBT) of **6,000 – 9,000 ms** on mobile.
- **Chrome DevTools CDP Trace**: Total Long Tasks (>50ms) sum to **247 – 324 ms** of actual main thread blocking.

### Technical Explanation
1. **Lantern Graph Modeling vs Direct Throttling**:
   Lighthouse CLI by default runs with *Lantern simulation* (unthrottled execution on the host machine, followed by post-hoc algorithmic projection). Lantern assumes a high latency (150ms round-trip) and a strict 4x CPU slowdown. Any JavaScript evaluation that triggers layout or microtask loops is projected along the longest dependency chain.
2. **Framework Monolith & React 19 Hydration**:
   The shared framework chunk (`1255-d8a1861c775d9bcc.js`, 46.3 kB) contains Lucide icons, Radix UI dialog/popover internals, and React DOM. During initial hydration, React traverses the full DOM tree. On a simulated 4x slowdown, Lantern stretches these initial tasks into multi-second blocking windows.
3. **SessionProvider Root Hydration**:
   Previously, `<SessionProvider>` in `RootLayout` triggered an immediate `/api/auth/session` fetch upon client mount. This network request competed with initial hydration, prolonging the simulated CPU-idle boundary.

---

## 3. Session Isolation & Global Provider Elimination

### Changes Implemented
1. **Removed `<SessionProvider>` from `src/app/layout.tsx`**:
   The root layout is now completely free of NextAuth context and provider overhead. Public pages render zero session wrapper components.
2. **Created Dedicated `/api/auth/me` Endpoint**:
   A lightweight, JSON-optimized route returning `{ user: { id, username, name, image, role } }` with `Cache-Control: private, no-cache, no-store, must-revalidate`.
3. **Implemented Idle Session Hook (`useIdleSession`)**:
   - Deferral via `requestIdleCallback`: Component islands (`Navbar`, `BookmarkButton`, `WriteupOwnerActions`) do **not** trigger session requests during critical page load.
   - Singleton Promise Deduplication: When idle arrives, all islands share a single in-memory cached promise, preventing redundant network requests.
   - Fallback localized `<SessionProvider>`: Preserved strictly within protected sub-layouts (`/onboarding/layout.tsx`) where session context mutation is required.

---

## 4. Single-CVE Variance Explanation

In earlier single-run testing, `/cves/CVE-2024-21626` showed an LCP of ~1.0 s, whereas initial runs showed ~6.5 s.
- **Root Cause**: The CVE page does **not** query writeups using the newly added database indexes. The difference was strictly **external API cache priming**:
  - Cold request: Fetches live data from CISA KEV and NVD, incurring network round-trips to NIST servers.
  - Warmed request: Served from the in-memory trimmed KEV cache and Next.js ISR fetch cache (`revalidate = 21600`).
- **Conclusion**: The CVE improvement was unrelated to Phase 4 database indexes. Warmed ISR runs reliably demonstrate fast TTFB (31 ms) on desktop.

---

## 5. Phase 4 Database Verification with Real Paginated Query

### EXPLAIN ANALYZE on Paginated Profile Query (`LIMIT 13`)
```sql
EXPLAIN (ANALYZE, BUFFERS, COSTS)
SELECT id, title, slug, excerpt, category, difficulty, "ctfName", "ctfYear", "viewCount", "readTimeMin", "publishedAt", "createdAt"
FROM "Writeup"
WHERE "authorId" = 'cmw1dvcb00000sbrcbcn44lra' AND status = 'PUBLIC'
ORDER BY "publishedAt" DESC, id DESC
LIMIT 13;
```

**PostgreSQL Execution Plan**:
```
Limit  (cost=0.43..2.40 rows=13 width=268) (actual time=2.450..2.453 rows=13 loops=1)
  Buffers: shared hit=14
  ->  Incremental Sort  (cost=0.43..182.08 rows=1200 width=268) (actual time=2.449..2.450 rows=13 loops=1)
        Sort Key: "publishedAt" DESC, id DESC
        Presorted Key: "publishedAt"
        Full-sort Groups: 1  Sort Method: quicksort  Average Memory: 31kB  Peak Memory: 31kB
        Buffers: shared hit=14
        ->  Index Scan using "Writeup_authorId_status_publishedAt_idx" on "Writeup"  (cost=0.28..137.15 rows=1200 width=268) (actual time=1.126..1.794 rows=14 loops=1)
              Index Cond: (("authorId" = 'cmw1dvcb00000sbrcbcn44lra'::text) AND (status = 'PUBLIC'::"Status"))
              Buffers: shared hit=5
Execution Time: 2.556 ms
```

**Key Takeaways**:
- **Buffers**: Accessed only **14 shared hit buffers** (down from 270 buffers when unpaginated).
- **Execution Time**: **2.55 ms** across 2,000 seeded writeups.
- **Index Match**: The composite index `Writeup_authorId_status_publishedAt_idx` serves the query with pre-sorted order, allowing early exit after 13 rows.

### Serverless Connection Pool Tuning
Updated `.env.local` for serverless deployment:
- `DATABASE_URL`: `connection_limit=3&connect_timeout=15&pool_timeout=15` with `pgbouncer=true` on port `6543`.
- `DIRECT_URL`: Direct session connection on port `5432` with `connect_timeout=15` for schema push/migrations.
