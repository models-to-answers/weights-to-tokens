# Progress and Handoff

Last updated: 2026-07-23

## Current status

The product/curriculum PRD and Technical Implementation Design have been
reviewed. The user approved the repository, architecture, source-migration,
runtime, testing, visual-system, golden-journey, and milestone decisions now
captured in `docs/decisions.md`.

The new repository has been created from a Sites-compatible application
scaffold. Implementation is proceeding continuously across milestones rather
than stopping for approval after each one.

## Milestone map

Milestones are cumulative coverage markers, not sequential approval gates.
Update status only with working, validated evidence.

| Milestone | Scope | Status |
| --- | --- | --- |
| 0 | Repository foundation, continuity docs, quality commands, shared types | Verified |
| 1 | Unified shell, visual tokens, navigation, Beginner/Expert contract | Verified |
| 2 | Golden-journey content spine and typed registries | Registry verified; shell integration partial |
| 3 | Shared deterministic animation runtime and P0 animations | Eight P0 animations verified |
| 4 | Questions, progress, local persistence, learning summary | Golden journey verified |
| 5 | Complete final replay and cross-chapter integration | Eleven-stage replay verified |
| 6 | Source migration completion, accessibility, mobile, performance, release QA | In progress |

“Not yet verified” does not mean no concurrent work exists. It means the
milestone's acceptance evidence has not been recorded here.

## Completed in this handoff

- Added the repository-wide `AGENTS.md`.
- Recorded approved decisions.
- Defined architecture and non-negotiable boundaries.
- Pinned source baselines and established a per-item provenance process.
- Replaced the starter preview and optional database example with a frontend-only
  academy shell.
- Added a 12-chapter typed catalog, 12 globally unique questions, 13 animation
  definitions, and 12 replay-stage definitions with reference validation.
- Added eight shared P0 animation components with deterministic step controls
  and Beginner/Expert projections.
- Added a coherent nine-stop learner-facing golden journey, Q&A feedback,
  browser-local completion, and an interactive final replay.
- Added Vitest, React Testing Library, rendered production HTML, and Playwright
  desktop/mobile tests.
- Added and wired a 1200×630 social preview image.

## Validation record

Validated on 2026-07-23 in the pre-commit worktree:

| Command | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run test:unit` | Passed: 2 files, 5 tests |
| `npm run build` | Passed |
| `npm test` | Passed: unit, production build, rendered HTML |
| `npm run test:e2e` | Passed: 4 desktop/mobile Chromium journeys |
| `git diff --check` | Passed |

Browser review also confirmed Expert disclosure, animation stepping, correct
answer feedback, immediate local persistence across reload, the final replay,
and no document-level overflow at 390×844. The mobile chapter rail intentionally
scrolls inside its own navigation region.

## Next recommended work

1. Make the learner-facing shell consume the canonical typed catalog and
   versioned academy store directly. It currently has a deliberately smaller,
   separately authored nine-stop integration adapter; the 12-chapter registry
   is validated but not yet the rendered source of truth.
2. Add the MDX content loader and move narrative blocks into chapter MDX without
   moving IDs or application state into MDX.
3. Add direct chapter routes, glossary/source panels, reset-progress UI, and
   final-replay zoom links back to source chapters.
4. Expand automated accessibility coverage, reduced-motion E2E, keyboard-only
   checks, and direct-route reload coverage.
5. Complete reviewed content migration and authoritative factual sourcing,
   updating `docs/provenance.md` per unit.

## Open questions

There are no product questions blocking implementation. The remaining items are
implementation depth, not user-decision blockers.

## Handoff checklist for another agent

- Read `AGENTS.md` and all files in `docs/` before editing.
- Inspect `git status`; preserve unrelated or concurrent work.
- Check whether package scripts changed since this entry.
- Select a bounded vertical slice and state which stable IDs it introduces.
- Check `docs/provenance.md` before using a source checkout.
- Add deterministic tests with every state-machine or persistence change.
- Validate Beginner, Expert, reduced-motion, keyboard, and mobile behavior
  proportionate to the change.
- Update this file with verified results and the next step.
