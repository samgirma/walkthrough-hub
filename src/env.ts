import { z } from "zod";

// Core mandatory environment variables
const coreEnvSchema = z.object({
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required for session signing"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DEV_LOGIN: z.string().optional(),
});

// Provider specific schemas
const googleEnvSchema = z.object({
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
});

const githubEnvSchema = z.object({
  AUTH_GITHUB_ID: z.string().min(1),
  AUTH_GITHUB_SECRET: z.string().min(1),
});

const telegramEnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: z.string().min(1),
  NEXT_PUBLIC_TELEGRAM_BOT_ID: z.string().min(1),
});

// Parse core
const rawEnv = {
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
  DEV_LOGIN: process.env.DEV_LOGIN,
};

const parsedCore = coreEnvSchema.safeParse(rawEnv);
if (!parsedCore.success) {
  console.warn(
    "[WriteupHub Auth] Warning: Core environment variables missing or incomplete:",
    parsedCore.error.format()
  );
}

// Evaluate providers
const isGoogleEnabled = googleEnvSchema.safeParse({
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
}).success;

const isGithubEnabled = githubEnvSchema.safeParse({
  AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
  AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
}).success;

const isTelegramEnabled = telegramEnvSchema.safeParse({
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  NEXT_PUBLIC_TELEGRAM_BOT_ID: process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID,
}).success;

const isDevEnabled =
  process.env.NODE_ENV === "development" && process.env.DEV_LOGIN === "true";

export type AuthProviderName = "google" | "github" | "telegram" | "dev";

export function isProviderEnabled(name: AuthProviderName): boolean {
  switch (name) {
    case "google":
      return isGoogleEnabled;
    case "github":
      return isGithubEnabled;
    case "telegram":
      return isTelegramEnabled;
    case "dev":
      return isDevEnabled;
    default:
      return false;
  }
}

export function getEnabledProviders(): Record<AuthProviderName, boolean> {
  return {
    google: isGoogleEnabled,
    github: isGithubEnabled,
    telegram: isTelegramEnabled,
    dev: isDevEnabled,
  };
}

let diagnosticsLogged = false;
export function logStartupDiagnostics() {
  if (diagnosticsLogged || process.env.NODE_ENV === "test") return;
  diagnosticsLogged = true;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  console.log("┌─────────────────────────────────────────────────────────────┐");
  console.log("│              WriteupHub Auth Initialization                 │");
  console.log("├────────────┬──────────┬─────────────────────────────────────┤");
  console.log(`│ Google     │ ${isGoogleEnabled ? "ENABLED " : "DISABLED"} │ ${appUrl}/api/auth/callback/google `);
  console.log(`│ GitHub     │ ${isGithubEnabled ? "ENABLED " : "DISABLED"} │ ${appUrl}/api/auth/callback/github `);
  console.log(`│ Telegram   │ ${isTelegramEnabled ? "ENABLED " : "DISABLED"} │ Bot: @${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "none"} `);
  console.log(`│ Dev Login  │ ${isDevEnabled ? "ENABLED " : "DISABLED"} │ (Development seeded accounts) `);
  console.log("└────────────┴──────────┴─────────────────────────────────────┘");

  if (!isGoogleEnabled) console.warn("[Auth Warning] Google OAuth is disabled: Missing AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET.");
  if (!isGithubEnabled) console.warn("[Auth Warning] GitHub OAuth is disabled: Missing AUTH_GITHUB_ID or AUTH_GITHUB_SECRET.");
  if (!isTelegramEnabled) console.warn("[Auth Warning] Telegram Login is disabled: Missing TELEGRAM_BOT_TOKEN or bot credentials.");
}
