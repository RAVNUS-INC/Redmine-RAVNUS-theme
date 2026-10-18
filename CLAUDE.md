# RAVNUS — Redmine 테마 프로젝트 규칙

Redmine 7.x용 오픈소스(MIT) 테마. "한중일(CJK) 사용자에게 가장 읽기 좋은 Redmine 테마"를 목표로 한다.
아래 결정 사항은 확정된 프로젝트 규칙이다. 결정을 바꿀 때는 이 문서를 먼저 갱신한다.

## 라이선스

- MIT로 공개한다 (`LICENSE`, 저작권자 RAVNUS Inc.).
- Opale(AGPL-3.0) 코드를 복사하거나 포크하지 않는다. 포크하면 AGPL을 물려받아 MIT로 낼 수 없다. 아이디어 참고는 가능하고 코드는 직접 작성한다.
- Redmine 코어 CSS(GPL-2.0) 블록을 복붙하지 않는다. 코어는 `@import`로만 불러오고 필요한 셀렉터는 새로 작성한다.

## 지원 범위

- Redmine 7.x만 지원한다(2026-10-01 결정. 소유자가 Redmine 7을 쓰므로 6.x 지원을 중단했다).
- 6.x 이하는 지원하지 않는다. 5.x는 테마·import 경로가 다르고, 6.x는 크롬 마크업과 코어 변수가 7과 달라 함께 맞추는 비용이 크다.
- 테스트 기준은 도커의 `redmine:7.0.2`다. 패치 버전을 올릴 때는 compose 태그와 `DESIGN.md`의 코어 인용(행 번호)을 함께 확인한다.

## 구조: 코어 import + override

- 코어를 통째로 복사하는 포크 방식이 아니라, 코어 `application.css`를 import하고 그 위에 덮어쓴다.
- 코어 업그레이드는 그대로 따라가고, 테마는 스타일 레이어만 관리한다.

## 스타일 작성: SCSS + CSS 변수

- **SCSS는 작성용이다.** 컴포넌트별 partial로 나누고, 공통 스타일은 mixin으로 작성한다. 우선순위 위치 클래스(`priority-lowest` 등)와 태그 색 이름은 map + `@each`로 만든다. 설치마다 id가 다른 상태·트래커 색은 사용자 CSS(`custom.css`)의 행 매핑으로 제공한다.
- **CSS 변수는 사용자 커스터마이즈용이다.** 색·폰트·라운드·간격 등 디자인 토큰은 SCSS 변수가 아니라 `--ravnus-*` CSS 변수로 출력한다. 기본 토큰은 명시도 0인 `:where(:root)`에 선언해, 사용자가 빌드 없이 `stylesheets/custom.css`나 자식 테마의 `:root { … }`로 덮어 브랜드를 바꿀 수 있어야 한다.
- **Dart Sass + `@use`/`@forward` 모듈 문법만 쓴다.** Sass `@import`는 deprecated이므로 금지한다. 빌드 스크립트(`src/tools/build.mjs`, `npm run build`)가 이 deprecation을 에러로 처리해 막는다(`fatalDeprecations: ["import"]`, CLI의 `--fatal-deprecation=import`).
- **코어 import**는 `@import url(../../../stylesheets/application.css);`로 쓰고, 컴파일 결과 파일의 첫 줄이어야 한다.
  - 반드시 `url()` 형태로 쓴다. Redmine은 테마 CSS의 `url()`만 재작성하므로 `@import "..."` 문자열 형태는 동작하지 않는다.
  - Sass는 `@use` 앞에 어떤 규칙도 허용하지 않으므로, 엔트리(`src/application.scss`)에서는 `@use` 뒤에 쓴다. Dart Sass가 plain CSS import를 출력 맨 위로 끌어올린다.
  - 출력에 비ASCII 문자가 있으면 Sass가 `@charset`을 첫 줄에 넣으므로 빌드는 charset 출력을 끈다(`charset: false`, CLI의 `--no-charset`).
  - 빌드는 Sass CLI가 아니라 `src/tools/build.mjs`(Sass JS API)로 한다. 컴파일에 성공했을 때만 `stylesheets/application.css`를 쓰고, 실패하면(예: 파생값 sRGB 검사) 파일을 그대로 두고 종료 코드 1을 낸다. Sass CLI는 실패하면 출력 파일을 오류 표시용 CSS로 바꾸고, `--no-error-css`를 주면 지운다. 출력은 같은 옵션의 CLI 출력과 바이트 단위로 같다.
  - `custom.css` import(`@import url(custom.css);`)는 코어 import 바로 다음, 주석을 뺀 둘째 규칙이다. 엔트리에서 코어 import 뒤에 쓰면 Dart Sass가 두 import를 이 순서로 함께 끌어올린다.
  - 엔트리에는 `//` 주석만 쓴다. 노브 안내 주석은 `_tokens.scss`에 두어 두 import 뒤에 출력되게 한다.
- **`src/_pretendard.scss`는 생성 파일이다.** 직접 고치지 않는다. 생성 스크립트가 머리 주석에 규칙 본문의 SHA-256을 적으므로, 손으로 고치면 폰트 검사(`check:fonts`)가 실패한다. Pretendard 버전은 `src/tools/pretendard-font-face.mjs`의 버전 상수 `PRETENDARD_VERSION` 한 곳에만 둔다. 버전을 바꾸면 `npm run fonts`(네트워크 사용)로 다시 만들고 `npm run build` 결과와 함께 커밋한다. 폰트 검사는 기대 접두사와 규칙 수를 이 상수와 생성 파일에서 읽으므로 따로 고치지 않는다.
- **컴파일된 `stylesheets/application.css`를 커밋한다.** Redmine(Propshaft)은 테마의 SCSS를 컴파일하지 않고 CSS를 그대로 서빙하므로, 사용자가 clone만 해서 `themes/`에 넣으면 바로 동작해야 한다. `src/`를 바꾸면 `npm run build` 결과를 같은 커밋에 포함한다.
- CI(GitHub Actions, `.github/workflows/ci.yml`)는 PR마다와 `main` push마다 `npm ci` 뒤 `npm run check`를 돌린다. 빌드 비교(`check:build`: 커밋된 CSS와 소스 빌드 결과가 다르거나 CSS가 추적되지 않으면 실패), 폰트 검사(`check:fonts`, `DESIGN.md` §10.2 6), 명암 게이트(`check:contrast`, §6.6) 순서다. 기대값은 문서가 아니라 저장소(버전 상수, 생성 파일, `_tokens.scss`)에서 읽는다.

## 다크 모드

- 구현하지 않는다. 확장 가능한 구조만 유지한다.
- 모든 색은 CSS 변수 토큰으로만 쓴다. `_tokens.scss` 밖에서 hex 등 색 값을 하드코딩하지 않는다. 검사 스크립트(`src/tools/contrast-gate.mjs`)도 색 표를 따로 두지 않고 `_tokens.scss`의 값을 Sass로 읽는다.
- 추후 다크 모드는 같은 토큰을 재정의하는 토큰 세트 하나를 추가하는 것으로 끝나야 한다.

## 차별점: 한글(CJK) 타이포그래피

- 기존 테마들은 라틴 폰트 기준이라 한글 행간·자간·줄바꿈이 어색하다. 이 테마는 한중일 사용자의 가독성을 최우선으로 한다.
- 기본 폰트는 Pretendard(OFL)다. 일본어·중국어(간체·번체) UI에서는 OS 기본 CJK 폰트를 앞에 두고 Pretendard는 한글만 맡는다.
- `word-break: keep-all`은 일본어·중국어를 뺀 모든 UI 언어에 적용한다(`:root:not(:lang(ja)):not(:lang(zh))`). 영어 UI를 쓰는 한국어 사용자도 어절 단위로 줄이 바뀐다.
- 행간은 한글 기준으로 조정하고, 언어별 값은 `DESIGN.md` §7을 따른다.

## 디자인 결정 (2026-09-26, 크롬은 2026-10-01·2026-10-18 변경, 상세는 `DESIGN.md`)

- **시각 체계**(2026-10-18, 결정 기록 #9): shadcn/ui의 모양과 UX를 참고한다(코드는 복사하지 않음). 회색은 순수 무채색, 상태·트래커는 회색 테두리 배지 + 색 아이콘, 우선순위는 단계마다 다른 아이콘, 기한 초과만 빨간 배지다.
- **크롬·컬러**(2026-10-18 변경, 결정 기록 #10): 기본은 무채색이다. 상단 바 `#0A0A0A`, 흰 헤더(`--ravnus-bg-canvas`), 강조 `#171717`, 링크 `#2563EB`. 보라(`#46009B`) 상단 바와 강조는 README 프리셋 "Signature"이고, 다른 크롬 안(Ink, Calm, Redmine Blue, Brand-forward)도 README 프리셋이다. 브랜드 색을 공개 테마에 쓰는 것은 RAVNUS Inc.가 확인했다.
  - 흰 헤더는 코어의 "어두운 헤더 위 밝은 글자" 전제를 뒤집는다. 헤더 안의 링크·아이콘·검색·프로젝트 이동·모바일 헤더(나중에 로드되는 `responsive.css`)는 모두 header 토큰으로 명시적으로 다시 칠한다. 대상 셀렉터 목록은 `DESIGN.md` §8을 따른다.
- **레이아웃**: 코어 배치(상단 메뉴, 헤더, 메인 메뉴, 사이드바, 본문)를 옮기지 않고 스타일만 바꾼다. v1에는 `javascripts/theme.js`를 두지 않는다.
- **사이드바**: 기본은 오른쪽(코어와 같음)이다. `--ravnus-sidebar-at-start: 1`로 인라인 시작 쪽(LTR에서는 왼쪽)으로 바꾼다.
- **폰트 제공**: Pretendard Variable 동적 서브셋을 jsDelivr CDN에서 버전을 고정해 불러온다. 폰트 파일은 저장소에 넣지 않는다. CDN 스타일시트를 `@import`하지 않는다(닿지 않으면 렌더링이 늦어질 수 있음). 생성 스크립트(`src/tools/pretendard-font-face.mjs`, `npm run fonts`)가 CDN woff2 주소를 가진 `@font-face`를 `src/_pretendard.scss`에 만들고 빌드가 테마 CSS에 컴파일한다. 폐쇄망이나 엄격한 CSP 환경은 `custom.css`나 자식 테마에서 직접 호스팅하거나 시스템 폰트만 쓴다. 이때 폰트 스택 네 개(`--ravnus-font-sans`·`-ja`·`-zh`·`-zh-tw`)를 모두 바꿔야 CDN 요청이 0이 된다.
  - CDN에 닿지 못해도 첫 화면 표시는 늦어지지 않는다. 그러나 패킷을 버려 연결이 응답 없이 끊기는 네트워크에서는 폰트 요청이 페이지 `load`를 수 분(macOS 실측 225–300초, 다른 OS는 미검증) 붙잡고, 그동안 "저장하지 않은 변경" 경고가 등록되지 않아 편집 중 이동하면 입력이 경고 없이 사라질 수 있다(경고는 textarea의 `change`만 추적하므로, `load` 전에 입력하고 포커스를 옮긴 textarea는 `load` 뒤에도 경고 대상이 되지 않는다). 그런 환경에서는 자체 호스팅이나 시스템 폰트 블록이 필수다(Phase 0, `DESIGN.md` 부록).
- **커스터마이즈**: 추적되는 빈 스텁 `stylesheets/custom.css`를 테마가 import하고, 사용자는 여기에 토큰을 적는다. 조직 단위 설정은 자식 테마로 관리하도록 문서화한다.

## Redmine 7 테마 동작 (Redmine 7.0.1·7.0.2 소스와 도커로 확인)

- 테마 위치는 `<redmine>/themes/<id>/`이다 (5.x의 `public/themes/` 아님). 필수 파일은 `stylesheets/application.css`.
- 테마 id는 디렉터리명이고, 설정 화면의 표시 이름은 `디렉터리명.humanize`다. `themes/ravnus`는 "Ravnus"로 표시되므로 설치 안내는 `themes/ravnus`로 clone하게 한다.
- 테마 루트의 하위 디렉터리는 `src`와 `.`으로 시작하는 것을 뺀 **전부**가 에셋 경로로 등록되어 `/assets/themes/<id>/` 아래에 공개 서빙된다. 하위 디렉터리 이름은 경로에서 빠진다 (`stylesheets/application.css` → `/assets/themes/ravnus/application-<digest>.css`).
  - 개발 도구 디렉터리는 루트에 두지 않는다. dot-디렉터리(`.docker/`, `.github/`)나 `src/` 안에 둔다. 루트의 파일(README, package.json 등)은 서빙되지 않는다.
  - `node_modules/`도 예외가 아니다. 실제 Redmine의 `themes/ravnus` 안에서 `npm install`을 하지 않는다. 개발은 별도 clone에서 하고, 도커 환경은 런타임 디렉터리만 마운트한다.
  - 서로 다른 하위 디렉터리에 같은 파일명을 두지 않는다 (경로가 합쳐지며 하나만 쓰인다).
- 기동 시 테마 CSS의 `url(...)`이 재작성된다. `url(../../../stylesheets/application.css)`는 `url("/assets/application-<digest>.css")`가 되며, 이 방식이 공식 위키에 문서화되어 있다. 내장 테마(alternate, classic)가 쓰는 `url(/application.css)`도 동작한다.
- 자식 테마는 `@import url(../ravnus/application.css);`로 부모를 불러온다(`url(/themes/ravnus/application.css)`도 동작). 5.x식 `url(../../ravnus/stylesheets/application.css)`와 `@import "..."` 문자열 형태는 동작하지 않는다.
- 테마·`custom.css`·자식 테마의 `url(../fonts/x.woff2)` 같은 상대 경로는 `/assets/themes/<id>/x-<digest>.woff2`로 바뀌고, 절대 `https://` 주소는 그대로 남는다.
- `javascripts/theme.js`가 있으면 모든 페이지에 자동 로드된다. JS에서 이미지 경로는 `RAILS_ASSET_URL("/icons/...")` 의사 메서드를 쓴다.
- 프로덕션 모드는 기동 시 에셋 파일 mtime이 manifest보다 새로우면 `public/assets`로 다시 컴파일한다. Redmine 실행 유저에게 `public/assets` 쓰기 권한이 필요하고, 테마를 바꾼 뒤에는 앱 서버를 재시작해야 한다. 테마 목록도 기동 시에만 스캔한다. 바꾼 파일의 mtime이 `public/assets/.manifest.json`보다 오래되면(예: 옛 타임스탬프로 복사) 재시작해도 반영되지 않으므로 `touch`한 뒤 재시작한다.
- 코어 CSS는 `:root { --fonts-main: ... }`를 정의해 본문·제목·위키 편집기에 쓴다. 이 테마는 이 변수를 재정의해 기본 폰트를 바꾼다(언어별 스택은 `DESIGN.md` §7.1).
- Redmine 7 코어는 Open Color 변수(`--oc-*`)와 논리 속성(`padding-inline-start` 등, RTL 대응)을 쓴다. 테마도 논리 속성으로 쓴다.
- 코어의 의미 변수(`--fonts-main`, `--color-current-marker`, 7.0.2부터 `--color-header-background`·`--color-top-menu-background`)는 `--ravnus-*` 값으로 재정의해 코어가 쓰는 곳을 한 번에 바꾼다. `--oc-*`는 의미가 아니라 팔레트 단계 이름이라 재정의하지 않는다. 7.0.0–7.0.1에는 헤더 변수가 없으므로 헤더·상단 바·모바일 헤더·flyout(h3 띠 포함) 배경은 셀렉터로도 칠한다.
- `<html lang>`에 사용자 언어가 들어간다 (7은 `dir`도 추가). 언어별 폰트 분기는 `:lang(ko)`, `:lang(ja)` 등으로 할 수 있다.
- 일감 목록 행에는 `tracker-N`, `status-N`, `priority-N`, `priority-lowest|default|high3|high2|highest`, `closed`, `overdue`, `behind-schedule`, `parent`, `child` 등의 클래스가 붙는다. 우선순위 위치 클래스는 map + `@each`의 기준으로, 설치마다 id가 다른 `status-N`·`tracker-N`은 사용자 CSS 행 매핑의 기준으로 쓴다.
- 공식 문서: https://www.redmine.org/projects/redmine/wiki/howto_create_a_custom_redmine_theme

## 디렉터리 구조

```
.
├── src/                              # SCSS 소스와 개발 도구 (Redmine이 서빙하지 않음)
│   ├── application.scss              # 엔트리: @use tokens → pretendard → typography → components, 그다음 코어·custom.css import
│   ├── _tokens.scss                  # 토큰 3계층(primitive map, :where(:root) --ravnus-*), color-mix 폴백, 프리셋 데이터, 다크 모드 확장 지점
│   ├── _pretendard.scss              # 생성 파일: Pretendard CDN @font-face (npm run fonts, 직접 고치지 않음)
│   ├── _typography.scss              # 폰트와 CJK 타이포그래피
│   ├── components/                   # 컴포넌트 partial (_index.scss가 순서대로 @forward)
│   │   ├── _chrome.scss              # 크롬: 코어 변수 브리지, 상단 바, 흰 헤더 재칠, 메뉴 바, 모바일 헤더·flyout, 7.0.0–7.0.1 배경 폴백
│   │   ├── _sidebar.scss             # 사이드바 스킨과 위치 토큰
│   │   ├── _components.scss          # shadcn/ui 기준 공통 컴포넌트: 입력 칸, 버튼, 탭, 카드, 알림, 배지, 드롭다운, 페이지 이동, 보조 회색 글자
│   │   └── _issue-list.scss          # 일감 목록(데이터 표): 밀도, 상태·트래커 배지, 우선순위 아이콘, 기한 초과 배지, 그룹 행, 선택 행, 필터 컨트롤, 강제 색·인쇄
│   └── tools/                        # Node 스크립트 (CI·개발용)
│       ├── build.mjs                 # 빌드 (npm run build / watch, 성공했을 때만 CSS를 씀)
│       ├── pretendard-font-face.mjs  # _pretendard.scss 생성기, Pretendard 버전 상수
│       ├── check-fonts.mjs           # 폰트 검사 (DESIGN.md §10.2 6)
│       ├── contrast-gate.mjs         # 명암 게이트 (DESIGN.md §6.6)
│       └── check-presets.mjs         # README 프리셋 블록 검사, 프로브용 프리셋 파일 쓰기 (DESIGN.md §10.2 6)
├── stylesheets/
│   ├── application.css               # 컴파일 결과 (커밋함)
│   └── custom.css                    # 사용자 토큰용 빈 스텁 (추적함, 업스트림은 비워 둔다)
├── .docker/
│   ├── seed.rb                       # 도커 테스트 환경 샘플 데이터
│   └── probe/
│       ├── probe.mjs                 # 프로브 하네스 (playwright-core + 설치된 Chrome, axe-core)
│       ├── chrome-check.js           # 크롬 계산 스타일·명암 검사 (--eval-file, DESIGN.md §10.2 3)
│       └── list-check.js             # 일감 목록 검사 (--eval-file, DESIGN.md §9 Phase 3)
├── .github/
│   ├── workflows/ci.yml              # CI: npm ci → npm run check
│   └── screenshots/                  # README 스크린샷 (dot-디렉터리라 Redmine이 서빙하지 않는다)
├── docker-compose.yml                # Redmine 7 테스트 환경 (redmine:7.0.2)
├── package.json                      # 스크립트 (build / watch / fonts / check / probe)
├── DESIGN.md                         # 디자인 기획서 (결정 사항, 토큰·색·타이포 사양, 단계별 계획)
├── LICENSE                           # MIT
├── README.md                         # 영문
└── README.ko.md                      # 한국어
```

문서는 루트에 둔다. Redmine은 루트 파일은 서빙하지 않지만 하위 디렉터리는 서빙하므로 `docs/` 같은 디렉터리를 만들지 않는다.

아직 내용이 없는 디렉터리는 만들지 않는다 (빈 placeholder 금지). 필요해지면 아래 위치에 추가한다.

- 컴포넌트: `src/components/_<name>.scss`를 만들고 `src/components/_index.scss`에 캐스케이드 순서대로 `@forward`를 더한다(엔트리는 이미 typography 다음에 `@use "components";`를 한다).
- README 이미지: 테마 하위 디렉터리는 서빙되므로 `.github/screenshots/`처럼 dot-디렉터리에 둔다.
- 런타임 디렉터리(`favicon/`, `images/` 등): `docker-compose.yml`의 서비스 볼륨에도 마운트를 추가한다. 폰트는 CDN을 쓰므로 저장소에 넣지 않는다.

## 개발 명령

- 빌드: `npm install` 후 `npm run build` (1회) 또는 `npm run watch` (변경 감지)
- 폰트 생성: `npm run fonts` (Pretendard 버전 상수를 바꿀 때만. jsDelivr에서 업스트림 CSS를 받아 검증하고 모든 폰트 URL의 200 `font/woff2`를 확인한 뒤 `src/_pretendard.scss`를 다시 쓴다)
- 검사: `npm run check` (CI와 같다: `check:build` → `check:fonts` → `check:contrast` → `check:presets`). 각각 따로 돌릴 수 있고, `node src/tools/contrast-gate.mjs --verbose`는 통과한 쌍도 보여 준다.
  - `check:build`는 git 인덱스와 비교하므로 로컬에서는 `src/`와 컴파일 결과를 stage한 뒤 돌린다. `stylesheets/application.css`를 다시 쓰므로 다른 작업이 `src/`를 고치는 중인 작업 트리에서는 돌리지 않는다.
- 프로브: `npm run probe -- [옵션] [페이지]` (`--help`, 사용법은 `.docker/probe/probe.mjs` 머리 주석). 설치된 Google Chrome을 쓰고 기본 대상은 http://127.0.0.1:3007이다.
  - `--out`·`--screenshot`은 저장소 밖(`$TMPDIR` 등)에 쓴다.
  - 크롬 검사: `--eval-file .docker/probe/chrome-check.js`(1440·800px, 익명·`--autologin`). 프리셋은 `node src/tools/check-presets.mjs --write <디렉터리>`로 파일을 만들어 `--inject-css`로 준다. `--forced-colors`는 강제 색 에뮬레이션이다.
  - 일감 목록 검사: `--eval-file .docker/probe/list-check.js`를 확인할 열이 있는 쿼리 URL에 준다. `--pdf <디렉터리>`는 배경 그래픽을 끈 인쇄 미리보기 PDF를 만든다.
  - 로그인 화면은 `--autologin`(rails runner로 만든 autologin 토큰 쿠키, 끝나면 삭제)으로만 연다. 자동 검증에서 비밀번호와 로그인 폼은 쓰지 않는다.
- 테스트 환경: `docker compose up -d` → Redmine 7은 http://localhost:3007
  - 첫 기동 때 한국어 기본 데이터와 샘플 프로젝트를 시드하고 RAVNUS 테마를 적용한다. 로그인은 Redmine 기본 관리자 계정(admin / admin)이며, 포트는 127.0.0.1에만 열린다.
  - CSS 반영: `npm run build` 후 `docker compose restart` (기동 시 에셋 재컴파일)
  - 초기화: `docker compose down -v` (다음 기동 때 다시 시드)
  - 기본 환경과 섞이지 않는 1회 실행은 `REDMINE_PORT=<포트> docker compose -p <이름> up -d`로 띄우고 `docker compose -p <이름> down -v`로 지운다. 프로브에는 `--base-url`과 `--compose-project <이름>`을 준다.
- 시드 데이터는 가상의 인물과 `example.com` 주소만 쓴다.

## 작업 규칙

- 공개 레포이므로 사내 서버 주소·경로·계정 등 내부 정보를 커밋하지 않는다. 로컬 인계 메모(`HANDOFF.md`)는 `.gitignore` 대상이다.
- 커밋 메시지·PR·릴리스 설명에 AI 도구 사용 표기나 서명을 넣지 않는다.
- 게시된 이력 수정이나 강제 푸시는 요청 없이 하지 않는다.
- 설치·빌드·사용법이 바뀌면 README.md와 README.ko.md를 함께 갱신한다.
- 운영 중인 Redmine 서버에서 직접 개발하지 않는다. 개발과 검증은 도커 테스트 환경에서 한다.
- 디자인을 바꾸려면 `DESIGN.md`를 먼저 갱신한다. 확정된 결정을 바꿀 때는 이 문서의 "디자인 결정"도 함께 고친다.

## 진행 상태

- Phase 0 검증은 2026-10-01에 끝났다(Redmine 7.0.2, 결과는 `DESIGN.md` 부록 "Phase 0 검증 결과").
- Phase 1(v0.1.0)은 구현했다(2026-10-02): 토큰 3계층과 프리셋 데이터, CJK 타이포그래피, CDN `@font-face` 생성 스크립트와 생성 파일, `custom.css` 스텁, CI(빌드 비교·폰트 검사·명암 게이트), 프로브 하네스, README의 폰트·CDN 안내와 커스터마이즈 절. `DESIGN.md` §9 Phase 1 완료 기준은 2026-10-02에 검증했다(결과는 `DESIGN.md` 부록 "Phase 1 검증 결과"). 공통 기준의 axe-core 검사는 main에도 있는 코어 하드코딩 색 위반 때문에 통과하지 못했고(회귀 없음), 2026-10-18 소유자 결정으로 v0.1.0은 이 코어 위반을 받아들인다(`DESIGN.md` §9 Phase 1, 결정 기록 #8). v0.1.0은 2026-10-18 PR #3 병합 뒤 태그했다.
- Phase 2(크롬, v0.2.0의 앞 절반)는 2026-10-18에 구현하고 완료 기준을 검증했다(결과는 `DESIGN.md` 부록 "Phase 2 검증 결과"): `_chrome.scss`(코어 변수 브리지, 흰 헤더 재칠, 메뉴 바, 모바일 헤더·flyout, 7.0.0–7.0.1 배경 폴백), `_sidebar.scss`, README 프리셋 블록과 스크린샷, 프리셋 블록 CI 검사, 크롬 검사 스크립트. PR #5로 병합했다.
- Phase 3(일감 목록)은 2026-10-18에 구현하고 완료 기준을 검증했다(결과는 `DESIGN.md` 부록 "Phase 3 검증 결과"). 상태 "체크"는 원 안의 점으로 바꿨고, 띄어쓰기 없는 제목의 마지막 한 음절은 한계로 남았다. PR #6 병합 뒤 v0.2.0(Phase 2–3)을 태그했다(2026-10-18). 같은 날 운영 적용 리뷰에서 찾은 두 가지(닫힌 일감의 일정 지연 표시, 메뉴 없는 페이지의 헤더 경계)를 v0.2.1로 고쳤다(`DESIGN.md` 부록 "운영 적용 리뷰"). 그다음은 Phase 4(일감 상세·저널·편집 폼)다.
- v0.3.0(2026-10-19): 운영 적용 리뷰 뒤 소유자 결정 #9·#10에 따라 shadcn/ui 기준으로 테마 전체를 다듬었다(무채색 팔레트, `_components.scss`, 일감 목록 데이터 표, 기본 크롬 무채색과 Signature 프리셋). 검증은 `DESIGN.md` 부록 "v0.3.0 재설계 검증 결과". 그다음은 Phase 4(일감 상세·저널·편집 폼, v0.4.0)다.
