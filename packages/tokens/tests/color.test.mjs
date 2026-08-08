import { expect, test } from "vitest";
import { dtcgToCss, toHex } from "../lib/color.mjs";
test("oklch object → css", () => expect(dtcgToCss({colorSpace:"oklch",components:[0.62,0.2,28],hex:"#e0481e"})).toMatch(/^oklch\(0\.62 0\.2 28\)$/));
test("oklch object → hex", () => expect(toHex({colorSpace:"oklch",components:[1,0,0],hex:"#ffffff"})).toBe("#ffffff"));
test("malformed colour throws a located error", () => expect(() => dtcgToCss({colorSpace:"oklch"})).toThrow(/invalid oklch components/i));
