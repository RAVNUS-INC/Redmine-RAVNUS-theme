#!/usr/bin/env node
// Contrast gate (DESIGN.md 6.6). Node built-ins and the sass devDependency.
//
// Usage:
//   node src/tools/contrast-gate.mjs            check the defaults and every preset
//   node src/tools/contrast-gate.mjs --verbose  also list every pair that passes
//
// Token values come from src/_tokens.scss, never from a table here: a small
// Sass probe calls the module's public functions (scheme-names, scheme,
// resolve-color, css-color) and prints every color token of every scheme (the
// defaults, then each preset in $presets) as a CSS rule that this script
// parses. Values are the 8-bit sRGB colors the theme ships, so derived tokens
// equal their @supports fallback hex.
//
// Contrast is the WCAG 2.x ratio of relative luminances. A translucent color
// (the link underline) is first composited over the surface it sits on, in
// sRGB like a browser paints it. The gate checks token pairs only; core colors
// the theme does not override are left to the rendered-page checks (axe-core).
//
// Exit status: 0 when every pair meets its minimum, 1 otherwise (or when the
// tokens cannot be read).

import { realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC = join(ROOT, "src");

const PROBE = `
@use "tokens";
@each $scheme-name in tokens.scheme-names() {
  $scheme: tokens.scheme($scheme-name);
  .gate--#{$scheme-name} {
    @each $name, $value in $scheme {
      $color: tokens.resolve-color($scheme, $name);
      @if $color {
        --#{$name}: #{tokens.css-color($color)};
      }
    }
  }
}
`;

// Surfaces that text, icons, control borders and focus rings sit on in the
// page body: the plain surfaces, the accent tints (selected row, sidebar
// selection, menu bar) and the four role tints (DESIGN.md 6.6).
const ROLES = ["info", "success", "warning", "danger"];
const BODY_SURFACES = [
  "bg-canvas",
  "bg-subtle",
  "bg-inset",
  "bg-hover",
  "bg-raised",
  "bg-overlay",
  "accent-subtle",
  "accent-muted",
  "nav-bg",
  ...ROLES.map((role) => `${role}-subtle`),
];
const BODY_TEXT = ["fg-default", "fg-muted", "fg-subtle", "link", ...ROLES.map((role) => `${role}-fg`)];
const TEXT_MIN = 4.5;
const BODY_TEXT_MIN = 7; // fg-default is the reading text
const NON_TEXT_MIN = 3;

// Every pair of DESIGN.md 6.6, in its order. A pair with `anyOf` passes when
// one of its alternatives meets the minimum.
export const PAIRS = [
  ...BODY_TEXT.flatMap((fg) =>
    BODY_SURFACES.map((bg) => ({
      rule: "text on body surfaces",
      fg,
      bg,
      min: fg === "fg-default" ? BODY_TEXT_MIN : TEXT_MIN,
    })),
  ),
  // The theme paints the emphasis tint behind prose text (DESIGN.md 4.11).
  { rule: "text on the emphasis tint", fg: "fg-default", bg: "em-bg", min: BODY_TEXT_MIN },
  { rule: "text on the emphasis tint", fg: "link", bg: "em-bg", min: TEXT_MIN },
  { rule: "text on fills", fg: "on-accent", bg: "accent", min: TEXT_MIN },
  ...ROLES.map((role) => ({ rule: "text on fills", fg: "on-solid", bg: `${role}-solid`, min: TEXT_MIN })),
  // Also the flyout section title (header-fg on header-bg).
  { rule: "chrome text", fg: "header-fg", bg: "header-bg", min: TEXT_MIN },
  { rule: "chrome text", fg: "header-fg-muted", bg: "header-bg", min: TEXT_MIN },
  { rule: "chrome text", fg: "topbar-fg", bg: "topbar-bg", min: TEXT_MIN },
  { rule: "chrome text", fg: "topbar-fg-muted", bg: "topbar-bg", min: TEXT_MIN },
  ...["border-control", "fg-icon", "focus-ring"].flatMap((fg) =>
    BODY_SURFACES.map((bg) => ({ rule: "non-text on body surfaces", fg, bg, min: NON_TEXT_MIN })),
  ),
  { rule: "chrome non-text", fg: "header-focus", bg: "header-bg", min: NON_TEXT_MIN },
  { rule: "chrome non-text", fg: "header-icon", bg: "header-bg", min: NON_TEXT_MIN },
  { rule: "chrome non-text", fg: "topbar-focus", bg: "topbar-bg", min: NON_TEXT_MIN },
  // A control in the header is bounded by its border on a light header, or by
  // its own canvas field on a dark one.
  {
    rule: "header control boundary",
    anyOf: [
      { fg: "header-control-border", bg: "header-bg" },
      { fg: "bg-canvas", bg: "header-bg" },
    ],
    min: NON_TEXT_MIN,
  },
  ...["bg-canvas", "bg-subtle", "bg-inset", "accent-subtle"].map((bg) => ({
    rule: "link underline",
    fg: "link-decoration",
    bg,
    min: NON_TEXT_MIN,
  })),
  ...["progress-closed", "progress-done", "progress-behind"].map((fg) => ({
    rule: "progress bar segment on its track",
    fg,
    bg: "progress-track",
    min: NON_TEXT_MIN,
  })),
];

class GateError extends Error {}

function fail(message) {
  throw new GateError(message);
}

// --- Token values ----------------------------------------------------------

function parseColor(text, label) {
  if (text === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  let match = text.match(/^#([0-9A-Fa-f]{6})$/);
  if (match) {
    const n = Number.parseInt(match[1], 16);
    return { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  match = text.match(/^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/);
  if (match) return { r: +match[1], g: +match[2], b: +match[3], a: +match[4] };
  fail(`${label}: unexpected color value "${text}"`);
}

// Map of scheme name -> Map of token name -> {r, g, b, a}, in the order of
// tokens.scheme-names() ("default" first).
export function loadSchemes() {
  let css;
  try {
    css = sass.compileString(PROBE, { loadPaths: [SRC], style: "expanded", fatalDeprecations: ["import"] }).css;
  } catch (error) {
    fail(`cannot read the tokens from src/_tokens.scss:\n${error.message}`);
  }
  const schemes = new Map();
  for (const [, name, body] of css.matchAll(/\.gate--([a-z0-9-]+)\s*\{([^}]*)\}/g)) {
    const tokens = new Map();
    for (const [, token, value] of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
      tokens.set(token, parseColor(value.trim(), `${name} --${token}`));
    }
    schemes.set(name, tokens);
  }
  if (!schemes.has("default")) fail("the Sass probe returned no default scheme");
  return schemes;
}

// --- WCAG 2.x --------------------------------------------------------------

function channel(value) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance({ r, g, b }) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

// A translucent foreground painted over an opaque surface.
export function composite(fg, bg) {
  const mix = (f, b) => f * fg.a + b * (1 - fg.a);
  return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b), a: 1 };
}

export function contrast(fg, bg) {
  if (bg.a !== 1) throw new Error("contrast needs an opaque surface");
  const a = luminance(fg.a === 1 ? fg : composite(fg, bg));
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function hex({ r, g, b, a }) {
  const h = [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
  return a === 1 ? `#${h}` : `#${h} at ${Math.round(a * 100)}%`;
}

// --- Gate ------------------------------------------------------------------

function measure(tokens, scheme, { fg, bg }) {
  const pick = (name) => tokens.get(name) ?? fail(`${scheme}: no color token --ravnus-${name}`);
  const fgColor = pick(fg);
  const bgColor = pick(bg);
  if (bgColor.a !== 1) fail(`${scheme}: surface --ravnus-${bg} is not opaque (${hex(bgColor)})`);
  return { fg, bg, fgColor, bgColor, ratio: contrast(fgColor, bgColor) };
}

export function runGate(schemes) {
  const results = [];
  for (const [scheme, tokens] of schemes) {
    for (const pair of PAIRS) {
      const options = (pair.anyOf ?? [pair]).map((option) => measure(tokens, scheme, option));
      const best = options.reduce((a, b) => (b.ratio > a.ratio ? b : a));
      results.push({ scheme, rule: pair.rule, min: pair.min, options, best, pass: best.ratio >= pair.min });
    }
  }
  return results;
}

function describe({ fg, bg, fgColor, bgColor, ratio }) {
  return `${ratio.toFixed(2).padStart(5)}  ${fg} ${hex(fgColor)} on ${bg} ${hex(bgColor)}`;
}

function report(schemes, results, verbose) {
  const lines = [`Contrast gate (DESIGN.md 6.6, WCAG 2.x): ${PAIRS.length} pairs x ${schemes.size} schemes`];
  for (const scheme of schemes.keys()) {
    const own = results.filter((result) => result.scheme === scheme);
    const failed = own.filter((result) => !result.pass);
    const lowest = own.reduce((a, b) => (b.best.ratio / b.min < a.best.ratio / a.min ? b : a));
    const margin = `closest: ${lowest.best.fg} on ${lowest.best.bg} ${lowest.best.ratio.toFixed(2)} (min ${lowest.min})`;
    lines.push(`  ${scheme.padEnd(20)} ${failed.length ? `FAIL ${failed.length}` : "ok"}  ${margin}`);
    for (const result of verbose ? own : failed) {
      const mark = result.pass ? "  pass" : "  FAIL";
      lines.push(`    ${mark}  min ${String(result.min).padEnd(3)}  ${describe(result.best)}  [${result.rule}]`);
      if (!result.pass && result.options.length > 1) {
        for (const option of result.options) lines.push(`             or  ${describe(option)}`);
      }
    }
  }
  const failures = results.filter((result) => !result.pass).length;
  lines.push(
    failures
      ? `${failures} of ${results.length} checks are below their minimum. Fix the token values in src/_tokens.scss.`
      : `All ${results.length} checks pass.`,
  );
  return { text: lines.join("\n"), failures };
}

function main(args) {
  const verbose = args.includes("--verbose");
  const unknown = args.filter((arg) => arg !== "--verbose");
  if (unknown.length) fail(`unknown argument ${unknown.join(" ")} (usage: contrast-gate.mjs [--verbose])`);
  const schemes = loadSchemes();
  const { text, failures } = report(schemes, runGate(schemes), verbose);
  console.log(text);
  if (failures) process.exitCode = 1;
}

const invokedDirectly = process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof GateError ? `contrast-gate: ${error.message}` : error);
    process.exitCode = 1;
  }
}
