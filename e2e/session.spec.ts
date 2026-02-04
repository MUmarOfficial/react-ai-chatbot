import { test, expect } from "@playwright/test";

test.describe("Session Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should create a new chat", async ({ page }) => {
    await page.getByTestId("new-chat-btn").click();

    const sessionList = page.getByTestId("session-list");
    await expect(sessionList).toBeVisible();
  });

  test("should switch between chats", async ({ page }) => {
    await page.getByTestId("new-chat-btn").click();
    await page.waitForTimeout(500);
    await page.getByTestId("new-chat-btn").click();

    const request = page.getByTestId(/session-item-.*/);
    const count = await request.count();

    if (count >= 2) {
      const firstSession = request.nth(0);
      const secondSession = request.nth(1);

      await secondSession.click();
      await expect(secondSession).toHaveClass(/itemActive/);
      await expect(firstSession).not.toHaveClass(/itemActive/);
    }
  });

  test("should delete a chat", async ({ page }) => {
    page.on("dialog", (dialog) => dialog.accept());

    await page.getByTestId("new-chat-btn").click();

    const sessionItem = page.getByTestId(/session-item-.*/).first();
    await sessionItem.hover();

    const deleteBtn = page.getByTestId(/delete-chat-.*/).first();
    await deleteBtn.click();
  });
});
