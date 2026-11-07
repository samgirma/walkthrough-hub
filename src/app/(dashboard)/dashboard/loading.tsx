import React from "react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Top Header & Title Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded bg-[#181C25] animate-pulse" />
          <div className="h-4 w-96 rounded bg-[#181C25]/70 animate-pulse" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-[#181C25] animate-pulse" />
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-[#242936] bg-[#12151C]/80 flex flex-col justify-between min-h-[110px] animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded bg-[#181C25]" />
              <div className="w-8 h-8 rounded-lg bg-[#181C25]" />
            </div>
            <div className="h-7 w-16 rounded bg-[#181C25]" />
          </div>
        ))}
      </div>

      {/* Writeups Management Table Skeleton */}
      <div className="p-6 rounded-xl border border-[#242936] bg-[#12151C] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#242936]">
          <div className="h-5 w-36 rounded bg-[#181C25] animate-pulse" />
          <div className="h-4 w-20 rounded bg-[#181C25] animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 w-full rounded-lg bg-[#0B0D12] border border-[#242936]/60 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
