import React from "react";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { StudioEditor } from "@/components/editor/studio-editor";

export const metadata: Metadata = {
  title: "WriteupHub Studio // Composer",
  description: "Compose, verify, and publish CTF exploit writeups in Markdown.",
};

export default async function NewWriteupPage() {
  const session = await auth();

  return (
    <StudioEditor
      initialWriteup={null}
      authorUsername={session?.user?.username || "researcher"}
    />
  );
}
