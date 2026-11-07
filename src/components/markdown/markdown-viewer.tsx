"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const ImageLightbox = dynamic(
  () => import("./image-lightbox").then((m) => m.ImageLightbox),
  { ssr: false }
);

interface MarkdownViewerProps {
  htmlContent: string;
  className?: string;
}

export function MarkdownViewer({ htmlContent, className }: MarkdownViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>("");

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

      {/* Lazy-loaded Lightbox Modal */}
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt={lightboxAlt}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </>
  );
}
