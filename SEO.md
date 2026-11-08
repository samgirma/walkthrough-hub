# WriteupHub Technical SEO & Discovery Architecture

Comprehensive documentation of WriteupHub's technical SEO architecture, indexing gate, URL stabilization rules, structured data pipelines, and maintenance playbooks.

---

## 1. Core Principles & Philosophy
WriteupHub is an open platform for competitive cybersecurity researchers, exploit analysts, and CTF solvers. The technical SEO architecture is designed around four non-negotiable principles:
1. **Zero Session Reads in Public Roots**: Public pages (`/`, `/explore`, `/browse`, `/category/*`, `/ctf/*`, `/tag/*`, `/w/*`, `/u/*`, `/cves/*`, `/events`, `/ctf-sites`) are purely static or ISR-cached. Never read user sessions in page roots to preserve edge caching.
2. **Quality-Gated Indexation**: Low-quality, thin, unverified, draft, or unlisted writeups are served with `noindex, follow` and excluded from the sitemap until they qualify.
3. **Single H1 & Semantic Document Hierarchy**: Every page has exactly one `<h1>`. In user Markdown content, headings are shifted down (`#` becomes `<h2>`, `##` becomes `<h3>`), external links receive `rel="ugc nofollow noopener"`, and images lazy-load.
4. **Permanent URL Stability**: URLs are immutable after publication. Slugs and usernames are tracked in database history tables (`SlugHistory`, `UsernameHistory`) with automated 301 permanent redirects.

---

## 2. URL Structure & Canonical Policy

| Route Pattern | Canonical URL Format | Robots Meta | Sitemapped? |
|---|---|---|---|
| Home (`/`) | `https://walkthrough-by.samgirma.app/` | `index, follow` | Yes |
| Explore (`/explore`) | `https://walkthrough-by.samgirma.app/explore` | `index, follow` | Yes |
| Explore with Filters (`/explore?q=...&category=...`) | Canonicalizes to `/category/[cat]` or `/explore` | `noindex, follow` | No |
| Browse Directory (`/browse`) | `https://walkthrough-by.samgirma.app/browse` | `index, follow` | Yes |
| Category Hub (`/category/[cat]`) | `https://walkthrough-by.samgirma.app/category/[cat]` | `index, follow` (if >= 3 writeups) | If >= 3 writeups |
| CTF Hub (`/ctf/[event]`) | `https://walkthrough-by.samgirma.app/ctf/[event]` | `index, follow` (if >= 3 writeups) | If >= 3 writeups |
| Tag Hub (`/tag/[tag]`) | `https://walkthrough-by.samgirma.app/tag/[tag]` | `index, follow` (if >= 3 writeups) | If >= 3 writeups |
| Writeup (`/w/[user]/[slug]`) | `https://walkthrough-by.samgirma.app/w/[user]/[slug]` | `index, follow` (if `isIndexable`) | If `isIndexable` |
| Author Profile (`/u/[user]`) | `https://walkthrough-by.samgirma.app/u/[user]` | `index, follow` (if >= 1 writeup) | If >= 1 writeup |
| CVE Directory (`/cves`) | `https://walkthrough-by.samgirma.app/cves` | `index, follow` | Yes |
| CVE Details (`/cves/[id]`) | `https://walkthrough-by.samgirma.app/cves/[id]` | `index, follow` (if KEV or >= 1 writeup) | If KEV or >= 1 writeup |
| Live Events (`/events`) | `https://walkthrough-by.samgirma.app/events` | `index, follow` | Yes |
| CTF Sites (`/ctf-sites`) | `https://walkthrough-by.samgirma.app/ctf-sites` | `index, follow` | Yes |
| Auth (`/login`, `/register`) | `https://walkthrough-by.samgirma.app/login` | `noindex, follow` | No |
| Private Areas (`/dashboard`, `/write`, `/settings`, `/api/*`) | N/A | `noindex, nofollow` (`X-Robots-Tag`) | No |

### Normalization & 301 Rules
Handled in `src/middleware.ts`:
1. **Apex Host**: `www.walkthrough-by.samgirma.app` 301-redirects to `walkthrough-by.samgirma.app`.
2. **Trailing Slashes**: All paths with trailing slashes (e.g., `/explore/`) 301-redirect to their stripped equivalent (`/explore`).
3. **Lowercase URLs**: `/w/`, `/u/`, `/category/`, `/tag/` paths containing uppercase characters 301-redirect to lowercase equivalents.

---

## 3. UGC Quality Gate & Thresholds (`src/config/site.ts`)

```typescript
export const SEO_THRESHOLDS = {
  MIN_WORDS: 300,             // Minimum plain text words for public indexation
  MIN_AUTHOR_AGE_DAYS: 3,     // Account trust requirement
  MIN_HUB_WRITEUPS: 3,        // Hubs must have >= 3 indexable writeups
  MAX_TITLE_CHARS: 60,        // Clean display in SERP
  MAX_DESC_CHARS: 155,        // Clean snippet without ellipsis
  MIN_DESC_CHARS: 110,
} as const;
```

### Writeup Indexability Rules (`isIndexable`)
A writeup receives `robots: index, follow` and enters the sitemap **only** when all of the following evaluate to true:
1. `status === "PUBLIC"` (DRAFT is owner-only 404; UNLISTED is direct link only `noindex, false`).
2. `isFlagged === false` (not flagged for spam or abuse).
3. `wordCount >= SEO_THRESHOLDS.MIN_WORDS` (300 words).
4. Contains at least one Markdown heading (`#`).
5. Author account age >= 3 days or manually verified.
6. Admin override: `FORCE_INDEX` bypasses checks; `FORCE_NOINDEX` forces exclusion.

If a writeup fails any criterion, it remains accessible to viewers via direct URL but receives `<meta name="robots" content="noindex, follow">` and is omitted from `sitemap.xml`. When updated or when the author qualifies, it transitions automatically to indexable.

---

## 4. Structured Data (JSON-LD) Specifications

All JSON-LD blocks are server-rendered with XSS protection (`replace(/</g, "\\u003c")`).

### 1. Writeup Page (`Article` + `BreadcrumbList`)
```json
[
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "{writeup.title}",
    "description": "{cleanExcerpt}",
    "image": ["https://walkthrough-by.samgirma.app/w/{author}/{slug}/opengraph-image"],
    "datePublished": "{writeup.publishedAt}",
    "dateModified": "{writeup.updatedAt}",
    "author": {
      "@type": "Person",
      "name": "{author.username}",
      "url": "https://walkthrough-by.samgirma.app/u/{author.username}"
    },
    "publisher": {
      "@type": "Organization",
      "name": "WriteupHub",
      "logo": {
        "@type": "ImageObject",
        "url": "https://walkthrough-by.samgirma.app/icon.svg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://walkthrough-by.samgirma.app/w/{author}/{slug}"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://walkthrough-by.samgirma.app" },
      { "@type": "ListItem", "position": 2, "name": "{category}", "item": "https://walkthrough-by.samgirma.app/category/{category}" },
      { "@type": "ListItem", "position": 3, "name": "{ctfName}", "item": "https://walkthrough-by.samgirma.app/explore?q={ctfName}" },
      { "@type": "ListItem", "position": 4, "name": "{title}", "item": "https://walkthrough-by.samgirma.app/w/{author}/{slug}" }
    ]
  }
]
```

### 2. Researcher Profile (`ProfilePage` + `Person`)
```json
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "dateCreated": "{user.createdAt}",
  "mainEntity": {
    "@type": "Person",
    "name": "{username}",
    "alternateName": "{name}",
    "description": "{bio}",
    "url": "https://walkthrough-by.samgirma.app/u/{username}",
    "image": "{avatarUrl}",
    "sameAs": ["{githubUrl}"]
  }
}
```

---

## 5. Search Engine Verification & IndexNow

### Verification Keys
- **Google Search Console**: Token `01e9c885c93ef48b` verified via:
  - Static HTML file: `public/google01e9c885c93ef48b.html`
  - Fallback route: `src/app/google01e9c885c93ef48b.html/route.ts`
  - Root Layout meta: `<meta name="google-site-verification" content="01e9c885c93ef48b" />`
- **Bing Webmaster Tools**: Configurable via `process.env.BING_VERIFICATION` in `src/app/layout.tsx`.

### IndexNow Integration (`src/server/indexnow.service.ts`)
When writeups are published or updated, `revalidateWriteupCaches` dispatches an asynchronous, non-blocking notification to IndexNow (`api.indexnow.org`) with verification key file `public/01e9c885c93ef48b.txt`.

---

## 6. Maintenance & Operations Playbook

### Scenario A: Author Changes Their Username
1. The author selects a new username in Account Settings.
2. System checks `lastUsernameChange` (enforces 30-day throttle).
3. The old username is saved in `UsernameHistory`.
4. All inbound links to `/u/[old]` and `/w/[old]/[slug]` permanently 301-redirect to `/u/[new]` and `/w/[new]/[slug]`.
5. Caches for `user:[id]`, `writeups`, and `sitemap.xml` are purged.

### Scenario B: Writeup Title / Slug Renamed
1. Author edits title or slug.
2. System generates unique slug and saves `oldSlug` in `SlugHistory`.
3. Inbound requests to `/w/[user]/[oldSlug]` permanently 301-redirect to `/w/[user]/[newSlug]`.
4. IndexNow is pinged with the new URL.

### Scenario C: Copyright / Takedown / Flagged Writeup
1. Admin navigates to `/admin` or updates writeup in database:
   - Sets `status = DRAFT` or `moderationStatus = REMOVED` or `indexOverride = FORCE_NOINDEX`.
2. `revalidateWriteupCaches` is executed:
   - Route immediately returns HTTP 404 (or 410).
   - Removed from `sitemap.xml` within 60 seconds.
   - Removed from internal search index immediately.

### Scenario D: Automated Health Audits
Run these commands in CI or locally before deploying:
```bash
# Verify TypeScript definitions
npm run typecheck

# Run unit tests
npm run test

# Run SEO sitemap, threshold, and quality gate audit
npx dotenv-cli -e .env.local -- npm run seo:check

# Run Link Graph depth and orphan audit
npx dotenv-cli -e .env.local -- npm run seo:crawl
```
