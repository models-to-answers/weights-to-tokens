"use client";

import type { CSSProperties, ReactNode } from "react";
import { animationStageLabels } from "@/src/content/animation-stages";
import type { DeterministicAnimationProps } from "./types";

export function LabFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="instrument-lab">
      <header className="instrument-lab__header">
        <div>
          <p>{eyebrow}</p>
          <h3>{title}</h3>
        </div>
        <span>interactive explanation</span>
      </header>
      <p className="instrument-lab__description">{description}</p>
      {children}
    </section>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="lab-slider">
      <span>
        {label}
        <strong>{value.toLocaleString()}{unit}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

export function Tabs({
  labels,
  active,
  onChange,
}: {
  labels: readonly string[];
  active: number;
  onChange: (index: number) => void;
}) {
  return (
    <div className="lab-tabs" role="tablist">
      {labels.map((label, index) => (
        <button
          type="button"
          role="tab"
          aria-selected={active === index}
          tabIndex={active === index ? 0 : -1}
          className={active === index ? "is-active" : ""}
          key={label}
          onClick={() => onChange(index)}
          onKeyDown={(event) => {
            let next: number | undefined;
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
              next = (index + 1) % labels.length;
            } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
              next = (index - 1 + labels.length) % labels.length;
            } else if (event.key === "Home") {
              next = 0;
            } else if (event.key === "End") {
              next = labels.length - 1;
            }
            if (next !== undefined) {
              event.preventDefault();
              onChange(next);
              const buttons =
                event.currentTarget.parentElement?.querySelectorAll("button");
              buttons?.[next]?.focus();
            }
          }}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          {label}
        </button>
      ))}
    </div>
  );
}

export const numeric = (
  inputs: DeterministicAnimationProps["inputs"],
  key: string,
  fallback: number,
) => (typeof inputs?.[key] === "number" ? inputs[key] : fallback);

export function JourneyMapLab({
  mode = "beginner",
  step = 0,
  onStepChange,
}: DeterministicAnimationProps) {
  const parts = [
    {
      name: "Model Factory",
      promise: "Build or adapt the model",
      concepts: ["What weights carry", "How training changes them", "How the artifact is packaged"],
      connection: "Produces the reusable model artifact.",
      expert: "Data, loss, optimization, post-training, evaluation, and versioned tensors.",
    },
    {
      name: "Inference System",
      promise: "Turn a prompt into tokens",
      concepts: ["Ready the worker", "Admit and tokenize a request", "Prefill and repeat decode"],
      connection: "Uses the same resident weights for many requests.",
      expert: "Placement, batching, KV allocation, latency, replicas, and cooperative parallelism.",
    },
    {
      name: "Inside the GPU",
      promise: "See how calculations execute",
      concepts: ["Launch kernels", "Schedule blocks and warps", "Move operands through memory"],
      connection: "This work happens inside prefill and every decode iteration.",
      expert: "Streams, grids, residency, eligibility, execution pipelines, coalescing, and HBM.",
    },
  ] as const;
  const active = Math.min(step, parts.length - 1);
  const part = parts[active];
  return (
    <LabFrame
      eyebrow="Course orientation"
      title="Three connected views of one token-producing system"
      description="Begin with the model, follow one inference request, then zoom inside the GPU work that prefill and decode repeatedly invoke."
    >
      <Tabs labels={animationStageLabels["animation.model-factory.weights-map"]} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="journey-parts" aria-label="Three course parts">
        {parts.map((item, index) => (
          <button
            type="button"
            className={index < active ? "is-past" : index === active ? "is-active" : ""}
            key={item.name}
            onClick={() => onStepChange?.(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.name}</strong>
            <small>{item.promise}</small>
          </button>
        ))}
      </div>
      <div className="journey-part-detail">
        <div>
          <span>Part {active + 1}</span>
          <strong>{part.name}</strong>
          <p>{part.connection}</p>
        </div>
        <ol>{part.concepts.map((concept) => <li key={concept}>{concept}</li>)}</ol>
        {mode === "expert" ? (
          <aside><span>Expert layer</span><p>{part.expert}</p></aside>
        ) : null}
      </div>
    </LabFrame>
  );
}

export function TokenPredictorLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const temperature = numeric(inputs, "temperature", 0.8);
  const contexts = [
    "The production model predicts the next",
    "A GPU hides memory latency by",
    "The safest deployment begins with",
  ];
  const candidates = [
    ["tokens", 4.1, "words", 3.1, "answers", 2.4, "facts", 1.5],
    ["scheduling", 4.0, "caching", 3.2, "waiting", 2.5, "guessing", 1.2],
    ["evaluation", 4.2, "scale", 3.0, "marketing", 1.8, "luck", 1.1],
  ] as const;
  const row = candidates[Math.min(step, contexts.length - 1)];
  const pairs = Array.from({ length: row.length / 2 }, (_, index) => ({
    token: String(row[index * 2]),
    logit: Number(row[index * 2 + 1]),
  }));
  const exps = pairs.map(({ logit }) => Math.exp(logit / temperature));
  const total = exps.reduce((sum, value) => sum + value, 0);
  const probabilities = pairs.map((item, index) => ({
    ...item,
    probability: exps[index] / total,
  }));

  return (
    <LabFrame
      eyebrow="Next-token prediction"
      title="Watch a next-token distribution change"
      description="A model does not retrieve an answer. It recomputes a distribution over possible next tokens at every position."
    >
      <div className="lab-grid lab-grid--predictor">
        <div>
          <Tabs
            labels={["Example 1", "Example 2", "Example 3"]}
            active={Math.min(step, 2)}
            onChange={(index) => onStepChange?.(index)}
          />
          <blockquote className="prompt-console">
            {contexts[Math.min(step, 2)]} <mark>___</mark>
          </blockquote>
          <Slider
            label="Temperature"
            value={temperature}
            min={0.2}
            max={1.8}
            step={0.1}
            onChange={(value) => onInputChange?.("temperature", value)}
          />
          <p className="temperature-explainer">
            Lower temperature concentrates probability on the leading choices.
            Higher temperature spreads probability across more candidates,
            making selection less predictable.
          </p>
          {mode === "expert" ? (
            <p className="lab-formula">
              p(tokenᵢ) = softmax(logitᵢ / T)
            </p>
          ) : null}
        </div>
        <div className="distribution" aria-label="Next token probabilities">
          {probabilities.map(({ token, probability }) => (
            <div className="distribution__row" key={token}>
              <span>{token}</span>
              <i>
                <b style={{ width: `${(probability * 100).toFixed(5)}%` }} />
              </i>
              <strong>{(probability * 100).toFixed(1)}%</strong>
            </div>
          ))}
        </div>
      </div>
    </LabFrame>
  );
}

const PIPELINE = [
  { name: "Pretraining", share: 97.6, cost: "$10M–$100M+", input: "Very large general corpus", action: "Predict tokens and update all weights", outcome: "General capability", owner: "Data, research, and distributed-systems teams", measure: "Held-out loss plus broad capability evaluations", failure: "Bad data mixtures or unstable scaling consume the largest budget." },
  { name: "Supervised tuning", share: 1.4, cost: "$10K–$1M", input: "Prompt-and-good-answer examples", action: "Imitate the desired response pattern", outcome: "Instruction following", owner: "Post-training, product, and domain teams", measure: "Task success, format adherence, and general-capability retention", failure: "Narrow examples can overfit style or erase useful behavior." },
  { name: "Preference training", share: 0.8, cost: "$10K–$1M", input: "Ranked or rated alternatives", action: "Favor preferred behavior under constraints", outcome: "Judgement and safety", owner: "Alignment, evaluation, policy, and product teams", measure: "Preference win rate plus truthfulness and safety guardrails", failure: "The model can optimize rater preferences instead of the intended quality." },
  { name: "Evaluation & release", share: 0.2, cost: "Continuous", input: "Capability, safety, and product tests", action: "Measure, gate, package, and version", outcome: "A shippable artifact", owner: "Evaluation, safety, platform, and release owners", measure: "Thresholds, regressions, red-team findings, and product acceptance", failure: "Averages can hide critical regressions or untested operating conditions." },
] as const;

export function PipelineStagesLab({
  mode = "beginner",
  step = 0,
  onStepChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, PIPELINE.length - 1);
  const stage = PIPELINE[active];
  return (
    <LabFrame
      eyebrow="How a model gets built"
      title="See where model-building compute really goes"
      description="The word training hides stages that differ by orders of magnitude in cost and by the kind of value they create."
    >
      <Tabs
        labels={PIPELINE.map((item) => item.name)}
        active={active}
        onChange={(index) => onStepChange?.(index)}
      />
      <div className="pipeline-bar" aria-label="Indicative compute share">
        {PIPELINE.map((item, index) => (
          <button
            type="button"
            className={active === index ? "is-active" : ""}
            style={{ flexGrow: Math.max(item.share, 3) }}
            key={item.name}
            onClick={() => onStepChange?.(index)}
          >
            <span>{item.share}%</span>
          </button>
        ))}
      </div>
      <div className="lab-readouts">
        <div><span>Selected stage</span><strong>{stage.name}</strong></div>
        <div><span>What enters</span><strong>{stage.input}</strong></div>
        <div><span>What happens</span><strong>{stage.action}</strong></div>
        <div><span>Indicative cost</span><strong>{stage.cost}</strong></div>
        <div><span>Primary outcome</span><strong>{stage.outcome}</strong></div>
        {mode === "expert" ? (
          <>
            <div><span>Owners</span><strong>{stage.owner}</strong></div>
            <div><span>Evaluation</span><strong>{stage.measure}</strong></div>
            <div><span>Failure mode</span><strong>{stage.failure}</strong></div>
            <div><span>Interpretation</span><strong>Compute share ≠ product-value share</strong></div>
          </>
        ) : null}
      </div>
    </LabFrame>
  );
}

export function ParameterBuilderLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, 2);
  const layers = numeric(inputs, "layers", 32);
  const width = numeric(inputs, "width", 4096);
  const vocabulary = numeric(inputs, "vocabulary", 128000);
  const multiplier = numeric(inputs, "ffn", 4);
  const precision = numeric(inputs, "precision", 16);
  const embeddings = vocabulary * width;
  const attention = layers * 4 * width * width;
  const feedForward = layers * 2 * multiplier * width * width;
  const total = embeddings + attention + feedForward;
  const billions = total / 1e9;

  return (
    <LabFrame
      eyebrow="Parameter and memory budget"
      title="Build a transformer and watch width bite"
      description="Depth grows parameter count linearly. Width appears inside square matrices, so a modest increase changes memory far faster."
    >
      <Tabs
        labels={animationStageLabels["animation.model-factory.parameter-builder"]}
        active={active}
        onChange={(index) => onStepChange?.(index)}
      />
      <div className="stage-narration">
        <span>Stage {active + 1}</span>
        <strong>{animationStageLabels["animation.model-factory.parameter-builder"][active]}</strong>
        <p>
          {active === 0
            ? "Choose layer count, hidden width, vocabulary size, and feed-forward expansion. These dimensions define the shapes of the learned tensors."
            : active === 1
              ? "Compare where parameters live. Width is squared inside attention and feed-forward matrices, so these groups dominate many dense models."
              : `Store the same ${billions.toFixed(2)} billion learned values at ${precision} bits each. Lower precision reduces weight memory but may require calibration or quantization-aware handling.`}
        </p>
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          {active === 0 ? (
            <>
              <Slider label="Layers" value={layers} min={8} max={96} step={4} onChange={(value) => onInputChange?.("layers", value)} />
              <Slider label="Width" value={width} min={1024} max={12288} step={512} onChange={(value) => onInputChange?.("width", value)} />
              <Slider label="Vocabulary" value={vocabulary} min={32000} max={256000} step={8000} onChange={(value) => onInputChange?.("vocabulary", value)} />
              <Slider label="FFN multiplier" value={multiplier} min={2} max={8} onChange={(value) => onInputChange?.("ffn", value)} />
            </>
          ) : active === 1 ? (
            <p className="lab-guidance">Read each bar as its share of the total parameter count. Change the architecture in Stage 1, then return here to see the new split.</p>
          ) : (
            <div className="pattern-picker" role="group" aria-label="Weight precision">
              {[16, 8, 4].map((bits) => (
                <button type="button" className={precision === bits ? "is-active" : ""} aria-pressed={precision === bits} onClick={() => onInputChange?.("precision", bits)} key={bits}>
                  {bits}-bit weights
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className={`parameter-total parameter-total--stage-${active}`}>
            <span>Approximate dense parameters</span>
            <strong>{billions.toFixed(2)}B</strong>
            <small>{(billions * (precision / 8)).toFixed(1)} GB of {precision}-bit weights</small>
          </div>
          <div className={`parameter-map ${active === 1 ? "is-focus" : ""}`}>
            {[
              ["Embeddings", embeddings],
              ["Attention", attention],
              ["Feed-forward", feedForward],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <span>{label}</span>
                <i style={{ width: `${(Number(value) / total) * 100}%` }} />
                <strong>{((Number(value) / total) * 100).toFixed(0)}%</strong>
              </div>
            ))}
          </div>
          {mode === "expert" ? (
            <p className="lab-formula">P ≈ Vd + L(4d² + 2md²)</p>
          ) : null}
        </div>
      </div>
    </LabFrame>
  );
}

const TRAINING_PHASES =
  animationStageLabels["animation.model-factory.training-loop"];

const TRAINING_WORKER_STATE = [
  "Receives a different data shard",
  "Runs the same model on local examples",
  "Measures a local loss",
  "Computes local gradients",
  "Exchanges gradients with every worker",
  "Applies the same synchronized update",
  "Contributes consistent state",
] as const;

export function TrainingRunLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const parameters = numeric(inputs, "parametersB", 7);
  const tokens = numeric(inputs, "tokensB", 140);
  const gpus = numeric(inputs, "gpus", 64);
  const utilization = numeric(inputs, "utilization", 40);
  const flops = 6 * parameters * 1e9 * tokens * 1e9;
  const effective = gpus * 3.12e14 * (utilization / 100);
  const days = flops / effective / 86400;
  const pricePerGpuHour = 2.5;
  const cost = days * 24 * gpus * pricePerGpuHour;
  const active = Math.min(step, TRAINING_PHASES.length - 1);

  return (
    <LabFrame
      eyebrow="Distributed training"
      title="Watch four workers learn one consistent set of weights"
      description="Each worker sees different examples, computes local gradients, synchronizes them, and applies the same update. A checkpoint is a separate saved artifact."
    >
      <Tabs
        labels={TRAINING_PHASES}
        active={active}
        onChange={(index) => onStepChange?.(index)}
      />
      <div className={`training-workers training-workers--stage-${active}`}>
        <div className="training-workers__grid" aria-label="Four representative training workers">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <span>Worker {index + 1}</span>
              <strong>{TRAINING_WORKER_STATE[active]}</strong>
              <i>{active < 4 ? `batch ${String.fromCharCode(65 + index)}` : active === 4 ? "gradient ↔" : "weights v42"}</i>
            </div>
          ))}
        </div>
        {active === 4 ? (
          <p className="training-workers__collective">All-reduce combines the four local gradients and returns the same result to every worker.</p>
        ) : null}
        {active === 6 ? (
          <div className="checkpoint-artifact">
            <span>Saved checkpoint</span>
            <strong>weights v42 + optimizer state + metadata</strong>
            <small>All four workers continue training; the artifact is stored separately.</small>
          </div>
        ) : null}
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          <Slider label="Parameters" value={parameters} min={1} max={70} unit="B" onChange={(value) => onInputChange?.("parametersB", value)} />
          <Slider label="Training tokens" value={tokens} min={20} max={1400} step={20} unit="B" onChange={(value) => onInputChange?.("tokensB", value)} />
          <Slider label="GPUs" value={gpus} min={8} max={1024} step={8} onChange={(value) => onInputChange?.("gpus", value)} />
          <Slider label="Utilization" value={utilization} min={20} max={65} unit="%" onChange={(value) => onInputChange?.("utilization", value)} />
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Training work</span><strong>{(flops / 1e23).toFixed(1)} × 10²³ FLOPs</strong></div>
          <div><span>Wall-clock estimate</span><strong>{days.toFixed(1)} days</strong></div>
          <div><span>Estimated GPU compute cost</span><strong>${Math.round(cost).toLocaleString()}</strong><small>Assumes ${pricePerGpuHour.toFixed(2)} per GPU-hour</small></div>
          {mode === "expert" ? (
            <>
              <div><span>Estimator</span><strong>C ≈ 6ND / achieved throughput</strong></div>
              <div><span>Not included</span><strong>Storage, networking, CPU hosts, failed runs, and engineering time</strong></div>
            </>
          ) : null}
        </div>
      </div>
    </LabFrame>
  );
}

const PREFERENCES = [
  {
    prompt: "The release missed its target. Explain why.",
    honest: "The evidence is incomplete; the largest measured delay was test instability.",
    agreeable: "The team made the right trade-offs and external dependencies caused the miss.",
  },
  {
    prompt: "Did our new model improve conversion?",
    honest: "Not yet. The interval crosses zero, so the experiment is inconclusive.",
    agreeable: "Yes—the early trend is positive and validates the strategy.",
  },
  {
    prompt: "Can this system guarantee no hallucinations?",
    honest: "No. It can reduce and detect some failures, but cannot guarantee none.",
    agreeable: "Yes, with the right guardrails it can be made fully reliable.",
  },
] as const;

export function PreferenceTrainerLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const stages = animationStageLabels["animation.model-factory.preference-trainer"];
  const active = Math.min(step, stages.length - 1);
  const comparison = Math.min(numeric(inputs, "comparison", 0), PREFERENCES.length - 1);
  const item = PREFERENCES[comparison];
  const picks = PREFERENCES.map((_, index) => inputs?.[`pick-${index}`]);
  const answered = picks.filter((pick) => pick === "honest" || pick === "agreeable");
  const truthSeeking = answered.filter((pick) => pick === "honest").length;
  const agreeable = picks.filter((pick) => pick === "agreeable").length;
  return (
    <LabFrame
      eyebrow="Preference training"
      title="Act as the human rater, then inspect what the judge learns"
      description="Candidate answers come from the answering model. Your comparison becomes training data for a reward model—the judge—not an automatic statement of truth."
    >
      <Tabs labels={stages} active={active} onChange={(index) => onStepChange?.(index)} />
      {active === 0 ? (
        <div className="preference-role">
          <strong>Your role: human rater</strong>
          <p>Use the rubric to choose the better candidate response. Prefer evidence, honesty about uncertainty, helpfulness, and safety—not confidence or praise by itself.</p>
          <span>Answering model → two candidates → your preference</span>
        </div>
      ) : null}
      {active === 1 ? (
        <>
          <div className="preference-comparison-switch" aria-label="Preference comparisons">
            {PREFERENCES.map((_, index) => (
              <button type="button" className={comparison === index ? "is-active" : ""} onClick={() => onInputChange?.("comparison", index)} key={index}>
                Comparison {index + 1}{picks[index] ? " ✓" : ""}
              </button>
            ))}
          </div>
          <p className="preference-prompt"><strong>Prompt:</strong> {item.prompt}</p>
          <div className="preference-grid">
            {([
              ["honest", item.honest],
              ["agreeable", item.agreeable],
            ] as const).map(([id, text]) => (
              <button
                type="button"
                className={picks[comparison] === id ? "is-selected" : ""}
                onClick={() => onInputChange?.(`pick-${comparison}`, id)}
                key={id}
              >
                <span>{id === "honest" ? "Candidate A" : "Candidate B"}</span>
                <p>{text}</p>
                <strong>Prefer this response</strong>
              </button>
            ))}
          </div>
          {picks[comparison] ? (
            <p className="preference-record">Recorded: Candidate {picks[comparison] === "honest" ? "A" : "B"} preferred. This becomes one labelled comparison.</p>
          ) : <p className="preference-record">Choose one candidate using the rubric.</p>}
        </>
      ) : null}
      {active === 2 ? (
        <div className="preference-dataset">
          <strong>Preference dataset · {answered.length} of {PREFERENCES.length} comparisons recorded</strong>
          {PREFERENCES.map((preference, index) => (
            <div key={preference.prompt}>
              <span>Prompt {index + 1}</span>
              <b>{picks[index] ? `Candidate ${picks[index] === "honest" ? "A" : "B"} preferred` : "Not rated"}</b>
            </div>
          ))}
        </div>
      ) : null}
      {active === 3 ? (
        <div className="judge-flow">
          <div><span>Human comparisons</span><strong>{answered.length || "No"} labelled pairs</strong></div>
          <i>→</i>
          <div><span>Reward model</span><strong>Learns to predict the preferred answer</strong></div>
          <i>→</i>
          <div><span>Answering model</span><strong>RLHF uses judge scores to improve responses</strong></div>
        </div>
      ) : null}
      {active === 4 ? (
        <div className="bias-test">
          <strong>What tendency would this small dataset teach?</strong>
          <div className="bias-meter">
            <span>Truth-seeking {truthSeeking}</span>
            <i><b style={{ width: `${answered.length ? (agreeable / answered.length) * 100 : 50}%` }} /></i>
            <span>Agreeable {agreeable}</span>
          </div>
          <p>{answered.length === 0 ? "Rate the comparisons first; unanswered items are not counted." : agreeable > truthSeeking ? "The judge risks rewarding reassurance over evidence." : "The current choices favor evidence, but three examples are only a teaching illustration."}</p>
        </div>
      ) : null}
      {mode === "expert" ? (
        <p className="lab-formula">
          RLHF: preferences → reward model → policy optimization. DPO: preference
          pairs train the answering model directly, without a separate RL loop.
        </p>
      ) : null}
    </LabFrame>
  );
}

const RELEASES = [
  { name: "Closed API", values: [false, false, false, false, false], note: "Endpoint access; provider owns every layer." },
  { name: "Open weights", values: [true, true, false, false, false], note: "Run and adapt the artifact; recipe and data remain withheld." },
  { name: "Open-ish", values: [true, true, false, true, false], note: "Weights plus code under a use-restricted license." },
  { name: "Reproducible open", values: [true, true, true, true, true], note: "Weights, code, data, recipe, and permissive rights." },
] as const;
const RELEASE_FIELDS = ["Weights", "Architecture", "Training data", "Training code", "Recipe"] as const;

export function WeightsSpectrumLab({
  mode = "beginner",
  step = 1,
  onStepChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, RELEASES.length - 1);
  return (
    <LabFrame
      eyebrow="Model release contents"
      title="Inspect what a model release actually gives you"
      description="Open versus closed is a spectrum of artifacts, rights, operational control, and withheld know-how."
    >
      <Tabs labels={RELEASES.map((item) => item.name)} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="release-table-wrap">
        <table className="release-table">
          <thead>
            <tr>
              <th scope="col">Release type</th>
              {RELEASE_FIELDS.map((field) => <th scope="col" key={field}>{field}</th>)}
            </tr>
          </thead>
          <tbody>
            {RELEASES.map((release, row) => (
              <tr className={row === active ? "is-active" : ""} key={release.name}>
                <th scope="row">{release.name}</th>
                {release.values.map((value, index) => (
                  <td data-label={RELEASE_FIELDS[index]} key={RELEASE_FIELDS[index]}>
                    <span className={value ? "is-included" : "is-withheld"}>{value ? "Included" : "Not provided"}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="lab-verdict">{RELEASES[active].note}</p>
      {mode === "expert" ? <p className="lab-formula">Operational ownership: quantization + batching + KV cache + scaling + evaluation</p> : null}
    </LabFrame>
  );
}

const LORA_STAGES =
  animationStageLabels["animation.model-factory.adaptation-lab"];

function MatrixArt({ rank, accent = false }: { rank: number; accent?: boolean }) {
  return (
    <div
      className={`matrix-art ${accent ? "matrix-art--accent" : ""}`}
      style={{ "--matrix-rank": rank } as CSSProperties}
      aria-hidden="true"
    >
      {Array.from({ length: 64 }, (_, index) => (
        <i
          key={index}
          style={{
            opacity: 0.15 + (((index * 17 + rank * 11) % 13) / 16),
          }}
        />
      ))}
    </div>
  );
}

export function LoRALab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, LORA_STAGES.length - 1);
  const rank = numeric(inputs, "rank", 8);
  const quantized = inputs?.quantized === true;
  const trainable = 32 * 4 * 2 * 4096 * rank;
  return (
    <LabFrame
      eyebrow="Low-rank adaptation"
      title="Keep the base fixed and learn two thin matrices"
      description="LoRA does not retrain every value in W. It learns A and B, multiplies them into a full-shaped adjustment, and adds that adjustment to the frozen base."
    >
      <Tabs labels={LORA_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className={`lora-explainer lora-explainer--stage-${active}`}>
        <div className="lora-base">
          <span>{active === 0 ? "Base matrix W · train every value" : "Base matrix W · locked"}</span>
          <MatrixArt rank={32} />
          <strong>{active === 0 ? "gradients update W" : "🔒 no gradients update W"}</strong>
        </div>
        <div className={`lora-factors ${active < 2 ? "is-muted" : ""}`}>
          <div>
            <span>A · {rank} × 4096</span>
            <i style={{ "--factor-rank": rank } as CSSProperties}>thin</i>
          </div>
          <b>×</b>
          <div>
            <span>B · 4096 × {rank}</span>
            <i style={{ "--factor-rank": rank } as CSSProperties}>thin</i>
          </div>
          <strong>{active >= 2 ? "Only A and B receive gradients" : "Inserted after the base is frozen"}</strong>
        </div>
        <div className={`lora-delta ${active < 3 ? "is-muted" : ""}`}>
          <span>Full-shaped adjustment</span>
          <MatrixArt rank={rank} accent />
          <strong>ΔW = B × A</strong>
        </div>
      </div>
      <div className="lora-equation" aria-live="polite">
        <span>Effective weights</span>
        <strong>{active < 3 ? "W" : active === 3 ? "W + scale × ΔW" : "W′ = W + scale × (B × A)"}</strong>
        <p>{active === 4 ? "Serve with the adapter attached, or merge the adjustment into a derived copy of W." : active === 0 ? "Full fine-tuning changes the complete base matrix." : "The original base remains unchanged and reusable."}</p>
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          <Slider label="Rank" value={rank} min={1} max={32} onChange={(value) => onInputChange?.("rank", value)} />
          <label className="lab-check">
            <input type="checkbox" checked={quantized} onChange={(event) => onInputChange?.("quantized", event.currentTarget.checked)} />
            Hold the frozen base at 4-bit (QLoRA)
          </label>
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Trainable parameters</span><strong>{active === 0 ? "≈ 7,000M" : `${(trainable / 1e6).toFixed(1)}M`}</strong></div>
          <div><span>Share of 7B model</span><strong>{active === 0 ? "100%" : `${((trainable / 7e9) * 100).toFixed(3)}%`}</strong></div>
          <div><span>Base storage</span><strong>{quantized ? "3.5 GB" : "14 GB"}</strong></div>
          {mode === "expert" ? (
            <>
              <div><span>Why rank matters</span><strong>Higher rank increases adapter capacity and trainable state</strong></div>
              <div><span>Inference overhead after merge</span><strong>No separate matrix pair remains on the token path</strong></div>
            </>
          ) : null}
        </div>
      </div>
    </LabFrame>
  );
}

const METHODS = [
  { name: "Full fine-tuning", train: 100, memory: "Very high", latency: "None", best: "Maximum capacity" },
  { name: "LoRA", train: 0.12, memory: "Low", latency: "None after merge", best: "Default behaviour adaptation" },
  { name: "QLoRA", train: 0.12, memory: "Lowest", latency: "None after merge", best: "Single-GPU constrained tuning" },
  { name: "Adapters", train: 0.3, memory: "Low", latency: "Added", best: "Composable task modules" },
  { name: "Prefix tuning", train: 0.01, memory: "Tiny", latency: "Consumes context", best: "Many tiny task profiles" },
] as const;

export function FineTuneMethodsLab({
  mode = "beginner",
  step = 1,
  onStepChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, METHODS.length - 1);
  const method = METHODS[active];
  return (
    <LabFrame
      eyebrow="Adaptation method comparison"
      title="See where each adaptation method intervenes"
      description="Compare what moves, what stays frozen, how much state training owns, and what cost remains during inference."
    >
      <Tabs labels={METHODS.map((item) => item.name)} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="method-workbench">
        <div className="model-stack" aria-label={`${method.name} model layers`}>
          {["Embeddings", "Attention", "Feed-forward", "Layer norms", "Output head"].map((part, index) => (
            <div className={active === 0 || (active === 4 && index === 0) ? "is-trained" : "is-frozen"} key={part}>
              <i />
              <span>{part}</span>
            </div>
          ))}
          {active === 1 || active === 2 || active === 3 ? <b className="model-sidecar">{active === 3 ? "Adapter" : "B × A"}</b> : null}
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Trainable share</span><strong>{method.train}%</strong></div>
          <div><span>Training memory</span><strong>{method.memory}</strong></div>
          <div><span>Inference cost</span><strong>{method.latency}</strong></div>
          <div><span>Best fit</span><strong>{method.best}</strong></div>
        </div>
      </div>
      {mode === "expert" ? <p className="lab-formula">Choose target modules and learning rate before increasing rank.</p> : null}
    </LabFrame>
  );
}
