import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Combobox, type ComboboxOption } from "./combobox";

const options: ComboboxOption[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

// The open/type/select flow is portalled (Popover) + pointer-driven (cmdk), so
// it runs in the Storybook `play`. jsdom asserts the CLOSED state.
test("closed by default: shows the placeholder on the trigger", () => {
  render(<Combobox options={options} placeholder="Pick a fruit" />);
  const trigger = screen.getByRole("combobox");
  expect(trigger).toHaveAttribute("data-slot", "combobox");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveTextContent("Pick a fruit");
});

test("reflects the selected value's label on the trigger", () => {
  render(<Combobox options={options} value="banana" placeholder="Pick a fruit" />);
  expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
});

test("a disabled combobox is disabled", () => {
  render(<Combobox options={options} disabled />);
  expect(screen.getByRole("combobox")).toBeDisabled();
});
