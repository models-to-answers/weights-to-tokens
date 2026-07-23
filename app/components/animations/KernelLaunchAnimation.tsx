"use client";

import { StepAnimation } from "./StepAnimation";
import type { AnimationStep, DeterministicAnimationProps, DiagramNode } from "./types";

const steps: AnimationStep[] = [
  { id: "operation", title: "Framework operation", beginner: "Model code asks for a tensor operation.", expert: "A framework or compiler selects a kernel implementation for the operation, shapes, types, and device." },
  { id: "launch", title: "Launch kernel", beginner: "The CPU submits a GPU job with its data and shape.", expert: "The runtime places a launch command, arguments, grid dimensions, and stream dependencies into a queue." },
  { id: "grid", title: "Create a grid", beginner: "The job is divided into independent blocks of threads.", expert: "A grid defines blocks; each block has a fixed thread index space and shared-memory allocation." },
  { id: "dispatch", title: "Dispatch blocks", beginner: "Hardware assigns blocks to available SMs.", expert: "The work distributor considers per-block registers, shared memory, and thread limits when establishing residency." },
  { id: "warps", title: "Form warps", beginner: "Threads inside a block execute in fixed-size groups called warps.", expert: "Thread indices are partitioned into warps that share an instruction stream while carrying per-thread state." },
  { id: "schedule", title: "Schedule instructions", beginner: "Each SM switches among ready warps to keep work moving.", expert: "Warp schedulers hide stalls by issuing from another eligible resident warp." },
  { id: "complete", title: "Complete kernel", beginner: "Results are written to memory and dependent work can continue.", expert: "Writes become visible under the stream's ordering rules; completion releases block resources and satisfies dependencies." },
];

const nodes: DiagramNode[] = [
  { id: "operation", label: "Tensor operation", detail: "framework / compiler" },
  { id: "launch", label: "Launch command", detail: "kernel + args + stream" },
  { id: "grid", label: "Grid of blocks", detail: "block/thread dimensions" },
  { id: "dispatch", label: "Resident blocks", detail: "resource-constrained assignment" },
  { id: "warps", label: "Warps", detail: "fixed thread groups" },
  { id: "schedule", label: "Issued instruction", detail: "eligible warp selected" },
  { id: "complete", label: "Output tensor", detail: "ordered completion" },
];

export function KernelLaunchAnimation(props: DeterministicAnimationProps) {
  return (
    <StepAnimation
      {...props}
      animationId="kernel-launch"
      title="One kernel launch, end to end"
      summary="Trace one tensor operation from model code to executed GPU instructions."
      steps={steps}
      nodes={nodes}
      activeNodeIds={(step) => nodes.slice(0, step + 1).map((node) => node.id)}
    />
  );
}

export default KernelLaunchAnimation;
