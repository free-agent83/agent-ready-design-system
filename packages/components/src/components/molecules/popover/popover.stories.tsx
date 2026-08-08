import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "../../atoms/button/button";

const meta = {
  title: "Molecules/Popover",
  component: Popover,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm text-foreground">
          Popovers float above the page on the <code className="font-mono">popover</code> surface
          with <code className="font-mono">shadow-popover</code> elevation.
        </p>
      </PopoverContent>
    </Popover>
  ),
  // Exercises the REAL open interaction in a browser (test:storybook). Content is
  // portalled to document.body, so query it there rather than in-canvas.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open popover" });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const panel = await body.findByText(/Popovers float above the page/);
    expect(panel).toBeVisible();
  },
};
