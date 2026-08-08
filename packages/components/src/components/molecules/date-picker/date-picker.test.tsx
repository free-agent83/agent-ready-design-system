import { render, screen } from "@testing-library/react";
import { format } from "date-fns";
import { expect, test } from "vitest";
import { DatePicker } from "./date-picker";

// The calendar is portalled (Popover) and pointer-driven, so open→pick runs in
// the Storybook `play`. jsdom asserts the CLOSED trigger state.
test("closed by default: shows the placeholder", () => {
  render(<DatePicker placeholder="Pick a date" />);
  const trigger = screen.getByRole("button");
  expect(trigger).toHaveAttribute("data-slot", "date-picker");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveTextContent("Pick a date");
});

test("shows the selected date formatted on the trigger", () => {
  const date = new Date(2026, 6, 2); // 2 Jul 2026
  render(<DatePicker value={date} />);
  expect(screen.getByRole("button")).toHaveTextContent(format(date, "PPP"));
});

test("a disabled date picker is disabled", () => {
  render(<DatePicker disabled />);
  expect(screen.getByRole("button")).toBeDisabled();
});
