import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { DatePicker } from "./date-picker";

const meta = {
  title: "Molecules/DatePicker",
  component: DatePicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { placeholder: "Pick a date" },
  // Exercises the REAL open→pick in a browser (test:storybook). The calendar is
  // portalled, so query the grid in document.body.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const grid = await body.findByRole("grid");
    // Day buttons carry a full-date accessible name, so match on the visible
    // number instead: pick the 15th of whatever month is shown.
    const day = within(grid)
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "15");
    await userEvent.click(day!);
    // selecting closes the popover and updates the trigger label
    expect(trigger).toHaveTextContent(/\d{4}/);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const Preselected: Story = {
  args: { value: new Date(2026, 6, 2) },
};
