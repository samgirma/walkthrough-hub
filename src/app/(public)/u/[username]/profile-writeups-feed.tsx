"use client";

import React, { useState, useTransition } from "react";
import { WriteupCard } from "@/components/writeup/writeup-card";
import { loadMoreUserWriteupsAction } from "@/server/auth.actions";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ShieldAlert } from "lucide-react";
import type { CategoryType, DifficultyType } from "@/types";

interface WriteupItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: CategoryType | string;
  difficulty: DifficultyType | string;
  ctfName: string;
  ctfYear: number;
  viewCount: number;
  readTimeMin: number;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  tags?: {
    tag: {
      id: string;
      name: string;
    };
  }[];
}

interface ProfileWriteupsFeedProps {
  initialWriteups: WriteupItem[];
  initialNextCursor: string | null;
  username: string;
  avatarUrl?: string | null;
  totalCount: number;
}

export function ProfileWriteupsFeed({
  initialWriteups,
  initialNextCursor,
  username,
  avatarUrl,
  totalCount,
}: ProfileWriteupsFeedProps) {
  const [writeups, setWriteups] = useState<WriteupItem[]>(initialWriteups);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    if (!nextCursor || isPending) return;

    startTransition(async () => {
      try {
        const res = await loadMoreUserWriteupsAction(username, nextCursor, 12);
        setWriteups((prev) => [...prev, ...(res.writeups as WriteupItem[])]);
        setNextCursor(res.nextCursor);
      } catch (err) {
        console.error("Failed to load more writeups:", err);
      }
    });
  };

  if (writeups.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-[#242936] bg-[#12151C] text-[#94A3B8]">
        <ShieldAlert className="h-10 w-10 text-[#475569] mx-auto mb-3" />
        <p className="font-sans text-sm">
          This researcher has not published any public writeups yet.
        </p>
      </div>
    );
  }

  const remaining = Math.max(0, totalCount - writeups.length);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {writeups.map((w) => (
          <WriteupCard
            key={w.id}
            writeup={{
              ...w,
              status: "PUBLIC",
              author: {
                username,
                avatarUrl,
              },
            }}
          />
        ))}
      </div>

      {nextCursor && (
        <div className="flex justify-center pt-4">
          <Button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            variant="outline"
            className="px-6 py-2.5 rounded-xl border border-[#242936] bg-[#12151C] hover:bg-[#181C25] text-white hover:text-[#22D3A0] font-mono text-xs transition-colors flex items-center gap-2 min-h-[44px]"
            aria-label={`Load more writeups (${remaining} remaining)`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#22D3A0]" />
                <span>Loading more exploits...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 text-[#22D3A0]" />
                <span>
                  Load more walkthroughs ({remaining} remaining)
                </span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
