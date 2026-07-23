# Source Coverage and Interaction Migration Matrix

This matrix is a release contract. A source unit is complete only when its
substantive teaching value is present in the unified academy, its interactions
meet the deterministic Beginner/Expert contract, and its migration is recorded
in `docs/provenance.md`.

## AI Model Academy

Source baseline: upstream `e95b1afe` (`a76714a` application content), MIT.

| Source lesson | Rich interaction(s) | Unified destination | Status |
| --- | --- | --- | --- |
| What a model actually is | Token Predictor | Model Factory: model and next-token prediction | Implemented and tested |
| How a model gets built | Pipeline Stages | Model Factory: model-building pipeline | Implemented and tested |
| Parameters, and why they bloat | Parameter Builder | Model Factory: parameters and memory | Implemented and tested |
| Data, time, and money | Training Run | Model Factory: training compute and cost | Implemented and tested |
| Teaching it judgement | Preference Trainer | Model Factory: preference training | Implemented and tested |
| Open weights, closed weights | Weights Spectrum | Model Factory: artifact ownership and deployment choice | Implemented and tested |
| Adapting one instead | LoRA Lab; Fine-tune Methods | Model Factory: adaptation and PEFT | Implemented and tested |

No substantive AI Model Academy lesson or interaction is excluded.

## Packet Academy

Source baseline: `a86e9aa5` plus Sites-only local commit `e842a93`.

| Source unit | Unified destination | Status |
| --- | --- | --- |
| Compute Platforms layered architecture explorer | Inference System: where inference runs | Implemented and tested |
| GPU Inference synchronized runtime/prefill/decode lesson | Inference System: single-GPU inference | Implemented and tested |
| Storage Journey architecture and artifact-locality lesson | Inference System: model readiness and data locality | Implemented and tested |
| Distributed Training lifecycle and checkpoint handoff | Model Factory: distributed training and artifact publication | Implemented and tested |
| GPU Fabric system impact and collective concepts | Inference System: cooperative multi-GPU communication | Implemented and tested; protocol details removed |
| Request path before application termination | Inference System: short pre-GPU arrival summary | Implemented and tested; condensed |
| Generic URL packet journey, load-balancer packet transforms, Kubernetes packet transforms, EVPN/VXLAN, packet inspectors/diffs | Excluded by D-004 | Approved exclusion |
| RDMA/RoCEv2/PFC/ECN packet-header instruction | Excluded as packet-specific; retain only collective/topology/latency consequences | Approved partial exclusion |

## GPU Tutorial

Source baseline: `66f6f9fb`, confirmed current against `origin/main`.

| Source chapter | Rich interaction(s) | Unified destination | Status |
| --- | --- | --- | --- |
| Latency vs throughput | CPU/GPU silicon-budget diagrams | Inside the GPU: throughput architecture | Implemented and tested |
| Anatomy of a GPU | Crank room; partition scheduler; memory hierarchy explorer | Inside the GPU: anatomy | Implemented and tested |
| What is a kernel? | Grid/block/thread launch explorer | Inside the GPU: kernel programming model | Implemented and tested |
| SIMT, warps, divergence | Warp divergence simulator | Inside the GPU: SIMT and divergence | Implemented and tested |
| Scheduler and latency hiding | Four-partition instruction trace; warp scheduler simulator; execution pipeline | Inside the GPU: scheduling | Implemented and tested |
| Memory in practice | Coalescing simulator; shared-memory worked example | Inside the GPU: memory | Implemented and tested |
| Life of a kernel launch | Build-time and runtime eight-stage launch trace | Inside the GPU: end-to-end kernel launch | Implemented and tested |
| Optimizing kernels | Roofline and reduction checklist | Inside the GPU: optimization | Implemented and tested |
| Cheat sheet and glossary | CPU/GPU translation table and glossary | Inside the GPU: reference | Implemented and tested |

No substantive GPU Tutorial chapter or interaction is excluded.

## Acceptance

- Every non-excluded row is represented in canonical chapter/content,
  interaction, question, glossary, source, and replay registries as applicable.
- Source interactions are visually inspected beside their unified adaptations.
- Beginner preserves the mental model; Expert preserves the technical depth.
- Reduced motion exposes every meaningful state without relying on movement.
- Keyboard, mobile, direct-route, persistence, accessibility, and deterministic
  state tests pass.
