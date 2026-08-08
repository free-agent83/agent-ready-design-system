import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Input } from "./input";

test("renders a textbox", () => {
  render(<Input placeholder="Email" />);
  expect(screen.getByRole("textbox")).toBeInTheDocument();
});

test("accepts typed input", async () => {
  render(<Input />);
  const field = screen.getByRole("textbox");
  await userEvent.type(field, "hello@example.com");
  expect(field).toHaveValue("hello@example.com");
});

test("reflects the disabled attribute", () => {
  render(<Input disabled />);
  expect(screen.getByRole("textbox")).toBeDisabled();
});

test("carries data-slot for inspection", () => {
  render(<Input />);
  expect(screen.getByRole("textbox")).toHaveAttribute("data-slot", "input");
});
