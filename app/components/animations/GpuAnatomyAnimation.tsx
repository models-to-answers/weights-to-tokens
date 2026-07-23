"use client";

import { StepAnimation } from "./StepAnimation";
import type { AnimationStep, DeterministicAnimationProps, DiagramNode } from "./types";

const steps: AnimationStep[] = [
  { id: "gpu", title: "GPU package", beginner: "A GPU is a processor built to run large amounts of parallel work.", expert: "The package combines compute dies, memory controllers, caches, copy engines, and external links." },
  { id: "hbm", title: "High-bandwidth memory", beginner: "HBM holds model weights, cache, and working data.", expert: "Memory controllers feed partitions of HBM through the cache hierarchy to many SMs." },
  { id: "sm", title: "Streaming multiprocessor", beginner: "The GPU contains many repeated compute neighborhoods called SMs.", expert: "Each SM owns schedulers, execution pipelines, registers, and programmer-managed shared memory." },
  { id: "scheduler", title: "Warp scheduler", beginner: "A scheduler chooses which ready group of threads runs next.", expert: "Eligible warps issue instructions when operands, dependencies, and execution resources permit." },
  { id: "cores", title: "Execution units", beginner: "Different units perform arithmetic and data movement.", expert: "Scalar lanes, tensor units, load/store paths, and special-function units serve different instructions." },
  { id: "local", title: "On-chip memory", beginner: "Registers and shared memory keep nearby data fast.", expert: "Registers are private to threads; shared memory is explicit, low-latency storage shared by a thread block." },
];

const nodes: DiagramNode[] = [
  { id: "gpu", label: "GPU", detail: "package-level view" },
  { id: "hbm", label: "HBM", detail: "weights + KV + activations" },
  { id: "sm", label: "SM", detail: "resident thread blocks" },
  { id: "scheduler", label: "Warp scheduler", detail: "selects eligible warp" },
  { id: "cores", label: "Execution units", detail: "tensor / scalar / load-store" },
  { id: "local", label: "Registers + shared memory", detail: "thread-local + block-shared" },
];

export function GpuAnatomyAnimation(props: DeterministicAnimationProps) {
  return (
    <StepAnimation
      {...props}
      animationId="animation.inside-gpu.zoom-anatomy"
      title="Zoom into a GPU"
      summary="Move from the whole device to the resources that execute an instruction."
      steps={steps}
      nodes={nodes}
      activeNodeIds={(step) => nodes.slice(0, step + 1).map((node) => node.id)}
    >
      {(step) => (
        <p className="step-animation__zoom-level">
          Zoom level: {step + 1} of {steps.length}
        </p>
      )}
    </StepAnimation>
  );
}

export default GpuAnatomyAnimation;
