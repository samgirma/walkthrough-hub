/**
 * Calculate estimated reading time for markdown documents.
 * Standard adult reading speed is ~200-220 words per minute.
 * Code blocks are weighted slightly longer to account for comprehension.
 */
export function calculateReadingTime(contentMd: string): number {
  if (!contentMd || typeof contentMd !== "string") {
    return 1;
  }

  // Count words outside code blocks
  const plainText = contentMd.replace(/```[\s\S]*?```/g, "");
  const words = plainText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Count code blocks lines
  const codeBlocks = contentMd.match(/```[\s\S]*?```/g) || [];
  let codeLines = 0;
  for (const block of codeBlocks) {
    codeLines += block.split("\n").length;
  }

  // Standard words + code lines equivalent (1 code line ~ 5 words read time)
  const effectiveWords = words + codeLines * 5;
  const minutes = Math.ceil(effectiveWords / 200);

  return Math.max(1, minutes);
}
