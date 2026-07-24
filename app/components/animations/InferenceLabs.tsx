"use client";

import type { CSSProperties } from "react";
import { animationStageLabels } from "@/src/content/animation-stages";
import type { DeterministicAnimationProps } from "./types";
import { LabFrame, Slider, Tabs, numeric } from "./ModelFactoryLabs";

const ARRIVAL_STAGES =
  animationStageLabels["animation.inference-system.request-arrival"];
const ARRIVAL_DETAIL = [
  "Verify identity, quota, and request policy.",
  "Select a healthy deployment serving the requested model.",
  "Accept, defer, or reject against capacity and latency limits.",
  "Convert the prompt text into the model's token IDs.",
  "Briefly group compatible ready requests before GPU dispatch.",
] as const;

export function RequestArrivalLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, ARRIVAL_STAGES.length - 1);
  const waiting = numeric(inputs, "queue", 7);
  const waitBudget = numeric(inputs, "wait", 12);
  const arrivalRate = numeric(inputs, "arrivalRate", 0.25);
  const maxBatch = numeric(inputs, "maxBatch", 16);
  const arrivalsDuringWait = Math.floor(waitBudget * arrivalRate);
  const compatibleAvailable = Math.min(32, waiting + arrivalsDuringWait);
  const projectedBatch = Math.min(maxBatch, compatibleAvailable);

  return (
    <LabFrame
      eyebrow="Request preparation"
      title="Move one prompt through five serving gates"
      description="These are sequential stages, not alternative choices. Each gate changes the request state before GPU work may begin."
    >
      <Tabs labels={ARRIVAL_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="request-gates" aria-label="Request preparation stages">
        {ARRIVAL_STAGES.map((label, index) => (
          <button
            type="button"
            className={index < active ? "is-past" : index === active ? "is-active" : ""}
            onClick={() => onStepChange?.(index)}
            key={label}
          >
            <span>{index < active ? "✓" : String(index + 1).padStart(2, "0")}</span>
            <strong>{label}</strong>
            <small>{index < active ? "passed" : index === active ? "working" : "waiting"}</small>
          </button>
        ))}
      </div>
      <div className="request-current-state" aria-live="polite">
        <span>Current request state</span>
        <strong>{ARRIVAL_STAGES[active]}</strong>
        <p>{ARRIVAL_DETAIL[active]}</p>
      </div>
      {active === 4 ? (
        <div className="batch-window">
          <div className="batch-window__queue" aria-label={`${compatibleAvailable} compatible requests available`}>
            {Array.from({ length: Math.min(compatibleAvailable, 24) }, (_, index) => (
              <i className={index < projectedBatch ? "is-batched" : ""} key={index}>R{index + 1}</i>
            ))}
          </div>
          <div className="batch-window__summary">
            <span>Dispatch after at most {waitBudget} ms</span>
            <strong>{projectedBatch} compatible sequences enter this batch</strong>
            <p>{compatibleAvailable - projectedBatch} remain queued. The batch can never contain more compatible requests than are available.</p>
          </div>
        </div>
      ) : null}
      <div className="lab-grid">
        <div className="slider-stack">
          {active === 4 ? (
            <>
              <Slider label="Compatible requests already waiting" value={waiting} min={1} max={32} onChange={(value) => onInputChange?.("queue", value)} />
              <Slider label="Maximum batch wait" value={waitBudget} min={1} max={40} unit=" ms" onChange={(value) => onInputChange?.("wait", value)} />
              {mode === "expert" ? (
                <>
                  <Slider label="Compatible arrival rate" value={arrivalRate} min={0} max={1} step={0.05} unit=" req/ms" onChange={(value) => onInputChange?.("arrivalRate", value)} />
                  <Slider label="Maximum batch size" value={maxBatch} min={1} max={32} onChange={(value) => onInputChange?.("maxBatch", value)} />
                </>
              ) : null}
            </>
          ) : <p className="lab-guidance">Batching controls appear only after authentication, routing, admission, and tokenization have succeeded.</p>}
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Serving decision</span><strong>{ARRIVAL_DETAIL[active]}</strong></div>
          <div><span>GPU work</span><strong>{active < 4 ? "Not dispatched" : `${projectedBatch} sequences ready to dispatch`}</strong></div>
          {mode === "expert" && active === 4 ? <div><span>Trade-off</span><strong>Larger batches improve throughput, but waiting consumes time-to-first-token budget.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

const PLATFORM_STAGES =
  animationStageLabels["animation.inference-system.compute-platform"];

export function ComputePlatformLab({
  mode = "beginner",
  step = 0,
  onStepChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, PLATFORM_STAGES.length - 1);
  const layers = [
    { name: "Model artifact", detail: "weights + config + tokenizer", visible: true },
    { name: "Inference server", detail: "vLLM, TensorRT-LLM, TGI, or similar", visible: true },
    { name: "Accelerator runtime", detail: "CUDA, ROCm, or oneAPI user-space libraries", visible: true },
    { name: "Container", detail: "image and container runtime", visible: active >= 1 },
    { name: "Kubernetes", detail: "pod, kubelet, scheduler, and device plugin", visible: active >= 2 },
    { name: "Guest operating system", detail: "VM boundary when present", visible: active >= 3 },
    { name: "Hypervisor / passthrough", detail: "physical GPU or virtual GPU exposure", visible: active >= 3 },
    { name: "Host GPU driver", detail: "device control and command submission", visible: true },
    { name: "GPU", detail: "physical accelerator executing kernels", visible: true },
  ];

  return (
    <LabFrame
      eyebrow="Compute platform"
      title="Keep the inference core visible while infrastructure layers are added"
      description="Containers, Kubernetes, and virtual machines change placement and ownership. They do not replace the model server, accelerator runtime, driver, or GPU."
    >
      <Tabs labels={PLATFORM_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="platform-stack-v2" aria-label={`${PLATFORM_STAGES[active]} stack`}>
        {layers.filter((layer) => layer.visible).map((layer, index) => (
          <div key={layer.name} style={{ "--layer": index } as CSSProperties}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{layer.name}</strong>
            <small>{layer.detail}</small>
          </div>
        ))}
      </div>
      <div className="lab-readouts">
        <div><span>Selected view</span><strong>{PLATFORM_STAGES[active]}</strong></div>
        <div><span>Invariant path</span><strong>Model → server → runtime → driver → GPU</strong></div>
        {mode === "expert" ? <div><span>Compatibility boundary</span><strong>Image, libraries, runtime, driver, device capability, and orchestration must agree.</strong></div> : null}
      </div>
    </LabFrame>
  );
}

const LOCALITY_STAGES =
  animationStageLabels["animation.inference-system.model-locality"];
const LOCALITY_DETAIL = [
  "Resolve an immutable model version and verify its manifest.",
  "Read weight shards from durable storage into a fast node-local cache.",
  "Stage and pin bytes in host memory for efficient device transfer.",
  "Copy each expected shard into its assigned GPU HBM region.",
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
      eyebrow="Cold start · Phase A"
      title="Move stored model files into GPU memory"
      description="This phase moves and verifies bytes. Its endpoint is weights resident in HBM—not a worker that is ready to serve."
    >
      <Tabs labels={LOCALITY_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="artifact-journey">
        {["Artifact registry", "Node NVMe cache", "Pinned host memory", "GPU HBM"].map((label, index) => (
          <button type="button" className={index < active ? "is-past" : index === active ? "is-active" : ""} onClick={() => onStepChange?.(index)} key={label}>
            <span>{index < active ? "✓" : index + 1}</span>
            <strong>{label}</strong>
            <small>{index < active ? "complete" : index === active ? "moving / verifying" : "waiting"}</small>
          </button>
        ))}
      </div>
      <div className="handoff-state">
        <span>{active === LOCALITY_STAGES.length - 1 ? "Phase A handoff" : "Current operation"}</span>
        <strong>{active === LOCALITY_STAGES.length - 1 ? "Weights resident in HBM — worker not ready yet" : LOCALITY_DETAIL[active]}</strong>
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          <Slider label="Model artifact" value={modelSize} min={14} max={420} step={14} unit=" GB" onChange={(value) => onInputChange?.("modelSize", value)} />
          {mode === "expert" ? (
            <>
              <Slider label="Remote read throughput" value={remoteGbps} min={2} max={40} step={2} unit=" GB/s" onChange={(value) => onInputChange?.("remoteGbps", value)} />
              <Slider label="Host-to-device throughput" value={pcieGbps} min={12} max={96} step={4} unit=" GB/s" onChange={(value) => onInputChange?.("pcieGbps", value)} />
            </>
          ) : null}
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Current state</span><strong>{LOCALITY_DETAIL[active]}</strong></div>
          <div><span>Remote read floor</span><strong>{remoteSeconds.toFixed(1)} s</strong></div>
          <div><span>Device transfer floor</span><strong>{deviceSeconds.toFixed(1)} s</strong></div>
          {mode === "expert" ? <div><span>Not included in Phase A</span><strong>Runtime allocation, communicators, kernel setup, warmup, and health.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

const READINESS_STAGES =
  animationStageLabels["animation.inference-system.model-loading"];
const READINESS_EVIDENCE = [
  "Every expected shard is mapped to the correct HBM region.",
  "Workspaces, memory pools, and KV-cache blocks are reserved.",
  "All ranks join the same communication-group generation.",
  "Required kernels, graphs, and execution paths are usable.",
  "Representative prompt shapes complete successfully.",
  "Health passes and request admission opens.",
] as const;

export function ReadinessSequenceLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, READINESS_STAGES.length - 1);
  const shards = numeric(inputs, "shards", 8);

  return (
    <LabFrame
      eyebrow="Cold start · Phase B"
      title="Turn resident weights into a usable inference worker"
      description="This phase begins exactly where data movement ends. Admission remains closed until the runtime can execute representative model work."
    >
      <Tabs labels={READINESS_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="readiness-v2">
        <div>
          <span>Weights already resident in HBM</span>
          <div className="shard-grid">{Array.from({ length: shards }, (_, index) => <i className="is-loaded" key={index}>S{index}</i>)}</div>
        </div>
        <ol>
          {READINESS_STAGES.slice(1).map((name, index) => {
            const stageIndex = index + 1;
            return <li className={stageIndex < active ? "is-past" : stageIndex === active ? "is-active" : ""} key={name}><span>{stageIndex < active ? "✓" : stageIndex}</span><strong>{name}</strong></li>;
          })}
        </ol>
        <div className={`admission-gate ${active === READINESS_STAGES.length - 1 ? "is-open" : ""}`}>
          <span>Request admission</span>
          <strong>{active === READINESS_STAGES.length - 1 ? "OPEN" : "CLOSED"}</strong>
        </div>
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          {mode === "expert" ? <Slider label="Weight shards" value={shards} min={2} max={16} step={2} onChange={(value) => onInputChange?.("shards", value)} /> : <p className="lab-guidance">All weight shards arrived during Phase A. The remaining gates prepare execution.</p>}
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Current evidence</span><strong>{READINESS_EVIDENCE[active]}</strong></div>
          <div><span>Worker state</span><strong>{active === 0 ? "Weights resident; runtime cold" : active === 5 ? "Warm and serving" : "Starting; admission closed"}</strong></div>
          {mode === "expert" ? <div><span>Multi-rank invariant</span><strong>Every rank must load its expected shards and join the same communicator generation.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

const INFERENCE_STAGES =
  animationStageLabels["animation.inference-system.prefill-decode"];
const PROMPT_PIECES = ["How", "do", "GPUs", "work", "?"] as const;
const OUTPUT_PIECES = ["GPUs", "run", "many", "calculations", "in", "parallel", "."] as const;
const INFERENCE_DETAIL = [
  "The serving system hands one admitted prompt to a ready worker.",
  "The tokenizer converts visible text into model-specific token IDs.",
  "All prompt positions pass through the model together on the GPU.",
  "Every layer stores reusable key/value state for the prompt positions.",
  "Decode reads the latest token, weights, and KV state to produce logits.",
  "The decoding policy selects one candidate token from the distribution.",
  "The first generated token becomes text; this marks time to first token.",
  "Each new token appends KV state and re-enters the decode loop.",
  "A stop condition fires, resources are released, and the worker stays ready.",
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
  const concurrency = numeric(inputs, "concurrency", 8);
  const outputCount = active < 6 ? 0 : active === 6 ? 1 : active === 7 ? 4 : OUTPUT_PIECES.length;
  const kvPositions = active < 3 ? 0 : PROMPT_PIECES.length + outputCount;
  const kvMb = kvPositions * concurrency * 0.5;
  const ttft = 18 + prompt * 0.045 + concurrency * 1.8;
  const tpot = 8 + concurrency * 0.42;

  return (
    <LabFrame
      eyebrow="Single-GPU inference"
      title="Follow one prompt until a complete response is streamed"
      description="The prompt, output text, KV cache, and GPU work share one state. Decode repeats until a stop condition completes the response."
    >
      <Tabs labels={INFERENCE_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="inference-story">
        <div className="inference-story__text">
          <span>Prompt</span>
          <p>{PROMPT_PIECES.join(" ")}</p>
          <div className="token-pieces">
            {PROMPT_PIECES.map((piece, index) => <i className={active >= 1 ? "is-live" : ""} key={piece}>{piece}<small>#{4100 + index * 37}</small></i>)}
          </div>
        </div>
        <div className={`inference-story__gpu ${active >= 2 && active <= 7 ? "is-active" : ""}`}>
          <span>GPU operation</span>
          <strong>{active < 2 ? "Waiting for token IDs" : active === 2 ? "Prefill kernels process all prompt positions" : active === 3 ? "KV blocks contain prompt attention state" : active <= 5 ? "Decode kernels produce next-token logits" : active === 6 ? "First token leaves the GPU" : active === 7 ? "Decode → sample → append repeats" : "Worker returns to ready"}</strong>
          <div className="gpu-work-pulse">{Array.from({ length: 24 }, (_, index) => <i className={active >= 2 && active <= 7 && index < 16 ? "is-live" : ""} key={index} />)}</div>
        </div>
        <div className="inference-story__cache">
          <span>KV cache · {kvMb.toFixed(1)} MB in this illustration</span>
          <div>{Array.from({ length: 12 }, (_, index) => <i className={index < kvPositions ? index < PROMPT_PIECES.length ? "is-prompt" : "is-output" : ""} key={index}>{index < kvPositions ? index + 1 : ""}</i>)}</div>
        </div>
        <div className="inference-story__response">
          <span>Streamed response</span>
          <p>{outputCount ? OUTPUT_PIECES.slice(0, outputCount).join(" ").replace(" .", ".") : <em>No output token yet</em>}</p>
          <strong>{active < 6 ? "Waiting for first token" : active < 8 ? `${outputCount} output token${outputCount === 1 ? "" : "s"} streamed` : "Complete ✓"}</strong>
        </div>
      </div>
      {(active === 4 || active === 5) ? (
        <div className="logit-choice" role="list" aria-label="Candidate next tokens">
          <header>
            <strong>Candidate next tokens</strong>
            <span>Probability after the decoding policy</span>
          </header>
          {[["GPUs", 62], ["They", 21], ["Modern", 11], ["A", 6]].map(([token, probability], index) => (
            <div
              className={active === 5 && index === 0 ? "is-selected" : ""}
              key={String(token)}
              role="listitem"
            >
              <span className="logit-choice__token">{token}</span>
              <i
                className="logit-choice__bar"
                aria-hidden="true"
              >
                <b style={{ width: `${probability}%` }} />
              </i>
              <strong className="logit-choice__percentage">{probability}%</strong>
            </div>
          ))}
        </div>
      ) : null}
      <div className="lab-grid">
        <div className="slider-stack">
          {mode === "expert" ? (
            <>
              <Slider label="Prompt length" value={prompt} min={128} max={8192} step={128} unit=" tok" onChange={(value) => onInputChange?.("promptTokens", value)} />
              <Slider label="Concurrent sequences" value={concurrency} min={1} max={32} onChange={(value) => onInputChange?.("concurrency", value)} />
            </>
          ) : <p className="lab-guidance">{INFERENCE_DETAIL[active]}</p>}
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Current action</span><strong>{INFERENCE_DETAIL[active]}</strong></div>
          <div><span>Time to first token</span><strong>{active < 6 ? "Still accumulating" : `${ttft.toFixed(0)} ms at first stream`}</strong></div>
          <div><span>Time per output token</span><strong>{active < 7 ? "Measured after generation begins" : `${tpot.toFixed(1)} ms/token`}</strong></div>
          {mode === "expert" ? <div><span>Working set</span><strong>KV grows with layers × sequences × context; fixed weights are reused.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

const MULTI_GPU_STAGES =
  animationStageLabels["animation.inference-system.multi-gpu"];
const MULTI_GPU_DETAIL = [
  {
    description: "Each GPU holds the complete model and serves a different request.",
    collective: "No inter-GPU collective on the token path",
    fit: "Throughput and availability",
  },
  {
    description: "Every layer is split; all ranks exchange and combine partial tensor results.",
    collective: "All-reduce or all-gather among every participating rank",
    fit: "Fit a large model and cooperate on each token",
  },
  {
    description: "Consecutive layer groups live on different GPUs; activations move in one direction.",
    collective: "Point-to-point GPU 1 → GPU 2 → GPU 3 → GPU 4",
    fit: "Fit very deep models with staged execution",
  },
  {
    description: "A router sends each token only to the GPUs holding its selected experts, then gathers the results.",
    collective: "Selective all-to-all token routing",
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
  const active = Math.min(step, MULTI_GPU_STAGES.length - 1);
  const ranks = numeric(inputs, "ranks", 4);
  const payload = numeric(inputs, "payload", 512);
  const link = numeric(inputs, "link", 100);
  const communicationMs = active === 0 ? 0 : (payload / link) * (active === 3 ? 2.2 : active === 2 ? 1 : 1.5);
  const visibleRanks = Math.min(ranks, 8);

  return (
    <LabFrame
      eyebrow="Multi-GPU inference"
      title="See exactly when GPUs work independently or communicate"
      description="Every strategy uses the same GPU cards. The request placement and communication paths change to match the selected execution model."
    >
      <Tabs labels={MULTI_GPU_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className={`multi-gpu-map multi-gpu-map--${active}`}>
        <div className="multi-gpu-map__gpus">
          {Array.from({ length: visibleRanks }, (_, index) => (
            <div key={index}>
              <span>rank {index}</span>
              <strong>GPU {index + 1}</strong>
              <small>{active === 0 ? `complete model · request ${index + 1}` : active === 1 ? `tensor shard ${index + 1}/${visibleRanks}` : active === 2 ? `layers ${index * 8 + 1}–${index * 8 + 8}` : `experts ${index * 2 + 1}/${index * 2 + 2}`}</small>
            </div>
          ))}
        </div>
        {active === 0 ? <div className="replica-requests">{Array.from({ length: Math.min(visibleRanks, 4) }, (_, index) => <i key={index}>request {index + 1} ↓ GPU {index + 1}</i>)}</div> : null}
        {active === 1 ? <div className="tensor-collective"><span>partial results</span><strong>all ranks ↔ combine ↔ all ranks</strong><small>Every GPU participates on every layer step.</small></div> : null}
        {active === 2 ? <div className="pipeline-links">{Array.from({ length: Math.max(0, visibleRanks - 1) }, (_, index) => <i key={index}>GPU {index + 1} → GPU {index + 2}</i>)}</div> : null}
        {active === 3 ? <div className="expert-routes"><i>token A → experts on GPU 1 and 3 → return</i><i>token B → experts on GPU 2 → return</i></div> : null}
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          <Slider label="GPU ranks" value={ranks} min={2} max={8} onChange={(value) => onInputChange?.("ranks", value)} />
          {mode === "expert" ? (
            <>
              <Slider label="Per-step payload" value={payload} min={64} max={2048} step={64} unit=" MB" onChange={(value) => onInputChange?.("payload", value)} />
              <Slider label="Effective link bandwidth" value={link} min={25} max={400} step={25} unit=" GB/s" onChange={(value) => onInputChange?.("link", value)} />
            </>
          ) : null}
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Execution model</span><strong>{MULTI_GPU_DETAIL[active].description}</strong></div>
          <div><span>Communication pattern</span><strong>{MULTI_GPU_DETAIL[active].collective}</strong></div>
          <div><span>Best fit</span><strong>{MULTI_GPU_DETAIL[active].fit}</strong></div>
          {mode === "expert" ? <div><span>Illustrative communication</span><strong>{communicationMs.toFixed(1)} ms / synchronized step; the slowest rank sets completion.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}
