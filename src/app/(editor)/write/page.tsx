import React from "react";
import { Metadata } from "next";
import { requireOnboarded } from "@/server/auth/dal";
import { StudioEditorClient } from "@/components/editor/studio-editor-client";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Writeup Studio Composer",
  description: "Compose, verify, and publish CTF exploit writeups in Markdown.",
  canonicalPath: "/write",
  noindex: true,
  nofollow: true,
});

export default async function NewWriteupPage() {
  const user = await requireOnboarded("/write");

  return (
    <StudioEditorClient
      initialWriteup={null}
      authorUsername={user.username}
    />
  );
}
