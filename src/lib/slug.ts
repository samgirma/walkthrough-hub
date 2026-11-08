/**
 * Convert arbitrary titles into URL-safe, clean slugs.
 * Removes symbols, lowercases, replaces spaces with hyphens, and truncates.
 */
export function generateSlug(title: string): string {
  if (!title || typeof title !== "string") {
    return `writeup-${Math.random().toString(36).substring(2, 8)}`;
  }

  const cleaned = title
    .toLowerCase()
    .trim()
    // Replace accents/diacritics
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Replace non-alphanumeric chars (except hyphens and underscores)
    .replace(/[^a-z0-9\s-_]/g, "")
    // Replace whitespace and underscores with a single hyphen
    .replace(/[\s_]+/g, "-")
    // Replace multiple consecutive hyphens with one
    .replace(/-+/g, "-")
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, "");

  if (!cleaned) {
    return `writeup-${Math.random().toString(36).substring(2, 8)}`;
  }

  // Max 60 characters for clean URLs
  return cleaned.substring(0, 60).replace(/-+$/, "");
}
