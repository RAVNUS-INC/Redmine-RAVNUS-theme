// Chrome checks for `npm run probe -- --eval-file .docker/probe/chrome-check.js`
// (DESIGN.md 9 Phase 2, 10.2 item 3).
//
// Runs in the page. Each check compares the computed color of a chrome element
// with the token it should come from, resolved in the same page (so presets
// injected with --inject-css are followed), and the contrast with its surface.
// At 900px and wider it opens the account dropdown when logged in; below
// 900px it opens the flyout. Both stay open for the screenshot that follows.
// The result is { failed, checks, metrics }; a check fails when the color
// differs from the token or the contrast is below its minimum.
async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const probe = document.createElement("div");
  probe.style.display = "none";
  document.body.append(probe);

  // A token resolved to the computed rgb() string the browser would paint.
  const token = (name) => {
    probe.style.color = "";
    probe.style.color = `var(--ravnus-${name})`;
    return getComputedStyle(probe).color;
  };

  // Any computed color (rgb(), or oklch() from color-mix()) to sRGB bytes,
  // through a canvas as the browser paints it.
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
  const over = (top, bottom) => ({
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
    a: 1,
  });
  const lum = (c) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const contrast = (fg, bg) => {
    const a = rgba(fg);
    const b = rgba(bg);
    if (!a || !b) return null;
    const top = a.a < 1 ? over(a, b) : a;
    const [hi, lo] = [lum(top), lum(b)].sort((x, y) => y - x);
    return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
  };
  const same = (a, b) => {
    const x = rgba(a);
    const y = rgba(b);
    return !!x && !!y && ["r", "g", "b"].every((k) => Math.abs(x[k] - y[k]) <= 1) && Math.abs(x.a - y.a) < 0.02;
  };

  const checks = [];
  const failed = [];
  // prop: computed property; want: token name; on: surface token for the
  // contrast; min: minimum contrast (omit for decorative lines).
  const check = (label, el, prop, want, on, min, pseudo) => {
    if (!el) {
      checks.push({ label, skipped: "no element" });
      return;
    }
    const cs = getComputedStyle(el, pseudo);
    const value = cs[prop];
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
    checks.push(entry);
    if (!entry.ok) failed.push(label);
  };
  const expectValue = (label, actual, expected) => {
    const ok = actual === expected;
    checks.push({ label, value: actual, expected, ok });
    if (!ok) failed.push(label);
  };
  const $ = (s) => document.querySelector(s);
  const rect = (s) => {
    const el = $(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return Math.round(r.height * 100) / 100;
  };

  const desktop = innerWidth >= 900;
  const loggedIn = !!$(".flyout-menu__avatar");
  const root = getComputedStyle(document.documentElement);
  const metrics = {
    width: innerWidth,
    loggedIn,
    bridge: {
      "--color-header-background": root.getPropertyValue("--color-header-background").trim(),
      "--color-top-menu-background": root.getPropertyValue("--color-top-menu-background").trim(),
    },
  };

  if (desktop) {
    const top = $("#top-menu");
    const header = $("#header");
    check("top bar background", top, "backgroundColor", "topbar-bg");
    check("top bar text", top, "color", "topbar-fg-muted", "topbar-bg", 4.5);
    document.querySelectorAll("#top-menu a:not(.dropdown-content a)").forEach((a, i) => {
      check(`top bar link ${i} ${a.className || a.textContent.trim()}`, a, "color", "topbar-fg", "topbar-bg", 4.5);
    });
    document.querySelectorAll("#top-menu svg.icon-svg:not(.dropdown-content svg)").forEach((svg, i) => {
      check(`top bar icon ${i}`, svg, "stroke", "topbar-fg", "topbar-bg", 3);
    });
    check("header background", header, "backgroundColor", "header-bg");
    check("header text", header, "color", "header-fg", "header-bg", 4.5);
    check("header top line", header, "borderTopColor", "header-divider");
    check("current project", $("#header h1 .current-project"), "color", "header-fg", "header-bg", 4.5);
    check("h1 text", $("#header h1"), "color", "header-fg", "header-bg", 4.5);
    check("breadcrumbs", $("#header h1 .breadcrumbs"), "color", "header-fg-muted", "header-bg", 4.5);
    document.querySelectorAll("#header h1 .breadcrumbs a").forEach((a, i) => {
      check(`breadcrumb link ${i}`, a, "color", "header-fg-muted", "header-bg", 4.5);
    });
    check("search label", $("#quick-search form label"), "color", "header-fg-muted", "header-bg", 4.5);
    check("search label link", $("#quick-search form label a"), "color", "header-fg-muted", "header-bg", 4.5);
    // A white header needs the field border as the edge; on a dark header the
    // canvas field itself is the edge (DESIGN.md 6.3, 6.6).
    const lightHeader = lum(rgba(token("header-bg"))) > 0.4;
    check("search field border", $("#quick-search #q"), "borderTopColor", "header-control-border", "header-bg", lightHeader ? 3 : undefined);
    check("search field on header", $("#quick-search #q"), "backgroundColor", "bg-canvas", "header-bg", lightHeader ? undefined : 3);
    check("search field border on canvas", $("#quick-search #q"), "borderTopColor", "header-control-border", "bg-canvas", 3);
    check("search field surface", $("#quick-search #q"), "backgroundColor", "bg-canvas");
    check("project jump border", $("#project-jump .drdn-trigger"), "borderTopColor", "header-control-border", "header-bg", lightHeader ? 3 : undefined);
    check("project jump surface", $("#project-jump .drdn-trigger"), "backgroundColor", "bg-canvas");
    check("project jump text", $("#project-jump .drdn-trigger"), "color", "fg-default", "bg-canvas", 4.5);
    const menu = $("#main-menu");
    check("menu bar background", menu, "backgroundColor", "nav-bg");
    check("menu bar top line", menu, "borderTopColor", "header-divider");
    check("menu bar bottom line", menu, "borderBottomColor", "nav-border");
    document.querySelectorAll("#main-menu > ul > li > a:not(.new-object):not(.selected)").forEach((a, i) => {
      if (i < 3) check(`menu tab ${i}`, a, "color", "fg-muted", "nav-bg", 4.5);
    });
    check("selected tab", $("#main-menu li a.selected"), "color", "fg-default", "bg-canvas", 4.5);

    // Focus ring of the search field: the core removes the outline (0,2,1).
    const q = $("#quick-search #q");
    if (q) {
      q.focus();
      await wait(50);
      const cs = getComputedStyle(q);
      checks.push({ label: "search field focus outline", value: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` });
      check("search field focus ring", q, "outlineColor", "header-focus", "header-bg", 3);
      expectValue("search field focus outline style", cs.outlineStyle, "solid");
      q.blur();
    }

    metrics.heights = {
      topBar: rect("#top-menu"),
      header: rect("#header"),
      menuBar: rect("#main-menu"),
      tab: rect("#main-menu > ul > li > a:not(.new-object)"),
      h1: rect("#header h1"),
      quickSearch: rect("#quick-search"),
      projectJump: rect("#project-jump"),
      searchForm: rect("#quick-search form"),
    };
    metrics.heights.chrome = Math.round(((metrics.heights.topBar || 0) + (metrics.heights.header || 0)) * 100) / 100;
    metrics.nav = {
      headerPaddingBottom: header && getComputedStyle(header).paddingBottom,
      menuHeight: menu && getComputedStyle(menu).height,
    };
    metrics.lineHeights = {
      h1: $("#header h1") && getComputedStyle($("#header h1")).lineHeight,
      tab: $("#main-menu li a") && getComputedStyle($("#main-menu li a")).lineHeight,
    };

    // Focus rings: top bar links in topbar-focus inside the link (so the ring
    // stays on the bar), header links in header-focus, tabs in focus-ring.
    const ring = async (label, el, want, on, offset) => {
      if (!el) {
        checks.push({ label, skipped: "no element" });
        return;
      }
      el.focus();
      await wait(30);
      const cs = getComputedStyle(el);
      check(label, el, "outlineColor", want, on, 3);
      expectValue(`${label} style`, `${cs.outlineStyle} ${cs.outlineWidth}`, "solid 2px");
      if (offset !== undefined) expectValue(`${label} offset`, cs.outlineOffset, offset);
      el.blur();
    };
    await ring("top bar link focus ring", $("#top-menu .top-menu__links a"), "topbar-focus", "topbar-bg", "-2px");
    await ring("breadcrumb link focus ring", $("#header h1 .breadcrumbs a"), "header-focus", "header-bg");
    await ring("search label link focus ring", $("#quick-search form label a"), "header-focus", "header-bg");
    await ring("menu tab focus ring", $("#main-menu > ul > li > a:not(.selected):not(.new-object)"), "focus-ring", "nav-bg", "-2px");

    // Project jump list: overlay surface and text (the core uses !important),
    // and the focus ring of its search field, which gets the focus on open.
    const jumpTrigger = $("#project-jump .drdn-trigger");
    if (jumpTrigger) {
      jumpTrigger.click();
      await wait(300);
      const content = $("#project-jump .drdn-content");
      check("project jump list surface", content, "backgroundColor", "bg-overlay");
      const items = [...document.querySelectorAll("#project-jump .drdn-items > a")].slice(0, 4);
      items.forEach((a, i) => check(`project jump item ${i}`, a, "color", "fg-default", "bg-overlay", 4.5));
      metrics.projectJumpItems = items.length;
      await ring("project jump search focus ring", $("#projects-quick-search"), "focus-ring", "bg-overlay", "1px");
      jumpTrigger.click();
      await wait(100);
    }

    // Long Korean and Japanese project names must not run under the quick
    // search or into the menu bar. The text is restored afterwards.
    const current = $("#header h1 .current-project");
    if (current) {
      const saved = current.textContent;
      current.textContent = "띄어쓰기없이아주길게이어지는프로젝트이름과とても長い日本語のプロジェクト名が続く場合の表示確認".repeat(2);
      await wait(50);
      const h1Box = $("#header h1").getBoundingClientRect();
      const searchBox = $("#quick-search").getBoundingClientRect();
      const menuBox = menu && menu.getBoundingClientRect();
      const overlapsSearch = h1Box.right > searchBox.left + 0.5 && h1Box.left < searchBox.right - 0.5;
      const overlapsMenu = !!menuBox && h1Box.bottom > menuBox.top + 0.5;
      expectValue("long project name stays clear of the quick search", overlapsSearch, false);
      expectValue("long project name stays above the menu bar", overlapsMenu, false);
      metrics.longName = { h1Right: Math.round(h1Box.right), searchLeft: Math.round(searchBox.left), h1Bottom: Math.round(h1Box.bottom), menuTop: menuBox && Math.round(menuBox.top), headerHeight: rect("#header") };
      current.textContent = saved;
    }

    // Account dropdown (logged in): overlay surface, overlay text, not the
    // top bar colors. Left open for the screenshot.
    const trigger = $("#account .dropdown-trigger");
    if (trigger) {
      check("account trigger", trigger, "color", "topbar-fg", "topbar-bg", 4.5);
      check("account trigger icon", $("#account .dropdown-trigger .icon-svg"), "stroke", "topbar-fg", "topbar-bg", 3);
      trigger.click();
      await wait(150);
      const content = $("#account .dropdown-content");
      check("account dropdown surface", content, "backgroundColor", "bg-overlay");
      document.querySelectorAll("#account .dropdown-content a").forEach((a, i) => {
        check(`account dropdown item ${i}`, a, "color", "fg-default", "bg-overlay", 4.5);
      });
      await ring("account dropdown item focus ring", $("#account .dropdown-content a"), "focus-ring", "bg-overlay", "-2px");
      metrics.accountDropdownOpen = content && !content.classList.contains("hidden");
    }
  } else {
    const header = $("#header");
    check("mobile header background", header, "backgroundColor", "header-bg");
    check("mobile header bottom line", header, "borderBottomColor", "header-divider");
    expectValue("mobile header top line width", header && getComputedStyle(header).borderTopWidth, "0px");
    const toggle = $("#header a.mobile-toggle-button");
    check("menu toggle", toggle, "color", "header-fg", "header-bg", 4.5);
    check("menu toggle divider", toggle, "borderLeftColor", "header-divider");
    expectValue(
      "menu toggle outside the header link rule (no hover underline)",
      !!toggle && toggle.matches("#header a:not(#main-menu a, #project-jump .drdn-content a, .mobile-toggle-button)"),
      false,
    );
    const jump = $("#project-jump .drdn-trigger");
    check("project jump title", jump, "color", "header-fg", "header-bg", 4.5);
    expectValue("project jump title background", jump && getComputedStyle(jump).backgroundColor, "rgba(0, 0, 0, 0)");
    check("project jump caret", jump, "color", "header-fg-muted", "header-bg", 4.5, "::before");
    expectValue("project jump caret opacity", jump && getComputedStyle(jump, "::before").opacity, "1");
    metrics.heights = { header: rect("#header") };

    // Open the flyout (responsive.js) and check it. Left open.
    const toggleButton = $(".js-flyout-menu-toggle-button");
    if (toggleButton && !document.documentElement.classList.contains("flyout-is-active")) toggleButton.click();
    await wait(400);
    metrics.flyoutOpen = document.documentElement.classList.contains("flyout-is-active");
    const fly = $(".flyout-menu");
    check("flyout surface", fly, "backgroundColor", "topbar-bg");
    check("flyout text", fly, "color", "topbar-fg", "topbar-bg", 4.5);
    document.querySelectorAll(".flyout-menu h3").forEach((h3, i) => {
      check(`flyout h3 ${i} band`, h3, "backgroundColor", "header-bg");
      check(`flyout h3 ${i} text`, h3, "color", "header-fg", "header-bg", 4.5);
      check(`flyout h3 ${i} top line`, h3, "borderTopColor", "header-divider");
      check(`flyout h3 ${i} bottom line`, h3, "borderBottomColor", "header-divider");
    });
    const links = [...document.querySelectorAll(".flyout-menu a")].filter((a) => a.offsetParent !== null);
    links.slice(0, 8).forEach((a, i) => {
      check(`flyout link ${i} ${a.textContent.trim().slice(0, 20)}`, a, "color", "topbar-fg", "topbar-bg", 4.5);
    });
    metrics.flyoutLinks = links.length;
    const badLinks = links.filter((a) => !same(getComputedStyle(a).color, token("topbar-fg")));
    expectValue("all visible flyout links use topbar-fg", badLinks.length, 0);
    const icons = [...document.querySelectorAll(".flyout-menu :is(.icon, .icon-only) svg")].filter((s) => s.getBoundingClientRect().width > 0);
    const badIcons = icons.filter((s) => !same(getComputedStyle(s).stroke, token("topbar-fg")));
    checks.push({ label: "flyout icons", count: icons.length });
    expectValue("all flyout icons use topbar-fg", badIcons.length, 0);
    const search = $(".flyout-menu .flyout-menu__search input[type='text']");
    check("flyout search border on canvas", search, "borderTopColor", "header-control-border", "bg-canvas", 3);
    // A light flyout (Calm) needs the border as the edge; a dark one has the
    // canvas field itself (DESIGN.md 8.6).
    const lightSurface = lum(rgba(token("topbar-bg"))) > 0.4;
    check("flyout search border on surface", search, "borderTopColor", "header-control-border", "topbar-bg", lightSurface ? 3 : undefined);
    check("flyout search surface", search, "backgroundColor", "bg-canvas");
    check("flyout search field on surface", search, "backgroundColor", "bg-canvas", "topbar-bg", lightSurface ? undefined : 3);
    check("flyout search magnifier", $(".flyout-menu .search-magnifier--flyout svg"), "stroke", "fg-icon", "bg-canvas", 3);
    const divider = $(".flyout-menu ul li:nth-child(2) a");
    if (divider) checks.push({ label: "flyout item divider", value: getComputedStyle(divider).borderTopColor });
  }

  probe.remove();
  return { failed, checks, metrics };
}
