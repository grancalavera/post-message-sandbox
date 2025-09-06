import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the main heading", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Post Message Sandbox",
    );
  });

  it("renders the description text", () => {
    render(<App />);
    expect(
      screen.getByText(
        "Experiments with browser APIs that use postMessage, integrated with Comlink.",
      ),
    ).toBeInTheDocument();
  });

  it("renders experiments section", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Experiments",
    );
  });
});
