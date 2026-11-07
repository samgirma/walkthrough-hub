"use client";

import React, { useEffect, useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#0B0D12]/95 backdrop-blur-md flex flex-col items-center justify-between p-4"
      onClick={onClose}
    >
      {/* Header with Title & Zoom Controls */}
      <div
        className="w-full max-w-4xl flex items-center justify-between text-white font-mono text-xs z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[#94A3B8] truncate max-w-xs sm:max-w-md">
          {alt}
        </span>

        <div className="flex items-center gap-2 bg-[#12151C] p-1 rounded-xl border border-[#242936]">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
            className="p-2 rounded hover:bg-[#181C25] text-[#BACAC1] hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="px-2 font-mono text-xs text-[#22D3A0]">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
            className="p-2 rounded hover:bg-[#181C25] text-[#BACAC1] hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="p-2 rounded hover:bg-[#181C25] text-[#BACAC1] hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Reset Zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded hover:bg-[#181C25] text-rose-400 hover:text-rose-300 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Close Lightbox"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Image Container with Scaled Transform */}
      <div
        className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto p-4 my-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          style={{ transform: `scale(${zoomLevel})` }}
          className="max-h-[80vh] max-w-full object-contain rounded-lg border border-[#242936] shadow-2xl transition-transform duration-150 ease-out cursor-grab active:cursor-grabbing select-none"
        />
      </div>

      {/* Footer Hint */}
      <div className="text-[11px] font-mono text-[#475569] flex items-center gap-4">
        <span>Click outside or press ESC to dismiss</span>
        <span>•</span>
        <span>Scroll / Pinch to inspect high-resolution artifact</span>
      </div>
    </div>
  );
}
