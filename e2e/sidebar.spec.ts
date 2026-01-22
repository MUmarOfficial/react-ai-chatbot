import { test, expect } from "@playwright/test";

test.describe("Sidebar & Session Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should create a new chat session", async ({ page }) => {
    // Send a message first to establish the current session
    await page.getByTestId("chat-input").fill("Session 1");
    await page.getByTestId("send-btn").click();
    await expect(page.getByTestId("chat-row-user")).toContainText("Session 1");

    // Click New Chat button in sidebar
    await page.getByTestId("new-chat-btn").click();

    // Verify UI resets to Hero screen
    await expect(page.getByTestId("hero-section")).toBeVisible();
    await expect(page.getByTestId("message-list")).toBeHidden();

    // Check sidebar list has items (There should be the previous "Session 1" chat)
    // Note: The title generation might be async or default to "New Chat" depending on your logic
    // Your code updates title based on first message
    await expect(page.getByTestId("session-list")).toBeVisible();
  });

  test("should delete a chat session", async ({ page }) => {
    // 1. Create a session
    await page.getByTestId("chat-input").fill("To be deleted");
    await page.getByTestId("send-btn").click();

    // Wait for sidebar item to appear (it might need a reload or state update if not immediate)
    // Your context updates locally immediately, so it should be there.
    // However, we need to find the specific delete button.

    // We need to handle the window.confirm dialog
    page.on("dialog", (dialog) => dialog.accept());

    // Locate the specific delete button.
    // Since we just created it, it's likely the first one in "Today"
    // Finding the delete button inside the group
    const deleteBtn = page
      .locator('button[data-testid^="delete-chat-"]')
      .first();

    // Hover over the session item to make delete button visible (if CSS relies on group-hover)
    // Playwright can force click, but let's hover the parent first
    const sessionItem = page
      .locator('button[data-testid^="session-item-"]')
      .first();
    await sessionItem.hover();

    await deleteBtn.click();

    // Verify the session is gone.
    // Since we started fresh and created one, list might be empty now.
    await expect(sessionItem).toBeHidden();

    // Should return to empty state / new chat
    await expect(page.getByTestId("hero-section")).toBeVisible();
  });
});
