import { describe, expect, test } from "vitest";
import { gateSource } from "../src/gate.mjs";

// When there is no trustworthy nearest token, the gate falls back to generic
// advice — and that advice used to name `bg-primary` / `text-foreground`,
// which are THIS sample's tokens. Point undrift at another system and it was
// instructing the agent to use utilities that do not exist there: the exact
// "confidently wrong" failure undrift exists to prevent. The examples must
// come from the loaded contract, or not be given at all.

const contractFor = (tokens) => ({
  system: "test-system",
  exemptMarker: "token-exempt",
  tokens,
  intrinsics: {},
  foreignUi: [],
  profiles: {},
});

// A colour nothing in these contracts is near, so the nearest-token branch
// stays quiet and we always exercise the fallback.
const FAR_COLOR = "#00ff00";

const fallbackFor = (tokens, raw = FAR_COLOR) => {
  const hit = gateSource(`const c = "${raw}";`, { contract: contractFor(tokens) }).find(
    (v) => v.rule === "no-raw-colors"
  );
  expect(hit).toBeDefined();
  expect(hit.message, "expected the fallback, not a nearest-token match").not.toContain(
    "Nearest token"
  );
  return hit.message;
};

const namesIn = (message) => [...message.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]);

describe("the no-nearest-match fallback names only tokens that exist", () => {
  const basaltShaped = {
    "--color-accent": "light-dark(#0064E0, #2694FE)",
    "--color-text-primary": "light-dark(#0A1317, #DFE2E5)",
    "--color-background-surface": "light-dark(#FFFFFF, #1F1F22)",
    "--font-weight-bold": "700",
    "--spacing-2": "8px",
  };

  const sampleShaped = {
    "--color-primitive-white": "#ffffff",
    "--color-primitive-slate-900": "oklch(0.2077 0.0398 265.7549)",
    "--color-semantic-primary": "oklch(0.5417 0.179 288.0332)",
    "--color-semantic-foreground": "oklch(0.2077 0.0398 265.7549)",
    "--color-semantic-background": "#ffffff",
    "--spacing-4": "16px",
  };

  test("an Basalt-shaped contract yields Basalt token names, never this sample's", () => {
    const message = fallbackFor(basaltShaped);
    expect(message).not.toContain("bg-primary");
    expect(message).not.toContain("text-foreground");
    const named = namesIn(message);
    expect(named.length).toBeGreaterThanOrEqual(2);
    expect(named.length).toBeLessThanOrEqual(3);
    for (const n of named) expect(Object.keys(basaltShaped)).toContain(n);
  });

  test("the sample-shaped contract still reads sensibly", () => {
    const message = fallbackFor(sampleShaped);
    const named = namesIn(message);
    expect(named.length).toBeGreaterThanOrEqual(2);
    for (const n of named) expect(Object.keys(sampleShaped)).toContain(n);
    // Semantic roles, not raw palette entries: naming a primitive would tell
    // the agent to reach past the layer the system wants it to use.
    for (const n of named) expect(n).not.toContain("primitive");
  });

  test("never names a non-colour token as the fix for a raw colour", () => {
    for (const message of [fallbackFor(basaltShaped), fallbackFor(sampleShaped)]) {
      expect(message).not.toContain("--spacing");
      expect(message).not.toContain("--font-weight");
    }
  });

  test("an empty token set invents nothing", () => {
    const message = fallbackFor({});
    expect(namesIn(message)).toEqual([]);
    expect(message).not.toContain("bg-primary");
    expect(message).not.toContain("text-foreground");
    // Still advice, not an empty sentence.
    expect(message.trim().length).toBeGreaterThan(20);
    expect(message).toContain("token");
  });

  test("a token set with no colours at all invents nothing", () => {
    const message = fallbackFor({ "--spacing-2": "8px", "--font-weight-bold": "700" });
    expect(namesIn(message)).toEqual([]);
    expect(message).not.toContain("--spacing");
    expect(message).not.toContain("--font-weight");
  });

  test("a colour-valued token with no 'color' in its name can still be an example", () => {
    const message = fallbackFor({ "--brand-ink": "#0A1317", "--brand-paper": "#ffffff" });
    expect(namesIn(message).sort()).toEqual(["--brand-ink", "--brand-paper"]);
  });
});
