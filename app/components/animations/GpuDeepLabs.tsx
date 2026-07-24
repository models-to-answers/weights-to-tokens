"use client";

import type { ReactNode } from "react";
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

function AnatomyScene({
  stage,
  expert,
}: {
  stage: number;
  expert: boolean;
}): ReactNode {
  if (stage === 0) {
    return (
      <div className="anatomy-package">
        <div className="anatomy-package__substrate">
          <div className="anatomy-package__die">
            <span>GPU compute die</span>
            <small>SMs · caches · memory controllers</small>
          </div>
          <div className="anatomy-package__hbm">
            <strong>HBM stacks</strong>
            <div aria-label="Multiple illustrative HBM stacks">
              <i>stack</i>
              <i>stack</i>
              <i>stack</i>
              <b aria-hidden="true">…</b>
            </div>
            <small>Count and layout vary by accelerator.</small>
          </div>
        </div>
        <strong>Accelerator package · illustrative, not a specific product</strong>
        <small>
          The GPU die connects to multiple high-bandwidth-memory stacks; the
          three stack symbols and ellipsis mean “several,” not exactly three.
        </small>
        {expert ? (
          <small className="anatomy-package__expert">
            Memory controllers distribute addresses across HBM channels and
            partitions so the stacks contribute to one device-memory address
            space.
          </small>
        ) : null}
      </div>
    );
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
        <AnatomyScene stage={active} expert={mode === "expert"} />
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
  const pathBThreads = 32 - split;
  const divergent = split > 0 && split < 32;
  const serialCycles = divergent ? pathA + pathB : split === 0 ? pathB : pathA;
  const useful = ((split * pathA) + (pathBThreads * pathB)) / (32 * Math.max(serialCycles, 1));
  const narration = [
    "All 32 lanes issue the same instruction together.",
    "The branch condition sends some threads to A and the rest to B.",
    "The warp executes path A while path-B lanes are masked off.",
    "The warp executes path B while path-A lanes are masked off.",
    "All lanes meet again and continue on one instruction stream.",
  ] as const;
  const behavior = [
    "No branch decision yet; all 32 lanes move together.",
    `${split} lanes choose A; ${pathBThreads} choose B. No path has issued yet.`,
    split > 0
      ? `Path A is issuing; ${pathBThreads} path-B lanes are masked.`
      : "Path A is skipped because no lanes chose it.",
    pathBThreads > 0
      ? `Path B is issuing; ${split} path-A lanes are masked.`
      : "Path B is skipped because no lanes chose it.",
    divergent
      ? "Both paths issued serially; all lanes are together again."
      : "All lanes took one path and are together again.",
  ];
  const pathACycles = split > 0 ? pathA : 0;
  const pathBCycles = pathBThreads > 0 ? pathB : 0;
  const cycles = [
    "0 branch-path cycles",
    "0 branch-path cycles",
    pathACycles > 0 ? `${pathACycles} cycles so far` : "0 cycles · path A skipped",
    `${pathACycles + pathBCycles} cycles so far`,
    `${serialCycles} total branch-path cycles`,
  ];
  const utilization = [
    "100% now · uniform",
    "Not measured · decisions only",
    split > 0 ? `${Math.round((split / 32) * 100)}% during path A` : "Path A skipped",
    pathBThreads > 0 ? `${Math.round((pathBThreads / 32) * 100)}% during path B` : "Path B skipped",
    `${Math.round(useful * 100)}% overall`,
  ];

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
          const pathClass = active === 0 || active === 4 ? "is-uniform" : path === "a" ? "path-a" : "path-b";
          return <i className={`${pathClass} ${masked ? "is-masked" : ""}`} key={index}><span>{index}</span><strong>{active === 0 || active === 4 ? "•" : path.toUpperCase()}</strong></i>;
        })}
      </div>
      <div className="branch-execution">
        <span>Scenario setup</span>
        <div className={active === 2 ? "is-active" : active > 2 ? "is-past" : ""}>Path A · {split} lanes · {pathA} instructions</div>
        <div className={active === 3 ? "is-active" : active > 3 ? "is-past" : ""}>Path B · {pathBThreads} lanes · {pathB} instructions</div>
        <strong>{behavior[active]}</strong>
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          {mode === "expert" ? (
            <>
              <p className="lab-guidance"><strong>Scenario setup</strong><br />Change the branch split or path lengths, then replay the same five execution stages.</p>
              <Slider label="Threads taking path A" value={split} min={0} max={32} onChange={(value) => onInputChange?.("split", value)} />
              <Slider label="Path A instructions" value={pathA} min={1} max={16} onChange={(value) => onInputChange?.("pathA", value)} />
              <Slider label="Path B instructions" value={pathB} min={1} max={16} onChange={(value) => onInputChange?.("pathB", value)} />
            </>
          ) : <p className="lab-guidance">{narration[active]} The scenario stays fixed while the stages reveal what executes.</p>}
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Issued cycles</span><strong>{cycles[active]}</strong></div>
          <div><span>Active-lane utilization</span><strong>{utilization[active]}</strong></div>
          {mode === "expert" ? <div><span>Reconvergence</span><strong>{active === 4 ? "Complete at the branch's post-dominator." : "Not reached yet."}</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

const SCHEDULER_STAGES =
  animationStageLabels["animation.inside-gpu.warp-scheduler"];
const SCHEDULER_TIMELINE = [
  { issued: "—", w0: "ready · LD", w1: "ready · FP32", w2: "dependency", pipeline: "none", memory: "No request in flight", compute: "No arithmetic active", overlap: "Two warps are eligible; no instruction has issued.", eligible: "Warp 0 and Warp 1", note: "The scoreboard sees two eligible warps." },
  { issued: "W0 · LD", w0: "issued load", w1: "ready · FP32", w2: "dependency", pipeline: "LD/ST", memory: "W0 load request sent", compute: "No arithmetic active", overlap: "The load leaves the scheduler and begins its memory journey.", eligible: "Warp 1", note: "Warp 0 issues a memory load." },
  { issued: "—", w0: "memory wait", w1: "ready · FP32", w2: "dependency", pipeline: "none", memory: "W0 memory request remains in flight.", compute: "FP32 pipeline available", overlap: "Memory request in flight; no arithmetic issued this stage.", eligible: "Warp 1", note: "Warp 0 is resident but temporarily ineligible." },
  { issued: "W1 · FP32", w0: "memory wait", w1: "issued FP32", w2: "dependency", pipeline: "FP32", memory: "W0 memory request remains in flight.", compute: "W1 FP32 arithmetic active", overlap: "W0 memory request + W1 FP32 arithmetic overlap", eligible: "Warp 1", note: "The scheduler hides Warp 0's wait by issuing independent Warp 1." },
  { issued: "W0 · data", w0: "ready · ADD", w1: "ready · FP32", w2: "dependency", pipeline: "none", memory: "W0 data returns", compute: "W1 FP32 instruction complete", overlap: "The returning data makes Warp 0 eligible again.", eligible: "Warp 0 and Warp 1", note: "Warp 0's operands return and its dependency clears." },
  { issued: "W0 · ADD", w0: "issued ADD", w1: "ready · FP32", w2: "dependency", pipeline: "FP32", memory: "W0 load complete", compute: "W0 ADD active", overlap: "Warp 0 resumes on the arithmetic pipeline.", eligible: "Warp 1", note: "Warp 0 becomes eligible and resumes." },
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
      title="Watch one scheduler partition hide a memory wait"
      description="This trace follows one simplified scheduler partition. A memory request can remain in flight while an independent warp uses an arithmetic pipeline."
    >
      <Tabs labels={SCHEDULER_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="scheduler-scope">
        <strong>One simplified scheduler partition</strong>
        <span>One issue decision is highlighted per stage. Work already sent to memory can continue concurrently.</span>
      </div>
      <div className="scheduler-story">
        <div className="scheduler-story__warps">
          {warps.map(([name, detail], index) => <div className={detail.includes("issued") ? "is-issued" : detail.includes("wait") || detail.includes("dependency") ? "is-stalled" : "is-ready"} key={name}><span>{name}</span><strong>{detail}</strong><small>{index === 0 ? "load then add" : index === 1 ? "independent arithmetic" : "waiting on prior result"}</small></div>)}
        </div>
        <div className="scheduler-story__decision">
          <span>Scoreboard + scheduler</span>
          <strong>{active === 4 ? "Completion: W0 data returns" : state.issued === "—" ? "Inspect eligibility" : `Issue: ${state.issued}`}</strong>
          <p>{state.note}</p>
        </div>
        <div className="scheduler-story__pipelines">
          <span>New issue this stage</span>
          {["LD/ST", "FP32", "Tensor"].map((pipeline) => <i className={state.pipeline === pipeline ? "is-active" : ""} key={pipeline}>{pipeline}</i>)}
        </div>
      </div>
      <div className="scheduler-concurrency" aria-label="Concurrent work in flight">
        <div className={active >= 1 && active <= 4 ? "is-active" : ""}><span>Memory system</span><strong>{state.memory}</strong></div>
        <div className={active === 3 || active === 5 ? "is-active" : ""}><span>Arithmetic pipeline</span><strong>{state.compute}</strong></div>
        <p className={active === 3 ? "is-overlap" : ""}>{state.overlap}</p>
      </div>
      <div className="scheduler-timeline" aria-label="Scheduling events so far">
        {SCHEDULER_TIMELINE.map((event, index) => <i className={index < active ? "is-past" : index === active ? "is-active" : ""} key={index}><span>C{index}</span><strong>{event.issued}</strong></i>)}
      </div>
      <div className="lab-readouts">
        <div><span>Current lesson</span><strong>{state.note}</strong></div>
        <div><span>Eligible after this event</span><strong>{state.eligible}</strong></div>
        <div><span>Real GPU context</span><strong>Real SMs may have multiple scheduler partitions, so different eligible warps can issue to available pipelines in the same cycle.</strong></div>
        {mode === "expert" ? <div><span>Important distinction</span><strong>Residency supplies candidates; scoreboard dependencies and pipeline availability determine eligibility.</strong></div> : null}
      </div>
    </LabFrame>
  );
}

const MEMORY_STAGES =
  animationStageLabels["animation.inside-gpu.coalesced-memory"];
const EXPERT_MEMORY_PATTERNS = [
  "contiguous",
  "stride2",
  "scattered",
  "tiled",
] as const;

export function CoalescingLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, MEMORY_STAGES.length - 1);
  const requestedPattern =
    typeof inputs?.pattern === "string" ? inputs.pattern : "contiguous";
  const expertPattern = EXPERT_MEMORY_PATTERNS.includes(
    requestedPattern as (typeof EXPERT_MEMORY_PATTERNS)[number],
  )
    ? (requestedPattern as (typeof EXPERT_MEMORY_PATTERNS)[number])
    : "contiguous";
  const customStride = Math.max(3, numeric(inputs, "stride", 17));
  const expertStride =
    expertPattern === "contiguous" || expertPattern === "tiled"
      ? 1
      : expertPattern === "stride2"
        ? 2
        : customStride;
  const expertAddresses = Array.from(
    { length: 32 },
    (_, lane) => lane * expertStride,
  );
  const expertTransactions = new Set(
    expertAddresses.map((address) => Math.floor(address / 8)),
  ).size;
  const expertEfficiency = Math.min(
    100,
    Math.round((128 / (expertTransactions * 32)) * 100),
  );
  const stageExplanation = [
    "Thousands of GPU threads can calculate quickly, but only after their data arrives. Distance and organization determine how long they wait.",
    "The same eight useful values can arrive as one organized delivery or as eight scattered deliveries.",
    "Caches may keep recently used data automatically. A kernel can deliberately place a reusable tile in shared memory, then copy each needed value into a thread's registers.",
    "Load the tile from HBM once, keep it on the shared-memory workbench, and use it for four calculations.",
    "Keep the GPU supplied: fetch neighboring values together, retain reusable data nearby, and avoid writing unnecessary intermediates back to HBM.",
  ] as const;

  return (
    <LabFrame
      eyebrow="Keeping the GPU supplied"
      title="Move less data, move it together, and reuse it nearby"
      description="Think of HBM as a storeroom, shared memory as a workbench, and registers as ingredients already in each worker's hands."
    >
      <Tabs labels={MEMORY_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="stage-narration">
        <span>Kitchen story · step {active + 1}</span>
        <strong>{MEMORY_STAGES[active]}</strong>
        <p>{stageExplanation[active]}</p>
      </div>

      <div className="memory-kitchen">
        <div className={active === 0 ? "is-active" : ""}>
          <span>Farther away</span>
          <strong>HBM storeroom</strong>
          <p>Large, shared by the GPU, and expensive to revisit repeatedly.</p>
        </div>
        <b aria-hidden="true">→</b>
        <div className={active >= 2 ? "is-active" : ""}>
          <span>Near one SM</span>
          <strong>Shared-memory workbench</strong>
          <p>A kernel explicitly stages a reusable tile here for one block.</p>
        </div>
        <b aria-hidden="true">→</b>
        <div className={active >= 2 ? "is-active" : ""}>
          <span>In each thread</span>
          <strong>Registers</strong>
          <p>The values a thread is using right now.</p>
        </div>
      </div>

      {active === 1 ? (
        <div className="delivery-comparison">
          <section className="delivery-card delivery-card--organized">
            <span>Organized delivery</span>
            <strong>Neighboring threads ask for neighboring values</strong>
            <div aria-label="Eight neighboring values">
              {Array.from({ length: 8 }, (_, index) => <i key={index}>{index}</i>)}
            </div>
            <p><b>1 delivery</b> for eight useful values</p>
          </section>
          <section className="delivery-card delivery-card--scattered">
            <span>Scattered delivery</span>
            <strong>Threads ask for values on different shelves</strong>
            <div aria-label="Eight scattered values">
              {[0, 19, 41, 74, 106, 139, 173, 220].map((value) => <i key={value}>{value}</i>)}
            </div>
            <p><b>8 deliveries</b> for the same eight useful values</p>
          </section>
        </div>
      ) : null}

      {active === 2 ? (
        <div className="memory-management-split">
          <section>
            <span>Mostly automatic</span>
            <strong>L2 and L1 cache path</strong>
            <p>Hardware can serve a request from recently retained data. The kernel does not choose an exact cache slot.</p>
          </section>
          <section>
            <span>Explicit kernel action</span>
            <strong>Stage a tile in shared memory</strong>
            <p>Threads cooperate to load useful values once, synchronize, and then reuse the workbench.</p>
          </section>
        </div>
      ) : null}

      {active === 3 ? (
        <div className="reuse-story">
          <div className="reuse-story__flow">
            <span>HBM</span><b>one organized load</b><span>Shared tile</span>
            <div>{[1, 2, 3, 4].map((item) => <i key={item}>Calculation {item}</i>)}</div>
          </div>
          <div className="reuse-story__metrics">
            <strong>1 HBM delivery</strong>
            <strong>4 calculations</strong>
            <strong>3 repeated deliveries avoided</strong>
          </div>
        </div>
      ) : null}

      {active === 4 ? (
        <div className="memory-action-summary">
          <section><span>1</span><strong>Coalesce</strong><p>Map neighboring threads to neighboring data.</p></section>
          <section><span>2</span><strong>Tile and reuse</strong><p>Load once into shared memory and use it repeatedly.</p></section>
          <section><span>3</span><strong>Keep intermediates close</strong><p>Use registers and kernel fusion when practical.</p></section>
          <div className="tile-reuse-result"><strong>One coalesced HBM fill → shared-memory tile → repeated nearby use</strong><p>The exact savings depend on the kernel and data layout.</p></div>
        </div>
      ) : null}

      {mode === "expert" ? (
        <aside className="memory-expert-overlay">
          <span>Full warp overlay</span>
          <strong>What the hardware sees</strong>
          <p>A full warp has 32 lanes. With four-byte values, 32 neighboring aligned requests occupy four 32-byte sectors; widely scattered addresses can require many more sectors.</p>
          <div className="pattern-picker" role="group" aria-label="Full warp access pattern">
            {[
              ["contiguous", "Contiguous"],
              ["stride2", "Stride 2"],
              ["scattered", "Scattered"],
              ["tiled", "Tiled reuse"],
            ].map(([id, label]) => (
              <button
                type="button"
                className={expertPattern === id ? "is-active" : ""}
                aria-pressed={expertPattern === id}
                onClick={() => onInputChange?.("pattern", id)}
                key={id}
              >
                {label}
              </button>
            ))}
          </div>
          {expertPattern === "scattered" ? (
            <Slider
              label="Address stride"
              value={customStride}
              min={3}
              max={31}
              onChange={(value) => onInputChange?.("stride", value)}
            />
          ) : null}
          <div className="memory-expert-metrics">
            <strong>{expertTransactions} transactions</strong>
            <strong>{expertEfficiency}% useful-byte efficiency</strong>
            <strong>
              {expertPattern === "tiled"
                ? "4 sectors fetched once, then reused"
                : `Lane addresses advance by ${expertStride} values`}
            </strong>
          </div>
          <dl>
            <div><dt>Coalescing changes</dt><dd>Transactions used for the first fetch</dd></div>
            <div><dt>Tiling changes</dt><dd>How often the fetched values return to HBM</dd></div>
            <div><dt>Also verify</dt><dd>Alignment, bank conflicts, synchronization, and occupancy</dd></div>
          </dl>
        </aside>
      ) : null}
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
  const work = Math.max(64, numeric(inputs, "work", 512));
  const naiveBytes = Math.max(32, numeric(inputs, "naive-bytes", 256));
  const reuseFactor = Math.max(1, numeric(inputs, "reuse-factor", 4));
  const bandwidth = Math.max(1, numeric(inputs, "bandwidth", 3));
  const peak = Math.max(25, numeric(inputs, "peak", 100));
  const reuseBytes = Math.max(4, Math.round(naiveBytes / reuseFactor));
  const naiveIntensity = work / naiveBytes;
  const reuseIntensity = work / reuseBytes;
  const naiveAttainable = Math.min(peak, bandwidth * naiveIntensity);
  const reuseAttainable = Math.min(peak, bandwidth * reuseIntensity);
  const ridge = peak / bandwidth;
  const reuseIsMemoryBound = reuseIntensity < ridge;
  const pointPosition = (intensity: number) =>
    `${Math.min(90, 10 + Math.max(0, Math.log2(intensity)) * 11)}%`;
  const pointHeight = (attainable: number) =>
    `${Math.min(80, 20 + (attainable / peak) * 60)}%`;
  const stageExplanation = [
    `${work} FLOPs of useful work must happen either way. Only the data plan changes.`,
    `The naive version performs ${work} FLOPs after moving ${naiveBytes} bytes.`,
    `The reuse version performs the same ${work} FLOPs but moves only ${reuseBytes} bytes from the measured memory level.`,
    "Fewer bytes move the reuse design to the right: more useful calculation is performed per delivered byte.",
    reuseIsMemoryBound
      ? "The reuse design remains on the bandwidth side. Investigate more reuse, coalescing, fusion, or unnecessary traffic."
      : "The reuse design reaches the compute side. Next inspect math pipelines, dependencies, and tensor-core eligibility.",
  ] as const;

  return (
    <LabFrame
      eyebrow="Expert diagnostic"
      title="Same calculation, two data plans"
      description="Arithmetic intensity is not a knob by itself. It rises when an implementation performs the same useful work while moving fewer bytes."
    >
      <Tabs labels={ROOFLINE_STAGES} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="stage-narration">
        <span>Roofline bridge · step {active + 1}</span>
        <strong>{ROOFLINE_STAGES[active]}</strong>
        <p>{stageExplanation[active]}</p>
      </div>

      <div className={`roofline-work-compare roofline-work-compare--stage-${active}`}>
        <section className="roofline-work-card">
          <span>Useful calculation</span>
          <strong>{work} FLOPs of useful work</strong>
          <p>Identical in both implementations</p>
        </section>
        <section className={active >= 1 ? "roofline-work-card is-active" : "roofline-work-card"}>
          <span>Naive data plan</span>
          <strong>{work} FLOPs ÷ {naiveBytes} bytes = {naiveIntensity.toFixed(2)} FLOP/byte</strong>
          <p>Fetch or materialize data repeatedly</p>
        </section>
        <section className={active >= 2 ? "roofline-work-card is-improved" : "roofline-work-card"}>
          <span>Reuse data plan</span>
          <strong>{work} FLOPs ÷ {reuseBytes} bytes = {reuseIntensity.toFixed(2)} FLOP/byte</strong>
          <p>Work did not change; memory traffic fell {reuseFactor}×.</p>
        </section>
      </div>

      {active >= 3 ? (
        <div className="roofline-simple">
          <div className="roofline-simple__roof"><i /><b /></div>
          <span className="roofline-simple__memory">Memory-limited side</span>
          <span className="roofline-simple__compute">Compute-limited side</span>
          <div className="roofline-simple__point is-naive" style={{ left: pointPosition(naiveIntensity), bottom: pointHeight(naiveAttainable) }}>
            <i /><strong>Naive · {naiveIntensity.toFixed(2)} FLOP/byte</strong>
          </div>
          <div className="roofline-simple__point is-reuse" style={{ left: pointPosition(reuseIntensity), bottom: pointHeight(reuseAttainable) }}>
            <i /><strong>Reuse · {reuseIntensity.toFixed(2)} FLOP/byte</strong>
          </div>
          <p>Move right by doing more useful work per byte—not by changing a setting called “intensity.”</p>
        </div>
      ) : null}

      <div className="lab-grid">
        <div className="slider-stack">
          {mode === "expert" ? (
            <>
              <Slider label="Useful work" value={work} min={64} max={2048} step={64} unit=" FLOPs" onChange={(value) => onInputChange?.("work", value)} />
              <Slider label="Naive bytes moved" value={naiveBytes} min={32} max={1024} step={32} unit=" bytes" onChange={(value) => onInputChange?.("naive-bytes", value)} />
              <Slider label="Reuse factor" value={reuseFactor} min={1} max={16} unit="×" onChange={(value) => onInputChange?.("reuse-factor", value)} />
              <Slider label="Memory bandwidth" value={bandwidth} min={1} max={8} step={0.5} unit=" TB/s" onChange={(value) => onInputChange?.("bandwidth", value)} />
              <Slider label="Compute ceiling" value={peak} min={25} max={400} step={25} unit=" TFLOP/s" onChange={(value) => onInputChange?.("peak", value)} />
            </>
          ) : <p className="lab-guidance">This diagnostic is intentionally placed in Expert depth. Start with the two implementations before changing their assumptions.</p>}
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Naive attainable roof</span><strong>{naiveAttainable.toFixed(1)} TFLOP/s</strong></div>
          <div><span>Reuse attainable roof</span><strong>{reuseAttainable.toFixed(1)} TFLOP/s</strong></div>
          <div><span>Ridge point</span><strong>{ridge.toFixed(1)} FLOP/byte</strong></div>
          <div><span>First investigation</span><strong>{reuseIsMemoryBound ? "Traffic, coalescing, locality, reuse, and fusion" : "Math pipelines, dependencies, and tensor-core eligibility"}</strong></div>
          <div><span>Verify</span><strong>A roofline classifies the likely limit; a profiler identifies the specific cause.</strong></div>
        </div>
      </div>
    </LabFrame>
  );
}
