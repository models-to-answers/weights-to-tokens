"use client";

import { StepAnimation } from "./StepAnimation";
import type { AnimationStep, DeterministicAnimationProps, DiagramNode } from "./types";

const steps: AnimationStep[] = [
  { id: "train", title: "Train", beginner: "Examples teach the model patterns.", expert: "Forward pass, loss, backpropagation, and optimizer updates repeat across batches." },
  { id: "weights", title: "Save weights", beginner: "Learning is stored as numeric weights.", expert: "A checkpoint records tensors plus configuration and tokenizer artifacts." },
  { id: "load", title: "Load", beginner: "The serving system loads those weights onto GPU memory.", expert: "Workers allocate HBM, load shards, initialize kernels, and warm execution paths." },
  { id: "prompt", title: "Receive prompt", beginner: "A prompt is converted into tokens and admitted for inference.", expert: "The scheduler batches token IDs under capacity, latency, and cache constraints." },
  { id: "prefill", title: "Understand context", beginner: "The GPU processes all prompt tokens and creates working memory.", expert: "Prefill computes attention states and writes per-layer keys and values into the KV cache." },
  { id: "decode", title: "Generate", beginner: "The model produces one new token at a time.", expert: "Each decode iteration reads weights and KV cache, samples a token, and appends its KV state." },
  { id: "stream", title: "Stream answer", beginner: "New tokens are decoded into text and streamed to the learner.", expert: "The serving layer detokenizes, applies stopping rules, and emits incremental response events." },
];

const nodes: DiagramNode[] = [
  { id: "train", label: "Training", detail: "loss → gradients → optimizer" },
  { id: "weights", label: "Model artifact", detail: "checkpoint + config + tokenizer" },
  { id: "load", label: "Ready GPU", detail: "weights in HBM" },
  { id: "prompt", label: "Prompt tokens", detail: "admission + batching" },
  { id: "prefill", label: "Prefill", detail: "parallel prompt processing" },
  { id: "decode", label: "Decode loop", detail: "one token per sequence/iteration" },
  { id: "stream", label: "Streaming text", detail: "detokenize + stop conditions" },
];

export function JourneyOverviewAnimation(props: DeterministicAnimationProps) {
  return (
    <StepAnimation
      {...props}
      animationId="journey-overview"
      title="From weights to tokens"
      summary="Follow one model from learning through a live inference response."
      steps={steps}
      nodes={nodes}
      activeNodeIds={(step) => nodes.slice(0, step + 1).map((node) => node.id)}
    />
  );
}

export default JourneyOverviewAnimation;
