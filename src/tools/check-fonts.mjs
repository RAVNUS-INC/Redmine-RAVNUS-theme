#!/usr/bin/env node
// Font checks for the compiled theme stylesheet (DESIGN.md 10.2 item 6).
// Node built-ins only. No network.
//
// Usage:
//   npm run check:fonts                          check stylesheets/application.css
//   node src/tools/check-fonts.mjs [file]        check another compiled file
//   node src/tools/check-fonts.mjs --served <file>
//                                                check a stylesheet as Redmine serves it
//                                                (import targets rewritten to /assets/...-<digest>.css)
//
// Expectations come from the repository, never from DESIGN.md: the pinned URL
// prefix from PRETENDARD_VERSION in the font generator, and the rule count and
// URL list from the generated src/_pretendard.scss. Bumping Pretendard needs no
// edit here. Check 1 fails when that file was edited by hand (its rules no
// longer match the SHA-256 in its generator header).
//
// Checks (comments are ignored everywhere):
//   1. The compiled CSS has as many CDN @font-face rules (rules with a url())
//      as the generated file, with the same URLs in the same order.
//   2. Every url() in every @font-face rule starts with the pinned prefix.
//   3. No @import loads an external (http, https or protocol-relative) stylesheet.
//   4. The first two rules are the core import, then the custom.css import,
//      both in url() form and without media, layer or supports conditions.
//   5. "Pretendard Variable" (any quotes, any case, CSS escapes decoded)
//      appears only in @font-face font-family descriptors and in the values of
//      the four font stack tokens. Any other use would keep requesting CDN
//      fonts after a user swaps the stacks to self-hosted or system fonts.
//
// Exit status: 0 when every check passes, 1 otherwise, 2 on usage errors.
// The checks are exported so the probe harness can run them on served CSS.

import { readFile } from "node:fs/promises";
import { realpathSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FONT_FAMILY, GENERATED_FILE, PRETENDARD_PREFIX, readGeneratedMeta } from "./pretendard-font-face.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const COMPILED_FILE = join(ROOT, "stylesheets", "application.css");

// The only tokens allowed to name the CDN family (DESIGN.md 7.1).
export const FONT_STACK_TOKENS = [
  "--ravnus-font-sans",
  "--ravnus-font-sans-ja",
  "--ravnus-font-sans-zh",
  "--ravnus-font-sans-zh-tw",
];

// Import targets as written in the source, and as Redmine rewrites them at
// boot (optionally under a sub-URI).
const IMPORTS = [
  {
    label: "core import",
    source: "../../../stylesheets/application.css",
    served: /(?:^|\/)assets\/application-[0-9a-f]+\.css$/,
  },
  {
    label: "custom.css import",
    source: "custom.css",
    served: /(?:^|\/)assets\/themes\/[^/]+\/custom-[0-9a-f]+\.css$/,
  },
];

// At-rules whose block holds rules; every other block holds declarations.
const RULE_LIST_AT_RULES = new Set([
  "media",
  "supports",
  "layer",
  "container",
  "document",
  "-moz-document",
  "scope",
  "starting-style",
  "keyframes",
  "-webkit-keyframes",
]);

const FAMILY_PATTERN = new RegExp(FONT_FAMILY.split(/\s+/).join("\\s+"), "gi");
const EXTERNAL_URL = /^(?:https?:)?\/\//i;
const MAX_LISTED = 10;

// ---------- lexing helpers ----------

// End index (exclusive) of the string starting at i. A raw newline ends a
// string early, as in the CSS tokenizer.
function skipString(text, i) {
  const quote = text[i];
  let j = i + 1;
  while (j < text.length) {
    const c = text[j];
    if (c === "\\") j += 2;
    else if (c === quote) return j + 1;
    else if (c === "\n") return j;
    else j++;
  }
  return text.length;
}

// End index (exclusive) of an unquoted url( ... ) starting at i, or 0.
function unquotedUrlEnd(text, i) {
  if ((text[i] !== "u" && text[i] !== "U") || !/^url\(/i.test(text.slice(i, i + 4))) return 0;
  if (i > 0 && /[-\w\\]/.test(text[i - 1])) return 0;
  let j = i + 4;
  while (j < text.length && /\s/.test(text[j])) j++;
  if (text[j] === '"' || text[j] === "'") return 0;
  while (j < text.length && text[j] !== ")") j += text[j] === "\\" ? 2 : 1;
  return Math.min(j + 1, text.length);
}

// Replace comments with spaces, keeping newlines, so offsets and line numbers
// still match the file. Strings and unquoted url() bodies are left alone.
export function blankComments(text) {
  const parts = [];
  let from = 0;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === "/" && text[i + 1] === "*") {
      const close = text.indexOf("*/", i + 2);
      const stop = close === -1 ? text.length : close + 2;
      parts.push(text.slice(from, i), text.slice(i, stop).replace(/[^\n]/g, " "));
      from = i = stop;
    } else if (c === '"' || c === "'") {
      i = skipString(text, i);
    } else if (c === "\\") {
      i += 2;
    } else {
      i = unquotedUrlEnd(text, i) || i + 1;
    }
  }
  parts.push(text.slice(from));
  return parts.join("");
}

// First index in [i, end) holding one of `stops` outside strings, url() and
// () / [] groups (and {} groups when nestBraces). Returns end if none.
function scanTo(src, i, end, stops, nestBraces = false) {
  let depth = 0;
  while (i < end) {
    const c = src[i];
    if (c === '"' || c === "'") {
      i = skipString(src, i);
      continue;
    }
    if (c === "\\") {
      i += 2;
      continue;
    }
    const urlEnd = unquotedUrlEnd(src, i);
    if (urlEnd) {
      i = urlEnd;
      continue;
    }
    if (depth === 0 && stops.includes(c)) return i;
    if (c === "(" || c === "[" || (nestBraces && c === "{")) depth++;
    else if ((c === ")" || c === "]" || (nestBraces && c === "}")) && depth > 0) depth--;
    i++;
  }
  return end;
}

// Index of the "}" closing the block opened at `open`, or end if unterminated.
function matchingBrace(src, open, end) {
  let depth = 0;
  let i = open;
  while (i < end) {
    const c = src[i];
    if (c === '"' || c === "'") {
      i = skipString(src, i);
      continue;
    }
    if (c === "\\") {
      i += 2;
      continue;
    }
    const urlEnd = unquotedUrlEnd(src, i);
    if (urlEnd) {
      i = urlEnd;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return i;
    i++;
  }
  return end;
}

function skipWhitespace(src, i, end) {
  while (i < end) {
    if (/\s/.test(src[i])) i++;
    else if (src.startsWith("<!--", i)) i += 4;
    else if (src.startsWith("-->", i)) i += 3;
    else if (src[i] === "\uFEFF") i++;
    else break;
  }
  return i;
}

// Decode CSS escapes (\41, \ , \") so escaped spellings are found too.
function decodeEscapes(text) {
  return text.replace(/\\(?:([0-9a-fA-F]{1,6})[ \t\n\r\f]?|\n|([^\n]))/g, (_, hex, char) => {
    if (hex) {
      const code = parseInt(hex, 16);
      return code === 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff) ? "\uFFFD" : String.fromCodePoint(code);
    }
    return char ?? "";
  });
}

// ---------- parsing ----------

function parseDeclarations(src, start, end) {
  const declarations = [];
  let i = start;
  while (i < end) {
    const stop = scanTo(src, i, end, ";", true);
    const first = skipWhitespace(src, i, stop);
    if (first < stop) {
      const colon = scanTo(src, first, stop, ":{");
      const isDeclaration = colon < stop && src[colon] === ":";
      declarations.push({
        property: isDeclaration ? src.slice(first, colon).trim() : null,
        value: (isDeclaration ? src.slice(colon + 1, stop) : src.slice(first, stop)).trim(),
        start: first,
      });
    }
    i = stop + 1;
  }
  return declarations;
}

function parseRules(src, start, end, errors) {
  const nodes = [];
  let i = start;
  for (;;) {
    i = skipWhitespace(src, i, end);
    if (i >= end) break;
    if (src[i] === "}") {
      errors.push({ offset: i, message: 'unmatched "}"' });
      i++;
      continue;
    }
    if (src[i] === "@") {
      const name = src.slice(i).match(/^@(-?[A-Za-z_][-\w]*)/)?.[1];
      if (!name) {
        errors.push({ offset: i, message: 'stray "@"' });
        i++;
        continue;
      }
      const nameEnd = i + 1 + name.length;
      const stop = scanTo(src, nameEnd, end, ";{}");
      const node = { kind: "at", name: name.toLowerCase(), prelude: src.slice(nameEnd, stop).trim(), start: i };
      if (stop >= end || src[stop] !== "{") {
        if (src[stop] !== ";") errors.push({ offset: i, message: `@${name} is not terminated by ";"` });
        node.end = stop < end && src[stop] === ";" ? stop + 1 : stop;
        nodes.push(node);
        i = node.end;
        continue;
      }
      const close = matchingBrace(src, stop, end);
      if (close >= end) errors.push({ offset: i, message: `@${name} block is not closed` });
      if (RULE_LIST_AT_RULES.has(node.name)) node.rules = parseRules(src, stop + 1, close, errors);
      else node.declarations = parseDeclarations(src, stop + 1, close);
      node.end = close + 1;
      nodes.push(node);
      i = node.end;
      continue;
    }
    const stop = scanTo(src, i, end, "{;}");
    if (stop >= end || src[stop] !== "{") {
      errors.push({ offset: i, message: "text outside any rule" });
      nodes.push({ kind: "junk", text: src.slice(i, stop).trim(), start: i, end: stop + 1 });
      i = src[stop] === "}" ? stop : stop + 1;
      continue;
    }
    const close = matchingBrace(src, stop, end);
    if (close >= end) errors.push({ offset: i, message: "rule block is not closed" });
    nodes.push({
      kind: "rule",
      selector: src.slice(i, stop).trim(),
      declarations: parseDeclarations(src, stop + 1, close),
      start: i,
      end: close + 1,
    });
    i = close + 1;
  }
  return nodes;
}

// Parse a stylesheet into top-level nodes. Comments are blanked first.
export function parseStylesheet(text) {
  const src = blankComments(text);
  const errors = [];
  const nodes = parseRules(src, 0, src.length, errors);
  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") lineStarts.push(i + 1);
  const lineOf = (offset) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
  return { src, nodes, errors, lineOf };
}

function* walk(nodes, parent = null) {
  for (const node of nodes) {
    yield { node, parent };
    if (node.rules) yield* walk(node.rules, node);
  }
}

// url() targets in a declaration value, quotes removed.
function urlsIn(value) {
  return [...value.matchAll(/(?<![-\w\\])url\(\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^)]*?))\s*\)/gi)].map(
    (m) => m[1] ?? m[2] ?? m[3],
  );
}

// { form: "url" | "string", target, condition } for an @import prelude, or null.
function parseImport(prelude) {
  const m = prelude.match(/^(?:url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s"']*))\s*\)|"([^"]*)"|'([^']*)')\s*([^]*)$/i);
  if (!m) return null;
  const isUrl = m[1] !== undefined || m[2] !== undefined || m[3] !== undefined;
  return { form: isUrl ? "url" : "string", target: m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5], condition: m[6].trim() };
}

function snippet(text, max = 70) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 3)}...` : flat;
}

function describe(node) {
  if (node.kind === "at") return `@${node.name} ${snippet(node.prelude, 60)}`.trim();
  if (node.kind === "rule") return `${snippet(node.selector, 60)} { ... }`;
  return snippet(node.text);
}

function listed(items) {
  const shown = items.slice(0, MAX_LISTED);
  if (items.length > MAX_LISTED) shown.push({ message: `... and ${items.length - MAX_LISTED} more` });
  return shown;
}

// ---------- checks ----------

// Run every check on stylesheet text. `meta` is readGeneratedMeta() output, or
// an Error when the expectations could not be read. Returns
// [{ title, ok, details: [{ message, line? }] }].
export function checkStylesheet(text, { meta, served = false } = {}) {
  const { src, nodes, errors, lineOf } = parseStylesheet(text);
  const results = [];
  const all = [...walk(nodes)];
  const fontFaces = all.filter(({ node }) => node.kind === "at" && node.name === "font-face").map(({ node }) => node);
  const imports = all.filter(({ node }) => node.kind === "at" && node.name === "import").map(({ node }) => node);

  if (errors.length) {
    results.push({
      title: "stylesheet parses",
      ok: false,
      details: listed(errors.map((e) => ({ message: e.message, line: lineOf(e.offset) }))),
    });
  }

  // 1. CDN @font-face count and URL list.
  const cdnFaces = fontFaces
    .map((node) => ({
      node,
      urls: node.declarations.flatMap((d) => (d.property ? urlsIn(d.value).map((url) => ({ url, line: lineOf(d.start) })) : [])),
    }))
    .filter((face) => face.urls.length > 0);
  const compiledUrls = cdnFaces.flatMap((face) => face.urls);
  {
    const title = "CDN @font-face rules match the generated file";
    const otherFaces = fontFaces.length - cdnFaces.length;
    const note = otherFaces ? ` (${otherFaces} other @font-face without url() not counted)` : "";
    if (meta instanceof Error || !meta) {
      results.push({
        title,
        ok: false,
        details: [{ message: `cannot read expectations: ${meta?.message ?? "no metadata"}` }],
      });
    } else {
      const details = [];
      if (cdnFaces.length !== meta.ruleCount) {
        details.push({ message: `found ${cdnFaces.length} @font-face rules with url(), expected ${meta.ruleCount} from ${meta.file}${note}` });
      }
      const urls = compiledUrls.map((u) => u.url);
      const same = urls.length === meta.urls.length && urls.every((url, i) => url === meta.urls[i]);
      if (!same) {
        const expected = new Set(meta.urls);
        const found = new Set(urls);
        const missing = meta.urls.filter((url) => !found.has(url));
        const extra = compiledUrls.filter((u) => !expected.has(u.url));
        if (missing.length === meta.urls.length && meta.urls.length > 0) {
          details.push({ message: `none of the ${meta.urls.length} generated URLs is present (is src/_pretendard.scss used by the entry?)` });
        } else {
          for (const url of listed(missing)) details.push({ message: url.message ?? `missing URL: ${url}` });
        }
        for (const u of listed(extra)) details.push({ message: u.message ?? `unexpected URL: ${u.url}`, line: u.line });
        if (!missing.length && !extra.length) {
          const at = urls.findIndex((url, i) => url !== meta.urls[i]);
          details.push({ message: `same URLs in a different order or count; first difference at URL #${at + 1}`, line: compiledUrls[at]?.line });
        }
      }
      results.push({
        title,
        ok: details.length === 0,
        summary: `${cdnFaces.length} rules, ${urls.length} URLs (expected ${meta.ruleCount} from ${meta.file}, Pretendard ${meta.version})${note}`,
        details,
      });
    }
  }

  // 2. Every @font-face url() starts with the pinned prefix.
  {
    const outside = compiledUrls.filter((u) => !u.url.startsWith(PRETENDARD_PREFIX));
    results.push({
      title: `every font URL starts with ${PRETENDARD_PREFIX}`,
      ok: outside.length === 0,
      summary: `${compiledUrls.length} URLs checked`,
      details: listed(outside.map((u) => ({ message: u.message ?? `outside the prefix: ${u.url}`, line: u.line }))),
    });
  }

  // 3. No external stylesheet @import.
  {
    const details = [];
    for (const node of imports) {
      const parsed = parseImport(node.prelude);
      if (!parsed) details.push({ message: `cannot parse @import ${snippet(node.prelude)}`, line: lineOf(node.start) });
      else if (EXTERNAL_URL.test(parsed.target)) details.push({ message: `external @import: ${parsed.target}`, line: lineOf(node.start) });
    }
    results.push({ title: "no external @import", ok: details.length === 0, summary: `${imports.length} @import rules`, details });
  }

  // 4. The first two rules are the core import, then the custom.css import.
  {
    const details = [];
    IMPORTS.forEach((expected, index) => {
      const node = nodes[index];
      const want = served ? `@import url(<...>/${expected.source.split("/").pop().replace(".css", "-<digest>.css")})` : `@import url(${expected.source})`;
      const position = index === 0 ? "first" : "second";
      if (!node) {
        details.push({ message: `no ${position} rule; expected the ${expected.label} ${want}` });
        return;
      }
      const line = lineOf(node.start);
      const parsed = node.kind === "at" && node.name === "import" ? parseImport(node.prelude) : null;
      if (!parsed) {
        details.push({ message: `${position} rule is ${describe(node)}; expected the ${expected.label} ${want}`, line });
        return;
      }
      const targetOk = served ? expected.served.test(parsed.target) : parsed.target === expected.source;
      if (!targetOk) details.push({ message: `${position} rule imports ${parsed.target}; expected the ${expected.label} ${want}`, line });
      else if (parsed.form !== "url") details.push({ message: `${expected.label} uses a string; Redmine rewrites only url() imports`, line });
      else if (parsed.condition) details.push({ message: `${expected.label} has a condition "${parsed.condition}"`, line });
    });
    results.push({
      title: "first two rules are the core import, then the custom.css import",
      ok: details.length === 0,
      details,
    });
  }

  // 5. "Pretendard Variable" only in @font-face font-family and the four stacks.
  {
    const details = [];
    let inFaces = 0;
    let inTokens = 0;
    let inPieces = 0;
    const count = (text) => (decodeEscapes(text).match(FAMILY_PATTERN) ?? []).length;
    const flag = (n, where, offset) => {
      details.push({ message: `"${FONT_FAMILY}" in ${where}${n > 1 ? ` (${n} times)` : ""}`, line: lineOf(offset) });
    };
    for (const { node, parent } of all) {
      const context = parent ? ` inside ${describe(parent)}` : "";
      if (node.kind === "junk") {
        const n = count(node.text);
        inPieces += n;
        if (n) flag(n, "text outside any rule", node.start);
        continue;
      }
      const head = node.kind === "rule" ? node.selector : node.prelude;
      const headCount = count(head);
      inPieces += headCount;
      if (headCount) flag(headCount, `the ${node.kind === "rule" ? "selector" : `@${node.name} prelude`} of ${describe(node)}${context}`, node.start);
      for (const d of node.declarations ?? []) {
        const propertyCount = d.property ? count(d.property) : 0;
        const valueCount = count(d.value);
        inPieces += propertyCount + valueCount;
        if (propertyCount) flag(propertyCount, `the property name ${snippet(d.property, 40)} in ${describe(node)}`, d.start);
        if (!valueCount) continue;
        const property = d.property ?? "";
        if (node.kind === "at" && node.name === "font-face" && property.toLowerCase() === "font-family") inFaces += valueCount;
        else if (FONT_STACK_TOKENS.includes(property)) inTokens += valueCount;
        else flag(valueCount, d.property ? `${d.property} of ${describe(node)}${context}` : `"${snippet(d.value, 40)}" in ${describe(node)}`, d.start);
      }
    }
    const total = count(src);
    if (total !== inPieces) details.push({ message: `${total - inPieces} occurrence(s) the parser could not place` });
    results.push({
      title: `"${FONT_FAMILY}" appears only in @font-face and the four font stack tokens`,
      ok: details.length === 0,
      summary: `${inFaces} in @font-face font-family, ${inTokens} in font stack token values`,
      details: listed(details),
    });
  }

  return results;
}

// ---------- CLI ----------

function report(results, file) {
  const failed = results.filter((r) => !r.ok);
  for (const result of results) {
    console.log(`${result.ok ? "ok  " : "FAIL"}  ${result.title}${result.summary ? `: ${result.summary}` : ""}`);
    for (const detail of result.details) {
      console.log(`        ${detail.line ? `line ${detail.line}: ` : ""}${detail.message}`);
      if (!result.ok && process.env.GITHUB_ACTIONS === "true") {
        const where = detail.line ? `file=${file},line=${detail.line}` : `file=${file}`;
        console.log(`::error ${where}::${result.title}: ${detail.message.replace(/%/g, "%25").replace(/\r?\n/g, "%0A")}`);
      }
    }
  }
  console.log(failed.length ? `check-fonts: ${failed.length} of ${results.length} checks failed` : `check-fonts: all ${results.length} checks passed`);
  return failed.length === 0;
}

async function main(args) {
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node src/tools/check-fonts.mjs [--served] [file]  (default file: stylesheets/application.css)");
    return 0;
  }
  const served = args.includes("--served");
  const rest = args.filter((a) => a !== "--served");
  if (rest.length > 1 || rest.some((a) => a.startsWith("-"))) {
    console.error(`check-fonts: unknown arguments: ${rest.join(" ")} (see --help)`);
    return 2;
  }
  const file = rest[0] ? resolve(rest[0]) : COMPILED_FILE;
  const shown = relative(process.cwd(), file) || file;
  let text;
  try {
    text = await readFile(file, "utf8");
  } catch (error) {
    console.error(`check-fonts: cannot read ${shown}: ${error.code ?? error.message}${file === COMPILED_FILE ? " (run `npm run build`)" : ""}`);
    return 1;
  }
  const meta = await readGeneratedMeta().catch((error) => error);
  console.log(`check-fonts: ${shown}${served ? " (served form)" : ""}; expectations from ${relative(ROOT, GENERATED_FILE)} and PRETENDARD_VERSION`);
  return report(checkStylesheet(text, { meta, served }), relative(ROOT, file)) ? 0 : 1;
}

const invokedDirectly = process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main(process.argv.slice(2)).then(
    (code) => (process.exitCode = code),
    (error) => {
      console.error(`check-fonts: ${error.stack}`);
      process.exitCode = 1;
    },
  );
}
