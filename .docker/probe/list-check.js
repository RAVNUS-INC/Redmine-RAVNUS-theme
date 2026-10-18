// Issue list checks for `npm run probe -- --eval-file .docker/probe/list-check.js`
// (DESIGN.md 9 Phase 3, 10.2 item 3).
//
// Runs in the page on an issue list (any query; the checks that need a row
// kind, such as overdue or group rows, are skipped when the page has none).
// It compares glyph and row colors with the tokens they should come from,
// resolved in the same page (presets injected with --inject-css are
// followed), measures row heights, marks one row of each kind as selected
// (context menu) to check the selected colors, and checks line breaking in
// name and subject cells. The result is { failed, checks, metrics }; failed
// checks fail the probe run.
async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const probe = document.createElement("div");
  probe.style.display = "none";
  document.body.append(probe);
  const token = (name) => {
    probe.style.color = "";
    probe.style.color = `var(--ravnus-${name})`;
    return getComputedStyle(probe).color;
  };
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const rgba = (s) => {
    if (!s || s === "none") return null;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = s;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return { r, g, b, a: a / 255 };
  };
  const lum = (c) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const contrast = (fg, bg) => {
    const a = rgba(fg);
    const b = rgba(bg);
    if (!a || !b) return null;
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
  };
  const same = (a, b) => {
    const x = rgba(a);
    const y = rgba(b);
    return !!x && !!y && ["r", "g", "b"].every((k) => Math.abs(x[k] - y[k]) <= 1) && Math.abs(x.a - y.a) < 0.02;
  };

  const checks = [];
  const failed = [];
  const push = (entry) => {
    checks.push(entry);
    if (entry.ok === false) failed.push(entry.label);
  };
  const check = (label, el, prop, want, on, min, pseudo) => {
    if (!el) return push({ label, skipped: "no element" });
    const value = getComputedStyle(el, pseudo)[prop];
    const expected = token(want);
    const entry = { label, prop, value, token: want, expected, ok: same(value, expected) };
    if (on) {
      entry.on = on;
      entry.contrast = contrast(value, token(on));
      if (min) {
        entry.min = min;
        if (entry.contrast === null || entry.contrast < min) entry.ok = false;
      }
    }
    push(entry);
  };
  const expectValue = (label, actual, ok, expected) => push({ label, value: actual, expected, ok });
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const round = (n) => Math.round(n * 100) / 100;
  const metrics = { width: innerWidth };

  const table = $("table.list.issues");
  if (!table) {
    probe.remove();
    return { failed: ["issue list table"], checks: [{ label: "issue list table", ok: false }], metrics };
  }
  const rows = $$("tbody tr.issue", table);
  const row = (selector) => rows.find((r) => r.matches(selector));

  // Row heights (4.8): rows whose cells hold one line of text.
  const lineHeight = (td) => parseFloat(getComputedStyle(td).lineHeight);
  const singleLine = rows.filter((r) => {
    const subject = $("td.subject", r);
    return !subject || subject.getBoundingClientRect().height < 2 * lineHeight(subject) + 2 * parseFloat(getComputedStyle(subject).paddingTop);
  });
  const heights = singleLine.slice(1).map((r) => round(r.getBoundingClientRect().height));
  const th = $("thead th", table);
  metrics.rows = { count: rows.length, singleLine: singleLine.length, min: Math.min(...heights), max: Math.max(...heights), header: th && round(th.getBoundingClientRect().height) };
  // The bottom cell padding is --ravnus-row-pad-y in px (4px Compact, 6px default).
  const padCell = rows.length ? $("td.id", rows[0]) ?? $("td.subject", rows[0]) : null;
  const padY = padCell ? parseFloat(getComputedStyle(padCell).paddingBottom) : 6;
  const target = padY < 5 ? 27 : 32;
  metrics.rows.target = target;
  if (heights.length) {
    expectValue(`row height ${target}±1px`, `${metrics.rows.min}-${metrics.rows.max}`, metrics.rows.min >= target - 1 && metrics.rows.max <= target + 1, `${target - 1}-${target + 1}`);
  }
  check("header text", th, "color", "fg-muted", "bg-canvas", 4.5);
  check("header surface", th, "backgroundColor", "bg-canvas");

  const rowVar = (r, name) => getComputedStyle(r).getPropertyValue(name).trim();
  const resolved = (value) => {
    probe.style.color = "";
    probe.style.color = value;
    return getComputedStyle(probe).color;
  };

  // Priority icons (6.4): a shape (clip-path) and a color per position class.
  const glyph = (r) => r && $("td.priority", r);
  const lowest = row(".priority-lowest");
  const normal = row(".priority-default");
  const high3 = row(".priority-high3");
  const high2 = row(".priority-high2");
  const highest = row(".priority-highest");
  const shapes = new Set();
  for (const [label, r, color] of [
    ["lowest", lowest, "priority-low-fg"],
    ["default", normal, "priority-default-fg"],
    ["high3", high3, "priority-high3-fg"],
    ["high2", high2, "priority-high2-fg"],
    ["highest", highest, "priority-highest-fg"],
  ]) {
    if (!r) {
      push({ label: `priority ${label}`, skipped: "no row" });
      continue;
    }
    const cs = getComputedStyle(glyph(r), "::before");
    check(`priority ${label}: icon color`, glyph(r), "backgroundColor", color, "bg-canvas", 3, "::before");
    expectValue(`priority ${label}: icon shape`, cs.clipPath.slice(0, 24), cs.clipPath !== "none", "polygon or path");
    shapes.add(cs.clipPath);
  }
  expectValue("priority icons differ per level", shapes.size, shapes.size === [lowest, normal, high3, high2, highest].filter(Boolean).length, "one shape per level");
  if (highest) check("priority highest: cell text", glyph(highest), "color", "priority-highest-fg", "bg-canvas", 4.5);

  // Status (6.5): an outline badge on canvas, the label in fg-muted, and a
  // 12px icon whose ring is the row's status color at 3:1 or more.
  const open = rows.find((r) => !r.classList.contains("closed") && same(resolved(rowVar(r, "--ravnus-status-color")), token("status-open-color")));
  const closed = row(".closed");
  for (const r of rows.filter((r) => $("td.status", r))) {
    const td = $("td.status", r);
    const badge = getComputedStyle(td, "::before");
    const icon = getComputedStyle(td, "::after");
    const want = resolved(rowVar(r, "--ravnus-status-color"));
    const ok =
      same(badge.backgroundColor, token("bg-canvas")) &&
      same(badge.borderTopColor, token("border-default")) &&
      same(icon.borderTopColor, want) &&
      contrast(icon.borderTopColor, token("bg-canvas")) >= 3 &&
      same(getComputedStyle(td).color, token("fg-muted"));
    if (!ok) push({ label: `status badge ${r.id}`, value: `icon ${icon.borderTopColor}, text ${getComputedStyle(td).color}, badge ${badge.backgroundColor}/${badge.borderTopColor}`, expected: want, ok: false });
  }
  if (open) {
    check("open status: icon", $("td.status", open), "borderTopColor", "status-open-color", "bg-canvas", 3, "::after");
    check("status label", $("td.status", open), "color", "fg-muted", "bg-canvas", 4.5);
  }
  if (closed) {
    check("closed status: icon", $("td.status", closed), "borderTopColor", "status-closed-color", "bg-canvas", 3, "::after");
    const subject = $("td.subject", closed);
    if (subject) check("closed row text", subject, "color", "fg-subtle", "bg-canvas", 4.5);
  }
  metrics.statusCells = rows.filter((r) => $("td.status", r)).length;

  // Tracker: an outline badge with a dot in the row's tracker color.
  const trackerRow = rows.find((r) => $("td.tracker", r)?.textContent.trim());
  if (trackerRow) {
    const td = $("td.tracker", trackerRow);
    const dot = getComputedStyle(td, "::before");
    const want = resolved(rowVar(trackerRow, "--ravnus-tracker-color"));
    expectValue("tracker dot", `${dot.width} ${dot.backgroundColor}`, dot.width === "7px" && same(dot.backgroundColor, want), `7px ${want}`);
    check("tracker badge border", td, "borderTopColor", "border-default", null, null, "::after");
    check("tracker label", td, "color", "fg-muted", "bg-canvas", 4.5);
  }

  // Due dates: plain text; overdue is the one filled red badge; behind
  // schedule (open rows only) is amber text.
  const overdue = row(".overdue");
  const behind = rows.find((r) => r.matches(".behind-schedule:not(.overdue, .closed)") && $("td.due_date", r)?.textContent.trim());
  const onTime = rows.find((r) => !r.matches(".overdue, .behind-schedule, .closed") && $("td.due_date", r)?.textContent.trim());
  if (onTime) {
    const td = $("td.due_date", onTime);
    expectValue("due date: no badge", getComputedStyle(td, "::before").content, getComputedStyle(td, "::before").content === "none", "none");
    check("due date text", td, "color", "fg-default", "bg-canvas", 4.5);
  } else push({ label: "due date", skipped: "no row" });
  if (overdue && $("td.due_date", overdue)?.textContent.trim()) {
    const td = $("td.due_date", overdue);
    check("overdue badge surface", td, "backgroundColor", "overdue-bg", null, null, "::before");
    check("overdue badge border", td, "borderTopColor", "overdue-border", null, null, "::before");
    check("overdue text", td, "color", "overdue-fg", "overdue-bg", 4.5);
  } else push({ label: "overdue badge", skipped: "no row or date" });
  if (behind) check("behind schedule text", $("td.due_date", behind), "color", "behind-fg", "bg-canvas", 4.5);
  else push({ label: "behind schedule text", skipped: "no row" });

  // Progress bars (shadcn Progress): 8px, rounded, the fill on a track.
  const bar = $("table.progress td.closed", table);
  if (bar) check("progress fill", bar, "backgroundColor", "progress-closed", "bg-canvas", 3);
  const todo = $("table.progress td.todo", table);
  if (todo) check("progress track", todo, "backgroundColor", "progress-track");
  const progressCell = $("td.done_ratio", table);
  if (progressCell) {
    metrics.progressBar = round($("table.progress", progressCell)?.getBoundingClientRect().height ?? 0);
    expectValue("progress bar height", metrics.progressBar, Math.abs(metrics.progressBar - 8) <= 0.5, 8);
  }

  // Name columns: "Admin Redmine" and other names on one line (7.6).
  const names = $$("td:is(.assigned_to, .author, .last_updated_by, .category)", table).filter((td) => td.textContent.trim());
  // Count text lines, not the cell height: cells stretch to the row.
  const lineCount = (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return new Set([...range.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top))).size;
  };
  const wrapped = names.filter((td) => lineCount(td) > 1);
  if (names.length) expectValue("name cells on one line", wrapped.map((td) => td.textContent.trim()).join(", ") || "all", wrapped.length === 0, "all");

  // Subjects: no last line of one syllable (text-wrap: pretty, 7.6). A
  // subject without any space has no normal break opportunity; its lines come
  // from overflow-wrap: anywhere, which text-wrap does not rebalance (Chrome),
  // so those are reported, not failed.
  const lonely = [];
  const lonelyNoSpace = [];
  for (const td of $$("td.subject", table)) {
    const node = [...td.querySelectorAll("a")].pop() ?? td;
    const range = document.createRange();
    range.selectNodeContents(node);
    const lines = [...range.getClientRects()].filter((r) => r.width > 0);
    if (lines.length < 2) continue;
    const top = Math.max(...lines.map((r) => r.top));
    const last = lines.filter((r) => Math.abs(r.top - top) < 2).reduce((w, r) => w + r.width, 0);
    if (last < 2 * parseFloat(getComputedStyle(td).fontSize)) (/\s/.test(td.textContent.trim()) ? lonely : lonelyNoSpace).push(td.textContent.trim().slice(0, 12));
  }
  expectValue("no subject with spaces ends with a one-syllable line", lonely.join(", ") || "none", lonely.length === 0, "none");
  if (lonelyNoSpace.length) push({ label: "known limit: subject without spaces ends with a one-syllable line", value: lonelyNoSpace.join(", ") });

  // Wide queries scroll inside #content, not the page (7.6).
  const content = $("#content");
  metrics.overflow = { table: Math.round(table.getBoundingClientRect().width), content: content.clientWidth, contentScroll: content.scrollWidth, page: document.documentElement.scrollWidth, viewport: innerWidth };
  expectValue("page has no horizontal overflow", document.documentElement.scrollWidth, document.documentElement.scrollWidth <= innerWidth, `<= ${innerWidth}`);
  const subject = $("td.subject", table);
  if (subject) {
    const min = parseFloat(getComputedStyle(subject).minInlineSize);
    expectValue("subject column keeps its minimum width", round(subject.getBoundingClientRect().width), subject.getBoundingClientRect().width + 0.5 >= min, `>= ${min}`);
  }

  // Group rows and totals (6.5).
  const group = $("tr.group", table);
  if (group) {
    check("group row surface", $("td", group), "backgroundColor", "bg-canvas");
    check("group name", $("span.name", group), "color", "fg-default", "bg-canvas", 4.5);
    check("group count", $("span.count", group), "color", "fg-default", "bg-inset", 4.5);
    check("group count surface", $("span.count", group), "backgroundColor", "bg-inset");
    check("group totals", $("span.totals", group), "color", "fg-muted", "bg-canvas", 4.5);
    check("group totals value", $("span.totals .value", group), "color", "fg-default", "bg-canvas", 4.5);
    check("group toggle-all", $("a.toggle-all", group), "color", "link", "bg-canvas", 4.5);
  }
  const totals = $(".query-totals");
  if (totals && totals.textContent.trim()) {
    check("query totals", totals, "color", "fg-muted", "bg-canvas", 4.5);
    check("query totals value", $(".value", totals), "color", "fg-default", "bg-canvas", 4.5);
  }

  // Selected rows (6.5): mark rows as selected the way the context menu does.
  const selected = [open, closed, overdue, behind, highest].filter(Boolean);
  for (const r of selected) r.classList.add("context-menu-selection");
  await wait(50);
  for (const r of selected) {
    const name = r.id;
    check(`selected ${name}: surface`, r, "backgroundColor", "accent-muted");
    const link = $("td.subject a", r);
    if (link) check(`selected ${name}: link`, link, "color", "list-link", "accent-muted", 4.5);
    // Status and tracker badges and the overdue badge keep their own
    // surfaces; the other cells sit on the selection tint.
    for (const td of $$("td:not(.checkbox):not(.buttons):not(.subject):not(.done_ratio)", r).filter((td) => td.textContent.trim())) {
      const surface = td.matches(".status") ? getComputedStyle(td, "::before").backgroundColor : td.matches(".tracker") ? getComputedStyle(td, "::after").backgroundColor : td.matches(".due_date") && r.matches(".overdue") ? getComputedStyle(td, "::before").backgroundColor : token("accent-muted");
      const c = contrast(getComputedStyle(td).color, surface);
      if (c === null || c < 4.5) push({ label: `selected ${name}: ${td.className} text`, value: getComputedStyle(td).color, contrast: c, min: 4.5, ok: false });
    }
  }
  if (selected.length) {
    const c = contrast(token("border-control"), token("accent-muted"));
    expectValue("selected row: control border contrast", c, c >= 3, ">= 3");
    for (const r of selected) r.classList.remove("context-menu-selection");
  }

  // The row variables can be remapped from custom.css (5.6): report what a
  // status-2 row resolved to (a mapping run compares this with its mapping).
  const status2 = row(".status-2");
  if (status2) {
    const cs = getComputedStyle(status2);
    metrics.status2 = Object.fromEntries(["color", "fill", "check", "slash"].map((k) => [k, cs.getPropertyValue(`--ravnus-status-${k}`).trim()]));
    metrics.status2.icon = getComputedStyle($("td.status", status2), "::after").borderTopColor;
  }

  probe.remove();
  return { failed, checks, metrics };
}
