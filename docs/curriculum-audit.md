# Curriculum and Interaction Audit

Last audited: 2026-07-24

This is the evidence companion to `migration-matrix.md`. A source row is not
complete merely because a destination file or animation ID exists. Completion
requires the source mental model, examples, interaction mechanics, Beginner
projection, Expert depth, and assessment to be present and usable.

## Audit method

The audit used the refreshed remote baselines recorded in `provenance.md`:

- AI Model Academy `origin/main` at `e95b1afe` (application content
  `a76714a`);
- Packet Academy `origin/main` at `a86e9aa5`;
- GPU Tutorial `origin/main` at `66f6f9fb`.

For every retained source unit, the review compared:

1. source headings and learning claims;
2. examples, decision rules, and caveats;
3. controls, meaningful states, calculations, and explanatory readouts;
4. destination narrative and registered interaction;
5. Core and Expert questions;
6. source, glossary, replay, persistence, reduced-motion, and mobile bindings.

## AI Model Academy reconciliation

| Source unit | Required teaching preserved in unified destination | Interaction | Core / Expert evidence |
| --- | --- | --- | --- |
| What a model actually is | weights vs architecture, token loop, context is not memory, hallucination boundary, temperature and decoding | Token Predictor; journey orientation | `weights.mdx`; Core token question; Expert temperature question |
| How a model gets built | pretraining, supervised tuning, preference training, evaluation/release; relative cost; concrete support example | Pipeline Stages with input, action, cost, outcome | `training-loop.mdx`; Core learning-loop question; Expert scaling question |
| Parameters and why they bloat | depth, quadratic width, vocabulary, FFN share, precision footprint, training memory, MoE total vs active | Parameter Builder | `weights.mdx` Core explanation plus Expert equation and memory layer |
| Data, time, and money | `6ND`, achieved utilization, GPU scaling limits, data/size balance, synthetic-data caveat | Training Run | `training-loop.mdx`; Expert performance question |
| Teaching judgement | SFT vs preferences, proxy risk, RLHF and direct preference methods | Preference Trainer | `training-loop.mdx` Core explanation and Expert optimization layer |
| Open and closed weights | release categories, control/permanence/modification, full operating burden, license and volume decision | Weights Spectrum | `model-artifact.mdx`; Core compatibility and Expert integrity question |
| Adapting one instead | prompting, RAG, fine-tuning, from-scratch pretraining with business examples; continued pretraining distinction; LoRA/QLoRA/adapters/prefix/head-only | LoRA Lab; Fine-tune Methods | `adaptation.mdx`; Core freshness and Expert intervention questions |
| Build one yourself | purpose-first design; genuinely different assistant, specialist, and on-device presets; depth/width sizing; pretraining scale; alignment; release; artifact handoff | Six-stage Model Builder capstone with a persistent build sheet | `build-your-model.mdx`; Core purpose-before-size question; Expert memory/precision question |

## Packet Academy reconciliation

Packet-specific journeys remain excluded by D-004. The retained system teaching
is present as follows:

| Retained source unit | Unified evidence |
| --- | --- |
| Compute-platform layers | `request-arrival.mdx` plus Compute Platform Lab; bare metal, VM, Kubernetes, Kubernetes-on-VM, control/data plane |
| Request admission and batching | request runway animation plus Core queue and Expert batching trade-off checks |
| Storage/artifact locality | `model-readiness.mdx` plus Model Locality Lab; registry, node cache, pinned host memory, HBM |
| Worker readiness | readiness-gate sequence; allocation, communicators, kernel setup, cache pools, warmup, failure gates |
| GPU inference | synchronized queue, tokenization, prefill, KV cache, decode, sampling, streaming, TTFT, TPOT |
| Multi-GPU consequences | replicas vs cooperative parallelism, tensor/pipeline/expert strategies, collectives, topology, KV locality |
| Distributed checkpoint handoff | training checkpoint, conversion, immutable artifact publication, inference load boundary |

## GPU Tutorial reconciliation

| Source unit | Unified evidence |
| --- | --- |
| Latency vs throughput | Throughput Silicon Lab; CPU/GPU die budget and workload controls |
| GPU anatomy | Crank Room Lab; package, SM, partitions, pipelines, register/shared/L1/L2/HBM hierarchy |
| Kernel model | Grid Launch Explorer; grid, blocks, threads, warps, launch geometry |
| SIMT and divergence | 32-lane mask simulator with path cost and reconvergence |
| Scheduling and latency hiding | eligibility board, four-partition trace, scoreboard explanation, resource triangle |
| Memory practice | Beginner kitchen analogy; HBM/cache/shared/register responsibilities; organized-versus-scattered delivery; explicit tiling and reuse; Expert sector, alignment, synchronization, and bank-conflict overlay |
| Kernel lifecycle | host enqueue through block admission, issue, memory completion, retirement; PTX/SASS and synchronization explanation |
| Optimization | Expert-only same-work/fewer-bytes roofline comparison, profiling checklist, and bottleneck-first decision rule |
| Reference | CPU/GPU translation table and chapter-linked glossary |

## Layering contract

- Core is a complete conceptual journey: what, why, input, output, connection,
  principal trade-off, and example.
- Expert is directly navigable. It retains the Core spine and adds mechanisms,
  numbers, equations, implementation choices, failure modes, and operations.
- Most animations have one component and one canonical saved state. Mode changes
  reveal or hide overlays and controls; they do not duplicate the animation.
- Every chapter has a Core check and an Expert challenge. Expert completion
  requires both, and directly completing Expert also satisfies Core.
- Browser-local state tracks Core completion and Expert completion separately.

## Known approved exclusions

- generic URL packet journey;
- packet-header transforms and packet diff/inspection tools;
- load-balancer and Kubernetes packet transformations;
- EVPN/VXLAN teaching;
- RDMA/RoCEv2/PFC/ECN header and queue-protocol instruction.

The system-level consequences of communication, topology, congestion, and
collectives remain in the multi-GPU lesson without restoring the packet course.
