import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { Button } from "../../atoms/button/button";

const meta = {
  title: "Molecules/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Adds the item to your cart</TooltipContent>
    </Tooltip>
  ),
  // Exercises the REAL hover→show in a browser (test:storybook). Content is
  // portalled to document.body, so query it there.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Hover me" });
    await userEvent.hover(trigger);
    // Radix renders a visually-hidden role="tooltip" copy of the label as well,
    // so scope to the visible content element (our data-slot) rather than text.
    await waitFor(() => {
      const tip = canvasElement.ownerDocument.querySelector('[data-slot="tooltip-content"]');
      expect(tip).not.toBeNull();
      expect(tip).toBeVisible();
    });
  },
};
