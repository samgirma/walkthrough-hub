import React from "react";
import { WriteupCardSkeleton } from "@/components/writeup/writeup-card-skeleton";

export default function ExploreLoading() {
  return (
    <div className="w-full min-h-screen bg-transparent pb-24">
      {/* Header Banner Skeleton */}
      <section className="w-full bg-[#10131A] border-b border-[#242936] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          {/* Title & Stats */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-8 sm:h-9 w-64 rounded bg-[#181C25] animate-pulse" />
              <div className="h-4 w-80 rounded bg-[#181C25]/70 animate-pulse" />
            </div>
            {/* Search Input Placeholder */}
            <div className="h-10 w-full sm:w-72 rounded-lg bg-[#12151C] border border-[#242936] animate-pulse" />
          </div>

          {/* Category Chips Skeleton */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-24 rounded-lg bg-[#181C25] border border-[#242936] animate-pulse"
              />
            ))}
          </div>

          {/* Filter Bar (Sort, Difficulty) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#242936]/60">
            <div className="flex items-center gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-7 w-16 rounded bg-[#181C25] border border-[#242936] animate-pulse"
                />
              ))}
            </div>
            <div className="h-7 w-28 rounded bg-[#181C25] border border-[#242936] animate-pulse" />
          </div>
        </div>
      </section>

      {/* Main Grid: 12 Writeup Cards Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(12)].map((_, i) => (
            <WriteupCardSkeleton key={i} />
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-center gap-2 pt-12">
          <div className="h-9 w-24 rounded-lg bg-[#181C25] border border-[#242936] animate-pulse" />
          <div className="h-9 w-12 rounded-lg bg-[#181C25] border border-[#242936] animate-pulse" />
          <div className="h-9 w-24 rounded-lg bg-[#181C25] border border-[#242936] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
