# Architecture

## Purpose and boundaries

From Weights to Tokens is a frontend-only interactive academy. It explains how
models are produced, how inference runs on one or more GPUs, and how an
individual GPU schedules and executes the work. It is not a production
inference service, hardware simulator, LMS, or multi-user application.

The architecture optimizes for:

- coherent learning rather than source-project parity;
- deterministic, testable interactions;
- approachable Beginner content with Expert depth;
- browser-local continuity;
- maintainable content and explicit provenance;
- accessibility, mobile use, and reduced motion.

## Logical layers

```text
Routes and learning shell
        |
        +-- MDX lesson narrative
        |       |
        |       +-- registered learning components
        |
        +-- typed content registries
        |       +-- chapters
        |       +-- animations
        |       +-- questions
        |       +-- glossary and sources
        |       +-- replay stages
        |
        +-- deterministic animation runtime
        |       +-- state transitions
        |       +-- controls and checkpoints
        |       +-- Beginner/Expert projections
        |
        +-- learner-state store
                +-- in-memory application state
                +-- versioned local-storage adapter
```

There is no required database or application API. Framework build/runtime
machinery may serve static assets and routes, but learner state and learning
logic remain client-side.

## Content model

MDX contains prose, headings, callouts, and the placement of registered
interactive components. It must not become an untyped second application
runtime.

Typed registries provide stable IDs and relationships. At minimum:

```ts
type ChapterDefinition = {
  id: string
  slug: string
  part: "model-factory" | "inference" | "gpu" | "replay"
  order: number
  title: string
  content: () => Promise<unknown>
  animationIds: string[]
  questionIds: string[]
  glossaryIds: string[]
  sourceIds: string[]
  replayStageIds: string[]
}
```

Registries are the source of truth for navigation, cross-references, validation,
and persistence keys. Validation must fail on:

- duplicate or malformed stable IDs;
- missing referenced entities;
- duplicate navigation order;
- a required Beginner outcome or takeaway being absent;
- a replay stage that cannot resolve its source concept;
- a factual hardware claim requiring provenance but lacking it.

## Beginner and Expert projections

Each chapter has one shared conceptual spine.

Beginner renders the required objectives, plain-language explanation, essential
diagram states, key checks, and takeaway. Expert adds optional panels and richer
projections. Switching modes must preserve the current chapter, shared
animation state, and completed checkpoints.

Completion and exploration are distinct:

- Beginner completion records mastery of the required path.
- Expert exploration records optional depth visited.
- Visiting Expert content must not be required to complete Beginner mode.

## Animation runtime contract

Each animation definition supplies serializable state, an initial state, a pure
transition function, ordered checkpoints, available actions, and projections:

```ts
type AnimationDefinition<S, A> = {
  id: string
  version: number
  initialState: S
  transition: (state: S, action: A) => S
  checkpoints: readonly string[]
  beginnerView: (state: S) => AnimationViewModel
  expertView: (state: S) => AnimationViewModel
  reducedMotionView: (state: S) => AnimationViewModel
  replayBindings?: readonly ReplayBinding[]
}
```

Runtime rules:

- State transitions are deterministic and unit-testable.
- UI controls dispatch actions; they do not directly mutate visuals.
- Explanatory text derives from the same state as the diagram.
- Play is a sequence of discrete actions. Pause, step, reset, seek-to-checkpoint,
  and replay are first-class.
- Durations and easing are presentation metadata, not learning state.
- Reduced motion shows each meaningful state without relying on movement.
- Expert mode exposes additional fields and controls over shared state.
- Hardware-specific values are parameters with visible scope/assumptions.

The first shared set should support the approved P0 animations:

1. Complete weights-to-tokens overview
2. Training and weight-update loop
3. Model loading and readiness
4. Prefill, KV cache, and decode
5. One GPU versus multiple GPUs
6. Zoomable GPU anatomy
7. End-to-end kernel launch
8. Final one-prompt replay

## Final replay orchestration

The replay is a composed timeline, not a copied fourth curriculum. Each stage
references a stable replay-stage ID and can link back to its source chapter.
Stage adapters translate the replay's scenario into the registered animation's
inputs.

The initial timeline covers:

1. request arrival summary;
2. model readiness and placement;
3. tokenization and admission/batching;
4. prefill and KV-cache creation;
5. iterative decode, sampling, and streaming;
6. single-GPU execution or multi-GPU coordination;
7. kernel launch;
8. grid, block, warp, scheduler, and execution units;
9. memory access and result propagation;
10. streamed response.

The system-level and GPU-level views are two zoom levels over the same scenario
and timeline position.

## Learner state and local persistence

Use an in-memory store for active UI state and persist only the durable subset:

```ts
type PersistedLearningState = {
  schemaVersion: number
  mode: "beginner" | "expert"
  completedChapterIds: string[]
  expertVisitedIds: string[]
  questionAttempts: Record<string, QuestionAttempt[]>
  animationProgress: Record<string, AnimationProgress>
  replayProgress: ReplayProgress
}
```

Requirements:

- Use a project-namespaced storage key.
- Validate parsed data before hydration.
- Migrate known older schema versions in deterministic steps.
- On corrupt/unknown data, preserve app availability and reset only the invalid
  persisted payload.
- Never persist React elements, DOM nodes, timers, functions, or large assets.
- Storage access must be isolated behind an adapter so tests can use memory.
- A deliberate reset-progress control is required.
- No learner data is transmitted by the academy.

`localStorage` is sufficient for the approved initial scope. IndexedDB requires
a new decision and a demonstrated need for materially larger data.

## Visual system

The visual hierarchy is unified across all parts:

- reading canvas for narrative;
- control-room canvas for active systems;
- stable colors for compute, memory, data/token flow, communication, success,
  warning, and learner action;
- restrained accent per part for orientation only;
- shared typography, spacing, panels, controls, legends, and motion rules.

Do not import a source project's page chrome or theme. Adapt useful visualization
mechanics to shared tokens and primitives.

## Quality architecture

The test pyramid is:

1. Many Vitest tests for transitions, schemas, references, storage migrations,
   and progress calculations.
2. Focused React Testing Library tests for controls, explanations, mode
   projection, keyboard access, questions, and reduced-motion rendering.
3. A small set of Playwright journeys for the golden path, persistence,
   direct-link reloads, mobile overflow, and the final replay.

Build validation and content validation must run independently of browser tests
so structural mistakes fail quickly.

## Recommended module boundaries

Exact directories may evolve, but preserve these responsibilities:

```text
app/ or src/app/          routes and shell
content/                  MDX lessons
registries/               typed definitions and validators
learning/                 questions, glossary, completion rules
animations/runtime/       shared deterministic engine
animations/definitions/   concept-specific state machines
animations/views/         shared visual primitives and projections
replay/                   scenario and stage orchestration
state/                    active store, persistence adapter, migrations
styles/                   unified design tokens and global patterns
tests/                    unit, component, e2e, accessibility fixtures
```

Avoid dependency direction from core animation/state logic into route
components. Pure transition and validation code must run without a DOM.
