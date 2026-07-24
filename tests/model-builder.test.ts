import { describe, expect, it } from "vitest";
import {
  estimateModelBuild,
  modelPurposePresets,
} from "@/src/content/model-builder";

describe("model factory capstone estimates", () => {
  it("uses genuinely different starting architectures for all three purposes", () => {
    expect(modelPurposePresets.assistant).toMatchObject({
      layers: 60,
      width: 6656,
      precisionBits: 16,
      gpuCount: 512,
    });
    expect(modelPurposePresets.domain).toMatchObject({
      layers: 32,
      width: 4352,
      precisionBits: 8,
      gpuCount: 128,
    });
    expect(modelPurposePresets.edge).toMatchObject({
      layers: 24,
      width: 2048,
      precisionBits: 4,
      gpuCount: 8,
    });
  });

  it("produces a worked domain-specialist build estimate", () => {
    const estimate = estimateModelBuild({ purpose: "domain" });

    expect(estimate.parameters).toBe(7_551_451_136);
    expect(estimate.parametersBillions).toBeCloseTo(7.55, 2);
    expect(estimate.trainingTokensBillions).toBeCloseTo(151.03, 2);
    expect(estimate.servingGigabytes).toBeCloseTo(7.55, 2);
    expect(estimate.layers).toBe(32);
    expect(estimate.width).toBe(4352);
  });

  it("lets Expert inputs override the selected purpose without changing its identity", () => {
    const estimate = estimateModelBuild({
      purpose: "edge",
      layers: 32,
      width: 2560,
      precisionBits: 8,
      gpuCount: 16,
      tokenRatio: 24,
    });

    expect(estimate.purpose.id).toBe("edge");
    expect(estimate.layers).toBe(32);
    expect(estimate.width).toBe(2560);
    expect(estimate.precisionBits).toBe(8);
    expect(estimate.gpuCount).toBe(16);
    expect(estimate.trainingTokens).toBe(estimate.parameters * 24);
  });
});
