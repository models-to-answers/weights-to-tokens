"use client";

import type { CSSProperties } from "react";
import type { DeterministicAnimationProps } from "./types";
import { LabFrame, Slider, Tabs, numeric } from "./ModelFactoryLabs";

export function ThroughputSiliconLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, 2);
  const workloads = ["Serial latency", "Parallel throughput", "Transformer inference"];
  const operations = numeric(inputs, "operations", 8192);
  const parallelism = numeric(inputs, "parallelism", 256);
  const cpuTime = operations * 1.2;
  const gpuTime = 160 + (operations / parallelism) * 5;
  return (
    <LabFrame
      eyebrow="GPU Primer Ch. 1 · Latency vs throughput"
      title="Spend silicon on a fast worker—or on many workers"
      description="A CPU minimizes the latency of a few complex threads. A GPU spends more die area on arithmetic lanes and keeps many related threads in flight."
    >
      <Tabs labels={workloads} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="silicon-compare">
        <div>
          <span>CPU silicon budget</span>
          <div className="silicon-die silicon-die--cpu">
            <i>control</i><i>cache</i><i>core</i><i>core</i><i>core</i><i>core</i>
          </div>
          <strong>{active === 0 ? "Best fit" : "Fewer wide workers"}</strong>
        </div>
        <div>
          <span>GPU silicon budget</span>
          <div className="silicon-die silicon-die--gpu">
            {Array.from({ length: 48 }, (_, index) => <i key={index} />)}
          </div>
          <strong>{active === 0 ? "Launch overhead dominates" : "Best fit"}</strong>
        </div>
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          <Slider label="Independent operations" value={operations} min={128} max={32768} step={128} onChange={(value) => onInputChange?.("operations", value)} />
          <Slider label="Available parallel lanes" value={parallelism} min={32} max={1024} step={32} onChange={(value) => onInputChange?.("parallelism", value)} />
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Illustrative CPU time</span><strong>{cpuTime.toFixed(0)} cycles</strong></div>
          <div><span>Illustrative GPU time</span><strong>{gpuTime.toFixed(0)} cycles</strong></div>
          <div><span>Parallel speedup</span><strong>{(cpuTime / gpuTime).toFixed(1)}×</strong></div>
          {mode === "expert" ? <div><span>Caveat</span><strong>Only independent, regular work can occupy the lanes efficiently.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

const ANATOMY = [
  ["GPU package", "Many SMs, memory controllers, caches, and an interconnect"],
  ["Streaming multiprocessor", "Resident blocks, register file, shared memory, schedulers"],
  ["Warp scheduler partition", "Eligible warps compete for instruction issue"],
  ["Execution pipelines", "FP/INT/SFU/tensor/load-store units perform the work"],
  ["Memory hierarchy", "Registers → shared/L1 → L2 → HBM"],
] as const;

export function GpuCrankRoomLab({
  mode = "beginner",
  step = 0,
  onStepChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, ANATOMY.length - 1);
  return (
    <LabFrame
      eyebrow="GPU Primer Ch. 2 · Anatomy"
      title="Walk from the whole accelerator into one crank room"
      description="The zoom preserves one coordinate system: package, SM, scheduler partition, functional units, and the memory hierarchy around them."
    >
      <Tabs labels={ANATOMY.map(([label]) => label)} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className={`gpu-blueprint gpu-blueprint--${active}`}>
        <div className="gpu-blueprint__package">
          <span>HBM</span>
          <div className="gpu-blueprint__sm-grid">
            {Array.from({ length: 16 }, (_, index) => (
              <i className={index === 5 ? "is-focus" : ""} key={index}>SM {index}</i>
            ))}
          </div>
          <span>L2 + fabric</span>
        </div>
      <div className="gpu-blueprint__zoom">
          <small>selected SM</small>
          <div><i>warp scheduler 0</i><i>warp scheduler 1</i><i>warp scheduler 2</i><i>warp scheduler 3</i></div>
          <div><b>register file</b><b>shared memory / L1</b></div>
          <div>{["FP32", "INT", "Tensor", "LD/ST", "SFU"].map((unit) => <strong key={unit}>{unit}</strong>)}</div>
        </div>
      </div>
      {active === 4 ? (
        <div className="memory-ladder">
          {[
            ["Registers", "per thread", "~1 cycle"],
            ["Shared / L1", "per block / SM", "tens of cycles"],
            ["L2 cache", "whole GPU", "hundreds of cycles"],
            ["HBM", "whole GPU", "hundreds of cycles"],
            ["Host memory", "CPU system", "PCIe / interconnect transfer"],
          ].map(([name, scope, latency], index) => (
            <div key={name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{name}</strong>
              <small>{scope}</small>
              <i>{latency}</i>
            </div>
          ))}
        </div>
      ) : null}
      <div className="lab-readouts">
        <div><span>Zoom level</span><strong>{ANATOMY[active][0]}</strong></div>
        <div><span>What matters</span><strong>{ANATOMY[active][1]}</strong></div>
        {mode === "expert" ? <div><span>Portable concept</span><strong>The hierarchy is stable; counts and pipeline widths vary by architecture.</strong></div> : null}
      </div>
    </LabFrame>
  );
}

const LAUNCH_STAGES = [
  ["Host call", "Framework or CUDA code enqueues work on a stream."],
  ["Driver command", "Arguments and launch dimensions become a device command."],
  ["Grid created", "The launch contains all thread blocks."],
  ["Block admitted", "An SM has enough registers, shared memory, and thread slots."],
  ["Warps formed", "Threads are grouped in hardware units of 32."],
  ["Instructions issue", "Eligible warps feed execution pipelines."],
  ["Memory completes", "Loads and stores satisfy dependencies."],
  ["Kernel retires", "All blocks finish; dependent work can observe completion."],
] as const;

export function GridLaunchExplorer({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const active = Math.min(step, LAUNCH_STAGES.length - 1);
  const elements = numeric(inputs, "elements", 1048576);
  const blockSize = numeric(inputs, "blockSize", 256);
  const sms = numeric(inputs, "sms", 16);
  const blocks = Math.ceil(elements / blockSize);
  const waves = Math.ceil(blocks / sms);
  return (
    <LabFrame
      eyebrow="GPU Primer Ch. 3 + 7 · Kernel and launch lifecycle"
      title="Launch one kernel from host call to retired grid"
      description="Change the launch geometry, inspect every lifecycle stage, and keep grid, block, warp, and thread scopes visually distinct."
    >
      <Tabs labels={LAUNCH_STAGES.map(([label]) => label)} active={active} onChange={(index) => onStepChange?.(index)} />
      <div className="launch-scope">
        <div className="launch-scope__host"><span>CPU / stream</span><strong>{active < 2 ? "enqueue command" : "continues asynchronously"}</strong></div>
        <div className="launch-scope__grid">
          <span>grid · {blocks.toLocaleString()} blocks</span>
          <div>{Array.from({ length: 24 }, (_, index) => <i className={index <= active * 3 ? "is-active" : ""} key={index} />)}</div>
        </div>
        <div className="launch-scope__block">
          <span>selected block · {blockSize} threads</span>
          <div>{Array.from({ length: Math.min(32, blockSize / 8) }, (_, index) => <i className={index < Math.min(32, active * 5) ? "is-active" : ""} key={index} />)}</div>
        </div>
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          <Slider label="Elements" value={elements} min={65536} max={4194304} step={65536} onChange={(value) => onInputChange?.("elements", value)} />
          <Slider label="Threads per block" value={blockSize} min={64} max={1024} step={32} onChange={(value) => onInputChange?.("blockSize", value)} />
          <Slider label="Available SMs" value={sms} min={4} max={128} step={4} onChange={(value) => onInputChange?.("sms", value)} />
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Current stage</span><strong>{LAUNCH_STAGES[active][1]}</strong></div>
          <div><span>Grid shape</span><strong>{blocks.toLocaleString()} blocks × {blockSize} threads</strong></div>
          <div><span>Minimum block waves</span><strong>{waves.toLocaleString()}</strong></div>
          {mode === "expert" ? <div><span>Admission constraint</span><strong>Resident blocks are bounded by registers, shared memory, warps, threads, and slots.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

export function DivergenceSimulator({
  mode = "beginner",
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const split = numeric(inputs, "split", 16);
  const pathA = numeric(inputs, "pathA", 5);
  const pathB = numeric(inputs, "pathB", 8);
  const divergent = split > 0 && split < 32;
  const serialCycles = divergent ? pathA + pathB : split === 0 ? pathB : pathA;
  const useful = ((split * pathA) + ((32 - split) * pathB)) / (32 * Math.max(serialCycles, 1));
  return (
    <LabFrame
      eyebrow="GPU Primer Ch. 4 · SIMT and divergence"
      title="Watch one warp serialize two branch paths"
      description="Threads keep their own registers and data, but a warp issues one instruction stream. Different branch decisions create execution masks."
    >
      <div className="warp-lanes">
        {Array.from({ length: 32 }, (_, index) => (
          <i className={index < split ? "path-a" : "path-b"} key={index}>
            <span>{index}</span>
            <strong>{index < split ? "A" : "B"}</strong>
          </i>
        ))}
      </div>
      <div className="branch-timeline">
        <span>issued cycles</span>
        {Array.from({ length: serialCycles }, (_, index) => (
          <i className={index < pathA && split > 0 ? "path-a" : "path-b"} key={index} />
        ))}
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          <Slider label="Threads taking path A" value={split} min={0} max={32} onChange={(value) => onInputChange?.("split", value)} />
          <Slider label="Path A instructions" value={pathA} min={1} max={16} onChange={(value) => onInputChange?.("pathA", value)} />
          <Slider label="Path B instructions" value={pathB} min={1} max={16} onChange={(value) => onInputChange?.("pathB", value)} />
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Warp behavior</span><strong>{divergent ? "Paths serialize under different masks" : "All active lanes follow one path"}</strong></div>
          <div><span>Issued cycles</span><strong>{serialCycles}</strong></div>
          <div><span>Lane utilization</span><strong>{(useful * 100).toFixed(0)}%</strong></div>
          {mode === "expert" ? <div><span>Reconvergence</span><strong>The warp reconverges after both paths reach their post-dominator.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

const WARP_STATE = ["ready", "memory", "dependency", "ready", "ready", "barrier", "ready", "memory"] as const;

export function SchedulerTraceLab({
  mode = "beginner",
  step = 0,
  onStepChange,
}: DeterministicAnimationProps) {
  const active = step % WARP_STATE.length;
  return (
    <LabFrame
      eyebrow="GPU Primer Ch. 5 · Warp scheduler"
      title="Issue from an eligible warp while another waits"
      description="This is latency hiding in motion: the scheduler does not shorten a memory access; it finds independent work that can issue now."
    >
      <div className="scheduler-board">
        <div className="scheduler-board__warps">
          {WARP_STATE.map((state, index) => (
            <button
              type="button"
              className={index === active ? "is-selected" : state === "ready" ? "is-ready" : "is-stalled"}
              onClick={() => onStepChange?.(index)}
              key={index}
            >
              <span>warp {index}</span><strong>{state}</strong>
            </button>
          ))}
        </div>
        <div className="scheduler-board__scoreboard">
          <span>scoreboard + issue logic</span>
          <strong>{WARP_STATE[active] === "ready" ? `issue warp ${active}` : `warp ${active} is not eligible`}</strong>
          <div>{["LD/ST", "FP32", "INT", "Tensor"].map((unit, index) => <i className={index === active % 4 && WARP_STATE[active] === "ready" ? "is-active" : ""} key={unit}>{unit}</i>)}</div>
        </div>
      </div>
      <div className="partition-trace" aria-label="Four scheduler partitions over eight issue cycles">
        {Array.from({ length: 4 }, (_, partition) => (
          <div key={partition}>
            <span>partition {partition}</span>
            {Array.from({ length: 8 }, (_, cycle) => {
              const issued = (cycle + partition * 2) % 8;
              const state = WARP_STATE[issued];
              return (
                <i
                  className={
                    cycle === active
                      ? state === "ready"
                        ? "is-issued"
                        : "is-stall"
                      : ""
                  }
                  key={cycle}
                >
                  {state === "ready" ? `W${issued}` : "—"}
                </i>
              );
            })}
          </div>
        ))}
      </div>
      <div className="lab-readouts">
        <div><span>Selected warp</span><strong>{active}</strong></div>
        <div><span>State</span><strong>{WARP_STATE[active]}</strong></div>
        <div><span>Eligible alternatives</span><strong>{WARP_STATE.filter((state) => state === "ready").length}</strong></div>
        {mode === "expert" ? <div><span>Important distinction</span><strong>Occupancy supplies candidates; dependency state controls eligibility.</strong></div> : null}
      </div>
    </LabFrame>
  );
}

export function CoalescingLab({
  mode = "beginner",
  step = 0,
  onStepChange,
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const pattern = Math.min(step, 3);
  const stride = pattern === 0 || pattern === 3 ? 1 : pattern === 1 ? 2 : numeric(inputs, "stride", 17);
  const addresses = Array.from({ length: 32 }, (_, lane) => lane * stride);
  const sectors = new Set(addresses.map((address) => Math.floor(address / 8))).size;
  const efficiency = Math.min(1, 4 / sectors);
  return (
    <LabFrame
      eyebrow="GPU Primer Ch. 6 · Memory coalescing"
      title="Turn 32 lane addresses into memory transactions"
      description="The same number of loads can move very different amounts of useful data. Neighboring aligned addresses let the memory system combine requests."
    >
      <Tabs labels={["Contiguous", "Stride 2", "Scattered", "Tiled reuse"]} active={pattern} onChange={(index) => onStepChange?.(index)} />
      <div className="address-map">
        {addresses.map((address, lane) => (
          <div key={lane}>
            <span>T{lane}</span>
            <i style={{ "--address": address % 32 } as CSSProperties} />
            <strong>{address * 4}B</strong>
          </div>
        ))}
      </div>
      <div className="transaction-strip">
        {Array.from({ length: Math.min(32, sectors) }, (_, index) => <i key={index}>T{index + 1}</i>)}
      </div>
      {pattern === 3 ? (
        <div className="shared-tile">
          <div>
            {Array.from({ length: 64 }, (_, index) => (
              <i className={index % 9 === 0 ? "is-reused" : ""} key={index} />
            ))}
          </div>
          <p>
            A coalesced global load fills a shared-memory tile once. Threads
            then reuse nearby values without returning to HBM for every
            multiply.
          </p>
        </div>
      ) : null}
      <div className="lab-grid">
        <div className="slider-stack">
          {pattern === 2 ? <Slider label="Address stride" value={stride} min={3} max={31} onChange={(value) => onInputChange?.("stride", value)} /> : null}
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>32-thread request</span><strong>{sectors} × 32-byte sectors</strong></div>
          <div><span>Useful-byte efficiency</span><strong>{(efficiency * 100).toFixed(0)}%</strong></div>
          {pattern === 3 ? <div><span>Reuse strategy</span><strong>Load once from HBM, synchronize the block, reuse from the tile.</strong></div> : null}
          {mode === "expert" ? <div><span>Next optimization</span><strong>Stage reused values in shared memory; then inspect bank conflicts.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}

export function RooflineLab({
  mode = "beginner",
  inputs,
  onInputChange,
}: DeterministicAnimationProps) {
  const flops = numeric(inputs, "flops", 128);
  const bytes = numeric(inputs, "bytes", 64);
  const bandwidth = numeric(inputs, "bandwidth", 3);
  const peak = numeric(inputs, "peak", 1000);
  const intensity = flops / bytes;
  const attainable = Math.min(peak, bandwidth * intensity);
  const memoryBound = bandwidth * intensity < peak;
  const x = Math.min(96, 10 + Math.log2(Math.max(intensity, 0.125)) * 13);
  const y = Math.min(92, 8 + Math.log10(Math.max(attainable, 1)) * 25);
  return (
    <LabFrame
      eyebrow="GPU Primer Ch. 8 · Optimization and roofline"
      title="Diagnose whether to move fewer bytes or do math faster"
      description="Arithmetic intensity connects memory traffic to compute. The roofline turns an optimization checklist into a bottleneck decision."
    >
      <div className="roofline">
        <i className="roofline__slope" />
        <i className="roofline__ceiling" />
        <button type="button" style={{ left: `${x}%`, bottom: `${y}%` }}>
          <span>your kernel</span>
        </button>
        <span className="roofline__x">arithmetic intensity →</span>
        <span className="roofline__y">performance →</span>
      </div>
      <div className="lab-grid">
        <div className="slider-stack">
          <Slider label="FLOPs per element" value={flops} min={8} max={2048} step={8} onChange={(value) => onInputChange?.("flops", value)} />
          <Slider label="Bytes moved per element" value={bytes} min={4} max={512} step={4} onChange={(value) => onInputChange?.("bytes", value)} />
          <Slider label="Memory bandwidth" value={bandwidth} min={1} max={8} step={0.5} unit=" TB/s" onChange={(value) => onInputChange?.("bandwidth", value)} />
          <Slider label="Compute ceiling" value={peak} min={100} max={2000} step={50} unit=" TFLOP/s" onChange={(value) => onInputChange?.("peak", value)} />
        </div>
        <div className="lab-readouts lab-readouts--stack">
          <div><span>Arithmetic intensity</span><strong>{intensity.toFixed(2)} FLOP/byte</strong></div>
          <div><span>Attainable roof</span><strong>{attainable.toFixed(1)} TFLOP/s</strong></div>
          <div><span>Diagnosis</span><strong>{memoryBound ? "Memory-bound" : "Compute-bound"}</strong></div>
          <div><span>First move</span><strong>{memoryBound ? "Coalesce, reuse, fuse, and reduce traffic." : "Improve math throughput and instruction mix."}</strong></div>
          {mode === "expert" ? <div><span>Verify</span><strong>Profile achieved bandwidth, instruction throughput, stalls, and occupancy before tuning.</strong></div> : null}
        </div>
      </div>
    </LabFrame>
  );
}
