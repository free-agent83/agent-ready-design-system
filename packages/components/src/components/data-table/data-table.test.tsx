import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ColumnDef } from "@tanstack/react-table";
import { expect, test } from "vitest";
import { DataTable } from "./data-table";

type Row = { name: string; amount: number };
const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "amount", header: "Amount", meta: { numeric: true } },
];
const data: Row[] = [
  { name: "Charlie", amount: 30 },
  { name: "Alice", amount: 10 },
  { name: "Bob", amount: 20 },
];

// TanStack Table renders fully in jsdom (no portals), so sort + filter work here.
function firstBodyName() {
  const rows = screen.getAllByRole("row");
  // rows[0] is the header row; the first data row is rows[1].
  return within(rows[1]).getAllByRole("cell")[0].textContent;
}

test("clicking a column header sorts the rows", async () => {
  const user = userEvent.setup();
  render(<DataTable columns={columns} data={data} />);
  expect(firstBodyName()).toBe("Charlie"); // unsorted: source order
  await user.click(screen.getByRole("button", { name: /Name/ }));
  expect(firstBodyName()).toBe("Alice"); // ascending
});

test("the toolbar filter narrows the visible rows", async () => {
  const user = userEvent.setup();
  render(<DataTable columns={columns} data={data} filterColumn="name" filterPlaceholder="Filter names" />);
  expect(screen.getAllByRole("row")).toHaveLength(1 + 3); // header + 3 rows
  await user.type(screen.getByRole("textbox", { name: "Filter names" }), "Ali");
  expect(screen.getAllByRole("row")).toHaveLength(1 + 1); // header + Alice
  expect(screen.getByRole("cell", { name: "Alice" })).toBeInTheDocument();
});

test("renders an empty state when there are no rows", () => {
  render(<DataTable columns={columns} data={[]} />);
  expect(screen.getByText("No results.")).toBeInTheDocument();
});
