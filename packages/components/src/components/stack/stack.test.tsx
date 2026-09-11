import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Stack } from "./stack";

test("with no props a stack is vertical and spaced by the group gap", () => {
  render(<Stack data-testid="s">x</Stack>);
  const s = screen.getByTestId("s");
  expect(s.className).toContain("flex-col");
  expect(s.className).toContain("gap-group-gap");
  expect(s).toHaveAttribute("data-direction", "vertical");
});

test("every gap resolves to a layout token utility and nothing else", () => {
  for (const [gap, cls] of [["page", "gap-page-gap"], ["section", "gap-section-gap"], ["group", "gap-group-gap"], ["control", "gap-control-gap"]] as const) {
    const { unmount } = render(<Stack gap={gap} data-testid="s">x</Stack>);
    expect(screen.getByTestId("s").className).toContain(cls);
    unmount();
  }
});

test("horizontal, aligned and wrapping", () => {
  render(<Stack direction="horizontal" align="center" wrap data-testid="s">x</Stack>);
  const s = screen.getByTestId("s");
  for (const c of ["flex-row", "items-center", "flex-wrap"]) expect(s.className).toContain(c);
});
