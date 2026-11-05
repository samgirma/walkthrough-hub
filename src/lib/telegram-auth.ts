import crypto from "crypto";
import { telegramAuthSchema, TelegramAuthData } from "@/lib/validations/auth.schema";

export interface TelegramVerifyResult {
  valid: boolean;
  error?: string;
  data?: TelegramAuthData;
}

/**
 * Validates Telegram Login Widget payload using cryptographic HMAC-SHA256.
 *
 * Algorithm per Telegram Login Widget specification (core.telegram.org/widgets/login):
 * 1. Collect all received fields except 'hash'.
 * 2. Sort fields in alphabetical order and concatenate as "key=value\n".
 * 3. Compute secret_key = SHA256(TELEGRAM_BOT_TOKEN).
 * 4. Compute expected_hash = HMAC_SHA256(secret_key, data_check_string).
 * 5. Verify expected_hash against payload hash using timing-safe comparison.
 * 6. Enforce replay attack protection (max 5 minutes age on auth_date).
 */
export function verifyTelegramAuth(
  payload: unknown,
  botToken: string = process.env.TELEGRAM_BOT_TOKEN || ""
): TelegramVerifyResult {
  if (!botToken) {
    return { valid: false, error: "Telegram bot token is not configured on server" };
  }

  // 1. Validate structure with Zod
  const parsed = telegramAuthSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      valid: false,
      error: parsed.error.errors.map((e) => e.message).join(", "),
    };
  }

  const data = parsed.data;

  // 2. Replay attack protection: reject if auth_date is older than 5 minutes (300 seconds)
  const nowUnix = Math.floor(Date.now() / 1000);
  const maxAgeSeconds = 300; // 5 minutes
  if (nowUnix - data.auth_date > maxAgeSeconds) {
    return {
      valid: false,
      error: "Authentication data has expired. Please try signing in again.",
    };
  }

  // Future timestamp tolerance (allow max 30s clock skew)
  if (data.auth_date - nowUnix > 30) {
    return {
      valid: false,
      error: "Authentication timestamp is from the future.",
    };
  }

  // 3. Build data_check_string: ONLY standard Telegram specification keys, sorted alphabetically
  const rawObj = payload as Record<string, unknown>;
  const TELEGRAM_SPEC_KEYS = [
    "auth_date",
    "first_name",
    "id",
    "last_name",
    "photo_url",
    "username",
  ];

  const checkFields: string[] = [];
  const keys = TELEGRAM_SPEC_KEYS.filter(
    (k) =>
      rawObj[k] !== undefined &&
      rawObj[k] !== null &&
      rawObj[k] !== "" &&
      rawObj[k] !== "undefined"
  ).sort();

  for (const k of keys) {
    checkFields.push(`${k}=${rawObj[k]}`);
  }

  const dataCheckString = checkFields.join("\n");

  // 4. Derive secret key: SHA256(botToken)
  const secretKey = crypto.createHash("sha256").update(botToken).digest();

  // 5. Compute HMAC-SHA256(secretKey, dataCheckString)
  const expectedHashHex = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  // 6. Timing-safe comparison to prevent side-channel timing attacks
  const expectedBuffer = Buffer.from(expectedHashHex, "hex");
  const receivedBuffer = Buffer.from(data.hash, "hex");

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return {
      valid: false,
      error: "Invalid Telegram signature hash. Verification failed.",
    };
  }

  return {
    valid: true,
    data,
  };
}
