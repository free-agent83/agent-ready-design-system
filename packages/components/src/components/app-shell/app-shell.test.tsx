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

test("the content region carries no inset of its own, because Page owns it", () => {
  render(<Example />);
  expect(screen.getByRole("main").className).not.toMatch(/(^|\s)p[xytrbl]?-/);
});

test("starts as the icon rail on a narrow screen, so the page is not pushed off the edge", () => {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({ matches: query.includes("max-width"), media: query, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
  try {
    render(<Example />);
    expect(screen.getByRole("complementary")).toHaveAttribute("data-state", "collapsed");
  } finally {
    window.matchMedia = original;
  }
});

test("the content column can shrink below its content, so wide content scrolls in place", () => {
  render(<Example />);
  expect(screen.getByRole("main").parentElement?.className).toMatch(/(^|\s)min-w-0(\s|$)/);
});
