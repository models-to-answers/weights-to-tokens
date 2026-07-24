"use client";

import {
  estimateModelBuild,
  modelPurposePresets,
  type AlignmentChoice,
  type ModelPurposeId,
  type ReleaseChoice,
} from "@/src/content/model-builder";
import { animationStageLabels } from "@/src/content/animation-stages";
import { LabFrame, Slider, Tabs, numeric } from "./ModelFactoryLabs";
import type { DeterministicAnimationProps } from "./types";

const PURPOSE_IDS = ["assistant", "domain", "edge"] as const;
const ALIGNMENTS: ReadonlyArray<{
  id: AlignmentChoice;
  name: string;
  detail: string;
}> = [
  {
    id: "instruction",
    name: "Instruction tuning",
    detail: "Teach the base model to follow requests and produce useful formats.",
  },
  {
    id: "domain",
    name: "Domain tuning",
    detail: "Adapt behavior with reviewed examples from the target field.",
  },
  {
    id: "preference",
    name: "Preference training",
    detail: "Use ranked responses to shape judgement, helpfulness, and safety.",
  },
];
const RELEASES: ReadonlyArray<{
  id: ReleaseChoice;
  name: string;
  detail: string;
}> = [
  {
    id: "api",
    name: "Managed API",
    detail: "Keep weights private and operate every serving replica.",
  },
  {
    id: "open",
    name: "Open weights",
    detail: "Let others download and run the artifact under its license.",
  },
  {
    id: "hybrid",
    name: "Weights + hosted API",
    detail: "Publish an artifact while also offering a managed service.",
  },
];

const textInput = (
  inputs: DeterministicAnimationProps["inputs"],
  key: string,
): string | undefined =>
  typeof inputs?.[key] === "string" ? inputs[key] : undefined;

const validPurpose = (value: string | undefined): ModelPurposeId =>
  PURPOSE_IDS.includes(value as ModelPurposeId)
    ? (value as ModelPurposeId)
    : "domain";

const compact = (value: number, digits = 1): string =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: digits,
  }).format(value);

const money = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const alignmentName = (id: AlignmentChoice): string =>
  ALIGNMENTS.find((item) => item.id === id)!.name;
const releaseName = (id: ReleaseChoice): string =>
  RELEASES.find((item) => item.id === id)!.name;

export function ModelBuilderCapstoneLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const labels =
    animationStageLabels["animation.model-factory.model-builder"];
  const active = Math.min(step, labels.length - 1);
  const purposeId = validPurpose(textInput(inputs, "purpose"));
  const preset = modelPurposePresets[purposeId];
  const prefix = purposeId;
  const estimate = estimateModelBuild({
    purpose: purposeId,
    layers: numeric(inputs, `${prefix}-layers`, preset.layers),
    width: numeric(inputs, `${prefix}-width`, preset.width),
    vocabulary: numeric(inputs, `${prefix}-vocabulary`, preset.vocabulary),
    precisionBits: numeric(
      inputs,
      `${prefix}-precision`,
      preset.precisionBits,
    ),
    gpuCount: numeric(inputs, `${prefix}-gpus`, preset.gpuCount),
    tokenRatio: numeric(inputs, `${prefix}-token-ratio`, preset.tokenRatio),
  });
  const requestedAlignment = textInput(inputs, "alignment");
  const alignment = ALIGNMENTS.some(
    (item) => item.id === requestedAlignment,
  )
    ? (requestedAlignment as AlignmentChoice)
    : preset.alignment;
  const requestedRelease = textInput(inputs, "release");
  const release = RELEASES.some((item) => item.id === requestedRelease)
    ? (requestedRelease as ReleaseChoice)
    : preset.release;
  const narration = [
    "Start with the job. The purpose changes the realistic architecture, precision, and training plan.",
    "Depth adds repeated refinement; width increases the large square matrices inside every layer.",
    "Estimate the data and accelerator time needed to turn random parameters into a base model.",
    "Post-training determines whether the base model follows instructions and makes useful choices.",
    "Choose who holds the weights and who carries the serving responsibility.",
    "Connect every decision in one build sheet before handing the artifact to the inference team.",
  ] as const;

  return (
    <LabFrame
      eyebrow="Model Factory capstone"
      title="Build one model from purpose to artifact"
      description="Make six connected decisions. The same selected model moves through architecture, pretraining, alignment, release, and a final build sheet."
    >
      <Tabs
        labels={labels}
        active={active}
        onChange={(index) => onStepChange?.(index)}
      />
      <div className="builder-capstone__context">
        <span>Current model</span>
        <strong>{preset.name}</strong>
        <p>{narration[active]}</p>
      </div>

      {active === 0 ? (
        <div className="model-purpose-grid">
          {PURPOSE_IDS.map((id) => {
            const option = modelPurposePresets[id];
            return (
              <button
                type="button"
                key={id}
                aria-pressed={purposeId === id}
                className={purposeId === id ? "is-selected" : ""}
                onClick={() => onInputChange?.("purpose", id)}
              >
                <span>{option.name}</span>
                <strong>{option.need}</strong>
                <small>
                  {option.layers} layers · {option.width.toLocaleString()} width ·{" "}
                  {option.precisionBits}-bit target
                </small>
                <p>{option.constraint}</p>
              </button>
            );
          })}
        </div>
      ) : null}

      {active === 1 ? (
        <div className="builder-stage builder-stage--architecture">
          <div className="builder-architecture-card">
            <span>Selected architecture</span>
            <strong>{estimate.parametersBillions.toFixed(2)}B</strong>
            <p>
              {estimate.layers} layers × {estimate.width.toLocaleString()} width
            </p>
            <div className="builder-parameter-bar" aria-label="Parameter groups">
              {[
                ["Embeddings", estimate.embeddings],
                ["Attention", estimate.attention],
                ["Feed-forward", estimate.feedForward],
              ].map(([label, value]) => (
                <i
                  key={String(label)}
                  style={{
                    width: `${(Number(value) / estimate.parameters) * 100}%`,
                  }}
                  title={`${label}: ${compact(Number(value))}`}
                />
              ))}
            </div>
            <ul className="builder-parameter-legend" aria-label="Parameter group shares">
              {[
                ["Embeddings", estimate.embeddings],
                ["Attention", estimate.attention],
                ["Feed-forward", estimate.feedForward],
              ].map(([label, value]) => (
                <li key={String(label)}>
                  <i aria-hidden="true" />
                  <span>{label}</span>
                  <strong>
                    {Math.round((Number(value) / estimate.parameters) * 100)}%
                  </strong>
                </li>
              ))}
            </ul>
            <small>
              Feed-forward blocks hold{" "}
              {Math.round(
                (estimate.feedForward / estimate.parameters) * 100,
              )}
              % of these simplified dense parameters.
            </small>
          </div>
          <div className="slider-stack">
            {mode === "expert" ? (
              <>
                <Slider
                  label="Layers"
                  value={estimate.layers}
                  min={8}
                  max={96}
                  step={4}
                  onChange={(value) =>
                    onInputChange?.(`${prefix}-layers`, value)
                  }
                />
                <Slider
                  label="Width"
                  value={estimate.width}
                  min={512}
                  max={12_288}
                  step={256}
                  onChange={(value) =>
                    onInputChange?.(`${prefix}-width`, value)
                  }
                />
                <Slider
                  label="Vocabulary"
                  value={estimate.vocabulary}
                  min={32_000}
                  max={256_000}
                  step={8_000}
                  onChange={(value) =>
                    onInputChange?.(`${prefix}-vocabulary`, value)
                  }
                />
                <p className="lab-formula">
                  P ≈ Vd + L(4d² + 8d²)
                </p>
              </>
            ) : (
              <p className="lab-guidance">
                This guided preset is deliberately different for each purpose.
                Expert mode lets you resize it and immediately recomputes the
                rest of the build.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {active === 2 ? (
        <div className="builder-stage">
          <div className="builder-training-plan">
            <span>Illustrative pretraining plan</span>
            <strong>
              {compact(estimate.trainingTokens)} tokens across{" "}
              {estimate.gpuCount.toLocaleString()} H100-class GPUs
            </strong>
            <div className="builder-run-metrics">
              <div><span>Wall clock</span><strong>{estimate.trainingDays.toFixed(1)} days</strong></div>
              <div><span>Accelerator cost</span><strong>{money(estimate.trainingCostUsd)}</strong></div>
              <div><span>Energy</span><strong>{estimate.energyMwh.toFixed(1)} MWh</strong></div>
              <div><span>Training state</span><strong>{estimate.trainingStateGigabytes.toFixed(0)} GB</strong></div>
            </div>
            <small>
              Teaching estimate: 6 FLOPs per parameter-token, 350 effective
              TFLOP/s per GPU, $3.50 per GPU-hour, no failed runs, staffing,
              data acquisition, or evaluation.
            </small>
          </div>
          <div className="slider-stack">
            {mode === "expert" ? (
              <>
                <Slider
                  label="Training tokens per parameter"
                  value={estimate.tokenRatio}
                  min={8}
                  max={40}
                  onChange={(value) =>
                    onInputChange?.(`${prefix}-token-ratio`, value)
                  }
                />
                <Slider
                  label="Training GPUs"
                  value={estimate.gpuCount}
                  min={1}
                  max={1024}
                  step={purposeId === "edge" ? 1 : 8}
                  onChange={(value) =>
                    onInputChange?.(`${prefix}-gpus`, value)
                  }
                />
              </>
            ) : (
              <p className="lab-guidance">
                More GPUs can shorten wall-clock time, but they do not remove
                the total computation. Real scaling also loses efficiency to
                communication and failures.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {active === 3 ? (
        <div className="builder-choice-grid" role="group" aria-label="Alignment plan">
          {ALIGNMENTS.map((option) => (
            <button
              type="button"
              key={option.id}
              aria-pressed={alignment === option.id}
              className={alignment === option.id ? "is-selected" : ""}
              onClick={() => onInputChange?.("alignment", option.id)}
            >
              <span>{option.name}</span>
              <strong>{option.detail}</strong>
              <small>
                {option.id === preset.alignment
                  ? `Recommended starting point for ${preset.name.toLowerCase()}`
                  : "Available alternative"}
              </small>
            </button>
          ))}
        </div>
      ) : null}

      {active === 4 ? (
        <div className="builder-choice-grid" role="group" aria-label="Release plan">
          {RELEASES.map((option) => (
            <button
              type="button"
              key={option.id}
              aria-pressed={release === option.id}
              className={release === option.id ? "is-selected" : ""}
              onClick={() => onInputChange?.("release", option.id)}
            >
              <span>{option.name}</span>
              <strong>{option.detail}</strong>
              <small>
                {option.id === preset.release
                  ? `Recommended starting point for ${preset.name.toLowerCase()}`
                  : "Available alternative"}
              </small>
            </button>
          ))}
        </div>
      ) : null}

      {active === 5 ? (
        <div className="builder-build-sheet">
          <header>
            <span>Simulated handoff</span>
            <h4>Your model build sheet</h4>
            <p>{preset.name} · {preset.need}</p>
          </header>
          <div>
            <section><span>Architecture</span><strong>{estimate.parametersBillions.toFixed(2)}B parameters</strong><small>{estimate.layers} layers × {estimate.width.toLocaleString()} width</small></section>
            <section><span>Pretraining</span><strong>{compact(estimate.trainingTokens)} tokens</strong><small>{estimate.gpuCount.toLocaleString()} GPUs · {estimate.trainingDays.toFixed(1)} days · {money(estimate.trainingCostUsd)}</small></section>
            <section><span>Alignment</span><strong>{alignmentName(alignment)}</strong><small>Selected post-training path</small></section>
            <section><span>Release</span><strong>{releaseName(release)}</strong><small>Selected ownership and serving model</small></section>
            <section><span>Serving weights</span><strong>{estimate.servingGigabytes.toFixed(1)} GB</strong><small>{estimate.precisionBits}-bit weights before runtime buffers</small></section>
            <section><span>Artifact contents</span><strong>Weights + config + tokenizer</strong><small>Version and compatibility metadata travel with the release</small></section>
          </div>
          {mode === "expert" ? (
            <p>
              Estimate scope: dense decoder, FFN multiplier 4, tied output
              embeddings, idealized accelerator scaling. MoE routing,
              activation checkpointing, optimizer sharding, failed runs, data,
              evaluation, and serving TCO require separate plans.
            </p>
          ) : null}
          <strong className="builder-build-sheet__handoff">
            Next: take this artifact into the Inference System.
          </strong>
        </div>
      ) : null}
    </LabFrame>
  );
}
