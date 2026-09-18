import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Missing } from "./missing";

const meta = {
  title: "System/Missing",
  component: Missing,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Missing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    what: "DateRangePicker",
    reason: "single-date Calendar only, no range variant exists",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const note = canvas.getByRole("note");
    expect(note).toHaveAttribute("data-undrift-missing", "DateRangePicker");
    expect(note).toHaveAttribute("data-undrift-reason", "single-date Calendar only, no range variant exists");
  },
};

export const MissingToken: Story = {
  args: {
    what: "--color-brand-accent",
    reason: "no accent role distinct from primary exists yet",
  },
};

export const ThemeProof: Story = {
  args: { what: "Rating", reason: "no rating component exists" },
  render: (args) => <Missing {...args} />,
  play: async ({ canvasElement }) => {
    const note = canvasElement.querySelector('[data-slot="missing"]') as HTMLElement;
    const light = getComputedStyle(note).color;
    expect(light).not.toBe("");
    document.documentElement.classList.add("dark");
    const dark = getComputedStyle(note).color;
    document.documentElement.classList.remove("dark");
    expect(dark).not.toBe(light);
  },
};
