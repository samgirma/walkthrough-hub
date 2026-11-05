# WriteupHub Authentication & Security Architecture

This document specifies the end-to-end authentication, authorization, and cryptographic security architecture for **WriteupHub** (Next.js 15 App Router, Auth.js v5 beta, Prisma ORM, PostgreSQL on Supabase).

---

## 1. System Architecture

WriteupHub employs a defense-in-depth security model separating edge route protection, runtime authentication services, and an authoritative Data Access Layer (DAL).

```mermaid
flowchart TD
    subgraph Client["Client Browser"]
        UI[User / React Components]
        Modal[Session Expired Modal]
        Storage[(localStorage Draft Backup)]
    end

    subgraph Edge["Edge Runtime"]
        MW[middleware.ts\nauth.config.ts]
    end

    subgraph ServerNode["Node.js Server Runtime"]
        NextAuth[src/auth.ts\nNextAuth Handler]
        DAL[src/server/auth/dal.ts\nReact cache]
        Service[Writeup & Auth Services]
        RL[Rate Limiter\nSliding Window]
    end

    subgraph Database["Database & Providers"]
        Prisma[(Prisma ORM)]
        Supabase[(PostgreSQL / Supabase)]
        OAuth[Google / GitHub / Telegram]
    end

    UI -->|HTTP Requests| MW
    MW -->|Edge Redirects| UI
    MW -->|Pass-Through| ServerNode
    NextAuth --> Prisma
    DAL --> NextAuth
    DAL --> Prisma
    Service --> DAL
    Prisma --> Supabase
    NextAuth --> OAuth
    UI -.->|401 Recovery| Modal
    Modal -.-> Storage
```

---

## 2. Edge-Safe Configuration Split

Auth.js v5 requires isolating database adapters from the Edge runtime:

| File | Runtime | Dependencies | Purpose |
| :--- | :--- | :--- | :--- |
| `src/auth.config.ts` | **Edge & Node** | Zero Prisma / DB drivers | Route definitions, page mappings, provider declarations for middleware matching, edge authorization callbacks. |
| `src/auth.ts` | **Node.js only** | Prisma, `@auth/prisma-adapter`, `crypto` | Database session synchronization, Telegram custom Credentials provider, Dev login provider, JWT & Session callbacks. |
| `src/middleware.ts` | **Edge** | Imports only `auth.config.ts` | Fast edge-level redirect for unauthenticated or non-onboarded visitors. |
| `src/server/auth/dal.ts` | **Node.js (Server Components / Actions)** | React `cache()`, Prisma, `auth()` | The authoritative security boundary for all database reads and writes. |

---

## 3. Core Authentication Flows

### A. Sign-In Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Login as /login Page
    participant NextAuth as NextAuth Runtime
    participant Provider as OAuth / Telegram
    participant DB as Prisma / Database

    User->>Login: Selects Provider (Google, GitHub, Telegram)
    alt OAuth (Google / GitHub)
        Login->>Provider: Redirect to OAuth Consent
        Provider-->>NextAuth: Callback with code & verified profile
        NextAuth->>DB: Upsert User & Account
    else Telegram Login Widget
        Login->>Provider: Authorizes in Telegram Widget
        Provider-->>Login: Emits signed payload (hash, auth_date, id)
        Login->>NextAuth: POST /api/auth/callback/credentials (telegram)
        NextAuth->>NextAuth: HMAC-SHA256 & replay check (auth_date > lastAuthDate)
        NextAuth->>DB: Upsert User & Account with lastAuthDate
    end
    NextAuth-->>User: Set secure HTTP-only JWT session cookie (30-day maxAge)
    User->>Login: Check onboarded status
    alt Has Username
        Login-->>User: Redirect to sanitized callbackUrl
    else No Username
        Login-->>User: Redirect to /onboarding
    end
```

### B. Onboarding & Handle Reservation Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Onboarding as /onboarding UI
    participant Action as completeOnboardingAction()
    participant DB as Prisma / Database

    User->>Onboarding: Types desired handle (e.g. "0xNullPtr")
    Onboarding->>Onboarding: Client debounced validation (3-24 chars, a-z0-9_)
    User->>Action: Submits handle
    Action->>Action: Verify session & Rate limit (10 attempts/min)
    Action->>Action: Sanitize handle & Zod regex check
    Action->>DB: Check unique handle collision
    alt Handle Taken
        Action-->>User: Return error ("Handle already taken")
    else Handle Available
        Action->>DB: Update user.username
        Action-->>User: Return success
        User->>Onboarding: Session updated, redirect to /dashboard
    end
```

### C. Explicit Account Linking & Unlinking Flow
- **Auto-linking on verified email**: Google and GitHub OAuth have `allowDangerousEmailAccountLinking: true`. If a user logs in with Google (`user@domain.com`), and subsequently signs in with GitHub using the exact same verified primary email, Auth.js links both accounts to the same `User` entity.
- **Telegram Linking**: Telegram carries no email, so account linking is explicit. Inside `/dashboard/settings`, an authenticated user can click "Connect Telegram" to link their Telegram ID to their existing profile.
- **Unlink Protection**: The system guarantees users cannot disconnect their sole remaining authentication provider. If `accounts.length <= 1`, the disconnect action is rejected both in the UI and enforced at the server action layer.

### D. Mid-Edit Session Expiration & Autosave Recovery
1. **Autosave**: The studio editor periodically backs up writeup markdown and metadata to client `localStorage` under `writeuphub:draft:${writeupId}`.
2. **Graceful 401 Interception**: When a network mutation (publish, autosave, or image upload) returns HTTP `401 Unauthorized`, the editor does **not** hard redirect away and lose unsaved work.
3. **Session Expired Modal**: Displays a non-navigating dialog: *"Session expired. Your draft is backed up locally. Sign in in a new tab to resume, then click retry."*

---

## 4. Data Access Layer (DAL) Reference

Middleware redirects provide convenience, but `src/server/auth/dal.ts` constitutes the authoritative access boundary. All server components and actions must pass through these helpers:

```typescript
// 1. Read current session without throwing (cached per request)
const session = await getSession();

// 2. Read full User record with fresh DB verification (cached per request)
const user = await getCurrentUser();

// 3. Enforce authenticated user, redirecting to /login with callbackUrl if anonymous
const user = await requireUser("/dashboard");

// 4. Enforce user is fully onboarded with a chosen username
const user = await requireOnboarded("/write");

// 5. Enforce specific role (e.g. Role.ADMIN)
const admin = await requireRole(Role.ADMIN);

// 6. Enforce writeup ownership; returns writeup or throws notFound()
// Throws notFound() rather than 403 to prevent ID-enumeration leaks
const writeup = await requireWriteupOwner(writeupId);
```

### Unified Viewer Function: `getWriteupForViewer`
All public and internal readers access writeups through `src/server/writeup.service.ts`:
- **`PUBLIC`**: Accessible to any viewer (anonymous or authenticated).
- **`UNLISTED`**: Accessible to any viewer with the direct link.
- **`DRAFT`**: Accessible strictly to the author. For all other users, returns `null` (`notFound()`).

---

## 5. Route & Action Permission Matrix

| Path / Action | Type | Anonymous | Authenticated (No Handle) | Authenticated (Onboarded) | Admin |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `/` (Home) | Page | View | View | View | View |
| `/explore` | Page | View | View | View | View |
| `/w/[username]/[slug]` (Public) | Page | View | View | View | View |
| `/w/[username]/[slug]` (Draft) | Page | 404 | 404 | Author only (404 for others) | Author only |
| `/login` | Page | View | Redirect `/onboarding` | Redirect `/dashboard` | Redirect `/dashboard` |
| `/onboarding` | Page | Redirect `/login` | View / Choose Handle | Redirect `/dashboard` | Redirect `/dashboard` |
| `/dashboard/*` | Page | Redirect `/login` | Redirect `/onboarding` | View | View |
| `/write` | Page | Redirect `/login` | Redirect `/onboarding` | View | View |
| `/write/[id]` | Page | Redirect `/login` | Redirect `/onboarding` | Author only (404 for others) | Author only |
| `/api/upload` | Route | 401 | 403 | Allowed (Scoped to User ID) | Allowed |
| `completeOnboardingAction` | Server Action | 401 | Allowed | Allowed | Allowed |
| `unlinkProviderAction` | Server Action | 401 | 401 | Guarded (min 1 method) | Guarded (min 1 method) |
| `deleteAccountAction` | Server Action | 401 | 401 | Confirms exact handle | Confirms exact handle |

---

## 6. Environment Variables Reference

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `AUTH_SECRET` | **Yes** | 32+ byte key for encrypting JWT session cookies. | `openssl rand -base64 32` |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (transaction pooler). | `postgresql://user:pass@aws-0...pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | **Yes** | PostgreSQL direct connection (for migrations & CLI). | `postgresql://user:pass@aws-0...supabase.com:5432/postgres` |
| `NEXT_PUBLIC_APP_URL` | Optional | Canonical site URL (defaults to `http://localhost:3000`). | `https://writeuphub.sec` |
| `AUTH_GOOGLE_ID` | Optional | Google Cloud OAuth Client ID. | `123456789-abc.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | Optional | Google Cloud OAuth Client Secret. | `GOCSPX-abc123xyz` |
| `AUTH_GITHUB_ID` | Optional | GitHub OAuth App Client ID. | `Ov23liAbCdEfGh` |
| `AUTH_GITHUB_SECRET` | Optional | GitHub OAuth App Client Secret. | `a1b2c3d4e5f6...` |
| `TELEGRAM_BOT_TOKEN` | Optional | Telegram Bot API Token for HMAC verification. | `123456789:ABCdefGHIjklMNOpqrSTUvwxYZ` |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Optional | Public bot username for the login widget. | `WriteupHubAuthBot` |
| `NEXT_PUBLIC_TELEGRAM_BOT_ID` | Optional | Telegram Bot ID for embed scripts. | `123456789` |
| `DEV_LOGIN` | Dev only | Set to `"true"` to enable one-click dev bypass. | `"true"` |

---

## 7. Cryptographic Security & Hardening

1. **Telegram Login Verification (`src/lib/telegram-auth.ts`)**:
   - Computes `secret_key = SHA256(botToken)`.
   - Concatenates sorted key-value pairs into `data_check_string`.
   - Computes `HMAC-SHA256(secret_key, data_check_string)`.
   - Compares hashes using constant-time `crypto.timingSafeEqual` to eliminate timing attacks.
   - Enforces a 5-minute maximum age on `auth_date`.
   - Stores `Account.lastAuthDate` in database; rejects requests where `auth_date <= lastAuthDate` to prevent replay attacks.
2. **Open Redirect Sanitization (`src/lib/validations/auth.schema.ts`)**:
   - Only relative paths starting with `/` are accepted.
   - Rejects protocol-relative URLs (`//evil.com`), JavaScript URIs (`javascript:`), backslashes, and external schemes.
   - Fallback destination defaults safely to `/`.
3. **Rate Limiting (`src/lib/rate-limit.ts`)**:
   - In-memory sliding window rate limiter with auto-cleanup of stale records.
   - Rate limits `/api/auth/[...nextauth]` actions (10 req/min per IP), registration (5 req/min), and onboarding (10 req/min).
   - Returns HTTP 429 with `Retry-After` header.
4. **Content Security Policy (`next.config.ts`)**:
   - Restricts frame ancestors (`frame-ancestors 'none'`).
   - Allows Telegram script and OAuth frame (`https://telegram.org`, `https://oauth.telegram.org`) strictly on `/login` and `/dashboard/settings`.

---

## 8. Manual QA Verification Checklist

- [x] **Dev Login**: Visit `/login`, click "Dev Bypass (Sign in as @0xNullPtr)", verify immediate session establishment and redirect to `/dashboard`.
- [x] **Route Protection**: Open incognito browser, visit `/write` -> verify redirect to `/login?callbackUrl=%2Fwrite`.
- [x] **Dashboard Protection**: In incognito, visit `/dashboard/bookmarks` -> verify redirect to `/login?callbackUrl=%2Fdashboard%2Fbookmarks`.
- [x] **Onboarding Gate**: Log in as a user without a username -> verify redirection to `/onboarding`. Verify `/write` and `/dashboard` cannot be accessed until a handle is chosen.
- [x] **Username Validation**: On `/onboarding`, attempt submitting `"admin"` or special characters -> verify error prompt.
- [x] **Account Unlinking Guard**: In `/dashboard/settings`, attempt to unlink the sole connected provider -> verify button is disabled with explanatory tooltip.
- [x] **Account Deletion Flow**: In `/dashboard/settings`, open Danger Zone modal, enter mismatched handle -> verify deletion is blocked. Enter exact handle -> verify account deleted, sessions cleared, and redirected to `/`.
- [x] **Session Recovery**: Edit a writeup in the studio, simulate session expiry -> verify non-navigating modal appears and draft is preserved in `localStorage`.
