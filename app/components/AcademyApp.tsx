"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ComponentType,
} from "react";
import {
  animationRegistry,
  chapters,
  glossaryForChapter,
  lessonComponents,
  parts,
  questions,
  replayStageDefinitions,
  sourcesForChapter,
} from "@/src/content";
import {
  initialAnimationState,
  type AnimationId,
  type ChapterDefinition,
  type ChapterId,
  type LearningMode,
  type MultipleChoiceQuestion,
} from "@/src/domain";
import { useAcademyStore } from "@/src/state";
import {
  GpuAnatomyAnimation,
  JourneyOverviewAnimation,
  KernelLaunchAnimation,
  ModelReadinessAnimation,
  OneVsMultiGpuAnimation,
  PrefillKvDecodeAnimation,
  TrainingLoopAnimation,
} from "./animations";
import type { DeterministicAnimationProps } from "./animations/types";
import { FinalReplayExperience } from "./FinalReplayExperience";

type DetailTab = "lesson" | "glossary" | "sources";

type AcademyAppProps = {
  initialChapterSlug?: string;
  initialReplay?: boolean;
};

const animationComponents: Partial<
  Record<AnimationId, ComponentType<DeterministicAnimationProps>>
> = {
  "animation.model-factory.weights-map": JourneyOverviewAnimation,
  "animation.model-factory.training-loop": TrainingLoopAnimation,
  "animation.model-factory.adaptation-lab": TrainingLoopAnimation,
  "animation.model-factory.artifact-packaging": ModelReadinessAnimation,
  "animation.inference-system.request-arrival": JourneyOverviewAnimation,
  "animation.inference-system.model-loading": ModelReadinessAnimation,
  "animation.inference-system.prefill-decode": PrefillKvDecodeAnimation,
  "animation.inference-system.multi-gpu": OneVsMultiGpuAnimation,
  "animation.inside-gpu.zoom-anatomy": GpuAnatomyAnimation,
  "animation.inside-gpu.kernel-launch": KernelLaunchAnimation,
  "animation.inside-gpu.warp-scheduler": KernelLaunchAnimation,
  "animation.inside-gpu.coalesced-memory": GpuAnatomyAnimation,
};

function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

function viewFromPathname(pathname: string): ChapterId | "replay" {
  if (pathname === "/replay") return "replay";
  const slug = pathname.match(/^\/learn\/([^/]+)\/?$/)?.[1];
  return (
    chapters.find((chapter) => chapter.slug === slug)?.id ?? chapters[0].id
  );
}

function initialView(props: AcademyAppProps): ChapterId | "replay" {
  if (props.initialReplay) return "replay";
  if (props.initialChapterSlug) {
    return (
      chapters.find((chapter) => chapter.slug === props.initialChapterSlug)?.id ??
      chapters[0].id
    );
  }
  return chapters[0].id;
}

function chapterPath(chapter: ChapterDefinition): string {
  return `/learn/${chapter.slug}`;
}

function renderBlock(
  block: ChapterDefinition["beginner"]["blocks"][number],
  key: string,
) {
  if (block.type === "paragraph") return <p key={key}>{block.text}</p>;
  if (block.type === "bullets") {
    return (
      <ul key={key}>
        {block.items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    );
  }
  return (
    <aside className="narrative-callout" key={key}>
      <strong>{block.label}</strong>
      <p>{block.text}</p>
    </aside>
  );
}

export function AcademyApp(props: AcademyAppProps) {
  const hydrated = useHydrated();
  const [academyState, dispatch] = useAcademyStore((state) => state);
  const [activeView, setActiveView] = useState<ChapterId | "replay">(
    initialView(props),
  );
  const [detailTab, setDetailTab] = useState<DetailTab>("lesson");
  const [resetArmed, setResetArmed] = useState(false);

  const activeChapter =
    activeView === "replay"
      ? null
      : chapters.find((chapter) => chapter.id === activeView) ?? chapters[0];
  const activeIndex = activeChapter
    ? chapters.findIndex((chapter) => chapter.id === activeChapter.id)
    : chapters.length;
  const activePart = activeChapter
    ? parts.find((part) => part.id === activeChapter.partId)!
    : null;
  const progressTotal = chapters.length + 1;
  const progressCompleted =
    academyState.completedBeginnerChapterIds.length +
    (academyState.finalReplayCompleted ? 1 : 0);
  const progress = Math.round((progressCompleted / progressTotal) * 100);

  const groupedParts = useMemo(
    () =>
      parts.map((part) => ({
        ...part,
        chapters: chapters.filter((chapter) => chapter.partId === part.id),
      })),
    [],
  );

  useEffect(() => {
    const onPopState = () => {
      setActiveView(viewFromPathname(window.location.pathname));
      setDetailTab("lesson");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(view: ChapterId | "replay", replace = false) {
    const path =
      view === "replay"
        ? "/replay"
        : chapterPath(chapters.find((chapter) => chapter.id === view)!);
    window.history[replace ? "replaceState" : "pushState"]({}, "", path);
    setActiveView(view);
    setDetailTab("lesson");
    setResetArmed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeMode(mode: LearningMode) {
    dispatch({ type: "SET_MODE", mode });
    if (mode === "expert" && activeChapter) {
      dispatch({ type: "MARK_EXPERT_EXPLORED", chapterId: activeChapter.id });
    }
  }

  function completeAndContinue() {
    if (!activeChapter) {
      dispatch({ type: "COMPLETE_FINAL_REPLAY" });
      return;
    }
    dispatch({
      type: "COMPLETE_BEGINNER_CHAPTER",
      chapterId: activeChapter.id,
    });
    if (activeIndex < chapters.length - 1) {
      navigate(chapters[activeIndex + 1].id);
    } else {
      navigate("replay");
    }
  }

  function confirmReset() {
    dispatch({ type: "RESET_PROGRESS" });
    setResetArmed(false);
    navigate(chapters[0].id, true);
  }

  return (
    <div
      className="academy-shell"
      data-hydrated={hydrated}
      aria-busy={!hydrated}
    >
      <aside className="academy-sidebar" aria-label="Academy navigation">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">W→T</span>
          <div>
            <p className="brand-kicker">Interactive academy</p>
            <p className="brand-name">From Weights to Tokens</p>
          </div>
        </div>

        <div className="progress-panel" aria-label={`${progress}% complete`}>
          <div className="progress-panel__label">
            <span>Your journey</span><strong>{progress}%</strong>
          </div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          <small>{progressCompleted} of {progressTotal} complete · saved in this browser</small>
        </div>

        <nav className="chapter-nav" aria-label="Chapters">
          {groupedParts.map((group) => (
            <section className="nav-part" key={group.id}>
              <p>Part {group.order} · {group.shortTitle}</p>
              {group.chapters.map((chapter, index) => {
                const complete =
                  academyState.completedBeginnerChapterIds.includes(chapter.id);
                const active = activeView === chapter.id;
                return (
                  <a
                    className={[
                      "chapter-link",
                      active && "chapter-link--active",
                    ].filter(Boolean).join(" ")}
                    href={chapterPath(chapter)}
                    key={chapter.id}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(chapter.id);
                    }}
                    aria-current={active ? "page" : undefined}
                  >
                    <span>{complete ? "✓" : String(group.order) + "." + (index + 1)}</span>
                    {chapter.title}
                  </a>
                );
              })}
            </section>
          ))}
          <section className="nav-part">
            <p>Finale · One prompt</p>
            <a
              className={[
                "chapter-link",
                activeView === "replay" && "chapter-link--active",
              ].filter(Boolean).join(" ")}
              href="/replay"
              onClick={(event) => {
                event.preventDefault();
                navigate("replay");
              }}
              aria-current={activeView === "replay" ? "page" : undefined}
            >
              <span>{academyState.finalReplayCompleted ? "✓" : "R"}</span>
              Replay the full journey
            </a>
          </section>
        </nav>

        <div className="reset-zone">
          {!resetArmed ? (
            <button type="button" onClick={() => setResetArmed(true)}>
              Reset local progress
            </button>
          ) : (
            <div role="group" aria-label="Confirm progress reset">
              <p>Clear all progress on this browser?</p>
              <button type="button" className="danger-button" onClick={confirmReset}>
                Yes, reset
              </button>
              <button type="button" onClick={() => setResetArmed(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </aside>

      <main id="main-content" className="learning-canvas">
        <header className="topbar">
          <div>
            <p className="topbar__eyebrow">
              {activePart
                ? `Part ${activePart.order} · ${activePart.shortTitle}`
                : "Finale · One prompt"}
            </p>
            <p className="topbar__context">
              {activePart?.promise ?? "Replay the same request at system and GPU zoom levels."}
            </p>
          </div>
          <div className="mode-switch" role="group" aria-label="Learning depth">
            {(["beginner", "expert"] as LearningMode[]).map((mode) => (
              <button
                type="button"
                key={mode}
                className={academyState.mode === mode ? "is-active" : ""}
                onClick={() => changeMode(mode)}
                aria-pressed={academyState.mode === mode}
              >
                {mode === "beginner" ? "Beginner" : "Expert"}
              </button>
            ))}
          </div>
        </header>

        {activeChapter ? (
          <ChapterLesson
            chapter={activeChapter}
            mode={academyState.mode}
            detailTab={detailTab}
            onDetailTabChange={setDetailTab}
            onAnimationStep={(animationId, stageIndex) => {
              const definition = animationRegistry[animationId];
              dispatch({
                type: "SAVE_ANIMATION_STATE",
                animation: {
                  ...initialAnimationState(definition, academyState.mode),
                  stageIndex,
                  status: "paused",
                },
              });
            }}
            savedAnimationSteps={Object.fromEntries(
              Object.entries(academyState.animationStates).map(([id, state]) => [
                id,
                state?.stageIndex ?? 0,
              ]),
            )}
            onAnswer={(selectedChoiceId) => {
              const question = questions.find(
                (candidate) => candidate.id === activeChapter.questionIds[0],
              )!;
              dispatch({
                type: "RECORD_QUESTION_ATTEMPT",
                questionId: question.id,
                attempt: {
                  selectedChoiceId,
                  correct: selectedChoiceId === question.correctChoiceId,
                  attemptedAt: new Date().toISOString(),
                },
              });
            }}
            lastSelectedChoiceId={
              academyState.questionAttempts[activeChapter.questionIds[0]]?.at(-1)
                ?.selectedChoiceId
            }
            activeIndex={activeIndex}
            onPrevious={() => {
              if (activeIndex > 0) navigate(chapters[activeIndex - 1].id);
            }}
            onComplete={completeAndContinue}
          />
        ) : (
          <ReplayLesson
            mode={academyState.mode}
            savedStep={
              academyState.animationStates["animation.replay.one-prompt"]
                ?.stageIndex ?? 0
            }
            completed={academyState.finalReplayCompleted}
            onStepChange={(stageIndex) => {
              const definition =
                animationRegistry["animation.replay.one-prompt"];
              dispatch({
                type: "SAVE_ANIMATION_STATE",
                animation: {
                  ...initialAnimationState(definition, academyState.mode),
                  stageIndex,
                  status:
                    stageIndex === replayStageDefinitions.length - 1
                      ? "complete"
                      : "paused",
                },
              });
              const replayStage = replayStageDefinitions[stageIndex];
              if (replayStage) {
                dispatch({
                  type: "COMPLETE_REPLAY_STAGE",
                  stageId: replayStage.id,
                });
              }
            }}
            onNavigateChapter={(chapterId) => navigate(chapterId)}
            onComplete={completeAndContinue}
          />
        )}
      </main>
    </div>
  );
}

type ChapterLessonProps = {
  chapter: ChapterDefinition;
  mode: LearningMode;
  detailTab: DetailTab;
  onDetailTabChange: (tab: DetailTab) => void;
  onAnimationStep: (animationId: AnimationId, stageIndex: number) => void;
  savedAnimationSteps: Record<string, number>;
  onAnswer: (choiceId: string) => void;
  lastSelectedChoiceId?: string;
  activeIndex: number;
  onPrevious: () => void;
  onComplete: () => void;
};

function ChapterLesson({
  chapter,
  mode,
  detailTab,
  onDetailTabChange,
  onAnimationStep,
  savedAnimationSteps,
  onAnswer,
  lastSelectedChoiceId,
  activeIndex,
  onPrevious,
  onComplete,
}: ChapterLessonProps) {
  const LessonContent = lessonComponents[chapter.id];
  const question: MultipleChoiceQuestion = questions.find(
    (candidate) => candidate.id === chapter.questionIds[0],
  )!;
  const glossary = glossaryForChapter(chapter.id);
  const sources = sourcesForChapter(chapter.id);
  const selectedChoice = question.choices.find(
    (choice) => choice.id === lastSelectedChoiceId,
  );
  const correct = lastSelectedChoiceId === question.correctChoiceId;
  const animationId = chapter.animationIds[0];
  const Animation = animationComponents[animationId];

  return (
    <article className="lesson">
      <div className="lesson-hero">
        <div>
          <p className="lesson-number">
            {chapter.eyebrow} · {chapter.estimatedMinutes} min
          </p>
          <h1>{chapter.title}</h1>
          <p className="learning-promise">{chapter.beginner.summary}</p>
        </div>
        <div className="mode-note">
          <span>{mode === "beginner" ? "Essential path" : "Progressive depth"}</span>
          <p>
            {mode === "beginner"
              ? "Plain language, the core causal flow, and required checks."
              : "The complete Beginner path plus runtime detail, terminology, and tradeoffs."}
          </p>
        </div>
      </div>

      {chapter.id === chapters[0].id ? (
        <section className="academy-promise">
          <p className="section-label">The learning promise</p>
          <h2>See the entire path, then zoom in without losing the thread.</h2>
          <div className="promise-grid">
            {parts.map((part) => (
              <div key={part.id}>
                <span>0{part.order}</span>
                <strong>{part.shortTitle}</strong>
                <p>{part.promise}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="lesson-tabs">
        <div className="tab-list" role="tablist" aria-label="Lesson resources">
          {([
            ["lesson", "Lesson"],
            ["glossary", `Glossary (${glossary.length})`],
            ["sources", `Sources (${sources.length})`],
          ] as const).map(([id, label]) => (
            <button
              type="button"
              role="tab"
              id={`${id}-tab`}
              aria-controls={`${id}-panel`}
              aria-selected={detailTab === id}
              tabIndex={detailTab === id ? 0 : -1}
              key={id}
              onClick={() => onDetailTabChange(id)}
              onKeyDown={(event) => {
                const tabs: DetailTab[] = ["lesson", "glossary", "sources"];
                const current = tabs.indexOf(id);
                let nextTab: DetailTab | undefined;
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  const delta = event.key === "ArrowRight" ? 1 : -1;
                  nextTab = tabs[(current + delta + tabs.length) % tabs.length];
                } else if (event.key === "Home") {
                  event.preventDefault();
                  nextTab = tabs[0];
                } else if (event.key === "End") {
                  event.preventDefault();
                  nextTab = tabs.at(-1);
                }
                if (nextTab) {
                  onDetailTabChange(nextTab);
                  window.requestAnimationFrame(() => {
                    document.getElementById(`${nextTab}-tab`)?.focus();
                  });
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className="resource-panel mdx-content"
          role="tabpanel"
          id="lesson-panel"
          aria-labelledby="lesson-tab"
          hidden={detailTab !== "lesson"}
        >
          <p className="section-label">Core narrative · MDX</p>
          <LessonContent />
          <div className="objective-list">
            <strong>After this chapter, you can:</strong>
            <ul>{chapter.beginner.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
          </div>
          {chapter.beginner.blocks.map((block, index) =>
            renderBlock(block, `${chapter.id}-beginner-${index}`),
          )}
          {mode === "expert" && chapter.expert ? (
            <aside className="expert-panel">
              <span>Expert layer</span>
              <p>{chapter.expert.summary}</p>
              <ul>{chapter.expert.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
              {chapter.expert.blocks.map((block, index) =>
                renderBlock(block, `${chapter.id}-expert-${index}`),
              )}
            </aside>
          ) : null}
        </div>

        <div
          className="resource-panel"
          role="tabpanel"
          id="glossary-panel"
          aria-labelledby="glossary-tab"
          hidden={detailTab !== "glossary"}
        >
          <p className="section-label">Terms in this chapter</p>
          <dl className="glossary-list">
            {glossary.map((term) => (
              <div key={term.id}><dt>{term.term}</dt><dd>{term.definition}</dd></div>
            ))}
          </dl>
        </div>

        <div
          className="resource-panel"
          role="tabpanel"
          id="sources-panel"
          aria-labelledby="sources-tab"
          hidden={detailTab !== "sources"}
        >
          <p className="section-label">Primary references</p>
          <ul className="source-list">
            {sources.map((source) => (
              <li key={source.id}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title} ↗
                </a>
                <span>{source.publisher}</span>
                <p>{source.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {Animation ? (
        <section className="animation-stage">
          <div className="section-heading">
            <div>
              <p className="section-label">Interactive system view</p>
              <h2>Step through the flow</h2>
            </div>
            <span className="status-chip">P0 · deterministic</span>
          </div>
          <Animation
            mode={mode}
            step={savedAnimationSteps[animationId] ?? 0}
            onStepChange={(step) => onAnimationStep(animationId, step)}
            autoPlayIntervalMs={1700}
          />
        </section>
      ) : null}

      <section className="knowledge-check">
        <div>
          <p className="section-label">Quick check</p>
          <h2>{question.prompt}</h2>
        </div>
        <div className="answer-grid">
          {question.choices.map((choice, index) => (
            <button
              type="button"
              key={choice.id}
              className={[
                lastSelectedChoiceId === choice.id &&
                  (correct ? "is-correct" : "is-wrong"),
              ].filter(Boolean).join(" ")}
              onClick={() => onAnswer(choice.id)}
              aria-pressed={lastSelectedChoiceId === choice.id}
            >
              <span>{String.fromCharCode(65 + index)}</span>{choice.label}
            </button>
          ))}
        </div>
        {selectedChoice ? (
          <div className={`answer-feedback ${correct ? "is-correct" : "is-wrong"}`} role="status">
            <strong>{correct ? "Correct." : "Try again."}</strong>
            <p>{correct ? question.explanation : "Use the chapter narrative and active animation stage as your clue."}</p>
            {correct && mode === "expert" && question.expertExplanation ? (
              <p>{question.expertExplanation}</p>
            ) : null}
          </div>
        ) : null}
      </section>

      <footer className="lesson-footer">
        <button
          type="button"
          className="secondary-button"
          disabled={activeIndex === 0}
          onClick={onPrevious}
        >
          Previous chapter
        </button>
        <button type="button" className="primary-button" onClick={onComplete}>
          {activeIndex === chapters.length - 1
            ? "Complete & open final replay"
            : "Complete & continue"}
        </button>
      </footer>
    </article>
  );
}

type ReplayLessonProps = {
  mode: LearningMode;
  savedStep: number;
  completed: boolean;
  onStepChange: (step: number) => void;
  onNavigateChapter: (chapterId: ChapterId) => void;
  onComplete: () => void;
};

function ReplayLesson({
  mode,
  savedStep,
  completed,
  onStepChange,
  onNavigateChapter,
  onComplete,
}: ReplayLessonProps) {
  return (
    <article className="lesson">
      <div className="lesson-hero">
        <div>
          <p className="lesson-number">Final replay · 12 stages</p>
          <h1>One prompt, end to end</h1>
          <p className="learning-promise">
            Follow one request through model readiness, inference, GPU execution,
            and streamed output without changing timelines.
          </p>
        </div>
        <div className="mode-note">
          <span>{mode === "beginner" ? "System spine" : "Runtime overlays"}</span>
          <p>Switch zoom levels while preserving the exact replay stage.</p>
        </div>
      </div>

      <section className="animation-stage replay-stage">
        <FinalReplayExperience
          mode={mode}
          step={savedStep}
          onStepChange={onStepChange}
          onNavigateChapter={onNavigateChapter}
        />
      </section>

      <section className="takeaway">
        <span>Release outcome</span>
        <p>
          Models, serving systems, and GPU internals are three zoom levels of
          one token-producing process.
        </p>
      </section>

      <footer className="lesson-footer">
        <a className="secondary-button" href={chapterPath(chapters.at(-1)!)}>
          Back to GPU memory
        </a>
        <button type="button" className="primary-button" onClick={onComplete}>
          {completed ? "Replay complete ✓" : "Mark journey complete"}
        </button>
      </footer>
    </article>
  );
}
