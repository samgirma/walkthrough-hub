import { z } from "zod";

export const RESERVED_USERNAMES = [
  "admin",
  "administrator",
  "root",
  "api",
  "explore",
  "dashboard",
  "write",
  "login",
  "register",
  "signin",
  "signup",
  "onboarding",
  "settings",
  "profile",
  "user",
  "users",
  "writeup",
  "writeups",
  "w",
  "u",
  "terms",
  "privacy",
  "help",
  "auth",
  "bot",
  "system",
  "null",
  "undefined",
] as const;

export function sanitizeUsername(input: string): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 24);
}

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(24, "Username must be at most 24 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens"
  )
  .refine(
    (val) => !RESERVED_USERNAMES.includes(val.toLowerCase() as any),
    "This username is reserved and cannot be claimed"
  );

export const onboardingSchema = z.object({
  username: usernameSchema,
});

export const telegramAuthSchema = z.object({
  id: z.union([z.number(), z.string().regex(/^\d+$/)]).transform((v) => String(v)),
  first_name: z.string().min(1, "First name is required"),
  last_name: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v !== "undefined" && v.trim() !== "" ? v : undefined)),
  username: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v !== "undefined" && v.trim() !== "" ? v : undefined)),
  photo_url: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v !== "undefined" && v.trim() !== "" ? v : undefined)),
  auth_date: z.union([z.number(), z.string().regex(/^\d+$/)]).transform((v) => Number(v)),
  hash: z.string().min(32, "Invalid signature hash"),
});

export type TelegramAuthData = z.infer<typeof telegramAuthSchema>;

/**
 * Sanitizes redirect targets to prevent open redirects.
 * Only accepts same-origin relative paths starting with a single '/'
 * and explicitly rejects '//', protocol schemes, and backslashes.
 */
export function sanitizeRedirectUrl(target?: string | null): string {
  if (!target || typeof target !== "string") {
    return "/dashboard";
  }

  const trimmed = target.trim();

  // Reject empty or non-relative
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return "/dashboard";
  }

  // Reject URLs containing protocol schemes like http:, javascript:, data:
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return "/dashboard";
  }

  // Reject carriage returns / newlines / control characters
  if (/[\r\n\t]/.test(trimmed)) {
    return "/dashboard";
  }

  return trimmed;
}

export const registerSchema = z.object({
  username: usernameSchema,
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  bio: z.string().max(300, "Bio must be at most 300 characters").optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
