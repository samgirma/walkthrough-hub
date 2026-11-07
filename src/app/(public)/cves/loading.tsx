import React from "react";

export default function CvesLoading() {
  return (
    <div className="w-full min-h-screen bg-transparent pb-24">
      {/* Header Banner Skeleton */}
      <section className="w-full bg-[#10131A] border-b border-[#242936] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="h-6 w-56 rounded-full bg-[#181C25] border border-[#242936] animate-pulse" />
              <div className="h-9 w-72 rounded bg-[#181C25] animate-pulse" />
              <div className="h-4 w-full max-w-xl rounded bg-[#181C25]/70 animate-pulse" />
            </div>

            {/* Stats Pill Skeleton */}
            <div className="flex items-center gap-4 bg-[#181C25] p-4 rounded-xl border border-[#242936]">
              <div className="space-y-1">
                <div className="h-3 w-24 rounded bg-[#242936] animate-pulse" />
                <div className="h-6 w-16 rounded bg-[#242936] animate-pulse" />
              </div>
              <div className="h-8 w-px bg-[#242936]" />
              <div className="space-y-1">
                <div className="h-3 w-20 rounded bg-[#242936] animate-pulse" />
                <div className="h-6 w-16 rounded bg-[#242936] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main CVE Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-[#242936] bg-[#12151C]/80 min-h-[200px] flex flex-col justify-between animate-pulse"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="h-5 w-28 rounded bg-[#181C25] border border-[#242936]" />
                  <div className="h-5 w-16 rounded bg-[#181C25]" />
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full rounded bg-[#181C25]/80" />
                  <div className="h-4 w-5/6 rounded bg-[#181C25]/80" />
                </div>
              </div>
              <div className="pt-3 border-t border-[#242936]/60 flex items-center justify-between">
                <div className="h-3.5 w-24 rounded bg-[#181C25]" />
                <div className="h-3.5 w-16 rounded bg-[#181C25]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
