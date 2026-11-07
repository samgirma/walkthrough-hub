"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname changes, complete and reset navigation
  useEffect(() => {
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, isNavigating]);

  // Animate progress smoothly while navigating
  useEffect(() => {
    if (!isNavigating) return;

    setProgress(25);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + (85 - prev) * 0.2;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isNavigating]);

  // Global click interception for instant link feedback
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't intercept if modifier keys are pressed (open in new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank"
      ) {
        return;
      }

      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin !== window.location.origin) return;

        // If clicking current page without pathname change, skip
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
          return;
        }

        setIsNavigating(true);
      } catch {
        // invalid URL, ignore
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] pointer-events-none transition-opacity duration-200"
      style={{
        opacity: progress === 100 ? 0 : 1,
      }}
    >
      <div
        className="h-full bg-gradient-to-r from-[#22D3A0] via-[#38BDF8] to-[#50F0BB] shadow-[0_0_10px_rgba(34,211,160,0.8)] transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
