import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Combobox, type ComboboxOption } from "./combobox";

const options: ComboboxOption[] = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "vite", label: "Vite" },
  { value: "nuxt", label: "Nuxt" },
];

const meta = {
  title: "Molecules/Combobox",
  component: Combobox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { options, placeholder: "Select framework…" },
  // Exercises the REAL open→type→select in a browser (test:storybook). The
  // Popover content is portalled, so query it in document.body.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const search = await body.findByPlaceholderText("Search…");
    await userEvent.type(search, "ast");
    const option = await body.findByText("Astro");
    await userEvent.click(option);
    expect(trigger).toHaveTextContent("Astro");
  },
};
