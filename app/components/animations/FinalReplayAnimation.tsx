"use client";

import { animationStageLabels } from "@/src/content/animation-stages";
import { PlaybackControls } from "../PlaybackControls";
import type { AnimationStep, DeterministicAnimationProps } from "./types";
import { useDeterministicPlayback } from "./useDeterministicPlayback";

export type ReplayView = "system" | "gpu";

type FinalReplayAnimationProps = DeterministicAnimationProps & {
  view?: ReplayView;
};

const titles = animationStageLabels["animation.replay.one-prompt"];
const steps: AnimationStep[] = [
  { id: "artifact", title: titles[0], beginner: "Training has already produced a versioned model artifact.", expert: "The checkpoint, configuration, tokenizer, tensor layout, and manifest identify one immutable version." },
  { id: "load", title: titles[1], beginner: "The worker copies model weight shards into GPU high-bandwidth memory.", expert: "Verified shards move through node cache and pinned host memory into assigned HBM regions." },
  { id: "ready", title: titles[2], beginner: "Memory pools, kernels, and health checks pass; request admission opens.", expert: "Ranks join communicators, reserve KV blocks, initialize execution paths, warm representative shapes, and publish readiness." },
  { id: "admit", title: titles[3], beginner: "The prompt “How do GPUs work?” is authenticated, routed, and admitted.", expert: "Admission selects this warm worker using capacity, latency budget, and cache locality." },
  { id: "tokenize", title: titles[4], beginner: "The tokenizer converts the prompt into model-specific token IDs.", expert: "The request now owns input IDs, boundaries, and generation settings." },
  { id: "prefill", title: titles[5], beginner: "Prefill launches GPU kernels over all prompt positions and begins the KV cache.", expert: "Blocks are admitted to SMs; eligible warps issue compute and memory instructions for layer kernels." },
  { id: "logits", title: titles[6], beginner: "Prompt attention state is cached and the model produces its first next-token distribution.", expert: "Per-layer key/value blocks are resident; final-layer logits reach the decoding policy." },
  { id: "sample", title: titles[7], beginner: "The decoding policy selects the first output token: “GPUs”.", expert: "Temperature and other decoding constraints transform logits before token ID 48012 is selected." },
  { id: "first-stream", title: titles[8], beginner: "The first token becomes visible text. This is time to first token.", expert: "Detokenization emits the first response event while the sequence returns to decode." },
  { id: "decode", title: titles[9], beginner: "Decode repeatedly launches kernels, reads weights and KV state, and appends one new cache position.", expert: "Each iteration schedules decode kernels, memory service, logits, sampling, KV append, and rescheduling." },
  { id: "grow", title: titles[10], beginner: "More tokens stream while the same resident model weights are reused.", expert: "Inter-token latency is measured between incremental response events; cancellation and stop checks run every iteration." },
  { id: "complete", title: titles[11], beginner: "The response is complete, request resources are released, and the worker remains ready.", expert: "The stop condition closes the stream, frees request KV blocks, records completion, and returns capacity to admission." },
];

const promptTokens = ["How", "do", "GPUs", "work", "?"] as const;
const responseTokens = ["GPUs", "run", "many", "calculations", "in", "parallel", "."] as const;

function outputCountFor(stage: number): number {
  if (stage < 8) return 0;
  if (stage === 8) return 1;
  if (stage === 9) return 3;
  if (stage === 10) return 6;
  return responseTokens.length;
}

function SystemReplayScene({ stage }: { stage: number }) {
  const outputCount = outputCountFor(stage);
  const requestState = stage < 3 ? "not submitted" : stage === 3 ? "admitted" : stage === 4 ? "tokenized" : stage < 11 ? "running" : "complete";
  const workerState = stage === 0 ? "cold" : stage === 1 ? "loading" : stage < 5 ? "ready" : stage < 11 ? "busy" : "ready";
  return (
    <div className="replay-system-scene">
      <div className={`replay-system-node ${stage >= 3 ? "is-past" : ""}`}><span>Client</span><strong>How do GPUs work?</strong></div>
      <i>→</i>
      <div className={`replay-system-node ${stage === 3 || stage === 4 ? "is-active" : stage > 4 ? "is-past" : ""}`}><span>Gateway + scheduler</span><strong>{requestState}</strong></div>
      <i>→</i>
      <div className={`replay-system-node ${stage >= 1 && stage <= 10 ? "is-active" : stage === 11 ? "is-past" : ""}`}><span>Model worker</span><strong>{workerState}</strong><small>{stage < 1 ? "artifact available" : stage === 1 ? "copying weights" : "model v42"}</small></div>
      <i>→</i>
      <div className={`replay-system-node ${stage >= 5 && stage <= 10 ? "is-active" : ""}`}><span>GPU</span><strong>{stage < 5 ? "ready" : stage <= 6 ? "prefill" : stage <= 10 ? "decode loop" : "ready"}</strong></div>
      <div className="replay-response">
        <span>Streamed response</span>
        <p>{outputCount ? responseTokens.slice(0, outputCount).join(" ").replace(" .", ".") : <em>No output token yet</em>}</p>
        <strong>{stage === 11 ? "Complete ✓" : outputCount ? `${outputCount} tokens visible` : "waiting"}</strong>
      </div>
    </div>
  );
}

function GpuReplayScene({ stage, expert }: { stage: number; expert: boolean }) {
  const outputCount = outputCountFor(stage);
  const kvCount = stage < 6 ? 0 : promptTokens.length + outputCount;
  const kernel = stage < 5 ? "none" : stage === 5 ? "prefill attention / GEMM" : stage <= 8 ? "logits + sampling" : stage <= 10 ? "decode attention / GEMM" : "none";
  const gpuActive = stage === 1 || (stage >= 5 && stage <= 10);
  return (
    <div className="replay-gpu-scene">
      <div className="replay-gpu-status">
        <div><span>Weights in HBM</span><strong>{stage < 1 ? "0%" : stage === 1 ? "loading shards" : "100% · reused"}</strong></div>
        <div><span>Command stream</span><strong>{gpuActive ? "work enqueued" : "idle / ready"}</strong></div>
        <div><span>Current kernel</span><strong>{kernel}</strong></div>
      </div>
      <div className={`replay-gpu-work ${gpuActive ? "is-active" : ""}`}>
        <div><span>Representative grid</span>{Array.from({ length: 8 }, (_, index) => <i className={gpuActive && index < 6 ? "is-live" : ""} key={index}>B{index}</i>)}</div>
        <div><span>Selected block → warps</span>{Array.from({ length: 4 }, (_, index) => <i className={gpuActive && index < 2 ? "is-live" : ""} key={index}>W{index}</i>)}</div>
        <div><span>Issue + memory</span><strong>{stage === 5 || stage === 9 ? "scheduler → tensor / LD-ST → cache / HBM" : gpuActive ? "dependent GPU work" : "no active kernel"}</strong></div>
      </div>
      <div className="replay-gpu-cache">
        <span>KV-cache positions</span>
        <div>{Array.from({ length: 12 }, (_, index) => <i className={index < kvCount ? index < promptTokens.length ? "is-prompt" : "is-output" : ""} key={index}>{index < kvCount ? index + 1 : ""}</i>)}</div>
        <strong>{kvCount ? `${promptTokens.length} prompt + ${Math.max(0, kvCount - promptTokens.length)} output positions` : "not allocated for this request"}</strong>
      </div>
      {expert ? <p className="replay-gpu-expert">Prefill and each decode iteration reuse fixed weights while activation shapes, KV positions, eligible warps, and memory traffic change.</p> : null}
    </div>
  );
}

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

  return (
    <section className="replay-console replay-console--v2" data-animation-id="animation.replay.one-prompt">
      <header>
        <div>
          <p>{props.mode === "expert" ? "Expert replay" : "Core replay"}</p>
          <h3>{view === "system" ? "One prompt: system view" : "One prompt: GPU view"}</h3>
        </div>
        <span>one scenario · two synchronized views</span>
      </header>
      <div className="replay-console__rail" aria-label={`Stage ${active + 1}: ${activeStep.title}`}>
        {steps.map((item, index) => (
          <button type="button" aria-current={index === active ? "step" : undefined} className={index < active ? "is-past" : index === active ? "is-active" : ""} onClick={() => props.onStepChange?.(index)} key={item.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.title}</strong>
          </button>
        ))}
      </div>
      <div className="replay-scenario">
        <div><span>Prompt</span><strong>How do GPUs work?</strong></div>
        <div><span>Illustrative response</span><strong>{responseTokens.join(" ").replace(" .", ".")}</strong></div>
      </div>
      {view === "system" ? <SystemReplayScene stage={active} /> : <GpuReplayScene stage={active} expert={props.mode === "expert"} />}
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
