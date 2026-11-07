import { prisma } from "@/lib/prisma";

export interface CommentUser {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  role: string;
}

export interface CommentItem {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: CommentUser;
}

export async function getCommentsForWriteup(writeupId: string): Promise<{
  comments: CommentItem[];
  total: number;
}> {
  const writeup = await prisma.writeup.findUnique({
    where: { id: writeupId },
    select: { id: true, status: true },
  });

  if (!writeup) {
    return { comments: [], total: 0 };
  }

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { writeupId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    }),
    prisma.comment.count({ where: { writeupId } }),
  ]);

  return { comments, total };
}

export async function createComment(
  userId: string,
  writeupId: string,
  rawContent: string
): Promise<CommentItem> {
  const content = (rawContent || "").trim();

  if (!content) {
    throw new Error("Comment content cannot be empty.");
  }

  if (content.length > 2000) {
    throw new Error("Comment cannot exceed 2,000 characters.");
  }

  const writeup = await prisma.writeup.findUnique({
    where: { id: writeupId },
    select: { id: true, status: true, authorId: true },
  });

  if (!writeup) {
    throw new Error("Writeup not found.");
  }

  // DRAFT: only author can comment
  if (writeup.status === "DRAFT" && writeup.authorId !== userId) {
    throw new Error("Writeup not found.");
  }

  const comment = await prisma.comment.create({
    data: {
      userId,
      writeupId,
      content,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
  });

  return comment;
}

export async function deleteComment(
  userId: string,
  commentId: string,
  userRole?: string
): Promise<{ success: boolean }> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, writeupId: true },
  });

  if (!comment) {
    throw new Error("Comment not found.");
  }

  if (comment.userId !== userId && userRole !== "ADMIN") {
    throw new Error("Unauthorized: You do not have permission to delete this comment.");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return { success: true };
}
