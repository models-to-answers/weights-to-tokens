"use client";

import type { CSSProperties, ReactNode } from "react";
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
        <span>interactive model console</span>
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

const JOURNEY_STAGES = [
  ["Learn", "Model", "Examples change billions of parameter values."],
  ["Package", "Model", "Weights, config, tokenizer, and metadata form an artifact."],
  ["Place", "System", "The artifact moves through host memory into GPU HBM."],
  ["Admit", "System", "Routing, capacity, and batching decide when work begins."],
  ["Tokenize", "System", "Text becomes the IDs the model consumes."],
  ["Prefill", "GPU", "Prompt positions run together and create the KV cache."],
  ["Launch", "GPU", "Framework operations enqueue GPU kernels."],
  ["Schedule", "GPU", "Blocks become resident and eligible warps issue."],
  ["Read memory", "GPU", "Registers, cache, shared memory, and HBM feed operands."],
  ["Decode", "GPU", "One next-token distribution is produced per sequence."],
  ["Sample", "System", "A decoding policy selects the next token."],
  ["Stream", "System", "The token returns while unfinished sequences loop."],
] as const;

export function JourneyMapLab({
  mode = "beginner",
  step = 0,
  onStepChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, JOURNEY_STAGES.length - 1);
  const stage = JOURNEY_STAGES[active];
  return (
    <LabFrame
      eyebrow="Unified academy · Golden journey"
      title="Keep one prompt connected from learned weights to streamed text"
      description="This compact map is the orientation layer. The final replay uses the same twelve causal stages at system and GPU zoom levels."
    >
      <div className="journey-map">
        {JOURNEY_STAGES.map(([label, level], index) => (
          <button
            type="button"
            className={index < active ? "is-past" : index === active ? "is-active" : ""}
            data-level={level.toLowerCase()}
            key={label}
            onClick={() => onStepChange?.(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{label}</strong>
            <small>{level}</small>
          </button>
        ))}
      </div>
      <div className="journey-focus">
        <div><span>Current stage</span><strong>{stage[0]}</strong></div>
        <div><span>Zoom level</span><strong>{stage[1]}</strong></div>
        <p>{stage[2]}</p>
        {mode === "expert" ? <i>Canonical replay stage {active + 1} of {JOURNEY_STAGES.length}; changing zoom never changes this position.</i> : null}
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
    "The production model predicts",
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
      eyebrow="Original Academy interaction · Token Predictor"
      title="Watch a next-token distribution change"
      description="A model does not retrieve an answer. It recomputes a distribution over possible next tokens at every position."
    >
      <div className="lab-grid lab-grid--predictor">
        <div>
          <Tabs
            labels={["Model", "GPU", "Decision"]}
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
                <b style={{ width: `${probability * 100}%` }} />
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
  { name: "Pretraining", share: 97.6, cost: "$10M–$100M+", outcome: "General capability" },
  { name: "Supervised tuning", share: 1.4, cost: "$10K–$1M", outcome: "Instruction following" },
  { name: "Preference training", share: 0.8, cost: "$10K–$1M", outcome: "Judgement and safety" },
  { name: "Evaluation & release", share: 0.2, cost: "Continuous", outcome: "A shippable artifact" },
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
      eyebrow="Original Academy interaction · Pipeline Stages"
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
        <div><span>Indicative cost</span><strong>{stage.cost}</strong></div>
        <div><span>Primary outcome</span><strong>{stage.outcome}</strong></div>
        {mode === "expert" ? (
          <div><span>Interpretation</span><strong>Compute share ≠ product-value share</strong></div>
        ) : null}
      </div>
    </LabFrame>
  );
}

export function ParameterBuilderLab({
  mode = "beginner",
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const layers = numeric(inputs, "layers", 32);
  const width = numeric(inputs, "width", 4096);
  const vocabulary = numeric(inputs, "vocabulary", 128000);
  const multiplier = numeric(inputs, "ffn", 4);
  const embeddings = vocabulary * width;
  const attention = layers * 4 * width * width;
  const feedForward = layers * 2 * multiplier * width * width;
  const total = embeddings + attention + feedForward;
  const billions = total / 1e9;

  return (
    <LabFrame
      eyebrow="Original Academy interaction · Parameter Builder"
      title="Build a transformer and watch width bite"
      description="Depth grows parameter count linearly. Width appears inside square matrices, so a modest increase changes memory far faster."
    >
      <div className="lab-grid">
        <div className="slider-stack">
          <Slider label="Layers" value={layers} min={8} max={96} step={4} onChange={(value) => onInputChange?.("layers", value)} />
          <Slider label="Width" value={width} min={1024} max={12288} step={512} onChange={(value) => onInputChange?.("width", value)} />
          <Slider label="Vocabulary" value={vocabulary} min={32000} max={256000} step={8000} onChange={(value) => onInputChange?.("vocabulary", value)} />
          <Slider label="FFN multiplier" value={multiplier} min={2} max={8} onChange={(value) => onInputChange?.("ffn", value)} />
        </div>
        <div>
          <div className="parameter-total">
            <span>Approximate dense parameters</span>
            <strong>{billions.toFixed(2)}B</strong>
            <small>{(billions * 2).toFixed(1)} GB of 16-bit weights</small>
          </div>
          <div className="parameter-map">
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

const TRAINING_PHASES = [
  "Load batch",
  "Forward pass",
  "Measure loss",
  "Backpropagate",
  "All-reduce gradients",
  "Optimizer step",
  "Checkpoint",
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
  const cost = days * 24 * gpus * 2.5;

  return (
    <LabFrame
      eyebrow="Original Academy interaction · Training Run"
      title="Turn model scale into time and money"
      description="The arithmetic is predictable. Quality is not. Step through the distributed loop and change the assumptions."
    >
      <Tabs
        labels={TRAINING_PHASES}
        active={Math.min(step, TRAINING_PHASES.length - 1)}
        onChange={(index) => onStepChange?.(index)}
      />
      <div className="training-rack" aria-label="Training GPU ranks">
        {Array.from({ length: 16 }, (_, index) => (
          <i
            key={index}
            className={index <= Math.min(step, 6) * 2 ? "is-active" : ""}
          />
        ))}
        <span>{TRAINING_PHASES[Math.min(step, 6)]}</span>
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
          <div><span>Accelerator rental</span><strong>${Math.round(cost).toLocaleString()}</strong></div>
          {mode === "expert" ? <div><span>Estimator</span><strong>C ≈ 6ND / achieved throughput</strong></div> : null}
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
  const active = Math.min(step, PREFERENCES.length - 1);
  const item = PREFERENCES[active];
  const picks = PREFERENCES.map((_, index) => inputs?.[`pick-${index}`]);
  const agreeable = picks.filter((pick) => pick === "agreeable").length;
  return (
    <LabFrame
      eyebrow="Original Academy interaction · Preference Trainer"
      title="Train the judge—and expose its bias"
      description="Preference data teaches behaviour, but the reward signal inherits what raters consistently choose."
    >
      <Tabs
        labels={PREFERENCES.map((_, index) => `Comparison ${index + 1}`)}
        active={active}
        onChange={(index) => onStepChange?.(index)}
      />
      <p className="preference-prompt">{item.prompt}</p>
      <div className="preference-grid">
        {([
          ["honest", item.honest],
          ["agreeable", item.agreeable],
        ] as const).map(([id, text]) => (
          <button
            type="button"
            className={picks[active] === id ? "is-selected" : ""}
            onClick={() => onInputChange?.(`pick-${active}`, id)}
            key={id}
          >
            <span>{id === "honest" ? "Answer A" : "Answer B"}</span>
            <p>{text}</p>
            <strong>Reward this response</strong>
          </button>
        ))}
      </div>
      <div className="bias-meter">
        <span>Truth-seeking</span>
        <i><b style={{ width: `${(agreeable / PREFERENCES.length) * 100}%` }} /></i>
        <span>Agreeable</span>
      </div>
      {mode === "expert" ? (
        <p className="lab-formula">
          A proxy reward is an optimization target, not ground truth. Evaluate
          reward hacking and sycophancy separately.
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
      eyebrow="Original Academy interaction · Weights Spectrum"
      title="Inspect what a model release actually gives you"
      description="Open versus closed is a spectrum of artifacts, rights, operational control, and withheld know-how."
    >
      <Tabs labels={RELEASES.map((item) => item.name)} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="release-matrix">
        <span />
        {RELEASE_FIELDS.map((field) => <strong key={field}>{field}</strong>)}
        {RELEASES.map((release, row) => (
          <div className={row === active ? "is-active" : ""} key={release.name}>
            <b>{release.name}</b>
            {release.values.map((value, index) => (
              <i key={RELEASE_FIELDS[index]}>{value ? "●" : "—"}</i>
            ))}
          </div>
        ))}
      </div>
      <p className="lab-verdict">{RELEASES[active].note}</p>
      {mode === "expert" ? <p className="lab-formula">Operational ownership: quantization + batching + KV cache + scaling + evaluation</p> : null}
    </LabFrame>
  );
}

const LORA_STAGES = [
  "Full fine-tuning",
  "Freeze the base",
  "Insert low-rank pair",
  "Reconstruct update",
  "Merge and serve",
] as const;

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
      eyebrow="Original Academy interaction · LoRA Lab"
      title="Freeze billions; train a thin update"
      description="Step from full fine-tuning to a mergeable low-rank update and inspect how rank changes capacity and memory."
    >
      <Tabs labels={LORA_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="lora-stage">
        <div>
          <span>Frozen base W</span>
          <MatrixArt rank={32} />
        </div>
        <strong>+</strong>
        <div className={active < 2 ? "is-hidden" : ""}>
          <span>Update ΔW = B × A</span>
          <MatrixArt rank={rank} accent />
        </div>
        <strong>=</strong>
        <div className={active < 4 ? "is-muted" : ""}>
          <span>Merged weights</span>
          <MatrixArt rank={32} />
        </div>
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
          <div><span>Trainable parameters</span><strong>{(trainable / 1e6).toFixed(1)}M</strong></div>
          <div><span>Share of 7B model</span><strong>{((trainable / 7e9) * 100).toFixed(3)}%</strong></div>
          <div><span>Base storage</span><strong>{quantized ? "3.5 GB" : "14 GB"}</strong></div>
          {mode === "expert" ? <div><span>Inference overhead after merge</span><strong>None</strong></div> : null}
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
      eyebrow="Original Academy interaction · Fine-tune Methods"
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
