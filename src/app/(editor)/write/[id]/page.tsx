import React from "react";
import { Metadata } from "next";
import { requireWriteupOwner } from "@/server/auth/dal";
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
  const { user } = await requireWriteupOwner(id);
  const writeup = await getWriteupByIdForAuthor(id, user.id);

  if (!writeup) {
    throw new Error("Writeup not found");
  }

  return (
    <StudioEditor
      initialWriteup={writeup}
      authorUsername={user.username || "author"}
    />
  );
}
