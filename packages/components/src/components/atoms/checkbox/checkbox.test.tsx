import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Checkbox } from "./checkbox";

test("renders a checkbox carrying data-slot for inspection", () => {
  render(<Checkbox />);
  expect(screen.getByRole("checkbox")).toHaveAttribute("data-slot", "checkbox");
});

test("starts unchecked", () => {
  render(<Checkbox />);
  expect(screen.getByRole("checkbox")).toHaveAttribute("data-state", "unchecked");
});

test("toggles to checked on click", async () => {
  render(<Checkbox />);
  const box = screen.getByRole("checkbox");
  await userEvent.click(box);
  expect(box).toHaveAttribute("data-state", "checked");
});

test("reflects the disabled attribute", () => {
  render(<Checkbox disabled />);
  expect(screen.getByRole("checkbox")).toBeDisabled();
});

test("exposes the indeterminate (mixed) state", () => {
  render(<Checkbox checked="indeterminate" onCheckedChange={() => {}} />);
  const box = screen.getByRole("checkbox");
  expect(box).toHaveAttribute("data-state", "indeterminate");
  expect(box).toHaveAttribute("aria-checked", "mixed");
});
