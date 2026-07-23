"use client";

import { useState } from "react";
import { replayStageDefinitions } from "@/src/content";
import type { ChapterId, LearningMode } from "@/src/domain";
import { FinalReplayAnimation, type ReplayView } from "./animations";

type FinalReplayExperienceProps = {
  mode: LearningMode;
  step: number;
  onStepChange: (step: number) => void;
  onNavigateChapter: (chapterId: ChapterId) => void;
};

export function FinalReplayExperience({
  mode,
  step,
  onStepChange,
  onNavigateChapter,
}: FinalReplayExperienceProps) {
  const [view, setView] = useState<ReplayView>("system");
  const activeStage =
    replayStageDefinitions[Math.min(step, replayStageDefinitions.length - 1)];

  return (
    <div className="replay-experience">
      <div className="replay-toolbar">
        <div>
          <p className="section-label">Zoom level</p>
          <div className="view-switch" role="group" aria-label="Replay zoom level">
            {(["system", "gpu"] as ReplayView[]).map((item) => (
              <button
                type="button"
                key={item}
                className={view === item ? "is-active" : ""}
                aria-pressed={view === item}
                onClick={() => setView(item)}
              >
                {item === "system" ? "System view" : "GPU view"}
              </button>
            ))}
          </div>
        </div>
        <div className="replay-context">
          <span>Stage {step + 1} of {replayStageDefinitions.length}</span>
          <button
            type="button"
            onClick={() => onNavigateChapter(activeStage.chapterId)}
          >
            Open source chapter ↗
          </button>
        </div>
      </div>
      <p className="replay-view-note" aria-live="polite">
        {view === "system"
          ? "System view follows routing, readiness, scheduling, inference phases, and response streaming."
          : "GPU view keeps the same stage and reveals placement, kernels, blocks, warps, and memory activity."}
      </p>
      <FinalReplayAnimation
        mode={mode}
        view={view}
        step={step}
        onStepChange={onStepChange}
        autoPlayIntervalMs={1700}
      />
    </div>
  );
}
