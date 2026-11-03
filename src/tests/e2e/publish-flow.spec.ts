import { test, expect } from "@playwright/test";

test.describe("Critical Flow 1: Writeup Publishing Flow", () => {
  const testId = Date.now();
  const username = `author_${testId}`;
  const email = `author_${testId}@writeuphub.io`;
  const password = "P@ssword123!";
  const writeupTitle = `Kernel Exploitation Modern Techniques ${testId}`;

  test("should register, access studio editor, write markdown, and publish public writeup", async ({
    page,
  }) => {
    // 1. Navigate to register page
    await page.goto("/register");
    await expect(page).toHaveTitle(/Create Author Account/);

    // 2. Fill registration form
    await page.fill('input[placeholder="cyber_phoenix"]', username);
    await page.fill('input[placeholder="author@writeuphub.io"]', email);
    await page.fill('input[type="password"]', password);

    // 3. Submit registration
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or write page
    await page.waitForURL(/\/(dashboard|write)/, { timeout: 15000 });

    // 4. Navigate to editor Studio
    await page.goto("/write");
    await page.waitForSelector('input[placeholder="Writeup Title..."]', {
      timeout: 10000,
    });

    // 5. Enter writeup title
    const titleInput = page.locator('input[placeholder="Writeup Title..."]');
    await titleInput.fill(writeupTitle);

    // 6. Enter rich markdown in editor textarea
    const markdownEditor = page.locator("textarea").first();
    const testMarkdown = [
      "# Challenge Overview",
      "During this CTF challenge, we analyze a binary vulnerability in the custom kernel module.",
      "",
      ":::callout[tip]",
      "Ensure SMEP and SMAP are properly accounted for when formulating the ROP payload.",
      ":::",
      "",
      "## Disassembly and Proof of Concept",
      "```c",
      '#include <stdio.h>',
      'int main() {',
      '    printf("Exploiting kernel vulnerability\\n");',
      '    return 0;',
      '}',
      "```",
      "",
      ":::flag",
      "CTF{k3rn3l_r0p_ch41n_m4st3r}",
      ":::",
    ].join("\n");

    await markdownEditor.fill(testMarkdown);

    // 7. Verify live preview tab or preview pane
    // If preview tab exists, click to verify preview renders
    const previewTab = page.locator('button:has-text("Preview")');
    if (await previewTab.isVisible()) {
      await previewTab.click();
      await expect(
        page.locator("h1:has-text('Challenge Overview')")
      ).toBeVisible();
      await expect(page.locator(".ctf-callout")).toBeVisible();
    }

    // 8. Open Publish Modal
    const publishButton = page.locator('button:has-text("Publish")');
    await publishButton.click();

    // 9. Verify Publish Modal opens
    const modal = page.locator("div[role='dialog']");
    await expect(modal).toBeVisible();

    // Fill CTF competition details in modal
    const ctfNameInput = modal.locator('input[placeholder*="DEF CON"], input[value*="CTF"]');
    if (await ctfNameInput.isVisible()) {
      await ctfNameInput.fill("DEF CON CTF 33");
    }

    // Confirm publication
    const confirmButton = modal.locator('button:has-text("Confirm & Publish Writeup")');
    await confirmButton.click();

    // 10. Wait for publication success view in modal
    await expect(
      modal.locator('text="Writeup Successfully Published!"')
    ).toBeVisible({ timeout: 15000 });

    // 11. Navigate to published writeup
    const viewButton = modal.locator('a:has-text("View Published Writeup")');
    await viewButton.click();

    // 12. Verify public reader page renders with zero errors
    await page.waitForURL(new RegExp(`/w/${username}/`), { timeout: 15000 });

    // Verify title and author presence
    await expect(page.locator(`text=${writeupTitle}`)).toBeVisible();
    await expect(page.locator(`text=@${username}`)).toBeVisible();

    // Verify markdown rendered properly
    await expect(
      page.locator("h1:has-text('Challenge Overview')")
    ).toBeVisible();
    await expect(
      page.locator("h2:has-text('Disassembly and Proof of Concept')")
    ).toBeVisible();

    // Verify CTF callout and code block
    await expect(page.locator(".ctf-callout")).toBeVisible();
    await expect(page.locator(".shiki, pre code")).toBeVisible();

    // Verify flag spoiler box interaction
    const flagBox = page.locator(".flag-spoiler-box, details");
    if (await flagBox.isVisible()) {
      await flagBox.click();
      await expect(
        page.locator("text=CTF{k3rn3l_r0p_ch41n_m4st3r}")
      ).toBeVisible();
    }
  });
});
