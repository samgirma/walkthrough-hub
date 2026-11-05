import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifyTelegramAuth } from "@/lib/telegram-auth";

describe("Telegram Authentication Hash Verification", () => {
  const mockBotToken = "123456789:ABCdefGHIjklMNOpqrSTUvwxYZ";

  function createSignedTelegramPayload(
    fields: Record<string, string | number>,
    token: string = mockBotToken
  ) {
    const checkFields: string[] = [];
    const keys = Object.keys(fields).sort();

    for (const k of keys) {
      checkFields.push(`${k}=${fields[k]}`);
    }

    const dataCheckString = checkFields.join("\n");
    const secretKey = crypto.createHash("sha256").update(token).digest();
    const hash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    return {
      ...fields,
      hash,
    };
  }

  it("successfully verifies a valid cryptographic Telegram payload", () => {
    const payload = createSignedTelegramPayload({
      id: 987654321,
      first_name: "Alice",
      last_name: "Hacker",
      username: "alice_sec",
      auth_date: Math.floor(Date.now() / 1000) - 30, // 30s ago
    });

    const result = verifyTelegramAuth(payload, mockBotToken);
    expect(result.valid).toBe(true);
    expect(result.data?.id).toBe("987654321");
    expect(result.data?.first_name).toBe("Alice");
    expect(result.data?.username).toBe("alice_sec");
  });

  it("rejects payload with tampered fields", () => {
    const payload = createSignedTelegramPayload({
      id: 987654321,
      first_name: "Alice",
      auth_date: Math.floor(Date.now() / 1000) - 30,
    });

    // Tamper with first_name without updating hash
    const tampered = { ...payload, first_name: "Mallory" };
    const result = verifyTelegramAuth(tampered, mockBotToken);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Invalid Telegram signature/i);
  });

  it("rejects expired auth_date older than 5 minutes (replay protection)", () => {
    const sixMinutesAgo = Math.floor(Date.now() / 1000) - 360;
    const payload = createSignedTelegramPayload({
      id: 987654321,
      first_name: "Alice",
      auth_date: sixMinutesAgo,
    });

    const result = verifyTelegramAuth(payload, mockBotToken);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/expired/i);
  });

  it("rejects payload with missing hash", () => {
    const payload = {
      id: 987654321,
      first_name: "Alice",
      auth_date: Math.floor(Date.now() / 1000),
    };

    const result = verifyTelegramAuth(payload, mockBotToken);
    expect(result.valid).toBe(false);
  });

  it("fails verification when verified with the wrong bot token", () => {
    const payload = createSignedTelegramPayload({
      id: 987654321,
      first_name: "Alice",
      auth_date: Math.floor(Date.now() / 1000) - 10,
    });

    const wrongToken = "999999999:DIFFERENT_BOT_TOKEN_XYZ";
    const result = verifyTelegramAuth(payload, wrongToken);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Invalid Telegram signature/i);
  });

  it("successfully verifies payload when NextAuth injects csrfToken and callbackUrl into credentials", () => {
    const originalPayload = createSignedTelegramPayload({
      id: 987654321,
      first_name: "Alice",
      username: "alice_sec",
      auth_date: Math.floor(Date.now() / 1000) - 10,
    });

    const credentialsWithNextAuthFields = {
      ...originalPayload,
      csrfToken: "mock-csrf-token-xyz-123",
      callbackUrl: "https://restricted-consistently-pool-recreation.trycloudflare.com/login",
      last_name: "",
      photo_url: "undefined",
    };

    const result = verifyTelegramAuth(credentialsWithNextAuthFields, mockBotToken);
    expect(result.valid).toBe(true);
    expect(result.data?.id).toBe("987654321");
    expect(result.data?.first_name).toBe("Alice");
    expect(result.data?.username).toBe("alice_sec");
  });
});
