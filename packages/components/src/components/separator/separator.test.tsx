import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Separator } from "./separator";

test("decorative by default: hidden from the a11y tree, horizontal orientation", () => {
  render(<Separator data-testid="s" />);
  const el = screen.getByTestId("s");
  expect(el).toHaveAttribute("data-slot", "separator");
  expect(el).toHaveAttribute("data-orientation", "horizontal");
  // decorative separators are presentational, not announced.
  expect(el).toHaveAttribute("role", "none");
});

test("non-decorative vertical separator exposes the separator role + orientation", () => {
  render(<Separator decorative={false} orientation="vertical" data-testid="s" />);
  const el = screen.getByTestId("s");
  expect(el).toHaveAttribute("data-orientation", "vertical");
  expect(el).toHaveAttribute("role", "separator");
  expect(el).toHaveAttribute("aria-orientation", "vertical");
});
