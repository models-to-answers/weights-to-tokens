export type ModelPurposeId = "assistant" | "domain" | "edge";
export type AlignmentChoice = "instruction" | "domain" | "preference";
export type ReleaseChoice = "api" | "open" | "hybrid";

export type ModelPurposePreset = {
  id: ModelPurposeId;
  name: string;
  need: string;
  constraint: string;
  layers: number;
  width: number;
  vocabulary: number;
  precisionBits: 4 | 8 | 16;
  gpuCount: number;
  tokenRatio: number;
  alignment: AlignmentChoice;
  release: ReleaseChoice;
};

export const modelPurposePresets = {
  assistant: {
    id: "assistant",
    name: "General assistant",
    need: "Broad knowledge and conversational ability across many tasks",
    constraint: "Capability and evaluation breadth drive scale and cost.",
    layers: 60,
    width: 6656,
    vocabulary: 128_000,
    precisionBits: 16,
    gpuCount: 512,
    tokenRatio: 20,
    alignment: "preference",
    release: "api",
  },
  domain: {
    id: "domain",
    name: "Domain specialist",
    need: "Deep performance in one field with a narrower operating range",
    constraint: "High-quality domain data matters more than maximum size.",
    layers: 32,
    width: 4352,
    vocabulary: 64_000,
    precisionBits: 8,
    gpuCount: 128,
    tokenRatio: 20,
    alignment: "domain",
    release: "hybrid",
  },
  edge: {
    id: "edge",
    name: "On-device model",
    need: "Private, low-latency operation on a laptop or phone",
    constraint: "Memory, power, and latency impose a hard size ceiling.",
    layers: 24,
    width: 2048,
    vocabulary: 64_000,
    precisionBits: 4,
    gpuCount: 8,
    tokenRatio: 20,
    alignment: "instruction",
    release: "open",
  },
} as const satisfies Readonly<Record<ModelPurposeId, ModelPurposePreset>>;

export type ModelBuildInputs = {
  purpose: ModelPurposeId;
  layers?: number;
  width?: number;
  vocabulary?: number;
  precisionBits?: number;
  gpuCount?: number;
  tokenRatio?: number;
};

export type ModelBuildEstimate = {
  purpose: ModelPurposePreset;
  layers: number;
  width: number;
  vocabulary: number;
  precisionBits: number;
  gpuCount: number;
  tokenRatio: number;
  embeddings: number;
  attention: number;
  feedForward: number;
  parameters: number;
  parametersBillions: number;
  trainingTokens: number;
  trainingTokensBillions: number;
  servingGigabytes: number;
  trainingStateGigabytes: number;
  trainingDays: number;
  trainingCostUsd: number;
  energyMwh: number;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Math.round(value)));

export function estimateModelBuild(
  inputs: ModelBuildInputs,
): ModelBuildEstimate {
  const purpose = modelPurposePresets[inputs.purpose];
  const layers = clamp(inputs.layers ?? purpose.layers, 8, 96);
  const width = clamp(inputs.width ?? purpose.width, 512, 12_288);
  const vocabulary = clamp(
    inputs.vocabulary ?? purpose.vocabulary,
    32_000,
    256_000,
  );
  const precisionBits = [4, 8, 16].includes(inputs.precisionBits ?? 0)
    ? inputs.precisionBits!
    : purpose.precisionBits;
  const gpuCount = clamp(inputs.gpuCount ?? purpose.gpuCount, 1, 2048);
  const tokenRatio = clamp(inputs.tokenRatio ?? purpose.tokenRatio, 8, 40);

  const embeddings = vocabulary * width;
  const attention = layers * 4 * width * width;
  const feedForward = layers * 8 * width * width;
  const parameters = embeddings + attention + feedForward;
  const trainingTokens = parameters * tokenRatio;

  // Educational whiteboard assumptions, not a procurement quote:
  // 6 FLOPs per parameter-token, 350 effective TFLOP/s per H100-class GPU,
  // $3.50 per GPU-hour, and 700 W average board power.
  const trainingFlops = 6 * parameters * trainingTokens;
  const trainingHours =
    trainingFlops / (gpuCount * 350e12 * 60 * 60);

  return {
    purpose,
    layers,
    width,
    vocabulary,
    precisionBits,
    gpuCount,
    tokenRatio,
    embeddings,
    attention,
    feedForward,
    parameters,
    parametersBillions: parameters / 1e9,
    trainingTokens,
    trainingTokensBillions: trainingTokens / 1e9,
    servingGigabytes: (parameters * (precisionBits / 8)) / 1e9,
    trainingStateGigabytes: (parameters * 16) / 1e9,
    trainingDays: trainingHours / 24,
    trainingCostUsd: trainingHours * gpuCount * 3.5,
    energyMwh: (trainingHours * gpuCount * 0.7) / 1000,
  };
}
