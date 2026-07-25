# Decisions

This is the durable decision log for **From Weights to Tokens**. New decisions
are appended with a date and status. Reversals must point to the decision they
supersede.

## Approved product decisions

### D-001 — One academy and one narrative

- **Status:** Approved
- **Date:** 2026-07-23

The unified website replaces AI Model Academy, Packet Academy, and GPU Tutorial
as the learner-facing experience. Its sequence is AI Model Factory, AI
Inference System, Inside the GPU, then one end-to-end prompt replay.

### D-002 — Inference is an explicit learning promise

- **Status:** Approved
- **Date:** 2026-07-23

The curriculum must explain a complete single-GPU inference lifecycle:
admission, tokenization, batching, prefill, KV-cache creation/use, iterative
decode, sampling, and streaming. It must also explain why and how inference
uses multiple GPUs, distinguishing replicas from cooperative parallelism and
showing the implications for communication and cache locality.

### D-003 — Beginner is complete; Expert is a superset

- **Status:** Approved
- **Date:** 2026-07-23

Beginner mode is the default and must form a coherent complete path. Expert mode
adds progressive disclosure—numbers, queues, memory state, collectives, code,
equations, profiling, and edge cases—without becoming a separate curriculum.
Both modes share concept and animation state wherever practical.

An expert-only animation is justified only when the interaction model itself
would overload the Beginner path. Such material is optional and clearly
labelled.

### D-004 — Packet networking is not a core part

- **Status:** Approved
- **Date:** 2026-07-23

Remove packet-centric networking and generic packet/VXLAN journeys. Retain only
a short summary of the phases a request passes through before reaching the
inference service/GPU.

### D-005 — Final replay is a full interactive animation

- **Status:** Approved
- **Date:** 2026-07-23

The final replay runs one prompt through all stages on a continuous timeline.
It supports play, pause, step, reset, and system/GPU zoom. Expert mode reveals
deeper overlays; it does not run a disconnected replay.

## Approved engineering decisions

### D-006 — New repository with selective migration

- **Status:** Approved
- **Date:** 2026-07-23

Build in a new repository rather than choosing one source project as the base.
Reuse reviewed content and components selectively. Do not merge three codebases
or preserve their separate visual identities.

### D-007 — React, TypeScript, MDX, and typed registries

- **Status:** Approved
- **Date:** 2026-07-23

Use React and TypeScript. MDX owns learner-facing narrative and placement of
interactions. Typed registries own application structure and cross-references:
chapters, animations, questions, glossary terms, sources, and replay stages.
Build-time validation must detect missing references, duplicate IDs, and
incomplete required metadata.

### D-008 — Frontend-only and browser-local progress

- **Status:** Approved
- **Date:** 2026-07-23

The learning product has no backend dependency. Persist only durable learner
state in a versioned browser-local schema. Progress export is not required in
the initial scope. Transient UI state such as an open tooltip is not persisted.

### D-009 — Shared deterministic animation runtime

- **Status:** Approved
- **Date:** 2026-07-23

Animations implement a common event/state contract with serializable state,
deterministic transitions, playback controls, named checkpoints, Beginner and
Expert projections, reduced-motion behavior, and replay integration metadata.
Time-driven rendering may interpolate between states, but learning truth must
live in discrete deterministic transitions.

### D-010 — Unified visual language

- **Status:** Approved
- **Date:** 2026-07-23

Use one calm learning surface and one control-room visual language for diagrams,
timelines, state inspectors, queues, and metrics. Stable semantic colors apply
throughout. Part-specific accents may aid orientation but cannot make the parts
look like different products. Expert mode increases information density rather
than changing theme.

### D-011 — Testing stack

- **Status:** Approved
- **Date:** 2026-07-23

Use:

- Vitest for deterministic transitions, persistence migrations, registries, and
  other pure logic;
- React Testing Library for learner-visible component behavior;
- Playwright for complete browser journeys, mobile, reload persistence,
  reduced-motion, direct links, and mode switching;
- TypeScript, ESLint, production build, accessibility automation, and selective
  visual regression as supporting gates.

### D-012 — Milestones are continuous

- **Status:** Approved
- **Date:** 2026-07-23

Milestones 0–6 are cumulative coverage and quality markers, not approval
barriers. Implementation may proceed across them continuously. Stop only for a
material unresolved decision or unsafe source-reuse question.

### D-013 — Golden journey is the first integration spine

- **Status:** Approved
- **Date:** 2026-07-23

The golden journey is the first complete vertical slice: prompt arrival, model
readiness, tokenization/batching, prefill, KV cache, decode/sampling/streaming,
kernel launch, block/warp scheduling, execution/memory, and response. Subsequent
chapters deepen and reuse this spine.

### D-014 — MIT-compatible reuse policy

- **Status:** Approved
- **Date:** 2026-07-23

Reuse only material whose license or owner permission is established and
compatible with this project. Preserve required notices and provenance. A
repository that lacks an explicit license is not treated as MIT merely because
another related repository uses MIT; use owner permission or reimplement.

### D-015 — Preserve substantive source coverage and interaction depth

- **Status:** Approved
- **Date:** 2026-07-23
- **Supersedes:** The narrow interpretation of D-006

The unified academy must preserve the substantive curriculum and rich
interactive teaching value of AI Model Academy, Packet Academy, and GPU
Tutorial. D-006 still requires a new repository and one unified architecture;
it does not authorize reducing source lessons to a small concept sample or
replacing deep interactives with generic step cards.

Packet-specific networking, generic packet journeys, and VXLAN remain excluded
under D-004. Relevant compute, model-loading, storage-locality, inference,
multi-GPU communication, and training-system concepts from Packet Academy are
retained after removing protocol-specific presentation.

Every retained source lesson and interaction needs an explicit destination or
an explicit, approved exclusion in `docs/migration-matrix.md`. Existing
animations should be adapted at comparable or greater teaching depth. New
animations must be thorough, polished, deterministic, accessible, and support
Beginner/Expert progressive disclosure.

### D-016 — Core and Expert are two mastery levels over one curriculum

- **Status:** Approved
- **Date:** 2026-07-24
- **Refines:** D-003 and D-009

The academy has one ordered conceptual spine. Core mode explains every
essential stage in plain language and may stand alone. Expert mode can be
entered directly: it retains the Core foundation and adds one or two meaningful
levels of mechanisms, terminology, numbers, implementation choices, failure
modes, and operational trade-offs.

Animations are not duplicated by mode. One canonical component and saved state
normally render a guided Core projection and a denser Expert projection.
Separate Expert-only labs are allowed only for intrinsically specialized work.

Every chapter has a Core check and a distinct Expert challenge. Core completion
and Expert mastery are persisted separately. Completing Expert directly
requires both checks and also satisfies Core completion. The final replay also
records Core and Expert completion separately.

### D-017 — Animation stages have one canonical contract

- **Status:** Approved by implementation acceptance criteria
- **Date:** 2026-07-24

Every animation ID has one ordered stage-label contract in
`src/content/animation-stages.ts`. The catalog, persistence clamp, rendered
controls, replay mapping, and browser audit all consume or validate that
contract. A component may add sliders or comparison choices, but those inputs
cannot masquerade as lifecycle stages.

Every canonical stage must be reachable in both Beginner and Expert, visibly
selected, and communicate a distinct learner-facing state through changed
evidence or explanation. Browser QA plays every stage in both modes; the final
replay is additionally checked in both System and GPU views.

### D-018 — The Model Factory builder is a scored capstone

- **Status:** Approved
- **Date:** 2026-07-24

“Build your model” is the fifth Model Factory chapter, not an optional
playground. It connects purpose, architecture, pretraining, alignment, release,
and the inference handoff through one deterministic design state.

The chapter has a Core check and an Expert challenge under the same completion
rules as every other chapter. It is never auto-completed by visiting the final
build sheet. The academy denominator is therefore fourteen scored items:
thirteen chapters plus the final replay. Beginner and Expert use the same saved
model design; Expert adds adjustable assumptions and technical interpretation.

### D-019 — GPU memory begins with delivery and reuse

- **Status:** Approved
- **Date:** 2026-07-24

The Beginner memory chapter answers one question: how to keep GPU execution
units working instead of waiting for data. It uses the kitchen analogy to
distinguish HBM, hardware-managed L1/L2 caches, kernel-managed shared memory,
and per-thread registers. Its shared animation first compares organized and
scattered delivery, then demonstrates explicit reuse after one HBM fetch.

Transaction sectors, alignment, synchronization, bank conflicts, and the
roofline remain available in Expert depth. The roofline must compare two
implementations performing the same useful work; arithmetic intensity is
derived from work divided by bytes moved and is not presented as an arbitrary
setting. The Expert interaction may be hidden from Beginner under D-003 because
the diagnostic model would overload the essential path.

### D-020 — The academy opens with an unscored introduction

- **Status:** Approved
- **Date:** 2026-07-24

The product name was **How AI Models Become Answers** at introduction launch.
It was refined on 2026-07-25 to **How AI Models Produce Answers**, which keeps
the approachable promise while accurately describing that a model generates an
answer rather than becoming one. “From Weights to Tokens” remains the technical
subtitle and journey theme.

The root route is an unscored introduction rather than the first Model Factory
chapter. It owns the site-level learning promise, intended audience, key
outcomes, Beginner/Expert explanation, and four direct entry points: Model
Factory, Inference System, Inside the GPU, and the final one-prompt replay.
Learner progress still counts only thirteen chapters plus the final replay.

### D-021 — Feedback is collected outside learner state

- **Status:** Approved
- **Date:** 2026-07-24

The academy identifies Sreenivas Makam and Ritesh Dhoot as maintainers. A
site-wide feedback link opens a public Google Form whose responses are stored
in a linked Google Sheet and may trigger owner notifications.

Feedback is not stored in browser-local learner state or transmitted to an
academy backend. The form warns respondents not to submit confidential or
sensitive information and makes a reply email optional.

### D-022 — Models to Answers is the umbrella identity

- **Status:** Approved
- **Date:** 2026-07-25

The public domain identity is **Models to Answers**, with
`ModelsToAnswers.tech` planned as the custom domain. The reader-facing academy
title is **How AI Models Produce Answers**, and its subtitle remains **From
Weights to Tokens: An Interactive Journey Through Models, Inference, and
GPUs**.

Source code lives in the `models-to-answers/weights-to-tokens` GitHub
repository. The GitHub organization is the durable umbrella for this and
potential future educational projects. Sreenivas Makam and Ritesh Dhoot are the
project's co-maintainers.
