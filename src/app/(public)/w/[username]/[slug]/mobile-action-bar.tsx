"use client";

import React, { useState } from "react";
import { Share2, Link as LinkIcon, Check, ListTree } from "lucide-react";
import { BookmarkButton } from "@/components/writeup/bookmark-button";

interface MobileActionBarProps {
  writeupId: string;
  initialBookmarked: boolean;
  userId?: string;
  title: string;
  url: string;
  onOpenTOC: () => void;
  tocCount: number;
}

export function MobileActionBar({
  writeupId,
  initialBookmarked,
  userId,
  title,
  url,
  onOpenTOC,
  tocCount,
}: MobileActionBarProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        return;
      } catch (err) {
        // User aborted share or not supported, proceed to copy link fallback
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#12151C]/95 backdrop-blur-xl border-t border-[#242936] px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl">
      <div className="max-w-lg mx-auto flex items-center justify-around gap-2 font-mono text-xs">
        {/* TOC Button */}
        {tocCount > 0 && (
          <button
            type="button"
            onClick={onOpenTOC}
            className="flex flex-col items-center justify-center p-1.5 text-[#BACAC1] hover:text-white transition-colors min-h-[44px] min-w-[50px] rounded-lg active:bg-[#181C25]"
            aria-label="Table of contents"
          >
            <ListTree className="h-4 w-4 text-[#22D3A0]" />
            <span className="text-[10px] mt-0.5">TOC</span>
          </button>
        )}

        {/* Bookmark Button */}
        <div className="flex flex-col items-center justify-center min-h-[44px]">
          <BookmarkButton
            writeupId={writeupId}
            initialBookmarked={initialBookmarked}
            userId={userId}
          />
        </div>

        {/* Share Button (Web Share API) */}
        <button
          type="button"
          onClick={handleShare}
          className="flex flex-col items-center justify-center p-1.5 text-[#BACAC1] hover:text-white transition-colors min-h-[44px] min-w-[50px] rounded-lg active:bg-[#181C25]"
          aria-label="Share writeup"
        >
          <Share2 className="h-4 w-4 text-[#38BDF8]" />
          <span className="text-[10px] mt-0.5">Share</span>
        </button>

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex flex-col items-center justify-center p-1.5 text-[#BACAC1] hover:text-white transition-colors min-h-[44px] min-w-[50px] rounded-lg active:bg-[#181C25]"
          aria-label="Copy link"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <LinkIcon className="h-4 w-4 text-[#94A3B8]" />
          )}
          <span className="text-[10px] mt-0.5">
            {copied ? "Copied" : "Copy"}
          </span>
        </button>
      </div>
    </div>
  );
}
