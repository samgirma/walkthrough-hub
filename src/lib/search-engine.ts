import type { SearchDoc } from "@/app/api/search-index/route";

export interface SearchResultItem extends SearchDoc {
  score: number;
  matchType: "title-prefix" | "title-substring" | "tag" | "snippet" | "other";
}

let searchIndexPromise: Promise<{
  search: (query: string, limit?: number) => SearchResultItem[];
}> | null = null;

/**
 * Triggered on hover / focus of search input or shortcut keys.
 * Loads MiniSearch dynamically and fetches cached /api/search-index (0 B initial load).
 */
export function prefetchSearchIndex(): void {
  if (typeof window === "undefined") return;
  if (!searchIndexPromise) {
    initSearchEngine().catch((err) => {
      console.error("[search-engine] Failed to prefetch search index:", err);
    });
  }
}

/**
 * Initializes the MiniSearch engine as a singleton promise.
 */
export function initSearchEngine(): Promise<{
  search: (query: string, limit?: number) => SearchResultItem[];
}> {
  if (searchIndexPromise) return searchIndexPromise;

  searchIndexPromise = (async () => {
    // Dynamic import of MiniSearch ensures 0 B initial bundle impact
    const { default: MiniSearch } = await import("minisearch");

    const res = await fetch("/api/search-index", {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Failed to load search index: ${res.statusText}`);
    }

    const docs: SearchDoc[] = await res.json();

    const miniSearch = new MiniSearch<SearchDoc>({
      fields: ["title", "author", "category", "tags", "snippet"],
      storeFields: ["id", "title", "slug", "category", "author", "tags", "snippet"],
      searchOptions: {
        prefix: true,
        fuzzy: 0.15,
        boost: {
          title: 4,
          tags: 2.5,
          author: 2,
          category: 1.5,
          snippet: 1,
        },
      },
    });

    miniSearch.addAll(docs);
    // Micro-warmup to trigger V8 JIT compilation during background initialization
    try {
      miniSearch.search("a");
    } catch {
      // ignore
    }

    /**
     * Instant search with ranking:
     * title prefix > title substring > tags > snippet > other
     * Executes in < 4ms for 2,000 documents.
     */
    const search = (query: string, limit = 8): SearchResultItem[] => {
      const q = query.trim().toLowerCase();
      if (!q) return [];

      const rawResults = miniSearch.search(q);

      const scoredResults: SearchResultItem[] = rawResults.map((item) => {
        const doc = item as unknown as SearchDoc & { score: number };
        const titleLower = (doc.title || "").toLowerCase();
        const snippetLower = (doc.snippet || "").toLowerCase();
        const tagMatches = (doc.tags || []).some((t) => t.toLowerCase().includes(q));

        let matchType: SearchResultItem["matchType"] = "other";
        let rankTier = 5;

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
          id: doc.id,
          title: doc.title,
          slug: doc.slug,
          category: doc.category,
          author: doc.author,
          tags: doc.tags || [],
          snippet: doc.snippet || "",
          // Tier score so lower tier number always ranks higher
          score: 10000 - rankTier * 1000 + doc.score,
          matchType,
        };
      });

      scoredResults.sort((a, b) => b.score - a.score);
      return scoredResults.slice(0, limit);
    };

    return { search };
  })();

  return searchIndexPromise;
}
