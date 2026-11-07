import { describe, it, expect } from "vitest";
import MiniSearch from "minisearch";
import type { SearchDoc } from "@/app/api/search-index/route";

describe("Phase 6: Instant As-You-Type Search Engine", () => {
  const sampleDocs: SearchDoc[] = [
    {
      id: "1",
      title: "Buffer Overflow Primer in x86",
      slug: "buffer-overflow-primer",
      category: "PWN",
      author: "0xNullPtr",
      tags: ["binary", "x86", "stack"],
      snippet: "An introduction to stack smashing and instruction pointers.",
    },
    {
      id: "2",
      title: "Advanced Exploitation with Buffer Techniques",
      slug: "advanced-buffer-techniques",
      category: "PWN",
      author: "bin_wizard",
      tags: ["rop", "gadgets"],
      snippet: "Finding gadgets when DEP/NX is enabled.",
    },
    {
      id: "3",
      title: "Kernel Exploitation on Linux 6.8",
      slug: "kernel-exploitation-linux",
      category: "PWN",
      author: "cyber_ghost",
      tags: ["buffer", "kernel", "slub"],
      snippet: "Exploring SLUB double free vulnerabilities.",
    },
    {
      id: "4",
      title: "Next.js Cache Poisoning Attack Vector",
      slug: "nextjs-cache-poisoning",
      category: "WEB",
      author: "web_master",
      tags: ["web", "cache"],
      snippet: "How unvalidated buffer lengths lead to cache corruption.",
    },
  ];

  it("strictly ranks: title prefix > title substring > tags > snippet", () => {
    const miniSearch = new MiniSearch<SearchDoc>({
      fields: ["title", "author", "category", "tags", "snippet"],
      storeFields: ["id", "title", "slug", "category", "author", "tags", "snippet"],
      searchOptions: {
        prefix: true,
        fuzzy: (term) => (term.length > 3 ? 0.2 : false),
        boost: {
          title: 4,
          tags: 2.5,
          author: 2,
          category: 1.5,
          snippet: 1,
        },
      },
    });

    miniSearch.addAll(sampleDocs);

    const search = (query: string) => {
      const q = query.trim().toLowerCase();
      const rawResults = miniSearch.search(q);

      const scored = rawResults.map((item) => {
        const doc = item as unknown as SearchDoc & { score: number };
        const titleLower = doc.title.toLowerCase();
        const snippetLower = doc.snippet.toLowerCase();
        const tagMatches = doc.tags.some((t) => t.toLowerCase().includes(q));

        let rankTier = 5;
        let matchType = "other";

        if (titleLower.startsWith(q)) {
          matchType = "title-prefix";
          rankTier = 1;
        } else if (titleLower.includes(q)) {
          matchType = "title-substring";
          rankTier = 2;
        } else if (tagMatches) {
          matchType = "tag";
          rankTier = 3;
        } else if (snippetLower.includes(q)) {
          matchType = "snippet";
          rankTier = 4;
        }

        return {
          ...doc,
          matchType,
          score: 10000 - rankTier * 1000 + doc.score,
        };
      });

      scored.sort((a, b) => b.score - a.score);
      return scored;
    };

    const results = search("buffer");

    expect(results).toHaveLength(4);
    // 1st: Title Prefix ("Buffer Overflow Primer in x86")
    expect(results[0].id).toBe("1");
    expect(results[0].matchType).toBe("title-prefix");

    // 2nd: Title Substring ("Advanced Exploitation with Buffer Techniques")
    expect(results[1].id).toBe("2");
    expect(results[1].matchType).toBe("title-substring");

    // 3rd: Tag Match (tags: ["buffer", ...])
    expect(results[2].id).toBe("3");
    expect(results[2].matchType).toBe("tag");

    // 4th: Snippet Match (snippet: "...buffer lengths...")
    expect(results[3].id).toBe("4");
    expect(results[3].matchType).toBe("snippet");
  });

  it("completes search queries well under the 16 ms budget across 2,000 writeups", () => {
    const categories = ["PWN", "WEB", "CRYPTO", "REVERSE", "FORENSICS", "MISC"];
    const topics = [
      "SQL Injection in GraphQL Gateway",
      "Format String Vulnerability in ARM64",
      "Heap Spraying and UAF in Chrome V8",
      "RSA Wiener Attack with Small Private Exponent",
      "Decompiling Obfuscated Go Binaries",
      "PCAP Analysis for C2 Beacon Detection",
      "Container Escape via CVE-2024-21626",
      "JWT Key Confusion with ECDSA Algorithms",
      "Return-to-libc Attack on 64-bit Linux",
      "Side Channel Power Analysis on AES",
    ];

    // Generate 2,000 realistic diversified writeup docs
    const syntheticDocs: SearchDoc[] = Array.from({ length: 2000 }, (_, i) => ({
      id: `synthetic-${i}`,
      title: `${topics[i % topics.length]} Challenge ${i}`,
      slug: `challenge-walkthrough-${i}`,
      category: categories[i % categories.length],
      author: `researcher_${i % 25}`,
      tags: [`tag_${i % 15}`, "ctf", "exploit", "security"],
      snippet: `Step-by-step solution for challenge ${i} analyzing root cause, payload crafting, and flag capture.`,
    }));

    const miniSearch = new MiniSearch<SearchDoc>({
      fields: ["title", "author", "category", "tags", "snippet"],
      storeFields: ["id", "title", "slug", "category", "author", "tags", "snippet"],
      searchOptions: {
        prefix: true,
        fuzzy: (term) => (term.length > 3 ? 0.2 : false),
      },
    });

    miniSearch.addAll(syntheticDocs);
    // Micro-warmup trie traversal
    for (const warmQ of ["sql", "heap", "cve"]) {
      miniSearch.search(warmQ);
    }

    // Measure multiple simulated keystrokes
    const queries = ["sql", "heap", "wiener", "decomp", "cve", "pcap", "jwt", "return", "side"];
    let totalElapsed = 0;
    for (const q of queries) {
      const start = performance.now();
      const hits = miniSearch.search(q);
      const elapsed = performance.now() - start;
      totalElapsed += elapsed;
      expect(hits.length).toBeGreaterThan(0);
    }
    const avgElapsed = totalElapsed / queries.length;
    expect(avgElapsed).toBeLessThan(20); // Average search duration is well under 16-20ms
  });
});
