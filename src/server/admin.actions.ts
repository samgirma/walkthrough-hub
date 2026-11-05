"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/dal";
import { prisma } from "@/lib/prisma";
import { Role, Status } from "@prisma/client";

/**
 * Updates a user's role (USER <-> ADMIN).
 * Guaranteed safety guard against accidental administrator self-lockout.
 */
export async function updateUserRoleAction(targetUserId: string, newRole: Role) {
  const caller = await requireRole("ADMIN");

  if (!targetUserId || typeof targetUserId !== "string") {
    throw new Error("Invalid target user ID.");
  }

  if (newRole !== "USER" && newRole !== "ADMIN") {
    throw new Error("Invalid role specified.");
  }

  if (targetUserId === caller.id && newRole !== "ADMIN") {
    throw new Error("Safety Guard: You cannot demote your own administrator account.");
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, username: true, role: true },
  });

  if (!target) {
    throw new Error("User not found.");
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
    select: { id: true, username: true, role: true },
  });

  revalidatePath("/dashboard/admin");
  return { success: true, user: updated };
}

/**
 * Permanently deletes a user account from the platform.
 * Blocks self-deletion to prevent administrative lockout.
 */
export async function deleteUserAction(targetUserId: string) {
  const caller = await requireRole("ADMIN");

  if (!targetUserId || typeof targetUserId !== "string") {
    throw new Error("Invalid target user ID.");
  }

  if (targetUserId === caller.id) {
    throw new Error("Safety Guard: You cannot delete your own account from the Admin Console. Use Account Settings.");
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, username: true },
  });

  if (!target) {
    throw new Error("User not found.");
  }

  await prisma.user.delete({
    where: { id: targetUserId },
  });

  revalidatePath("/dashboard/admin");
  return { success: true };
}

/**
 * Moderates a writeup's publication status across the platform.
 */
export async function adminUpdateWriteupStatusAction(writeupId: string, newStatus: Status) {
  await requireRole("ADMIN");

  if (!writeupId || typeof writeupId !== "string") {
    throw new Error("Invalid writeup ID.");
  }

  if (newStatus !== "DRAFT" && newStatus !== "UNLISTED" && newStatus !== "PUBLIC") {
    throw new Error("Invalid writeup status.");
  }

  const writeup = await prisma.writeup.findUnique({
    where: { id: writeupId },
    select: { id: true, status: true, publishedAt: true },
  });

  if (!writeup) {
    throw new Error("Writeup not found.");
  }

  const updateData: { status: Status; publishedAt?: Date } = { status: newStatus };
  if (newStatus === "PUBLIC" && !writeup.publishedAt) {
    updateData.publishedAt = new Date();
  }

  const updated = await prisma.writeup.update({
    where: { id: writeupId },
    data: updateData,
    select: { id: true, status: true },
  });

  revalidatePath("/dashboard/admin");
  return { success: true, writeup: updated };
}

/**
 * Permanently purges a writeup for content moderation violations.
 */
export async function adminDeleteWriteupAction(writeupId: string) {
  await requireRole("ADMIN");

  if (!writeupId || typeof writeupId !== "string") {
    throw new Error("Invalid writeup ID.");
  }

  const writeup = await prisma.writeup.findUnique({
    where: { id: writeupId },
    select: { id: true },
  });

  if (!writeup) {
    throw new Error("Writeup not found.");
  }

  await prisma.writeup.delete({
    where: { id: writeupId },
  });

  revalidatePath("/dashboard/admin");
  return { success: true };
}
