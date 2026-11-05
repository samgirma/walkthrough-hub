import React from "react";
import { Logo } from "@/components/brand/Logo";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading WriteupHub"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0D12] select-none"
    >
      <div className="relative flex flex-col items-center gap-4">
        {/* Pulsing Icon Logo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-4 rounded-full bg-[#22D3A0]/10 blur-xl animate-pulse motion-reduce:animate-none" />
          <Logo
            variant="icon"
            size={56}
            href={null}
            priority
            imageClassName="animate-pulse motion-reduce:animate-none drop-shadow-[0_0_20px_rgba(34,211,160,0.5)]"
          />
        </div>

        {/* Cyber telemetry loading text */}
        <div className="flex items-center gap-2 font-mono text-xs text-[#94A3B8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A0] animate-ping motion-reduce:animate-none" />
          <span className="tracking-widest uppercase">INITIALIZING TELEMETRY...</span>
        </div>
      </div>
    </div>
  );
}
