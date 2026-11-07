import React from "react";
import { WriteupCardSkeleton } from "@/components/writeup/writeup-card-skeleton";

export default function ProfileLoading() {
  return (
    <div className="w-full min-h-screen bg-transparent pb-24">
      {/* Top Banner / Author Header Skeleton */}
      <section className="w-full bg-[#10131A] border-b border-[#242936] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <div className="h-4 w-28 rounded bg-[#181C25] animate-pulse mb-6" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              {/* Avatar w-20 h-20 */}
              <div className="w-20 h-20 rounded-2xl bg-[#181C25] border-2 border-[#242936] animate-pulse shrink-0" />

              <div className="space-y-2">
                <div className="h-7 w-48 rounded bg-[#181C25] animate-pulse" />
                <div className="h-4 w-72 rounded bg-[#181C25]/70 animate-pulse" />
                <div className="h-3.5 w-36 rounded bg-[#181C25]/50 animate-pulse" />
              </div>
            </div>

            {/* Stats Counter Pill */}
            <div className="flex items-center gap-4 bg-[#181C25] p-3.5 rounded-xl border border-[#242936]">
              <div className="space-y-1">
                <div className="h-3 w-16 rounded bg-[#242936] animate-pulse" />
                <div className="h-6 w-10 rounded bg-[#242936] animate-pulse" />
              </div>
              <div className="h-8 w-px bg-[#242936]" />
              <div className="space-y-1">
                <div className="h-3 w-16 rounded bg-[#242936] animate-pulse" />
                <div className="h-6 w-12 rounded bg-[#242936] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Author Writeups Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-6 w-48 rounded bg-[#181C25] animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <WriteupCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
