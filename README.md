# RAVNUS — a Redmine theme

[한국어](README.ko.md)

RAVNUS is a free, open-source theme for Redmine 7.x. Its goal is to be the most readable Redmine theme for Korean, Japanese and Chinese (CJK) users.

> **Status: early development.** The build pipeline and the test environment are ready, and the visual design is in progress. Right now the theme switches the base font to a Pretendard-first stack on top of the default Redmine look.

## Goals

- **CJK-first typography**: Pretendard as the default font, word-boundary line breaking (`word-break: keep-all`) and line heights tuned for Hangul.
- **Customizable without a build**: design tokens are CSS custom properties (`--ravnus-*`). An update-safe override file is planned; for now the tokens sit at the top of the compiled stylesheet.
- **Follows Redmine core**: the theme imports the core stylesheet and only overrides it, so core upgrades carry over.
- **MIT licensed**: free to install, modify and redistribute.

## Requirements

- Redmine 7.x. Redmine 6.x and earlier are not supported.

## Installation

Clone the theme into the `themes` directory of your Redmine installation. Redmine names a theme after its directory, so use `ravnus`:

```bash
cd /path/to/redmine
git clone https://github.com/RAVNUS-INC/Redmine-RAVNUS-theme.git themes/ravnus
```

Restart Redmine, then choose **Ravnus** in *Administration → Settings → Display → Theme*.

- Redmine compiles theme assets into `public/assets` when it starts, so the user running Redmine needs write access to that directory.
- If a restart does not pick up changed CSS (for example, files copied with old timestamps), run `touch` on the changed file and restart again. Redmine recompiles assets at boot only if some asset file is newer than its manifest.
- To update, run `git pull` in `themes/ravnus` and restart Redmine. If you edited the stylesheet, read [Customization](#customization) first.

## Customization

The `:where(:root)` block at the top of `stylesheets/application.css` holds the design tokens. Edit a value there and restart Redmine; no build step is needed.

> **Your edits are overwritten on update.** `stylesheets/application.css` is a tracked file that changes with every release, so `git pull` stops with "local changes would be overwritten", and `git pull --autostash` can leave conflict markers in the stylesheet Redmine serves. Before updating, keep a copy of the values you changed, run `git checkout -- stylesheets/application.css && git pull`, re-apply your values and restart Redmine. An update-safe override file (`custom.css`) is planned.

| Token | Purpose |
|-------|---------|
| `--ravnus-font-sans` | Base font stack (Pretendard first) |

## Development

Requirements: Node.js 20.19 or later, and Docker with Compose v2.

```bash
npm install
npm run build   # compile src/ into stylesheets/application.css
npm run watch   # rebuild on every change
```

Sources live in `src/` (Dart Sass with `@use` modules). Redmine serves CSS as is and does not compile Sass, so commit the compiled `stylesheets/application.css` together with your source changes.

Work in a separate clone, not in the `themes/ravnus` directory of a running Redmine. Redmine publishes every theme subdirectory except `src/` and dot-directories as assets, so `node_modules/` would be served too and would slow down every boot.

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
