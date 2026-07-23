"use client";

export type PlaybackControlsProps = {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onReset: () => void;
  label?: string;
  className?: string;
};

export function PlaybackControls({
  currentStep,
  totalSteps,
  isPlaying,
  onPrevious,
  onNext,
  onPlayPause,
  onReset,
  label = "Animation playback",
  className,
}: PlaybackControlsProps) {
  const atStart = currentStep === 0;
  const atEnd = currentStep === totalSteps - 1;

  return (
    <div
      className={["playback-controls", className].filter(Boolean).join(" ")}
      role="group"
      aria-label={label}
    >
      <button
        className="playback-controls__button"
        type="button"
        onClick={onPrevious}
        disabled={atStart}
        aria-label="Previous step"
      >
        Previous
      </button>
      <button
        className="playback-controls__button playback-controls__button--primary"
        type="button"
        onClick={onPlayPause}
        aria-label={isPlaying ? "Pause animation" : atEnd ? "Replay animation" : "Play animation"}
      >
        {isPlaying ? "Pause" : atEnd ? "Replay" : "Play"}
      </button>
      <button
        className="playback-controls__button"
        type="button"
        onClick={onNext}
        disabled={atEnd}
        aria-label="Next step"
      >
        Next
      </button>
      <button
        className="playback-controls__button playback-controls__button--quiet"
        type="button"
        onClick={onReset}
        disabled={atStart && !isPlaying}
        aria-label="Reset animation"
      >
        Reset
      </button>
      <output className="playback-controls__status" aria-live="polite">
        Step {currentStep + 1} of {totalSteps}
      </output>
    </div>
  );
}

export default PlaybackControls;
