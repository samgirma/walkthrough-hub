import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function StudioEditorSkeleton() {
  return (
    <div className="flex flex-col w-full h-screen bg-[#0B0D12] text-[#E0E2EC] overflow-hidden animate-pulse">
      {/* Top Header Bar */}
      <header className="h-14 w-full px-4 bg-[#12151C] border-b border-[#242936] flex items-center justify-between gap-4 z-40 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#181C25] text-[#94A3B8]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Logo variant="icon" size={26} href="/dashboard" />
          <div className="w-16 h-5 rounded bg-[#181C25]" />
          <div className="w-64 h-7 rounded bg-[#181C25]" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-8 rounded-lg bg-[#181C25]" />
          <div className="w-20 h-8 rounded-lg bg-primary/20" />
        </div>
      </header>

      {/* Secondary Context Strip */}
      <div className="w-full bg-[#10131A] px-4 py-1.5 border-b border-[#242936] flex items-center justify-between text-xs font-mono text-[#94A3B8] shrink-0">
        <div className="w-40 h-4 rounded bg-[#181C25]" />
        <div className="w-32 h-4 rounded bg-[#181C25]" />
      </div>

      {/* Workspace Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-full lg:w-1/2 flex flex-col bg-[#0B0D12] border-r border-[#242936]">
          <div className="h-10 bg-[#12151C] border-b border-[#242936]" />
          <div className="flex-1 p-6 space-y-4">
            <div className="w-3/4 h-5 rounded bg-[#181C25]" />
            <div className="w-full h-4 rounded bg-[#181C25]" />
            <div className="w-5/6 h-4 rounded bg-[#181C25]" />
            <div className="w-2/3 h-4 rounded bg-[#181C25]" />
          </div>
        </div>
        <div className="hidden lg:flex flex-1 flex-col bg-[#12151C] p-10 space-y-4">
          <div className="w-48 h-4 rounded bg-[#181C25]" />
          <div className="w-3/4 h-8 rounded bg-[#181C25]" />
          <div className="w-full h-32 rounded bg-[#181C25]" />
        </div>
      </div>
    </div>
  );
}
