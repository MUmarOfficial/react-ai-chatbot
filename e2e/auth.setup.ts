import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/");

  const modal = page.locator('dialog[aria-labelledby="modal-title"]');
  await expect(modal).toBeVisible();

  await page.locator("button").filter({ hasText: "Yes, save chats" }).click();

  await expect(modal).toBeHidden();

  await page.context().storageState({ path: authFile });
});
