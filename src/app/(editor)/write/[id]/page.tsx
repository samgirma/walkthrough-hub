import React from "react";
import { Metadata } from "next";
import { requireWriteupOwner } from "@/server/auth/dal";
import { getWriteupByIdForAuthor } from "@/server/writeup.service";
import { StudioEditorClient } from "@/components/editor/studio-editor-client";
import { buildMetadata } from "@/lib/seo";

interface EditWriteupPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = buildMetadata({
  title: "Edit Walkthrough Studio",
  noindex: true,
  nofollow: true,
});

export default async function EditWriteupPage({ params }: EditWriteupPageProps) {
  const { id } = await params;
  const { user } = await requireWriteupOwner(id);
  const writeup = await getWriteupByIdForAuthor(id, user.id);

  if (!writeup) {
    throw new Error("Writeup not found");
  }

  return (
    <StudioEditorClient
      initialWriteup={writeup}
      authorUsername={user.username || "author"}
    />
  );
}
