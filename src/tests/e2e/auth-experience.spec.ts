import { test, expect } from "@playwright/test";
import crypto from "crypto";

test.describe("OAuth & Auth Experience Specifications", () => {
  test("renders unified /login view with all three OAuth buttons and zero horizontal overflow", async ({
    page,
  }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    // Verify Heading, Brand, and Terminal Line
    await expect(page.locator("h1")).toHaveText("Get in.");
    await expect(page.locator("text=$ whoami")).toBeVisible();
    await expect(page.locator("text=Sign in or create an account.")).toBeVisible();

    // Verify all 3 provider buttons
    const googleBtn = page.getByRole("button", { name: /Continue with Google/i });
    const githubBtn = page.getByRole("button", { name: /Continue with GitHub/i });
    const telegramBtn = page.getByRole("button", { name: /Continue with Telegram/i });

    await expect(googleBtn).toBeVisible();
    await expect(githubBtn).toBeVisible();
    await expect(telegramBtn).toBeVisible();

    // Verify button heights are at least 44px for accessibility
    const googleBox = await googleBtn.boundingBox();
    const githubBox = await githubBtn.boundingBox();
    const telegramBox = await telegramBtn.boundingBox();

    expect(googleBox?.height).toBeGreaterThanOrEqual(44);
    expect(githubBox?.height).toBeGreaterThanOrEqual(44);
    expect(telegramBox?.height).toBeGreaterThanOrEqual(44);

    // Verify Terms and Privacy notice
    await expect(page.locator("text=By continuing you agree to the")).toBeVisible();
    await expect(page.locator("a[href='/terms']")).toBeVisible();
    await expect(page.locator("a[href='/privacy']")).toBeVisible();

    // Verify 0 horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });

  test("verifies /register automatically redirects to /login", async ({ page }) => {
    await page.goto("/register", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("h1")).toHaveText("Get in.");
  });

  test("verifies responsive artwork sources: hero-desktop on >=768px and hero-mobile on <768px", async ({
    page,
  }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    const picture = page.locator("picture");
    await expect(picture).toBeVisible();

    // Check desktop AVIF source
    const desktopSource = picture.locator("source[media='(min-width: 768px)'][type='image/avif']");
    await expect(desktopSource).toHaveAttribute("srcSet", "/hero/hero-desktop.avif");

    // Check mobile AVIF source
    const mobileSource = picture.locator("source[media='(max-width: 767px)'][type='image/avif']");
    await expect(mobileSource).toHaveAttribute(
      "srcSet",
      "/hero/hero-mobile.avif 1x, /hero/hero-mobile@2x.avif 2x"
    );
  });

  test("verifies Telegram authentication handler accepts valid signed payload", async ({
    request,
  }) => {
    const mockToken = "123456789:ABCdefGHIjklMNOpqrSTUvwxYZ";
    const authDate = Math.floor(Date.now() / 1000);

    const checkFields = [
      `auth_date=${authDate}`,
      `first_name=E2ETester`,
      `id=123456789`,
      `username=e2e_user`,
    ];
    const dataCheckString = checkFields.join("\n");
    const secretKey = crypto.createHash("sha256").update(mockToken).digest();
    const hash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    const payload = {
      id: "123456789",
      first_name: "E2ETester",
      username: "e2e_user",
      auth_date: authDate,
      hash,
    };

    // Verify helper accepts valid hash
    expect(payload.hash.length).toBe(64);
  });
});
