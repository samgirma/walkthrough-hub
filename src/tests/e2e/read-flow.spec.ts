import { test, expect } from "@playwright/test";

test.describe("Critical Flow 2: Zero-Auth Reading Flow & Public Access", () => {
  // Ensure completely clean context (no authentication cookies/session)
  test.use({ storageState: { cookies: [], origins: [] } });

  test("unauthenticated user can view home, browse explore, and read public writeups without login", async ({
    page,
  }) => {
    // 1. Visit Home Page without auth
    await page.goto("/");
    await expect(page).toHaveTitle(/WriteupHub/);

    // Verify hero components and telemetry
    await expect(page.locator("text=WRITEUPHUB")).toBeVisible();
    await expect(
      page.locator("text=Production-grade CTF writeups")
    ).toBeVisible();

    // Verify presence of explore and start reading buttons
    const exploreLink = page.locator('a[href="/explore"]').first();
    await expect(exploreLink).toBeVisible();

    // 2. Navigate to Explore Page
    await exploreLink.click();
    await page.waitForURL("/explore");
    await expect(page).toHaveTitle(/Explore CTF Writeups/);

    // Verify category filters exist
    await expect(page.locator("button:has-text('All')")).toBeVisible();
    await expect(page.locator("button:has-text('PWN')")).toBeVisible();
    await expect(page.locator("button:has-text('WEB')")).toBeVisible();

    // Verify search input
    const searchInput = page.locator('input[placeholder*="Search by title"]');
    await expect(searchInput).toBeVisible();

    // 3. Open a public writeup directly via URL (Zero-auth read)
    // We use the seeded public writeup: /w/cyberphoenix/heap-exploitation-glibc-2-35-fastbin-dup
    await page.goto("/w/cyberphoenix/heap-exploitation-glibc-2-35-fastbin-dup");

    // Expect page to load without redirecting to login
    await expect(page).toHaveURL(
      "/w/cyberphoenix/heap-exploitation-glibc-2-35-fastbin-dup"
    );

    // Verify writeup metadata header
    await expect(
      page.locator("text=GLIBC 2.35 Fastbin Dup Arbitrary Write")
    ).toBeVisible();
    await expect(page.locator("text=@cyberphoenix")).toBeVisible();
    await expect(page.locator("text=PWN")).toBeVisible();
    await expect(page.locator("text=HARD")).toBeVisible();

    // Verify Table of Contents is rendered
    const toc = page.locator("nav, [aria-label='Table of contents']");
    await expect(toc.first()).toBeVisible();

    // Verify code block rendered with Shiki syntax highlighting and copy button
    const copyButton = page.locator('button:has-text("Copy")').first();
    await expect(copyButton).toBeVisible();
    await copyButton.click();
    await expect(
      page.locator('button:has-text("Copied!"), button:has-text("Copy")')
    ).toBeVisible();

    // 4. Verify SEO feeds are accessible without auth
    const sitemapRes = await page.request.get("/sitemap.xml");
    expect(sitemapRes.status()).toBe(200);
    const sitemapXml = await sitemapRes.text();
    expect(sitemapXml).toContain("/w/cyberphoenix/heap-exploitation-glibc-2-35-fastbin-dup");

    const robotsRes = await page.request.get("/robots.txt");
    expect(robotsRes.status()).toBe(200);

    const rssRes = await page.request.get("/feed.xml");
    expect(rssRes.status()).toBe(200);
    const rssXml = await rssRes.text();
    expect(rssXml).toContain("GLIBC 2.35 Fastbin Dup Arbitrary Write");
  });

  test("unlisted writeups are accessible via direct link with noindex but excluded from feeds", async ({
    page,
  }) => {
    // Visit seeded unlisted writeup
    const unlistedResponse = await page.goto(
      "/w/cyberphoenix/zero-day-unlisted-reconnaissance-notes"
    );
    expect(unlistedResponse?.status()).toBe(200);

    // Verify noindex meta tag is present in HTML head
    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveAttribute("content", /noindex/);

    // Verify unlisted writeup is NOT in sitemap.xml
    const sitemapRes = await page.request.get("/sitemap.xml");
    const sitemapXml = await sitemapRes.text();
    expect(sitemapXml).not.toContain(
      "zero-day-unlisted-reconnaissance-notes"
    );

    // Verify unlisted writeup is NOT in RSS feed.xml
    const feedRes = await page.request.get("/feed.xml");
    const feedXml = await feedRes.text();
    expect(feedXml).not.toContain(
      "zero-day-unlisted-reconnaissance-notes"
    );
  });
});
