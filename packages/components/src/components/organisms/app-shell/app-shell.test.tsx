import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import {
  AppShell,
  AppShellContent,
  AppShellHeader,
  AppShellMain,
  AppShellSidebar,
  AppShellTrigger,
} from "./app-shell";

function Example(props: { defaultCollapsed?: boolean } = {}) {
  return (
    <AppShell {...props}>
      <AppShellSidebar>Nav</AppShellSidebar>
      <AppShellMain>
        <AppShellHeader>
          <AppShellTrigger />
          <span>Header</span>
        </AppShellHeader>
        <AppShellContent>Body</AppShellContent>
      </AppShellMain>
    </AppShell>
  );
}

test("renders the frame landmarks and expanded sidebar by default", () => {
  render(<Example />);
  expect(screen.getByRole("main")).toHaveAttribute("data-slot", "app-shell-content");
  expect(screen.getByRole("banner")).toHaveAttribute("data-slot", "app-shell-header");
  const sidebar = screen.getByRole("complementary");
  expect(sidebar).toHaveAttribute("data-state", "expanded");
  expect(screen.getByRole("button", { name: "Toggle sidebar" })).toHaveAttribute(
    "aria-expanded",
    "true"
  );
});

test("the trigger collapses and expands the sidebar", async () => {
  const user = userEvent.setup();
  render(<Example />);
  const sidebar = screen.getByRole("complementary");
  const trigger = screen.getByRole("button", { name: "Toggle sidebar" });
  await user.click(trigger);
  expect(sidebar).toHaveAttribute("data-state", "collapsed");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  await user.click(trigger);
  expect(sidebar).toHaveAttribute("data-state", "expanded");
});

test("respects defaultCollapsed", () => {
  render(<Example defaultCollapsed />);
  expect(screen.getByRole("complementary")).toHaveAttribute("data-state", "collapsed");
});
