"use client";

import { StepAnimation } from "./StepAnimation";
import type { AnimationStep, DeterministicAnimationProps, DiagramNode } from "./types";

const steps: AnimationStep[] = [
  { id: "artifact", title: "Locate artifact", beginner: "The serving system finds the model files.", expert: "The deployment resolves an immutable checkpoint, configuration, tokenizer, and shard map." },
  { id: "worker", title: "Start workers", beginner: "Inference processes start on the assigned machines.", expert: "The runtime binds worker ranks to devices and initializes process groups." },
  { id: "allocate", title: "Reserve GPU memory", beginner: "Space is reserved for weights and live requests.", expert: "HBM is partitioned among parameters, KV cache blocks, activations, and runtime workspaces." },
  { id: "load", title: "Load weights", beginner: "Weight tensors move into GPU memory.", expert: "Shards stream through host memory to their owning ranks and are materialized in the serving precision." },
  { id: "warm", title: "Warm up", beginner: "Practice runs prepare fast execution paths.", expert: "Kernel selection, graph capture, memory pools, and communication buffers stabilize." },
  { id: "ready", title: "Declare ready", beginner: "Only after checks pass can prompts reach the model.", expert: "Health and readiness gates verify every rank before the router admits production traffic." },
];

const nodes: DiagramNode[] = [
  { id: "artifact", label: "Model storage", detail: "checkpoint shards" },
  { id: "worker", label: "Workers", detail: "rank per device" },
  { id: "allocate", label: "HBM plan", detail: "weights + KV + workspace" },
  { id: "load", label: "Weights loaded", detail: "host → device transfer" },
  { id: "warm", label: "Warm runtime", detail: "kernels + graphs + buffers" },
  { id: "ready", label: "Ready endpoint", detail: "all ranks healthy" },
];

export function ModelReadinessAnimation(props: DeterministicAnimationProps) {
  return (
    <StepAnimation
      {...props}
      animationId="animation.inference-system.model-loading"
      title="How a model becomes ready"
      summary="Loading is a staged system operation, not a single file copy."
      steps={steps}
      nodes={nodes}
      activeNodeIds={(step) => nodes.slice(0, step + 1).map((node) => node.id)}
    />
  );
}

export default ModelReadinessAnimation;
