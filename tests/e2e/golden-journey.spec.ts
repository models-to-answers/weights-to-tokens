import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-hydrated="true"]').waitFor();
});

test("learner can use canonical content, answer, continue, and reload progress", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("What a model carries");
  await page.getByRole("button", { name: "Expert" }).click();
  await expect(page.getByText("Expert layer").first()).toBeVisible();
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
  await expect(page.getByText("Expert layer").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: "1.1 What a model carries Completed", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "1.2 How training changes weights", exact: true }),
  ).toBeVisible();
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

test("single-GPU next-token candidates keep labels, bars, and percentages separated", async ({ page }) => {
  await page.goto("/learn/single-gpu-inference");
  await page.locator('[data-hydrated="true"]').waitFor();
  await page.getByRole("tab", { name: "05 Predict next token" }).click();

  const candidates = page.getByRole("list", { name: "Candidate next tokens" });
  await expect(candidates).toBeVisible();
  await expect(candidates.getByRole("listitem")).toHaveCount(4);

  for (const item of await candidates.getByRole("listitem").all()) {
    const label = item.locator(".logit-choice__token");
    const bar = item.locator(".logit-choice__bar");
    const percentage = item.locator(".logit-choice__percentage");
    const [labelBox, barBox, percentageBox] = await Promise.all([
      label.boundingBox(),
      bar.boundingBox(),
      percentage.boundingBox(),
    ]);

    expect(labelBox).not.toBeNull();
    expect(barBox).not.toBeNull();
    expect(percentageBox).not.toBeNull();
    expect(barBox!.x - (labelBox!.x + labelBox!.width)).toBeGreaterThanOrEqual(8);
    expect(percentageBox!.x - (barBox!.x + barBox!.width)).toBeGreaterThanOrEqual(8);
  }
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
  await page.getByRole("tab", { name: "06 Warp 0 resumes" }).click();
  await page.reload();
  await page.locator('[data-hydrated="true"]').waitFor();
  await expect(page.getByRole("tab", { name: "06 Warp 0 resumes" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText("Issue: W0 · ADD")).toBeVisible();
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
  await expect(page).toHaveURL(/\/learn\/model-readiness$/);
});

const animationAuditRoutes = [
  "/learn/weights",
  "/learn/training-loop",
  "/learn/adaptation",
  "/learn/model-artifact",
  "/learn/request-arrival",
  "/learn/model-readiness",
  "/learn/single-gpu-inference",
  "/learn/multi-gpu-inference",
  "/learn/gpu-anatomy",
  "/learn/kernel-launch",
  "/learn/warp-scheduler",
  "/learn/memory-hierarchy",
] as const;

test("every chapter animation can be played through in Beginner and Expert", async ({ page }) => {
  test.setTimeout(120_000);
  for (const mode of ["Beginner", "Expert"] as const) {
    for (const route of animationAuditRoutes) {
      await page.goto(route);
      await page.locator('[data-hydrated="true"]').waitFor();
      await page.getByRole("button", { name: mode }).click();
      const labs = page.locator("section.animation-stage[data-animation-id]");
      const labCount = await labs.count();
      expect(labCount, `${route} should render at least one animation`).toBeGreaterThan(0);

      for (let labIndex = 0; labIndex < labCount; labIndex += 1) {
        const lab = labs.nth(labIndex);
        await expect(lab).toBeVisible();
        const stageTabs = lab.getByRole("tab");
        const stageCount = await stageTabs.count();
        expect(stageCount, `${route} animation ${labIndex + 1} has no stages`).toBeGreaterThan(0);
        for (let stageIndex = 0; stageIndex < stageCount; stageIndex += 1) {
          const stage = stageTabs.nth(stageIndex);
          await stage.click();
          await expect(stage).toHaveAttribute("aria-selected", "true");
          await expect(lab.locator(".instrument-lab")).toBeVisible();
        }
      }
    }
  }
});

test("final replay plays every stage in both modes and both synchronized views", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/replay");
  await page.locator('[data-hydrated="true"]').waitFor();
  for (const mode of ["Beginner", "Expert"] as const) {
    await page.getByRole("button", { name: mode }).click();
    for (const view of ["System view", "GPU view"] as const) {
      await page.getByRole("button", { name: view }).click();
      const rail = page.locator(".replay-console__rail");
      const stages = rail.getByRole("button");
      await expect(stages).toHaveCount(12);
      for (let index = 0; index < 12; index += 1) {
        await stages.nth(index).click();
        await expect(stages.nth(index)).toHaveAttribute("aria-current", "step");
      }
    }
  }
  await page.getByRole("button", { name: "System view" }).click();
  await expect(page.getByText("GPUs run many calculations in parallel.").last()).toBeVisible();
  await expect(page.getByText("Complete ✓")).toBeVisible();
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
