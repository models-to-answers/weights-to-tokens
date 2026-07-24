# First-release review correction plan

Last updated: 2026-07-24

This file is the acceptance contract for the correction pass requested after
the first learner review. A rendered interaction is not complete merely because
it has controls, stage labels, or changing colors. Every animation must tell a
causal story whose text, controls, visual state, calculations, Core projection,
and Expert projection agree.

## Site-wide corrections

- Remove learner-facing implementation and migration labels, including
  `Core narrative`, `MDX`, `Original Academy`, `Packet Academy retained`,
  `source preserved`, registry identifiers, and similar metadata.
- Render GitHub-flavored Markdown tables correctly. Wide comparison tables use
  horizontal headings on desktop and readable cards or an explicitly contained
  scroll region on mobile.
- Orient the learner with three parts first:
  Model Factory, Inference System, and Inside the GPU. The detailed execution
  timeline is introduced only after that orientation.
- Core is a complete plain-language path. Expert keeps the Core explanation and
  adds mechanisms, terminology, numbers, failure modes, and trade-offs.
- Every animation uses the same canonical stage labels as its persisted runtime.
  No visible control may seek to an unreachable stage.

## Model Factory

- Explain preference training as the umbrella category. RLHF trains a reward
  model and uses it to improve the answering model; DPO uses preference pairs
  directly.
- Distributed training shows four representative workers performing the same
  phase, local gradients, all-reduce, synchronized updates, and a distinct
  checkpoint artifact. Remove arbitrary cumulative GPU shading.
- Rename `Accelerator rental` to `Estimated GPU compute cost`, expose the
  assumed per-GPU-hour price, and state important exclusions.
- Preference training explicitly assigns the learner the human-rater role,
  records preference pairs, builds a dataset, trains a judge, and tests the
  judge for learned bias. Unanswered comparisons are not votes.
- The four business-adaptation approaches render as a readable comparison.
- LoRA visibly freezes the base matrix, inserts thin A/B matrices, trains only
  them, constructs `delta W = B x A`, and optionally merges the update.
- Model-release comparison headings are horizontal and inclusion states have
  accessible words, not unexplained symbols.

## Inference System

- Remove packet-course boundary and migration-history language.
- Request preparation is a sequential journey:
  authenticate, route, admit, tokenize, batch. Batching controls appear only at
  the batching stage, never predict more requests than are available, and
  expose the throughput versus time-to-first-token trade-off.
- The compute-platform explorer keeps model artifact, inference server, CUDA or
  accelerator runtime, driver, and accelerator visible in every deployment.
  Containers, Kubernetes, and virtual machines add layers rather than replace
  the inference core.
- Artifact movement stops at `weights resident in HBM - not ready yet`.
  Readiness begins at that exact handoff and adds allocation, rank connection,
  kernel/runtime initialization, warmup, health, and admission.
- Single-GPU inference follows one real prompt through tokenization, prefill,
  KV-cache creation, logits, sampling, streaming, KV append, repeated decode,
  and a completed response. TTFT and TPOT are introduced at the moments they
  are measured.
- Multi-GPU views show strategy-specific communication:
  independent replicas, all-rank tensor collectives, directional pipeline
  transfer, and selective expert routing. No decorative connector is allowed.

## Inside the GPU

- CPU/GPU comparison runs visible work. Serial dependency, independent
  throughput, and transformer matrix work change both the dependency graph and
  lane utilization.
- GPU anatomy uses synchronized hierarchies:
  hardware (`GPU -> SM -> scheduler -> pipeline/memory`) and work
  (`grid -> block -> warp -> threads`). Every zoom step changes the selected
  object and central view.
- Add the missing kernel foundation: a kernel is a small program applied across
  many data elements. Explain framework/operator, compiler/library, runtime,
  driver, and accelerator layers. Distinguish NVIDIA CUDA from AMD ROCm/HIP,
  Intel oneAPI/SYCL, and Google TPU XLA/PJRT.
- Kernel launch follows a concrete vector-add kernel from host enqueue through
  command creation, grid, block dispatch/admission, warp formation, instruction
  issue, memory completion, block replacement, and kernel completion.
- Divergence animates uniform execution, branch split, masked path A, masked
  path B, and reconvergence.
- Warp scheduling is a time-based trace where a memory-stalled warp is skipped,
  another ready warp issues, data returns, and the original warp becomes
  eligible. Pipeline choice derives from the instruction.
- Memory teaching first follows one load through the hierarchy. Coalescing then
  maps 32 lane addresses into aligned sectors and transactions; tiled reuse
  shows reduced HBM traffic.
- Roofline is an Expert-depth guided lab with scaled axes and roofs that respond
  to bandwidth and compute inputs.

## Final replay

- The replay is one stateful scenario, not a slideshow.
- The prompt `How do GPUs work?` produces a visible illustrative response,
  token by token, and finishes in a completed request state.
- System and GPU views share one clock but render genuinely different diagrams.
- Prefill and every decode iteration contain nested kernel, block, warp, and
  memory activity; GPU work is not a one-time flat detour.
- Model, request, KV-cache, output, and GPU fields represent named domain state,
  not decorative progress squares.
- Play, pause, previous, next, reset, reduced motion, direct stage selection,
  and source-chapter links remain deterministic and accessible.

## Validation

- Unit tests assert canonical stage alignment and representative calculations.
- Component tests exercise meaningful learner-visible state, including
  preference recording, LoRA progression, batching limits, streamed output,
  scheduler latency hiding, and memory transactions.
- Browser tests visit every animation in Core and Expert, seek every stage, use
  Play/Pause/step/reset where available, switch modes without losing state, and
  verify no control is unreachable.
- Repeat browser review at desktop and 390 x 844, with keyboard-only operation,
  reduced motion, direct-route reload, persistence, and automated accessibility.
- Manually play every animation in both modes and record the result in
  `docs/progress.md` before publishing.
