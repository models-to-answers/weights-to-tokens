import { describe, expect, it } from "vitest";
import {
  academyCatalog,
  animationDefinitions,
  glossaryForChapter,
  lessonComponents,
  replayStageDefinitions,
  sourcesForChapter,
  validateAcademy,
} from "@/src/content";
import { animationStageLabels } from "@/src/content/animation-stages";
import { layersForMode } from "@/src/domain";
import { animationComponents } from "@/app/components/AcademyApp";
import {
  academyReducer,
  initialAcademyState,
  parseAcademyState,
  serializeAcademyState,
} from "@/src/state";

describe("academy catalog", () => {
  it("has no invalid references or duplicate IDs", () => {
    expect(
      validateAcademy(
        academyCatalog,
        animationDefinitions,
        replayStageDefinitions,
      ),
    ).toEqual([]);
  });

  it("makes Expert a strict progressive disclosure over Beginner", () => {
    for (const chapter of academyCatalog.chapters) {
      expect(layersForMode(chapter, "beginner")).toEqual([chapter.beginner]);
      const expertLayers = layersForMode(chapter, "expert");
      expect(expertLayers[0]).toBe(chapter.beginner);
      expect(expertLayers.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("gives every release chapter MDX content, glossary terms, and primary sources", () => {
    for (const chapter of academyCatalog.chapters) {
      expect(lessonComponents[chapter.id]).toBeTypeOf("function");
      expect(glossaryForChapter(chapter.id).length).toBeGreaterThan(0);
      expect(sourcesForChapter(chapter.id).length).toBeGreaterThan(0);
    }
  });

  it("maps every chapter interaction to a real rendered lab", () => {
    const mapped = new Set(Object.keys(animationComponents));
    for (const chapter of academyCatalog.chapters) {
      for (const animationId of chapter.animationIds) {
        expect(mapped, `${chapter.id} is missing ${animationId}`).toContain(
          animationId,
        );
      }
    }
  });

  it("gives every chapter a Core check and a distinct Expert challenge", () => {
    for (const chapter of academyCatalog.chapters) {
      const chapterQuestions = academyCatalog.questions.filter(
        (question) => question.chapterId === chapter.id,
      );
      expect(
        chapterQuestions.some((question) => question.level !== "expert"),
      ).toBe(true);
      expect(
        chapterQuestions.some((question) => question.level === "expert"),
      ).toBe(true);
    }
  });

  it("preserves the required source interaction families", () => {
    const required = [
      "animation.model-factory.token-predictor",
      "animation.model-factory.pipeline-stages",
      "animation.model-factory.parameter-builder",
      "animation.model-factory.training-loop",
      "animation.model-factory.preference-trainer",
      "animation.model-factory.artifact-packaging",
      "animation.model-factory.adaptation-lab",
      "animation.model-factory.fine-tune-methods",
      "animation.inference-system.compute-platform",
      "animation.inference-system.model-locality",
      "animation.inference-system.prefill-decode",
      "animation.inference-system.multi-gpu",
      "animation.inside-gpu.throughput-silicon",
      "animation.inside-gpu.zoom-anatomy",
      "animation.inside-gpu.kernel-launch",
      "animation.inside-gpu.divergence",
      "animation.inside-gpu.warp-scheduler",
      "animation.inside-gpu.coalesced-memory",
      "animation.inside-gpu.roofline",
    ];
    const released = new Set<string>(
      academyCatalog.chapters.flatMap((chapter) => [...chapter.animationIds]),
    );
    expect(required.every((animationId) => released.has(animationId))).toBe(
      true,
    );
  });

  it("keeps a three-part orientation and a twelve-stage end-to-end replay", () => {
    const overview = animationDefinitions.find(
      (animation) => animation.id === "animation.model-factory.weights-map",
    );
    const replay = animationDefinitions.find(
      (animation) => animation.id === "animation.replay.one-prompt",
    );
    expect(overview?.stages).toHaveLength(3);
    expect(replay?.stages).toHaveLength(12);
  });

  it("uses the canonical stage contract for every animation", () => {
    for (const definition of animationDefinitions) {
      const labels =
        animationStageLabels[definition.id as keyof typeof animationStageLabels];
      expect(labels, `${definition.id} has no canonical stage labels`).toBeDefined();
      expect(
        definition.stages.map((stage) => stage.title),
        `${definition.id} drifted from its rendered stages`,
      ).toEqual([...labels]);
    }
  });
});

describe("browser-local learning state", () => {
  it("defaults to Beginner and de-duplicates completion", () => {
    const chapterId = academyCatalog.chapters[0].id;
    const once = academyReducer(initialAcademyState, {
      type: "COMPLETE_BEGINNER_CHAPTER",
      chapterId,
    });
    const twice = academyReducer(once, {
      type: "COMPLETE_BEGINNER_CHAPTER",
      chapterId,
    });
    expect(twice.mode).toBe("beginner");
    expect(twice.completedBeginnerChapterIds).toEqual([chapterId]);
  });

  it("round-trips valid state and recovers corrupt data", () => {
    const expert = academyReducer(initialAcademyState, {
      type: "SET_MODE",
      mode: "expert",
    });
    expect(parseAcademyState(serializeAcademyState(expert))).toEqual(expert);
    expect(parseAcademyState("{not-json")).toEqual(initialAcademyState);
  });

  it("completing Expert also completes Core while preserving separate mastery", () => {
    const chapterId = academyCatalog.chapters[0].id;
    const completed = academyReducer(initialAcademyState, {
      type: "COMPLETE_EXPERT_CHAPTER",
      chapterId,
    });
    expect(completed.completedBeginnerChapterIds).toEqual([chapterId]);
    expect(completed.completedExpertChapterIds).toEqual([chapterId]);
  });

  it("migrates version-one Core progress without inventing Expert mastery", () => {
    const chapterId = academyCatalog.chapters[0].id;
    const parsed = parseAcademyState(
      JSON.stringify({
        ...initialAcademyState,
        schemaVersion: 1,
        completedExpertChapterIds: undefined,
        completedBeginnerChapterIds: [chapterId],
      }),
    );
    expect(parsed.completedBeginnerChapterIds).toEqual([chapterId]);
    expect(parsed.completedExpertChapterIds).toEqual([]);
  });

  it("normalizes persisted Expert mastery so it always implies Core mastery", () => {
    const chapterId = academyCatalog.chapters[0].id;
    const parsed = parseAcademyState(
      JSON.stringify({
        ...initialAcademyState,
        completedExpertChapterIds: [chapterId],
        completedBeginnerChapterIds: [],
        finalReplayCompleted: false,
        finalReplayExpertCompleted: true,
      }),
    );
    expect(parsed.completedBeginnerChapterIds).toEqual([chapterId]);
    expect(parsed.finalReplayCompleted).toBe(true);
  });

  it("records Expert replay completion as both Core and Expert", () => {
    const completed = academyReducer(initialAcademyState, {
      type: "COMPLETE_FINAL_REPLAY",
      mode: "expert",
    });
    expect(completed.finalReplayCompleted).toBe(true);
    expect(completed.finalReplayExpertCompleted).toBe(true);
  });

  it("drops stale IDs and clamps persisted animation stages", () => {
    const parsed = parseAcademyState(
      JSON.stringify({
        ...initialAcademyState,
        completedBeginnerChapterIds: [
          academyCatalog.chapters[0].id,
          "chapter.fake.missing",
        ],
        animationStates: {
          "animation.inside-gpu.warp-scheduler": {
            animationId: "animation.inside-gpu.warp-scheduler",
            stageIndex: 999,
            status: "paused",
            speed: 1,
            mode: "expert",
            inputs: { lane: 7, unsafe: { nested: true } },
            completedCheckpointIds: ["stage-999"],
          },
          "animation.fake.missing": {
            animationId: "animation.fake.missing",
            stageIndex: 0,
          },
        },
      }),
    );
    expect(parsed.completedBeginnerChapterIds).toEqual([
      academyCatalog.chapters[0].id,
    ]);
    expect(
      parsed.animationStates["animation.inside-gpu.warp-scheduler"]?.stageIndex,
    ).toBe(5);
    expect(
      parsed.animationStates["animation.inside-gpu.warp-scheduler"]?.inputs,
    ).toEqual({ lane: 7 });
    expect(
      parsed.animationStates[
        "animation.fake.missing" as keyof typeof parsed.animationStates
      ],
    ).toBeUndefined();
  });

  it("resets every durable progress field", () => {
    const chapterId = academyCatalog.chapters[0].id;
    const completed = academyReducer(initialAcademyState, {
      type: "COMPLETE_BEGINNER_CHAPTER",
      chapterId,
    });
    const reset = academyReducer(completed, { type: "RESET_PROGRESS" });
    expect(reset).toEqual(initialAcademyState);
  });
});
