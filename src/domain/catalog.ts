export type LearningMode = "beginner" | "expert";

export const PART_IDS = [
  "model-factory",
  "inference-system",
  "inside-gpu",
] as const;

export type PartId = (typeof PART_IDS)[number];
export type ChapterId = `chapter.${PartId}.${string}`;
export type QuestionId = `question.${PartId}.${string}`;
export type AnimationId = `animation.${PartId | "replay"}.${string}`;
export type ReplayStageId = `replay.${string}`;

export type ContentBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "bullets";
      items: readonly string[];
    }
  | {
      type: "callout";
      label: string;
      text: string;
    };

export interface LearningLayer {
  summary: string;
  objectives: readonly string[];
  blocks: readonly ContentBlock[];
}

export interface ChapterDefinition {
  id: ChapterId;
  partId: PartId;
  slug: string;
  order: number;
  title: string;
  eyebrow: string;
  estimatedMinutes: number;
  beginner: LearningLayer;
  /**
   * Expert is additive. It may extend the beginner lesson, but must never
   * replace or contradict the core path.
   */
  expert?: LearningLayer;
  animationIds: readonly AnimationId[];
  questionIds: readonly QuestionId[];
  replayStageIds: readonly ReplayStageId[];
  prerequisites: readonly ChapterId[];
}

export interface PartDefinition {
  id: PartId;
  order: number;
  title: string;
  shortTitle: string;
  promise: string;
  chapterIds: readonly ChapterId[];
}

export interface MultipleChoiceQuestion {
  id: QuestionId;
  chapterId: ChapterId;
  kind: "single-choice";
  prompt: string;
  choices: readonly {
    id: string;
    label: string;
  }[];
  correctChoiceId: string;
  explanation: string;
  expertExplanation?: string;
}

export interface AcademyCatalog {
  parts: readonly PartDefinition[];
  chapters: readonly ChapterDefinition[];
  questions: readonly MultipleChoiceQuestion[];
}

export function layersForMode(
  chapter: ChapterDefinition,
  mode: LearningMode,
): readonly LearningLayer[] {
  if (mode === "expert" && chapter.expert) {
    return [chapter.beginner, chapter.expert];
  }
  return [chapter.beginner];
}

