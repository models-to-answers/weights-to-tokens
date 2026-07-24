// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { KernelLaunchAnimation } from "@/app/components/animations";
import {
  CoalescingLab,
  DivergenceSimulator,
  GpuCrankRoomLab,
  GridLaunchExplorer,
  InferenceRuntimeLab,
  LoRALab,
  ParameterBuilderLab,
  PreferenceTrainerLab,
  RequestArrivalLab,
  SchedulerTraceLab,
  TokenPredictorLab,
} from "@/app/components/animations";
import { FinalReplayExperience } from "@/app/components/FinalReplayExperience";

afterEach(() => cleanup());

describe("deterministic animation controls", () => {
  it("steps forward and reveals Expert detail without replacing the core stage", () => {
    render(<KernelLaunchAnimation mode="expert" />);
    expect(screen.getByText(/Step 1 of/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText(/Step 2 of/i)).toBeInTheDocument();
    expect(screen.getByText("Expert view")).toBeInTheDocument();
  });

  it("preserves the replay stage when switching between system and GPU views", () => {
    render(
      <FinalReplayExperience
        mode="beginner"
        step={4}
        onStepChange={() => undefined}
        onNavigateChapter={() => undefined}
      />,
    );
    expect(screen.getByText("Step 5 of 12")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "GPU view" }));
    expect(screen.getByText("Step 5 of 12")).toBeInTheDocument();
    expect(screen.getByText("One prompt: GPU view")).toBeInTheDocument();
  });

  it("uses discrete advance controls when reduced motion is requested", () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
    })) as typeof window.matchMedia;

    render(<KernelLaunchAnimation mode="beginner" />);
    fireEvent.click(screen.getByRole("button", { name: "Advance animation" }));
    expect(screen.getByText(/Step 2 of/i)).toBeInTheDocument();
    window.matchMedia = originalMatchMedia;
  });

  it("exposes the preserved Model Factory controls and calculations", () => {
    const changes: Array<[string, string | number | boolean | null]> = [];
    const steps: number[] = [];
    const { rerender } = render(
      <TokenPredictorLab
        inputs={{ temperature: 0.8 }}
        onStepChange={(step) => steps.push(step)}
        onInputChange={(key, value) => changes.push([key, value])}
      />,
    );
    expect(screen.getByText("69.2%")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider", { name: /Temperature/ }), {
      target: { value: "1.2" },
    });
    expect(changes).toContainEqual(["temperature", 1.2]);
    fireEvent.keyDown(screen.getByRole("tab", { name: "01 Example 1" }), {
      key: "ArrowRight",
    });
    expect(steps).toEqual([1]);

    rerender(<ParameterBuilderLab mode="expert" />);
    expect(screen.getByText("6.97B")).toBeInTheDocument();
    expect(screen.getByText(/P ≈ Vd/)).toBeInTheDocument();

    rerender(<LoRALab inputs={{ rank: 8, quantized: false }} />);
    expect(screen.getByText(/Share of 7B model/)).toBeInTheDocument();
  });

  it("keeps preference, inference, and GPU simulators interactive", () => {
    const preferenceChanges: Array<[string, string | number | boolean | null]> =
      [];
    const { rerender } = render(
      <PreferenceTrainerLab
        step={1}
        onInputChange={(key, value) =>
          preferenceChanges.push([key, value])
        }
      />,
    );
    fireEvent.click(screen.getByText("Candidate A").closest("button")!);
    expect(preferenceChanges[0]?.[0]).toBe("pick-0");

    rerender(<InferenceRuntimeLab step={8} inputs={{ concurrency: 8 }} />);
    expect(screen.getByText("GPUs run many calculations in parallel.")).toBeInTheDocument();
    expect(screen.getByText("Complete ✓")).toBeInTheDocument();

    rerender(
      <DivergenceSimulator inputs={{ split: 16, pathA: 5, pathB: 8 }} />,
    );
    expect(screen.getAllByText("13").length).toBeGreaterThan(0);
    expect(screen.getByText(/Both paths issue serially/)).toBeInTheDocument();
  });

  it("makes formerly unreachable serving and GPU stages selectable", () => {
    const requestSteps: number[] = [];
    const { rerender } = render(
      <RequestArrivalLab onStepChange={(step) => requestSteps.push(step)} />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "05 Batch" }));
    expect(requestSteps).toEqual([4]);

    rerender(<SchedulerTraceLab step={5} />);
    expect(screen.getAllByText("Warp 0 becomes eligible and resumes.")).toHaveLength(2);

    rerender(<GridLaunchExplorer step={9} />);
    expect(screen.getByText(/result C ready/)).toBeInTheDocument();

    rerender(<CoalescingLab step={4} inputs={{ pattern: "tiled" }} />);
    expect(screen.getByText(/One coalesced HBM fill/)).toBeInTheDocument();
  });

  it("presents HBM stacks as an illustrative variable-count package layout", () => {
    const { rerender } = render(<GpuCrankRoomLab mode="beginner" step={0} />);
    expect(screen.getByText("HBM stacks")).toBeInTheDocument();
    expect(screen.getByText("Count and layout vary by accelerator.")).toBeInTheDocument();
    expect(
      screen.queryByText(/Memory controllers distribute addresses/),
    ).not.toBeInTheDocument();

    rerender(<GpuCrankRoomLab mode="expert" step={0} />);
    expect(
      screen.getByText(/Memory controllers distribute addresses/),
    ).toBeInTheDocument();
  });

  it("shows the final response and distinct system and GPU replay evidence", () => {
    render(
      <FinalReplayExperience
        mode="beginner"
        step={11}
        onStepChange={() => undefined}
        onNavigateChapter={() => undefined}
      />,
    );
    expect(screen.getAllByText("GPUs run many calculations in parallel.")).toHaveLength(2);
    expect(screen.getByText("Complete ✓")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "GPU view" }));
    expect(screen.getByText("Weights in HBM")).toBeInTheDocument();
    expect(screen.getByText("KV-cache positions")).toBeInTheDocument();
  });
});
