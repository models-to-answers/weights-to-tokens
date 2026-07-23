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
