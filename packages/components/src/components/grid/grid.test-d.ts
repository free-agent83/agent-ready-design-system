import * as React from "react";
import { Grid } from "./grid";

// The soundness property: the column minimum is a layout token name, never
// a number, a pixel string or a column count.
type GridProps = React.ComponentProps<typeof Grid>;

// @ts-expect-error
const aNumber: GridProps = { min: 240 };
void aNumber;

// @ts-expect-error
const aPixel: GridProps = { min: "240px" };
void aPixel;

// @ts-expect-error
const aColumnCount: GridProps = { cols: 3 };
void aColumnCount;

const ok: GridProps = { min: "md", gap: "section", children: "x" };
void ok;
