import type { Meta, StoryObj } from "@storybook/react";
import { Section, SectionDescription, SectionHeader, SectionTitle } from "./section";
import { Stack } from "../stack/stack";
import { Switch } from "../switch/switch";

const meta = {
  title: "Layout/Section",
  component: Section,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = (
  <>
    <SectionHeader>
      <SectionTitle>Delivery</SectionTitle>
      <SectionDescription>Which channels carry each kind of notification.</SectionDescription>
    </SectionHeader>
    <Stack>
      <Stack direction="horizontal" align="center" gap="control">
        <Switch id="a" defaultChecked />
        <label htmlFor="a">Mentions</label>
      </Stack>
      <Stack direction="horizontal" align="center" gap="control">
        <Switch id="b" />
        <label htmlFor="b">Replies</label>
      </Stack>
    </Stack>
  </>
);

export const Plain: Story = { render: () => <Section>{body}</Section> };
export const OnSurface: Story = { name: "On its own surface", render: () => <Section surface>{body}</Section> };
