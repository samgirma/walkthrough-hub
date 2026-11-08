"use client";

import React, { useState, useEffect } from "react";

const ROTATING_TEXTS = [
  "CTF Walkthroughs",
  "Zero-Day Exploits",
  "Vulnerability Research",
  "Kernel & Pwn Solutions",
  "Binary Decompilations",
];

export function TypewriterHeading() {
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const currentTarget = ROTATING_TEXTS[textIndex];

  useEffect(() => {
    // If reduced motion is requested, display full text immediately
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayText(ROTATING_TEXTS[0]);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    if (!isDeleting) {
      // Writing phase: typing letter-by-letter
      if (displayText.length < currentTarget.length) {
        const nextCharDelay = 95 + Math.random() * 25;
        timeoutId = setTimeout(() => {
          setDisplayText(currentTarget.slice(0, displayText.length + 1));
        }, nextCharDelay);
      } else {
        // Full text reached: pause so it's fully readable
        timeoutId = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      // Deleting phase: backspacing letter-by-letter
      if (displayText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentTarget.slice(0, displayText.length - 1));
        }, 40);
      } else {
        // Completely cleared: switch to next text and start typing
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % ROTATING_TEXTS.length);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, isDeleting, currentTarget]);

  return (
    <div className="w-full flex items-center select-none py-2">
      <h1 className="font-mono text-[clamp(1.35rem,4.5vw,4.75rem)] font-black tracking-tight text-white flex items-center whitespace-nowrap drop-shadow-[0_0_35px_rgba(34,211,160,0.35)]">
        <span className="bg-gradient-to-r from-white via-[#E0E2EC] to-[#50F0BB] bg-clip-text text-transparent">
          {displayText}
        </span>
        <span
          aria-hidden="true"
          className="inline-block w-[0.25em] h-[0.82em] bg-[#22D3A0] ml-2 shrink-0 animate-pulse shadow-[0_0_15px_#22D3A0] align-middle"
        />
      </h1>
    </div>
  );
}
