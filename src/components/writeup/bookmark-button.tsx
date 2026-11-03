"use client";

import React, { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookmarkButtonProps {
  writeupId: string;
  initialBookmarked?: boolean;
  userId?: string | null;
}

export function BookmarkButton({
  writeupId,
  initialBookmarked = false,
  userId,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!userId) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(
        window.location.pathname
      )}`;
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writeupId }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs font-mono gap-1.5 transition-colors ${
        bookmarked
          ? "border-amber-500/50 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
          : "text-[#BACAC1] hover:text-white"
      }`}
    >
      <Bookmark
        className={`h-3.5 w-3.5 ${
          bookmarked ? "fill-amber-400 text-amber-400" : ""
        }`}
      />
      <span>{bookmarked ? "Saved" : "Save"}</span>
    </Button>
  );
}
