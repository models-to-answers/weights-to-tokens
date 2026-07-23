"use client";

import { StepAnimation } from "./StepAnimation";
import type { AnimationStep, DeterministicAnimationProps, DiagramNode } from "./types";

const steps: AnimationStep[] = [
  { id: "tokenize", title: "Tokenize", beginner: "The prompt becomes a sequence of token IDs.", expert: "Tokenizer rules map text into model-vocabulary IDs before GPU execution." },
  { id: "batch", title: "Batch", beginner: "The scheduler groups compatible requests.", expert: "Continuous batching balances queue delay, token capacity, and available KV blocks." },
  { id: "prefill", title: "Prefill", beginner: "All prompt tokens are processed together.", expert: "Compute-heavy matrix operations create hidden states for the full context in parallel." },
  { id: "cache", title: "Create KV cache", beginner: "Reusable attention memory is saved for each prompt token.", expert: "Every transformer layer stores key and value vectors addressed by sequence and token position." },
  { id: "decode", title: "Decode one token", beginner: "The model uses the cache to choose the next token.", expert: "A memory-bandwidth-sensitive iteration reads parameters and prior KV state, then samples from logits." },
  { id: "repeat", title: "Append and repeat", beginner: "The new token joins the cache and generation continues.", expert: "The scheduler can reshape the batch between iterations until each sequence reaches a stop condition." },
];

const nodes: DiagramNode[] = [
  { id: "tokenize", label: "Prompt tokens", detail: "[315, 892, 41, …]" },
  { id: "batch", label: "Scheduled batch", detail: "token budget + KV capacity" },
  { id: "prefill", label: "Prefill compute", detail: "many prompt tokens in parallel" },
  { id: "cache", label: "KV cache", detail: "keys/values per layer" },
  { id: "decode", label: "Next token", detail: "logits → sampling" },
  { id: "repeat", label: "Decode loop", detail: "append KV + reschedule" },
];

export function PrefillKvDecodeAnimation(props: DeterministicAnimationProps) {
  return (
    <StepAnimation
      {...props}
      animationId="animation.inference-system.prefill-decode"
      title="Prefill, KV cache, and decode"
      summary="See why processing the prompt differs from generating the answer."
      steps={steps}
      nodes={nodes}
      activeNodeIds={(step) =>
        step === 5 ? ["cache", "decode", "repeat"] : [nodes[step].id]
      }
    />
  );
}

export default PrefillKvDecodeAnimation;
