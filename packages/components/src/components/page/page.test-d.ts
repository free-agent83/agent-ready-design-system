import * as React from "react";
import { Page } from "./page";

// Page's soundness property is that the inset cannot be configured away.
// There is no `inset` prop and no `style` prop: both are compile errors.
type PageProps = React.ComponentProps<typeof Page>;

// @ts-expect-error
const noInsetProp: PageProps = { inset: 0 };
void noInsetProp;

// @ts-expect-error
const noStyleProp: PageProps = { style: { padding: 0 } };
void noStyleProp;

// A className for the inner column is fine; it never reaches the frame.
const ok: PageProps = { className: "max-w-3xl", children: "x" };
void ok;
