"use client";

import { StepAnimation } from "./StepAnimation";
import type { AnimationStep, DeterministicAnimationProps, DiagramNode } from "./types";

const steps: AnimationStep[] = [
  { id: "weights", title: "Start with learned weights", beginner: "Training has produced a reusable model artifact.", expert: "Checkpoint tensors encode the learned parameters; config and tokenizer define how to run them." },
  { id: "ready", title: "Make the model ready", beginner: "Workers load and warm the model on one or more GPUs.", expert: "Ranks allocate HBM, load shards, initialize communication, warm kernels, and pass readiness checks." },
  { id: "arrival", title: "Receive a prompt", beginner: "A request reaches the inference service.", expert: "Admission control and routing select a healthy replica with suitable capacity and cache locality." },
  { id: "tokens", title: "Create tokens", beginner: "The prompt text becomes token IDs.", expert: "Tokenizer rules produce vocabulary IDs and request metadata before batching." },
  { id: "batch", title: "Schedule work", beginner: "The request joins a GPU batch.", expert: "The scheduler budgets tokens, KV blocks, queue delay, and active sequence slots." },
  { id: "prefill", title: "Run prefill", beginner: "The GPU processes the full prompt.", expert: "A sequence of kernels computes layer activations and initial attention state." },
  { id: "kernel", title: "Execute kernels", beginner: "Blocks and warps carry out each GPU operation.", expert: "Runtime launches become grids; block residency and warp eligibility drive instruction issue on SMs." },
  { id: "cache", title: "Store attention memory", beginner: "The KV cache remembers prior token context.", expert: "Paged per-layer KV blocks retain keys and values while the sequence remains active." },
  { id: "decode", title: "Decode repeatedly", beginner: "The model selects one new token, then repeats.", expert: "Each iteration reads weights and KV state, executes decode kernels, samples, appends KV, and reschedules." },
  { id: "multi", title: "Coordinate GPUs if needed", beginner: "A sharded model exchanges intermediate results across GPUs.", expert: "Collectives synchronize tensor-parallel ranks; pipeline or expert-parallel layouts add their own communication paths." },
  { id: "stream", title: "Stream the answer", beginner: "Tokens become text and appear in the response.", expert: "Detokenization, stop conditions, and incremental transport turn generated IDs into user-visible output." },
];

const nodes: DiagramNode[] = [
  { id: "weights", label: "Weights", detail: "learned checkpoint" },
  { id: "ready", label: "Ready model", detail: "loaded + warmed" },
  { id: "arrival", label: "Request", detail: "route + admit" },
  { id: "tokens", label: "Tokens", detail: "text → IDs" },
  { id: "batch", label: "Batch", detail: "scheduler decision" },
  { id: "prefill", label: "Prefill", detail: "prompt-wide compute" },
  { id: "kernel", label: "GPU execution", detail: "kernel → block → warp" },
  { id: "cache", label: "KV cache", detail: "attention memory" },
  { id: "decode", label: "Decode loop", detail: "next-token iteration" },
  { id: "multi", label: "GPU coordination", detail: "when model is sharded" },
  { id: "stream", label: "Answer", detail: "IDs → streamed text" },
];

export function FinalReplayAnimation(props: DeterministicAnimationProps) {
  return (
    <StepAnimation
      {...props}
      animationId="final-replay"
      title="One prompt, end to end"
      summary="Replay the entire academy as one continuous system timeline."
      steps={steps}
      nodes={nodes}
      activeNodeIds={(step) => nodes.slice(0, step + 1).map((node) => node.id)}
    />
  );
}

export default FinalReplayAnimation;
