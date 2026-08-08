import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Switch } from "./switch";

test("renders a switch carrying data-slot for inspection", () => {
  render(<Switch />);
  expect(screen.getByRole("switch")).toHaveAttribute("data-slot", "switch");
});

test("starts unchecked", () => {
  render(<Switch />);
  expect(screen.getByRole("switch")).toHaveAttribute("data-state", "unchecked");
});

test("toggles to checked on click", async () => {
  render(<Switch />);
  const toggle = screen.getByRole("switch");
  await userEvent.click(toggle);
  expect(toggle).toHaveAttribute("data-state", "checked");
});

test("reflects the disabled attribute", () => {
  render(<Switch disabled />);
  expect(screen.getByRole("switch")).toBeDisabled();
});
