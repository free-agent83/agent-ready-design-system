import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

// The open+keyboard-nav+select flow relies on pointer/focus APIs jsdom lacks, so
// that runs in the Storybook `play`. jsdom asserts the closed state (trigger
// present, items absent) and the forced-open state (items rendered as menuitems).
test("closed by default: trigger renders, items are absent", () => {
  render(
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  const trigger = screen.getByRole("button", { name: "Actions" });
  expect(trigger).toHaveAttribute("data-slot", "dropdown-menu-trigger");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("menuitem")).toBeNull();
});

test("defaultOpen renders items as menuitems with their data-slot", () => {
  render(
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  const items = screen.getAllByRole("menuitem");
  expect(items).toHaveLength(2);
  expect(items[0]).toHaveAttribute("data-slot", "dropdown-menu-item");
  expect(items[0]).toHaveTextContent("Edit");
});
