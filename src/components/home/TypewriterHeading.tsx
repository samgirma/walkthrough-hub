"use client";

import React, { useState, useEffect } from "react";

const TARGET_TEXT = "CTF Walkthrough";

export function TypewriterHeading() {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // If reduced motion is requested, display full text immediately
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayText(TARGET_TEXT);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    if (!isDeleting) {
      // Writing phase: typing letter-by-letter
      if (displayText.length < TARGET_TEXT.length) {
        const nextCharDelay = 110 + Math.random() * 40;
        timeoutId = setTimeout(() => {
          setDisplayText(TARGET_TEXT.slice(0, displayText.length + 1));
        }, nextCharDelay);
      } else {
        // Full text reached: pause so it's fully readable
        timeoutId = setTimeout(() => {
          setIsDeleting(true);
        }, 2400);
      }
    } else {
      // Deleting phase: backspacing letter-by-letter
      if (displayText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(TARGET_TEXT.slice(0, displayText.length - 1));
        }, 55);
      } else {
        // Completely cleared: short pause before re-typing
        timeoutId = setTimeout(() => {
          setIsDeleting(false);
        }, 700);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, isDeleting]);

  return (
    <div className="flex items-center min-h-[1.25em] select-none">
      <h1 className="font-mono text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white flex items-center drop-shadow-[0_0_35px_rgba(34,211,160,0.35)]">
        <span className="bg-gradient-to-r from-white via-[#E0E2EC] to-[#50F0BB] bg-clip-text text-transparent">
          {displayText}
        </span>
        <span
          aria-hidden="true"
          className="inline-block w-2 sm:w-3 md:w-4 lg:w-5 h-[0.82em] bg-[#22D3A0] ml-2 animate-pulse shadow-[0_0_15px_#22D3A0] align-middle"
        />
      </h1>
    </div>
  );
}
