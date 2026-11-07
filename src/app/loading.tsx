import React from "react";

export default function RootLoading() {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[40vh] select-none"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#242936] border-t-[#22D3A0] animate-spin" />
        <span className="font-mono text-xs text-[#94A3B8] tracking-wider uppercase">
          Loading telemetry...
        </span>
      </div>
    </div>
  );
}
