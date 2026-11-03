import { describe, it, expect } from "vitest";
import { renderMarkdown, extractTOC } from "@/lib/markdown";

describe("Markdown Pipeline & Security Sanitizer", () => {
  it("sanitizes dangerous script tags and inline event handlers (XSS prevention)", async () => {
    const maliciousInput = `
# Normal Header
<script>alert('pwned')</script>
<img src="x" onerror="alert('xss')" />
<a href="javascript:stealCookies()">Click me</a>
`;

    const html = await renderMarkdown(maliciousInput);

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("alert('pwned')");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("javascript:");
    expect(html).toContain("Normal Header");
  });

  it("extracts Table of Contents (TOC) with correct levels and IDs", () => {
    const markdown = `
# Executive Overview
Some intro text.
## 1. Vulnerability Analysis
Details here.
### Double-Free Race Condition
Specifics.
## 2. Exploitation PoC
Final steps.
`;

    const toc = extractTOC(markdown);
    expect(toc).toHaveLength(4);
    expect(toc[0]).toEqual({
      id: "executive-overview",
      title: "Executive Overview",
      level: 1,
    });
    expect(toc[1]).toEqual({
      id: "1-vulnerability-analysis",
      title: "1. Vulnerability Analysis",
      level: 2,
    });
    expect(toc[2]).toEqual({
      id: "double-free-race-condition",
      title: "Double-Free Race Condition",
      level: 3,
    });
  });

  it("processes custom CTF callouts", async () => {
    const markdown = `
:::callout[target]
Binary: \`target.elf\` with ASLR and SMEP
:::
`;
    const html = await renderMarkdown(markdown);
    expect(html).toContain("ctf-callout-target");
    expect(html).toContain("TARGET");
    expect(html).toContain("target.elf");
  });

  it("processes custom flag spoiler blocks", async () => {
    const markdown = `
:::flag
WHUB{slub_fr33l1st_p01s0n}
:::
`;
    const html = await renderMarkdown(markdown);
    expect(html).toContain("flag-spoiler-box");
    expect(html).toContain("FLAG SOLUTION // SPOILER");
    expect(html).toContain("WHUB{slub_fr33l1st_p01s0n}");
  });

  it("highlights code blocks using Shiki with copy button chrome", async () => {
    const markdown = "```python\nprint('hello world')\n```";
    const html = await renderMarkdown(markdown);

    expect(html).toContain("code-window");
    expect(html).toContain("copy-code-button");
    expect(html).toContain("shiki");
  });
});
