import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";

function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/reports">Reports</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Q3</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

test("renders a labelled nav landmark with links", () => {
  render(<Example />);
  const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
  expect(nav).toHaveAttribute("data-slot", "breadcrumb");
  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: "Reports" })).toHaveAttribute("href", "/reports");
});

test("marks the final crumb as the current page", () => {
  render(<Example />);
  const current = screen.getByText("Q3");
  expect(current).toHaveAttribute("aria-current", "page");
  expect(current).toHaveAttribute("data-slot", "breadcrumb-page");
});
