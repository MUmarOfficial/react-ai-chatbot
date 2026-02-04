import { test, expect } from "@playwright/test";

test.describe("UI Controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should toggle dark/light mode", async ({ page }) => {
    const toggleBtn = page.getByTestId("theme-toggle-btn");
    const html = page.locator("html");

    const initialClass = (await html.getAttribute("class")) || "";

    await toggleBtn.click();

    await page.waitForTimeout(100);
    const newClass = (await html.getAttribute("class")) || "";

    expect(newClass).not.toBe(initialClass);

    await toggleBtn.click();
    await page.waitForTimeout(100);
    const finalClass = (await html.getAttribute("class")) || "";
    expect(finalClass).toBe(initialClass);
  });

  test("should open model selector dropdown", async ({ page }) => {
    const modelBtn = page.getByTestId("model-selector-btn");
    await modelBtn.click();

    const dropdown = page.getByTestId("model-dropdown");
    await expect(dropdown).toBeVisible();

    const option = page.getByTestId(/model-option-.*/).first();
    await expect(option).toBeVisible();

    await option.click();
    await expect(dropdown).toBeHidden();
  });
});
