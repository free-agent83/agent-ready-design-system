import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Button } from "./button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "outline", "ghost"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: "Primary Button", variant: "primary" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    expect(btn).toHaveAttribute("data-slot", "button");
    await userEvent.click(btn);
  },
};

export const Outline: Story = {
  args: { children: "Outline Button", variant: "outline" },
};

export const Ghost: Story = {
  args: { children: "Ghost Button", variant: "ghost" },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const AsChild: Story = {
  render: () => (
    <Button asChild>
      <a href="https://example.com">Link Button</a>
    </Button>
  ),
};

export const Disabled: Story = {
  args: { children: "Disabled Button", disabled: true },
};

export const ThemeProof: Story = {
  render: () => <Button>Themed</Button>,
  play: async ({ canvasElement }) => {
    const btn = canvasElement.querySelector('[data-slot="button"]') as HTMLElement;
    const light = getComputedStyle(btn).backgroundColor;
    expect(light).not.toBe("");                       // a real resolved colour, not empty
    document.documentElement.classList.add("dark");
    const dark = getComputedStyle(btn).backgroundColor;
    document.documentElement.classList.remove("dark");
    expect(dark).not.toBe(light);                      // proves the token/theme cascade flows
  },
};
