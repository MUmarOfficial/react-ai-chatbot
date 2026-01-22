import { test, expect } from "@playwright/test";

test.describe("Chat Interaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should send a message and clear input", async ({ page }) => {
    const messageText = "Hello AI, how are you?";

    // Locate elements
    const input = page.getByTestId("chat-input");
    const sendBtn = page.getByTestId("send-btn");

    // Type message
    await input.fill(messageText);

    // Button should be active
    await expect(sendBtn).toBeEnabled();

    // Send message
    await sendBtn.click();

    // 1. Check Input is cleared
    await expect(input).toHaveValue("");

    // 2. Hero section should disappear
    await expect(page.getByTestId("hero-section")).toBeHidden();

    // 3. User message should appear in the list
    const userMessage = page.getByTestId("chat-row-user").first();
    await expect(userMessage).toBeVisible();
    await expect(userMessage).toContainText(messageText);

    // 4. Typing indicator should appear (assuming API takes at least a few ms)
    // Note: If API fails instantly due to missing keys, this might flash too fast,
    // but in a normal flow it should be visible.
    await expect(page.getByTestId("typing-indicator")).toBeVisible();
  });

  test("should submit message on Enter key", async ({ page }) => {
    const input = page.getByTestId("chat-input");
    await input.fill("Testing Enter key");
    await input.press("Enter");

    await expect(page.getByTestId("chat-row-user")).toContainText(
      "Testing Enter key",
    );
    await expect(input).toHaveValue("");
  });

  test("should not send empty messages", async ({ page }) => {
    const sendBtn = page.getByTestId("send-btn");
    const input = page.getByTestId("chat-input");

    // Empty input
    await input.fill("");
    await expect(sendBtn).toBeDisabled();

    // Whitespace only
    await input.fill("   ");
    await expect(sendBtn).toBeDisabled();
  });
});
