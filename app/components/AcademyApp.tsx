"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FinalReplayAnimation,
  GpuAnatomyAnimation,
  JourneyOverviewAnimation,
  KernelLaunchAnimation,
  ModelReadinessAnimation,
  OneVsMultiGpuAnimation,
  PrefillKvDecodeAnimation,
  TrainingLoopAnimation,
} from "./animations";

type Mode = "beginner" | "expert";
type PartId = "model" | "inference" | "gpu" | "replay";

type Chapter = {
  id: string;
  part: PartId;
  number: string;
  title: string;
  promise: string;
  beginner: string;
  expert: string;
  takeaway: string;
  question: string;
  answers: string[];
  correct: number;
  animation:
    | "journey"
    | "training"
    | "readiness"
    | "inference"
    | "multi-gpu"
    | "anatomy"
    | "kernel"
    | "replay";
};

const parts: { id: PartId; eyebrow: string; title: string; description: string }[] = [
  {
    id: "model",
    eyebrow: "Part 1",
    title: "The model factory",
    description: "How training turns examples into reusable weights.",
  },
  {
    id: "inference",
    eyebrow: "Part 2",
    title: "The inference system",
    description: "How a request becomes streamed tokens on one or many GPUs.",
  },
  {
    id: "gpu",
    eyebrow: "Part 3",
    title: "Inside the GPU",
    description: "How kernels become blocks, warps, instructions, and memory traffic.",
  },
  {
    id: "replay",
    eyebrow: "Finale",
    title: "One prompt, end to end",
    description: "Replay every layer as one connected system.",
  },
];

const chapters: Chapter[] = [
  {
    id: "model-overview",
    part: "model",
    number: "01",
    title: "What is actually inside a model?",
    promise: "Separate a model’s architecture, weights, tokenizer, and serving software.",
    beginner: "A model is not a library of stored answers. Its weights are billions of learned numbers that shape how input patterns are transformed. The architecture says how those numbers are connected; the tokenizer maps text to token IDs.",
    expert: "A deployable artifact also includes tensor dtypes and shapes, configuration, tokenizer vocabulary and merge rules, plus checkpoint metadata. The runtime must map these artifacts onto compatible operators and hardware.",
    takeaway: "Architecture is the recipe; weights are the learned state; the tokenizer is the text interface.",
    question: "Which item contains what training learned?",
    answers: ["The weights", "The prompt", "The GPU scheduler"],
    correct: 0,
    animation: "journey",
  },
  {
    id: "training-loop",
    part: "model",
    number: "02",
    title: "How weights learn",
    promise: "Follow data through prediction, error, gradients, and an update.",
    beginner: "Training shows examples, measures how wrong the prediction was, and nudges the weights. Repeating this loop over many batches gradually produces useful behavior.",
    expert: "The forward pass produces logits and loss. Backpropagation computes gradients; the optimizer applies updates, often with mixed precision, gradient accumulation, and distributed synchronization.",
    takeaway: "Training changes weights; inference uses the finished weights without teaching them.",
    question: "What directly changes model weights during training?",
    answers: ["The optimizer update", "Token streaming", "The KV cache"],
    correct: 0,
    animation: "training",
  },
  {
    id: "model-ready",
    part: "model",
    number: "03",
    title: "From checkpoint to ready model",
    promise: "See what must happen before the first prompt can run.",
    beginner: "The serving system reserves GPU memory, loads weight files, creates workers, and warms important execution paths. Only then is the model ready for requests.",
    expert: "Large checkpoints may be sharded across devices. The runtime establishes process groups, allocates memory pools, captures graphs or compiles kernels, and validates health before admission opens.",
    takeaway: "A downloaded model is not yet an inference service; readiness is a deliberate startup sequence.",
    question: "Why can a model take time to become ready?",
    answers: ["Weights and runtime state must be placed on GPUs", "It must retrain on every startup", "The prompt must be known first"],
    correct: 0,
    animation: "readiness",
  },
  {
    id: "request-path",
    part: "inference",
    number: "04",
    title: "Before the GPU",
    promise: "Trace the short request path from client to an admitted batch.",
    beginner: "A request passes through an endpoint, is tokenized, checked, queued, and grouped with compatible work. Networking matters, but here it is the short runway before GPU execution.",
    expert: "Gateways enforce policy; routers select replicas; admission control protects latency and memory; continuous batchers combine prefill and decode work while respecting cache capacity.",
    takeaway: "The GPU sees scheduled token work, not a raw chat message.",
    question: "What is the scheduler trying to balance?",
    answers: ["Latency, throughput, and available capacity", "Only network distance", "Only model file size"],
    correct: 0,
    animation: "journey",
  },
  {
    id: "prefill-decode",
    part: "inference",
    number: "05",
    title: "Prefill, KV cache, and decode",
    promise: "Understand why reading a prompt and generating an answer behave differently.",
    beginner: "Prefill processes the prompt tokens together and builds working memory called the KV cache. Decode then produces one new token per sequence at a time, reusing that cache.",
    expert: "Prefill is typically compute-heavy and parallel across prompt positions. Decode has low arithmetic intensity, repeatedly reads model weights and growing KV state, and is often memory-bandwidth sensitive.",
    takeaway: "Prefill reads the context; decode extends it one token at a time.",
    question: "What does the KV cache avoid recomputing?",
    answers: ["Earlier attention keys and values", "Model weights", "The network request"],
    correct: 0,
    animation: "inference",
  },
  {
    id: "multi-gpu",
    part: "inference",
    number: "06",
    title: "One GPU versus many",
    promise: "Know why a model is split and where coordination appears.",
    beginner: "If one GPU cannot hold or serve the model efficiently, work can be split across GPUs. That adds communication: devices must exchange partial results before continuing.",
    expert: "Tensor parallelism partitions operations within a layer; pipeline parallelism partitions layers; data parallel replicas scale requests. Collective communication and synchronization can enter the critical path.",
    takeaway: "More GPUs add capacity, but they also add coordination.",
    question: "What new cost appears when one operation spans GPUs?",
    answers: ["Communication and synchronization", "A second tokenizer", "Weight training"],
    correct: 0,
    animation: "multi-gpu",
  },
  {
    id: "gpu-anatomy",
    part: "gpu",
    number: "07",
    title: "A GPU you can reason about",
    promise: "Place HBM, caches, SMs, schedulers, and execution units.",
    beginner: "GPU memory holds weights and temporary state. Streaming multiprocessors, or SMs, run many groups of threads. Schedulers keep ready work moving through execution units.",
    expert: "Blocks are assigned to SMs subject to register, shared-memory, thread, and block limits. Resident warps interleave instruction issue to hide latency while caches and memory systems feed operands.",
    takeaway: "A GPU is many parallel workers around a shared memory hierarchy, not one giant calculator.",
    question: "Where are thread blocks assigned for execution?",
    answers: ["Streaming multiprocessors", "The tokenizer", "The API gateway"],
    correct: 0,
    animation: "anatomy",
  },
  {
    id: "kernel-launch",
    part: "gpu",
    number: "08",
    title: "One kernel launch, end to end",
    promise: "Connect kernel code to grids, blocks, warps, scheduling, and results.",
    beginner: "The CPU launches a kernel with a grid of thread blocks. The GPU assigns blocks to SMs, divides threads into warps, issues instructions, and writes results back to memory.",
    expert: "The launch enters a command stream; hardware work distributors place eligible blocks. Warp schedulers select ready warps while dependencies, divergence, occupancy, and memory latency shape utilization.",
    takeaway: "The kernel-launch diagram is the interactive bridge from code to physical GPU execution.",
    question: "What is the scheduler selecting at instruction time?",
    answers: ["A ready warp", "A new model checkpoint", "A user request URL"],
    correct: 0,
    animation: "kernel",
  },
  {
    id: "replay",
    part: "replay",
    number: "09",
    title: "Replay one prompt",
    promise: "Watch the same request at system and GPU zoom levels.",
    beginner: "Now join the full story: a ready model receives tokens, performs prefill, iterates through decode, launches kernels, and streams text.",
    expert: "Use the replay as an index: every stage preserves the same conceptual timeline while exposing serving, distributed, kernel, scheduler, and memory details.",
    takeaway: "Models, inference systems, and GPUs are three zoom levels of one token-producing process.",
    question: "Why is the replay useful?",
    answers: ["It connects the three layers into one causal timeline", "It replaces every detailed lesson", "It benchmarks your hardware"],
    correct: 0,
    animation: "replay",
  },
];

const storageKey = "from-weights-to-tokens:v1";

function AnimationFor({ name, mode }: { name: Chapter["animation"]; mode: Mode }) {
  const props = { mode, autoPlayIntervalMs: 1700 };
  if (name === "journey") return <JourneyOverviewAnimation {...props} />;
  if (name === "training") return <TrainingLoopAnimation {...props} />;
  if (name === "readiness") return <ModelReadinessAnimation {...props} />;
  if (name === "inference") return <PrefillKvDecodeAnimation {...props} />;
  if (name === "multi-gpu") return <OneVsMultiGpuAnimation {...props} />;
  if (name === "anatomy") return <GpuAnatomyAnimation {...props} />;
  if (name === "kernel") return <KernelLaunchAnimation {...props} />;
  return <FinalReplayAnimation {...props} />;
}

export function AcademyApp() {
  const [mode, setMode] = useState<Mode>("beginner");
  const [activeChapterId, setActiveChapterId] = useState(chapters[0].id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [hydrated, setHydrated] = useState(false);
  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId) ?? chapters[0];
  const activeIndex = chapters.findIndex((chapter) => chapter.id === activeChapter.id);

  useEffect(() => {
    let restored: {
      mode?: Mode;
      activeChapterId?: string;
      completed?: string[];
      answers?: Record<string, number>;
    } = {};
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        restored = JSON.parse(saved) as {
          mode?: Mode;
          activeChapterId?: string;
          completed?: string[];
          answers?: Record<string, number>;
        };
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
    queueMicrotask(() => {
      if (restored.mode === "beginner" || restored.mode === "expert") setMode(restored.mode);
      if (chapters.some((chapter) => chapter.id === restored.activeChapterId)) {
        setActiveChapterId(restored.activeChapterId!);
      }
      if (Array.isArray(restored.completed)) {
        setCompleted(restored.completed.filter((id) => chapters.some((chapter) => chapter.id === id)));
      }
      if (restored.answers && typeof restored.answers === "object") setAnswers(restored.answers);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ mode, activeChapterId, completed, answers }),
    );
  }, [mode, activeChapterId, completed, answers, hydrated]);

  const progress = Math.round((completed.length / chapters.length) * 100);
  const part = parts.find((item) => item.id === activeChapter.part)!;
  const answered = answers[activeChapter.id];
  const correct = answered === activeChapter.correct;
  const grouped = useMemo(
    () =>
      parts.map((item) => ({
        ...item,
        chapters: chapters.filter((chapter) => chapter.part === item.id),
      })),
    [],
  );

  function persist(next: Partial<{
    mode: Mode;
    activeChapterId: string;
    completed: string[];
    answers: Record<string, number>;
  }>) {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        mode,
        activeChapterId,
        completed,
        answers,
        ...next,
      }),
    );
  }

  function goToChapter(id: string) {
    setActiveChapterId(id);
    persist({ activeChapterId: id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function completeAndContinue() {
    const nextCompleted = completed.includes(activeChapter.id)
      ? completed
      : [...completed, activeChapter.id];
    const nextChapterId =
      activeIndex < chapters.length - 1
        ? chapters[activeIndex + 1].id
        : activeChapter.id;
    setCompleted(nextCompleted);
    setActiveChapterId(nextChapterId);
    persist({ completed: nextCompleted, activeChapterId: nextChapterId });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    persist({ mode: nextMode });
  }

  function answerQuestion(index: number) {
    const nextAnswers = { ...answers, [activeChapter.id]: index };
    setAnswers(nextAnswers);
    persist({ answers: nextAnswers });
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
          <small>Saved only in this browser</small>
        </div>

        <nav className="chapter-nav">
          {grouped.map((group) => (
            <section className="nav-part" key={group.id}>
              <p>{group.eyebrow} · {group.title}</p>
              {group.chapters.map((chapter) => (
                <button
                  className={[
                    "chapter-link",
                    chapter.id === activeChapter.id && "chapter-link--active",
                  ].filter(Boolean).join(" ")}
                  key={chapter.id}
                  type="button"
                  onClick={() => goToChapter(chapter.id)}
                  aria-current={chapter.id === activeChapter.id ? "page" : undefined}
                >
                  <span>{completed.includes(chapter.id) ? "✓" : chapter.number}</span>
                  {chapter.title}
                </button>
              ))}
            </section>
          ))}
        </nav>
      </aside>

      <main id="main-content" className="learning-canvas">
        <header className="topbar">
          <div>
            <p className="topbar__eyebrow">{part.eyebrow} · {part.title}</p>
            <p className="topbar__context">{part.description}</p>
          </div>
          <div className="mode-switch" role="group" aria-label="Learning depth">
            {(["beginner", "expert"] as Mode[]).map((item) => (
              <button
                type="button"
                key={item}
                className={mode === item ? "is-active" : ""}
                onClick={() => changeMode(item)}
                aria-pressed={mode === item}
              >
                {item === "beginner" ? "Beginner" : "Expert"}
              </button>
            ))}
          </div>
        </header>

        <article className="lesson">
          <div className="lesson-hero">
            <div>
              <p className="lesson-number">Chapter {activeChapter.number}</p>
              <h1>{activeChapter.title}</h1>
              <p className="learning-promise">{activeChapter.promise}</p>
            </div>
            <div className="mode-note">
              <span>{mode === "beginner" ? "Essential path" : "Progressive depth"}</span>
              <p>
                {mode === "beginner"
                  ? "Plain language, core causal flow, and the essential checks."
                  : "Everything in Beginner, plus implementation detail and precise terminology."}
              </p>
            </div>
          </div>

          {activeChapter.id === "model-overview" ? (
            <section className="academy-promise">
              <p className="section-label">The learning promise</p>
              <h2>See the entire path, then zoom in without losing the thread.</h2>
              <div className="promise-grid">
                <div><span>01</span><strong>Model</strong><p>What weights are and how training creates them.</p></div>
                <div><span>02</span><strong>Inference</strong><p>How prompts run on a single GPU, scale across GPUs, and stream tokens.</p></div>
                <div><span>03</span><strong>GPU</strong><p>How kernels, schedulers, warps, compute, and memory execute that work.</p></div>
              </div>
            </section>
          ) : null}

          <section className="concept-card">
            <p className="section-label">Build the mental model</p>
            <p className="concept-lead">{activeChapter.beginner}</p>
            {mode === "expert" ? (
              <div className="expert-panel">
                <span>Expert layer</span>
                <p>{activeChapter.expert}</p>
              </div>
            ) : null}
          </section>

          <section className="animation-stage">
            <div className="section-heading">
              <div>
                <p className="section-label">Interactive system view</p>
                <h2>Step through the flow</h2>
              </div>
              <span className="status-chip">P0 · deterministic</span>
            </div>
            <AnimationFor name={activeChapter.animation} mode={mode} />
          </section>

          <section className="knowledge-check">
            <div>
              <p className="section-label">Quick check</p>
              <h2>{activeChapter.question}</h2>
            </div>
            <div className="answer-grid">
              {activeChapter.answers.map((answer, index) => (
                <button
                  type="button"
                  key={answer}
                  className={[
                    answered === index && (index === activeChapter.correct ? "is-correct" : "is-wrong"),
                  ].filter(Boolean).join(" ")}
                  onClick={() => answerQuestion(index)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>{answer}
                </button>
              ))}
            </div>
            {answered !== undefined ? (
              <p className={`answer-feedback ${correct ? "is-correct" : "is-wrong"}`} role="status">
                {correct
                  ? "That’s it. " + activeChapter.takeaway
                  : "Not quite. Revisit the diagram’s active stages and try again."}
              </p>
            ) : null}
          </section>

          <section className="takeaway">
            <span>Keep this</span>
            <p>{activeChapter.takeaway}</p>
          </section>

          <footer className="lesson-footer">
            <button
              type="button"
              className="secondary-button"
              disabled={activeIndex === 0}
              onClick={() => goToChapter(chapters[activeIndex - 1].id)}
            >
              Previous chapter
            </button>
            <button type="button" className="primary-button" onClick={completeAndContinue}>
              {activeIndex === chapters.length - 1 ? "Mark journey complete" : "Complete & continue"}
            </button>
          </footer>
        </article>
      </main>
    </div>
  );
}
