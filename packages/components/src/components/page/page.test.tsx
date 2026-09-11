import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Page, PageActions, PageDescription, PageHeader, PageTitle } from "./page";

test("the inset frame takes no className: a caller cannot zero it", () => {
  render(
    <Page className="p-0 max-w-none" data-testid="column">
      <p>body</p>
    </Page>
  );
  const column = screen.getByTestId("column");
  const frame = column.parentElement!;
  expect(frame).toHaveAttribute("data-slot", "page");
  // The inset is on the frame, and the frame never received the caller's classes.
  expect(frame.className).toBe("p-page-inset");
  expect(frame.className).not.toContain("p-0");
  // The caller's classes landed on the inner column only.
  expect(column).toHaveAttribute("data-slot", "page-column");
  expect(column.className).toContain("p-0");
});

test("the column carries the page gap and the width ceiling from the layout tokens", () => {
  render(<Page data-testid="column">x</Page>);
  const column = screen.getByTestId("column");
  expect(column.className).toContain("gap-page-gap");
  expect(column.className).toContain("max-w-page-max");
});

test("the header renders a real h1 and a place for actions", () => {
  render(
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Notifications</PageTitle>
          <PageDescription>Choose what reaches you.</PageDescription>
        </div>
        <PageActions>
          <button type="button">Save</button>
        </PageActions>
      </PageHeader>
    </Page>
  );
  expect(screen.getByRole("heading", { level: 1, name: "Notifications" })).toHaveAttribute("data-slot", "page-title");
  expect(screen.getByText("Choose what reaches you.")).toHaveAttribute("data-slot", "page-description");
  expect(screen.getByRole("button", { name: "Save" }).parentElement).toHaveAttribute("data-slot", "page-actions");
});
