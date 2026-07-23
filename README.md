# From Weights to Tokens

A frontend-only interactive academy that connects three views of one AI
inference journey:

1. how training produces model weights and deployable artifacts;
2. how a prompt runs on one GPU or coordinates across multiple GPUs; and
3. how a GPU launches kernels and schedules blocks, warps, compute, and memory.

The default Beginner mode teaches the required causal spine in plain language.
Expert mode is progressive disclosure over the same chapter and animation
state. Questions, completion, and mode are saved only in browser local storage.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

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

## Architecture and handoff

Start with `AGENTS.md`. Durable decisions, module boundaries, provenance, and
verified progress live in `docs/`. Content is modeled through stable typed
registries under `src/content`; deterministic animation and learner-state
contracts live under `src/domain` and `src/state`.

There is no application database or learner-state backend.
