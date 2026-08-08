import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

test("composes the parts and renders the title as a heading", () => {
  render(
    <Card>
      <CardHeader>
        <CardTitle>Invoice #1042</CardTitle>
        <CardDescription>Due in 14 days</CardDescription>
      </CardHeader>
      <CardContent>Body</CardContent>
      <CardFooter>Footer</CardFooter>
    </Card>
  );
  // The title is a real heading so the document outline is correct.
  const title = screen.getByRole("heading", { name: "Invoice #1042" });
  expect(title).toHaveAttribute("data-slot", "card-title");
  expect(screen.getByText("Due in 14 days")).toHaveAttribute("data-slot", "card-description");
  expect(screen.getByText("Body")).toHaveAttribute("data-slot", "card-content");
  expect(screen.getByText("Footer")).toHaveAttribute("data-slot", "card-footer");
});

test("forwards className and native attributes on the root", () => {
  render(<Card className="w-80" data-testid="c" aria-label="Summary" />);
  const el = screen.getByTestId("c");
  expect(el).toHaveClass("w-80");
  expect(el).toHaveAttribute("data-slot", "card");
  expect(el).toHaveAttribute("aria-label", "Summary");
});
