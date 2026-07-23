import type {
  AnimationId,
  ChapterId,
  LearningMode,
  ReplayStageId,
} from "./catalog";

export type AnimationStatus = "idle" | "playing" | "paused" | "complete";
export type AnimationSpeed = 0.5 | 1 | 1.5 | 2;
export type SerializableScalar = string | number | boolean | null;

export interface AnimationStageDefinition {
  id: string;
  title: string;
  beginnerNarration: string;
  expertNarration?: string;
  durationMs: number;
  checkpoint?: boolean;
}

export interface AnimationDefinition {
  id: AnimationId;
  title: string;
  description: string;
  stages: readonly AnimationStageDefinition[];
  /**
   * Expert mode normally reveals overlays on the same animation and state.
   * A separate expert runtime must be justified explicitly.
   */
  modeStrategy: "shared-progressive-disclosure" | "expert-only";
  expertOverlays?: readonly string[];
}

export interface DeterministicAnimationState {
  animationId: AnimationId;
  stageIndex: number;
  status: AnimationStatus;
  speed: AnimationSpeed;
  mode: LearningMode;
  inputs: Readonly<Record<string, SerializableScalar>>;
  completedCheckpointIds: readonly string[];
}

export type AnimationAction =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "STEP_FORWARD" }
  | { type: "STEP_BACK" }
  | { type: "SEEK"; stageIndex: number }
  | { type: "SET_SPEED"; speed: AnimationSpeed }
  | { type: "SET_MODE"; mode: LearningMode }
  | { type: "SET_INPUT"; key: string; value: SerializableScalar }
  | { type: "RESET" };

export function initialAnimationState(
  definition: AnimationDefinition,
  mode: LearningMode = "beginner",
): DeterministicAnimationState {
  return {
    animationId: definition.id,
    stageIndex: 0,
    status: "idle",
    speed: 1,
    mode,
    inputs: {},
    completedCheckpointIds: [],
  };
}

export function reduceAnimation(
  definition: AnimationDefinition,
  state: DeterministicAnimationState,
  action: AnimationAction,
): DeterministicAnimationState {
  const lastIndex = Math.max(0, definition.stages.length - 1);

  switch (action.type) {
    case "PLAY":
      return {
        ...state,
        status: state.stageIndex >= lastIndex ? "complete" : "playing",
      };
    case "PAUSE":
      return { ...state, status: "paused" };
    case "STEP_FORWARD": {
      const stageIndex = Math.min(lastIndex, state.stageIndex + 1);
      return withCompletedCheckpoints(definition, {
        ...state,
        stageIndex,
        status: stageIndex === lastIndex ? "complete" : "paused",
      });
    }
    case "STEP_BACK":
      return {
        ...state,
        stageIndex: Math.max(0, state.stageIndex - 1),
        status: "paused",
      };
    case "SEEK": {
      const stageIndex = Math.min(lastIndex, Math.max(0, action.stageIndex));
      return withCompletedCheckpoints(definition, {
        ...state,
        stageIndex,
        status: stageIndex === lastIndex ? "complete" : "paused",
      });
    }
    case "SET_SPEED":
      return { ...state, speed: action.speed };
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "SET_INPUT":
      return {
        ...state,
        inputs: { ...state.inputs, [action.key]: action.value },
      };
    case "RESET":
      return initialAnimationState(definition, state.mode);
  }
}

function withCompletedCheckpoints(
  definition: AnimationDefinition,
  state: DeterministicAnimationState,
): DeterministicAnimationState {
  const completed = definition.stages
    .slice(0, state.stageIndex + 1)
    .filter((stage) => stage.checkpoint)
    .map((stage) => stage.id);

  return { ...state, completedCheckpointIds: completed };
}

export interface ReplayStageDefinition {
  id: ReplayStageId;
  order: number;
  title: string;
  systemLevel: "model" | "request" | "gpu";
  chapterId: ChapterId;
  animationId: AnimationId;
  beginnerNarration: string;
  expertNarration: string;
}
