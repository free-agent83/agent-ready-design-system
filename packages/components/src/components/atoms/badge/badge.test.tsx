import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Badge } from "./badge";

test("renders with the default neutral variant", () => {
  render(<Badge>Draft</Badge>);
  const el = screen.getByText("Draft");
  expect(el).toHaveAttribute("data-slot", "badge");
  expect(el).toHaveAttribute("data-variant", "neutral");
});

test("reflects the chosen status variant", () => {
  render(<Badge variant="success">Paid</Badge>);
  expect(screen.getByText("Paid")).toHaveAttribute("data-variant", "success");
});
