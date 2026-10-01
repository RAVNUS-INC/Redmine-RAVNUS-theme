# RAVNUS — Redmine 테마

[English](README.md)

RAVNUS는 Redmine 6.x / 7.x용 무료 오픈소스 테마입니다. 한국어·일본어·중국어(CJK) 사용자에게 가장 읽기 좋은 Redmine 테마를 목표로 합니다.

> **현재 상태: 초기 개발 단계.** 빌드 파이프라인과 테스트 환경이 준비되었고 디자인 작업을 진행하고 있습니다. 지금은 기본 Redmine 화면 위에서 기본 글꼴만 Pretendard 우선 스택으로 바꿉니다.

## 목표

- **CJK 우선 타이포그래피**: 기본 글꼴 Pretendard, 어절 단위 줄바꿈(`word-break: keep-all`), 한글 기준 행간
- **빌드 없이 커스터마이즈**: 디자인 토큰을 CSS 변수(`--ravnus-*`)로 제공. 업데이트해도 남는 오버라이드 파일을 준비 중이며, 지금은 컴파일된 스타일시트 상단에 있습니다
- **Redmine 코어를 따라감**: 코어 스타일시트를 import하고 그 위에 덮어쓰므로 코어 업그레이드가 그대로 반영됨
- **MIT 라이선스**: 누구나 무료로 설치·수정·재배포 가능

## 요구 사항

- Redmine 6.x 또는 7.x (5.x 이하는 지원하지 않습니다)

## 설치

Redmine 설치 경로의 `themes` 디렉터리에 clone합니다. Redmine은 디렉터리 이름으로 테마를 표시하므로 `ravnus`로 받습니다.

```bash
cd /path/to/redmine
git clone https://github.com/RAVNUS-INC/Redmine-RAVNUS-theme.git themes/ravnus
```

Redmine을 재시작한 뒤 *관리 → 설정 → 표시방식 → 테마*에서 **Ravnus**를 선택합니다.

- Redmine은 시작할 때 테마 에셋을 `public/assets`로 컴파일하므로, Redmine 실행 유저에게 이 디렉터리 쓰기 권한이 필요합니다.
- 업데이트는 `themes/ravnus`에서 `git pull` 후 Redmine을 재시작합니다. 스타일시트를 고쳤다면 먼저 [커스터마이즈](#커스터마이즈)를 읽어 주세요.

## 커스터마이즈

`stylesheets/application.css` 상단의 `:where(:root)` 블록이 디자인 토큰입니다. 값을 고친 뒤 Redmine을 재시작하면 되고, 빌드는 필요 없습니다.

> **고친 내용은 업데이트할 때 덮어써집니다.** `stylesheets/application.css`는 릴리스마다 바뀌는 추적 파일입니다. 그래서 `git pull`은 "local changes would be overwritten" 오류로 멈추고, `git pull --autostash`는 Redmine이 서빙하는 스타일시트에 충돌 표시를 남길 수 있습니다. 업데이트 전에 바꾼 값을 따로 적어 두고 `git checkout -- stylesheets/application.css && git pull`을 실행한 뒤, 값을 다시 넣고 Redmine을 재시작하세요. 업데이트해도 남는 오버라이드 파일(`custom.css`)을 준비하고 있습니다.

| 토큰 | 용도 |
|------|------|
| `--ravnus-font-sans` | 기본 글꼴 스택 (Pretendard 우선) |

## 개발

필요 도구: Node.js 20.19 이상, Docker(Compose v2)

```bash
npm install
npm run build   # src/ → stylesheets/application.css 컴파일
npm run watch   # 변경할 때마다 다시 빌드
```

소스는 `src/`에 있습니다(Dart Sass, `@use` 모듈). Redmine은 CSS를 그대로 서빙하고 Sass를 컴파일하지 않으므로, 소스를 바꾸면 컴파일된 `stylesheets/application.css`를 같은 커밋에 포함합니다.

개발은 운영 중인 Redmine의 `themes/ravnus`가 아니라 별도 clone에서 합니다. Redmine은 `src/`와 dot-디렉터리를 뺀 테마 하위 디렉터리를 모두 에셋으로 공개하므로, 그 안에서 `npm install`을 하면 `node_modules/`까지 서빙되고 기동이 느려집니다.

### 테스트 환경

`docker-compose.yml`은 이 테마를 마운트한 Redmine 6.x와 7.x를 함께 실행합니다.

```bash
docker compose up -d
```

| Redmine | 주소 |
|---------|------|
| 6.x | http://localhost:3006 |
| 7.x | http://localhost:3007 |

- 첫 기동 때 한국어 기본 설정을 불러오고, 한국어·일본어·중국어·영어로 된 샘플 프로젝트·일감·위키·뉴스를 만든 뒤 테마를 적용합니다. 샘플의 인물과 내용은 모두 가상입니다.
- 로그인은 Redmine 기본 관리자 계정(`admin` / `admin`)입니다. 포트는 127.0.0.1에서만 열립니다.
- `npm run build` 후 `docker compose restart`를 실행하면 반영됩니다. Redmine이 시작할 때 테마 에셋을 다시 컴파일합니다.
- `docker compose down -v`는 샘플 데이터를 지우고, 다음 `docker compose up -d` 때 다시 만듭니다.
- `docker compose pull`로 최신 6.x / 7.x 이미지로 업데이트합니다.
- 다른 포트를 쓰려면 `REDMINE6_PORT`, `REDMINE7_PORT`를 지정합니다.

## 라이선스

[MIT](LICENSE) © RAVNUS Inc.

Redmine은 GPL-2.0 라이선스입니다. 이 테마는 Redmine 코드를 복사하지 않고, 실행 시점에 코어 스타일시트를 import합니다.
