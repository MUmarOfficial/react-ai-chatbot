import { test, expect } from "@playwright/test";

test.describe("Model Selector", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should switch AI models", async ({ page }) => {
    const selectorBtn = page.getByTestId("model-selector-btn");

    await selectorBtn.click();
    await expect(page.getByTestId("model-dropdown")).toBeVisible();

    const targetModel = "Gemini 2.5";
    const modelOption = page.getByTestId(`model-option-${targetModel}`);

    await modelOption.click();

    await expect(page.getByTestId("model-dropdown")).toBeHidden();

    await expect(selectorBtn).toHaveText(targetModel);
  });
});
