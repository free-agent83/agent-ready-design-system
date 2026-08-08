import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Button } from "./button";
test("renders a disabled button", () => {
  render(<Button disabled>Save</Button>);
  expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
});
test("asChild renders the child element, not a button", () => {
  render(<Button asChild><a href="/x">Go</a></Button>);
  const link = screen.getByRole("link", { name: "Go" });
  expect(link).toHaveAttribute("data-slot", "button");
});
