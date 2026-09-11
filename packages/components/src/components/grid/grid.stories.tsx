import type { Meta, StoryObj } from "@storybook/react";
import { Grid } from "./grid";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card";

const meta = {
  title: "Layout/Grid",
  component: Grid,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: { min: { control: "select", options: ["xs", "sm", "md", "lg"] } },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cards: Story = {
  args: { min: "sm" },
  render: (args) => (
    <Grid {...args}>
      {["Bundling", "Quiet hours", "Usage", "Digest"].map((t) => (
        <Card key={t}>
          <CardHeader><CardTitle>{t}</CardTitle></CardHeader>
          <CardContent>Resize the viewport: columns collapse at the token minimum, never at a breakpoint someone guessed.</CardContent>
        </Card>
      ))}
    </Grid>
  ),
};
