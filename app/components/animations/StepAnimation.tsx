"use client";

import type { ReactNode } from "react";
import type { AnimationId } from "@/src/domain";
import { PlaybackControls } from "../PlaybackControls";
import type {
  AnimationStep,
  DeterministicAnimationProps,
  DiagramNode,
} from "./types";
import { useDeterministicPlayback } from "./useDeterministicPlayback";

type StepAnimationProps = DeterministicAnimationProps & {
  animationId: AnimationId;
  title: string;
  summary: string;
  steps: readonly AnimationStep[];
  nodes: readonly DiagramNode[];
  activeNodeIds: (step: number) => readonly string[];
  children?: (step: number) => ReactNode;
};

export function StepAnimation({
  animationId,
  title,
  summary,
  steps,
  nodes,
  activeNodeIds,
  children,
  mode = "beginner",
  step,
  defaultStep,
  onStepChange,
  autoPlayIntervalMs,
  className,
}: StepAnimationProps) {
  const playback = useDeterministicPlayback({
    step,
    defaultStep,
    stepCount: steps.length,
    autoPlayIntervalMs,
    onStepChange,
  });
  const activeStep = steps[playback.currentStep];
  const activeIds = new Set(activeNodeIds(playback.currentStep));

  return (
    <section
      className={[
        "step-animation",
        `step-animation--${animationId}`,
        `step-animation--${mode}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={`${animationId}-title`}
      data-animation-id={animationId}
      data-mode={mode}
      data-step={activeStep.id}
    >
      <header className="step-animation__header">
        <p className="step-animation__eyebrow">
          {mode === "expert" ? "Expert view" : "Beginner view"}
        </p>
        <h3 className="step-animation__title" id={`${animationId}-title`}>
          {title}
        </h3>
        <p className="step-animation__summary">{summary}</p>
      </header>

      <div
        className="step-animation__diagram"
        role="img"
        tabIndex={0}
        aria-label={`${title}. Current stage: ${activeStep.title}. ${activeStep.beginner}`}
      >
        <ol className="step-animation__nodes">
          {nodes.map((node, index) => {
            const isActive = activeIds.has(node.id);
            const isPast =
              index <
              Math.max(
                ...nodes
                  .map((candidate, candidateIndex) =>
                    activeIds.has(candidate.id) ? candidateIndex : -1,
                  )
                  .filter((candidateIndex) => candidateIndex >= 0),
              );

            return (
              <li
                className={[
                  "step-animation__node",
                  isActive && "step-animation__node--active",
                  isPast && "step-animation__node--past",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={node.id}
                aria-current={isActive ? "step" : undefined}
              >
                <span className="step-animation__node-index" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="step-animation__node-label">{node.label}</span>
                {mode === "expert" && node.detail ? (
                  <span className="step-animation__node-detail">
                    {node.detail}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
        {children?.(playback.currentStep)}
      </div>

      <div className="step-animation__explanation" aria-live="polite">
        <p className="step-animation__step-label">
          Stage {playback.currentStep + 1}: {activeStep.title}
        </p>
        <p>{activeStep.beginner}</p>
        {mode === "expert" && activeStep.expert ? (
          <p className="step-animation__expert-detail">{activeStep.expert}</p>
        ) : null}
      </div>

      <PlaybackControls
        currentStep={playback.currentStep}
        totalSteps={steps.length}
        isPlaying={playback.isPlaying}
        onPrevious={playback.previous}
        onNext={playback.next}
        onPlayPause={playback.togglePlayback}
        onReset={playback.reset}
        label={`${title} playback`}
        reducedMotion={playback.reducedMotion}
      />
    </section>
  );
}
