import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Wordmark } from "@/app/components/wordmark";
import { ThemeToggle } from "@/app/components/theme-toggle";

// Shared chrome for the Fumadocs layouts — the wordmark links back to the
// dashboard so the docs and the app read as one product, and our own
// ThemeToggle drives the app-wide cookie theme (Fumadocs' toggle is disabled).
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Wordmark />,
      url: "/",
    },
    links: [
      {
        type: "custom",
        secondary: true,
        children: <ThemeToggle />,
      },
    ],
  };
}
