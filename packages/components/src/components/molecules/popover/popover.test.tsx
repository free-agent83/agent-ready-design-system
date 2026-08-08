import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

// Popover toggles via a plain click, but the open+dismiss flow (outside-click,
// Escape, focus return) is exercised in the Storybook `play` (real browser).
// jsdom asserts the two states we can render without pointer capture: closed
// (content absent) and `defaultOpen` (content present + portalled).
test("closed by default: trigger renders, content is absent", () => {
  render(
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>Panel body</PopoverContent>
    </Popover>
  );
  const trigger = screen.getByRole("button", { name: "Open" });
  expect(trigger).toHaveAttribute("data-slot", "popover-trigger");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByText("Panel body")).toBeNull();
});

test("defaultOpen renders the portalled content with its data-slot", () => {
  render(
    <Popover defaultOpen>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>Panel body</PopoverContent>
    </Popover>
  );
  const panel = screen.getByText("Panel body");
  expect(panel).toHaveAttribute("data-slot", "popover-content");
  expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute("aria-expanded", "true");
});
