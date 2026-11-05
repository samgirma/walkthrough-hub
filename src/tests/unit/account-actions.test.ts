import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAuth, mockPrisma } = vi.hoisted(() => {
  return {
    mockAuth: vi.fn(),
    mockPrisma: {
      account: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  };
});

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

import {
  unlinkProviderAction,
  deleteAccountAction,
  completeOnboardingAction,
} from "@/server/auth.actions";

describe("Account Management Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("unlinkProviderAction", () => {
    it("returns unauthorized when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await unlinkProviderAction("github");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/unauthorized/i);
    });

    it("prevents disconnecting the only sign-in method", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-123" } });
      mockPrisma.account.findMany.mockResolvedValue([
        { id: "acc-1", provider: "google" },
      ]);

      const res = await unlinkProviderAction("google");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/only sign-in method/i);
      expect(mockPrisma.account.delete).not.toHaveBeenCalled();
    });

    it("allows unlinking when multiple providers are connected", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-123" } });
      mockPrisma.account.findMany.mockResolvedValue([
        { id: "acc-1", provider: "google" },
        { id: "acc-2", provider: "github" },
      ]);
      mockPrisma.account.delete.mockResolvedValue({ id: "acc-2" });

      const res = await unlinkProviderAction("github");
      expect(res.success).toBe(true);
      expect(mockPrisma.account.delete).toHaveBeenCalledWith({
        where: { id: "acc-2" },
      });
    });

    it("returns error if target provider is not linked", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-123" } });
      mockPrisma.account.findMany.mockResolvedValue([
        { id: "acc-1", provider: "google" },
        { id: "acc-2", provider: "telegram" },
      ]);

      const res = await unlinkProviderAction("github");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/no linked github account/i);
    });
  });

  describe("deleteAccountAction", () => {
    it("returns unauthorized when anonymous", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await deleteAccountAction("any_handle");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/unauthorized/i);
    });

    it("rejects deletion if handle confirmation does not match", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-123" } });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        username: "hacker_one",
      });

      const res = await deleteAccountAction("wrong_handle");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/mismatch/i);
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it("deletes user record and cascades when handle matches", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-123" } });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        username: "hacker_one",
      });
      mockPrisma.user.delete.mockResolvedValue({ id: "user-123" });

      const res = await deleteAccountAction("hacker_one");
      expect(res.success).toBe(true);
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: "user-123" },
      });
    });
  });

  describe("completeOnboardingAction", () => {
    it("rejects taken username", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-123" } });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-other",
        username: "taken_handle",
      });

      const res = await completeOnboardingAction("taken_handle");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/already taken/i);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it("updates user username when handle is valid and available", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-123" } });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.update.mockResolvedValue({ id: "user-123", username: "cyber_hero" });

      const res = await completeOnboardingAction("cyber_hero");
      expect(res.success).toBe(true);
      expect(res.username).toBe("cyber_hero");
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { username: "cyber_hero" },
      });
    });
  });
});
