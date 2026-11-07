import React from "react";

export default function WriteupDetailLoading() {
  return (
    <div className="w-full min-h-screen bg-transparent pb-24 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column (Sticky Sidebar on Desktop) */}
          <aside className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col gap-6 sticky top-20">
            {/* Table of Contents Skeleton */}
            <div className="p-4 rounded-xl border border-[#242936] bg-[#12151C] flex flex-col gap-3">
              <div className="h-4 w-32 rounded bg-[#181C25] animate-pulse pb-2 border-b border-[#242936]" />
              <div className="space-y-2.5 pt-1">
                <div className="h-3.5 w-3/4 rounded bg-[#181C25]/80 animate-pulse" />
                <div className="h-3.5 w-5/6 rounded bg-[#181C25]/80 animate-pulse pl-2" />
                <div className="h-3.5 w-2/3 rounded bg-[#181C25]/80 animate-pulse pl-2" />
                <div className="h-3.5 w-4/5 rounded bg-[#181C25]/80 animate-pulse" />
                <div className="h-3.5 w-1/2 rounded bg-[#181C25]/80 animate-pulse" />
              </div>
            </div>

            {/* Challenge Files Widget Skeleton */}
            <div className="p-4 rounded-xl border border-[#242936] bg-[#12151C] flex flex-col gap-3">
              <div className="h-4 w-28 rounded bg-[#181C25] animate-pulse pb-2 border-b border-[#242936]" />
              <div className="space-y-2">
                <div className="h-10 w-full rounded-lg bg-[#0B0D12] border border-[#242936] animate-pulse" />
                <div className="h-10 w-full rounded-lg bg-[#0B0D12] border border-[#242936] animate-pulse" />
              </div>
            </div>

            {/* Telemetry Widget Skeleton */}
            <div className="p-4 rounded-xl border border-[#242936] bg-[#0B0D12] flex flex-col gap-2.5">
              <div className="h-3.5 w-36 rounded bg-[#181C25] animate-pulse" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 rounded bg-[#12151C] border border-[#242936]/60 animate-pulse" />
                <div className="h-12 rounded bg-[#12151C] border border-[#242936]/60 animate-pulse" />
                <div className="h-12 rounded bg-[#12151C] border border-[#242936]/60 animate-pulse" />
                <div className="h-12 rounded bg-[#12151C] border border-[#242936]/60 animate-pulse" />
              </div>
            </div>
          </aside>

          {/* Right Main Article Skeleton */}
          <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 min-w-0 w-full">
            <div className="p-4 sm:p-8 rounded-xl border border-[#242936] bg-[#12151C]/92 shadow-lg">
              {/* Back link */}
              <div className="h-4 w-28 rounded bg-[#181C25] animate-pulse mb-6" />

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="h-5 w-16 rounded bg-[#181C25] animate-pulse" />
                <div className="h-5 w-20 rounded bg-[#181C25] animate-pulse" />
                <div className="h-5 w-28 rounded bg-[#181C25] animate-pulse" />
              </div>

              {/* Title (2 lines) */}
              <div className="space-y-3 mb-4">
                <div className="h-8 sm:h-10 w-4/5 rounded bg-[#181C25] animate-pulse" />
                <div className="h-8 sm:h-10 w-3/5 rounded bg-[#181C25] animate-pulse" />
              </div>

              {/* Excerpt */}
              <div className="space-y-2 mb-6">
                <div className="h-4 w-full rounded bg-[#181C25]/80 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-[#181C25]/80 animate-pulse" />
              </div>

              {/* Author & Action Bar */}
              <div className="pt-4 border-t border-[#242936]/60 flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#181C25] animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-24 rounded bg-[#181C25] animate-pulse" />
                    <div className="h-3 w-32 rounded bg-[#181C25]/60 animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-20 rounded-lg bg-[#181C25] animate-pulse" />
                  <div className="h-8 w-8 rounded-lg bg-[#181C25] animate-pulse" />
                </div>
              </div>

              {/* Article Content Body Placeholder */}
              <div className="space-y-4 pt-4 border-t border-[#242936]/40">
                <div className="h-6 w-1/3 rounded bg-[#181C25] animate-pulse mb-3" />
                <div className="h-4 w-full rounded bg-[#181C25]/70 animate-pulse" />
                <div className="h-4 w-11/12 rounded bg-[#181C25]/70 animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-[#181C25]/70 animate-pulse" />

                {/* Code block placeholder */}
                <div className="h-32 w-full rounded-lg bg-[#0B0D12] border border-[#242936] my-6 animate-pulse" />

                <div className="h-6 w-1/4 rounded bg-[#181C25] animate-pulse mb-3" />
                <div className="h-4 w-full rounded bg-[#181C25]/70 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-[#181C25]/70 animate-pulse" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
