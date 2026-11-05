import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
  auth: vi.fn(),
  userFindUnique: vi.fn(),
  writeupFindUnique: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  notFound: mocks.notFound,
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
    },
    writeup: {
      findUnique: mocks.writeupFindUnique,
    },
  },
}));

import { requireUser, requireOnboarded, requireRole, requireWriteupOwner } from "@/server/auth/dal";

describe("Data Access Layer (DAL) Security Boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockReset();
    mocks.userFindUnique.mockReset();
    mocks.writeupFindUnique.mockReset();
  });

  it("requireUser redirects anonymous visitors to /login with callbackUrl", async () => {
    mocks.auth.mockResolvedValue(null);
    mocks.userFindUnique.mockResolvedValue(null);

    await expect(requireUser("/dashboard")).rejects.toThrow("REDIRECT:/login?callbackUrl=%2Fdashboard");
    expect(mocks.redirect).toHaveBeenCalledWith("/login?callbackUrl=%2Fdashboard");
  });

  it("requireUser returns authenticated user record", async () => {
    const mockUser = { id: "user-123", username: "0xNull", role: "USER" };
    mocks.auth.mockResolvedValue({ user: { id: "user-123" } });
    mocks.userFindUnique.mockResolvedValue(mockUser);

    const user = await requireUser("/dashboard");
    expect(user).toEqual(mockUser);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("requireOnboarded redirects users with no username to /onboarding", async () => {
    const mockUser = { id: "user-new", username: null, role: "USER" };
    mocks.auth.mockResolvedValue({ user: { id: "user-new" } });
    mocks.userFindUnique.mockResolvedValue(mockUser);

    await expect(requireOnboarded("/dashboard")).rejects.toThrow("REDIRECT:/onboarding");
    expect(mocks.redirect).toHaveBeenCalledWith("/onboarding");
  });

  it("requireOnboarded allows onboarded users through", async () => {
    const mockUser = { id: "user-1", username: "exploit_dev", role: "USER" };
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.userFindUnique.mockResolvedValue(mockUser);

    const user = await requireOnboarded("/dashboard");
    expect(user.username).toBe("exploit_dev");
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("requireRole enforces ADMIN permissions", async () => {
    const mockUser = { id: "user-norm", username: "normie", role: "USER" };
    mocks.auth.mockResolvedValue({ user: { id: "user-norm" } });
    mocks.userFindUnique.mockResolvedValue(mockUser);

    await expect(requireRole("ADMIN")).rejects.toThrow("Forbidden: Insufficient privileges.");

    const mockAdmin = { id: "user-admin", username: "root", role: "ADMIN" };
    mocks.auth.mockResolvedValue({ user: { id: "user-admin" } });
    mocks.userFindUnique.mockResolvedValue(mockAdmin);

    const admin = await requireRole("ADMIN");
    expect(admin.role).toBe("ADMIN");
  });

  it("requireWriteupOwner throws notFound for non-existent writeup (prevents existence leakage)", async () => {
    const mockUser = { id: "user-1", username: "alice", role: "USER" };
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.userFindUnique.mockResolvedValue(mockUser);
    mocks.writeupFindUnique.mockResolvedValue(null);

    await expect(requireWriteupOwner("writeup-unknown")).rejects.toThrow("NOT_FOUND");
    expect(mocks.notFound).toHaveBeenCalled();
  });

  it("requireWriteupOwner throws notFound if user does not own writeup", async () => {
    const mockUser = { id: "user-alice", username: "alice", role: "USER" };
    const mockOtherWriteup = { id: "writeup-bob-1", authorId: "user-bob", title: "Bob's exploit" };
    mocks.auth.mockResolvedValue({ user: { id: "user-alice" } });
    mocks.userFindUnique.mockResolvedValue(mockUser);
    mocks.writeupFindUnique.mockResolvedValue(mockOtherWriteup);

    await expect(requireWriteupOwner("writeup-bob-1")).rejects.toThrow("NOT_FOUND");
    expect(mocks.notFound).toHaveBeenCalled();
  });

  it("requireWriteupOwner grants access to legitimate author", async () => {
    const mockUser = { id: "user-alice", username: "alice", role: "USER" };
    const mockAliceWriteup = { id: "writeup-alice-1", authorId: "user-alice", title: "Alice's kernel exploit" };
    mocks.auth.mockResolvedValue({ user: { id: "user-alice" } });
    mocks.userFindUnique.mockResolvedValue(mockUser);
    mocks.writeupFindUnique.mockResolvedValue(mockAliceWriteup);

    const result = await requireWriteupOwner("writeup-alice-1");
    expect(result.writeup.id).toBe("writeup-alice-1");
    expect(mocks.notFound).not.toHaveBeenCalled();
  });
});
