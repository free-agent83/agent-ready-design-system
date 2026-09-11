import * as React from "react";
import { Section } from "./section";

// The soundness property: `surface` is a boolean, not a string of styling.
type SectionProps = React.ComponentProps<typeof Section>;

// @ts-expect-error
const bad: SectionProps = { surface: "card" };
void bad;

const ok: SectionProps = { surface: true, "aria-labelledby": "delivery", children: "x" };
void ok;
