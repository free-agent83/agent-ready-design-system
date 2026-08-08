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
  args: { id: "switch-demo" },
  // Single-control stories render through here so they carry a real, associated
  // label rather than a bare control with no accessible name. See the same note
  // on Checkbox: a story is copied as an example whether or not it was written
  // as one.
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch {...args} />
      <label htmlFor={args.id} className="text-sm text-foreground">
        Dark mode
      </label>
    </div>
  ),
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

// A size comparison rather than a form example, so aria-label is the right tool
// here: there is no visible text these controls could be labelled by.
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch size="sm" defaultChecked aria-label="Small" />
      <Switch size="md" defaultChecked aria-label="Medium" />
    </div>
  ),
};
