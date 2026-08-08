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
  args: { id: "checkbox-demo" },
  // Every single-control story renders through here, so the stories
  // demonstrate the pattern COMPONENT.md actually asks for ("pair every
  // checkbox with a <label htmlFor={id}>") rather than a bare control nobody
  // should copy. A story is read as an example whether or not it was written
  // as one, and an unlabelled checkbox has no accessible name.
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} />
      <label htmlFor={args.id} className="text-sm text-foreground">
        Email me about product updates
      </label>
    </div>
  ),
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

// A size comparison rather than a form example, so aria-label is the right
// tool here: there is no visible text these controls could be labelled by.
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Checkbox size="sm" defaultChecked aria-label="Small" />
      <Checkbox size="md" defaultChecked aria-label="Medium" />
    </div>
  ),
};
