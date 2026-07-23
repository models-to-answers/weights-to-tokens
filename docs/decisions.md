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
