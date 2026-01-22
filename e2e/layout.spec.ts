import { test, expect } from "@playwright/test";

test.describe("App Layout & Theme", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should verify basic layout elements on desktop", async ({ page }) => {
    // Verify Page Title
    await expect(page).toHaveTitle(/React AI Chatbot/);

    // Verify Hero Section (Empty state)
    await expect(page.getByTestId("hero-section")).toBeVisible();
    await expect(page.getByText("Ask something challenging")).toBeVisible();

    // Verify Input Controls
    await expect(page.getByTestId("chat-input")).toBeVisible();
    await expect(page.getByTestId("send-btn")).toBeVisible();

    // Verify Header Logo (Desktop only)
    await expect(page.getByTestId("header-logo-group")).toBeVisible();
  });

  test("should toggle theme between light and dark", async ({ page }) => {
    const html = page.locator("html");
    const toggleBtn = page.getByTestId("theme-toggle-btn");

    // Default might be dark based on your context, let's check current state and toggle
    const initialTheme = await html.getAttribute("class");

    await toggleBtn.click();

    // Wait for class change
    await expect(html).not.toHaveClass(initialTheme || "");

    // Toggle back
    await toggleBtn.click();
    await expect(html).toHaveClass(initialTheme || "");
  });

  test("should handle mobile specific layout", async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Logo group is hidden on mobile in your Header.tsx
    await expect(page.getByTestId("header-logo-group")).toBeHidden();

    // Mobile menu button should be visible
    await expect(page.getByTestId("mobile-menu-btn")).toBeVisible();
  });
});
