import { test, expect } from "@playwright/test";
import { siteConfig } from "../../config/site";

test.describe("Brand Assets & Global World-Map Background Audits", () => {
  // Test 1: Brand Asset & Manifest Endpoint 200 HTTP Checks
  const assetRoutes = [
    "/favicon.ico",
    "/icon.svg",
    "/apple-icon.png",
    "/manifest.webmanifest",
    "/icon-192.png",
    "/icon-512.png",
    "/icon-maskable-512.png",
    "/brand/logo/logo-horizontal.svg",
    "/brand/logo/logo-horizontal-light.svg",
    "/brand/logo/logo-icon.svg",
    "/brand/logo/logo-stacked.svg",
  ];

  for (const assetPath of assetRoutes) {
    test(`verifies static brand asset ${assetPath} returns HTTP 200`, async ({
      request,
    }) => {
      const response = await request.get(assetPath);
      expect(
        response.status(),
        `Asset ${assetPath} returned HTTP ${response.status()} instead of 200`
      ).toBe(200);
      expect(response.headers()["content-type"]).toBeDefined();
    });
  }

  // Test 2: Web App Manifest verification
  test("verifies webmanifest format and icon declarations", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.name).toBe(siteConfig.name);
    expect(json.short_name).toBe(siteConfig.shortName);
    expect(Array.isArray(json.icons)).toBe(true);
    expect(json.icons.length).toBeGreaterThanOrEqual(2);
  });

  // Test 3: Logo Visibility & Responsive Swap in Navbar
  test("verifies responsive logo swap: icon logo at 390px and horizontal logo at 1440px", async ({
    page,
  }) => {
    // 3A. Mobile Viewport (390px - iPhone 13)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Navbar icon-only logo should be visible
    const mobileLogo = page.locator("header .md\\:hidden img[alt='WriteupHub logo']");
    await expect(mobileLogo).toBeVisible();

    // Horizontal logo container should not be visible on mobile
    const desktopLogoContainer = page.locator("header .hidden.md\\:flex");
    await expect(desktopLogoContainer).toBeHidden();

    // Verify accessible link wrapper
    const logoLink = page.locator("header a[aria-label='WriteupHub home']").first();
    await expect(logoLink).toHaveAttribute("href", "/");

    // 3B. Desktop Viewport (1440px - Laptop)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload({ waitUntil: "domcontentloaded" });

    // Desktop logo container should now be visible
    await expect(desktopLogoContainer).toBeVisible();

    // Mobile icon logo should now be hidden
    const mobileLogoContainer = page.locator("header .flex.md\\:hidden");
    await expect(mobileLogoContainer).toBeHidden();
  });

  // Test 4: Fixed Global Background Layer Mount
  test("verifies SiteBackground fixed layer mounts without layout shifts", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Background container exists and has fixed positioning
    const bgContainer = page.locator("div[aria-hidden='true'].fixed.inset-0.-z-10");
    await expect(bgContainer).toHaveCount(1);

    // World map layer exists with .site-world-bg class
    const worldMapLayer = bgContainer.locator(".site-world-bg");
    await expect(worldMapLayer).toHaveCount(1);
  });

  // Test 5: Zero horizontal overflow on mobile and desktop
  const testWidths = [360, 390, 768, 1024, 1440];
  for (const width of testWidths) {
    test(`verifies zero horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasOverflow).toBe(false);
    });
  }
});
