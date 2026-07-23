"use client";

import { StepAnimation } from "./StepAnimation";
import type {
  AnimationStep,
  DeterministicAnimationProps,
  DiagramNode,
} from "./types";

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

const systemNodes: DiagramNode[] = [
  { id: "weights", label: "Learned weights", detail: "training output" },
  { id: "artifact", label: "Model artifact", detail: "weights + config + tokenizer" },
  { id: "ready", label: "Ready worker", detail: "loaded + warmed" },
  { id: "arrival", label: "Admitted request", detail: "route + capacity" },
  { id: "tokens", label: "Input tokens", detail: "text → IDs" },
  { id: "prefill", label: "Prefill", detail: "context processing" },
  { id: "gpu", label: "GPU runtime", detail: "ordered operations" },
  { id: "kernel", label: "Kernel launch", detail: "grid + blocks" },
  { id: "warps", label: "Execution", detail: "warps issue" },
  { id: "memory", label: "Memory service", detail: "operands move" },
  { id: "decode", label: "Decode loop", detail: "next-token iteration" },
  { id: "stream", label: "Streamed text", detail: "IDs → response" },
];

const gpuNodes: DiagramNode[] = [
  { id: "weights", label: "Checkpoint tensors", detail: "learned values" },
  { id: "artifact", label: "Weight shards", detail: "typed + shaped" },
  { id: "ready", label: "HBM placement", detail: "weights resident" },
  { id: "arrival", label: "Work queue", detail: "request admitted" },
  { id: "tokens", label: "Input buffers", detail: "token IDs" },
  { id: "prefill", label: "Prefill kernels", detail: "KV blocks created" },
  { id: "gpu", label: "Command stream", detail: "dependencies ordered" },
  { id: "kernel", label: "Grid → blocks", detail: "assigned to SMs" },
  { id: "warps", label: "Warp schedulers", detail: "ready instructions" },
  { id: "memory", label: "Cache → HBM", detail: "coalesced traffic" },
  { id: "decode", label: "Decode kernels", detail: "logits + KV append" },
  { id: "stream", label: "Output buffer", detail: "token returned" },
];

export function FinalReplayAnimation({
  view = "system",
  ...props
}: FinalReplayAnimationProps) {
  const nodes = view === "system" ? systemNodes : gpuNodes;
  return (
    <StepAnimation
      {...props}
      animationId={`final-replay-${view}`}
      title={view === "system" ? "One prompt: system view" : "One prompt: GPU view"}
      summary="The timeline stays fixed while the zoom level changes."
      steps={steps}
      nodes={nodes}
      activeNodeIds={(step) => nodes.slice(0, step + 1).map((node) => node.id)}
    />
  );
}

export default FinalReplayAnimation;
