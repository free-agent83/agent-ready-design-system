import type { Meta, StoryObj } from "@storybook/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Badge } from "../badge/badge";

const meta = {
  title: "Display/Table",
  component: Table,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  { invoice: "INV-001", status: "success" as const, label: "Paid", amount: "1,024.00" },
  { invoice: "INV-002", status: "warning" as const, label: "Pending", amount: "512.50" },
  { invoice: "INV-003", status: "danger" as const, label: "Overdue", amount: "2,300.00" },
];

export const Basic: Story = {
  render: () => (
    <Table>
      <TableCaption>Recent invoices</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead numeric>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.invoice}>
            <TableCell className="font-mono">{r.invoice}</TableCell>
            <TableCell>
              <Badge variant={r.status}>{r.label}</Badge>
            </TableCell>
            <TableCell numeric>{r.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
