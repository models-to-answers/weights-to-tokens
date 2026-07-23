// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KernelLaunchAnimation } from "@/app/components/animations";

describe("deterministic animation controls", () => {
  it("steps forward and reveals Expert detail without replacing the core stage", () => {
    render(<KernelLaunchAnimation mode="expert" />);
    expect(screen.getByText(/Step 1 of/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText(/Step 2 of/i)).toBeInTheDocument();
    expect(screen.getByText("Expert view")).toBeInTheDocument();
  });
});
