import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  writeupFindUnique: vi.fn(),
  commentFindMany: vi.fn(),
  commentCount: vi.fn(),
  commentCreate: vi.fn(),
  commentFindUnique: vi.fn(),
  commentDelete: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    writeup: {
      findUnique: mocks.writeupFindUnique,
    },
    comment: {
      findMany: mocks.commentFindMany,
      count: mocks.commentCount,
      create: mocks.commentCreate,
      findUnique: mocks.commentFindUnique,
      delete: mocks.commentDelete,
    },
  },
}));

import {
  getCommentsForWriteup,
  createComment,
  deleteComment,
} from "@/server/comment.service";

describe("Comment Service (Writeup Discussions)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCommentsForWriteup", () => {
    it("returns comments list and total count", async () => {
      mocks.writeupFindUnique.mockResolvedValue({ id: "w1", status: "PUBLIC" });
      const mockComments = [
        {
          id: "c1",
          content: "Great SSTI bypass!",
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { id: "u1", name: "User 1", username: "user1", avatarUrl: null, role: "USER" },
        },
      ];
      mocks.commentFindMany.mockResolvedValue(mockComments);
      mocks.commentCount.mockResolvedValue(1);

      const result = await getCommentsForWriteup("w1");
      expect(result.comments).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mocks.commentFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { writeupId: "w1" }, orderBy: { createdAt: "asc" } })
      );
    });

    it("returns empty comments when writeup does not exist", async () => {
      mocks.writeupFindUnique.mockResolvedValue(null);

      const result = await getCommentsForWriteup("missing");
      expect(result).toEqual({ comments: [], total: 0 });
    });
  });

  describe("createComment", () => {
    it("creates a comment on a public writeup", async () => {
      mocks.writeupFindUnique.mockResolvedValue({
        id: "w1",
        status: "PUBLIC",
        authorId: "author-1",
      });
      const created = {
        id: "c1",
        content: "Nice exploit!",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: "u1", name: "U1", username: "u1", avatarUrl: null, role: "USER" },
      };
      mocks.commentCreate.mockResolvedValue(created);

      const comment = await createComment("u1", "w1", "Nice exploit!");
      expect(comment.id).toBe("c1");
      expect(mocks.commentCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { userId: "u1", writeupId: "w1", content: "Nice exploit!" },
        })
      );
    });

    it("rejects empty comment", async () => {
      await expect(createComment("u1", "w1", "   ")).rejects.toThrow(
        "Comment content cannot be empty."
      );
      expect(mocks.commentCreate).not.toHaveBeenCalled();
    });

    it("rejects comments exceeding 2,000 characters", async () => {
      const longText = "a".repeat(2001);
      await expect(createComment("u1", "w1", longText)).rejects.toThrow(
        "Comment cannot exceed 2,000 characters."
      );
      expect(mocks.commentCreate).not.toHaveBeenCalled();
    });

    it("prevents non-author from commenting on DRAFT writeups", async () => {
      mocks.writeupFindUnique.mockResolvedValue({
        id: "w-draft",
        status: "DRAFT",
        authorId: "author-1",
      });

      await expect(createComment("other-user", "w-draft", "Hello")).rejects.toThrow(
        "Writeup not found."
      );
    });
  });

  describe("deleteComment", () => {
    it("allows comment author to delete their own comment", async () => {
      mocks.commentFindUnique.mockResolvedValue({
        id: "c1",
        userId: "u1",
        writeupId: "w1",
      });
      mocks.commentDelete.mockResolvedValue({});

      const result = await deleteComment("u1", "c1", "USER");
      expect(result).toEqual({ success: true });
      expect(mocks.commentDelete).toHaveBeenCalledWith({ where: { id: "c1" } });
    });

    it("allows ADMIN to delete any comment", async () => {
      mocks.commentFindUnique.mockResolvedValue({
        id: "c1",
        userId: "u1",
        writeupId: "w1",
      });
      mocks.commentDelete.mockResolvedValue({});

      const result = await deleteComment("admin-user", "c1", "ADMIN");
      expect(result).toEqual({ success: true });
    });

    it("prevents non-author non-admin user from deleting comment", async () => {
      mocks.commentFindUnique.mockResolvedValue({
        id: "c1",
        userId: "u1",
        writeupId: "w1",
      });

      await expect(deleteComment("attacker", "c1", "USER")).rejects.toThrow(
        "Unauthorized: You do not have permission to delete this comment."
      );
      expect(mocks.commentDelete).not.toHaveBeenCalled();
    });

    it("rejects deletion if comment does not exist", async () => {
      mocks.commentFindUnique.mockResolvedValue(null);

      await expect(deleteComment("u1", "missing-id")).rejects.toThrow("Comment not found.");
    });
  });
});
