import type { AcademyCatalog } from "../domain/catalog";
import type {
  AnimationDefinition,
  ReplayStageDefinition,
} from "../domain/animation";
import { glossaryTerms, sourceReferences } from "./supporting";

export interface CatalogValidationIssue {
  code:
    | "duplicate-id"
    | "broken-reference"
    | "invalid-order"
    | "invalid-question"
    | "invalid-animation"
    | "invalid-content"
    | "invalid-mode-contract";
  path: string;
  message: string;
}

export function validateAcademy(
  catalog: AcademyCatalog,
  animations: readonly AnimationDefinition[],
  replayStages: readonly ReplayStageDefinition[],
): readonly CatalogValidationIssue[] {
  const issues: CatalogValidationIssue[] = [];
  const partIds = new Set(catalog.parts.map((part) => part.id));
  const chapterIds = new Set(catalog.chapters.map((chapter) => chapter.id));
  const questionIds = new Set(catalog.questions.map((question) => question.id));
  const animationIds = new Set(animations.map((animation) => animation.id));
  const replayIds = new Set(replayStages.map((stage) => stage.id));
  const glossaryIds = new Set(glossaryTerms.map((term) => term.id));
  const sourceIds = new Set(sourceReferences.map((source) => source.id));

  collectDuplicateIds(
    [
      ...catalog.parts.map((entry) => entry.id),
      ...catalog.chapters.map((entry) => entry.id),
      ...catalog.questions.map((entry) => entry.id),
      ...animations.map((entry) => entry.id),
      ...replayStages.map((entry) => entry.id),
      ...glossaryTerms.map((entry) => entry.id),
      ...sourceReferences.map((entry) => entry.id),
    ],
    issues,
  );

  catalog.parts.forEach((part) => {
    validateSequentialOrder(
      catalog.chapters.filter((chapter) => chapter.partId === part.id),
      `parts.${part.id}.chapters`,
      issues,
    );
    part.chapterIds.forEach((id) => {
      if (!chapterIds.has(id)) {
        broken(`parts.${part.id}.chapterIds`, id, issues);
      }
    });
  });

  catalog.chapters.forEach((chapter) => {
    if (!partIds.has(chapter.partId)) {
      broken(`chapters.${chapter.id}.partId`, chapter.partId, issues);
    }
    if (!chapter.beginner.summary || chapter.beginner.objectives.length === 0) {
      issues.push({
        code: "invalid-mode-contract",
        path: `chapters.${chapter.id}.beginner`,
        message: "Every chapter needs a complete beginner summary and objectives.",
      });
    }
    if (typeof chapter.content !== "function") {
      issues.push({
        code: "invalid-content",
        path: `chapters.${chapter.id}.content`,
        message: "Every chapter needs a canonical MDX content loader.",
      });
    }
    chapter.questionIds.forEach((id) => {
      if (!questionIds.has(id)) {
        broken(`chapters.${chapter.id}.questionIds`, id, issues);
      }
    });
    chapter.animationIds.forEach((id) => {
      if (!animationIds.has(id)) {
        broken(`chapters.${chapter.id}.animationIds`, id, issues);
      }
    });
    chapter.glossaryIds.forEach((id) => {
      if (!glossaryIds.has(id)) {
        broken(`chapters.${chapter.id}.glossaryIds`, id, issues);
      }
    });
    chapter.sourceIds.forEach((id) => {
      if (!sourceIds.has(id)) {
        broken(`chapters.${chapter.id}.sourceIds`, id, issues);
      }
    });
    if (chapter.glossaryIds.length === 0 || chapter.sourceIds.length === 0) {
      issues.push({
        code: "invalid-content",
        path: `chapters.${chapter.id}`,
        message:
          "Every release chapter needs glossary and primary-source references.",
      });
    }
    chapter.replayStageIds.forEach((id) => {
      if (!replayIds.has(id)) {
        broken(`chapters.${chapter.id}.replayStageIds`, id, issues);
      }
    });
    chapter.prerequisites.forEach((id) => {
      if (!chapterIds.has(id)) {
        broken(`chapters.${chapter.id}.prerequisites`, id, issues);
      }
    });
  });

  catalog.questions.forEach((question) => {
    if (!chapterIds.has(question.chapterId)) {
      broken(`questions.${question.id}.chapterId`, question.chapterId, issues);
    }
    const choiceIds = question.choices.map((choice) => choice.id);
    if (
      new Set(choiceIds).size !== choiceIds.length ||
      !choiceIds.includes(question.correctChoiceId) ||
      question.choices.length < 2
    ) {
      issues.push({
        code: "invalid-question",
        path: `questions.${question.id}`,
        message:
          "Questions need unique choice IDs, at least two choices, and a valid correct choice.",
      });
    }
  });

  animations.forEach((animation) => {
    if (animation.stages.length < 2) {
      issues.push({
        code: "invalid-animation",
        path: `animations.${animation.id}`,
        message: "A stepable animation needs at least two stages.",
      });
    }
    const stageIds = animation.stages.map((stage) => stage.id);
    if (new Set(stageIds).size !== stageIds.length) {
      issues.push({
        code: "invalid-animation",
        path: `animations.${animation.id}.stages`,
        message: "Stage IDs must be unique within an animation.",
      });
    }
  });

  validateSequentialOrder(replayStages, "replayStages", issues);

  replayStages.forEach((stage) => {
    if (!chapterIds.has(stage.chapterId)) {
      broken(`replayStages.${stage.id}.chapterId`, stage.chapterId, issues);
    }
    if (!animationIds.has(stage.animationId)) {
      broken(`replayStages.${stage.id}.animationId`, stage.animationId, issues);
    }
  });

  return issues;
}

export function assertValidAcademy(
  catalog: AcademyCatalog,
  animations: readonly AnimationDefinition[],
  replayStages: readonly ReplayStageDefinition[],
): void {
  const issues = validateAcademy(catalog, animations, replayStages);
  if (issues.length > 0) {
    throw new Error(
      `Invalid academy catalog:\n${issues
        .map((issue) => `- [${issue.code}] ${issue.path}: ${issue.message}`)
        .join("\n")}`,
    );
  }
}

function collectDuplicateIds(
  ids: readonly string[],
  issues: CatalogValidationIssue[],
): void {
  const seen = new Set<string>();
  ids.forEach((id) => {
    if (seen.has(id)) {
      issues.push({
        code: "duplicate-id",
        path: id,
        message: `ID "${id}" is used more than once.`,
      });
    }
    seen.add(id);
  });
}

function broken(
  path: string,
  id: string,
  issues: CatalogValidationIssue[],
): void {
  issues.push({
    code: "broken-reference",
    path,
    message: `Referenced ID "${id}" does not exist.`,
  });
}

function validateSequentialOrder<T extends { order: number }>(
  entries: readonly T[],
  path: string,
  issues: CatalogValidationIssue[],
): void {
  const orders = entries.map((entry) => entry.order).sort((a, b) => a - b);
  const isSequential = orders.every((order, index) => order === index + 1);
  if (!isSequential) {
    issues.push({
      code: "invalid-order",
      path,
      message: `Order must be sequential from 1; found ${orders.join(", ")}.`,
    });
  }
}
