import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/write");
  }

  return <div className="w-full h-screen bg-[#0B0D12] overflow-hidden">{children}</div>;
}
