import { test, expect } from "@playwright/test";

test.describe("App Layout & Theme", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should verify basic layout elements on desktop", async ({ page }) => {
    await expect(page).toHaveTitle(/React AI Chatbot/);

    await expect(page.getByTestId("hero-section")).toBeVisible();
    await expect(page.getByText("Ask something challenging")).toBeVisible();

    await expect(page.getByTestId("chat-input")).toBeVisible();
    await expect(page.getByTestId("send-btn")).toBeVisible();

    await expect(page.getByTestId("header-logo-group")).toBeVisible();
  });

  test("should toggle theme between light and dark", async ({ page }) => {
    const html = page.locator("html");
    const toggleBtn = page.getByTestId("theme-toggle-btn");

    const initialTheme = await html.getAttribute("class");

    await toggleBtn.click();

    await expect(html).not.toHaveClass(initialTheme || "");

    await toggleBtn.click();
    await expect(html).toHaveClass(initialTheme || "");
  });

  test("should handle mobile specific layout", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.getByTestId("header-logo-group")).toBeHidden();

    await expect(page.getByTestId("mobile-menu-btn")).toBeVisible();
  });
});
