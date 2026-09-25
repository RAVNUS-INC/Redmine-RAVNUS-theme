# RAVNUS — Redmine 테마 프로젝트 규칙

Redmine 6.x / 7.x용 오픈소스(MIT) 테마. "한중일(CJK) 사용자에게 가장 읽기 좋은 Redmine 테마"를 목표로 한다.
아래 결정 사항은 확정된 프로젝트 규칙이다. 결정을 바꿀 때는 이 문서를 먼저 갱신한다.

## 라이선스

- MIT로 공개한다 (`LICENSE`, 저작권자 RAVNUS Inc.).
- Opale(AGPL-3.0) 코드를 복사하거나 포크하지 않는다. 포크하면 AGPL을 물려받아 MIT로 낼 수 없다. 아이디어 참고는 가능하고 코드는 직접 작성한다.
- Redmine 코어 CSS(GPL-2.0) 블록을 복붙하지 않는다. 코어는 `@import`로만 불러오고 필요한 셀렉터는 새로 작성한다.

## 지원 범위

- Redmine 6.x / 7.x만 지원한다.
- 5.x는 지원하지 않는다. 테마 경로와 import 경로가 달라 별도 브랜치가 필요해지기 때문이다.
- 스타일 변경은 6.x와 7.x 양쪽에서 확인한다 (도커 테스트 환경).

## 구조: 코어 import + override

- 코어를 통째로 복사하는 포크 방식이 아니라, 코어 `application.css`를 import하고 그 위에 덮어쓴다.
- 코어 업그레이드는 그대로 따라가고, 테마는 스타일 레이어만 관리한다.

## 스타일 작성: SCSS + CSS 변수

- **SCSS는 작성용이다.** 컴포넌트별 partial로 나누고, 트래커·우선순위·상태 색상은 map + `@each`, 공통 스타일은 mixin으로 작성한다.
- **CSS 변수(`:root`)는 사용자 커스터마이즈용이다.** 색·폰트·라운드·간격 등 디자인 토큰은 SCSS 변수가 아니라 `--ravnus-*` CSS 변수로 출력한다. 사용자가 빌드 없이 컴파일된 파일 상단의 토큰 블록만 고쳐 브랜드를 바꿀 수 있어야 한다.
- **Dart Sass + `@use`/`@forward` 모듈 문법만 쓴다.** Sass `@import`는 deprecated이므로 금지한다. 빌드 스크립트의 `--fatal-deprecation=import`가 이를 에러로 막는다.
- **코어 import**는 `@import url(../../../stylesheets/application.css);`로 쓰고, 컴파일 결과 파일의 첫 줄이어야 한다.
  - 반드시 `url()` 형태로 쓴다. Redmine은 테마 CSS의 `url()`만 재작성하므로 `@import "..."` 문자열 형태는 동작하지 않는다.
  - Sass는 `@use` 앞에 어떤 규칙도 허용하지 않으므로, 엔트리(`src/application.scss`)에서는 `@use` 뒤에 쓴다. Dart Sass가 plain CSS import를 출력 맨 위로 끌어올린다.
  - 출력에 비ASCII 문자가 있으면 Sass가 `@charset`을 첫 줄에 넣으므로 빌드는 `--no-charset`을 쓴다.
- **컴파일된 `stylesheets/application.css`를 커밋한다.** Redmine(Propshaft)은 테마의 SCSS를 컴파일하지 않고 CSS를 그대로 서빙하므로, 사용자가 clone만 해서 `themes/`에 넣으면 바로 동작해야 한다. `src/`를 바꾸면 `npm run build` 결과를 같은 커밋에 포함한다.
- CI(GitHub Actions)를 구성해 PR마다 빌드하고, 커밋된 CSS와 소스 빌드 결과가 다르면 실패시킨다. (아직 구성 전이다. `.github/workflows/`에 추가한다.)

## 다크 모드

- 구현하지 않는다. 확장 가능한 구조만 유지한다.
- 모든 색은 CSS 변수 토큰으로만 쓴다. `_tokens.scss` 밖에서 hex 등 색 값을 하드코딩하지 않는다.
- 추후 다크 모드는 같은 토큰을 재정의하는 토큰 세트 하나를 추가하는 것으로 끝나야 한다.

## 차별점: 한글(CJK) 타이포그래피

- 기존 테마들은 라틴 폰트 기준이라 한글 행간·자간·줄바꿈이 어색하다. 이 테마는 한중일 사용자의 가독성을 최우선으로 한다.
- 기본 폰트는 Pretendard(OFL), `word-break: keep-all`, 한글 기준 행간 조정을 적용한다.

## Redmine 6+ 테마 동작 (Redmine 6.1.4 / 7.0.1 소스와 도커로 확인)

- 테마 위치는 `<redmine>/themes/<id>/`이다 (5.x의 `public/themes/` 아님). 필수 파일은 `stylesheets/application.css`.
- 테마 id는 디렉터리명이고, 설정 화면의 표시 이름은 `디렉터리명.humanize`다. `themes/ravnus`는 "Ravnus"로 표시되므로 설치 안내는 `themes/ravnus`로 clone하게 한다.
- 테마 루트의 하위 디렉터리는 `src`와 `.`으로 시작하는 것을 뺀 **전부**가 에셋 경로로 등록되어 `/assets/themes/<id>/` 아래에 공개 서빙된다. 하위 디렉터리 이름은 경로에서 빠진다 (`stylesheets/application.css` → `/assets/themes/ravnus/application-<digest>.css`).
  - 개발 도구 디렉터리는 루트에 두지 않는다. dot-디렉터리(`.docker/`, `.github/`)나 `src/` 안에 둔다. 루트의 파일(README, package.json 등)은 서빙되지 않는다.
  - `node_modules/`도 예외가 아니다. 실제 Redmine의 `themes/ravnus` 안에서 `npm install`을 하지 않는다. 개발은 별도 clone에서 하고, 도커 환경은 런타임 디렉터리만 마운트한다.
  - 서로 다른 하위 디렉터리에 같은 파일명을 두지 않는다 (경로가 합쳐지며 하나만 쓰인다).
- 기동 시 테마 CSS의 `url(...)`이 재작성된다. `url(../../../stylesheets/application.css)`는 `url("/assets/application-<digest>.css")`가 되며, 이 방식이 공식 위키에 문서화되어 있다. 내장 테마(alternate, classic)가 쓰는 `url(/application.css)`도 동작한다.
- `javascripts/theme.js`가 있으면 모든 페이지에 자동 로드된다. JS에서 이미지 경로는 `RAILS_ASSET_URL("/icons/...")` 의사 메서드를 쓴다.
- 프로덕션 모드는 기동 시 에셋 파일 mtime이 manifest보다 새로우면 `public/assets`로 다시 컴파일한다. Redmine 실행 유저에게 `public/assets` 쓰기 권한이 필요하고, 테마를 바꾼 뒤에는 앱 서버를 재시작해야 한다. 테마 목록도 기동 시에만 스캔한다.
- 코어 CSS는 `:root { --fonts-main: ... }`를 정의해 본문·제목·위키 편집기에 쓴다 (6.x, 7.x 공통). 이 테마는 이 변수를 `--ravnus-font-sans`로 재정의해 기본 폰트를 바꾼다.
- Redmine 7 코어는 Open Color 변수(`--oc-*`)와 논리 속성(`padding-inline-start` 등, RTL 대응)을 쓰지만 6.x에는 없다. 6.x/7.x에 공통으로 필요한 스타일은 7 전용 변수에 기대지 않는다.
- `<html lang>`에 사용자 언어가 들어간다 (7은 `dir`도 추가). 언어별 폰트 분기는 `:lang(ko)`, `:lang(ja)` 등으로 할 수 있다.
- 일감 목록 행에는 `tracker-N`, `status-N`, `priority-N`, `priority-lowest|default|high3|high2|highest`, `closed`, `overdue`, `behind-schedule`, `parent`, `child` 등의 클래스가 붙는다. 색상 map + `@each`의 기준으로 쓴다.
- 공식 문서: https://www.redmine.org/projects/redmine/wiki/howto_create_a_custom_redmine_theme

## 디렉터리 구조

```
.
├── src/                          # SCSS 소스 (Redmine이 서빙하지 않음)
│   ├── application.scss          # 엔트리: @use tokens → typography, 그다음 코어 import
│   ├── _tokens.scss              # :root 디자인 토큰 (--ravnus-*), 다크 모드 확장 지점
│   └── _typography.scss          # 폰트와 CJK 타이포그래피
├── stylesheets/application.css   # 컴파일 결과 (커밋함)
├── .docker/seed.rb               # 도커 테스트 환경 샘플 데이터
├── docker-compose.yml            # Redmine 6.x / 7.x 테스트 환경
├── package.json                  # Sass 빌드 스크립트 (build / watch)
├── LICENSE                       # MIT
├── README.md                     # 영문
└── README.ko.md                  # 한국어
```

아직 내용이 없는 디렉터리는 만들지 않는다 (빈 placeholder 금지). 필요해지면 아래 위치에 추가한다.

- 컴포넌트: `src/components/_<name>.scss`를 만들고 `src/components/_index.scss`에서 모두 `@forward`한 뒤, 엔트리에서 `@use "components";`를 typography 다음에 추가한다.
- 런타임 디렉터리(`javascripts/`, `favicon/`, `images/`, 폰트 등): `docker-compose.yml`의 두 서비스 볼륨에도 마운트를 추가한다.
- CI: `.github/workflows/`

## 개발 명령

- 빌드: `npm install` 후 `npm run build` (1회) 또는 `npm run watch` (변경 감지)
- 테스트 환경: `docker compose up -d` → Redmine 6은 http://localhost:3006, Redmine 7은 http://localhost:3007
  - 첫 기동 때 한국어 기본 데이터와 샘플 프로젝트를 시드하고 RAVNUS 테마를 적용한다. 로그인은 Redmine 기본 관리자 계정(admin / admin)이며, 포트는 127.0.0.1에만 열린다.
  - CSS 반영: `npm run build` 후 `docker compose restart` (기동 시 에셋 재컴파일)
  - 초기화: `docker compose down -v` (다음 기동 때 다시 시드)
- 시드 데이터는 가상의 인물과 `example.com` 주소만 쓴다.

## 작업 규칙

- 공개 레포이므로 사내 서버 주소·경로·계정 등 내부 정보를 커밋하지 않는다. 로컬 인계 메모(`HANDOFF.md`)는 `.gitignore` 대상이다.
- 커밋 메시지·PR·릴리스 설명에 AI 도구 사용 표기나 서명을 넣지 않는다.
- 게시된 이력 수정이나 강제 푸시는 요청 없이 하지 않는다.
- 설치·빌드·사용법이 바뀌면 README.md와 README.ko.md를 함께 갱신한다.
- 운영 중인 Redmine 서버에서 직접 개발하지 않는다. 개발과 검증은 도커 테스트 환경에서 한다.

## 미정 사항 (결정 전까지 임의로 정하지 않는다)

- 디자인 방향: 메인 컬러, 레이아웃 변경 범위, 사이드바 위치
- Pretendard 번들 vs CDN: 번들은 폐쇄망 설치에 대응하지만 용량이 늘어난다. 소스 분석상 테마 하위 디렉터리(예: `fonts/`)의 파일도 에셋으로 등록되고 CSS의 `url()`도 재작성되므로 서빙될 가능성이 높지만, 도커 환경에서 실제로 확인해야 한다. 번들하면 OFL 라이선스 파일을 함께 넣는다.
- 사용자 커스터마이즈 방식: 컴파일 파일 상단 토큰 수정만 안내할지, 별도 override 파일 로드 방식을 제공할지
