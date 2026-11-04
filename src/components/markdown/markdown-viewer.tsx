"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownViewerProps {
  htmlContent: string;
  className?: string;
}

export function MarkdownViewer({ htmlContent, className }: MarkdownViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>("");
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Copy code button handler & image lightbox click handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Attach copy button click listeners
    const handleCopyClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest(".copy-code-button") as HTMLButtonElement | null;
      if (!button) return;

      const encodedCode = button.getAttribute("data-code");
      if (!encodedCode) return;

      const code = decodeURIComponent(encodedCode);
      try {
        await navigator.clipboard.writeText(code);
        const originalText = button.innerHTML;
        button.innerHTML = `<span class="text-emerald-400 font-semibold">✓ Copied!</span>`;
        button.classList.add("border-emerald-500/50");

        setTimeout(() => {
          button.innerHTML = originalText;
          button.classList.remove("border-emerald-500/50");
        }, 2000);
      } catch (err) {
        console.error("Failed to copy code to clipboard:", err);
      }
    };

    // Attach image click listeners for lightbox
    const handleImageClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "IMG") {
        const img = target as HTMLImageElement;
        // Don't lightbox tiny badges or avatars
        if (img.naturalWidth > 120 || img.naturalHeight > 120) {
          setLightboxSrc(img.src);
          setLightboxAlt(img.alt || "Challenge Image");
          setZoomLevel(1);
        }
      }
    };

    container.addEventListener("click", handleCopyClick);
    container.addEventListener("click", handleImageClick);

    return () => {
      container.removeEventListener("click", handleCopyClick);
      container.removeEventListener("click", handleImageClick);
    };
  }, [htmlContent]);

  // Handle escape key to close lightbox
  useEffect(() => {
    if (!lightboxSrc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxSrc(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxSrc]);

  return (
    <>
      <article
        ref={containerRef}
        className={cn(
          "prose prose-invert max-w-none text-[#E0E2EC]",
          // Headings
          "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white",
          "prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:border-b prose-h1:border-[#242936] prose-h1:pb-3 prose-h1:mt-8 prose-h1:mb-4",
          "prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3",
          "prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2",
          // Links
          "prose-a:text-[#38BDF8] prose-a:underline-offset-4 hover:prose-a:text-[#50F0BB] prose-a:transition-colors",
          // Paragraphs & Lists
          "prose-p:leading-relaxed prose-p:text-[#BACAC1] prose-p:my-3 text-base sm:text-[17px]",
          "prose-li:text-[#BACAC1] prose-ul:my-3 prose-ol:my-3",
          // Blockquotes
          "prose-blockquote:border-l-[#22D3A0] prose-blockquote:bg-[#12151C] prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-[#94A3B8]",
          // Inline code
          "prose-code:text-[#38BDF8] prose-code:bg-[#181C25] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-[#242936] prose-code:font-mono prose-code:text-xs",
          // Tables
          "prose-table:border-collapse prose-table:border prose-table:border-[#242936] prose-table:w-full prose-table:my-6",
          "prose-th:bg-[#181C25] prose-th:border prose-th:border-[#242936] prose-th:p-2.5 prose-th:text-xs prose-th:font-mono prose-th:text-[#BACAC1] prose-th:text-left",
          "prose-td:border prose-td:border-[#242936] prose-td:p-2.5 prose-td:text-xs prose-td:font-mono prose-td:text-[#E0E2EC]",
          className
        )}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Lightbox Modal with Pinch / Zoom Controls */}
      {lightboxSrc && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0B0D12]/95 backdrop-blur-md flex flex-col items-center justify-between p-4"
          onClick={() => setLightboxSrc(null)}
        >
          {/* Header with Title & Zoom Controls */}
          <div
            className="w-full max-w-4xl flex items-center justify-between text-white font-mono text-xs z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[#94A3B8] truncate max-w-xs sm:max-w-md">
              {lightboxAlt}
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
                onClick={() => setLightboxSrc(null)}
                className="p-2 rounded hover:bg-[#181C25] text-rose-400 hover:text-rose-300 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Close Lightbox"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Centered Image with Zoom Scale */}
          <div
            className="flex-1 flex items-center justify-center w-full max-h-[85vh] overflow-auto p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxSrc}
              alt={lightboxAlt}
              className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel})`,
              }}
            />
          </div>

          {/* Tap anywhere to dismiss indicator */}
          <div className="font-mono text-[11px] text-[#475569] text-center pb-2">
            Tap outside or press ESC to exit preview
          </div>
        </div>
      )}
    </>
  );
}
