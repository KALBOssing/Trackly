import { test, expect } from "@playwright/test";

test.describe("Assignments", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("teacher1@trackly.edu");
    await page.getByLabel("Password").fill("Password!123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/teacher\/dashboard/);
  });

  test("teacher can save an assignment as a draft", async ({ page }) => {
    const uniqueTitle = `E2E Test Assignment ${Date.now()}`;

    await page.goto("/assignments/new");
    await page.getByLabel("Title").fill(uniqueTitle);
    await page.getByLabel("Short Description").fill("An assignment created by an e2e test.");

    // Pathway and class are shadcn Selects — open each and pick the first option.
    await page.getByText("Select a pathway").click();
    await page.getByRole("option").first().click();
    await page.getByText("Select a class").click();
    await page.getByRole("option").first().click();

    await page.getByLabel("Due Date").fill("2027-01-01T09:00");
    await page.getByRole("button", { name: "Save as Draft" }).click();

    await expect(page).toHaveURL(/\/assignments\/[a-zA-Z0-9]+$/);
    await expect(page.getByText(uniqueTitle)).toBeVisible();
  });
});
