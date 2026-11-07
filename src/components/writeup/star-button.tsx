"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIdleSession } from "@/lib/use-idle-session";
import { formatCompactNumber } from "@/lib/utils";

interface StarButtonProps {
  writeupId: string;
  initialStarsCount?: number;
  initialStarred?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export function StarButton({
  writeupId,
  initialStarsCount = 0,
  initialStarred = false,
  size = "sm",
  className = "",
}: StarButtonProps) {
  const { user } = useIdleSession();
  const [starred, setStarred] = useState(initialStarred);
  const [starsCount, setStarsCount] = useState(initialStarsCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!writeupId) return;

    // Fetch live status (and user-specific starred state if signed in)
    let isMounted = true;
    fetch(`/api/writeups/${encodeURIComponent(writeupId)}/stars`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          if (typeof data.starred === "boolean") setStarred(data.starred);
          if (typeof data.totalStars === "number") setStarsCount(data.totalStars);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [writeupId, user?.id]);

  const handleToggle = async () => {
    if (!user) {
      // Public / anonymous user: redirect to login
      window.location.href = `/login?callbackUrl=${encodeURIComponent(
        window.location.pathname
      )}`;
      return;
    }

    if (loading) return;

    // Optimistic UI update
    const previousStarred = starred;
    const previousCount = starsCount;
    const nextStarred = !starred;
    const nextCount = Math.max(0, previousCount + (nextStarred ? 1 : -1));

    setStarred(nextStarred);
    setStarsCount(nextCount);
    setLoading(true);

    try {
      const res = await fetch(`/api/writeups/${encodeURIComponent(writeupId)}/stars`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof data.starred === "boolean") setStarred(data.starred);
        if (typeof data.totalStars === "number") setStarsCount(data.totalStars);
      } else {
        // Rollback on failure
        setStarred(previousStarred);
        setStarsCount(previousCount);
      }
    } catch (err) {
      console.error("Failed to toggle star:", err);
      setStarred(previousStarred);
      setStarsCount(previousCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleToggle}
      disabled={loading}
      aria-label={
        starred
          ? `Starred. ${starsCount} total stars. Click to unstar.`
          : `Star this writeup. ${starsCount} total stars.`
      }
      className={`text-xs font-mono gap-1.5 transition-colors ${
        starred
          ? "border-amber-500/50 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
          : "text-[#BACAC1] hover:text-white"
      } ${className}`}
    >
      <Star
        className={`h-3.5 w-3.5 ${
          starred ? "fill-amber-400 text-amber-400" : "text-[#BACAC1] group-hover:text-amber-400"
        }`}
      />
      <span>{starred ? "Starred" : "Star"}</span>
      <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#181C25] border border-[#242936] text-[#BACAC1]">
        {formatCompactNumber(starsCount)}
      </span>
    </Button>
  );
}
