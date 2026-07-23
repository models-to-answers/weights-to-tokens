"use client";

import { PlaybackControls } from "../PlaybackControls";
import type {
  AnimationStep,
  DeterministicAnimationProps,
} from "./types";
import { useDeterministicPlayback } from "./useDeterministicPlayback";

export type ReplayView = "system" | "gpu";

type FinalReplayAnimationProps = DeterministicAnimationProps & {
  view?: ReplayView;
};

const steps: AnimationStep[] = [
  { id: "weights", title: "Weights are learned", beginner: "Training produces reusable model weights.", expert: "Loss gradients and optimizer updates have produced a versioned checkpoint." },
  { id: "artifact", title: "The artifact is stored", beginner: "Weights, configuration, and tokenizer assets are packaged together.", expert: "Immutable shards and a manifest preserve tensor layout, precision, and compatibility metadata." },
  { id: "ready", title: "The model becomes ready", beginner: "Workers load and warm the model on one or more GPUs.", expert: "Ranks allocate HBM, load shards, initialize communication, warm kernels, and pass readiness checks." },
  { id: "arrival", title: "A prompt is admitted", beginner: "The serving system accepts and schedules the request.", expert: "Routing and admission control select a healthy worker with suitable capacity and cache locality." },
  { id: "tokens", title: "Text becomes token IDs", beginner: "The tokenizer converts the prompt into model input IDs.", expert: "Tokenizer rules add model-specific IDs, boundaries, and request metadata." },
  { id: "prefill", title: "Prefill processes the prompt", beginner: "The GPU reads the prompt positions and creates attention state.", expert: "Layer kernels compute activations and write initial keys and values into allocated KV blocks." },
  { id: "gpu", title: "The view enters the GPU", beginner: "Model operations are dispatched to GPU compute and memory.", expert: "Command streams order kernels and dependencies while tensors reside across HBM and cache." },
  { id: "kernel", title: "A kernel is launched", beginner: "A grid of thread blocks is submitted for execution.", expert: "Launch dimensions and resource usage determine which blocks can become resident on SMs." },
  { id: "warps", title: "Warps execute instructions", beginner: "Schedulers select ready groups of threads.", expert: "Scoreboards, operands, dependencies, and functional-unit availability determine warp eligibility." },
  { id: "memory", title: "Memory supplies operands", beginner: "The memory hierarchy feeds data to the executing threads.", expert: "Coalescing, cache hits, shared-memory use, and HBM bandwidth shape the service time." },
  { id: "decode", title: "Decode predicts a token", beginner: "The model selects one next token and updates its cache.", expert: "Decode kernels read weights and KV state, produce logits, sample, append KV, and reschedule." },
  { id: "stream", title: "The token is streamed", beginner: "The token becomes text and appears in the response.", expert: "Detokenization and stop rules convert generated IDs into incremental response events." },
];

const systemLabels = [
  "Learned weights", "Model artifact", "Ready worker", "Admitted request",
  "Input tokens", "Prefill", "GPU runtime", "Kernel launch", "Execution",
  "Memory service", "Decode loop", "Streamed text",
] as const;

const gpuLabels = [
  "Checkpoint tensors", "Weight shards", "HBM placement", "Work queue",
  "Input buffers", "Prefill kernels", "Command stream", "Grid → blocks",
  "Warp schedulers", "Cache → HBM", "Decode kernels", "Output buffer",
] as const;

export function FinalReplayAnimation({
  view = "system",
  ...props
}: FinalReplayAnimationProps) {
  const playback = useDeterministicPlayback({
    step: props.step,
    defaultStep: props.defaultStep,
    stepCount: steps.length,
    autoPlayIntervalMs: props.autoPlayIntervalMs,
    onStepChange: props.onStepChange,
  });
  const active = playback.currentStep;
  const activeStep = steps[active];
  const labels = view === "system" ? systemLabels : gpuLabels;
  return (
    <section className="replay-console" data-animation-id="animation.replay.one-prompt">
      <header>
        <div>
          <p>{props.mode === "expert" ? "Expert replay" : "Beginner replay"}</p>
          <h3>{view === "system" ? "One prompt: system view" : "One prompt: GPU view"}</h3>
        </div>
        <span>one timeline · two zoom levels</span>
      </header>
      <div className="replay-console__rail" role="img" aria-label={`Stage ${active + 1}: ${activeStep.title}. ${activeStep.beginner}`}>
        {labels.map((label, index) => (
          <button
            type="button"
            className={index < active ? "is-past" : index === active ? "is-active" : ""}
            onClick={() => props.onStepChange?.(index)}
            key={label}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{label}</strong>
          </button>
        ))}
      </div>
      <div className="replay-console__scene">
        <div className="replay-scene__model">
          <span>Model state</span>
          <div>{Array.from({ length: 12 }, (_, index) => <i className={index <= active ? "is-live" : ""} key={index} />)}</div>
          <strong>{active < 2 ? "being created" : active < 6 ? "resident and reused" : "feeding GPU work"}</strong>
        </div>
        <div className="replay-scene__request">
          <span>Request state</span>
          <div className="token-ribbon">{["How", "do", "GPUs", "work", "?"].map((token, index) => <i className={active >= 4 && index <= active - 4 ? "is-live" : ""} key={token}>{token}</i>)}</div>
          <strong>{active < 3 ? "not admitted" : active < 10 ? "in flight" : "generating output"}</strong>
        </div>
        <div className="replay-scene__gpu">
          <span>GPU state</span>
          <div>{Array.from({ length: 32 }, (_, index) => <i className={active >= 5 && index < Math.min(32, (active - 4) * 6) ? "is-live" : ""} key={index} />)}</div>
          <strong>{active < 5 ? "idle / ready" : active < 10 ? "kernels and warps active" : "decode iteration"}</strong>
        </div>
      </div>
      <div className="replay-console__explanation" aria-live="polite">
        <div><span>Stage {active + 1} of {steps.length}</span><strong>{activeStep.title}</strong></div>
        <p>{activeStep.beginner}</p>
        {props.mode === "expert" && activeStep.expert ? <p>{activeStep.expert}</p> : null}
      </div>
      <PlaybackControls
        currentStep={active}
        totalSteps={steps.length}
        isPlaying={playback.isPlaying}
        onPrevious={playback.previous}
        onNext={playback.next}
        onPlayPause={playback.togglePlayback}
        onReset={playback.reset}
        label="One prompt replay playback"
        reducedMotion={playback.reducedMotion}
      />
    </section>
  );
}

export default FinalReplayAnimation;
