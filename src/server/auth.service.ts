import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { RegisterInput, UpdateProfileInput } from "@/lib/validations/auth.schema";

export async function registerUser(input: RegisterInput) {
  const emailLower = input.email.toLowerCase().trim();
  const usernameClean = input.username.trim();

  // Check unique email
  const existingEmail = await prisma.user.findUnique({
    where: { email: emailLower },
  });
  if (existingEmail) {
    throw new Error("An account with this email address already exists.");
  }

  // Check unique username
  const existingUsername = await prisma.user.findUnique({
    where: { username: usernameClean },
  });
  if (existingUsername) {
    throw new Error("This username is already taken. Please choose another.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      username: usernameClean,
      email: emailLower,
      passwordHash,
      avatarUrl: `https://avatars.githubusercontent.com/u/${Math.floor(
        Math.random() * 1000000
      )}?v=4`,
    },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  return user;
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      avatarUrl: true,
      githubUrl: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function getUserProfile(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      bio: true,
      githubUrl: true,
      createdAt: true,
      writeups: {
        where: { status: "PUBLIC" },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          difficulty: true,
          ctfName: true,
          ctfYear: true,
          viewCount: true,
          readTimeMin: true,
          publishedAt: true,
          createdAt: true,
          tags: {
            select: {
              tag: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
      _count: {
        select: {
          writeups: { where: { status: "PUBLIC" } },
        },
      },
    },
  });

  return user;
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput
) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      bio: input.bio,
      avatarUrl: input.avatarUrl || null,
      githubUrl: input.githubUrl || null,
    },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      avatarUrl: true,
      githubUrl: true,
    },
  });

  return updated;
}
