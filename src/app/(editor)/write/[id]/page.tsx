import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getWriteupByIdForAuthor } from "@/server/writeup.service";
import { StudioEditor } from "@/components/editor/studio-editor";

interface EditWriteupPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Walkthrough // WriteupHub Studio",
};

export default async function EditWriteupPage({ params }: EditWriteupPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const writeup = await getWriteupByIdForAuthor(id, session.user.id);
  if (!writeup) {
    notFound();
  }

  return (
    <StudioEditor
      initialWriteup={writeup}
      authorUsername={session.user.username || "author"}
    />
  );
}
