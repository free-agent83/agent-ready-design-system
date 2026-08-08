import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["neutral", "success", "warning", "danger", "info"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = { args: { children: "Draft", variant: "neutral" } };
export const Success: Story = { args: { children: "Paid", variant: "success" } };
export const Warning: Story = { args: { children: "Pending", variant: "warning" } };
export const Danger: Story = { args: { children: "Overdue", variant: "danger" } };
export const Info: Story = { args: { children: "New", variant: "info" } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="neutral">Draft</Badge>
      <Badge variant="success">Paid</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="danger">Overdue</Badge>
      <Badge variant="info">New</Badge>
    </div>
  ),
};
