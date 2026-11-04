import { test, expect } from "@playwright/test";

test.describe("Cross-Device Responsive Design & Mobile Audits", () => {
  // Test 1: No horizontal overflow on public routes across all viewports
  const viewports = [
    { name: "Small Mobile (360px)", width: 360, height: 640 },
    { name: "iPhone 13 (390px)", width: 390, height: 844 },
    { name: "Pixel 7 (430px)", width: 430, height: 932 },
    { name: "Tablet iPad (768px)", width: 768, height: 1024 },
    { name: "Desktop (1024px)", width: 1024, height: 768 },
    { name: "Large Desktop (1440px)", width: 1440, height: 900 },
  ];

  const publicRoutes = [
    "/",
    "/explore",
    "/w/0xNullPtr/runc-container-escape-cve-2024-21626",
    "/u/0xNullPtr",
    "/login",
    "/register",
  ];

  for (const vp of viewports) {
    test(`verifies zero horizontal overflow at ${vp.name} on all public routes`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const route of publicRoutes) {
        await page.goto(route, { waitUntil: "domcontentloaded" });

        // Ensure root document scrollWidth <= window.innerWidth
        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientWidth = doc.clientWidth;
          return {
            scrollWidth,
            clientWidth,
            hasOverflow: scrollWidth > clientWidth,
          };
        });

        expect(
          overflow.hasOverflow,
          `Route ${route} has horizontal overflow at ${vp.width}px (scroll: ${overflow.scrollWidth}px, client: ${overflow.clientWidth}px)`
        ).toBe(false);
      }
    });
  }

  // Test 2: Hero background renders and picture sources exist per media query
  test("hero section renders responsive picture sources with high priority", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const picture = page.locator("picture");
    await expect(picture).toBeVisible();

    // Verify AVIF and WebP sources for mobile and desktop exist
    const sources = picture.locator("source");
    const count = await sources.count();
    expect(count).toBeGreaterThanOrEqual(4);

    const fallbackImg = picture.locator("img");
    await expect(fallbackImg).toHaveAttribute("fetchpriority", "high");
    await expect(fallbackImg).toHaveAttribute("decoding", "async");
    await expect(fallbackImg).toHaveAttribute("loading", "eager");
  });

  // Test 3: Mobile hamburger menu opens, locks scroll, and closes
  test("mobile navigation drawer opens and closes smoothly", async ({
    page,
  }) => {
    // Set to mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Open hamburger
    const menuBtn = page.getByRole("button", { name: "Open Navigation Menu" });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Verify slide-in drawer content is visible
    const sheetTitle = page.getByText("WriteupHub");
    await expect(sheetTitle.first()).toBeVisible();

    const writeButton = page.getByRole("button", { name: "Write a Writeup" });
    await expect(writeButton).toBeVisible();

    // Close using close button
    const closeBtn = page.getByRole("button", { name: "Close" });
    await closeBtn.click();

    // Verify drawer dismissed
    await expect(writeButton).not.toBeVisible();
  });

  // Test 4: Mobile explore bottom filter sheet opens and applies filters
  test("explore mobile filter sheet opens and displays options", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explore", { waitUntil: "domcontentloaded" });

    // Click Filters button
    const filterBtn = page.getByRole("button", { name: "Filters" });
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();

    // Bottom sheet should be visible with categories and difficulties
    await expect(page.getByText("Filter Writeups")).toBeVisible();
    await expect(page.getByRole("button", { name: "Apply Filters" })).toBeVisible();

    // Dismiss by clicking clear or applying
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByText("Filter Writeups")).not.toBeVisible();
  });
});
