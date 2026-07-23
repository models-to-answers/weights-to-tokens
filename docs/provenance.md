# Source Provenance and Reuse Ledger

This project selectively learns from three existing projects. A source
repository is reference material, not an automatic dependency or merge target.

## Pinned source baselines

Captured on 2026-07-23:

| Source | Local path | Local revision | Upstream state at capture | License evidence |
| --- | --- | --- | --- | --- |
| AI Model Academy | `/Users/srmakam/Documents/Tech/ai-model-academy` | `edbd7957989195183b4ab552db3a8676a09810c4` | Local `main` was 4 commits ahead and 2 behind `origin/main`; cached upstream was `e95b1afe29f5d4411e4f3c25c6311a1aae799835` | Root `LICENSE` contains MIT License |
| Packet Academy | `/Users/srmakam/Documents/Tech/packet-academy` | `e842a93258fe744b3689d60906f54009026b10be` | Local `main` was 1 commit ahead of cached `origin/main` `a86e9aa507de72bf2eb467d0fa38ca8543de024b` | No root license file found at capture; confirm owner permission before copying |
| GPU Tutorial | `/Users/srmakam/ai-projects/GPU-Tutorial` | `66f6f9fbd135e25a08d5d4f520d7a3615e15c523` | Local `main` matched cached `origin/main` | No root license file found at capture; confirm owner permission before copying |

The GPU Tutorial canonical remote is
`https://github.com/rdhoot/GPU-Tutorial.git`.

## AI Model Academy divergence

Do not run a blind pull, reset, rebase, or merge in the source checkout. Its
local Sites-oriented history and newer upstream history have diverged. When
reviewing it:

1. Name the exact local or upstream commit being inspected.
2. Use upstream v2 ideas such as the coherent learning spine selectively.
3. Preserve useful local deployment adaptations only when they remain relevant
   to the new repository.
4. Never overwrite the local branch to make migration easier.

The safe approach is content/component-level migration into this repository,
followed by adaptation to the unified registries, animation contract, progress
schema, and visual system.

## Intended reuse by source

These are directions, not completed migrations:

### AI Model Academy

- Adapt useful model/training explanations and playground mechanics.
- Consider the newer “two tracks, one spine” organization as design input.
- Replace the old progress/question identity model with globally stable IDs.
- Do not carry over known completion-summary or preset-behavior defects.

### Packet Academy

- Reuse general React/lesson/animation implementation techniques where rights
  permit.
- Rebuild model-loading/readiness and GPU-inference concepts around the unified
  narrative.
- Adapt GPU-fabric ideas only for multi-GPU inference communication.
- Retire packet-centric navigation, generic packet journey, and VXLAN content.

### GPU Tutorial

- Adapt GPU anatomy, kernel-launch, scheduling, warp, coalescing, and memory
  concepts.
- Refactor standalone-page interactions into deterministic registered
  animations.
- Simplify the Beginner projection and retain architecture nuance in Expert
  disclosures.

## Safe reuse policy

- Prefer concepts and factual structure over copied implementation.
- Copy or adapt code, prose, illustrations, and data only when the specific
  source's license or owner permission permits it.
- Preserve copyright and license notices required by the source.
- Do not assume all repositories share AI Model Academy's MIT license.
- Do not copy dependencies or generated assets blindly.
- Review migrated code for secrets, tracking, network calls, unsafe HTML, and
  source-specific assumptions.
- Rework migrated visuals into the unified design system.
- Rework migrated interactions into the deterministic runtime.
- Verify technical claims independently when they are hardware/version
  specific; label simplifications and cite authoritative sources in the content
  source registry.

## Migration ledger

Add one row per migrated unit. “Inspired/reimplemented” means no source code,
prose, or artwork was copied.

| Date | Source commit and path | Destination path | Method | Rights basis | Changes and validation |
| --- | --- | --- | --- | --- | --- |
| 2026-07-23 | AI Model Academy `e95b1afe`, curriculum structure and model concepts | `src/content/catalog.ts`, `app/components/AcademyApp.tsx` | Inspired/reimplemented | Concepts only; no source code, prose, or artwork copied | Reauthored as one Beginner-first spine with stable IDs; catalog validation and golden-journey E2E pass |
| 2026-07-23 | Packet Academy `a86e9aa5`, model readiness and multi-GPU themes | `src/content/catalog.ts`, `app/components/animations/ModelReadinessAnimation.tsx`, `app/components/animations/OneVsMultiGpuAnimation.tsx` | Inspired/reimplemented | Concepts only; repository had no root license at capture | Removed packet/VXLAN curriculum; reauthored request arrival as a short pre-GPU summary; animation/unit/E2E checks pass |
| 2026-07-23 | GPU Tutorial `66f6f9fb`, anatomy and kernel-launch themes | `app/components/animations/GpuAnatomyAnimation.tsx`, `app/components/animations/KernelLaunchAnimation.tsx` | Inspired/reimplemented | Concepts only; repository had no root license at capture | Reauthored as deterministic accessible steps with Beginner and Expert projections; animation/unit/E2E checks pass |
| 2026-07-23 | Approved unified academy blueprint and the three pinned source baselines above | `content/chapters/*.mdx`, `src/content/supporting.ts` | Reauthored and independently sourced | Original project work plus links to public primary documentation | Twelve chapter narratives, glossary mappings, and source mappings validated for complete catalog coverage; desktop/mobile, accessibility, and rendered-route checks pass |

The typed source registry links technical claims to primary documentation from
PyTorch, Hugging Face, and NVIDIA. These links are references only; their prose
and artwork are not copied into the academy.

## Ledger procedure

Before migration:

1. Pin the exact source commit.
2. Verify rights for the specific material.
3. Identify the smallest unit that serves the unified curriculum.

During migration:

1. Bring the unit through current types and design primitives.
2. Remove source navigation, persistence, and theme coupling.
3. Add tests appropriate to its logic and learner behavior.

After migration:

1. Add or update the ledger row.
2. Record any factual sources in the academy's typed source registry.
3. Add required third-party notices.
4. Record executed validation in `docs/progress.md`.
