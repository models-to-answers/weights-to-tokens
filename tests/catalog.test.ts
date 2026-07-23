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
    ).toBe(3);
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
