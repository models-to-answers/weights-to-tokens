"use client";

import { StepAnimation } from "./StepAnimation";
import type { AnimationStep, DeterministicAnimationProps, DiagramNode } from "./types";

const steps: AnimationStep[] = [
  { id: "batch", title: "Choose examples", beginner: "A small batch of training examples enters the model.", expert: "Tokenized examples and masks are packed into fixed-shape tensors." },
  { id: "predict", title: "Forward pass", beginner: "The current weights produce predictions.", expert: "Layer operations build activations and logits for the loss calculation." },
  { id: "loss", title: "Measure error", beginner: "A loss score says how far the prediction was from the target.", expert: "Cross-entropy compares target token IDs with the model's probability distribution." },
  { id: "gradient", title: "Assign responsibility", beginner: "Backpropagation finds which weights contributed to the error.", expert: "Automatic differentiation propagates gradients through the recorded computation graph." },
  { id: "update", title: "Update weights", beginner: "The optimizer nudges the weights, and the loop repeats.", expert: "The optimizer combines gradients, learning rate, and moment estimates to update parameters." },
];

const nodes: DiagramNode[] = [
  { id: "batch", label: "Examples", detail: "input IDs + labels + masks" },
  { id: "predict", label: "Model", detail: "forward activations" },
  { id: "loss", label: "Loss", detail: "cross-entropy" },
  { id: "gradient", label: "Gradients", detail: "∂loss / ∂weight" },
  { id: "update", label: "Updated weights", detail: "optimizer step" },
];

export function TrainingLoopAnimation(props: DeterministicAnimationProps) {
  return (
    <StepAnimation
      {...props}
      animationId="training-loop"
      title="How training changes weights"
      summary="One deterministic pass around the learning loop."
      steps={steps}
      nodes={nodes}
      activeNodeIds={(step) => [nodes[step].id]}
    >
      {(step) => (
        <p className="step-animation__loop-note">
          Loop {step === steps.length - 1 ? "returns to the next batch" : "continues"}
        </p>
      )}
    </StepAnimation>
  );
}

export default TrainingLoopAnimation;
