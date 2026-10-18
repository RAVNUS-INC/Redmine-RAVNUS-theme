#!/usr/bin/env node
// Theme build. Node built-ins and the sass devDependency.
//
// Usage:
//   npm run build    node src/tools/build.mjs           compile once
//   npm run watch    node src/tools/build.mjs --watch   compile, then again after
//                                                      every .scss change under src/
//
// Compiles src/application.scss into stylesheets/application.css with the
// options the theme relies on (CLAUDE.md):
//   - expanded style, no source map;
//   - charset off: non-ASCII input would otherwise put @charset above the
//     core @import, which must stay the first rule;
//   - the Sass @import deprecation is fatal: modules use @use and @forward only.
// The output is the Sass CLI output byte for byte (CSS plus a final newline).
//
// The file is written only after a successful compile. On an error, such as
// the sRGB guard in src/_tokens.scss, the committed CSS stays as it was and
// the exit status is 1. The Sass CLI would instead replace the file with an
// error stylesheet, or delete it with --no-error-css.

import { realpathSync, watch } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC = join(ROOT, "src");
const ENTRY = join(SRC, "application.scss");
const OUTPUT = join(ROOT, "stylesheets", "application.css");
const SASS_OPTIONS = { style: "expanded", charset: false, sourceMap: false, fatalDeprecations: ["import"] };

const WATCH_DELAY_MS = 100;

// Compiled CSS as the build writes it. Throws on a Sass error.
function compileTheme() {
  return sass.compile(ENTRY, SASS_OPTIONS).css + "\n";
}

// Compile and write. Returns true on success; reports the error otherwise.
async function build() {
  let css;
  try {
    css = compileTheme();
  } catch (error) {
    if (!(error instanceof sass.Exception)) throw error;
    console.error(`build: ${relative(ROOT, OUTPUT)} left unchanged.\n${error.message}`);
    return false;
  }
  await writeFile(OUTPUT, css);
  return true;
}

function watchSources() {
  let timer = null;
  const rebuild = async () => {
    if (await build()) console.log(`[${new Date().toLocaleTimeString()}] compiled ${relative(ROOT, OUTPUT)}`);
  };
  watch(SRC, { recursive: true }, (_event, filename) => {
    if (filename && !filename.endsWith(".scss")) return;
    clearTimeout(timer);
    timer = setTimeout(rebuild, WATCH_DELAY_MS);
  });
  console.log(`build: watching ${relative(ROOT, SRC)}/ for .scss changes (Ctrl-C to stop)`);
}

async function main(args) {
  if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    console.log("Usage: node src/tools/build.mjs [--watch]");
    return 0;
  }
  if (args.length > 1 || (args.length === 1 && args[0] !== "--watch")) {
    console.error(`build: unknown arguments: ${args.join(" ")} (see --help)`);
    return 2;
  }
  const ok = await build();
  if (args[0] === "--watch") {
    if (ok) console.log(`[${new Date().toLocaleTimeString()}] compiled ${relative(ROOT, OUTPUT)}`);
    watchSources();
    return null;
  }
  return ok ? 0 : 1;
}

const invokedDirectly = process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main(process.argv.slice(2)).then(
    (code) => {
      if (code !== null) process.exitCode = code;
    },
    (error) => {
      console.error(`build: ${error.stack}`);
      process.exitCode = 1;
    },
  );
}
