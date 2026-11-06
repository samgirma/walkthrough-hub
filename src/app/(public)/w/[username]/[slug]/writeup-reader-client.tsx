"use client";

import React, { useState } from "react";
import { ListTree } from "lucide-react";
import { MobileActionBar } from "./mobile-action-bar";
import { MobileTOCSheet, TOCItem } from "./mobile-toc-sheet";

interface WriteupReaderClientProps {
  writeupId: string;
  initialBookmarked?: boolean;
  userId?: string;
  title: string;
  url: string;
  toc: TOCItem[];
}

export function WriteupReaderClient({
  writeupId,
  initialBookmarked = false,
  userId,
  title,
  url,
  toc,
}: WriteupReaderClientProps) {
  const [tocSheetOpen, setTocSheetOpen] = useState(false);

  return (
    <>
      {/* Floating TOC Pill Button on Mobile (appears on right side above bottom bar) */}
      {toc.length > 0 && (
        <button
          type="button"
          onClick={() => setTocSheetOpen(true)}
          className="fixed bottom-20 right-4 z-40 lg:hidden px-3.5 py-2 rounded-full bg-[#181C25]/90 hover:bg-[#1D2027] border border-[#242936] text-white shadow-xl backdrop-blur-md font-mono text-xs flex items-center gap-2 min-h-[44px] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#22D3A0]"
          aria-label="Open Table of Contents"
        >
          <ListTree className="h-4 w-4 text-[#22D3A0]" />
          <span>Contents</span>
        </button>
      )}

      {/* Fixed Mobile Bottom Action Bar */}
      <MobileActionBar
        writeupId={writeupId}
        initialBookmarked={initialBookmarked}
        userId={userId}
        title={title}
        url={url}
        onOpenTOC={() => setTocSheetOpen(true)}
        tocCount={toc.length}
      />

      {/* Mobile Table of Contents Bottom Sheet */}
      <MobileTOCSheet
        toc={toc}
        sheetOpen={tocSheetOpen}
        onSheetOpenChange={setTocSheetOpen}
      />
    </>
  );
}
