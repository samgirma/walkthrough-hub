import { describe, it, expect } from "vitest";
import { generateSlug } from "@/lib/slug";

describe("generateSlug", () => {
  it("converts a standard title to lowercase hyphenated slug", () => {
    const slug = generateSlug("runc Container Escape via Leaked File Descriptors");
    expect(slug).toBe("runc-container-escape-via-leaked-file-descriptors");
  });

  it("strips special characters and CVE punctuation correctly", () => {
    const slug = generateSlug("CVE-2024-21626: Kernel Space Race & Double-Free!");
    expect(slug).toBe("cve-2024-21626-kernel-space-race-double-free");
  });

  it("handles extra whitespace and consecutive hyphens", () => {
    const slug = generateSlug("  Heap    Grooming --- Exploitation   ");
    expect(slug).toBe("heap-grooming-exploitation");
  });

  it("normalizes accented characters", () => {
    const slug = generateSlug("Café Crème Résumé CTF");
    expect(slug).toBe("cafe-creme-resume-ctf");
  });

  it("falls back to random slug for empty or invalid input", () => {
    const slug = generateSlug("???!!!");
    expect(slug).toMatch(/^writeup-[a-z0-9]+$/);
  });

  it("truncates long titles to at most 60 characters", () => {
    const longTitle = "A".repeat(100);
    const slug = generateSlug(longTitle);
    expect(slug.length).toBeLessThanOrEqual(60);
  });
});
