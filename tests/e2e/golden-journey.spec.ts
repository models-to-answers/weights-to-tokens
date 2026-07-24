import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-hydrated="true"]').waitFor();
});

test("learner can use canonical content, answer, continue, and reload progress", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("What a model carries");
  await page.getByRole("button", { name: "Expert" }).click();
  await expect(page.getByText("Expert layer")).toBeVisible();
  await page.getByRole("tab", { name: "02 Example 2" }).click();
  await expect(page.getByText(/A GPU hides memory latency/)).toBeVisible();
  await page.getByRole("button", { name: /They are repeatedly read/ }).click();
  await expect(page.getByText("Correct.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Complete & continue" })).toBeDisabled();
  await page.getByRole("button", { name: /It increases the relative separation/ }).click();
  await expect(page.getByRole("button", { name: "Complete & continue" })).toBeEnabled();
  await page.getByRole("button", { name: "Complete & continue" }).click();
  await expect(page).toHaveURL(/\/learn\/training-loop$/);
  await page.reload();
  await page.locator('[data-hydrated="true"]').waitFor();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("How training changes weights");
  await expect(page.getByText("Expert layer")).toBeVisible();
  await expect(page.getByLabel(/complete$/)).toContainText("8%");
  await expect(page.getByLabel(/complete$/)).toContainText("Expert 1/13");
});

test("direct chapter route survives reload and exposes MDX, glossary, and sources", async ({ page }) => {
  await page.goto("/learn/single-gpu-inference");
  await page.locator('[data-hydrated="true"]').waitFor();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Inference on one GPU");
  await expect(page.getByText("Read the prompt, then extend it")).toBeVisible();

  const glossaryTab = page.getByRole("tab", { name: "Glossary (2)" });
  await glossaryTab.click();
  await expect(
    page
      .getByRole("tabpanel", { name: "Glossary (2)" })
      .getByText("KV cache", { exact: true }),
  ).toBeVisible();

  await glossaryTab.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Sources (3)" })).toBeFocused();
  await expect(page.getByRole("link", { name: /Tokenizer API/ })).toBeVisible();

  await page.reload();
  await page.locator('[data-hydrated="true"]').waitFor();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Inference on one GPU");
});

test("rich labs update and persist their canonical stage and inputs", async ({ page }) => {
  const temperature = page.getByRole("slider", { name: /Temperature/ });
  await temperature.fill("1.2");
  await page.getByRole("tab", { name: "02 Example 2" }).click();
  await page.getByRole("button", { name: "Expert" }).click();
  await expect(page.getByRole("tab", { name: "02 Example 2" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("button", { name: "Beginner" }).click();
  await expect(page.getByRole("tab", { name: "02 Example 2" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.reload();
  await page.locator('[data-hydrated="true"]').waitFor();
  await expect(page.getByRole("slider", { name: /Temperature/ })).toHaveValue(
    "1.2",
  );
  await expect(page.getByRole("tab", { name: "02 Example 2" })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await page.goto("/learn/warp-scheduler");
  await page.locator('[data-hydrated="true"]').waitFor();
  await page.getByRole("button", { name: "warp 1 memory" }).click();
  await page.reload();
  await page.locator('[data-hydrated="true"]').waitFor();
  await expect(page.getByText("warp 1 is not eligible")).toBeVisible();
});

test("final replay keeps its stage across system and GPU views and links to a chapter", async ({ page }) => {
  await page.goto("/replay");
  await page.locator('[data-hydrated="true"]').waitFor();
  await expect(page.getByText("Step 1 of 12")).toBeVisible();
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByText("Step 2 of 12")).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark journey complete" })).toBeDisabled();
  await page.getByRole("button", { name: "GPU view" }).click();
  await expect(page.getByText("Step 2 of 12")).toBeVisible();
  await expect(page.getByRole("heading", { name: "One prompt: GPU view" })).toBeVisible();
  await page.getByRole("button", { name: /Open source chapter/ }).click();
  await expect(page).toHaveURL(/\/learn\/model-artifact$/);
});

test("Core and Expert replay completion require the full twelve-stage journey", async ({ page }) => {
  await page.goto("/replay");
  await page.locator('[data-hydrated="true"]').waitFor();
  const complete = page.getByRole("button", { name: "Mark journey complete" });
  await expect(complete).toBeDisabled();
  for (let step = 1; step < 12; step += 1) {
    await page.getByRole("button", { name: "Next step" }).click();
  }
  await expect(complete).toBeEnabled();
  await complete.click();
  await expect(page.getByLabel(/Core 8% complete/)).toContainText("Core 1/13");
  await page.getByRole("button", { name: "Expert" }).click();
  await page.getByRole("button", { name: "Mark journey complete" }).click();
  await expect(page.getByLabel(/Expert 8% complete/)).toContainText("Expert 1/13");
});

test("reset progress is explicit and clears browser-local completion", async ({ page }) => {
  await page.getByRole("button", { name: /They are repeatedly read/ }).click();
  await page.getByRole("button", { name: "Complete & continue" }).click();
  await page.getByRole("button", { name: "Reset local progress" }).click();
  await expect(page.getByRole("group", { name: "Confirm progress reset" })).toBeVisible();
  await page.getByRole("button", { name: "Yes, reset" }).click();
  await expect(page).toHaveURL(/\/learn\/weights$/);
  await expect(page.getByLabel("0% complete")).toBeVisible();
});

test("reduced motion changes autoplay into deterministic advance", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/replay");
  await page.locator('[data-hydrated="true"]').waitFor();
  await page.getByRole("button", { name: "Advance animation" }).click();
  await expect(page.getByText(/Step 2 of/)).toBeVisible();
});

test("mobile layout has no document-level horizontal overflow", async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});

test("release page has no serious or critical automated accessibility violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((violation) =>
    violation.impact === "serious" || violation.impact === "critical",
  );
  expect(blocking).toEqual([]);
});
