# RAVNUS — a Redmine theme

[한국어](README.ko.md)

RAVNUS is a free, open-source theme for Redmine 7.x. Its goal is to be the most readable Redmine theme for Korean, Japanese and Chinese (CJK) users.

> **Status: v0.1.0 in progress.** This release adds the design tokens and the CJK typography on top of the default Redmine look: font stacks per UI language, line breaking, line heights, text sizes, fonts in form controls and underlines for links in running text. The chrome (top bar, header and menus) comes in v0.2.0. Colors for links, buttons and lists come in later releases. Some gray text, the footer and avatar initials keep Redmine's own colors, which fall below WCAG AA contrast; they are recolored in later releases.

## Goals

- **CJK-first typography**: Pretendard as the default font, word-boundary line breaking (`word-break: keep-all`) and line heights tuned for Hangul. Japanese and Chinese UIs put the native CJK system fonts first.
- **Customizable without a build**: design tokens are CSS custom properties (`--ravnus-*`). You override them in `stylesheets/custom.css` or in a child theme, and updates keep your settings.
- **Follows Redmine core**: the theme imports the core stylesheet and only overrides it, so core upgrades carry over.
- **MIT licensed**: free to install, modify and redistribute.

## Requirements

- Redmine 7.x. Redmine 6.x and earlier are not supported.
- The browsers of your Redmine users load the Pretendard web font from jsDelivr (`cdn.jsdelivr.net`). Without access, text falls back to system fonts, and some networks need an extra setting. See [Fonts and the CDN](#fonts-and-the-cdn).

## Installation

1. Check that the browsers of your Redmine users can reach `cdn.jsdelivr.net`. On a typical client machine, open <https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css>. If the page does not load (closed network, firewall or filtering proxy), read [Closed networks](#closed-networks) first. The Redmine server itself does not need access.
2. Clone the theme into the `themes` directory of your Redmine installation. Redmine names a theme after its directory, so use `ravnus`:

   ```bash
   cd /path/to/redmine
   git clone https://github.com/RAVNUS-INC/Redmine-RAVNUS-theme.git themes/ravnus
   ```

3. Restart Redmine, then choose **Ravnus** in *Administration → Settings → Display → Theme*.

- Redmine compiles theme assets into `public/assets` when it starts, so the user running Redmine needs write access to that directory.
- If a restart does not pick up changed CSS (for example, files copied with old timestamps), run `touch` on the changed file and restart again. Redmine recompiles assets at boot only if some asset file is newer than its manifest.
- To update, run `git pull --autostash` in `themes/ravnus` and restart Redmine. See [Updating](#updating).

## Fonts and the CDN

### Pretendard

RAVNUS uses [Pretendard](https://github.com/orioncactus/pretendard), © Kil Hyung-jin, licensed under the [SIL Open Font License 1.1](https://openfontlicense.org) with the Reserved Font Name "Pretendard". The theme does not ship font files. Its stylesheet declares `@font-face` rules that load the unmodified dynamic subsets of Pretendard Variable 1.3.9 from jsDelivr, and browsers download only the subsets a page uses. The upstream copyright and license notice is kept in `stylesheets/application.css`.

Korean, English and other UIs use Pretendard first. Japanese, Simplified Chinese and Traditional Chinese UIs use the native CJK system fonts first and Pretendard only for Hangul.

### Privacy

- Each visitor's browser requests the fonts from jsDelivr directly, so jsDelivr receives the visitor's IP address.
- jsDelivr also receives the origin of your Redmine (scheme, host and port):
  - in the `Origin` header, because font requests are CORS requests;
  - in the `Referer` header. With the default headers of Redmine 7.0.2, it carries the Redmine origin without a path. Page paths were never sent.
- The `Referer` of a font request follows the referrer policy of the theme stylesheet, not of the page, so changing the policy of the pages has no effect. Sending `Referrer-Policy: no-referrer` on `/assets` responses removes `Referer`, but `Origin` is still sent. To send neither, [self-host the font](#self-hosting-the-font) or use [system fonts only](#system-fonts-only).
- These observations come from Chrome with Redmine 7.0.2 in a local test environment. Firefox and Safari have not been checked.

### Content Security Policy

If you set a Content Security Policy (for example in a reverse proxy), allow `font-src https://cdn.jsdelivr.net` or self-host the font. The theme loads no stylesheet from the CDN, so `style-src` needs no change. Redmine 7.0.2 with default settings sends no CSP header (checked in the Docker image).

### Closed networks

- If browsers cannot reach jsDelivr, text is shown in system fonts. To use Pretendard anyway, [self-host it](#self-hosting-the-font).
- If requests to jsDelivr fail at once (DNS failure, connection refused), system fonts are the only effect.
- **If your network drops requests to jsDelivr without an answer** (some firewalls and closed networks), you must add the [system fonts only](#system-fonts-only) block or [self-host the font](#self-hosting-the-font).
  - The symptom is not a blank page. Pages render normally, but each page's `load` event waits until the font requests time out. This took 225–300 seconds on macOS in our tests; the delay depends on the operating system and the network.
  - Redmine turns on its warning about unsaved changes only at `load`. Until then, leaving a page while you edit loses your input without a warning. A text area you typed in and left before `load` is not protected afterwards either.

### Mainland China

Self-hosting is recommended. jsDelivr announced on 2021-12-20 that it had lost its ICP license in China. Its maintainers said that traffic from mainland China is since served from CDN nodes outside the mainland and can be slow ([jsdelivr/jsdelivr#18348](https://github.com/jsdelivr/jsdelivr/issues/18348), [#18552](https://github.com/jsdelivr/jsdelivr/issues/18552)). Current speed and availability from mainland China have not been checked.

### Caching

jsDelivr serves the fonts with its own one-year cache headers. In the Docker image of Redmine 7.0.2, `/assets` responses (the theme CSS, and fonts you self-host inside a theme) have no `Cache-Control` header. Set `Cache-Control: public, max-age=31536000, immutable` for `/assets` in your reverse proxy. The file names carry a content digest, so long caching is safe.

## Customization

Every design token is a CSS custom property named `--ravnus-*`. The theme declares the defaults on `:where(:root)`, which has zero specificity, so any `:root { … }` block you write wins. No build is needed.

Do not edit `stylesheets/application.css`. It is the compiled stylesheet, and every update replaces it.

### custom.css

`stylesheets/custom.css` is an empty file tracked in the repository. The theme imports it right after the Redmine core stylesheet. Write your tokens there and restart Redmine:

```css
:root {
  --ravnus-accent: #0b6e4f;
  --ravnus-topbar-fg-muted: #d3e6df;  /* change with the accent (see below) */
  --ravnus-topbar-focus: #ffffff;     /* change with the accent (see below) */
}
```

- Set tokens on `:root`. Derived tokens (hover, active and tinted colors) are computed where they are declared, so they follow knobs set on `:root`.
- Write literal values. A `color-mix()` in your block has no fallback in browsers without `color-mix()`, and the theme's fallback values follow the defaults, not your knobs.
- `custom.css` loads before the theme rules. To override a theme rule that is not a token, use a selector one step more specific than the theme's.
- The top bar, styled from v0.2.0, follows `--ravnus-accent`. `--ravnus-topbar-fg-muted` (`#CAC5EA`) and `--ravnus-topbar-focus` (`#FEA800`, an amber focus ring) are fixed values for the default violet, so set them whenever you change the accent. On `#0b6e4f`, the default muted text would have a contrast of 3.78:1 (AA needs 4.5:1) and the amber ring 3.22:1.
- Restart Redmine after every edit. Redmine recompiles assets at boot only if a file is newer than its manifest. If you copy `custom.css` with its old timestamp (`cp -p`, `rsync -a`, an archive that keeps times), `touch` it and restart again. Files saved by an editor or by `git pull` are fine.

### Updating

The upstream `custom.css` stays empty, so updates never conflict with your edits:

- Run `git pull --autostash` in `themes/ravnus`, then restart Redmine. A plain `git pull` also works with git's default merge setting, but refuses because of unstaged changes when `pull.rebase` is `true`. You can also commit your edits on a local branch and run `git pull --rebase`.
- Reinstalling from a zip archive overwrites `custom.css`. Keep a copy, or use a child theme.

### Child theme

A child theme keeps your settings out of the theme directory, for example in a separate private repository for your organization. It is also the recommended place for self-hosted fonts.

```text
themes/
├── ravnus/              # this theme; the directory must be named ravnus
└── mytheme/
    └── stylesheets/
        └── application.css
```

```css
/* themes/mytheme/stylesheets/application.css */
@import url(../ravnus/application.css);

:root {
  --ravnus-accent: #0b6e4f;
  --ravnus-topbar-fg-muted: #d3e6df;
  --ravnus-topbar-focus: #ffffff;
}
```

Restart Redmine and choose the child theme (here shown as **Mytheme**) in *Administration → Settings → Display → Theme*.

- Write the import exactly as `@import url(../ravnus/application.css);`. `@import url(/themes/ravnus/application.css);` also works. Redmine rewrites either one at boot to the compiled parent stylesheet.
- These forms do **not** work: the Redmine 5.x path `@import url(../../ravnus/stylesheets/application.css);` and the string form `@import "../ravnus/application.css";`. Redmine does not rewrite them, the import fails with 404, and the page loses all styles.
- If the child theme and the parent `custom.css` set the same token, the child theme wins (same specificity, later in the cascade). After you edit the parent `custom.css`, restart Redmine; the child theme picks up the change too.

### Font stacks

Four tokens hold the UI font stacks: `--ravnus-font-sans` (Korean, English and other UIs), `--ravnus-font-sans-ja`, `--ravnus-font-sans-zh` and `--ravnus-font-sans-zh-tw`. All four name the CDN font `"Pretendard Variable"`. A browser requests a web font only when a stack in use names it. To stop requests to jsDelivr, replace `"Pretendard Variable", Pretendard` in **all four** stacks. If you replace only `--ravnus-font-sans`, Japanese and Chinese UIs still request Pretendard for Hangul.

#### System fonts only

Put this block in `custom.css` or a child theme. With it, no font is requested from jsDelivr.

```css
:root {
  --ravnus-font-sans: -apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo", "Malgun Gothic",
    "Noto Sans KR", "Noto Sans CJK KR", "Segoe UI", Roboto, "Helvetica Neue", "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
  --ravnus-font-sans-ja: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans",
    "Hiragino Kaku Gothic ProN", "RAVNUS Yu Gothic", Meiryo, "Noto Sans JP", "Noto Sans CJK JP", sans-serif;
  --ravnus-font-sans-zh: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", sans-serif;
  --ravnus-font-sans-zh-tw: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC",
    "Microsoft JhengHei UI", "Microsoft JhengHei", "Noto Sans CJK TC", "Source Han Sans TC", sans-serif;
}
```

#### Self-hosting the font

1. Get `PretendardVariable.woff2` from the Pretendard 1.3.9 release. In the npm package it is `dist/web/variable/woff2/PretendardVariable.woff2` (about 2 MB), and the license text is `dist/LICENSE.txt`. Do not modify the font file.
2. Put both files in `themes/mytheme/fonts/` of a child theme. Keep the license text next to the font.
3. Declare the font under your own family name. The OFL reserves the name "Pretendard", so do not use it in the alias. Then replace `"Pretendard Variable", Pretendard` in all four stacks with the alias:

```css
/* themes/mytheme/stylesheets/application.css */
@import url(../ravnus/application.css);

@font-face {
  font-family: "RAVNUS Sans Local";
  font-weight: 45 920;
  font-display: swap;
  src: url(../fonts/PretendardVariable.woff2) format("woff2-variations");
}

:root {
  --ravnus-font-sans: "RAVNUS Sans Local", -apple-system, BlinkMacSystemFont, system-ui,
    "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "Noto Sans CJK KR", "Segoe UI", Roboto,
    "Helvetica Neue", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
  --ravnus-font-sans-ja: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans",
    "Hiragino Kaku Gothic ProN", "RAVNUS Yu Gothic", Meiryo, "Noto Sans JP", "Noto Sans CJK JP",
    "RAVNUS Sans Local", sans-serif;
  --ravnus-font-sans-zh: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC",
    "RAVNUS Sans Local", sans-serif;
  --ravnus-font-sans-zh-tw: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC",
    "Microsoft JhengHei UI", "Microsoft JhengHei", "Noto Sans CJK TC", "Source Han Sans TC",
    "RAVNUS Sans Local", sans-serif;
}
```

- Redmine rewrites `url(../fonts/PretendardVariable.woff2)` at boot to `/assets/themes/mytheme/PretendardVariable-<digest>.woff2`.
- To self-host with `custom.css` instead, put the same `@font-face` and `:root` blocks in `custom.css` and the files in an untracked directory such as `themes/ravnus/fonts/`. Untracked files survive `git pull` but not a reinstall from a zip archive, so organizations should prefer a child theme.

### Tokens

These knobs take effect in this release:

| Token | Default | What it changes |
|-------|---------|-----------------|
| `--ravnus-accent` | `#46009B` | Marker of the selected main menu tab; base of the `em` tint |
| `--ravnus-link` | `#215DB3` | Underline color of links in running text (the link text color comes in a later release) |
| `--ravnus-bg-canvas` | `#FFFFFF` | Base of the tinted colors, such as the `em` tint |
| `--ravnus-radius` | `6px` | Corners of code blocks in wiki text |
| `--ravnus-font-sans` | Pretendard first | UI font stack in Korean, English and other UIs |
| `--ravnus-font-sans-ja`, `--ravnus-font-sans-zh`, `--ravnus-font-sans-zh-tw` | Native CJK fonts first, Pretendard for Hangul | UI font stacks in Japanese, Simplified Chinese and Traditional Chinese UIs |
| `--ravnus-font-mono` | `ui-monospace, …` | Code font stack |
| `--ravnus-font-feature-settings` | `normal` | OpenType features of body text |
| `--ravnus-word-break` | `keep-all` (unset, so `normal`, in Japanese and Chinese UIs) | Line breaking; `normal` lets Korean break between syllables |
| `--ravnus-font-size-cell` | `0.8125rem` | Text in list tables |
| `--ravnus-font-size-cell-subject` | `0.875rem` | Subject column of the issue list |
| `--ravnus-subject-min-inline-size` | `12em` | Minimum width of the subject column |

- The comment at the top of `stylesheets/application.css` lists every knob. Knobs marked `*` there (top bar, header, sidebar position, row padding and stripes and others) are read only by styles that come in later releases.
- Every other token, for example `--ravnus-font-size-base` (`0.875rem`, body and form controls) or `--ravnus-line-height-prose` (`1.7`, wiki text), is in the `:where(:root)` blocks of the same file and can be overridden the same way.

## Development

Requirements: Node.js 20.19 or later, Docker with Compose v2, and Google Chrome for the probe.

```bash
npm install
npm run build   # compile src/ into stylesheets/application.css
npm run watch   # rebuild on every change
npm run check   # the CI checks: build comparison, font check, contrast gate
```

Sources live in `src/` (Dart Sass with `@use` modules). Redmine serves CSS as is and does not compile Sass, so commit the compiled `stylesheets/application.css` together with your source changes. The build (`src/tools/build.mjs`) writes that file only when the compile succeeds; after an error it leaves the file as it was and exits with status 1.

Work in a separate clone, not in the `themes/ravnus` directory of a running Redmine. Redmine publishes every theme subdirectory except `src/` and dot-directories as assets, so `node_modules/` would be served too and would slow down every boot.

Development dependencies: `sass` (MIT), `playwright-core` (Apache-2.0) and `axe-core` (MPL-2.0). They are used for building and checking only and are not part of the theme that Redmine serves.

### Pretendard version

`src/_pretendard.scss` is generated; do not edit it by hand. The Pretendard version is stored only in `PRETENDARD_VERSION` in `src/tools/pretendard-font-face.mjs`. To move to a new release:

1. Change `PRETENDARD_VERSION`.
2. Run `npm run fonts`. It downloads the upstream stylesheet from jsDelivr, validates it, checks that every font URL answers, and rewrites `src/_pretendard.scss`.
3. Run `npm run build` and commit both files.

The checks read the version and the rule count from the repository, so they need no edit. The generator also records a SHA-256 of the rules in the file header, so `npm run check:fonts` fails if the rules were edited by hand.

### Checks and CI

- `npm run check:build` rebuilds `stylesheets/application.css` and fails if the result differs from the version in the git index or if the file is not tracked. Stage your source and compiled changes before you run it locally.
- `npm run check:fonts` checks the compiled CSS: the CDN `@font-face` rules match the generated file, every font URL starts with the pinned jsDelivr prefix, no stylesheet is imported from another host, the first two rules are the core import and the `custom.css` import, and `"Pretendard Variable"` appears only in `@font-face` rules and the four font stack tokens.
- `npm run check:contrast` checks the WCAG 2.x contrast of token pairs for the defaults and every preset. Add `-- --verbose` to list every pair.
- GitHub Actions (`.github/workflows/ci.yml`) runs `npm ci` and `npm run check` for every pull request and every push to `main`. It uses no secrets.

### Probe

`npm run probe` opens pages of a running Redmine in headless Chrome and writes a JSON report: computed styles and boxes, the fonts in use, font requests with their size and `Referer`, paint and load times, and optionally style assertions, axe-core results and screenshots.

```bash
npm run probe -- --help
npm run probe -- --locales ko,ja,zh,zh-TW,en --out "$TMPDIR/ravnus-probe/typography.json" @core
npm run probe -- --block none,abort,hang --viewports 1440 @core
npm run probe -- --autologin --axe @admin
```

- It targets http://127.0.0.1:3007 by default; change it with `--base-url`. It uses the installed Google Chrome (`RAVNUS_PROBE_CHROME` for another build) and never downloads a browser.
- `--block abort` makes requests to jsDelivr fail at once, and `--block hang` leaves them unanswered, like a network that drops packets.
- `--autologin` logs in as admin without a password. It creates an autologin token with `bin/rails runner` in the container and deletes it when the probe ends.
- Pretendard comes from the CDN, so measurements that depend on it need internet access.
- Write `--out` and `--screenshot` outside the repository.

### Test environment

`docker-compose.yml` runs Redmine 7 (`redmine:7.0.2`) with this theme mounted:

```bash
docker compose up -d
```

Open http://localhost:3007.

- The first start loads the Korean default configuration, creates sample projects, issues, wiki pages and news in Korean, Japanese, Chinese and English, and activates the theme. All sample people and texts are fictional.
- Sign in with the default Redmine administrator account (`admin` / `admin`). The ports listen on 127.0.0.1 only.
- After `npm run build`, run `docker compose restart`. Redmine recompiles theme assets when it starts.
- `docker compose down -v` deletes the sample data; the next `docker compose up -d` seeds it again.
- The image is pinned to a patch release. To test a newer 7.x patch, change the tag in `docker-compose.yml`.
- Set `REDMINE_PORT` to use another port.

## License

[MIT](LICENSE) © RAVNUS Inc.

Redmine is licensed under GPL-2.0. This theme does not copy Redmine code; it imports the core stylesheet at runtime.

Pretendard is licensed under the SIL Open Font License 1.1. The theme does not include the font files; see [Pretendard](#pretendard).
