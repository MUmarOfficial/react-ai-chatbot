import { test, expect } from "@playwright/test";

test("sanity check", async ({ page }) => {
  console.log("Navigating to home...");
  await page.goto("/");
  console.log("Navigated. Checking title...");
  await expect(page).toHaveTitle(/React AI Chatbot/i);
  console.log("Title checked.");
});
