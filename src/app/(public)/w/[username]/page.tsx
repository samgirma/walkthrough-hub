import { permanentRedirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function WriteupOrAuthorRedirect({ params }: Props) {
  const { username } = await params;

  // 1. Check if the segment is a writeup ID (cuid / base32 string)
  const writeup = await prisma.writeup.findUnique({
    where: { id: username },
    select: {
      id: true,
      status: true,
      author: { select: { username: true } },
    },
  });

  if (writeup && writeup.status !== "DRAFT" && writeup.author.username) {
    permanentRedirect(`/w/${writeup.author.username}/${writeup.id}`);
  }

  // 2. Check if the segment is a user's username (redirect /w/alice -> /u/alice)
  const user = await prisma.user.findUnique({
    where: { username },
    select: { username: true },
  });

  if (user?.username) {
    permanentRedirect(`/u/${user.username}`);
  }

  notFound();
}
