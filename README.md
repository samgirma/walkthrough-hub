# WriteupHub 🏴‍☠️

> **Production-grade CTF writeup and exploit publishing platform.** Dissect challenges, publish cryptographically structured walkthroughs in Markdown, and share them publicly with zero authentication required.

---

## ⚡ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19 Server Components for public routes)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Lucide Icons](https://lucide.dev/) + [next-themes](https://github.com/pacocoursey/next-themes) (Dark mode default `#0B0D12` / `#12151C`)
- **Database & ORM**: PostgreSQL with [Prisma ORM](https://www.prisma.io/) (Supabase or local Docker Postgres)
- **Authentication**: [Auth.js (NextAuth v5)](https://authjs.dev/) with GitHub OAuth + Email/Password (bcrypt)
- **Markdown Engine**: Unified / Remark / Rehype pipeline
  - `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `rehype-sanitize` (strict XSS prevention)
  - [Shiki](https://shiki.style/) dual-theme code syntax highlighting with custom chrome header and copy button
  - Custom CTF directives: `:::callout[tip|warning|danger]` and `:::flag` spoiler boxes
- **Asset Storage**: Storage service abstraction supporting Supabase Storage and local disk fallback with 5MB cap & MIME validation
- **Forms & Validation**: [Zod](https://zod.dev/) + [react-hook-form](https://react-hook-form.com/)
- **Client Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Testing**: [Vitest](https://vitest.dev/) for unit & service tests, [Playwright](https://playwright.dev/) for critical E2E flows

---

## ✨ Features

- **Zero-Auth Public Reading**: Anyone can read public and unlisted writeups directly via shareable URLs (`/w/[username]/[slug]`) with no account required.
- **Strict Data-Layer Visibility**:
  - `DRAFT`: Author-only access (404/redirect for visitors).
  - `UNLISTED`: Direct link access with `noindex, nofollow` headers; excluded from search feeds and sitemaps.
  - `PUBLIC`: Publicly indexed, listed on `/explore`, `/feed.xml`, and `/sitemap.xml`.
- **Studio Markdown Editor**:
  - Live split-screen Markdown authoring with synchronized preview.
  - Quick insertion toolbar: Headings, Bold, Italic, Tables, Shiki code blocks, CTF callouts, Flag spoiler boxes.
  - Real-time reading time telemetry and image upload integration.
- **Author Dashboard**:
  - `/dashboard`: Metrics for total views, published writeups, and drafts.
  - `/dashboard/writeups`: Writeup management with status filtering, search, and deletion.
  - `/dashboard/bookmarks`: Personal bookmarks library.
  - `/dashboard/settings`: Author persona profile, avatar upload, and GitHub integration.
- **Dynamic SEO & Social Sharing**:
  - Dynamic Open Graph preview cards generated with `next/og` (`/w/[username]/[slug]/opengraph-image.tsx`).
  - Automatically generated `/sitemap.xml`, `/robots.txt`, and RSS 2.0 feed at `/feed.xml`.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (Node 20+ recommended)
- Docker & Docker Compose (for local PostgreSQL)

### 2. Environment Setup
Copy the environment template:
```bash
cp .env.example .env
```

Ensure `.env` matches your database configuration:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/writeuphub?schema=public"
AUTH_SECRET="writeuphub-super-secret-development-key-change-in-production-min32chars"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Start PostgreSQL Database
```bash
docker compose up -d
```

### 4. Push Schema & Seed Database
```bash
# Push Prisma schema to the database
npm run db:push

# Seed with realistic CTF writeups, users, and tags
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

```bash
# Run Vitest unit & service test suites (28 tests)
npm run test

# Run TypeScript strict typecheck
npm run typecheck

# Run ESLint validation
npm run lint

# Run Playwright E2E tests
npm run test:e2e
```

---

## 📦 Production Build

```bash
npm run build
npm run start
```

---

## 🔒 Security

- Sanitized Markdown output prevents XSS and malicious script execution.
- Strict Content-Security-Policy (CSP) headers enabled in Next.js configuration.
- Sliding-window rate limiters on auth, upload, and view count increment endpoints.
- Server-side authorization checks ensure users can only modify their own writeups.

---

## 📜 License
MIT
