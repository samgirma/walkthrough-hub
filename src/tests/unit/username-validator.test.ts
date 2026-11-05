import { describe, it, expect } from "vitest";
import {
  usernameSchema,
  sanitizeUsername,
  RESERVED_USERNAMES,
} from "@/lib/validations/auth.schema";

describe("Username Validator & Sanitization", () => {
  it("accepts valid usernames between 3 and 24 characters", () => {
    expect(usernameSchema.safeParse("alice").success).toBe(true);
    expect(usernameSchema.safeParse("hacker_0x").success).toBe(true);
    expect(usernameSchema.safeParse("cyber-ninja-12").success).toBe(true);
    expect(usernameSchema.safeParse("a12").success).toBe(true);
    expect(usernameSchema.safeParse("123456789012345678901234").success).toBe(true); // 24 chars
  });

  it("rejects usernames shorter than 3 characters", () => {
    expect(usernameSchema.safeParse("al").success).toBe(false);
    expect(usernameSchema.safeParse("a").success).toBe(false);
    expect(usernameSchema.safeParse("").success).toBe(false);
  });

  it("rejects usernames longer than 24 characters", () => {
    const twentyFiveChars = "1234567890123456789012345";
    expect(usernameSchema.safeParse(twentyFiveChars).success).toBe(false);
  });

  it("rejects invalid characters (spaces, special characters, unicode)", () => {
    expect(usernameSchema.safeParse("alice hacker").success).toBe(false);
    expect(usernameSchema.safeParse("alice@sec").success).toBe(false);
    expect(usernameSchema.safeParse("alice.pwn").success).toBe(false);
    expect(usernameSchema.safeParse("hacker$").success).toBe(false);
    expect(usernameSchema.safeParse("hackér").success).toBe(false);
  });

  it("rejects reserved system handles", () => {
    for (const reserved of ["admin", "api", "dashboard", "write", "login", "register", "explore", "onboarding"]) {
      const res = usernameSchema.safeParse(reserved);
      expect(res.success).toBe(false);
    }
  });

  it("sanitizes input properly", () => {
    expect(sanitizeUsername("Alice_Hacker!")).toBe("alice_hacker");
    expect(sanitizeUsername("  user-name #1  ")).toBe("user-name1");
    expect(sanitizeUsername("ThisIsWayTooLongOfAUsernameForWriteupHub123456")).toHaveLength(24);
  });
});
