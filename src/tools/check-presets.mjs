#!/usr/bin/env node
// Preset block checks for the READMEs (DESIGN.md 6.3, 10.2 item 6).
// Node built-ins only. No network.
//
// Usage:
//   npm run check:presets                        check README.md and README.ko.md
//   node src/tools/check-presets.mjs --write <dir>
//                                                write each preset as <dir>/<slug>.css
//                                                (for the probe's --inject-css)
//
// The expected blocks come from the compiled stylesheets/application.css,
// whose preset comments the build writes from the preset data in
// src/_tokens.scss with the derived colors computed as literals (5.4). A README
// block starts with a `/* RAVNUS preset: <slug> */` line followed by a :root
// block.
//
// Checks, for each README:
//   1. Every chrome preset (Ink, Brand-forward, Calm, Redmine Blue) has a block.
//   2. Every block names a preset of the compiled file and has the same
//      declarations in the same order, so the derived literals equal the
//      values Sass computed.
//   3. No block contains color-mix(): a user :root block has no fallback for
//      browsers without it.
//
// Exit status: 0 when every check passes, 1 otherwise, 2 on usage errors.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const COMPILED_FILE = join(ROOT, "stylesheets", "application.css");
const READMES = ["README.md", "README.ko.md"];
const REQUIRED = ["ink", "brand-forward", "calm", "redmine-blue"];

const slugOf = (title) =>
  title
    .replace(/\s*\([A-Z]\)$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const declarationsOf = (block) =>
  block
    .split("\n")
    .map((line) => line.replace(/\/\*.*?\*\//g, "").trim())
    .filter((line) => line.startsWith("--"));

// Preset comments of the compiled file: "Preset: <title>. <about>" followed by
// a " * :root { ... * }" block.
export async function compiledPresets(file = COMPILED_FILE) {
  const css = (await readFile(file, "utf8")).replace(/\r\n/g, "\n");
  const presets = new Map();
  const pattern = /\/\*\n \* Preset: ([^.\n]+)\.[^\n]*\n((?: \*[^\n]*\n)+?) \*\/\n/g;
  for (const [, title, body] of css.matchAll(pattern)) {
    const lines = body.split("\n").map((line) => line.replace(/^ \* ?/, ""));
    const block = lines.join("\n").trim();
    presets.set(slugOf(title), { title, block, declarations: declarationsOf(block) });
  }
  return presets;
}

export function readmeBlocks(markdown) {
  markdown = markdown.replace(/\r\n/g, "\n");
  const blocks = [];
  const pattern = /```css\n\/\* RAVNUS preset: ([a-z0-9-]+) \*\/\n([\s\S]*?)```/g;
  for (const [, slug, block] of markdown.matchAll(pattern)) {
    blocks.push({ slug, block, declarations: declarationsOf(block) });
  }
  return blocks;
}

async function check() {
  const presets = await compiledPresets();
  const problems = [];
  if (presets.size === 0) problems.push("no preset comments in stylesheets/application.css");
  for (const name of READMES) {
    const markdown = await readFile(join(ROOT, name), "utf8");
    const blocks = readmeBlocks(markdown);
    const seen = new Set(blocks.map((b) => b.slug));
    for (const slug of REQUIRED) {
      if (!seen.has(slug)) problems.push(`${name}: no block for the ${slug} preset`);
    }
    for (const { slug, block, declarations } of blocks) {
      if (/color-mix\(/i.test(block)) problems.push(`${name}: the ${slug} block contains color-mix()`);
      // The whole block, comments aside, must be one :root rule of declarations.
      const shape = block.replace(/\/\*[\s\S]*?\*\//g, "").trim();
      if (!/^:root \{\n(?:\s+--[\w-]+: [^;\n{}]+;\n)+\}$/.test(shape)) {
        problems.push(`${name}: the ${slug} block is not a single :root { --token: value; … } rule`);
      }
      const preset = presets.get(slug);
      if (!preset) {
        problems.push(`${name}: unknown preset ${slug}`);
        continue;
      }
      const want = preset.declarations.join("\n");
      const got = declarations.join("\n");
      if (want !== got) {
        problems.push(`${name}: the ${slug} block differs from the compiled preset\n  expected:\n    ${preset.declarations.join("\n    ")}\n  got:\n    ${declarations.join("\n    ")}`);
      }
    }
    console.log(`${problems.length ? "    " : "ok  "} ${name}: ${blocks.length} preset block(s) (${[...seen].join(", ")})`);
  }
  for (const problem of problems) console.log(`FAIL ${problem}`);
  if (problems.length) {
    console.log(`check-presets: ${problems.length} problem(s)`);
    process.exitCode = 1;
  } else {
    console.log("check-presets: README preset blocks match the compiled presets");
  }
}

async function write(dir) {
  await mkdir(dir, { recursive: true });
  for (const [slug, { block }] of await compiledPresets()) {
    await writeFile(join(dir, `${slug}.css`), `${block}\n`);
    console.log(join(dir, `${slug}.css`));
  }
}

// Compare real paths: a checkout reached through a symlink would otherwise
// skip every check and exit 0.
if (process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])) {
  const [flag, dir] = process.argv.slice(2);
  if (flag === "--write" && dir) await write(dir);
  else if (flag === undefined) await check();
  else {
    console.error("Usage: node src/tools/check-presets.mjs [--write <dir>]");
    process.exitCode = 2;
  }
}
