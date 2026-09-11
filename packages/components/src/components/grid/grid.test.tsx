import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Grid } from "./grid";

test("with no props a grid collapses at the card minimum and spaces by the group gap", () => {
  render(<Grid data-testid="g">x</Grid>);
  const g = screen.getByTestId("g");
  expect(g.className).toContain("grid-auto-sm");
  expect(g.className).toContain("gap-group-gap");
  expect(g).toHaveAttribute("data-min", "sm");
});

test("every minimum resolves to a collapsing-grid utility", () => {
  for (const [min, cls] of [["xs", "grid-auto-xs"], ["sm", "grid-auto-sm"], ["md", "grid-auto-md"], ["lg", "grid-auto-lg"]] as const) {
    const { unmount } = render(<Grid min={min} data-testid="g">x</Grid>);
    expect(screen.getByTestId("g").className).toContain(cls);
    unmount();
  }
});

test("there is no fixed column count utility on the element", () => {
  render(<Grid data-testid="g">x</Grid>);
  expect(screen.getByTestId("g").className).not.toMatch(/grid-cols-\d/);
});
