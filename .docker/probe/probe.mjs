#!/usr/bin/env node
// RAVNUS probe harness (DESIGN.md 10.2 items 1, 3, 5 and 9).
//
// Opens Redmine pages in headless Google Chrome through playwright-core and
// writes one JSON report. playwright-core never downloads a browser; the probe
// uses the installed Chrome. Every run gets a fresh browser context (no cache,
// no cookies). For each page x viewport x locale x CDN mode it records:
//   - computed styles and boxes of selectors, and :root custom properties
//   - fonts Chrome actually used for each selector (CDP), document.fonts state
//   - font and stylesheet requests by host with bytes and Referer, CDN font
//     URLs outside the generated list, stylesheets that never finished
//   - first contentful paint, DOMContentLoaded and window load times
//   - horizontal page overflow and visible text under 12px (Gantt excluded)
//   - optional style assertions, axe-core results, screenshots, --eval output
// It also runs the font checks of src/tools/check-fonts.mjs on the RAVNUS
// theme CSS exactly as Redmine served it (import targets rewritten to
// /assets/...), also when a child theme imports it.
//
// Prerequisites
//   npm install            playwright-core and axe-core (devDependencies)
//   Google Chrome          or RAVNUS_PROBE_CHROME=/path/to/chrome (any Chromium build)
//   docker compose up -d   the repo test environment, http://127.0.0.1:3007
// Pretendard is loaded from the CDN, so runs that measure it need internet
// access; check fonts.cdn in the report before trusting font-dependent sizes.
//
// Examples
//   npm run probe                                    @core pages at 1440, 1024, 800px, ko UI
//   npm run probe -- --locales ko,ja,zh,zh-TW,en --out "$TMPDIR/ravnus-probe/typo.json" @core
//   npm run probe -- --block none,abort,hang --viewports 1440 /projects/website-renewal/issues
//   npm run probe -- --axe --axe-include '#top-menu' --axe-include '#header' --viewports 1440,800 /projects
//   npm run probe -- --assert 'input[type=text] => font-size = 14px' --assert 'body => line-height = /^\d/' @core
//   npm run probe -- --autologin --axe @admin
//   npm run probe -- --inject-css try.css --screenshot "$TMPDIR/ravnus-probe/shots" --full-page /issues/8
//
// Write --out and --screenshot outside the repository: they are not
// gitignored, and Redmine serves every top-level directory of a theme.
//
// Pages are positional: paths relative to --base-url, absolute URLs, or presets
//   @core    issue list, issue #8, wiki "타이포그래피_샘플", roadmap (default)
//   @admin   admin projects, users, roles (needs --autologin)
//
// Logged-in pages never use a password or the login form (DESIGN.md 10.1).
// --autologin runs, as the image's redmine user,
//   docker compose [-p <project>] -f docker-compose.yml exec -T -u redmine redmine bin/rails runner ...
// to create an autologin token for the admin user, sends it as the autologin
// cookie, and deletes the token when the probe ends (also on Ctrl-C). If
// Setting.autologin was off, it is set to 7 days for the run and restored
// afterwards. Pass --compose-project for an instance started with
// `docker compose -p <name>`, and do not run two logged-in probes against one
// instance at the same time. The token value is never printed or saved.
// With RAVNUS_PROBE_AUTOLOGIN_TOKEN=<value>, --autologin sends that existing
// token instead (no docker calls, no cleanup). report.probe.redmineVersion is
// filled only when the probe made the token itself.
//
// UI language: each --locales entry becomes the context locale, which sets
// Accept-Language and navigator.language. The seeded admin has no language
// preference, so logged-in pages follow it too.
//
// CDN modes (--block): none, abort (requests to --block-host fail at once),
// hang (they are never answered, like a network that drops packets; the probe
// navigates with waitUntil domcontentloaded, then waits up to --load-timeout
// for window load and does not wait for document.fonts.ready).
// --inject-css adds a <style> right after the theme <link> by rewriting the
// HTML response, so do not use it for timing measurements.
//
// Output: JSON on stdout, or to --out with a one-line summary on stdout.
// Progress goes to stderr. Exit status 0 when nothing failed; 1 when a run
// errored or had a problem (HTTP error, unexpected login redirect, page not
// linking the --theme-id stylesheet, autologin cookie not logged in, failed
// --assert, axe violation with --axe, CDN font URL outside the generated
// list, CDN request with --expect-no-cdn) or the served theme CSS failed a
// font check; 2 on usage errors.
//
// Location: .docker/ is a dot-directory, so Redmine never serves these files.
// docker-compose.yml mounts .docker/ read-only at /ravnus-dev for the seed
// script; the probe is not used inside the container.

import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { chromium } from "playwright-core";
import { checkStylesheet } from "../../src/tools/check-fonts.mjs";
import { PRETENDARD_PREFIX, readGeneratedMeta } from "../../src/tools/pretendard-font-face.mjs";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const COMPOSE_FILE = join(ROOT, "docker-compose.yml");

const PRESETS = {
  "@core": [
    "/projects/website-renewal/issues",
    "/issues/8",
    "/projects/website-renewal/wiki/타이포그래피_샘플",
    "/projects/website-renewal/roadmap",
  ],
  "@admin": ["/admin/projects", "/users", "/roles"],
};

const DEFAULT_SELECTORS = [
  "html",
  "body",
  "#top-menu",
  "#header",
  "#header h1",
  "#main-menu li a",
  "#sidebar",
  "#content h2",
  "#content p",
  "table.list th",
  "table.list td.subject",
  "div.wiki p",
  "div.wiki h1",
  "div.wiki pre",
  "input[type=text], input:not([type])",
  "select",
  "textarea",
  "input[type=submit], button",
];
const DEFAULT_PROPERTIES = [
  "font-family",
  "font-size",
  "line-height",
  "font-weight",
  "letter-spacing",
  "word-break",
  "overflow-wrap",
  "color",
  "background-color",
];
const DEFAULT_VARS = ["--fonts-main", "--ravnus-font-sans", "--ravnus-font-ui", "--color-current-marker"];

// ---------- options ----------

const OPTIONS = {
  "--base-url": { arg: "url", help: "Redmine base URL (default $RAVNUS_PROBE_BASE_URL or http://127.0.0.1:3007)" },
  "--viewports": { arg: "list", help: "widths or WxH (default 1440,1024,800; height 900)" },
  "--locales": { arg: "list", help: "UI languages via the context locale (default ko)" },
  "--block": { arg: "list", help: "CDN modes: none, abort, hang (default none)" },
  "--block-host": { arg: "host", help: "host for --block and CDN accounting (default: host of the pinned prefix)" },
  "--abort-code": { arg: "code", help: "Playwright abort error code for --block abort (default failed)" },
  "--expect-no-cdn": { flag: true, help: "fail a run that requests anything from the CDN host" },
  "--sel": { arg: "css", multi: true, help: "selector to measure; replaces the default list (repeatable)" },
  "--add-sel": { arg: "css", multi: true, help: "selector to measure in addition to the defaults (repeatable)" },
  "--prop": { arg: "name", multi: true, help: "extra computed property to record (repeatable)" },
  "--var": { arg: "--name", multi: true, help: "extra :root custom property to record (repeatable)" },
  "--max-elements": { arg: "n", help: "heights recorded per selector (default 20)" },
  "--assert": { arg: "'sel => prop = value'", multi: true, help: "every matching element must have this computed value; /regex/ allowed (repeatable)" },
  "--inject-css": { arg: "file", help: "inject this CSS in a <style> right after the theme <link>" },
  "--axe": { flag: true, help: "run axe-core rules (default color-contrast) and fail on violations" },
  "--axe-rules": { arg: "list", help: "axe rule ids (default color-contrast)" },
  "--axe-include": { arg: "css", multi: true, help: "limit axe to these regions (repeatable)" },
  "--screenshot": { arg: "dir", help: "save a PNG per run in this directory" },
  "--full-page": { flag: true, help: "full-page screenshots" },
  "--forced-colors": { flag: true, help: "emulate forced colors (Windows high contrast)" },
  "--eval": { arg: "js", help: "expression or function evaluated in the page; result in .eval" },
  "--eval-file": { arg: "file", help: "same as --eval, from a file" },
  "--autologin": { flag: true, help: "log in as admin with an autologin token made by rails runner" },
  "--autologin-user": { arg: "login", help: "user for --autologin (default admin)" },
  "--compose-project": { arg: "name", help: "docker compose project of the instance (default: compose default)" },
  "--cookie-name": { arg: "name", help: "autologin cookie name (default: from Redmine, else autologin)" },
  "--theme-id": { arg: "id", help: "theme every page must link, e.g. a child theme (default ravnus)" },
  "--load-timeout": { arg: "ms", help: "extra wait for window load after navigation (default 15000)" },
  "--fonts-timeout": { arg: "ms", help: "max wait for document.fonts.ready (default 10000)" },
  "--settle": { arg: "ms", help: "wait before collecting (default 300)" },
  "--timeout": { arg: "ms", help: "navigation timeout (default 60000)" },
  "--out": { arg: "file", help: "write the JSON report here instead of stdout" },
  "--headed": { flag: true, help: "show the browser window" },
  "--help": { flag: true, help: "show this help" },
};

class UsageError extends Error {}

function usage() {
  const lines = ["Usage: npm run probe -- [options] [page ...]", "Pages: paths, absolute URLs, @core (default), @admin", ""];
  for (const [name, spec] of Object.entries(OPTIONS)) {
    lines.push(`  ${`${name}${spec.arg ? ` <${spec.arg}>` : ""}`.padEnd(42)} ${spec.help}`);
  }
  lines.push("", "Environment: RAVNUS_PROBE_BASE_URL, RAVNUS_PROBE_CHROME, RAVNUS_PROBE_AUTOLOGIN_TOKEN");
  return lines.join("\n");
}

function parseArgs(argv) {
  const values = {};
  const pages = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      pages.push(arg);
      continue;
    }
    const spec = OPTIONS[arg];
    if (!spec) throw new UsageError(`unknown option ${arg}`);
    if (spec.flag) {
      values[arg] = true;
      continue;
    }
    const value = argv[++i];
    if (value === undefined) throw new UsageError(`${arg} needs a value`);
    if (spec.multi) (values[arg] ??= []).push(value);
    else values[arg] = value;
  }
  return { values, pages };
}

const list = (value, fallback) => (value ?? fallback).split(",").map((s) => s.trim()).filter(Boolean);

function number(value, fallback, name) {
  if (value === undefined) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new UsageError(`${name} must be a non-negative number`);
  return n;
}

function parseAssert(text) {
  const arrow = text.indexOf("=>");
  const equals = arrow === -1 ? -1 : text.indexOf("=", arrow + 2);
  if (arrow === -1 || equals === -1) throw new UsageError(`--assert "${text}" is not "selector => property = value"`);
  const sel = text.slice(0, arrow).trim();
  const prop = text.slice(arrow + 2, equals).trim();
  const expected = text.slice(equals + 1).trim();
  if (!sel || !prop) throw new UsageError(`--assert "${text}" needs a selector and a property`);
  const regex = expected.match(/^\/(.*)\/([dgimsuvy]*)$/);
  if (regex) {
    try {
      new RegExp(regex[1], regex[2]);
    } catch (error) {
      throw new UsageError(`--assert "${text}": ${error.message}`);
    }
  }
  return { text, sel, prop, expected, regex: regex ? { source: regex[1], flags: regex[2].replace("g", "") } : null };
}

async function buildConfig(argv) {
  const { values: v, pages } = parseArgs(argv);
  if (v["--help"]) return { help: true };
  const baseUrl = new URL(v["--base-url"] ?? process.env.RAVNUS_PROBE_BASE_URL ?? "http://127.0.0.1:3007");
  const viewports = list(v["--viewports"], "1440,1024,800").map((item) => {
    const m = item.match(/^(\d+)(?:x(\d+))?$/);
    if (!m) throw new UsageError(`bad viewport "${item}"`);
    return { width: Number(m[1]), height: Number(m[2] ?? 900) };
  });
  const blocks = list(v["--block"], "none");
  for (const mode of blocks) if (!["none", "abort", "hang"].includes(mode)) throw new UsageError(`bad --block mode "${mode}"`);
  const targets = (pages.length ? pages : ["@core"]).flatMap((p) => {
    if (p.startsWith("@")) {
      if (!PRESETS[p]) throw new UsageError(`unknown preset ${p} (${Object.keys(PRESETS).join(", ")})`);
      return PRESETS[p];
    }
    return [p];
  });
  const autologinToken = process.env.RAVNUS_PROBE_AUTOLOGIN_TOKEN || null;
  const login = v["--autologin-user"] ?? "admin";
  if (!/^[\w.@+-]+$/.test(login)) throw new UsageError(`bad --autologin-user "${login}"`);
  const project = v["--compose-project"] ?? null;
  if (project !== null && !/^[a-z0-9][a-z0-9_-]*$/.test(project)) throw new UsageError(`bad --compose-project "${project}"`);
  let evalCode = v["--eval"] ?? null;
  if (v["--eval-file"]) evalCode = await readFile(v["--eval-file"], "utf8");
  return {
    baseUrl,
    viewports,
    locales: list(v["--locales"], "ko"),
    blocks,
    targets,
    blockHost: v["--block-host"] ?? new URL(PRETENDARD_PREFIX).hostname,
    abortCode: v["--abort-code"] ?? "failed",
    expectNoCdn: !!v["--expect-no-cdn"],
    selectors: v["--sel"] ?? [...DEFAULT_SELECTORS, ...(v["--add-sel"] ?? [])],
    properties: [...DEFAULT_PROPERTIES, ...(v["--prop"] ?? [])],
    vars: [...DEFAULT_VARS, ...(v["--var"] ?? [])],
    maxElements: number(v["--max-elements"], 20, "--max-elements"),
    asserts: (v["--assert"] ?? []).map(parseAssert),
    injectCss: v["--inject-css"] ? await readFile(v["--inject-css"], "utf8") : null,
    axe: v["--axe"] ? { rules: list(v["--axe-rules"], "color-contrast"), include: v["--axe-include"] ?? [] } : null,
    screenshotDir: v["--screenshot"] ? resolve(v["--screenshot"]) : null,
    fullPage: !!v["--full-page"],
    forcedColors: !!v["--forced-colors"],
    evalCode,
    autologin: v["--autologin"] ? { token: autologinToken, login, cookieName: v["--cookie-name"] ?? null } : null,
    project,
    themeId: v["--theme-id"] ?? "ravnus",
    loadTimeout: number(v["--load-timeout"], 15000, "--load-timeout"),
    fontsTimeout: number(v["--fonts-timeout"], 10000, "--fonts-timeout"),
    settle: number(v["--settle"], 300, "--settle"),
    navTimeout: number(v["--timeout"], 60000, "--timeout"),
    out: v["--out"] ? resolve(v["--out"]) : null,
    headed: !!v["--headed"],
  };
}

// ---------- autologin through rails runner ----------

const run = promisify(execFile);
const MARKER = "RAVNUS_PROBE_JSON ";

async function railsRunner(config, code) {
  const args = ["compose", ...(config.project ? ["-p", config.project] : []), "-f", COMPOSE_FILE];
  args.push("exec", "-T", "-u", "redmine", "redmine", "bin/rails", "runner", code);
  const { stdout } = await run("docker", args, { cwd: ROOT, timeout: 180_000, maxBuffer: 4 * 1024 * 1024 });
  const line = stdout.split("\n").find((l) => l.startsWith(MARKER));
  if (!line) throw new Error("rails runner printed no result");
  return JSON.parse(line.slice(MARKER.length));
}

async function createAutologinToken(config) {
  // The login is validated against /^[\w.@+-]+$/, so it is safe inside a Ruby string.
  return railsRunner(
    config,
    `previous = Setting.autologin.to_s
     changed = previous.to_i <= 0
     Setting.autologin = "7" if changed
     token = Token.create!(user: User.find_by!(login: ${JSON.stringify(config.autologin.login)}), action: "autologin")
     cookie = Redmine::Configuration["autologin_cookie_name"].presence || "autologin"
     puts ${JSON.stringify(MARKER)} + { id: token.id, value: token.value, previous: previous, changed: changed,
       cookie: cookie, redmine: Redmine::VERSION.to_s }.to_json`,
  );
}

async function deleteAutologinToken(config, created) {
  const previous = /^\d*$/.test(created.previous) ? created.previous : "0";
  return railsRunner(
    config,
    `deleted = Token.where(id: ${Number(created.id)}, action: "autologin").delete_all
     restored = ${created.changed ? "true" : "false"} && Setting.autologin.to_s == "7"
     Setting.autologin = ${JSON.stringify(previous)} if restored
     puts ${JSON.stringify(MARKER)} + { deleted: deleted, restored: restored }.to_json`,
  );
}

// ---------- in-page code ----------

// Runs before any page script: event times, LCP and font loading events.
function initScript() {
  const probe = (window.__ravnusProbe = { events: [], lcp: [], fontEvents: [] });
  document.addEventListener("DOMContentLoaded", () => probe.events.push({ type: "DOMContentLoaded", t: performance.now() }));
  window.addEventListener("load", () => probe.events.push({ type: "load", t: performance.now() }));
  try {
    new PerformanceObserver((entries) => {
      for (const e of entries.getEntries()) probe.lcp.push({ t: e.startTime, size: e.size, element: e.element?.tagName.toLowerCase() ?? null });
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch {}
  try {
    for (const type of ["loading", "loadingdone", "loadingerror"]) {
      document.fonts.addEventListener(type, (ev) => probe.fontEvents.push({ type, t: performance.now(), faces: ev.fontfaces.length }));
    }
  } catch {}
}

// Collects styles, layout and font state. Must stay self-contained.
function collectInPage({ selectors, properties, vars, maxElements, themeId }) {
  const r1 = (n) => Math.round(n * 10) / 10;
  const describe = (el) =>
    el.tagName.toLowerCase() +
    (el.id ? `#${el.id}` : "") +
    [...el.classList].slice(0, 2).map((c) => `.${c}`).join("");
  // First visible element with its own text inside el (el itself if none),
  // tagged so the CDP platform-font query can find it.
  const textHost = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (/\S/.test(node.data) && node.parentElement?.getClientRects().length) return node.parentElement;
    }
    return el;
  };
  const styles = selectors.map((sel, index) => {
    let els;
    try {
      els = [...document.querySelectorAll(sel)];
    } catch (error) {
      return { sel, error: String(error) };
    }
    if (!els.length) return { sel, count: 0 };
    const cs = getComputedStyle(els[0]);
    const box = els[0].getBoundingClientRect();
    const host = textHost(els[0]);
    // Several selectors can share a host, so the attribute is a token list.
    host.setAttribute("data-ravnus-probe-font", `${host.getAttribute("data-ravnus-probe-font") ?? ""} ${index}`.trim());
    return {
      sel,
      count: els.length,
      element: describe(els[0]),
      fontHost: describe(host),
      text: (els[0].innerText || els[0].value || "").trim().replace(/\s+/g, " ").slice(0, 60),
      style: Object.fromEntries(properties.map((p) => [p, cs.getPropertyValue(p)])),
      box: { x: r1(box.x), y: r1(box.y), w: r1(box.width), h: r1(box.height) },
      heights: els.slice(0, maxElements).map((el) => r1(el.getBoundingClientRect().height)),
    };
  });

  const root = getComputedStyle(document.documentElement);
  const rootVars = Object.fromEntries(vars.map((name) => [name, root.getPropertyValue(name).trim() || null]));

  // Visible text under 12px, Gantt chart excluded (DESIGN.md 10.2 item 3).
  const small = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const el = node.parentElement;
    if (!el || !/\S/.test(node.data) || el.closest("#gantt_area, .gantt_subjects_container, table.gantt-table, script, style")) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 12 && el.getClientRects().length) small.push({ element: describe(el), fontSize: size, text: node.data.trim().slice(0, 40) });
  }

  const faces = [...document.fonts];
  const byFamily = {};
  for (const face of faces) {
    const family = face.family.replace(/^["']|["']$/g, "");
    const s = (byFamily[family] ??= { total: 0, unloaded: 0, loading: 0, loaded: 0, error: 0 });
    s.total++;
    s[face.status]++;
  }

  const timing = window.__ravnusProbe ?? { events: [], lcp: [], fontEvents: [] };
  const navEntry = performance.getEntriesByType("navigation")[0];
  const event = (type) => timing.events.find((e) => e.type === type)?.t;
  const themeLinks = [...document.querySelectorAll('link[rel~="stylesheet"]')].map((l) => l.href).filter((h) => h.includes("/assets/themes/"));

  return {
    finalUrl: location.href,
    title: document.title,
    lang: document.documentElement.lang || null,
    dir: document.documentElement.dir || null,
    // Below 900px responsive.js moves the account links into the flyout and
    // leaves #account empty; the flyout avatar is rendered for users only.
    loggedIn: !!document.querySelector(".flyout-menu__avatar"),
    user: document.querySelector("#account .user-login, #loggedas a.user")?.textContent.trim() || null,
    themeLinks,
    themeLinked: themeLinks.some((h) => h.includes(`/assets/themes/${themeId}/`)),
    timing: {
      readyState: document.readyState,
      firstContentfulPaint: r1(performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? NaN) || null,
      largestContentfulPaint: timing.lcp.length ? r1(timing.lcp[timing.lcp.length - 1].t) : null,
      domContentLoaded: event("DOMContentLoaded") !== undefined ? r1(event("DOMContentLoaded")) : null,
      load: event("load") !== undefined ? r1(event("load")) : null,
      responseStart: navEntry ? r1(navEntry.responseStart) : null,
      fontEvents: timing.fontEvents.map((e) => ({ ...e, t: r1(e.t) })),
    },
    layout: {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    },
    smallText: { count: small.length, samples: small.slice(0, 10) },
    fonts: {
      status: document.fonts.status,
      faces: faces.length,
      byFamily,
      // check() is also true when no face of the family exists at all.
      pretendardKoreanLoaded: !!byFamily["Pretendard Variable"] && document.fonts.check('16px "Pretendard Variable"', "한글"),
    },
    styles,
    rootVars,
  };
}

function assertInPage({ sel, prop, expected, regex }) {
  let els;
  try {
    els = [...document.querySelectorAll(sel)];
  } catch (error) {
    return { matched: 0, failed: [], error: String(error) };
  }
  const re = regex ? new RegExp(regex.source, regex.flags) : null;
  const failed = [];
  for (const el of els) {
    const value = getComputedStyle(el).getPropertyValue(prop).trim();
    if (re ? !re.test(value) : value !== expected) {
      failed.push({ element: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : "") + [...el.classList].slice(0, 2).map((c) => `.${c}`).join(""), value });
    }
  }
  return { matched: els.length, failedCount: failed.length, failed: failed.slice(0, 5) };
}

async function axeInPage({ rules, include }) {
  const present = include.filter((sel) => document.querySelector(sel));
  if (include.length && !present.length) return { skipped: `no element matches ${include.join(", ")}` };
  const context = present.length ? { include: present.map((sel) => [sel]) } : document;
  const result = await window.axe.run(context, {
    runOnly: { type: "rule", values: rules },
    resultTypes: ["violations", "incomplete"],
  });
  const nodes = (groups) =>
    groups.flatMap((group) =>
      group.nodes.map((node) => {
        const data = node.any?.[0]?.data ?? null;
        return {
          rule: group.id,
          impact: node.impact,
          target: node.target.join(" "),
          html: node.html.slice(0, 160),
          message: node.any?.[0]?.message ?? node.failureSummary ?? null,
          data: data && typeof data === "object" ? data : null,
        };
      }),
    );
  return {
    regions: present.length ? present : ["document"],
    passes: result.passes.reduce((n, group) => n + group.nodes.length, 0),
    violations: nodes(result.violations),
    incomplete: nodes(result.incomplete),
  };
}

// ---------- one run ----------

function slugOf(job, loggedIn) {
  const path = new URL(job.url).pathname;
  const name = decodeURIComponent(path).replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "root";
  return [name, `${job.viewport.width}x${job.viewport.height}`, job.locale, job.block, loggedIn ? "admin" : "anon"].join("_");
}

function injectAfterThemeLink(html, css) {
  const style = `<style id="ravnus-probe-inject">\n${css.replace(/<\/(style)/gi, "<\\/$1")}\n</style>`;
  const link = html.match(/<link\b[^>]*href="[^"]*\/assets\/themes\/[^"]+"[^>]*>/i);
  if (link) return { html: html.replace(link[0], () => `${link[0]}\n${style}`), place: "after theme link" };
  return { html: html.replace(/<\/head>/i, () => `${style}\n</head>`), place: "end of head (no theme link found)" };
}

async function probeOne(browser, config, shared, job) {
  const result = {
    page: job.target,
    url: job.url,
    viewport: job.viewport,
    locale: job.locale,
    block: job.block,
    login: shared.cookie ? config.autologin.login : "anonymous",
    ok: true,
    problems: [],
  };
  const context = await browser.newContext({
    viewport: job.viewport,
    locale: job.locale,
    deviceScaleFactor: 1,
    forcedColors: config.forcedColors ? "active" : "none",
  });
  const held = [];
  const records = new Map();
  const pending = [];
  try {
    if (shared.cookie) await context.addCookies([{ ...shared.cookie, url: config.baseUrl.origin }]);
    if (job.block !== "none") {
      await context.route(
        (url) => url.hostname === config.blockHost,
        (route) => (job.block === "abort" ? route.abort(config.abortCode) : held.push(route)),
      );
    }
    if (config.injectCss) {
      await context.route(
        (url) => url.origin === config.baseUrl.origin,
        async (route) => {
          if (route.request().resourceType() !== "document") return route.fallback();
          const response = await route.fetch({ maxRedirects: 0 });
          const type = response.headers()["content-type"] ?? "";
          if (!type.includes("text/html")) return route.fulfill({ response });
          const injected = injectAfterThemeLink(await response.text(), config.injectCss);
          result.inject = injected.place;
          return route.fulfill({ response, body: injected.html });
        },
      );
    }
    await context.addInitScript(initScript);
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text().slice(0, 300)));
    page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${String(e).slice(0, 300)}`));

    const t0 = Date.now();
    const watched = (req) => ["font", "stylesheet"].includes(req.resourceType()) || new URL(req.url()).hostname === config.blockHost;
    page.on("request", (req) => {
      if (watched(req)) records.set(req, { url: req.url(), type: req.resourceType(), state: "pending", startedMs: Date.now() - t0 });
    });
    page.on("requestfinished", (req) => {
      const rec = records.get(req);
      if (!rec) return;
      pending.push(
        (async () => {
          rec.state = "finished";
          rec.ms = Date.now() - t0 - rec.startedMs;
          const response = await req.response();
          const headers = response ? await response.allHeaders() : {};
          rec.status = response?.status() ?? null;
          rec.contentType = headers["content-type"] ?? null;
          const sizes = await req.sizes().catch(() => null);
          rec.bytes = sizes?.responseBodySize ?? null;
          rec.referer = (await req.allHeaders()).referer ?? null;
          const served = rec.type === "stylesheet" && rec.url.match(shared.themeCssPattern);
          if (served && response && !shared.servedCss.has(rec.url)) {
            shared.servedCss.set(rec.url, checkServedCss(rec.url, await response.text(), shared.meta));
          }
        })().catch((error) => (rec.collectError = String(error).split("\n")[0])),
      );
    });
    page.on("requestfailed", (req) => {
      const rec = records.get(req);
      if (!rec) return;
      rec.state = "failed";
      rec.failure = req.failure()?.errorText ?? null;
      rec.referer = req.headers().referer ?? null;
    });

    // Navigate. A hung CDN request would keep "load" from firing, so hang
    // mode waits for DOMContentLoaded and then for load up to --load-timeout.
    const waitUntil = job.block === "hang" ? "domcontentloaded" : "load";
    const nav = { waitUntil };
    let response = null;
    try {
      response = await page.goto(job.url, { waitUntil, timeout: config.navTimeout });
    } catch (error) {
      nav.error = String(error).split("\n")[0];
    }
    nav.status = response?.status() ?? null;
    const readyState = () => page.evaluate(() => document.readyState).catch(() => null);
    if (config.loadTimeout > 0 && (await readyState()) !== "complete") {
      const started = Date.now();
      await page
        .waitForFunction(() => document.readyState === "complete", null, { timeout: config.loadTimeout, polling: 100 })
        .catch(() => (nav.loadTimedOut = true));
      nav.loadWaitMs = Date.now() - started;
    }
    if (job.block === "hang") {
      nav.fontsReady = "not awaited (hang)";
    } else {
      nav.fontsReady = await page
        .evaluate((ms) => Promise.race([document.fonts.ready.then(() => "ready"), new Promise((r) => setTimeout(() => r("timeout"), ms))]), config.fontsTimeout)
        .catch((error) => `error: ${String(error).split("\n")[0]}`);
    }
    if (config.settle > 0) await page.waitForTimeout(config.settle);
    result.navigation = nav;

    const data = await page.evaluate(collectInPage, {
      selectors: config.selectors,
      properties: config.properties,
      vars: config.vars,
      maxElements: config.maxElements,
      themeId: config.themeId,
    });

    // Fonts Chrome used for the first text inside each selector's first
    // element (the element tagged by collectInPage, see style.fontHost).
    const cdp = await context.newCDPSession(page);
    try {
      await cdp.send("DOM.enable");
      await cdp.send("CSS.enable");
      const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
      for (const [index, style] of data.styles.entries()) {
        if (!style.count) continue;
        try {
          const selector = `[data-ravnus-probe-font~="${index}"]`;
          const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector });
          const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
          style.platformFonts = fonts.map((f) => ({ family: f.familyName, custom: f.isCustomFont, glyphs: f.glyphCount }));
        } catch (error) {
          style.platformFonts = { error: String(error).split("\n")[0] };
        }
      }
    } finally {
      await cdp.detach().catch(() => {});
      await page.evaluate(() => document.querySelectorAll("[data-ravnus-probe-font]").forEach((el) => el.removeAttribute("data-ravnus-probe-font")));
    }

    result.asserts = [];
    for (const assertion of config.asserts) {
      const outcome = await page.evaluate(assertInPage, assertion);
      const passed = !outcome.error && outcome.matched > 0 && outcome.failedCount === 0;
      result.asserts.push({ assert: assertion.text, passed, ...outcome });
      if (!passed) {
        const why = outcome.error ?? (outcome.matched === 0 ? "no element matches" : `${outcome.failedCount} of ${outcome.matched} differ, e.g. ${outcome.failed[0].value}`);
        result.problems.push(`assert failed: ${assertion.text} (${why})`);
      }
    }

    if (config.axe) {
      await page.evaluate(shared.axeSource);
      result.axe = await page.evaluate(axeInPage, config.axe);
      if (result.axe.violations?.length) result.problems.push(`axe: ${result.axe.violations.length} violation node(s)`);
    }

    if (config.evalCode) {
      const expression = `(async () => { const v = (${config.evalCode}\n); return typeof v === "function" ? await v() : await v; })()`;
      result.eval = await page.evaluate(expression).catch((error) => ({ evalError: String(error).split("\n")[0] }));
    }

    if (config.screenshotDir) {
      const path = join(config.screenshotDir, `${slugOf(job, data.loggedIn)}.png`);
      await mkdir(config.screenshotDir, { recursive: true });
      // Playwright waits for document.fonts.ready before a screenshot; a hung
      // font request never settles, so skip that wait in hang mode.
      if (job.block === "hang") process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = "1";
      try {
        await page.screenshot({ path, fullPage: config.fullPage, timeout: 30_000 });
        result.screenshot = path;
      } catch (error) {
        result.screenshot = { error: String(error).split("\n")[0] };
      } finally {
        delete process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY;
      }
    }

    await Promise.allSettled(pending);
    // Requests still pending (hang mode): record the headers they were sent with.
    for (const [req, rec] of records) if (rec.state === "pending") rec.referer = req.headers().referer ?? null;
    const requests = [...records.values()];
    const fonts = requests.filter((r) => r.type === "font");
    const cdn = requests.filter((r) => new URL(r.url).hostname === config.blockHost);
    const byHost = {};
    for (const r of fonts) {
      const host = new URL(r.url).host;
      const s = (byHost[host] ??= { count: 0, ok: 0, failed: 0, pending: 0, bytes: 0 });
      s.count++;
      if (r.state === "pending") s.pending++;
      else if (r.state === "failed") s.failed++;
      else if (r.status === 200) s.ok++;
      s.bytes += r.bytes ?? 0;
    }
    const outside = shared.meta instanceof Error ? [] : cdn.filter((r) => !shared.generatedUrls.has(r.url)).map((r) => r.url);
    result.document = { status: nav.status, finalUrl: data.finalUrl, title: data.title, lang: data.lang, dir: data.dir, loggedIn: data.loggedIn, user: data.user, themeLinks: data.themeLinks };
    result.timing = data.timing;
    result.layout = data.layout;
    result.smallText = data.smallText;
    result.fonts = {
      ...data.fonts,
      requests: fonts.length,
      byHost,
      cdn: { host: config.blockHost, requests: cdn.length, ok: cdn.filter((r) => r.status === 200).length, outsideGeneratedList: outside },
      referers: [...new Set(fonts.map((r) => r.referer))],
    };
    result.stylesheets = requests.filter((r) => r.type === "stylesheet").map((r) => ({ url: r.url, state: r.state, status: r.status ?? null }));
    result.styles = data.styles;
    result.rootVars = data.rootVars;
    result.requests = requests;
    result.consoleErrors = consoleErrors;

    if (nav.error) result.problems.push(`navigation: ${nav.error}`);
    if (nav.status >= 400) result.problems.push(`HTTP ${nav.status}`);
    const requestedLogin = /\/login$/.test(new URL(job.url).pathname);
    if (!requestedLogin && /\/login$/.test(new URL(data.finalUrl).pathname)) result.problems.push("redirected to the login page");
    if (shared.cookie && !data.loggedIn) result.problems.push("autologin cookie did not log in");
    if (!data.themeLinked) result.problems.push(`page does not link the ${config.themeId} theme stylesheet`);
    if (outside.length) result.problems.push(`${outside.length} CDN request(s) outside the generated font list`);
    if (config.expectNoCdn && cdn.length) result.problems.push(`${cdn.length} CDN request(s) with --expect-no-cdn`);
  } catch (error) {
    result.problems.push(`error: ${String(error).split("\n")[0]}`);
  } finally {
    await context.close().catch(() => {});
  }
  result.heldCdnRequests = held.length;
  result.ok = result.problems.length === 0;
  return result;
}

function checkServedCss(url, text, meta) {
  const checks = checkStylesheet(text, { meta, served: true });
  return { url, ok: checks.every((c) => c.ok), checks };
}

// ---------- main ----------

async function main(argv) {
  let config;
  try {
    config = await buildConfig(argv);
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    console.error(`probe: ${error.message}\n\n${usage()}`);
    return 2;
  }
  if (config.help) {
    console.log(usage());
    return 0;
  }

  const meta = await readGeneratedMeta().catch((error) => error);
  const shared = {
    meta,
    generatedUrls: new Set(meta instanceof Error ? [] : meta.urls),
    servedCss: new Map(),
    // The RAVNUS stylesheet as served, also when a child theme imports it.
    themeCssPattern: /\/assets\/themes\/ravnus\/application-[0-9a-f]+\.css$/,
    axeSource: config.axe ? require("axe-core").source : null,
    cookie: null,
  };

  let created = null;
  let cleanedUp = false;
  const cleanup = async () => {
    if (!created || cleanedUp) return null;
    cleanedUp = true;
    return deleteAutologinToken(config, created);
  };
  const onSignal = (signal) => {
    console.error(`probe: ${signal}, cleaning up`);
    cleanup()
      .catch((error) => console.error(`probe: cleanup failed: ${error.message}`))
      .finally(() => process.exit(130));
  };
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);

  const report = {
    probe: {
      baseUrl: config.baseUrl.href,
      startedAt: new Date().toISOString(),
      playwrightCore: require("playwright-core/package.json").version,
      axeCore: config.axe ? require("axe-core/package.json").version : null,
      matrix: { pages: config.targets, viewports: config.viewports, locales: config.locales, blocks: config.blocks },
      login: config.autologin ? config.autologin.login : "anonymous",
      redmineVersion: null,
      note: "Local measurement against a test instance, not a production check.",
    },
    expectations: meta instanceof Error ? { error: meta.message } : { pretendardVersion: meta.version, prefix: meta.prefix, ruleCount: meta.ruleCount },
  };

  let browser;
  let exitCode = 0;
  try {
    if (config.autologin) {
      if (config.autologin.token) {
        shared.cookie = { name: config.autologin.cookieName ?? "autologin", value: config.autologin.token };
      } else {
        console.error("probe: creating an autologin token with rails runner ...");
        created = await createAutologinToken(config).catch((error) => {
          throw new Error(`autologin setup failed: ${error.stderr?.trim().split("\n").slice(-3).join(" / ") || error.message}`);
        });
        shared.cookie = { name: config.autologin.cookieName ?? created.cookie, value: created.value };
        report.probe.redmineVersion = created.redmine;
      }
    }

    const executablePath = process.env.RAVNUS_PROBE_CHROME || undefined;
    browser = await chromium.launch({ headless: !config.headed, ...(executablePath ? { executablePath } : { channel: "chrome" }) });
    report.probe.browser = `Chrome ${browser.version()}${executablePath ? ` (${executablePath})` : " (installed Google Chrome)"}`;

    const jobs = [];
    for (const target of config.targets) {
      const url = new URL(target, config.baseUrl).href;
      for (const block of config.blocks) {
        for (const locale of config.locales) {
          for (const viewport of config.viewports) jobs.push({ target, url, block, locale, viewport });
        }
      }
    }
    report.runs = [];
    for (const [index, job] of jobs.entries()) {
      const label = `[${index + 1}/${jobs.length}] ${job.viewport.width}x${job.viewport.height} ${job.locale} ${job.block} ${job.target}`;
      const result = await probeOne(browser, config, shared, job);
      report.runs.push(result);
      console.error(`${label}: ${result.ok ? "ok" : result.problems.join("; ")}`);
    }
  } finally {
    await browser?.close().catch(() => {});
    process.removeListener("SIGINT", onSignal);
    process.removeListener("SIGTERM", onSignal);
    try {
      const cleaned = await cleanup();
      if (cleaned) report.probe.autologinCleanup = { tokenDeleted: cleaned.deleted === 1, settingRestored: cleaned.restored };
    } catch (error) {
      report.probe.autologinCleanup = { error: error.message };
      console.error(`probe: could not delete the autologin token: ${error.message}`);
      exitCode = 1;
    }
  }

  report.servedCss = [...shared.servedCss.values()];
  const runs = report.runs ?? [];
  report.summary = {
    runs: runs.length,
    failedRuns: runs.filter((r) => !r.ok).length,
    problems: runs.flatMap((r) => r.problems.map((p) => `${r.page} ${r.viewport.width} ${r.locale} ${r.block}: ${p}`)),
    servedCss: report.servedCss.length
      ? report.servedCss.map((s) => ({ url: s.url, ok: s.ok, failed: s.checks.filter((c) => !c.ok).map((c) => c.title) }))
      : "theme CSS was not requested",
    cdnFontRequests: runs.reduce((n, r) => n + (r.fonts?.cdn.requests ?? 0), 0),
    axeViolations: config.axe ? runs.reduce((n, r) => n + (r.axe?.violations?.length ?? 0), 0) : null,
  };
  if (report.summary.failedRuns || report.servedCss.some((s) => !s.ok)) exitCode = 1;

  const json = `${JSON.stringify(report, null, 2)}\n`;
  if (config.out) {
    await mkdir(dirname(config.out), { recursive: true });
    await writeFile(config.out, json);
    console.log(JSON.stringify({ out: config.out, ...report.summary }));
  } else {
    process.stdout.write(json);
  }
  return exitCode;
}

main(process.argv.slice(2)).then(
  (code) => (process.exitCode = code),
  (error) => {
    console.error(`probe: ${error.stack ?? error}`);
    process.exitCode = 1;
  },
);
