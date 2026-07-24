"use client";

import type { CSSProperties, ReactNode } from "react";
import { animationStageLabels } from "@/src/content/animation-stages";
import type { DeterministicAnimationProps } from "./types";
import { LabFrame, Slider, Tabs, numeric } from "./ModelFactoryLabs";

const THROUGHPUT_STAGES =
  animationStageLabels["animation.inside-gpu.throughput-silicon"];

export function ThroughputSiliconLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, THROUGHPUT_STAGES.length - 1);
  const operations = numeric(inputs, "operations", 32);
  const gpuLanes = numeric(inputs, "parallelism", 32);
  const cpuLanes = 4;
  const effectiveGpuLanes = active === 0 ? 1 : active === 1 ? gpuLanes : Math.min(gpuLanes, 64);
  const cpuTime = active === 0 ? operations : Math.ceil(operations / cpuLanes) * 4;
  const gpuTime = 12 + Math.ceil(operations / Math.max(1, effectiveGpuLanes)) * (active === 2 ? 2 : 4);
  const workItems = Math.min(operations, 32);

  return (
    <LabFrame
      eyebrow="Latency versus throughput"
      title="Run the same work on a few wide CPU cores and many GPU lanes"
      description="The workload changes the dependency graph. Many lanes help only when enough independent, regular work is ready at the same time."
    >
      <Tabs labels={THROUGHPUT_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className={`workload-shape workload-shape--${active}`}>
        <span>Work dependency</span>
        <div>
          {Array.from({ length: workItems }, (_, index) => (
            <i key={index}>{active === 0 && index < workItems - 1 ? `${index + 1} →` : index + 1}</i>
          ))}
        </div>
        <strong>{active === 0 ? "Each operation waits for the previous result." : active === 1 ? "Every operation can run independently." : "Matrix tiles can be processed in parallel, while decode tokens remain sequential."}</strong>
      </div>
      <div className="processor-race">
        <div>
          <span>CPU · four wide cores</span>
          <div className="processor-lanes processor-lanes--cpu">
            {Array.from({ length: cpuLanes }, (_, index) => <i className="is-busy" key={index}>core {index + 1}</i>)}
          </div>
          <strong>{active === 0 ? "Strong fit for one dependency chain" : `${cpuLanes} operations at a time`}</strong>
        </div>
        <div>
          <span>GPU · launch overhead + many lanes</span>
          <div className="processor-lanes processor-lanes--gpu">
            {Array.from({ length: Math.min(gpuLanes, 64) }, (_, index) => <i className={index < effectiveGpuLanes ? "is-busy" : ""} key={index} />)}
          </div>
          <strong>{active === 0 ? "Most lanes idle because only one operation is ready" : `${effectiveGpuLanes} lanes can receive independent work`}</strong>
        </div>
      </div>
      <div className="silicon-budget-note">
        <div><span>CPU silicon</span><strong>Control, prediction, and large caches reduce latency for a few threads.</strong></div>
        <div><span>GPU silicon</span><strong>More arithmetic lanes and thread state increase throughput.</strong></div>
        <small>Conceptual allocation—not a physical die-area scale drawing.</small>
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          <Slider label="Visible operations" value={operations} min={8} max={64} step={8} onChange={(value) => onInputChange?.("operations", value)} />
          {mode === "expert" ? <Slider label="Available GPU lanes" value={gpuLanes} min={8} max={64} step={8} onChange={(value) => onInputChange?.("parallelism", value)} /> : null}
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Illustrative CPU time</span><strong>{cpuTime} normalized cycles</strong></div>
          <div><span>Illustrative GPU time</span><strong>{gpuTime} normalized cycles, including launch</strong></div>
          <div><span>Interpretation</span><strong>{active === 0 ? "Extra lanes cannot break a true dependency." : active === 1 ? "Throughput rises when independent work fills lanes." : "Transformer matrix work exposes tiles; the decode loop still advances token by token."}</strong></div>
          {mode === "expert" ? <div><span>Caveat</span><strong>Memory traffic, divergence, occupancy, and instruction mix limit achieved parallelism.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

const ANATOMY_STAGES =
  animationStageLabels["animation.inside-gpu.zoom-anatomy"];
const HARDWARE_BREADCRUMB = [
  "GPU package",
  "GPU package → GPU die",
  "GPU die → selected SM",
  "Selected SM (hardware stays fixed)",
  "Selected SM (hardware stays fixed)",
  "Selected SM → warp scheduler",
  "Selected SM → execution pipeline",
  "Selected SM → cache hierarchy → HBM",
] as const;
const WORK_BREADCRUMB = [
  "Model operation",
  "Model operation → kernel grid",
  "Kernel grid → block assigned to the SM",
  "Resident block",
  "Block threads → 32-thread warps",
  "Eligible warp selected",
  "Warp instruction issued",
  "Load addresses → operands returned",
] as const;

function AnatomyScene({ stage }: { stage: number }): ReactNode {
  if (stage === 0) {
    return <div className="anatomy-package"><div><span>HBM</span><span>HBM</span></div><strong>GPU package</strong><small>GPU die and high-bandwidth memory are connected inside the accelerator package.</small></div>;
  }
  if (stage === 1) {
    return <div className="anatomy-die"><span>L2 cache + memory controllers + fabric</span><div>{Array.from({ length: 12 }, (_, index) => <i className={index === 5 ? "is-selected" : ""} key={index}>SM {index + 1}</i>)}</div><strong>One SM selected for the next zoom</strong></div>;
  }
  if (stage === 2) {
    return <div className="anatomy-sm"><span>Selected streaming multiprocessor</span><div className="anatomy-sm__top"><i>register file</i><i>shared memory / L1</i></div><div className="anatomy-sm__middle">{["scheduler 0", "scheduler 1", "scheduler 2", "scheduler 3"].map((label) => <i key={label}>{label}</i>)}</div><div className="anatomy-sm__bottom">{["FP", "INT", "Tensor", "LD/ST"].map((label) => <i key={label}>{label}</i>)}</div></div>;
  }
  if (stage === 3) {
    return <div className="anatomy-blocks"><span>Resident work on one SM</span><div><i className="is-selected">Block A · selected</i><i>Block B</i><i>Block C</i></div><strong>Blocks share this SM but keep their own thread and shared-memory scope.</strong></div>;
  }
  if (stage === 4) {
    return <div className="anatomy-warps"><span>Selected 128-thread block</span>{Array.from({ length: 4 }, (_, warp) => <div key={warp}><strong>Warp {warp}</strong>{Array.from({ length: 8 }, (_, lane) => <i key={lane}>{warp * 8 + lane}</i>)}<small>8 of 32 lanes shown</small></div>)}</div>;
  }
  if (stage === 5) {
    return <div className="anatomy-scheduler"><span>Scheduler partition</span><div><i className="is-ready">W0 · ready</i><i className="is-stalled">W1 · memory wait</i><i className="is-selected">W2 · selected</i><i className="is-ready">W3 · ready</i></div><strong>One eligible warp is selected for this issue opportunity.</strong></div>;
  }
  if (stage === 6) {
    return <div className="anatomy-pipelines"><span>Issued instruction from Warp 2</span><div>{["FP32", "INT", "Tensor", "Load / store", "Special"].map((label, index) => <i className={index === 2 ? "is-selected" : ""} key={label}>{label}</i>)}</div><strong>Matrix instruction → tensor pipeline</strong></div>;
  }
  return <div className="anatomy-memory"><span>Operand path for a load</span>{["Registers", "Shared / L1", "L2 cache", "HBM"].map((label, index) => <div className={index <= 3 ? "is-active" : ""} key={label}><i>{index + 1}</i><strong>{label}</strong>{index < 3 ? <b>→</b> : null}</div>)}<small>Data returns along the hierarchy and makes the waiting warp eligible.</small></div>;
}

export function GpuCrankRoomLab({
  mode = "beginner",
  step = 0,
  onStepChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, ANATOMY_STAGES.length - 1);
  return (
    <LabFrame
      eyebrow="GPU anatomy"
      title="Zoom through hardware while following the work mapped onto it"
      description="Hardware and work are related but different hierarchies. Blocks and warps are assigned work; SMs, schedulers, pipelines, and memory are hardware."
    >
      <Tabs labels={ANATOMY_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="anatomy-breadcrumbs">
        <div><span>Hardware at this zoom</span><strong>{HARDWARE_BREADCRUMB[active]}</strong></div>
        <div><span>Work mapped here</span><strong>{WORK_BREADCRUMB[active]}</strong></div>
      </div>
      <div className={`anatomy-scene anatomy-scene--${active}`} aria-live="polite">
        <AnatomyScene stage={active} />
      </div>
      <div className="lab-readouts">
        <div><span>Selected level</span><strong>{ANATOMY_STAGES[active]}</strong></div>
        <div><span>Mapping rule</span><strong>{active < 2 ? "The device contains many SMs." : active < 4 ? "Complete blocks are admitted to one SM." : active === 4 ? "Block threads are grouped into 32-thread NVIDIA warps." : active === 5 ? "The scheduler chooses an eligible warp, not an individual thread." : active === 6 ? "The warp instruction targets a compatible pipeline." : "Operands travel through the memory hierarchy."}</strong></div>
        {mode === "expert" ? <div><span>Portable versus specific</span><strong>The hierarchy is durable; warp width, counts, pipeline widths, and naming vary by architecture.</strong></div> : null}
      </div>
    </LabFrame>
  );
}

const LAUNCH_STAGES =
  animationStageLabels["animation.inside-gpu.kernel-launch"];
const LAUNCH_DETAIL = [
  "One small device program says what each parallel thread does.",
  "CPU code enqueues the kernel, arguments, and launch geometry on a stream.",
  "The runtime and driver create an accelerator command; the CPU can continue.",
  "The grid contains every block needed to cover the input elements.",
  "The device distributes ready blocks across SMs with capacity.",
  "One SM reserves registers, shared memory, thread slots, and block slots.",
  "The selected block's threads are grouped into 32-thread NVIDIA warps.",
  "A scheduler issues one eligible warp instruction to a compatible pipeline.",
  "Loads receive data; dependencies clear and execution continues.",
  "All blocks finish, results are visible to dependent work, and the grid retires.",
] as const;

export function GridLaunchExplorer({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, LAUNCH_STAGES.length - 1);
  const elements = numeric(inputs, "elements", 1024);
  const blockSize = numeric(inputs, "blockSize", 128);
  const sms = numeric(inputs, "sms", 4);
  const blocks = Math.ceil(elements / blockSize);
  const warpsPerBlock = Math.ceil(blockSize / 32);
  const illustrativeResidentBlocks = 2;
  const dispatchRounds = Math.ceil(blocks / (sms * illustrativeResidentBlocks));

  return (
    <LabFrame
      eyebrow="Kernel programming and launch"
      title="Follow one vector-add kernel from source operation to completion"
      description="A kernel is a small program applied across many data elements. The launch creates blocks of threads; hardware maps those blocks onto SMs."
    >
      <Tabs labels={LAUNCH_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="kernel-example">
        <span>Example operation</span>
        <code>{`C[i] = A[i] + B[i]`}</code>
        <strong>{active === 0 ? "Each thread computes one valid index i." : `${elements.toLocaleString()} elements → ${blocks.toLocaleString()} blocks × ${blockSize} threads`}</strong>
      </div>
      <div className={`kernel-lifecycle kernel-lifecycle--${active}`}>
        <div className={active === 1 ? "is-active" : active > 1 ? "is-past" : ""}><span>CPU stream</span><strong>{active < 1 ? "kernel not submitted" : "vectorAdd(args, grid, block)"}</strong></div>
        <div className={active === 2 ? "is-active" : active > 2 ? "is-past" : ""}><span>Runtime + driver</span><strong>{active < 2 ? "waiting" : "command and dependencies packaged"}</strong></div>
        <div className={active >= 3 && active <= 4 ? "is-active" : active > 4 ? "is-past" : ""}>
          <span>Grid · representative blocks</span>
          <div className="kernel-grid">{Array.from({ length: Math.min(blocks, 16) }, (_, index) => <i className={active >= 4 ? `sm-${index % Math.max(1, Math.min(sms, 4))}` : ""} key={index}>B{index}</i>)}</div>
        </div>
        <div className={active >= 4 && active <= 5 ? "is-active" : active > 5 ? "is-past" : ""}>
          <span>Available SMs</span>
          <div className="kernel-sms">{Array.from({ length: Math.min(sms, 4) }, (_, index) => <i key={index}>SM {index + 1}{active >= 5 && index === 0 ? <small>selected block admitted</small> : null}</i>)}</div>
        </div>
        <div className={active >= 6 && active <= 8 ? "is-active" : active > 8 ? "is-past" : ""}>
          <span>Selected block · {warpsPerBlock} warps</span>
          <div className="kernel-warps">{Array.from({ length: Math.min(warpsPerBlock, 8) }, (_, index) => <i className={active === 7 && index === 0 ? "is-issued" : active === 8 && index === 0 ? "is-waiting" : ""} key={index}>W{index}</i>)}</div>
          <strong>{active === 7 ? "W0 issues add/load work" : active === 8 ? "W0 waits until operands return" : "threads grouped in hardware issue units"}</strong>
        </div>
        <div className={active === 9 ? "is-active" : ""}><span>Completion</span><strong>{active === 9 ? "all blocks complete · result C ready ✓" : "waiting for every block"}</strong></div>
      </div>
      <div className="stage-narration"><span>Stage {active + 1}</span><strong>{LAUNCH_STAGES[active]}</strong><p>{LAUNCH_DETAIL[active]}</p></div>
      <div className="lab-grid">
        <div className="slider-stack">
          {mode === "expert" ? (
            <>
              <Slider label="Elements" value={elements} min={256} max={8192} step={256} onChange={(value) => onInputChange?.("elements", value)} />
              <Slider label="Threads per block" value={blockSize} min={64} max={512} step={32} onChange={(value) => onInputChange?.("blockSize", value)} />
              <Slider label="Available SMs" value={sms} min={2} max={16} step={2} onChange={(value) => onInputChange?.("sms", value)} />
            </>
          ) : <p className="lab-guidance">Core uses small representative numbers so every grid, block, warp, and SM can be followed visually.</p>}
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Grid shape</span><strong>{blocks.toLocaleString()} blocks × {blockSize} threads</strong></div>
          <div><span>Selected block</span><strong>{blockSize} threads → {warpsPerBlock} warps</strong></div>
          {mode === "expert" ? <div><span>Illustrative dispatch rounds</span><strong>{dispatchRounds} at an explicit assumption of two resident blocks per SM; actual residency is resource-limited.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

const DIVERGENCE_STAGES =
  animationStageLabels["animation.inside-gpu.divergence"];

export function DivergenceSimulator({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, DIVERGENCE_STAGES.length - 1);
  const split = numeric(inputs, "split", 16);
  const pathA = numeric(inputs, "pathA", 5);
  const pathB = numeric(inputs, "pathB", 8);
  const divergent = split > 0 && split < 32;
  const serialCycles = divergent ? pathA + pathB : split === 0 ? pathB : pathA;
  const useful = ((split * pathA) + ((32 - split) * pathB)) / (32 * Math.max(serialCycles, 1));
  const narration = [
    "All 32 lanes issue the same instruction together.",
    "The branch condition sends some threads to A and the rest to B.",
    "The warp executes path A while path-B lanes are masked off.",
    "The warp executes path B while path-A lanes are masked off.",
    "All lanes meet again and continue on one instruction stream.",
  ] as const;

  return (
    <LabFrame
      eyebrow="SIMT and divergence"
      title="Watch one warp execute two branch paths under masks"
      description="Threads keep individual data and branch decisions, but a warp issues one shared instruction stream. Divergent paths therefore run one after the other."
    >
      <Tabs labels={DIVERGENCE_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className={`warp-lanes-v2 warp-lanes-v2--stage-${active}`}>
        {Array.from({ length: 32 }, (_, index) => {
          const path = index < split ? "a" : "b";
          const masked = active === 2 ? path === "b" : active === 3 ? path === "a" : false;
          return <i className={`${path === "a" ? "path-a" : "path-b"} ${masked ? "is-masked" : ""}`} key={index}><span>{index}</span><strong>{active === 0 || active === 4 ? "•" : path.toUpperCase()}</strong></i>;
        })}
      </div>
      <div className="branch-execution">
        <span>Issued work</span>
        <div className={active >= 2 ? "is-active" : ""}>Path A · {pathA} instructions</div>
        <div className={active >= 3 ? "is-active" : ""}>Path B · {pathB} instructions</div>
        <strong>{active === 4 ? `Reconverged after ${serialCycles} issued instruction cycles` : narration[active]}</strong>
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          {mode === "expert" ? (
            <>
              <Slider label="Threads taking path A" value={split} min={0} max={32} onChange={(value) => onInputChange?.("split", value)} />
              <Slider label="Path A instructions" value={pathA} min={1} max={16} onChange={(value) => onInputChange?.("pathA", value)} />
              <Slider label="Path B instructions" value={pathB} min={1} max={16} onChange={(value) => onInputChange?.("pathB", value)} />
            </>
          ) : <p className="lab-guidance">{narration[active]}</p>}
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Warp behavior</span><strong>{divergent ? "Both paths issue serially under different masks" : "All lanes agree; only one path issues"}</strong></div>
          <div><span>Issued cycles</span><strong>{serialCycles}</strong></div>
          <div><span>Lane utilization</span><strong>{(useful * 100).toFixed(0)}%</strong></div>
          {mode === "expert" ? <div><span>Reconvergence</span><strong>Execution reconverges at the branch&apos;s post-dominator.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

const SCHEDULER_STAGES =
  animationStageLabels["animation.inside-gpu.warp-scheduler"];
const SCHEDULER_TIMELINE = [
  { issued: "—", w0: "ready · LD", w1: "ready · FP32", w2: "dependency", pipeline: "none", note: "The scoreboard sees two eligible warps." },
  { issued: "W0 · LD", w0: "issued load", w1: "ready · FP32", w2: "dependency", pipeline: "LD/ST", note: "Warp 0 issues a memory load." },
  { issued: "—", w0: "memory wait", w1: "ready · FP32", w2: "dependency", pipeline: "none", note: "Warp 0 is resident but temporarily ineligible." },
  { issued: "W1 · FP32", w0: "memory wait", w1: "issued FP32", w2: "dependency", pipeline: "FP32", note: "The scheduler hides Warp 0's wait by issuing independent Warp 1." },
  { issued: "return", w0: "ready · ADD", w1: "ready · FP32", w2: "dependency", pipeline: "LD/ST", note: "Warp 0's operands return and its dependency clears." },
  { issued: "W0 · ADD", w0: "issued ADD", w1: "ready · FP32", w2: "dependency", pipeline: "FP32", note: "Warp 0 becomes eligible and resumes." },
] as const;

export function SchedulerTraceLab({
  mode = "beginner",
  step = 0,
  onStepChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, SCHEDULER_STAGES.length - 1);
  const state = SCHEDULER_TIMELINE[active];
  const warps = [["Warp 0", state.w0], ["Warp 1", state.w1], ["Warp 2", state.w2]] as const;

  return (
    <LabFrame
      eyebrow="Warp scheduling"
      title="See a stalled warp skipped and resumed after its data returns"
      description="Latency hiding does not make memory faster. It keeps execution pipelines useful by issuing independent eligible work while another warp waits."
    >
      <Tabs labels={SCHEDULER_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="scheduler-story">
        <div className="scheduler-story__warps">
          {warps.map(([name, detail], index) => <div className={detail.includes("issued") ? "is-issued" : detail.includes("wait") || detail.includes("dependency") ? "is-stalled" : "is-ready"} key={name}><span>{name}</span><strong>{detail}</strong><small>{index === 0 ? "load then add" : index === 1 ? "independent arithmetic" : "waiting on prior result"}</small></div>)}
        </div>
        <div className="scheduler-story__decision">
          <span>Scoreboard + scheduler</span>
          <strong>{state.issued === "—" ? "Inspect eligibility" : `Issue: ${state.issued}`}</strong>
          <p>{state.note}</p>
        </div>
        <div className="scheduler-story__pipelines">
          {["LD/ST", "FP32", "Tensor"].map((pipeline) => <i className={state.pipeline === pipeline ? "is-active" : ""} key={pipeline}>{pipeline}</i>)}
        </div>
      </div>
      <div className="scheduler-timeline" aria-label="Scheduling events so far">
        {SCHEDULER_TIMELINE.map((event, index) => <i className={index < active ? "is-past" : index === active ? "is-active" : ""} key={index}><span>C{index}</span><strong>{event.issued}</strong></i>)}
      </div>
      <div className="lab-readouts">
        <div><span>Current lesson</span><strong>{state.note}</strong></div>
        <div><span>Eligible now</span><strong>{active === 2 || active === 3 ? "Warp 1" : active >= 4 ? "Warp 0 and Warp 1" : "Warp 0 and Warp 1"}</strong></div>
        {mode === "expert" ? <div><span>Important distinction</span><strong>Residency supplies candidates; scoreboard dependencies and pipeline availability determine eligibility.</strong></div> : null}
      </div>
    </LabFrame>
  );
}

const MEMORY_STAGES =
  animationStageLabels["animation.inside-gpu.coalesced-memory"];
const ACCESS_PATTERNS = ["contiguous", "stride2", "scattered", "tiled"] as const;

export function CoalescingLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, MEMORY_STAGES.length - 1);
  const requestedPattern = typeof inputs?.pattern === "string" ? inputs.pattern : "contiguous";
  const pattern = ACCESS_PATTERNS.includes(requestedPattern as typeof ACCESS_PATTERNS[number]) ? requestedPattern as typeof ACCESS_PATTERNS[number] : "contiguous";
  const customStride = numeric(inputs, "stride", 17);
  const stride = pattern === "contiguous" || pattern === "tiled" ? 1 : pattern === "stride2" ? 2 : customStride;
  const addresses = Array.from({ length: 32 }, (_, lane) => lane * stride);
  const sectorIds = [...new Set(addresses.map((address) => Math.floor(address / 8)))];
  const sectors = sectorIds.length;
  const efficiency = Math.min(1, 4 / sectors);
  const cacheHits = pattern === "tiled" && active >= 2 ? 28 : 0;
  const hbmSectors = pattern === "tiled" ? 4 : sectors;
  const stageExplanation = [
    `All 32 lanes issue one load instruction and request 32 addresses. The ${pattern} pattern determines how far apart those addresses are.`,
    `The coalescer groups requested bytes into ${sectors} aligned 32-byte sector${sectors === 1 ? "" : "s"}. Fewer sectors mean less transferred overhead.`,
    pattern === "tiled"
      ? "The block checks shared memory and L1 for a reusable tile before going farther."
      : "The request checks the SM-local cache path, then L2. A miss must continue to HBM.",
    `${hbmSectors} sector${hbmSectors === 1 ? "" : "s"} must be served by HBM under this teaching assumption.`,
    pattern === "tiled"
      ? "Returned values fill the shared-memory tile; nearby threads reuse them without repeating 28 HBM requests."
      : "Returned sectors are unpacked into per-lane register values so the waiting warp can become eligible.",
  ] as const;

  return (
    <LabFrame
      eyebrow="GPU memory access"
      title="Follow one warp load and see its addresses become transactions"
      description="Thirty-two lanes request four-byte values. Aligned neighboring addresses combine into fewer 32-byte sectors; reused values can remain close to the SM."
    >
      <Tabs labels={MEMORY_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="stage-narration">
        <span>Memory stage {active + 1}</span>
        <strong>{MEMORY_STAGES[active]}</strong>
        <p>{stageExplanation[active]}</p>
      </div>
      <div className="pattern-picker" role="group" aria-label="Memory access pattern">
        {[["contiguous", "Contiguous"], ["stride2", "Stride 2"], ["scattered", "Scattered"], ["tiled", "Tiled reuse"]].map(([id, label]) => <button type="button" className={pattern === id ? "is-active" : ""} aria-pressed={pattern === id} onClick={() => onInputChange?.("pattern", id)} key={id}>{label}</button>)}
      </div>
      <div className={`memory-journey memory-journey--stage-${active}`}>
        <div className="memory-lanes">
          <span>Warp lanes request addresses</span>
          <div>{addresses.map((address, lane) => <i className={active >= 0 ? "is-active" : ""} key={lane}><b>L{lane}</b><small>{address * 4}B</small></i>)}</div>
        </div>
        <div className="memory-sectors">
          <span>Aligned 32-byte sectors</span>
          <div>{sectorIds.slice(0, 32).map((sector) => <i className={active >= 1 ? "is-active" : ""} key={sector}>S{sector}<small>{sector * 32}–{sector * 32 + 31}B</small></i>)}</div>
        </div>
        <div className="memory-path-v2">
          {["Shared / L1", "L2", "HBM", "Return to registers"].map((label, index) => <div className={active >= index + 2 || (active === 4 && index === 3) ? "is-active" : ""} key={label}><span>{index + 1}</span><strong>{label}</strong></div>)}
        </div>
        {pattern === "tiled" && active === 4 ? <div className="tile-reuse-result"><strong>One coalesced HBM fill → shared-memory tile → 28 nearby reuses</strong><p>The block synchronizes once, then reads the staged values without repeating every HBM transaction.</p></div> : null}
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          {mode === "expert" && pattern === "scattered" ? <Slider label="Address stride" value={customStride} min={3} max={31} onChange={(value) => onInputChange?.("stride", value)} /> : <p className="lab-guidance">Change the pattern, then step through addresses, sectors, cache lookup, HBM fetch, and returned data.</p>}
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Warp request</span><strong>32 useful values = 128 bytes</strong></div>
          <div><span>Transactions</span><strong>{sectors} × 32-byte sectors before reuse</strong></div>
          <div><span>Useful-byte efficiency</span><strong>{(efficiency * 100).toFixed(0)}%</strong></div>
          <div><span>HBM service</span><strong>{hbmSectors} sectors{cacheHits ? `; ${cacheHits} later values reused on-chip` : ""}</strong></div>
          {mode === "expert" ? <div><span>Next check</span><strong>Alignment, cache behavior, shared-memory bank conflicts, and synchronization.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

const ROOFLINE_STAGES =
  animationStageLabels["animation.inside-gpu.roofline"];

export function RooflineLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, ROOFLINE_STAGES.length - 1);
  const flops = numeric(inputs, "flops", 128);
  const bytes = numeric(inputs, "bytes", 64);
  const bandwidth = numeric(inputs, "bandwidth", 3);
  const peak = numeric(inputs, "peak", 1000);
  const intensity = flops / bytes;
  const attainable = Math.min(peak, bandwidth * intensity);
  const ridge = peak / bandwidth;
  const memoryBound = intensity < ridge;
  const bins = [0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
  const maxLog = Math.log10(Math.max(peak, 10));
  const pointX = Math.max(
    3,
    Math.min(
      97,
      ((Math.log2(Math.max(intensity, bins[0])) - Math.log2(bins[0])) /
        (Math.log2(bins.at(-1)!) - Math.log2(bins[0]))) *
        100,
    ),
  );
  const pointY = Math.max(
    5,
    Math.min(
      95,
      (Math.log10(Math.max(attainable, 1)) / Math.max(maxLog, 1)) * 100,
    ),
  );

  return (
    <LabFrame
      eyebrow="Expert optimization model"
      title="Use a scaled roofline to choose what to investigate first"
      description="Arithmetic intensity is work per byte. Bandwidth limits the rising region; peak compute limits the flat region."
    >
      <Tabs labels={ROOFLINE_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="roofline-v2">
        <div className="roofline-v2__bars">
          {bins.map((bin) => {
            const roof = Math.min(peak, bandwidth * bin);
            const height = Math.max(5, (Math.log10(Math.max(roof, 1)) / Math.max(maxLog, 1)) * 100);
            const selected = Math.abs(Math.log2(Math.max(intensity, 0.25)) - Math.log2(bin)) < 0.6;
            return <div key={bin}><i className={selected ? "is-selected" : ""} style={{ height: `${height}%` }}><span>{roof.toFixed(0)}</span></i><small>{bin}</small></div>;
          })}
        </div>
        <span className="roofline-v2__y">Attainable TFLOP/s</span>
        <span className="roofline-v2__x">Arithmetic intensity · FLOP/byte</span>
        <div
          className="roofline-v2__point"
          style={{ left: `${pointX}%`, bottom: `${pointY}%` } as CSSProperties}
        >
          <strong>Your kernel: {intensity.toFixed(2)} FLOP/byte → roof {attainable.toFixed(1)} TFLOP/s</strong>
        </div>
      </div>
      <div className="stage-narration">
        <span>Guided step {active + 1}</span>
        <strong>{ROOFLINE_STAGES[active]}</strong>
        <p>{active === 0 ? `${flops} floating-point operations are performed per element.` : active === 1 ? `${bytes} bytes move per element at the measured memory level.` : active === 2 ? `${flops} ÷ ${bytes} = ${intensity.toFixed(2)} FLOP/byte.` : active === 3 ? `The ridge point is ${ridge.toFixed(1)} FLOP/byte; this kernel is ${memoryBound ? "below" : "at or beyond"} it.` : memoryBound ? "First investigate traffic, coalescing, locality, reuse, and fusion." : "First investigate math pipelines, instruction mix, dependencies, and tensor-core eligibility."}</p>
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          {mode === "expert" ? (
            <>
              <Slider label="FLOPs per element" value={flops} min={8} max={2048} step={8} onChange={(value) => onInputChange?.("flops", value)} />
              <Slider label="Bytes moved per element" value={bytes} min={4} max={512} step={4} onChange={(value) => onInputChange?.("bytes", value)} />
              <Slider label="Memory bandwidth" value={bandwidth} min={1} max={8} step={0.5} unit=" TB/s" onChange={(value) => onInputChange?.("bandwidth", value)} />
              <Slider label="Compute ceiling" value={peak} min={100} max={2000} step={50} unit=" TFLOP/s" onChange={(value) => onInputChange?.("peak", value)} />
            </>
          ) : <p className="lab-guidance">Core uses this as a guided diagnosis. Expert mode exposes the numeric workload and hardware assumptions.</p>}
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Arithmetic intensity</span><strong>{intensity.toFixed(2)} FLOP/byte</strong></div>
          <div><span>Attainable roof</span><strong>{attainable.toFixed(1)} TFLOP/s</strong></div>
          <div><span>Diagnosis</span><strong>{memoryBound ? "Memory-bound under these assumptions" : "Compute-bound under these assumptions"}</strong></div>
          <div><span>Verify</span><strong>A roofline classifies the likely limit; a profiler must identify the specific cause.</strong></div>
        </div>
      </div>
    </LabFrame>
  );
}
