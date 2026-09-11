import * as React from "react";
import { Stack } from "./stack";

// The soundness property: spacing comes from the scale. A number, a pixel
// string or an unknown name does not compile.
type StackProps = React.ComponentProps<typeof Stack>;

// @ts-expect-error
const aNumber: StackProps = { gap: 12 };
void aNumber;

// @ts-expect-error
const aPixel: StackProps = { gap: "12px" };
void aPixel;

// @ts-expect-error
const unknown: StackProps = { gap: "large" };
void unknown;

const ok: StackProps = { gap: "section", direction: "horizontal", align: "center", wrap: true, children: "x" };
void ok;
