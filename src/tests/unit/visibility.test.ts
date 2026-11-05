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
});
