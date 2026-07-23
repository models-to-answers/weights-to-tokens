"use client";

import { useSyncExternalStore } from "react";
import type {
  AnimationId,
  ChapterId,
  LearningMode,
  QuestionId,
  ReplayStageId,
} from "../domain/catalog";
import type { DeterministicAnimationState } from "../domain/animation";

export const ACADEMY_STATE_VERSION = 1;
export const ACADEMY_STORAGE_KEY = "from-weights-to-tokens:progress";

export interface QuestionAttempt {
  selectedChoiceId: string;
  correct: boolean;
  attemptedAt: string;
}

export interface AcademyState {
  schemaVersion: typeof ACADEMY_STATE_VERSION;
  mode: LearningMode;
  completedBeginnerChapterIds: readonly ChapterId[];
  exploredExpertChapterIds: readonly ChapterId[];
  questionAttempts: Readonly<
    Partial<Record<QuestionId, readonly QuestionAttempt[]>>
  >;
  animationStates: Readonly<
    Partial<Record<AnimationId, DeterministicAnimationState>>
  >;
  completedReplayStageIds: readonly ReplayStageId[];
  finalReplayCompleted: boolean;
}

export type AcademyAction =
  | { type: "SET_MODE"; mode: LearningMode }
  | { type: "COMPLETE_BEGINNER_CHAPTER"; chapterId: ChapterId }
  | { type: "MARK_EXPERT_EXPLORED"; chapterId: ChapterId }
  | {
      type: "RECORD_QUESTION_ATTEMPT";
      questionId: QuestionId;
      attempt: QuestionAttempt;
    }
  | {
      type: "SAVE_ANIMATION_STATE";
      animation: DeterministicAnimationState;
    }
  | { type: "COMPLETE_REPLAY_STAGE"; stageId: ReplayStageId }
  | { type: "COMPLETE_FINAL_REPLAY" }
  | { type: "RESET_PROGRESS" }
  | { type: "HYDRATE"; state: AcademyState };

export const initialAcademyState: AcademyState = {
  schemaVersion: ACADEMY_STATE_VERSION,
  mode: "beginner",
  completedBeginnerChapterIds: [],
  exploredExpertChapterIds: [],
  questionAttempts: {},
  animationStates: {},
  completedReplayStageIds: [],
  finalReplayCompleted: false,
};

export function academyReducer(
  state: AcademyState,
  action: AcademyAction,
): AcademyState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "COMPLETE_BEGINNER_CHAPTER":
      return {
        ...state,
        completedBeginnerChapterIds: appendUnique(
          state.completedBeginnerChapterIds,
          action.chapterId,
        ),
      };
    case "MARK_EXPERT_EXPLORED":
      return {
        ...state,
        exploredExpertChapterIds: appendUnique(
          state.exploredExpertChapterIds,
          action.chapterId,
        ),
      };
    case "RECORD_QUESTION_ATTEMPT":
      return {
        ...state,
        questionAttempts: {
          ...state.questionAttempts,
          [action.questionId]: [
            ...(state.questionAttempts[action.questionId] ?? []),
            action.attempt,
          ],
        },
      };
    case "SAVE_ANIMATION_STATE":
      return {
        ...state,
        animationStates: {
          ...state.animationStates,
          [action.animation.animationId]: action.animation,
        },
      };
    case "COMPLETE_REPLAY_STAGE":
      return {
        ...state,
        completedReplayStageIds: appendUnique(
          state.completedReplayStageIds,
          action.stageId,
        ),
      };
    case "COMPLETE_FINAL_REPLAY":
      return { ...state, finalReplayCompleted: true };
    case "RESET_PROGRESS":
      return initialAcademyState;
    case "HYDRATE":
      return action.state;
  }
}

export interface AcademyStore {
  getSnapshot(): AcademyState;
  getServerSnapshot(): AcademyState;
  dispatch(action: AcademyAction): void;
  subscribe(listener: () => void): () => void;
}

export function createAcademyStore(
  storage: Storage | null = browserStorage(),
): AcademyStore {
  let state = loadAcademyState(storage);
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => state,
    getServerSnapshot: () => initialAcademyState,
    dispatch(action) {
      const next = academyReducer(state, action);
      if (next === state) return;
      state = next;
      saveAcademyState(storage, state);
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

let defaultStore: AcademyStore | undefined;

export function getAcademyStore(): AcademyStore {
  defaultStore ??= createAcademyStore();
  return defaultStore;
}

export function useAcademyStore<T>(
  selector: (state: AcademyState) => T,
): readonly [T, (action: AcademyAction) => void] {
  const store = getAcademyStore();
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  return [selector(state), store.dispatch];
}

export function serializeAcademyState(state: AcademyState): string {
  return JSON.stringify(state);
}

export function parseAcademyState(raw: string | null): AcademyState {
  if (!raw) return initialAcademyState;
  try {
    return migrateAcademyState(JSON.parse(raw) as unknown);
  } catch {
    return initialAcademyState;
  }
}

export function loadAcademyState(storage: Storage | null): AcademyState {
  if (!storage) return initialAcademyState;
  try {
    return parseAcademyState(storage.getItem(ACADEMY_STORAGE_KEY));
  } catch {
    return initialAcademyState;
  }
}

export function saveAcademyState(
  storage: Storage | null,
  state: AcademyState,
): void {
  if (!storage) return;
  try {
    storage.setItem(ACADEMY_STORAGE_KEY, serializeAcademyState(state));
  } catch {
    // Storage may be unavailable or full. Learning remains usable in memory.
  }
}

export function migrateAcademyState(value: unknown): AcademyState {
  if (!isRecord(value)) return initialAcademyState;

  const version = value.schemaVersion;
  if (version !== ACADEMY_STATE_VERSION) {
    // Add explicit migrations here when the schema advances. Unknown data is
    // deliberately reset instead of risking a broken learning experience.
    return initialAcademyState;
  }

  return {
    schemaVersion: ACADEMY_STATE_VERSION,
    mode: value.mode === "expert" ? "expert" : "beginner",
    completedBeginnerChapterIds: stringArray(
      value.completedBeginnerChapterIds,
    ) as ChapterId[],
    exploredExpertChapterIds: stringArray(
      value.exploredExpertChapterIds,
    ) as ChapterId[],
    questionAttempts: validAttempts(value.questionAttempts),
    animationStates: validAnimationStates(value.animationStates),
    completedReplayStageIds: stringArray(
      value.completedReplayStageIds,
    ) as ReplayStageId[],
    finalReplayCompleted: value.finalReplayCompleted === true,
  };
}

function browserStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

function appendUnique<T>(items: readonly T[], item: T): readonly T[] {
  return items.includes(item) ? items : [...items, item];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === "string"))]
    : [];
}

function validAttempts(
  value: unknown,
): AcademyState["questionAttempts"] {
  if (!isRecord(value)) return {};
  const result: Partial<Record<QuestionId, readonly QuestionAttempt[]>> = {};
  Object.entries(value).forEach(([questionId, attempts]) => {
    if (!Array.isArray(attempts)) return;
    result[questionId as QuestionId] = attempts.flatMap((attempt) => {
      if (
        !isRecord(attempt) ||
        typeof attempt.selectedChoiceId !== "string" ||
        typeof attempt.correct !== "boolean" ||
        typeof attempt.attemptedAt !== "string"
      ) {
        return [];
      }
      return [
        {
          selectedChoiceId: attempt.selectedChoiceId,
          correct: attempt.correct,
          attemptedAt: attempt.attemptedAt,
        },
      ];
    });
  });
  return result;
}

function validAnimationStates(
  value: unknown,
): AcademyState["animationStates"] {
  if (!isRecord(value)) return {};
  const result: Partial<Record<AnimationId, DeterministicAnimationState>> = {};

  Object.entries(value).forEach(([animationId, animation]) => {
    if (
      !isRecord(animation) ||
      typeof animation.animationId !== "string" ||
      typeof animation.stageIndex !== "number" ||
      !["idle", "playing", "paused", "complete"].includes(
        String(animation.status),
      ) ||
      ![0.5, 1, 1.5, 2].includes(Number(animation.speed))
    ) {
      return;
    }
    result[animationId as AnimationId] = {
      animationId: animation.animationId as AnimationId,
      stageIndex: Math.max(0, Math.floor(animation.stageIndex)),
      status: animation.status as DeterministicAnimationState["status"],
      speed: animation.speed as DeterministicAnimationState["speed"],
      mode: animation.mode === "expert" ? "expert" : "beginner",
      inputs: isRecord(animation.inputs)
        ? sanitizeScalars(animation.inputs)
        : {},
      completedCheckpointIds: stringArray(animation.completedCheckpointIds),
    };
  });

  return result;
}

function sanitizeScalars(
  value: Record<string, unknown>,
): DeterministicAnimationState["inputs"] {
  return Object.fromEntries(
    Object.entries(value).filter((entry) => {
      const item = entry[1];
      return (
        item === null ||
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean"
      );
    }),
  ) as DeterministicAnimationState["inputs"];
}

