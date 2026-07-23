import { expect, test } from "@playwright/test";

test("learner can switch depth, step an animation, answer, and continue", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-hydrated="true"]').waitFor();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("What is actually");
  await page.getByRole("button", { name: "Expert" }).click();
  await expect(page.getByText("Expert layer")).toBeVisible();
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByText(/Step 2 of/)).toBeVisible();
  await page.getByRole("button", { name: /The weights/ }).click();
  await expect(page.getByText(/That’s it\./)).toBeVisible();
  await page.getByRole("button", { name: "Complete & continue" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("How weights learn");
});

test("mobile layout does not create document-level horizontal overflow", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-hydrated="true"]').waitFor();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
});
