import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 375, height: 667 } });

test.describe("Mobile Responsiveness", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have sidebar hidden by default on mobile", async ({ page }) => {
    const overlay = page.getByTestId("sidebar-overlay");
    await expect(overlay).not.toBeVisible();
  });

  test("should open and close sidebar", async ({ page }) => {
    const menuBtn = page.getByTestId("mobile-menu-btn");
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    const overlay = page.getByTestId("sidebar-overlay");
    await expect(overlay).toBeVisible();

    const closeBtn = page.getByTestId("sidebar-close-btn");
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(overlay).not.toBeVisible();

    await menuBtn.click();
    await expect(overlay).toBeVisible();
    await overlay.click({ position: { x: 300, y: 300 } });
    await expect(overlay).not.toBeVisible();
  });
});
