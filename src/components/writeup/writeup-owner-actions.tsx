"use client";

import React from "react";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { useIdleSession } from "@/lib/use-idle-session";

interface WriteupOwnerActionsProps {
  authorId: string;
  writeupId: string;
}

export function WriteupOwnerActions({
  authorId,
  writeupId,
}: WriteupOwnerActionsProps) {
  const { user } = useIdleSession();

  if (!user?.id || user.id !== authorId) {
    return null;
  }

  return (
    <Link
      href={`/write/${writeupId}`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22D3A0]/10 hover:bg-[#22D3A0]/20 text-[#22D3A0] border border-[#22D3A0]/30 font-mono text-xs font-semibold transition-colors min-h-[36px]"
      title="Edit Walkthrough"
    >
      <PenLine className="h-3.5 w-3.5" />
      <span>Edit Walkthrough</span>
    </Link>
  );
}
