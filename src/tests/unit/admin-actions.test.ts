import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRequireRole, mockPrisma, mockRevalidatePath } = vi.hoisted(() => {
  return {
    mockRequireRole: vi.fn(),
    mockPrisma: {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      writeup: {
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
    mockRevalidatePath: vi.fn(),
  };
});

vi.mock("@/server/auth/dal", () => ({
  requireRole: mockRequireRole,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

import {
  updateUserRoleAction,
  deleteUserAction,
  adminUpdateWriteupStatusAction,
  adminDeleteWriteupAction,
} from "@/server/admin.actions";

describe("Admin Operations & Safety Guards", () => {
  const adminUser = { id: "admin-1", username: "superadmin", role: "ADMIN" };
  const targetUser = { id: "target-2", username: "hacker123", role: "USER" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateUserRoleAction", () => {
    it("rejects non-admin caller via requireRole DAL check", async () => {
      mockRequireRole.mockRejectedValue(new Error("Forbidden: Insufficient privileges."));
      await expect(updateUserRoleAction("user-3", "ADMIN")).rejects.toThrow("Forbidden: Insufficient privileges.");
    });

    it("prevents self-demotion lockout when caller tries to demote themselves", async () => {
      mockRequireRole.mockResolvedValue(adminUser);
      await expect(updateUserRoleAction(adminUser.id, "USER")).rejects.toThrow(
        "Safety Guard: You cannot demote your own administrator account."
      );
    });

    it("promotes target user to ADMIN successfully", async () => {
      mockRequireRole.mockResolvedValue(adminUser);
      mockPrisma.user.findUnique.mockResolvedValue(targetUser);
      mockPrisma.user.update.mockResolvedValue({ ...targetUser, role: "ADMIN" });

      const res = await updateUserRoleAction(targetUser.id, "ADMIN");
      expect(res.success).toBe(true);
      expect(res.user.role).toBe("ADMIN");
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: targetUser.id },
        data: { role: "ADMIN" },
        select: { id: true, username: true, role: true },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/admin");
    });

    it("throws error if target user does not exist", async () => {
      mockRequireRole.mockResolvedValue(adminUser);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(updateUserRoleAction("non-existent-user", "ADMIN")).rejects.toThrow("User not found.");
    });
  });

  describe("deleteUserAction", () => {
    it("blocks an admin from deleting their own account via admin panel", async () => {
      mockRequireRole.mockResolvedValue(adminUser);
      await expect(deleteUserAction(adminUser.id)).rejects.toThrow(
        "Safety Guard: You cannot delete your own account from the Admin Console."
      );
    });

    it("deletes target user account and revalidates dashboard", async () => {
      mockRequireRole.mockResolvedValue(adminUser);
      mockPrisma.user.findUnique.mockResolvedValue(targetUser);
      mockPrisma.user.delete.mockResolvedValue(targetUser);

      const res = await deleteUserAction(targetUser.id);
      expect(res.success).toBe(true);
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: targetUser.id },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/admin");
    });
  });

  describe("adminUpdateWriteupStatusAction", () => {
    it("updates writeup status and populates publishedAt if transitioning to PUBLIC", async () => {
      mockRequireRole.mockResolvedValue(adminUser);
      mockPrisma.writeup.findUnique.mockResolvedValue({
        id: "w-1",
        status: "DRAFT",
        publishedAt: null,
      });
      mockPrisma.writeup.update.mockResolvedValue({ id: "w-1", status: "PUBLIC" });

      const res = await adminUpdateWriteupStatusAction("w-1", "PUBLIC");
      expect(res.success).toBe(true);
      expect(mockPrisma.writeup.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "w-1" },
          data: expect.objectContaining({
            status: "PUBLIC",
            publishedAt: expect.any(Date),
          }),
        })
      );
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/admin");
    });
  });

  describe("adminDeleteWriteupAction", () => {
    it("purges writeup permanently", async () => {
      mockRequireRole.mockResolvedValue(adminUser);
      mockPrisma.writeup.findUnique.mockResolvedValue({ id: "w-1" });
      mockPrisma.writeup.delete.mockResolvedValue({ id: "w-1" });

      const res = await adminDeleteWriteupAction("w-1");
      expect(res.success).toBe(true);
      expect(mockPrisma.writeup.delete).toHaveBeenCalledWith({
        where: { id: "w-1" },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/admin");
    });
  });
});
