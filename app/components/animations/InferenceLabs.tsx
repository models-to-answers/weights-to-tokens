"use client";

import type { CSSProperties } from "react";
import type { DeterministicAnimationProps } from "./types";
import { LabFrame, Slider, Tabs, numeric } from "./ModelFactoryLabs";

const ARRIVAL_STAGES = [
  ["Authenticate", "Verify identity, quota, and request policy."],
  ["Route", "Select a healthy deployment that serves the requested model."],
  ["Admit", "Reject, defer, or accept work against capacity and latency limits."],
  ["Tokenize", "Convert text into the model's token IDs."],
  ["Batch", "Combine compatible sequences without exceeding the wait budget."],
] as const;

export function RequestArrivalLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, ARRIVAL_STAGES.length - 1);
  const queue = numeric(inputs, "queue", 7);
  const wait = numeric(inputs, "wait", 12);
  const batch = Math.min(32, Math.max(1, Math.floor(queue * (wait / 12))));
  return (
    <LabFrame
      eyebrow="Packet Academy retained concept · Request runway"
      title="Follow the request only as far as the GPU boundary"
      description="The networking curriculum is intentionally removed. What remains is the serving logic that changes when and how GPU work begins."
    >
      <Tabs
        labels={ARRIVAL_STAGES.map(([label]) => label)}
        active={active}
        onChange={(index) => onStepChange?.(index)}
      />
      <div className="runtime-lane">
        {ARRIVAL_STAGES.map(([label], index) => (
          <button
            type="button"
            className={index < active ? "is-past" : index === active ? "is-active" : ""}
            onClick={() => onStepChange?.(index)}
            key={label}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{label}</strong>
          </button>
        ))}
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          <Slider label="Compatible requests waiting" value={queue} min={1} max={32} onChange={(value) => onInputChange?.("queue", value)} />
          <Slider label="Batch wait budget" value={wait} min={1} max={40} unit=" ms" onChange={(value) => onInputChange?.("wait", value)} />
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Current phase</span><strong>{ARRIVAL_STAGES[active][0]}</strong></div>
          <div><span>Serving decision</span><strong>{ARRIVAL_STAGES[active][1]}</strong></div>
          <div><span>Projected batch</span><strong>{batch} sequences</strong></div>
          {mode === "expert" ? <div><span>Trade-off</span><strong>More batching raises throughput, but queue delay consumes TTFT budget.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

const PLATFORM_STACKS = [
  {
    name: "Bare metal",
    layers: ["Model server", "CUDA runtime", "GPU driver", "Linux host", "GPU"],
    note: "Fewest isolation layers; the team owns placement and lifecycle.",
  },
  {
    name: "Virtual machine",
    layers: ["Model server", "CUDA runtime", "Guest OS", "Hypervisor", "GPU / vGPU"],
    note: "A guest boundary adds isolation and another compatibility surface.",
  },
  {
    name: "Kubernetes",
    layers: ["Inference pod", "Container runtime", "Kubelet + device plugin", "Host driver", "GPU"],
    note: "Scheduling and health are declarative; the GPU remains a host device.",
  },
  {
    name: "Kubernetes on VMs",
    layers: ["Inference pod", "Kubernetes node", "Guest OS", "Hypervisor", "GPU / vGPU"],
    note: "The common cloud stack combines orchestration and virtualization.",
  },
] as const;

export function ComputePlatformLab({
  mode = "beginner",
  step = 0,
  onStepChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, PLATFORM_STACKS.length - 1);
  const stack = PLATFORM_STACKS[active];
  return (
    <LabFrame
      eyebrow="Packet Academy retained interaction · Compute platforms"
      title="Peel the serving stack down to the accelerator"
      description="A model can run on several infrastructure stacks. The layers change ownership and startup behavior—not the mathematical meaning of inference."
    >
      <Tabs labels={PLATFORM_STACKS.map(({ name }) => name)} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="platform-explorer">
        <div className="platform-stack">
          {stack.layers.map((layer, index) => (
            <div key={layer} style={{ "--layer": index } as CSSProperties}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{layer}</strong>
            </div>
          ))}
        </div>
        <div className="platform-note">
          <span>Selected deployment</span>
          <strong>{stack.name}</strong>
          <p>{stack.note}</p>
          {mode === "expert" ? (
            <ul>
              <li>Compatibility crosses image, runtime, driver, and device capability.</li>
              <li>Readiness must reflect the whole stack, not only a live process.</li>
              <li>Scheduling decides placement; CUDA work still reaches a physical GPU context.</li>
            </ul>
          ) : null}
        </div>
      </div>
    </LabFrame>
  );
}

const LOCALITY_STAGES = [
  ["Artifact registry", "Immutable weight shards and manifest", "remote"],
  ["Node NVMe cache", "Fast local copy for repeated starts", "local"],
  ["Pinned host memory", "Staging area for device transfer", "host"],
  ["GPU HBM", "Resident weights used by kernels", "device"],
  ["Warm worker", "Pools, graphs, kernels, and health ready", "ready"],
] as const;

export function ModelLocalityLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, LOCALITY_STAGES.length - 1);
  const modelSize = numeric(inputs, "modelSize", 140);
  const remoteGbps = numeric(inputs, "remoteGbps", 12);
  const pcieGbps = numeric(inputs, "pcieGbps", 48);
  const remoteSeconds = modelSize / Math.max(remoteGbps, 1);
  const deviceSeconds = modelSize / Math.max(pcieGbps, 1);
  return (
    <LabFrame
      eyebrow="Packet Academy retained interaction · Artifact locality"
      title="Move a model from durable storage to a warm GPU worker"
      description="Cold start is a data-locality journey plus runtime initialization. A process is not ready merely because it has started."
    >
      <Tabs labels={LOCALITY_STAGES.map(([label]) => label)} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="locality-map">
        {LOCALITY_STAGES.map(([label, detail, zone], index) => (
          <button
            type="button"
            className={index < active ? "is-past" : index === active ? "is-active" : ""}
            data-zone={zone}
            key={label}
            onClick={() => onStepChange?.(index)}
          >
            <span>{label}</span>
            <small>{detail}</small>
            <i>{index < active ? "✓" : index === active ? "moving" : "waiting"}</i>
          </button>
        ))}
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          <Slider label="Model artifact" value={modelSize} min={14} max={420} step={14} unit=" GB" onChange={(value) => onInputChange?.("modelSize", value)} />
          <Slider label="Remote read throughput" value={remoteGbps} min={2} max={40} step={2} unit=" GB/s" onChange={(value) => onInputChange?.("remoteGbps", value)} />
          <Slider label="Host-to-device throughput" value={pcieGbps} min={12} max={96} step={4} unit=" GB/s" onChange={(value) => onInputChange?.("pcieGbps", value)} />
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Remote read floor</span><strong>{remoteSeconds.toFixed(1)} s</strong></div>
          <div><span>Device transfer floor</span><strong>{deviceSeconds.toFixed(1)} s</strong></div>
          <div><span>Current state</span><strong>{LOCALITY_STAGES[active][1]}</strong></div>
          {mode === "expert" ? <div><span>Not included</span><strong>Deserialize, allocate, communicator setup, kernel/JIT work, and warmup.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

const READINESS_GATES = [
  ["Resolve", "Artifact version and manifest are immutable."],
  ["Allocate", "HBM regions, workspaces, and KV pools are reserved."],
  ["Load", "All expected tensor shards reach the correct ranks."],
  ["Initialize", "Kernels, graphs, and communication groups are usable."],
  ["Warm", "Representative shapes exercise the execution path."],
  ["Ready", "Health passes and request admission opens."],
] as const;

export function ReadinessSequenceLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, READINESS_GATES.length - 1);
  const shards = numeric(inputs, "shards", 8);
  const loaded = Math.min(shards, Math.round((active / 2) * shards));
  return (
    <LabFrame
      eyebrow="Unified inference lab · Readiness gates"
      title="Do not confuse a running process with a usable model"
      description="Every gate has evidence. Admission opens only after the worker can execute representative model work."
    >
      <Tabs labels={READINESS_GATES.map(([name]) => name)} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="readiness-console">
        <div>
          <span>weight shards in HBM</span>
          <div>{Array.from({ length: shards }, (_, index) => <i className={index < loaded ? "is-loaded" : ""} key={index}>S{index}</i>)}</div>
        </div>
        <div>
          <span>readiness gates</span>
          {READINESS_GATES.map(([name], index) => (
            <button
              type="button"
              className={index < active ? "is-past" : index === active ? "is-active" : ""}
              onClick={() => onStepChange?.(index)}
              key={name}
            >
              <i>{index < active ? "✓" : index === active ? "…" : "○"}</i>
              <strong>{name}</strong>
            </button>
          ))}
        </div>
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          <Slider label="Weight shards" value={shards} min={2} max={16} step={2} onChange={(value) => onInputChange?.("shards", value)} />
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Current evidence</span><strong>{READINESS_GATES[active][1]}</strong></div>
          <div><span>Admission</span><strong>{active === READINESS_GATES.length - 1 ? "Open" : "Closed"}</strong></div>
          {mode === "expert" ? <div><span>Multi-rank invariant</span><strong>Every rank must load its expected shards and join the same communicator generation.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

const INFERENCE_STAGES = [
  ["Queue", "Requests wait for an iteration slot."],
  ["Tokenize", "Text becomes input IDs."],
  ["Prefill", "Prompt positions run in parallel."],
  ["KV allocate", "Attention state receives cache blocks."],
  ["Decode", "Each active sequence predicts one token."],
  ["Sample", "A policy selects from logits."],
  ["Stream", "The token returns while unfinished sequences rejoin decode."],
] as const;

export function InferenceRuntimeLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, INFERENCE_STAGES.length - 1);
  const prompt = numeric(inputs, "promptTokens", 1024);
  const output = numeric(inputs, "outputTokens", 128);
  const concurrency = numeric(inputs, "concurrency", 8);
  const kvMb = (prompt + output) * concurrency * 0.5;
  const ttft = 18 + prompt * 0.045 + concurrency * 1.8;
  const tpot = 8 + concurrency * 0.42;
  return (
    <LabFrame
      eyebrow="Packet Academy retained interaction · GPU inference"
      title="Synchronize the queue, prefill, KV cache, decode, and stream"
      description="Use the stage rail and workload controls together. The visual keeps request state, GPU work, and user-visible latency on one timeline."
    >
      <Tabs labels={INFERENCE_STAGES.map(([label]) => label)} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="runtime-console">
        <div className="runtime-console__requests">
          {Array.from({ length: Math.min(concurrency, 12) }, (_, index) => (
            <i
              key={index}
              className={index <= Math.floor((active / (INFERENCE_STAGES.length - 1)) * Math.min(concurrency, 12)) ? "is-active" : ""}
              style={{ "--request": index } as CSSProperties}
            >
              R{index + 1}
            </i>
          ))}
        </div>
        <div className="runtime-console__gpu">
          <span>GPU iteration</span>
          <strong>{INFERENCE_STAGES[active][0]}</strong>
          <div className={`gpu-pulse gpu-pulse--${active}`} aria-hidden="true">
            {Array.from({ length: 24 }, (_, index) => <i key={index} />)}
          </div>
        </div>
        <div className="runtime-console__cache">
          <span>KV cache</span>
          <strong>{kvMb.toFixed(0)} MB</strong>
          <div>{Array.from({ length: 18 }, (_, index) => <i className={index < Math.min(18, active * 3) ? "is-used" : ""} key={index} />)}</div>
        </div>
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          <Slider label="Prompt length" value={prompt} min={128} max={8192} step={128} unit=" tok" onChange={(value) => onInputChange?.("promptTokens", value)} />
          <Slider label="Requested output" value={output} min={16} max={1024} step={16} unit=" tok" onChange={(value) => onInputChange?.("outputTokens", value)} />
          <Slider label="Concurrent sequences" value={concurrency} min={1} max={32} onChange={(value) => onInputChange?.("concurrency", value)} />
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Current action</span><strong>{INFERENCE_STAGES[active][1]}</strong></div>
          <div><span>Illustrative TTFT</span><strong>{ttft.toFixed(0)} ms</strong></div>
          <div><span>Illustrative TPOT</span><strong>{tpot.toFixed(1)} ms/token</strong></div>
          {mode === "expert" ? <div><span>Working set</span><strong>KV grows with layers × sequences × context; weights are reused.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

const MULTI_GPU = [
  {
    name: "Replicas",
    description: "Each GPU holds the whole model and serves different requests.",
    collective: "None on the token path",
    fit: "Throughput and availability",
  },
  {
    name: "Tensor parallel",
    description: "Every layer is split; ranks exchange partial results.",
    collective: "All-reduce / all-gather",
    fit: "Model fit and per-token compute",
  },
  {
    name: "Pipeline parallel",
    description: "Layer groups live on different ranks; microbatches flow between stages.",
    collective: "Point-to-point activation transfer",
    fit: "Very deep models and memory capacity",
  },
  {
    name: "Expert parallel",
    description: "Tokens route to selected expert shards and return.",
    collective: "All-to-all",
    fit: "Sparse mixture-of-experts models",
  },
] as const;

export function MultiGpuCollectiveLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, MULTI_GPU.length - 1);
  const ranks = numeric(inputs, "ranks", 4);
  const payload = numeric(inputs, "payload", 512);
  const link = numeric(inputs, "link", 100);
  const communicationMs = active === 0 ? 0 : (payload / link) * (active === 3 ? 2.2 : active === 2 ? 1 : 1.5);
  return (
    <LabFrame
      eyebrow="Packet Academy retained interaction · GPU fabric"
      title="See when GPUs replicate—and when they must cooperate"
      description="This keeps topology, collectives, and synchronization while removing packet headers, RDMA mechanics, RoCE, and VXLAN."
    >
      <Tabs labels={MULTI_GPU.map(({ name }) => name)} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className={`collective-map collective-map--${active}`}>
        <div className="collective-map__fabric">
          <span>accelerator fabric</span>
          {Array.from({ length: Math.min(ranks, 8) }, (_, index) => (
            <button type="button" key={index}>
              <small>rank {index}</small>
              <strong>GPU {index}</strong>
              <i>{active === 0 ? `request ${index + 1}` : active === 2 ? `layers ${index * 8}–${index * 8 + 7}` : active === 3 ? `experts ${index * 2}/${index * 2 + 1}` : `tensor shard ${index}`}</i>
            </button>
          ))}
          {active > 0 ? <div className="collective-flow" aria-hidden="true"><i /><i /><i /></div> : null}
        </div>
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          <Slider label="GPU ranks" value={ranks} min={2} max={8} onChange={(value) => onInputChange?.("ranks", value)} />
          <Slider label="Per-step payload" value={payload} min={64} max={2048} step={64} unit=" MB" onChange={(value) => onInputChange?.("payload", value)} />
          <Slider label="Effective link bandwidth" value={link} min={25} max={400} step={25} unit=" GB/s" onChange={(value) => onInputChange?.("link", value)} />
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Execution model</span><strong>{MULTI_GPU[active].description}</strong></div>
          <div><span>Token-path communication</span><strong>{MULTI_GPU[active].collective}</strong></div>
          <div><span>Illustrative communication</span><strong>{communicationMs.toFixed(1)} ms / step</strong></div>
          {mode === "expert" ? <div><span>Tail-latency rule</span><strong>A synchronized step finishes at the slowest participating rank.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}
