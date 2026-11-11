import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    writeup: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  permanentRedirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  useRouter: () => ({
    prefetch: vi.fn(),
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...props }, children),
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => React.createElement("img", { src, alt, ...props }),
}));

import { prisma } from "@/lib/prisma";
import { WriteupCard } from "@/components/writeup/writeup-card";
import CategoryPage from "@/app/(public)/category/[category]/page";
import TagPage from "@/app/(public)/tag/[tag]/page";
import CtfEventPage from "@/app/(public)/ctf/[event]/page";

const SAMPLE_PRISMA_WRITEUP = {
  id: "cmw1dvfsd000gsbrcdohazn9p",
  title: "SSRF Chain to Metadata Leak",
  slug: "ssrf-chain-to-metadata-leak",
  excerpt: "Chaining internal redirects into cloud metadata extraction.",
  category: "WEB",
  difficulty: "MEDIUM",
  status: "PUBLIC",
  ctfName: "DEF CON 32 Quals",
  ctfYear: 2024,
  readTimeMin: 8,
  viewCount: 420,
  publishedAt: new Date("2025-02-01T00:00:00Z"),
  contentMd: `# Exploit\n\n${"Technical exploitation details ".repeat(80)}`,
  isFlagged: false,
  moderationStatus: "APPROVED",
  indexOverride: "AUTO",
  author: {
    id: "u-1",
    username: "0xnull",
    avatarUrl: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
  },
  tags: [
    {
      writeupId: "cmw1dvfsd000gsbrcdohazn9p",
      tagId: "tag-1",
      tag: { id: "tag-1", name: "ssrf" },
    },
  ],
};

describe("Public Hub Pages SSR Rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.writeup.findMany).mockResolvedValue([SAMPLE_PRISMA_WRITEUP] as any);
    vi.mocked(prisma.writeup.count).mockResolvedValue(1);
  });

  it("renders /category/[category] with tagged Prisma writeups without throwing", async () => {
    const element = await CategoryPage({
      params: Promise.resolve({ category: "web" }),
      searchParams: Promise.resolve({}),
    });

    const html = renderToStaticMarkup(element);
    expect(html).toContain("SSRF Chain to Metadata Leak");
    expect(html).toContain("#ssrf");
  });

  it("renders /tag/[tag] with tagged Prisma writeups without throwing", async () => {
    const element = await TagPage({
      params: Promise.resolve({ tag: "ssrf" }),
      searchParams: Promise.resolve({}),
    });

    const html = renderToStaticMarkup(element);
    expect(html).toContain("SSRF Chain to Metadata Leak");
    expect(html).toContain("#ssrf");
  });

  it("renders /ctf/[event] with tagged Prisma writeups without throwing", async () => {
    const element = await CtfEventPage({
      params: Promise.resolve({ event: "def-con-32-quals-2024" }),
      searchParams: Promise.resolve({}),
    });

    const html = renderToStaticMarkup(element);
    expect(html).toContain("SSRF Chain to Metadata Leak");
    expect(html).toContain("#ssrf");
  });

  it("renders WriteupCard safely even when tags contain legacy strings or missing relations", () => {
    const html = renderToStaticMarkup(
      React.createElement(WriteupCard, {
        writeup: {
          ...SAMPLE_PRISMA_WRITEUP,
          tags: ["ssrf", null, { tag: null }, { tag: { id: "t-2", name: "oauth" } }] as any,
        },
      })
    );

    expect(html).toContain("#ssrf");
    expect(html).toContain("#oauth");
  });
});
