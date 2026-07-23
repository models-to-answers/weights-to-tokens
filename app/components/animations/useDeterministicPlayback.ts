"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

type PlaybackOptions = {
  step?: number;
  defaultStep?: number;
  stepCount: number;
  autoPlayIntervalMs?: number;
  onStepChange?: (step: number) => void;
};

const clamp = (value: number, lastStep: number) =>
  Math.min(Math.max(Math.trunc(value), 0), lastStep);

export function useDeterministicPlayback({
  step,
  defaultStep = 0,
  stepCount,
  autoPlayIntervalMs = 1400,
  onStepChange,
}: PlaybackOptions) {
  const lastStep = Math.max(0, stepCount - 1);
  const isControlled = step !== undefined;
  const [internalStep, setInternalStep] = useState(() =>
    clamp(defaultStep, lastStep),
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const reducedMotion = useSyncExternalStore(
    (notify) => {
      if (typeof window.matchMedia !== "function") return () => undefined;
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    },
    () =>
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false,
    () => false,
  );
  const currentStep = clamp(isControlled ? step : internalStep, lastStep);

  const setStep = useCallback(
    (nextStep: number) => {
      const safeStep = clamp(nextStep, lastStep);
      if (!isControlled) {
        setInternalStep(safeStep);
      }
      onStepChange?.(safeStep);
    },
    [isControlled, lastStep, onStepChange],
  );

  useEffect(() => {
    if (!isPlaying || reducedMotion || currentStep >= lastStep) return;

    const timer = window.setTimeout(
      () => {
        const nextStep = currentStep + 1;
        setStep(nextStep);
        if (nextStep >= lastStep) {
          setIsPlaying(false);
        }
      },
      autoPlayIntervalMs,
    );
    return () => window.clearTimeout(timer);
  }, [
    autoPlayIntervalMs,
    currentStep,
    isPlaying,
    lastStep,
    reducedMotion,
    setStep,
  ]);

  const controls = useMemo(
    () => ({
      currentStep,
      isPlaying: isPlaying && currentStep < lastStep,
      previous: () => {
        setIsPlaying(false);
        setStep(currentStep - 1);
      },
      next: () => {
        setIsPlaying(false);
        setStep(currentStep + 1);
      },
      reset: () => {
        setIsPlaying(false);
        setStep(0);
      },
      togglePlayback: () => {
        if (reducedMotion) {
          setIsPlaying(false);
          setStep(currentStep >= lastStep ? 0 : currentStep + 1);
          return;
        }
        if (currentStep >= lastStep) {
          setStep(0);
          setIsPlaying(true);
          return;
        }
        setIsPlaying((playing) => !playing);
      },
    }),
    [currentStep, isPlaying, lastStep, reducedMotion, setStep],
  );

  return { ...controls, reducedMotion };
}
