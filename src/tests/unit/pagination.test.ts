import { describe, it, expect } from "vitest";
import { getPageNumbers } from "@/lib/pagination";

describe("Pagination Windowing (getPageNumbers)", () => {
  it("handles single page or zero pages gracefully", () => {
    expect(getPageNumbers(1, 1)).toEqual([1]);
    expect(getPageNumbers(1, 0)).toEqual([1]);
  });

  it("returns all page numbers when totalPages <= 7", () => {
    expect(getPageNumbers(1, 3)).toEqual([1, 2, 3]);
    expect(getPageNumbers(2, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageNumbers(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("handles start window when currentPage <= 4 in large totalPages", () => {
    // 101 pages (like our seeded database)
    const p1 = getPageNumbers(1, 101);
    expect(p1).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 101]);
    expect(p1.length).toBe(7);

    const p4 = getPageNumbers(4, 101);
    expect(p4).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 101]);
    expect(p4.length).toBe(7);
  });

  it("handles end window when currentPage >= totalPages - 3 in large totalPages", () => {
    const p98 = getPageNumbers(98, 101);
    expect(p98).toEqual([1, "ellipsis-start", 97, 98, 99, 100, 101]);
    expect(p98.length).toBe(7);

    const p101 = getPageNumbers(101, 101);
    expect(p101).toEqual([1, "ellipsis-start", 97, 98, 99, 100, 101]);
    expect(p101.length).toBe(7);
  });

  it("handles middle window with two ellipsis gaps", () => {
    const p5 = getPageNumbers(5, 101);
    expect(p5).toEqual([1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 101]);
    expect(p5.length).toBe(7);

    const p50 = getPageNumbers(50, 101);
    expect(p50).toEqual([1, "ellipsis-start", 49, 50, 51, "ellipsis-end", 101]);
    expect(p50.length).toBe(7);

    const p97 = getPageNumbers(97, 101);
    expect(p97).toEqual([1, "ellipsis-start", 96, 97, 98, "ellipsis-end", 101]);
    expect(p97.length).toBe(7);
  });

  it("never returns more than 7 items, preserving desktop layout stability", () => {
    for (let total = 1; total <= 120; total++) {
      for (let cur = 1; cur <= total; cur++) {
        const pages = getPageNumbers(cur, total);
        expect(pages.length).toBeLessThanOrEqual(7);
        expect(pages[0]).toBe(1);
        expect(pages[pages.length - 1]).toBe(total === 0 ? 1 : total);
      }
    }
  });
});
