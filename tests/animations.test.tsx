// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { KernelLaunchAnimation } from "@/app/components/animations";
import {
  DivergenceSimulator,
  InferenceRuntimeLab,
  LoRALab,
  ParameterBuilderLab,
  PreferenceTrainerLab,
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
    fireEvent.keyDown(screen.getByRole("tab", { name: "01 Model" }), {
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
        onInputChange={(key, value) =>
          preferenceChanges.push([key, value])
        }
      />,
    );
    fireEvent.click(screen.getByText("Answer A").closest("button")!);
    expect(preferenceChanges[0]?.[0]).toBe("pick-0");

    rerender(<InferenceRuntimeLab inputs={{ concurrency: 8 }} />);
    expect(screen.getByText("4608 MB")).toBeInTheDocument();
    expect(screen.getByText(/Requests wait/)).toBeInTheDocument();

    rerender(
      <DivergenceSimulator inputs={{ split: 16, pathA: 5, pathB: 8 }} />,
    );
    expect(screen.getAllByText("13").length).toBeGreaterThan(0);
    expect(screen.getByText(/Paths serialize/)).toBeInTheDocument();
  });
});
