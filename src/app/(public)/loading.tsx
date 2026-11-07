import React from "react";
import { WriteupCardSkeleton } from "@/components/writeup/writeup-card-skeleton";

export default function HomeLoading() {
  return (
    <div className="relative w-full min-h-screen">
      {/* Pinned Hero Skeleton - height [100svh] */}
      <div className="-mt-16 sticky top-0 left-0 w-full h-[100svh] z-0 overflow-hidden bg-[#0B0D12] flex items-center justify-center">
        <div className="max-w-4xl w-full px-4 flex flex-col items-center text-center gap-6">
          {/* Badge */}
          <div className="h-7 w-48 rounded-full bg-[#181C25] border border-[#242936] animate-pulse" />
          {/* Title */}
          <div className="space-y-3 w-full flex flex-col items-center">
            <div className="h-10 sm:h-14 w-3/4 rounded-lg bg-[#181C25] animate-pulse" />
            <div className="h-10 sm:h-14 w-1/2 rounded-lg bg-[#181C25] animate-pulse" />
          </div>
          {/* Subtitle */}
          <div className="h-4 sm:h-5 w-2/3 rounded bg-[#181C25]/80 animate-pulse" />
          {/* Search bar */}
          <div className="h-12 w-full max-w-xl rounded-xl bg-[#12151C] border border-[#242936] animate-pulse" />
          {/* Categories row */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-20 rounded-lg bg-[#181C25] border border-[#242936] animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Slide-over Content Skeleton */}
      <div className="relative z-10 bg-[#0B0D12] border-t border-[#242936] shadow-[0_-25px_60px_rgba(0,0,0,0.95)]">
        <section className="w-full py-12 sm:py-16 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#181C25] border border-[#242936] animate-pulse" />
                <div className="space-y-2">
                  <div className="h-6 w-44 rounded bg-[#181C25] animate-pulse" />
                  <div className="h-3.5 w-64 rounded bg-[#181C25]/70 animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-28 rounded bg-[#181C25] animate-pulse" />
            </div>

            {/* Grid of 6 writeup cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <WriteupCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Tags Ribbon */}
        <section className="w-full py-8 sm:py-12 bg-[#12151C]/75 border-t border-b border-[#242936]/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
            <div className="h-4 w-36 rounded bg-[#181C25] animate-pulse" />
            <div className="flex flex-wrap items-center gap-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-7 w-24 rounded-lg bg-[#181C25] border border-[#242936] animate-pulse"
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
