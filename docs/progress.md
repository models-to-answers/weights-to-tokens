# Progress and Handoff

Last updated: 2026-07-24

## Current status

The product/curriculum PRD and Technical Implementation Design have been
reviewed. The user approved the repository, architecture, source-migration,
runtime, testing, visual-system, golden-journey, and milestone decisions now
captured in `docs/decisions.md`.

The first-release implementation is a corrected, browser-audited release
candidate. A previous “complete” claim was withdrawn after user review exposed
material source-coverage and animation-depth gaps. The release contract is now
the one-to-one matrix, `docs/curriculum-audit.md`, and the acceptance checklist
in `docs/review-correction-plan.md`.

## Milestone map

Milestones are cumulative coverage markers, not sequential approval gates.
Update status only with working, validated evidence.

| Milestone | Scope | Status |
| --- | --- | --- |
| 0 | Repository foundation, continuity docs, quality commands, shared types | Verified |
| 1 | Unified shell, visual tokens, navigation, Beginner/Expert contract | Verified |
| 2 | Golden-journey content spine and typed registries | Verified |
| 3 | Shared deterministic animation runtime and retained/new rich interactions | 22 chapter interactions verified |
| 4 | Questions, progress, local persistence, learning summary | Golden journey verified |
| 5 | Complete final replay and cross-chapter integration | Twelve-stage replay verified |
| 6 | Source migration completion, accessibility, mobile, performance, release QA | Verified |

“Not yet verified” does not mean no concurrent work exists. It means the
milestone's acceptance evidence has not been recorded here.

## Completed in this handoff

- Added the repository-wide `AGENTS.md`.
- Recorded approved decisions.
- Defined architecture and non-negotiable boundaries.
- Pinned source baselines and established a per-item provenance process.
- Replaced the starter preview and optional database example with a frontend-only
  academy shell.
- Added a 12-chapter typed catalog, 24 globally unique questions, 23 animation
  definitions, and 12 replay-stage definitions with reference validation.
- Added one MDX narrative for every chapter and rendered them through a typed
  chapter-to-component registry.
- Added chapter-specific glossary and primary-source panels, with keyboard
  navigation across Lesson, Glossary, and Sources.
- Reimplemented all eight AI Model Academy interaction families, the retained
  non-packet Packet Academy system interactions, and all GPU Primer interaction
  families inside one control-room visual system.
- Added deep labs for request admission, platform layers, artifact locality,
  readiness gates, synchronized inference, multi-GPU collectives, throughput
  silicon, crank-room anatomy, memory hierarchy, grid launch, divergence,
  four-partition scheduling, coalescing, shared-memory tiling, roofline
  diagnosis, and the 12-stage replay.
- Connected all learner progress, answers, mode, animation stages, and replay
  state to the canonical versioned browser-local store, including an explicit
  two-step reset.
- Added direct `/learn/:slug` chapter routes and `/replay`, with reload-safe
  navigation.
- Added a coherent 12-chapter learner-facing journey, Q&A feedback,
  browser-local completion, and a 12-stage final replay whose System and GPU
  views share one stage and link back to source chapters.
- Added reduced-motion behavior that replaces autoplay with discrete,
  deterministic advancement.
- Added Vitest, React Testing Library, rendered production HTML, and Playwright
  desktop/mobile tests, including automated accessibility checks.
- Added and wired a 1200×630 social preview image.
- Restored the source teaching that had been compressed: four model-building
  stages, four business-adaptation paths with examples, temperature, parameter
  economics, training scale, preference learning, fine-tuning methods, and
  open/closed model decisions.
- Added inline Expert depth throughout all three parts while keeping Core a
  complete plain-language path that may be taken alone.
- Added a Core check and a distinct Expert challenge to every chapter.
- Added version-two browser-local state with separate Core and Expert chapter
  and replay completion. Version-one Core progress migrates without inventing
  Expert mastery.
- Replaced misleading Model/GPU/Decision example labels, explained temperature,
  clarified the journey overview, and aligned its runtime with all twelve
  displayed stages.
- Added the evidence-based reconciliation in `docs/curriculum-audit.md`.
- Rebuilt all 23 animation stage contracts from one canonical registry so that
  every visible tab is reachable and persisted state clamps to the same count.
- Replaced decorative or ambiguous state changes with causal explanations:
  sequential request gates, artifact-to-HBM versus worker readiness, a complete
  single-GPU response, strategy-specific multi-GPU communication, CPU/GPU work
  dependency, eight-level GPU zoom, ten-stage kernel launch, six-cycle warp
  scheduling, a five-stage memory path, and a scaled roofline.
- Reframed preference training as a human-rating workflow that records labelled
  comparisons, trains a judge, distinguishes RLHF from DPO, and exposes bias.
- Added a complete response and distinct System/GPU evidence to all twelve
  final-replay stages.
- Enabled GitHub-flavored Markdown tables and removed learner-visible internal
  implementation labels.
- Completed a Chrome playback audit of all 44 chapter animation projections
  (22 animations in Beginner and Expert), covering 226 stage selections. The
  audit found and corrected two initially non-communicating stage sequences,
  plus visual hierarchy gaps in preference training, distributed training,
  LoRA, GPU anatomy, and final replay.

## Validation record

Current validation on 2026-07-24:

| Command | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run test:unit` | Passed: 2 files, 23 tests |
| `npm run build` | Passed |
| `npm test` | Passed: 23 unit/component tests, production build, 2 rendered-HTML checks |
| `npm run test:e2e` | Passed: 22 desktop/mobile Chromium journeys |
| `git diff --check` | Passed |

Browser coverage confirms every animation stage in both learning modes, Expert
disclosure, correct answer
feedback, immediate local persistence across reload, direct routes, keyboard
resource tabs, reset, replay zoom continuity, reduced motion, no serious or
critical automated accessibility violations, and no document-level overflow at
390×844. Manual Chrome QA also covered Model Factory parameter, training,
preference, and LoRA labs; single-GPU inference; GPU anatomy; kernel launch; and
the final System/GPU replay. The mobile chapter rail intentionally scrolls
inside its own navigation region.

## Next recommended work

User validation is the next step. The two-axis standards/spec review is clear.

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
