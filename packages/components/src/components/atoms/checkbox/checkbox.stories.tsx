import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Checkbox } from "./checkbox";

const meta = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md"] },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole("checkbox");
    expect(box).toHaveAttribute("data-slot", "checkbox");
    expect(box).toHaveAttribute("data-state", "unchecked");
    await userEvent.click(box);
    expect(box).toHaveAttribute("data-state", "checked");
  },
};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Indeterminate: Story = {
  args: { checked: "indeterminate" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole("checkbox");
    expect(box).toHaveAttribute("data-state", "indeterminate");
    expect(box).toHaveAttribute("aria-checked", "mixed");
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Checkbox size="sm" defaultChecked />
      <Checkbox size="md" defaultChecked />
    </div>
  ),
};
