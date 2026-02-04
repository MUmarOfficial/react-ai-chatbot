import { test, expect } from "@playwright/test";

test.describe("Chat Flow", () => {
  test("should send a message and receive a mocked response", async ({
    page,
  }) => {
    await page.route("/api/chat", async (route) => {
      const json = {
        id: "mock-response-id",
        content: "I am a mocked AI response.",
        role: "assistant",
      };
      await route.fulfill({ json });
    });

    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 200,
        body: "I am a mocked AI response.",
      });
    });

    await page.goto("/");

    const input = page.getByTestId("chat-input");
    await expect(input).toBeVisible();
    await input.fill("Hello AI");

    const sendBtn = page.getByTestId("send-btn");
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();

    const messageList = page.getByTestId("message-list");
    await expect(messageList).toContainText("Hello AI");
  });
});
