import { describe, it, expect } from "vitest";
import { calculateReadingTime } from "@/lib/reading-time";

describe("calculateReadingTime", () => {
  it("returns at least 1 minute for empty or short content", () => {
    expect(calculateReadingTime("")).toBe(1);
    expect(calculateReadingTime("Short writeup snippet")).toBe(1);
  });

  it("calculates reading time based on ~200 WPM", () => {
    // Generate 400 words
    const content = Array(400).fill("exploit").join(" ");
    expect(calculateReadingTime(content)).toBe(2);
  });

  it("weights code block lines appropriately", () => {
    const codeBlock20 = "```c\n" + Array(20).fill('printf("pwn");').join("\n") + "\n```";
    expect(calculateReadingTime(codeBlock20)).toBe(1);

    const codeBlock40 = "```c\n" + Array(40).fill('printf("pwn");').join("\n") + "\n```";
    expect(calculateReadingTime(codeBlock40)).toBe(2);
  });
});
