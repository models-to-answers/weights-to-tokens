"use client";

import { StepAnimation } from "./StepAnimation";
import type { AnimationStep, DeterministicAnimationProps, DiagramNode } from "./types";

const steps: AnimationStep[] = [
  { id: "one", title: "One GPU", beginner: "One GPU can serve the model when weights and working memory fit.", expert: "A single worker avoids cross-device collectives and offers the simplest latency path." },
  { id: "replicas", title: "Independent replicas", beginner: "Extra GPUs can run separate copies to serve more requests.", expert: "Data-parallel replicas raise throughput but do not make an oversized model fit one device." },
  { id: "shard", title: "Split one model", beginner: "A large model can be divided so several GPUs answer one request together.", expert: "Tensor, pipeline, or expert parallelism partitions weights or work across ranks." },
  { id: "communicate", title: "Coordinate", beginner: "The GPUs exchange intermediate results before generation can continue.", expert: "Collectives and point-to-point transfers introduce synchronization, topology, and bandwidth costs." },
  { id: "tradeoff", title: "Choose deliberately", beginner: "More GPUs help fit or scale a model, but communication is not free.", expert: "The serving design trades memory capacity, throughput, TTFT, inter-token latency, and fault domain size." },
];

const nodes: DiagramNode[] = [
  { id: "one", label: "Single GPU", detail: "one model, local memory" },
  { id: "replicas", label: "GPU replicas", detail: "independent request streams" },
  { id: "shard", label: "Model shards", detail: "TP / PP / EP ranks" },
  { id: "communicate", label: "GPU fabric", detail: "collectives + synchronization" },
  { id: "tradeoff", label: "Serving outcome", detail: "fit × throughput × latency" },
];

export function OneVsMultiGpuAnimation(props: DeterministicAnimationProps) {
  return (
    <StepAnimation
      {...props}
      animationId="animation.inference-system.multi-gpu"
      title="One GPU or many?"
      summary="Extra GPUs can add replicas or cooperate on one model—and those are different choices."
      steps={steps}
      nodes={nodes}
      activeNodeIds={(step) => [nodes[step].id]}
    />
  );
}

export default OneVsMultiGpuAnimation;
