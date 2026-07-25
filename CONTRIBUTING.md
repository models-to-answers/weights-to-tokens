# Contributing

Thank you for helping improve **How AI Models Produce Answers**.

## Before you start

1. Read `AGENTS.md`.
2. Review `docs/decisions.md`, `docs/architecture.md`, and
   `docs/progress.md`.
3. Check `docs/migration-matrix.md` and `docs/provenance.md` before moving
   material from another project.
4. Open or reference an issue for changes that alter curriculum scope,
   persistence IDs, animation contracts, or architecture.

## Local setup

Use Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Do not commit credentials, `.env` files, generated build output, test reports,
or learner data.

## Implementation expectations

- Beginner mode must remain a complete plain-language learning path.
- Expert mode adds depth over the same curriculum and saved interaction state.
- Animations must be deterministic, keyboard usable, and meaningful without
  motion.
- Stable chapter, animation, question, glossary, and replay IDs must not be
  renamed without a storage migration.
- Learner state stays browser-local. Do not introduce a required backend,
  account system, or analytics service.
- New technical claims should be linked to suitable primary sources.
- Reused or adapted material must have a clear rights basis and a provenance
  entry.

## Validation

Run the checks appropriate to your change. Before requesting review, the full
suite should pass:

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run build
npm test
npm run test:e2e
git diff --check
```

Browser-facing work should also be checked at a `390 x 844` viewport, with
keyboard-only navigation and reduced motion enabled.

## Pull requests

Keep pull requests focused. Explain:

- what changed and why;
- the learner or maintainer impact;
- any curriculum, persistence, accessibility, or licensing implications; and
- the validation that actually ran.

Update `docs/progress.md` after material work. Add a dated decision to
`docs/decisions.md` when a durable product or engineering choice changes.

