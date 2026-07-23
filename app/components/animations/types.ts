import type { ReactNode } from "react";

export type LearningMode = "beginner" | "expert";

export type AnimationStep = {
  id: string;
  title: string;
  beginner: string;
  expert?: string;
};

export type DeterministicAnimationProps = {
  mode?: LearningMode;
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  autoPlayIntervalMs?: number;
  className?: string;
};

export type DiagramNode = {
  id: string;
  label: string;
  detail?: ReactNode;
};
