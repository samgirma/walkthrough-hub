import { describe, it, expect } from "vitest";
import {
  stripMarkdown,
  truncateAtWordBoundary,
  buildMetadata,
  isIndexable,
  isSyntheticPlaceholder,
  extractCveIds,
} from "@/lib/seo";

describe("SEO Utilities", () => {
  describe("stripMarkdown", () => {
    it("strips code fences, inline code, headings, bold, and links", () => {
      const md = `
# Title Heading
This is **bold** and *italic* text with \`inline code\`.
[A link](https://example.com) and ![An image](https://example.com/img.png).

\`\`\`python
def exploit():
    print("pwned")
\`\`\`
:::callout[info]
Notice
:::
      `;
      const plain = stripMarkdown(md);
      expect(plain).not.toContain("#");
      expect(plain).not.toContain("**");
      expect(plain).not.toContain("```");
      expect(plain).not.toContain("def exploit");
      expect(plain).toContain("Title Heading");
      expect(plain).toContain("This is bold and italic text with inline code.");
      expect(plain).toContain("A link and .");
    });
  });

  describe("truncateAtWordBoundary", () => {
    it("does not truncate if under max length", () => {
      expect(truncateAtWordBoundary("Short title", 50)).toBe("Short title");
    });

    it("truncates cleanly at word boundary without splitting words", () => {
      const longText = "Reverse Engineering a Vulnerable Kernel Driver for Privilege Escalation";
      const truncated = truncateAtWordBoundary(longText, 40);
      expect(truncated.length).toBeLessThanOrEqual(40);
      expect(truncated).toBe("Reverse Engineering a Vulnerable Kernel");
    });
  });

  describe("buildMetadata", () => {
    it("generates default metadata with canonical and openGraph", () => {
      const meta = buildMetadata({
        title: "Test Page",
        description: "Test page description for search engines",
        canonicalPath: "/test",
      });

      expect(meta.title).toBe("Test Page");
      expect(meta.description).toBe("Test page description for search engines");
      expect(meta.alternates?.canonical).toBe("https://walkthrough-by.samgirma.app/test");
      expect(meta.robots).toEqual(
        expect.objectContaining({
          index: true,
          follow: true,
        })
      );
    });

    it("respects noindex flag", () => {
      const meta = buildMetadata({
        title: "Private Page",
        noindex: true,
        nofollow: true,
      });

      expect(meta.robots).toEqual(
        expect.objectContaining({
          index: false,
          follow: false,
          nocache: true,
        })
      );
    });
  });

  describe("isIndexable", () => {
    const validContent = `
# Summary
${"This is a detailed writeup analyzing the buffer overflow vulnerability. ".repeat(15)}
## Exploit Details
${"We construct the ROP chain to achieve code execution on the target system. ".repeat(15)}
    `;

    it("accepts a high-quality public writeup by a trusted author", () => {
      const result = isIndexable({
        status: "PUBLIC",
        contentMd: validContent,
        isFlagged: false,
        authorCreatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days old
      });
      expect(result).toBe(true);
    });

    it("rejects DRAFT or UNLISTED writeups", () => {
      expect(
        isIndexable({
          status: "DRAFT",
          contentMd: validContent,
        })
      ).toBe(false);

      expect(
        isIndexable({
          status: "UNLISTED",
          contentMd: validContent,
        })
      ).toBe(false);
    });

    it("rejects short or low-quality writeups below 300 words", () => {
      expect(
        isIndexable({
          status: "PUBLIC",
          contentMd: "# Short\nJust a few words here.",
          authorCreatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        })
      ).toBe(false);
    });

    it("rejects writeups without any markdown headings", () => {
      const noHeadings = "Just paragraph text repeated many times. ".repeat(60);
      expect(
        isIndexable({
          status: "PUBLIC",
          contentMd: noHeadings,
          authorCreatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        })
      ).toBe(false);
    });

    it("rejects writeups by brand-new untrusted authors under 3 days old", () => {
      expect(
        isIndexable({
          status: "PUBLIC",
          contentMd: validContent,
          authorCreatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day old
        })
      ).toBe(false);
    });

    it("respects admin FORCE_INDEX and FORCE_NOINDEX overrides while blocking synthetic spam", () => {
      expect(
        isIndexable({
          status: "PUBLIC",
          contentMd: "Too short",
          indexOverride: "FORCE_INDEX",
        })
      ).toBe(true);

      expect(
        isIndexable({
          status: "PUBLIC",
          title: "Synthetic Vulnerability Research #200",
          ctfName: "SyntheticCTF 2020",
          contentMd: validContent,
          indexOverride: "FORCE_INDEX",
        })
      ).toBe(false);

      expect(
        isIndexable({
          status: "PUBLIC",
          contentMd: validContent,
          indexOverride: "FORCE_NOINDEX",
        })
      ).toBe(false);
    });
  });

  describe("extractCveIds & isSyntheticPlaceholder", () => {
    it("extracts unique uppercase CVE IDs including long-digit CVE identifiers", () => {
      const ids = extractCveIds(
        "Exploits cve-2024-21626 and CVE-2026-102490 alongside CVE-2024-21626 duplicate."
      );
      expect(ids).toEqual(["CVE-2024-21626", "CVE-2026-102490"]);
    });

    it("detects synthetic placeholder writeups without false-positiving Hyper-V technical titles", () => {
      expect(
        isSyntheticPlaceholder({
          title: "Synthetic Vulnerability Research #200 - WEB Exploit",
          ctfName: "SyntheticCTF 2021",
          slug: "perf-test-writeup-123",
        })
      ).toBe(true);

      expect(
        isSyntheticPlaceholder({
          title: "Hyper-V VM Escape via Synthetic SCSI Device Ring Buffer",
          ctfName: "Pwn2Own",
          slug: "hyper-v-vm-escape-synthetic-scsi",
        })
      ).toBe(false);
    });
  });
});
