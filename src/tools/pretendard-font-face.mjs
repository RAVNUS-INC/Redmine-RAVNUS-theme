#!/usr/bin/env node
// Pretendard CDN @font-face generator (DESIGN.md 4.4). Node built-ins only.
//
// Usage:
//   npm run fonts                                   regenerate src/_pretendard.scss (network)
//   node src/tools/pretendard-font-face.mjs --print-meta
//                                                   print expectations as JSON (no network)
//
// Generation:
//   1. Fetch the dynamic-subset stylesheet of the pinned version from jsDelivr.
//   2. Validate its format strictly; anything unexpected is an error.
//   3. Resolve each relative src url() against the stylesheet URL into an
//      absolute, unquoted URL under PRETENDARD_PREFIX. Every other byte stays
//      as upstream wrote it (header comment, family, style, display, weight,
//      unicode-range, format string).
//   4. Check that the rule count matches upstream, that every URL starts with
//      the pinned prefix, and that every URL answers 200 font/woff2.
//   5. Write src/_pretendard.scss. Output depends only on the upstream bytes.
//      Its header records the version, the rule count and the SHA-256 of the
//      rules below it, so readers can tell a hand edit from generator output.
//
// Other scripts (CI font check, probes) import the exports below instead of
// reading DESIGN.md, so bumping PRETENDARD_VERSION needs no other edit.

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { realpathSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// The only place the pinned Pretendard version lives.
export const PRETENDARD_VERSION = "1.3.9";
export const PRETENDARD_PREFIX = `https://cdn.jsdelivr.net/npm/pretendard@${PRETENDARD_VERSION}/`;
export const UPSTREAM_CSS_URL = `${PRETENDARD_PREFIX}dist/web/variable/pretendardvariable-dynamic-subset.css`;
export const FONT_FAMILY = "Pretendard Variable";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const GENERATED_FILE = join(ROOT, "src", "_pretendard.scss");

// Declarations every upstream rule must carry. Values are compared after
// trimming; src and unicode-range are checked by pattern below.
const FIXED_DECLARATIONS = {
  "font-style": "normal",
  "font-display": "swap",
  "font-weight": "45 920",
};
const REQUIRED_PROPERTIES = ["font-family", ...Object.keys(FIXED_DECLARATIONS), "src", "unicode-range"];
const SRC_PATTERN = /^url\((['"]?)([^'"()\s]+)\1\)\s+format\((['"])woff2-variations\3\)$/;
const RANGE_ITEM = String.raw`U\+[0-9a-fA-F?]{1,6}(?:-[0-9a-fA-F]{1,6})?`;
const UNICODE_RANGE_PATTERN = new RegExp(`^${RANGE_ITEM}(?:\\s*,\\s*${RANGE_ITEM})*$`);
// Font URLs must be plain path segments under the prefix (no "..", query or
// characters that would need quoting) so they can be written unquoted.
const FONT_PATH_PATTERN = /^(?:[A-Za-z0-9_-][A-Za-z0-9._-]*\/)*[A-Za-z0-9_-][A-Za-z0-9._-]*\.woff2$/;

const FETCH_TIMEOUT_MS = 30_000;
const URL_CHECK_CONCURRENCY = 8;

class GeneratorError extends Error {}

function fail(message) {
  throw new GeneratorError(message);
}

// Remove /* */ comments and whole-line // comments (SCSS). Inline // is kept
// because it appears inside https:// URLs.
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
}

// Number of @font-face rules in CSS or SCSS text, comments excluded.
export function countFontFaceRules(text) {
  return (stripComments(text).match(/@font-face\s*\{/g) ?? []).length;
}

// url() targets of @font-face rules in CSS or SCSS text, in source order,
// with quotes removed. Comments are excluded.
export function fontFaceUrls(text) {
  const urls = [];
  for (const [block] of stripComments(text).matchAll(/@font-face\s*\{[^{}]*\}/g)) {
    for (const match of block.matchAll(/url\(\s*(['"]?)([^'")]+?)\1\s*\)/g)) urls.push(match[2]);
  }
  return urls;
}

// SHA-256 (hex) of a string's UTF-8 bytes.
function sha256Hex(text) {
  return createHash("sha256").update(text).digest("hex");
}

// Split generated text into the generator header (the leading // lines) and
// the rules below it.
function splitGenerated(text) {
  const lines = text.split("\n");
  let end = 0;
  while (end < lines.length && lines[end].startsWith("//")) end++;
  return { header: lines.slice(0, end).join("\n"), body: lines.slice(end).join("\n") };
}

// Expectations read from the repository only (no network): the pinned version
// and prefix from this module, and the rule count and URLs from the committed
// generated file. Throws if the generated file is missing, stale relative to
// PRETENDARD_VERSION, or edited by hand: the text below the header must match
// the SHA-256 the generator recorded in it, and the rule count and URL prefix
// are checked as well.
export async function readGeneratedMeta(file = GENERATED_FILE) {
  const where = relative(ROOT, file);
  const raw = await readFile(file, "utf8").catch((error) => {
    if (error.code === "ENOENT") fail(`${where} is missing; run \`npm run fonts\``);
    throw error;
  });
  // The generator writes LF; a checkout may have converted line endings.
  const text = raw.replace(/\r\n?/g, "\n");
  const { header: headerText, body } = splitGenerated(text);
  const version = headerText.match(/^\/\/ Pretendard version: (\S+)$/m)?.[1];
  const recordedCount = Number(headerText.match(/^\/\/ Rules: (\d+) @font-face$/m)?.[1]);
  const recordedSha256 = headerText.match(/^\/\/ Rules SHA-256: ([0-9a-f]{64})$/m)?.[1];
  if (!version || !Number.isInteger(recordedCount) || !recordedSha256) {
    fail(`${where} has no complete generator header; run \`npm run fonts\``);
  }
  if (version !== PRETENDARD_VERSION) {
    fail(`${where} was generated for ${version} but PRETENDARD_VERSION is ${PRETENDARD_VERSION}; run \`npm run fonts\``);
  }
  if (sha256Hex(body) !== recordedSha256) {
    fail(`${where} differs from the generator output recorded in its header (edited by hand?); run \`npm run fonts\``);
  }
  const ruleCount = countFontFaceRules(text);
  const urls = fontFaceUrls(text);
  if (ruleCount !== recordedCount) fail(`${where} has ${ruleCount} @font-face rules but its header records ${recordedCount}`);
  if (urls.length !== ruleCount) fail(`${where} has ${urls.length} font URLs for ${ruleCount} rules`);
  const outside = urls.filter((url) => !url.startsWith(PRETENDARD_PREFIX));
  if (outside.length) fail(`${where} has URLs outside ${PRETENDARD_PREFIX}: ${outside.join(", ")}`);
  return {
    version: PRETENDARD_VERSION,
    prefix: PRETENDARD_PREFIX,
    sourceUrl: UPSTREAM_CSS_URL,
    family: FONT_FAMILY,
    file: where,
    ruleCount,
    urls,
  };
}

async function fetchChecked(url, init = {}) {
  let response;
  try {
    response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), ...init });
  } catch (error) {
    fail(`${init.method ?? "GET"} ${url} failed: ${error.cause?.message ?? error.message}`);
  }
  return response;
}

async function fetchUpstream() {
  const response = await fetchChecked(UPSTREAM_CSS_URL);
  const type = response.headers.get("content-type") ?? "";
  if (response.status !== 200) fail(`GET ${UPSTREAM_CSS_URL} -> ${response.status} (expected 200)`);
  if (!/^text\/css\b/.test(type)) fail(`GET ${UPSTREAM_CSS_URL} -> content-type "${type}" (expected text/css)`);
  return Buffer.from(await response.arrayBuffer());
}

function parseDeclarations(body, label) {
  const declarations = new Map();
  const parts = body.split(";");
  if (parts.pop().trim() !== "") fail(`${label}: last declaration is not terminated by ";"`);
  for (const part of parts) {
    const match = part.match(/^\s*([a-z-]+)\s*:\s*([^]*?)\s*$/);
    if (!match) fail(`${label}: unexpected declaration "${part.trim()}"`);
    const [, property, value] = match;
    if (declarations.has(property)) fail(`${label}: duplicate ${property}`);
    if (!REQUIRED_PROPERTIES.includes(property)) fail(`${label}: unexpected property ${property}`);
    declarations.set(property, value);
  }
  for (const property of REQUIRED_PROPERTIES) {
    if (!declarations.has(property)) fail(`${label}: missing ${property}`);
  }
  return declarations;
}

// Validate one upstream @font-face block and return it with its src url()
// replaced by the absolute URL.
function rewriteRule(block, index) {
  const label = `upstream @font-face #${index}`;
  const body = block.slice(block.indexOf("{") + 1, -1);
  const declarations = parseDeclarations(body, label);

  const family = declarations.get("font-family");
  if (family !== `'${FONT_FAMILY}'` && family !== `"${FONT_FAMILY}"`) {
    fail(`${label}: font-family is ${family} (expected "${FONT_FAMILY}")`);
  }
  for (const [property, expected] of Object.entries(FIXED_DECLARATIONS)) {
    const actual = declarations.get(property);
    if (actual !== expected) fail(`${label}: ${property} is "${actual}" (expected "${expected}")`);
  }
  if (!UNICODE_RANGE_PATTERN.test(declarations.get("unicode-range"))) {
    fail(`${label}: unexpected unicode-range "${declarations.get("unicode-range")}"`);
  }
  const src = declarations.get("src").match(SRC_PATTERN);
  if (!src) fail(`${label}: unexpected src "${declarations.get("src")}"`);

  const url = new URL(src[2], UPSTREAM_CSS_URL).href;
  if (!url.startsWith(PRETENDARD_PREFIX) || !FONT_PATH_PATTERN.test(url.slice(PRETENDARD_PREFIX.length))) {
    fail(`${label}: ${src[2]} resolves to ${url}, not a plain .woff2 path under ${PRETENDARD_PREFIX}`);
  }
  const urlCalls = block.match(/url\(/g).length;
  if (urlCalls !== 1) fail(`${label}: ${urlCalls} url() calls (expected 1)`);
  return { css: block.replace(/url\([^)]*\)/, `url(${url})`), url };
}

// Split the upstream stylesheet into whitespace, comments and @font-face
// blocks. Any other construct means the upstream format changed.
function transform(upstream) {
  const token = /\s+|\/\*[\s\S]*?\*\/|@font-face\s*\{[^{}]*\}/y;
  const pieces = [];
  const urls = [];
  let headerComment = null;
  let markers = 0;
  while (token.lastIndex < upstream.length) {
    const start = token.lastIndex;
    const match = token.exec(upstream);
    if (!match) {
      const line = upstream.slice(0, start).split("\n").length;
      fail(`unexpected upstream content at line ${line}: ${JSON.stringify(upstream.slice(start, start + 60))}`);
    }
    const [text] = match;
    if (text.startsWith("@font-face")) {
      const rule = rewriteRule(text, urls.length);
      pieces.push(rule.css);
      urls.push(rule.url);
    } else {
      if (text.startsWith("/*")) {
        const marker = text.match(/^\/\* \[(\d+)\] \*\/$/);
        if (marker) {
          if (Number(marker[1]) !== urls.length) fail(`upstream marker ${text} precedes rule #${urls.length}`);
          markers++;
        } else if (headerComment === null && urls.length === 0) {
          headerComment = text;
        } else {
          fail(`unexpected upstream comment: ${JSON.stringify(text.slice(0, 60))}`);
        }
      }
      pieces.push(text);
    }
  }
  if (urls.length === 0) fail("upstream stylesheet has no @font-face rules");
  if (markers !== urls.length) fail(`upstream has ${markers} [n] markers for ${urls.length} rules`);
  if (!headerComment || !/Reserved Font Name Pretendard/.test(headerComment) || !/Open Font License/.test(headerComment)) {
    fail("upstream header comment with the copyright and OFL notice is missing");
  }
  if (new Set(urls).size !== urls.length) fail("upstream rules share a font URL");
  return { css: pieces.join("").trimEnd() + "\n", urls };
}

async function checkFontUrls(urls) {
  const failures = [];
  const queue = [...urls];
  async function worker() {
    for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
      try {
        const response = await fetchChecked(url, { method: "HEAD" });
        const type = response.headers.get("content-type") ?? "";
        if (response.status !== 200 || type.split(";")[0].trim() !== "font/woff2") {
          failures.push(`${url} -> ${response.status} "${type}"`);
        }
      } catch (error) {
        failures.push(error.message);
      }
    }
  }
  await Promise.all(Array.from({ length: URL_CHECK_CONCURRENCY }, worker));
  if (failures.length) fail(`font URL check failed (expected 200 font/woff2):\n  ${failures.sort().join("\n  ")}`);
}

function header(count, sha256, rulesSha256) {
  return [
    "// GENERATED FILE. DO NOT EDIT BY HAND.",
    "// Regenerate with `npm run fonts` (src/tools/pretendard-font-face.mjs), then",
    "// run `npm run build` and commit this file with stylesheets/application.css.",
    "// To move to another Pretendard release, change PRETENDARD_VERSION in the",
    "// generator; nothing else stores the version (DESIGN.md 4.4).",
    "//",
    `// Pretendard version: ${PRETENDARD_VERSION}`,
    `// Source: ${UPSTREAM_CSS_URL}`,
    `// Source SHA-256: ${sha256}`,
    `// Rules: ${count} @font-face`,
    `// Rules SHA-256: ${rulesSha256}`,
    "//",
    "// Below is the upstream stylesheet verbatim, except that each relative src",
    `// url() is resolved to an absolute URL under ${PRETENDARD_PREFIX}`,
    "//",
    "// License: Pretendard is licensed under the SIL Open Font License 1.1 with",
    "// the Reserved Font Name \"Pretendard\" (upstream notice below, kept in the",
    "// compiled CSS). The theme ships no font files: these rules point at the",
    "// unmodified dynamic-subset files of the upstream release. Never subset or",
    "// modify them here. A self-hosted copy uses its own family alias without",
    "// the reserved name and keeps the upstream OFL text next to the files.",
    "",
  ].join("\n");
}

async function generate() {
  const raw = await fetchUpstream();
  const sha256 = createHash("sha256").update(raw).digest("hex");
  const upstream = raw.toString("utf8").replace(/\r\n?/g, "\n");
  if (/[^\x09\x0a\x20-\x7e]/.test(upstream)) fail("upstream stylesheet has non-ASCII or control characters");

  const { css, urls } = transform(upstream);
  const upstreamCount = countFontFaceRules(upstream);
  const outputCount = countFontFaceRules(css);
  if (outputCount !== upstreamCount || urls.length !== upstreamCount) {
    fail(`rule count mismatch: upstream ${upstreamCount}, parsed ${urls.length}, output ${outputCount}`);
  }
  const outputUrls = fontFaceUrls(css);
  if (outputUrls.length !== urls.length || outputUrls.some((url, i) => url !== urls[i])) {
    fail("output URLs differ from the resolved URLs");
  }

  await checkFontUrls(urls);

  const content = header(outputCount, sha256, sha256Hex(css)) + css;
  if (splitGenerated(content).body !== css) fail("the rules start with a // line, so the header cannot be told apart");
  const previous = await readFile(GENERATED_FILE, "utf8").catch(() => null);
  if (previous !== content) await writeFile(GENERATED_FILE, content);
  const state = previous === content ? "unchanged" : "written";
  console.log(
    `${relative(ROOT, GENERATED_FILE)} ${state}: Pretendard ${PRETENDARD_VERSION}, ` +
      `${outputCount} @font-face rules, ${urls.length} URLs answered 200 font/woff2`,
  );
}

async function main(args) {
  if (args.length === 0) return generate();
  if (args.length === 1 && args[0] === "--print-meta") {
    console.log(JSON.stringify(await readGeneratedMeta(), null, 2));
    return;
  }
  if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    console.log("Usage: node src/tools/pretendard-font-face.mjs [--print-meta]");
    return;
  }
  fail(`unknown arguments: ${args.join(" ")} (see --help)`);
}

const invokedDirectly = process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(`pretendard-font-face: ${error instanceof GeneratorError ? error.message : error.stack}`);
    process.exitCode = 1;
  });
}
