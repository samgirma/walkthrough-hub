import React from "react";

export function WriteupCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col justify-between p-5 rounded-xl border border-[#242936] bg-[#12151C]/80 min-h-[220px] animate-pulse select-none"
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-14 rounded bg-[#181C25] border border-[#242936]" />
            <div className="h-5 w-16 rounded bg-[#181C25] border border-[#242936]" />
          </div>
          <div className="h-4 w-20 rounded bg-[#181C25]" />
        </div>

        {/* Title (2 lines) */}
        <div className="space-y-2 mb-3">
          <div className="h-5 w-4/5 rounded bg-[#181C25]" />
          <div className="h-5 w-2/3 rounded bg-[#181C25]" />
        </div>

        {/* Excerpt (2 lines) */}
        <div className="space-y-1.5 mb-4">
          <div className="h-3.5 w-full rounded bg-[#181C25]/80" />
          <div className="h-3.5 w-3/4 rounded bg-[#181C25]/80" />
        </div>

        {/* Tags Row */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="h-4 w-12 rounded bg-[#181C25]" />
          <div className="h-4 w-16 rounded bg-[#181C25]" />
          <div className="h-4 w-14 rounded bg-[#181C25]" />
        </div>
      </div>

      {/* Bottom Metadata Strip */}
      <div className="pt-3 border-t border-[#242936]/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#181C25]" />
          <div className="h-3.5 w-16 rounded bg-[#181C25]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-3.5 w-10 rounded bg-[#181C25]" />
          <div className="h-3.5 w-8 rounded bg-[#181C25]" />
        </div>
      </div>
    </div>
  );
}
