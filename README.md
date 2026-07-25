# How AI Models Produce Answers

**From Weights to Tokens: An Interactive Journey Through Models, Inference, and GPUs**

[How AI Models Produce Answers](https://from-weights-to-tokens.sreemakam.chatgpt.site)
is a frontend-only interactive academy that follows one connected AI journey:

1. how training produces model weights and deployable artifacts;
2. how an inference system prepares a prompt and runs it on one or more GPUs;
3. how GPU kernels, blocks, warps, schedulers, compute, and memory execute the
   work; and
4. how the system produces and streams the final answer.

The default **Beginner** mode teaches the complete causal spine in plain
language. **Expert** mode is progressive disclosure over the same curriculum
and animation state. Questions, completion, mode, and animation progress are
stored only in the learner's browser.

## What is included

- 13 MDX-backed chapters across Model Factory, Inference System, and Inside the
  GPU
- 23 deterministic interactive animations with Beginner and Expert projections
- a scored model-builder capstone
- per-chapter Core questions, Expert challenges, glossary terms, and primary
  source panels
- a synchronized 12-stage final replay with System and GPU views
- direct chapter URLs, keyboard navigation, reduced-motion behavior, and mobile
  support
- browser-local progress with no learner account, analytics backend, or
  application database

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. Chapter routes use `/learn/:slug`; the unified
replay is available at `/replay`.

## Quality gates

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run build
npm test
npm run test:e2e
```

Playwright browser binaries are required once per machine:

```bash
npx playwright install chromium
```

## Architecture and contributor handoff

Read [AGENTS.md](AGENTS.md) before making changes. Durable decisions, module
boundaries, migration coverage, source provenance, and verified progress live
in [`docs/`](docs/).

The main implementation boundaries are:

- `content/chapters/` — learner-facing MDX narratives
- `src/content/` — typed curriculum, animation, glossary, source, and journey
  registries
- `src/domain/` — deterministic animation and catalog contracts
- `src/state/` — versioned browser-local learner state
- `app/components/animations/` — interactive teaching experiences
- `tests/` — unit, component, rendered-output, and browser journeys

See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution workflow and
[SECURITY.md](SECURITY.md) for responsible vulnerability reporting.

## Maintainers

This project is maintained by:

- [Sreenivas Makam](https://github.com/smakam)
- [Ritesh Dhoot](https://github.com/rdhoot)

The repository is hosted by the
[`models-to-answers`](https://github.com/models-to-answers) GitHub organization.

## License and provenance

The project is licensed under the [MIT License](LICENSE), copyright 2026
Sreenivas Makam and Ritesh Dhoot.

The academy was informed by earlier AI Model Academy, Packet Academy, and GPU
Tutorial learning projects. The implementation records what was reauthored,
adapted, or independently reimplemented in
[`docs/provenance.md`](docs/provenance.md). See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the public distribution
notice.
