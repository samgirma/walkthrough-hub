import { describe, it, expect } from "vitest";
import { sanitizeRedirectUrl } from "@/lib/validations/auth.schema";

describe("Safe Redirect Sanitizer (Open Redirect Protection)", () => {
  it("allows safe relative paths", () => {
    expect(sanitizeRedirectUrl("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("/write")).toBe("/write");
    expect(sanitizeRedirectUrl("/explore?category=WEB")).toBe("/explore?category=WEB");
    expect(sanitizeRedirectUrl("/w/alice/buffer-overflow-101")).toBe("/w/alice/buffer-overflow-101");
  });

  it("defaults to /dashboard for null, undefined, or empty strings", () => {
    expect(sanitizeRedirectUrl(null)).toBe("/dashboard");
    expect(sanitizeRedirectUrl(undefined)).toBe("/dashboard");
    expect(sanitizeRedirectUrl("")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("   ")).toBe("/dashboard");
  });

  it("rejects absolute URLs and protocol schemes", () => {
    expect(sanitizeRedirectUrl("https://evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("http://attacker.com/steal")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("javascript:alert(1)")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("data:text/html,<h1>pwn</h1>")).toBe("/dashboard");
  });

  it("rejects protocol-relative double slashes (//evil.com)", () => {
    expect(sanitizeRedirectUrl("//evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("//google.com/test")).toBe("/dashboard");
  });

  it("rejects backslash bypass vectors", () => {
    expect(sanitizeRedirectUrl("/\\evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("\\\\evil.com")).toBe("/dashboard");
  });

  it("rejects control characters and CRLF injection", () => {
    expect(sanitizeRedirectUrl("/dashboard\r\nSet-Cookie: evil=true")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("/dashboard\t")).toBe("/dashboard");
  });
});
