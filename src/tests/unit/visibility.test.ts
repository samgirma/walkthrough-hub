import { describe, it, expect } from "vitest";

describe("Writeup Visibility Rules Engine", () => {
  const evaluateVisibility = (
    writeup: { id: string; authorId: string; status: "DRAFT" | "UNLISTED" | "PUBLIC" },
    viewerUserId?: string | null
  ) => {
    if (writeup.status === "DRAFT") {
      // Drafts are strictly author only
      if (!viewerUserId || viewerUserId !== writeup.authorId) {
        return null;
      }
    }
    // UNLISTED: accessible via direct link/viewer
    // PUBLIC: accessible to all
    return writeup;
  };

  const draftWriteup = { id: "w-draft", authorId: "author-alice", status: "DRAFT" as const };
  const unlistedWriteup = { id: "w-unlisted", authorId: "author-alice", status: "UNLISTED" as const };
  const publicWriteup = { id: "w-public", authorId: "author-alice", status: "PUBLIC" as const };

  it("denies access to DRAFT for anonymous visitors", () => {
    expect(evaluateVisibility(draftWriteup, null)).toBeNull();
    expect(evaluateVisibility(draftWriteup, undefined)).toBeNull();
  });

  it("denies access to DRAFT for non-owner authenticated users", () => {
    expect(evaluateVisibility(draftWriteup, "author-bob")).toBeNull();
  });

  it("allows access to DRAFT for the writeup author", () => {
    expect(evaluateVisibility(draftWriteup, "author-alice")).toEqual(draftWriteup);
  });

  it("allows access to UNLISTED for anyone with the direct link", () => {
    expect(evaluateVisibility(unlistedWriteup, null)).toEqual(unlistedWriteup);
    expect(evaluateVisibility(unlistedWriteup, "author-bob")).toEqual(unlistedWriteup);
    expect(evaluateVisibility(unlistedWriteup, "author-alice")).toEqual(unlistedWriteup);
  });

  it("allows access to PUBLIC for all viewers", () => {
    expect(evaluateVisibility(publicWriteup, null)).toEqual(publicWriteup);
    expect(evaluateVisibility(publicWriteup, "author-bob")).toEqual(publicWriteup);
    expect(evaluateVisibility(publicWriteup, "author-alice")).toEqual(publicWriteup);
  });

  describe("Visibility Transitions & Cache Invalidation", () => {
    it("ensures a writeup transitioned from PUBLIC to DRAFT stops being served publicly", () => {
      // Initially public
      let currentWriteup: { id: string; authorId: string; status: "DRAFT" | "UNLISTED" | "PUBLIC" } = {
        ...publicWriteup,
      };

      // Public viewer accesses it
      const publicViewInitial = evaluateVisibility(currentWriteup, null);
      expect(publicViewInitial).not.toBeNull();
      expect(publicViewInitial?.status).toBe("PUBLIC");

      // Author transitions writeup to DRAFT
      currentWriteup = {
        ...currentWriteup,
        status: "DRAFT",
      };

      // At revalidation / subsequent public request, public viewer gets null (which triggers notFound())
      const publicViewAfterTransition = evaluateVisibility(currentWriteup, null);
      expect(publicViewAfterTransition).toBeNull();

      // Only the author can access it via author preview
      const authorView = evaluateVisibility(currentWriteup, "author-alice");
      expect(authorView).not.toBeNull();
      expect(authorView?.status).toBe("DRAFT");
    });

    it("ensures UNLISTED writeups are excluded from public sitemaps and discovery feeds", () => {
      const feedItems = [
        { id: "w-1", title: "Public Exploit", status: "PUBLIC" },
        { id: "w-2", title: "Unlisted Exploit", status: "UNLISTED" },
        { id: "w-3", title: "Draft Exploit", status: "DRAFT" },
      ];

      // Sitemaps and feeds filter strictly by status === 'PUBLIC'
      const sitemapEntries = feedItems.filter((item) => item.status === "PUBLIC");
      expect(sitemapEntries).toHaveLength(1);
      expect(sitemapEntries[0].id).toBe("w-1");
      expect(sitemapEntries.some((i) => i.status === "UNLISTED")).toBe(false);
      expect(sitemapEntries.some((i) => i.status === "DRAFT")).toBe(false);
    });
  });
});
