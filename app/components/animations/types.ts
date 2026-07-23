import type { ReactNode } from "react";
import type { SerializableScalar } from "@/src/domain";

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
  inputs?: Readonly<Record<string, SerializableScalar>>;
  onInputChange?: (key: string, value: SerializableScalar) => void;
  autoPlayIntervalMs?: number;
  className?: string;
};

export type DiagramNode = {
  id: string;
  label: string;
  detail?: ReactNode;
};
