# WriteupHub Social Link Previews Audit Report

> **Audit Date**: 2026-11-08  
> **Audited User Agents**:  
> 1. `facebookexternalhit/1.1` (Facebook & Instagram)  
> 2. `Twitterbot/1.0` (X / Twitter)  
> 3. `TelegramBot (like TwitterBot)` (Telegram)  
> 4. `WhatsApp/2.23` (WhatsApp)  
> 5. `LinkedInBot/1.0` (LinkedIn)  
> 6. `Slackbot-LinkExpanding 1.0` (Slack)  
> 7. `Discordbot/2.0` (Discord)  
> **Target Production URL**: `https://walkthrough-by.samgirma.app`  
> **Status**: PHASE 0: AUDIT COMPLETE (No code changes applied)

---

## 1. Bot Crawler Matrix by Page Type

| Page Type | Sample Path | Facebook | Twitter/X | Telegram | WhatsApp | LinkedIn | Slack | Discord | Raw HTML Tags | OG Image Status | Content-Type | Size / Dims |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|:---:|:---:|:---:|
| **Home** | `/` | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | `og:title`, `og:desc`, `tw:card` | **MISSING** | `text/html` | N/A |
| **Explore** | `/explore` | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | `og:title`, `og:desc`, `tw:card` | **MISSING** | `text/html` | N/A |
| **Writeup (PUBLIC)** | `/w/0xNullPtr/runc-...` | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | Full `og:*` & `twitter:*` | 200 OK | `image/png` | ~45 KB / 1200x630 |
| **Writeup (UNLISTED)** | `/w/0xNullPtr/private-...` | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | Full `og:*` & `twitter:*` | 200 OK | `image/png` | ~42 KB / 1200x630 |
| **Profile** | `/u/0xNullPtr` | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | `og:title`, `og:desc`, `tw:card` | **MISSING** | `text/html` | N/A |
| **Category Hub** | `/category/web` | **404** | **404** | **404** | **404** | **404** | **404** | **404** | 404 Fallback | **MISSING** | `text/html` | N/A |
| **CTF Hub** | `/ctf/def-con-32` | **404** | **404** | **404** | **404** | **404** | **404** | **404** | 404 Fallback | **MISSING** | `text/html` | N/A |
| **CVE Directory** | `/cves` | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | `og:title`, `og:desc`, `tw:card` | **MISSING** | `text/html` | N/A |
| **CVE Detail** | `/cves/CVE-2024-21626` | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | `og:title`, `og:desc`, `tw:card` | **MISSING** | `text/html` | N/A |
| **Events** | `/events` | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | `og:title`, `og:desc`, `tw:card` | **MISSING** | `text/html` | N/A |
| **CTF Sites** | `/ctf-sites` | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | `og:title`, `og:desc`, `tw:card` | **MISSING** | `text/html` | N/A |
| **Login** | `/login` | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK | `og:title`, `og:desc`, `tw:card` | **MISSING** | `text/html` | N/A |

---

## 2. Platform-by-Platform Preview Behavior

### 1. Telegram
- **Behavior**: Telegram's preview bot fetches the page with `TelegramBot (like TwitterBot)`.
- **Finding on Writeups**: Displays title, description, and dynamic image card.
- **Finding on Home / Explore / Profiles / CVEs**: Since `og:image` is absent, Telegram displays only a small plain text bubble with no banner image.
- **Cache Invalidation**: Telegram aggressively caches previews indefinitely by URL. Without a cache-busting query parameter (`?v=<hash>`), subsequent edits to titles, excerpts, or images will NOT update on Telegram unless purged manually via `@WebpageBot`.

### 2. WhatsApp
- **Behavior**: WhatsApp mobile and web inspect `og:title`, `og:description`, and `og:image`.
- **Finding**: Expects a square or 1.91:1 image under 300 KB. On non-writeup routes, missing `og:image` results in no card preview.

### 3. X / Twitter
- **Behavior**: Looks for `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, and `twitter:site`.
- **Finding**: `twitter:card="summary_large_image"` is set globally in root layout, but without `twitter:image`, X Card Validator falls back to a plain text link card without media.
- **Missing Attribution**: `twitter:site` and `twitter:creator` (author handle) are missing.

### 4. LinkedIn
- **Behavior**: Requires `og:title`, `og:description`, `og:image`, `og:url`.
- **Finding**: LinkedIn Post Inspector requires explicit `og:image:width` and `og:image:height` for reliable large-image rendering. Currently omitted in `generateMetadata`.

### 5. Discord & Slack
- **Behavior**: Discordbot and Slackbot fetch the head metadata and render rich embeds using `theme-color` for the left accent stripe.
- **Finding**: Embed works on `/w/...` but uses generic `#0B0D12` without category-specific branding. Missing images on all other routes.

---

## 3. Dynamic Image Generation (`next/og`) Deficiencies

1. **Non-Latin Script / Amharic Support (Tofu Prevention)**:
   - Current `opengraph-image.tsx` relies entirely on system `fontFamily: "sans-serif"`.
   - Satori (the SVG rendering engine behind Next.js `ImageResponse`) **does not include system fonts at runtime**. It renders default bundled Inter-like glyphs.
   - If a title contains Ethiopic/Ge'ez script (U+1200–U+137F) used in Amharic security writeups (e.g., Ethiopian cyber defense, university CTFs), Satori renders empty rectangle boxes (**tofu**).
   - *Fix Needed*: Bundle `Inter-ExtraBold.ttf`, `Inter-SemiBold.ttf`, and `NotoSansEthiopic-Bold.ttf` directly in `/src/assets/fonts/` and register them inside `ImageResponse({ fonts: [...] })`.
2. **Missing Dynamic OG Routes for Hubs, Profiles, and CVEs**:
   - Currently, ONLY `/w/[username]/[slug]` has an `opengraph-image.tsx` file.
   - There are no dynamic image generators for:
     - `/u/[username]/opengraph-image.tsx` (author profile card: avatar, username, writeup count, bio)
     - `/cves/[id]/opengraph-image.tsx` (CVE card: CVE ID, CVSS score badge, KEV wild status, summary)
     - `/category/[category]/opengraph-image.tsx` (topic card)
3. **No Fallback Static OG Card (`/public/og/og-default.jpg`)**:
   - `src/config/site.ts` references `ogImage: "/og.png"`, which does not exist in `/public/`.
   - All general routes (`/`, `/explore`, `/events`, `/ctf-sites`) require high-resolution branded default card artwork.
4. **Missing Native Share Menu & Live Social Preview in Editor**:
   - Writeup reader has an action bar with simple copy link, but no native `navigator.share` integration or pre-filled share URLs for Telegram, WhatsApp, X, and LinkedIn.
   - Studio editor (`src/components/editor/studio-editor.tsx`) has no live social preview card simulator showing how the writeup will look when pasted into social apps.

---

## 4. Next Steps (Pending User Approval)
- Review findings in `SOCIAL_AUDIT.md`.
- Review the comprehensive implementation plan artifact.
- Await user `"go"` before implementing Phase 1 metadata builders, bundled font assets, and dynamic ImageResponse generators.
