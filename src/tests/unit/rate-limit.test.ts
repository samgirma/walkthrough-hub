import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests below the limit", () => {
    const key = `test-key-${Math.random()}`;
    const result1 = checkRateLimit(key, 5, 10000);
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(4);

    const result2 = checkRateLimit(key, 5, 10000);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(3);
  });

  it("blocks requests that exceed the limit", () => {
    const key = `test-blocked-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, 3, 10000);
    }
    const blocked = checkRateLimit(key, 3, 10000);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.reset).toBeGreaterThan(0);
  });
});
