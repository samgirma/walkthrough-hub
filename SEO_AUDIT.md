# WriteupHub Technical SEO Audit Report

> **Audit Date**: 2026-11-08  
> **Target Production URL**: `https://walkthrough-by.samgirma.app`  
> **Framework**: Next.js 15.5.29 App Router, TypeScript, React 19.3.0, Prisma 6.19.3  
> **Audited Crawler**: Googlebot 2.1 Desktop & Mobile  
> **Status**: PHASE 0: AUDIT COMPLETE (No code changes applied)

---

## 1. Route-by-Route Technical SEO Matrix

| Route | HTTP | Title (Len) | Description (Len) | Canonical | Robots Meta | H1 Count | JSON-LD | OG Image | Indexable? | In Sitemap? | Issues / Findings |
|---|:---:|---|---|---|---|:---:|:---:|:---:|:---:|:---:|---|
| **`/` (Home)** | 200 | 48 chars | 157 chars | **MISSING** | `none` (defaults `index,follow`) | 1 | **None** | **MISSING** | Yes | Yes | Missing canonical, missing JSON-LD (`WebSite` / `Organization`), missing default OG image. |
| **`/explore`** | 200 | 64 chars | 121 chars | **MISSING** | `none` (defaults `index,follow`) | 1 | **None** | **MISSING** | Yes | Yes | Missing canonical, missing JSON-LD (`CollectionPage`). Title exceeds 60 chars. |
| **`/explore?category=WEB`** | 200 | 64 chars | 121 chars | **MISSING** | `none` (defaults `index,follow`) | 1 | **None** | **MISSING** | **No** | No | **Duplicate Content Risk**: Parameterized filter should canonicalize to hub or be `noindex,follow`. |
| **`/explore?q=heap`** | 200 | 64 chars | 121 chars | **MISSING** | `none` (defaults `index,follow`) | 1 | **None** | **MISSING** | **No** | No | **Internal Search Indexation**: Search query results must have `noindex,follow` to prevent thin indexation. |
| **`/w/[user]/[slug]` (PUBLIC)** | 200 | **107 chars** | **186 chars** | `http://localhost:3000/...` | `index, follow` | **2 (FAIL)** | **None** | 1200x630 | Yes | Yes | **H1 Count = 2** (page header + `# Title` in markdown). Title > 60 chars. Desc > 160 chars. Non-HTTPS canonical. Missing `Article` JSON-LD. |
| **`/w/[user]/[slug]` (UNLISTED)** | 200 | 96 chars | 112 chars | `http://localhost:3000/...` | `noindex, nofollow` | **2 (FAIL)** | **None** | 1200x630 | **No** | **No** | Correctly noindexed and excluded from sitemap. H1 count is 2. Non-HTTPS canonical. |
| **`/w/[id]/preview` (DRAFT)** | 307 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **No** | **No** | Auth-gated preview route. Unauthenticated requests 307 to `/login`. Excluded from sitemap. |
| **`/u/[username]` (Profile)** | 200 | 49 chars | 98 chars | **MISSING** | `none` (defaults `index,follow`) | 1 | **None** | **MISSING** | Conditional | Partial (top 3) | Missing canonical, missing JSON-LD (`ProfilePage` / `Person`). Missing OG image. Should only index if >= 1 indexable writeup. |
| **`/cves` (Directory)** | 200 | **73 chars** | 126 chars | **MISSING** | `none` (defaults `index,follow`) | 1 | **None** | **MISSING** | Yes | **MISSING** | Missing canonical. Title > 60 chars. Missing from `sitemap.ts`! Missing OG image. |
| **`/cves/[id]` (Detail)** | 200 | **76 chars** | 167 chars | **MISSING** | `none` (defaults `index,follow`) | 1 | **None** | **MISSING** | Conditional | **MISSING** | Missing canonical. Title > 60 chars. Thin CVEs indexed. Missing from `sitemap.ts`! Missing Breadcrumbs JSON-LD. |
| **`/events` (Competitions)** | 200 | **78 chars** | 135 chars | **MISSING** | `none` (defaults `index,follow`) | 1 | **None** | **MISSING** | Yes | **MISSING** | Missing canonical. Title > 60 chars. Missing from `sitemap.ts`! Missing OG image. |
| **`/ctf-sites` (Directory)** | 200 | **80 chars** | 135 chars | **MISSING** | `none` (defaults `index,follow`) | 1 | **None** | **MISSING** | Yes | **MISSING** | Missing canonical. Title > 60 chars. Missing from `sitemap.ts`! Missing OG image. |
| **`/category/[category]`** | **404** | 34 chars | 176 chars | **MISSING** | `noindex` | 1 | **None** | **MISSING** | Yes | **MISSING** | **Hub Route Missing**: Category landing pages (`/category/web`, `/category/pwn`) do not exist yet. |
| **`/ctf/[event-slug]`** | **404** | 34 chars | 176 chars | **MISSING** | `noindex` | 1 | **None** | **MISSING** | Yes | **MISSING** | **Hub Route Missing**: Competition hub pages (`/ctf/def-con-32-quals`) do not exist yet. |
| **`/tag/[tag]`** | **404** | 34 chars | 176 chars | **MISSING** | `noindex` | 1 | **None** | **MISSING** | Yes | **MISSING** | **Hub Route Missing**: Tag hub pages (`/tag/heap`, `/tag/kernel`) do not exist yet. |
| **`/login`** | 200 | 47 chars | 176 chars | **MISSING** | `none` (defaults `index,follow`) | 1 | **None** | **MISSING** | **No** | **IN SITEMAP!** | **Severe**: Crawlable and indexable! Included in `sitemap.ts`! Must be `noindex,follow` and removed from sitemap. |
| **`/register`** | 200 | 47 chars | 176 chars | **MISSING** | `none` (defaults `index,follow`) | **0 (FAIL)** | **None** | **MISSING** | **No** | **IN SITEMAP!** | **Severe**: Crawlable and indexable! Included in `sitemap.ts`! Missing H1! Must be `noindex,follow`. |
| **`/onboarding`** | 307 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **No** | **No** | 307 redirect to login for unauthenticated bots. Not disallowed in `robots.ts`. |
| **`/dashboard`** | 307 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **No** | **No** | Protected private route. Correctly redirects. Disallowed in `robots.ts`. |
| **`/write`** | 307 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **No** | **No** | Protected editor route. Disallowed in `robots.ts`. |
| **`/api/*`** | 200/401 | N/A | N/A | N/A | **MISSING** | N/A | N/A | N/A | **No** | **No** | API responses do not send `X-Robots-Tag: noindex`. |
| **`/robots.txt`** | 200 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | Missing `/settings`, `/onboarding` in disallow. Missing AI crawler policies. Missing sitemap index link. |
| **`/sitemap.xml`** | 200 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | Does not use `generateSitemaps`. Missing `/events`, `/ctf-sites`, indexable CVEs. Wrongly lists `/login` & `/register`. |
| **`/feed.xml`** | 200 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | Global RSS feed works. Missing per-author RSS feeds and autodiscovery `<link>` tags in HTML head. |

---

## 2. Ranked Findings & Technical Deficiencies

### Severity 1: Critical (Must fix immediately)
1. **Indexation of Utility & Auth Pages (`/login`, `/register`)**:
   - `/login` and `/register` currently lack `robots: { index: false, follow: true }`.
   - Worse, `src/app/sitemap.ts` explicitly includes both URLs in the sitemap XML with priority `0.3`.
   - *Impact*: Google indexes low-value thin login walls, diluting crawl budget and domain authority.
2. **Duplicate H1 Elements on Public Writeups (`/w/[username]/[slug]`)**:
   - The writeup reader template renders an `<h1>` for `{writeup.title}`. Simultaneously, `renderMarkdown(writeup.contentMd)` parses top-level `# Heading` in user markdown as a second `<h1>`.
   - *Impact*: Confuses search engines on the primary entity/topic of the document; violates HTML5 semantic single-H1 guidelines.
3. **Missing Canonical Tags Across 90% of Routes**:
   - Only writeup pages emit a canonical URL (and currently point to `localhost:3000` rather than the canonical `https://walkthrough-by.samgirma.app`).
   - `/`, `/explore`, `/u/[username]`, `/cves`, `/cves/[id]`, `/events`, and `/ctf-sites` have **no canonical tag whatsoever**.
   - *Impact*: Duplicate URL variations (`?category=`, `?page=`, `?q=`, trailing slashes, protocol variants) compete against each other in Google index.
4. **Case Sensitivity Crash on Slugs / Usernames**:
   - Curling an uppercase username `/w/0XNULLPTR/...` threw an unhandled 500 error because database lookup is case-sensitive.
   - *Impact*: Broken crawler traversal and indexation of 500 server errors instead of a clean 301 lowercase redirect.

---

### Severity 2: High (Index Quality & Discovery)
5. **Zero JSON-LD Structured Data**:
   - None of the routes emit Schema.org structured data (`Article`, `BreadcrumbList`, `ProfilePage`, `Organization`, `WebSite`).
   - *Impact*: WriteupHub is ineligible for Google Rich Results, Author knowledge panels, and enhanced search snippets.
6. **Missing Key Public Hub Routes (`/category/*`, `/ctf/*`, `/tag/*`)**:
   - Currently, category exploration is done via client query parameters (`/explore?category=WEB`).
   - Search engines cannot discover dedicated, crawlable landing pages for major topics like "Web CTF Writeups", "Reverse Engineering Writeups", or specific CTF events (e.g. DEF CON 32 Quals).
7. **Missing Hub & Feature Routes in Sitemap**:
   - Newly built public features (`/events`, `/ctf-sites`, indexable CVE pages) are not included in `src/app/sitemap.ts`.
8. **No UGC Quality Gate for Writeup Indexation**:
   - Currently, ANY writeup marked `PUBLIC` is automatically indexed and added to the sitemap, even if it is 20 words of spam or published by an account created 2 minutes ago.
   - *Impact*: Vulnerable to spam penalties, thin-content algorithmic demotion (Google Helpful Content / Core Updates).

---

### Severity 3: Medium (SERP Presentation & Social Visibility)
9. **Title & Description Length Violations**:
   - Google SERP desktop titles truncate past **60 characters** (approx. 580–600px). Writeup titles currently reach 107 characters, truncating mid-word.
   - Descriptions exceed 160 characters on several pages, causing ellipsis truncation in search snippets.
10. **Missing Default OG Images Across Site**:
    - All routes except `/w/...` fail to emit `og:image`. Shares of Home, Explore, Profiles, and CVEs render as text-only links on social networks.
11. **External UGC Links Lack `rel="ugc nofollow"`**:
    - User-submitted markdown links currently render as raw `<a>` tags without `rel="ugc nofollow noopener"`. Outbound spam links could pass PageRank and incur manual actions.
12. **Missing `X-Robots-Tag: noindex` on Internal API Endpoints**:
    - API endpoints (`/api/writeups`, `/api/search-index`) return raw JSON without `X-Robots-Tag: noindex`.

---

## 3. Redirect & Normalization Verification

| Scenario | Tested Input | Expected Behavior | Actual Behavior | Status |
|---|---|---|---|:---:|
| **Trailing Slash** | `/explore/` | 308 redirect to `/explore` | 308 to `/explore` | **PASS** |
| **Uppercase Username** | `/w/0XNULLPTR/runc-...` | 301 redirect to `/w/0xnullptr/runc-...` | 500 Server Error | **FAIL** |
| **Apex vs www** | `http://www.walkthrough-by...` | 301 redirect to `https://walkthrough-by...` | Handled by DNS/Vercel (missing in middleware) | **WARN** |
| **Query Param Canonical** | `/explore?category=WEB` | Canonical points to `/category/web` | Missing canonical | **FAIL** |
| **Search Param Canonical** | `/explore?q=heap` | `noindex, follow` | `index, follow` (default) | **FAIL** |

---

## 4. Next Steps (Pending User Approval)
- Review findings in `SEO_AUDIT.md` and `SOCIAL_AUDIT.md`.
- Review the phased implementation plan in the plan artifact.
- Await user `"go"` before applying Phase 1 foundations and schema migrations.
