import { test, expect } from "@playwright/test";

test.describe("Classes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("teacher1@trackly.edu");
    await page.getByLabel("Password").fill("Password!123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/teacher\/dashboard/);
  });

  test("teacher can create a new class", async ({ page }) => {
    const uniqueName = `E2E Test Class ${Date.now()}`;

    await page.goto("/classes");
    await page.getByRole("button", { name: "New Class" }).click();
    await page.getByLabel("Class Name").fill(uniqueName);
    await page.getByLabel("Grade Level").fill("Grade 12");
    await page.getByLabel("Section").fill("E2E");
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page.getByText(uniqueName)).toBeVisible();
  });
});
