import { test, expect } from "@playwright/test";

test.describe("Chat Interaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should send a message and clear input", async ({ page }) => {
    const messageText = "Hello AI, how are you?";

    const input = page.getByTestId("chat-input");
    const sendBtn = page.getByTestId("send-btn");

    await input.fill(messageText);

    await expect(sendBtn).toBeEnabled();

    await sendBtn.click();

    await expect(input).toHaveValue("");

    await expect(page.getByTestId("hero-section")).toBeHidden();

    const userMessage = page.getByTestId("chat-row-user").first();
    await expect(userMessage).toBeVisible();
    await expect(userMessage).toContainText(messageText);

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

    await input.fill("");
    await expect(sendBtn).toBeDisabled();

    await input.fill("   ");
    await expect(sendBtn).toBeDisabled();
  });
});
