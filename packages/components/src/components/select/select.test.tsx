import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

// Radix Select's open/select flow relies on pointer APIs jsdom lacks, so these
// tests assert only the CLOSED state. The real open+select is exercised by the
// Storybook `play` under `test:storybook` (a real browser).
test("trigger carries data-slot and shows the selected value", () => {
  render(
    <Select defaultValue="apple">
      <SelectTrigger aria-label="Fruit">
        <SelectValue placeholder="Pick one" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </SelectContent>
    </Select>
  );
  const combobox = screen.getByRole("combobox");
  expect(combobox).toHaveAttribute("data-slot", "select-trigger");
  expect(combobox).toHaveTextContent("Apple");
});

test("a disabled trigger is disabled", () => {
  render(
    <Select defaultValue="apple">
      <SelectTrigger aria-label="Fruit" disabled>
        <SelectValue placeholder="Pick one" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
      </SelectContent>
    </Select>
  );
  expect(screen.getByRole("combobox")).toBeDisabled();
});
