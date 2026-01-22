import { test, expect } from "@playwright/test";

test.describe("Model Selector", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should switch AI models", async ({ page }) => {
    const selectorBtn = page.getByTestId("model-selector-btn");

    // Open Dropdown
    await selectorBtn.click();
    await expect(page.getByTestId("model-dropdown")).toBeVisible();

    // Select a specific model (e.g., Gemini 2.5)
    // Using the exact string from your ChatContext.tsx
    const targetModel = "Gemini 2.5";
    const modelOption = page.getByTestId(`model-option-${targetModel}`);

    await modelOption.click();

    // Dropdown should close
    await expect(page.getByTestId("model-dropdown")).toBeHidden();

    // Button text should update
    await expect(selectorBtn).toHaveText(targetModel);
  });
});
