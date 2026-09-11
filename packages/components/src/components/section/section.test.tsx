import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Section, SectionDescription, SectionHeader, SectionTitle } from "./section";

test("a plain section separates its groups by the section gap and sits on no surface", () => {
  render(<Section data-testid="s">x</Section>);
  const s = screen.getByTestId("s");
  expect(s.tagName).toBe("SECTION");
  expect(s.className).toContain("gap-section-gap");
  expect(s.className).not.toContain("bg-card");
  expect(s).not.toHaveAttribute("data-surface");
});

test("surface brings the surface, the border, the elevation and the inset together", () => {
  render(<Section surface data-testid="s">x</Section>);
  const s = screen.getByTestId("s");
  expect(s).toHaveAttribute("data-surface", "true");
  for (const c of ["bg-card", "border-border", "shadow-card", "p-section-inset"]) expect(s.className).toContain(c);
});

test("the title is an h2, between the page's h1 and a card's h3", () => {
  render(
    <Section>
      <SectionHeader>
        <SectionTitle>Delivery</SectionTitle>
        <SectionDescription>Which channels carry each kind.</SectionDescription>
      </SectionHeader>
    </Section>
  );
  expect(screen.getByRole("heading", { level: 2, name: "Delivery" })).toHaveAttribute("data-slot", "section-title");
  expect(screen.getByText("Which channels carry each kind.")).toHaveAttribute("data-slot", "section-description");
});
