import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("a new student can register and is redirected to login", async ({ page }) => {
    const uniqueSuffix = Date.now();

    await page.goto("/register");
    await page.getByLabel("First Name").fill("E2E");
    await page.getByLabel("Last Name").fill("Student");
    await page.getByLabel("Email").fill(`e2e.student.${uniqueSuffix}@trackly.edu`);
    await page.getByLabel("Student ID").fill(`E2E${uniqueSuffix}`);
    await page.getByLabel("Grade Level").fill("Grade 11");
    await page.getByLabel("Section").fill("STEM A");
    await page.getByLabel("Password", { exact: true }).fill("Password!123");
    await page.getByLabel("Confirm Password").fill("Password!123");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page).toHaveURL(/\/login/);
  });

  test("a seeded teacher can log in and reach the teacher dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("teacher1@trackly.edu");
    await page.getByLabel("Password").fill("Password!123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page).toHaveURL(/\/teacher\/dashboard/);
    await expect(page.getByText("Teacher Dashboard")).toBeVisible();
  });

  test("an invalid login shows an error and stays on the login page", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("teacher1@trackly.edu");
    await page.getByLabel("Password").fill("WrongPassword!1");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
