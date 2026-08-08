import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Switch } from "./switch";

const meta = {
  title: "Atoms/Switch",
  component: Switch,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md"] },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch");
    expect(toggle).toHaveAttribute("data-slot", "switch");
    expect(toggle).toHaveAttribute("data-state", "unchecked");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "checked");
  },
};

export const On: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch size="sm" defaultChecked />
      <Switch size="md" defaultChecked />
    </div>
  ),
};
