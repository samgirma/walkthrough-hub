import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface WriteupsAliasParams {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: WriteupsAliasParams
) {
  const { slug } = await params;

  const writeup = await prisma.writeup.findFirst({
    where: {
      OR: [{ id: slug }, { slug }],
      status: { not: "DRAFT" },
    },
    select: {
      id: true,
      author: { select: { username: true } },
    },
  });

  if (writeup?.author?.username) {
    return NextResponse.redirect(
      new URL(`/w/${writeup.author.username}/${writeup.id}`, request.url),
      301
    );
  }

  return new NextResponse("Writeup Not Found", {
    status: 404,
    headers: { "X-Robots-Tag": "noindex, nofollow" },
  });
}
