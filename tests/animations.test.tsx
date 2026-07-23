// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { KernelLaunchAnimation } from "@/app/components/animations";
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
});
