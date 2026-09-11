import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "./stack";
import { Button } from "../button/button";
import { Input } from "../input/input";

const meta = {
  title: "Layout/Stack",
  component: Stack,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: { gap: { control: "select", options: ["page", "section", "group", "control"] } },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  args: { gap: "group" },
  render: (args) => (
    <Stack {...args}>
      <Stack gap="control">
        <label htmlFor="n">Name</label>
        <Input id="n" placeholder="Ada Lovelace" />
      </Stack>
      <Stack gap="control">
        <label htmlFor="e">Email</label>
        <Input id="e" placeholder="ada@example.com" />
      </Stack>
    </Stack>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Stack direction="horizontal" align="center" gap="control" wrap>
      <Button variant="outline">Discard</Button>
      <Button>Save changes</Button>
    </Stack>
  ),
};
