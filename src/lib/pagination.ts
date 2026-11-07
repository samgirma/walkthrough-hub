export type PageItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * Calculates a windowed array of page numbers with ellipsis gaps
 * for desktop pagination controls.
 *
 * Guaranteed to return at most 7 items:
 * - When totalPages <= 7: returns [1, 2, ..., totalPages]
 * - When currentPage <= 4: returns [1, 2, 3, 4, 5, 'ellipsis-end', totalPages]
 * - When currentPage >= totalPages - 3: returns [1, 'ellipsis-start', totalPages - 4, ..., totalPages]
 * - When in middle: returns [1, 'ellipsis-start', cur - 1, cur, cur + 1, 'ellipsis-end', totalPages]
 */
export function getPageNumbers(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 1) {
    return [1];
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // When near the start: [1, 2, 3, 4, 5, '...', totalPages]
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-end", totalPages];
  }

  // When near the end: [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-start",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // When in the middle: [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
  return [
    1,
    "ellipsis-start",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-end",
    totalPages,
  ];
}
