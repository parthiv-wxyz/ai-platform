import { expect, test } from "@playwright/test";

test("renders the AI Council application shell", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Build a better answer" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open workspace" }),
  ).toBeVisible();
});
