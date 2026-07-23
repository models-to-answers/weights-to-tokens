# From Weights to Tokens: Agent Guide

This repository is the unified implementation of the **From Weights to Tokens**
academy. It replaces three separate learning experiences with one coherent path:

1. AI Model Factory
2. AI Inference System
3. Inside the GPU
4. A final replay that follows one prompt through every stage

This file is the operating contract for any coding agent working in the
repository.

## Read this first

Before changing code, read:

- `docs/decisions.md` for approved product and engineering decisions.
- `docs/architecture.md` for system boundaries and extension points.
- `docs/progress.md` for the current state and next useful work.
- `docs/provenance.md` before copying or adapting anything from a source project.
- `docs/migration-matrix.md` for one-to-one source coverage and exclusions.

After material work, update `docs/progress.md`. If a durable architectural choice
changes, add a dated decision to `docs/decisions.md`; do not silently rewrite an
approved decision.

## Non-negotiable constraints

- The academy is frontend-only. Do not add a database, server-side learner
  profile, authentication dependency, analytics backend, or API required for the
  learning experience.
- Durable learner state stays in the learner's browser. Use a versioned,
  validated local-storage schema and recover safely from corrupt or old data.
- Progress export is not in the initial scope.
- Beginner mode is the default complete learning path. Expert mode is a
  progressive-disclosure superset, not a separate curriculum or visual theme.
- Use one unified visual system. The control-room language may dominate
  animations and state views, but the reading surface must remain calm and
  approachable.
- Animations must use a shared deterministic runtime contract. The same input
  and action sequence must produce the same state. Playback controls,
  explanations, and diagrams must never drift apart.
- The final replay is an interactive animation over the full journey, not a
  static recap.
- Networking before inference is a brief arrival summary. Do not restore the
  packet-centric curriculum, generic packet journey, or VXLAN material.
- All interactions must work without animation when reduced motion is enabled.
- Do not merge a source application shell wholesale. Preserve every substantive
  source lesson and rich interaction unless `docs/migration-matrix.md` records
  an approved exclusion. Migrate them through this repository's types,
  deterministic runtime, accessibility contract, and unified visual system.
- A generic step-card substitute is not an acceptable migration of a richer
  source simulator. Preserve or improve the original teaching depth.

## Working method

Milestones 0 through 6 describe coverage, not stop points. Work can proceed
across milestones in parallel when interfaces are stable. Prefer vertical
slices that leave the app usable:

- content plus its registry entry;
- animation plus deterministic transition tests;
- questions plus stable IDs and feedback;
- browser-local progress plus migration tests;
- responsive and accessible presentation.

Do not wait for milestone approval unless a product decision is missing. When
blocked by a consequential ambiguity, record the question in
`docs/progress.md` and ask the user.

Keep IDs stable once released. Chapter, animation, question, glossary, and
replay-stage IDs are persistence and cross-reference keys. Renaming an ID
requires a storage migration and registry-reference update.

Keep simulations educational rather than hardware-cycle accurate unless a
chapter explicitly says otherwise. Label simplifications, architecture-specific
examples, and variable hardware figures.

## Source reuse

Use the pinned revisions in `docs/provenance.md`. Never pull, merge, or overwrite
a source checkout merely to copy material. For the diverged AI Model Academy,
inspect local and upstream histories independently and select the intended
version explicitly.

Every migrated item must be recorded in `docs/provenance.md` with:

- source repository and commit;
- original path;
- destination path;
- whether it was copied, adapted, or reimplemented;
- license/permission basis;
- substantive changes.

If reuse rights are unclear, do not copy code, prose, or artwork. Reimplement
the underlying idea from first principles and record it as inspiration only.

## Validation

Install with the repository lockfile:

```bash
npm ci
```

The current scaffold's exact checks are:

```bash
npm run lint
npm run build
npm test
```

As the approved test stack is installed, keep these canonical scripts and make
them required gates:

```bash
npm run typecheck
npm run test:unit
npm run test:e2e
```

`test:unit` must cover Vitest logic/schema tests and React Testing Library
component tests. `test:e2e` must run Playwright browser journeys. Do not claim a
target gate passed before its script exists.

Before handing off a change, run all applicable existing commands and record
the commands and results in `docs/progress.md`. Browser-facing work also needs:

- keyboard-only use;
- reduced-motion behavior;
- a `390 x 844` mobile viewport with no page-level horizontal overflow;
- persistence across reload;
- a direct-link reload of the affected chapter;
- Beginner/Expert switching without losing shared animation state.

## Safe handoff

Leave the repository runnable. Do not leave a required migration implicit in
chat. In `docs/progress.md`, record:

- what changed;
- what remains;
- validation actually run;
- known failures or debt;
- exact next recommended step;
- unresolved user decisions.

Never report a milestone, animation, or chapter as complete solely because a
placeholder renders.
