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
  check("header text", th, "color", "fg-muted", "bg-subtle", 4.5);
  check("header surface", th, "backgroundColor", "bg-subtle");

  // Priority glyphs (6.4).
  const glyph = (r) => r && $("td.priority", r);
  const bars = (r) => (r ? getComputedStyle($("td.priority", r), "::before").backgroundImage.split("linear-gradient").length - 1 : null);
  const lowest = row(".priority-lowest");
  const high3 = row(".priority-high3");
  const high2 = row(".priority-high2");
  const highest = row(".priority-highest");
  const normal = row(".priority-default");
  if (normal) expectValue("default priority: no glyph", getComputedStyle(glyph(normal), "::before").display, getComputedStyle(glyph(normal), "::before").display === "none", "none");
  for (const [label, r, count, color, marker] of [
    ["lowest", lowest, 1, "priority-low-fg", "0px"],
    ["high3", high3, 2, "priority-high3-fg", "0px"],
    ["high2", high2, 3, "priority-high2-fg", "3px"],
  ]) {
    if (!r) {
      push({ label: `priority ${label}`, skipped: "no row" });
      continue;
    }
    expectValue(`priority ${label}: ${count} bar(s)`, bars(r), bars(r) === count, count);
    probe.style.color = getComputedStyle(r).getPropertyValue("--ravnus-priority-color");
    expectValue(`priority ${label}: bar color`, getComputedStyle(probe).color, same(getComputedStyle(probe).color, token(color)), token(color));
    const markerWidth = getComputedStyle($("td", r), "::before").borderInlineStartWidth;
    expectValue(`priority ${label}: row marker`, markerWidth, markerWidth === marker, marker);
  }
  if (highest) {
    check("priority highest: square", glyph(highest), "backgroundColor", "danger-solid", null, null, "::before");
    check("priority highest: cell text", glyph(highest), "color", "danger-fg", "bg-canvas", 4.5);
    const markerWidth = getComputedStyle($("td", highest), "::before").borderInlineStartWidth;
    expectValue("priority highest: row marker", markerWidth, markerWidth === "6px", "6px");
  } else push({ label: "priority highest", skipped: "no row" });

  // Status glyphs (6.5): ring on open rows, disc on closed rows.
  // An open row that still has the default status shape (a mapping in
  // custom.css may give other open rows other shapes and colors).
  const rowVar = (r, name) => getComputedStyle(r).getPropertyValue(name).trim();
  const resolved = (value) => {
    probe.style.color = "";
    probe.style.color = value;
    return getComputedStyle(probe).color;
  };
  const open = rows.find((r) => !r.classList.contains("closed") && rowVar(r, "--ravnus-status-fill") === "0" && rowVar(r, "--ravnus-status-check") === "0" && same(resolved(rowVar(r, "--ravnus-status-color")), token("status-open-color")));
  const closed = row(".closed");
  if (open) {
    const cs = getComputedStyle($("td.status", open), "::before");
    // 1.5px computes to 1px on a 1x screen (border widths snap to device pixels).
    expectValue("open status: ring", `${cs.borderTopWidth} ${cs.borderRadius}`, parseFloat(cs.borderTopWidth) >= 1 && parseFloat(cs.borderTopWidth) <= 1.5 && cs.borderRadius === "50%", "1-1.5px 50%");
    check("open status: color", $("td.status", open), "borderTopColor", "status-open-color", "bg-canvas", 3, "::before");
  }
  if (closed) {
    const cs = getComputedStyle($("td.status", closed), "::before");
    expectValue("closed status: disc", cs.borderTopWidth, parseFloat(cs.borderTopWidth) === 5, "5px");
    check("closed status: color", $("td.status", closed), "borderTopColor", "status-closed-color", "bg-canvas", 3, "::before");
    check("closed row text", $("td.status", closed), "color", "fg-subtle", "bg-canvas", 4.5);
  }
  // Tracker text follows the row variable (fg-muted unless mapped); closed
  // rows use the closed text color instead.
  const trackerRow = rows.find((r) => !r.classList.contains("closed") && $("td.tracker", r));
  if (trackerRow) {
    const want = resolved(rowVar(trackerRow, "--ravnus-tracker-color"));
    const value = getComputedStyle($("td.tracker", trackerRow)).color;
    push({ label: "tracker text", value, expected: want, contrast: contrast(value, token("bg-canvas")), ok: same(value, want) && contrast(value, token("bg-canvas")) >= 4.5 });
  }

  // Overdue and behind schedule (6.5).
  const overdue = row(".overdue");
  if (overdue && $("td.due_date", overdue)) {
    check("overdue date", $("td.due_date", overdue), "color", "danger-fg", "bg-canvas", 4.5);
    check("overdue glyph", $("td.due_date", overdue), "backgroundColor", "danger-solid", null, null, "::before");
  } else push({ label: "overdue", skipped: "no row or column" });
  const behind = rows.find((r) => r.matches(".behind-schedule:not(.overdue)") && $("td.due_date", r)?.textContent.trim());
  if (behind) {
    check("behind schedule date", $("td.due_date", behind), "color", "warning-fg", "bg-canvas", 4.5);
    const clip = getComputedStyle($("td.due_date", behind), "::before").clipPath;
    expectValue("behind schedule glyph: triangle", clip, clip.startsWith("polygon"), "polygon(...)");
  } else push({ label: "behind schedule", skipped: "no row or column" });

  // Progress bars (6.1).
  const bar = $("tr.issue:not(.behind-schedule) table.progress td.closed", table);
  if (bar) check("progress closed", bar, "backgroundColor", "progress-closed", "progress-track", 3);
  const behindBar = $("tr.issue.behind-schedule table.progress td.closed", table);
  if (behindBar) {
    const image = getComputedStyle(behindBar).backgroundImage;
    expectValue("progress behind: hatched", image.slice(0, 40), image.startsWith("repeating-linear-gradient"), "repeating-linear-gradient");
  }
  const todo = $("table.progress td.todo", table);
  if (todo) check("progress track", todo, "backgroundColor", "progress-track");
  const progressCell = $("td.done_ratio", table);
  if (progressCell) metrics.progressBar = round($("table.progress", progressCell)?.getBoundingClientRect().height ?? 0);

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
    check("group row surface", $("td", group), "backgroundColor", "bg-subtle");
    check("group name", $("span.name", group), "color", "fg-default", "bg-subtle", 4.5);
    check("group count", $("span.count", group), "color", "fg-muted", "bg-inset", 4.5);
    check("group totals", $("span.totals", group), "color", "fg-muted", "bg-subtle", 4.5);
    check("group totals value", $("span.totals .value", group), "color", "fg-default", "bg-subtle", 4.5);
    check("group toggle-all", $("a.toggle-all", group), "color", "link", "bg-subtle", 4.5);
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
    for (const td of $$("td:not(.checkbox):not(.buttons):not(.subject):not(.done_ratio)", r).filter((td) => td.textContent.trim())) {
      const c = contrast(getComputedStyle(td).color, token("accent-muted"));
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
    metrics.status2 = { color: cs.getPropertyValue("--ravnus-status-color").trim(), fill: cs.getPropertyValue("--ravnus-status-fill").trim(), check: cs.getPropertyValue("--ravnus-status-check").trim(), glyphBorder: getComputedStyle($("td.status", status2), "::before").borderTopWidth };
  }

  probe.remove();
  return { failed, checks, metrics };
}
