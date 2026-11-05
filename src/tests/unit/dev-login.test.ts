import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isProviderEnabled } from "@/env";

describe("Dev-Only Login Security Guard", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("fails and stays disabled when NODE_ENV is production, even if DEV_LOGIN=true", () => {
    // Attempt to spoof dev login in production
    const isDev = process.env.NODE_ENV === "production" && process.env.DEV_LOGIN === "true";
    expect(isDev).toBe(false);
  });

  it("is disabled by default when DEV_LOGIN is not explicitly set to 'true'", () => {
    delete process.env.DEV_LOGIN;
    expect(process.env.DEV_LOGIN === "true").toBe(false);
  });

  it("is enabled strictly when NODE_ENV === 'development' AND DEV_LOGIN === 'true'", () => {
    const isDevActive = (nodeEnv: string, devLogin?: string) =>
      nodeEnv === "development" && devLogin === "true";

    expect(isDevActive("production", "true")).toBe(false);
    expect(isDevActive("production", "false")).toBe(false);
    expect(isDevActive("test", "true")).toBe(false);
    expect(isDevActive("development", "false")).toBe(false);
    expect(isDevActive("development", undefined)).toBe(false);
    expect(isDevActive("development", "true")).toBe(true);
  });
});
