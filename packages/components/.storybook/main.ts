import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-a11y"],
  framework: { name: "@storybook/react-vite", options: {} },
  viteFinal: async (c) => {
    c.plugins = [...(c.plugins ?? []), tailwindcss()];
    c.resolve = {
      ...c.resolve,
      alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) },
    };
    return c;
  },
};

export default config;
