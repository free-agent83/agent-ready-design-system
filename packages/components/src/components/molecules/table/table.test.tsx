import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

test("renders real table semantics with column headers and cells", () => {
  render(
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead numeric>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Ada</TableCell>
          <TableCell numeric>1,024</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
  expect(screen.getByRole("table")).toHaveAttribute("data-slot", "table");
  expect(screen.getAllByRole("columnheader")).toHaveLength(2);
  expect(screen.getByRole("cell", { name: "Ada" })).toBeInTheDocument();
});

test("numeric cells get tabular figures and right alignment", () => {
  render(
    <Table>
      <TableBody>
        <TableRow>
          <TableCell numeric>1,024</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
  const cell = screen.getByRole("cell", { name: "1,024" });
  expect(cell).toHaveClass("tabular-nums", "text-right");
});
