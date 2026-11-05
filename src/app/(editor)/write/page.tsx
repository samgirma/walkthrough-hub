import React from "react";
import { Metadata } from "next";
import { requireOnboarded } from "@/server/auth/dal";
import { StudioEditor } from "@/components/editor/studio-editor";

export const metadata: Metadata = {
  title: "WriteupHub Studio // Composer",
  description: "Compose, verify, and publish CTF exploit writeups in Markdown.",
};

export default async function NewWriteupPage() {
  const user = await requireOnboarded("/write");

  return (
    <StudioEditor
      initialWriteup={null}
      authorUsername={user.username}
    />
  );
}
