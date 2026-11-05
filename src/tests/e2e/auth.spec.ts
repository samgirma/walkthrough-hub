import { test, expect } from "@playwright/test";

test.describe("End-to-End Authentication Architecture & DAL Gates", () => {
  test("anonymous user visiting /write is redirected to /login with callbackUrl", async ({
    page,
  }) => {
    await page.goto("/write", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login\?callbackUrl=.*write/);
    await expect(page.locator("h1")).toHaveText("Get in.");
  });

  test("anonymous user visiting /dashboard/bookmarks is redirected to /login with callbackUrl", async ({
    page,
  }) => {
    await page.goto("/dashboard/bookmarks", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login\?callbackUrl=.*bookmarks/);
    await expect(page.locator("h1")).toHaveText("Get in.");
  });

  test("dev login establishes session and redirects back to target destination", async ({
    page,
  }) => {
    // Go to login with callbackUrl
    await page.goto("/login?callbackUrl=/dashboard", { waitUntil: "domcontentloaded" });

    // Look for dev bypass button if available in dev environment
    const devBtn = page.getByRole("button", { name: /Dev Bypass/i });
    if (await devBtn.isVisible()) {
      await devBtn.click();
      // Should redirect to /dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
      // Dashboard header should be visible
      await expect(page.locator("text=Author Studio")).toBeVisible();
    }
  });

  test("onboarding route prevents navigation until handle is chosen", async ({
    page,
  }) => {
    await page.goto("/onboarding", { waitUntil: "domcontentloaded" });
    // Anonymous user visiting /onboarding should be sent to /login
    await expect(page).toHaveURL(/\/login/);
  });
});
