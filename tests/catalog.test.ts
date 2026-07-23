import { describe, expect, it } from "vitest";
import {
  academyCatalog,
  animationDefinitions,
  replayStageDefinitions,
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
});
