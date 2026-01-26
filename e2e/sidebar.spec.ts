import { test, expect } from "@playwright/test";

test.describe("Sidebar & Session Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should create a new chat session", async ({ page }) => {
    await page.getByTestId("chat-input").fill("Session 1");
    await page.getByTestId("send-btn").click();
    await expect(page.getByTestId("chat-row-user")).toContainText("Session 1");

    await page.getByTestId("new-chat-btn").click();

    await expect(page.getByTestId("hero-section")).toBeVisible();
    await expect(page.getByTestId("message-list")).toBeHidden();

    await expect(page.getByTestId("session-list")).toBeVisible();
  });

  test("should delete a chat session", async ({ page }) => {
    await page.getByTestId("chat-input").fill("To be deleted");
    await page.getByTestId("send-btn").click();

    page.on("dialog", (dialog) => dialog.accept());

    const deleteBtn = page
      .locator('button[data-testid^="delete-chat-"]')
      .first();

    const sessionItem = page
      .locator('button[data-testid^="session-item-"]')
      .first();
    await sessionItem.hover();

    await deleteBtn.click();

    await expect(sessionItem).toBeHidden();

    await expect(page.getByTestId("hero-section")).toBeVisible();
  });
});
