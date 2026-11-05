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

## 🔑 Auth Setup (Google, GitHub, Telegram)

WriteupHub provides unified, passwordless OAuth sign-in with Google, GitHub, and Telegram.

### 1. Google OAuth
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services > Credentials** > **Create Credentials > OAuth client ID**.
3. Select **Web application**.
4. Set **Authorized redirect URIs**:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://walkthrough-by.samgirma.app/api/auth/callback/google`
5. Copy the Client ID and Client Secret into `.env`:
   ```bash
   AUTH_GOOGLE_ID="your-client-id.apps.googleusercontent.com"
   AUTH_GOOGLE_SECRET="your-client-secret"
   ```

### 2. GitHub OAuth
1. In GitHub, go to **Settings > Developer Settings > OAuth Apps > New OAuth App**.
2. Set **Homepage URL**: `http://localhost:3000` (or your domain).
3. Set **Authorization callback URL**:
   - Local: `http://localhost:3000/api/auth/callback/github`
   - Production: `https://walkthrough-by.samgirma.app/api/auth/callback/github`
4. Copy Client ID and generate a Client Secret into `.env`:
   ```bash
   AUTH_GITHUB_ID="your-github-client-id"
   AUTH_GITHUB_SECRET="your-github-client-secret"
   ```

### 3. Telegram Login Widget
Telegram uses HMAC-SHA256 signature verification tied to a Telegram bot:
1. Message [@BotFather](https://t.me/BotFather) on Telegram and create a bot (`/newbot`).
2. Copy the bot token into `TELEGRAM_BOT_TOKEN` in `.env`.
3. Note the Bot ID (the numeric prefix before `:` in the token) into `NEXT_PUBLIC_TELEGRAM_BOT_ID`.
4. Link your domain with BotFather:
   - Send `/setdomain` to `@BotFather`.
   - Select your bot.
   - Enter your public domain (e.g. `walkthrough-by.samgirma.app`).
   - *Note for local development:* Telegram login widgets require a publicly resolvable HTTPS domain or tunnel (e.g. Cloudflare Tunnel, ngrok, or localtunnel) pointing to port 3000. Set `/setdomain` to that HTTPS tunnel host.

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
