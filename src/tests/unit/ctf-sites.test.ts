import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { CTF_SITES } from "@/lib/ctf-sites-data";
import { PlatformLogo } from "@/components/ctf-sites/PlatformLogos";

describe("CTF Platforms Ecosystem", () => {
  it("defines exactly 12 curated cybersecurity platforms with valid schemas", () => {
    expect(CTF_SITES.length).toBe(12);

    const ids = new Set<string>();

    for (const site of CTF_SITES) {
      expect(site.id).toBeTruthy();
      expect(ids.has(site.id)).toBe(false);
      ids.add(site.id);

      expect(site.name.trim().length).toBeGreaterThan(0);
      expect(site.url).toMatch(/^https:\/\//);
      expect(site.description.trim().length).toBeGreaterThan(20);
      expect(site.tags.length).toBeGreaterThan(0);
      expect(site.features.length).toBeGreaterThan(0);
      expect(site.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("renders distinct, valid SVGs with aria-labels for each platform logo", () => {
    for (const site of CTF_SITES) {
      const html = renderToString(React.createElement(PlatformLogo, { id: site.id }));
      expect(html).toContain("<svg");
      expect(html).toContain("</svg>");
      expect(html).toContain(`aria-label="${site.name} Logo"`);
    }
  });

  it("renders safe fallback icon for unknown platform identifiers", () => {
    const html = renderToString(React.createElement(PlatformLogo, { id: "unknown-vendor" }));
    expect(html).toContain("<svg");
    expect(html).toContain("</svg>");
  });
});
