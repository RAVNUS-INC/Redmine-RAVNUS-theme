# RAVNUS 디자인 기획서

> 상태: 소유자 결정 반영 (2026-09-26, §4.1 크롬 기본값과 지원 범위는 2026-10-01 변경) · Phase 0 검증 완료 (2026-10-01, 7.0.2, 부록 "Phase 0 검증 결과") · 다음 단계: Phase 1(v0.1.0) · 대상: Redmine 7.x 전용 (테스트 기준 7.0.2, §4.12)
> 위치: 공개 저장소 루트의 `DESIGN.md`. Redmine은 테마 루트의 하위 디렉터리(`src`와 dot-디렉터리 제외)를 모두 에셋으로 서빙하지만 루트 파일은 서빙하지 않으므로 `docs/`가 아니라 루트에 둔다(§12). 배포 환경별 서버·계정·플러그인 정보는 적지 않는다.
> 근거 자료: 작성 과정의 작업 자료(조사 4건: 코어 UI 해부, 테마 지형과 브랜드, CJK 타이포그래피, 디자인 시스템 · 디자인 방향 3건 · 심사 3건: 구현·업그레이드 안전성, CJK 가독성·접근성, 제품·채택 · 검토 의견 23건)는 저장소에 싣지 않는다. 검토 의견의 반영 내용은 부록 "개정 이력"에 요약하고, 소유자 결정(2026-09-26 6건, 2026-10-01 변경·재확인과 지원 범위)은 부록 "결정 기록"에, Phase 0 도커 검증 결과는 부록 "Phase 0 검증 결과"에 적는다.

**표기 규칙.** 표시 없이 적은 사실은 네 가지 중 하나로 확인한 것이다. (1) Redmine 7.0.2 소스(`redmine:7.0.2` 이미지에서 읽었다. 행 번호도 7.0.2 기준이고, 7.0.1과 다를 때만 7.0.1을 함께 적는다), (2) 로컬 도커·브라우저 측정(운영 검증 아님. 측정한 버전을 함께 적는다. 2026-09-26 작업 자료의 측정은 7.0.1, 2026-10-01 측정은 7.0.2다(비교용 7.0.1 측정은 버전을 함께 적었다)), (3) 인용 출처(MDN browser-compat-data 8.1.3, web-features 3.40.0, W3C klreq/clreq/WCAG 2.2와 CSS 명세, npm 문서 "npm Unpublish Policy", SIL OFL-FAQ와 "Webfonts and Reserved Font Names", jsDelivr 저장소 이슈, 각 테마 저장소), (4) 이 문서를 쓰면서 한 계산이다. 계산은 방법을 밝힌다. 명암비는 WCAG 2.x 상대 휘도 공식, `color-mix(in oklch, …)` 파생값과 sRGB 색역 여부는 OKLab 변환 행렬, 색각 이상 비교는 Machado 2009 시뮬레이션(심도 1.0) 뒤 CIEDE2000으로 구했다. 명암비 약 50쌍과 파생값은 두 번 따로 계산해 모두 일치했다. 로컬 Chrome 계산값과의 대조는 작업 자료에만 있으므로, 재현 가능한 검사는 Phase 1에서 둔다. 작업 자료에만 근거한 주장, 추정치, 도커에서 아직 돌려 보지 않은 동작에는 **(미검증)** 을 붙인다.

**다시 논의하지 않는 확정 사항**
- 이름은 RAVNUS이고 MIT(저작권자 RAVNUS Inc.)로 공개한다. 지원 범위는 Redmine 7.x 전용이다(2026-10-01 소유자 결정. 6.x 지원은 중단했다, §4.12).
- 코어 `application.css`를 import한 뒤 덮어쓴다. 포크하지 않고, 코어 GPL CSS 블록이나 Opale AGPL 코드를 복사하지 않는다.
- Dart Sass `@use`로 작성하고, 토큰은 `--ravnus-*` CSS 변수로 출력한다.
- 다크 모드는 토큰 세트 하나를 추가하는 방식으로만 만든다.
- 기본 폰트는 Pretendard(OFL)이고 `keep-all`과 한글 기준 행간을 쓴다. UI 언어별 적용 범위는 §4.6 결정을 따른다.
- §4.1–§4.6의 여섯 항목은 2026-09-26 소유자 결정으로 확정했다. 2026-10-01 소유자가 §4.1의 기본 크롬을 A(Ink)에서 B(Signature)로 바꾸고, §4.2(기존 레이아웃 유지)와 §4.4(CDN 기본)는 다시 확인했으며, 지원 범위를 Redmine 7.x 전용으로 바꿨다(부록 "결정 기록").

---

## 1. 요약

**채택안: "Ink & Paper"(Redmine의 보수적 진화형)를 기반으로 삼고, 나머지 두 방향의 장점과 심사·검토에서 나온 필수 수정을 합친 안.** 메인 컬러·크롬(§4.1)과 레이아웃 변경 범위(§4.2)를 비롯한 6건은 2026-09-26 소유자 결정으로 확정했다(부록 "결정 기록"). §4.1은 처음에 초안처럼 A(Ink)를 기본값으로 정했다가, 2026-10-01 소유자가 A·B·C·D 프로토타입을 나란히 비교한 뒤 B(Signature)로 바꿨다. 초안에 있던 선행 조건(브랜드 색 사용 확인), 임시 기본값(D), 브랜드 색 프리셋 보류는 두지 않는다. §4.4는 초안 추천(번들)과 달리 jsDelivr CDN을 기본으로 정했다. 나머지 네 건(§4.2, §4.3, §4.5, §4.6)은 초안 추천과 같다. §4.2(기존 레이아웃 유지)와 §4.4(CDN 기본)는 2026-10-01에 다시 확인했다. 같은 날 소유자는 지원 범위를 Redmine 7.x 전용으로 바꿨다(소유자가 Redmine 7을 쓴다). 그래서 6.1과 7.0을 한 모습으로 맞추던 작업은 모두 없앴고, 테스트 기준은 `redmine:7.0.2` 하나다(§4.12).

Redmine의 배치(상단 메뉴, 헤더, 메인 메뉴 바, 오른쪽 사이드바, 표, 탭)는 그대로 둔다. 코어 7의 배치 위에서 CSS로 코어가 약한 곳을 고친다. 코어에는 본문 행간이 없고, 폼 컨트롤은 Arial 13.33px로 그려지며(7.0.2 측정), 기본 폰트 Noto Sans에는 라틴 글자만 있다. 회색 글자 여러 개는 AA에 못 미친다(gray-6 #868E96 3.32:1, gray-5 #ADB5BD 2.07:1). 색은 다음과 같이 쓴다.
- 크롬(Signature, §4.1): 2rem 브랜드 바이올렛 상단 바(`#46009B`, 흰 글자 12.11:1) + 흰 헤더(본문 글자 16.20:1). 메인 메뉴 바는 연한 `#F6F6FC`이고, 흰 헤더·본문과는 위아래 헤어라인으로 나눈다(§6.2). 짙은 잉크 바이올렛 크롬(Ink: `#311E5F` 헤더, `#1C0F3A` 상단 바)은 README 프리셋으로 제공한다.
- 브랜드 바이올렛 `#46009B`: 크롬에서는 상단 바와 모바일 flyout(같은 토큰)에만 면으로 쓰고, 본문에서는 주 버튼 채움과 선택 표시, 포커스에만 쓴다.
- 링크: 읽기 좋은 파랑 `#215DB3`.

여기에 다른 방향에서 세 가지를 가져온다. Calm Workspace에서는 업데이트해도 설정이 남는 커스터마이즈 방식(`:where(:root)` 토큰 + `custom.css` 스텁)을 가져온다. Manuscript에서는 읽기 레이어(언어별 본문 행간, 모든 텍스트 컨테이너의 명시적 line-height, 문장 속 링크 상시 밑줄)와 Signature 크롬(2026-10-01부터 기본 크롬)을 가져온다.

기반 방향과 기본 크롬은 고른 주체가 다르다.
- **기반 방향(Ink & Paper)은 심사가 골랐다.** 심사 세 건이 모두 이 방향을 기반으로 추천했다(구현·업그레이드 8, CJK·접근성 8, 제품·채택 8). 요소를 옮기지 않으므로 코어 업그레이드에 덜 깨지고 기존 Redmine 사용자가 다시 배울 것이 가장 적다. 사이드바 좌우 전환과 접기, 접기 셰브런의 RTL 반전은 7.0.1에서 확인됐다(관련 코어 규칙은 7.0.2와 같다, §4.3). 제시된 명암비가 재계산 결과와 모두 일치했다.
- **기본 크롬(Signature)은 소유자가 골랐다(2026-10-01).** 같은 기반 CSS에 토큰만 바꾼 A·B·C·D 프로토타입을 로컬 도커에서 나란히 본 뒤, 브랜드가 선명하고(상단 바 한 줄이 RAVNUS 바이올렛) 크롬이 가볍다(어두운 띠 두 개 대신 한 개)는 이유로 B를 골랐다.
- **받아들인 대가**: Ink & Paper 심사에서 장점으로 꼽힌 "코어가 전제하는 어두운 헤더 위 밝은 글자를 유지한다"는 이제 헤더에 적용되지 않는다. 코어 7은 `#header`와 `#header a`에 밝은 글자를 주고, 모바일 `responsive.css`는 헤더 안 글자색을 하드코딩한 채 테마보다 나중에 로드된다. 헤더·상단 바 배경은 7.0.2부터 코어 변수(`--color-header-background`, `--color-top-menu-background`)를 따르지만 7.0.0–7.0.1은 하드코딩이다. 테마가 놓친 규칙은 흰 바탕에 흰 글자가 되어 보이지 않고, 플러그인이 헤더에 넣는 콘텐츠도 같은 위험이 있다 (미검증: 플러그인). 대응: 7.0.2의 두 배경 변수를 크롬 토큰으로 재매핑하고(§8.4 5, §6.2), 변수가 없는 7.0.0–7.0.1은 같은 배경을 셀렉터로 칠하며(§8.4 "7.0.0–7.0.1 대응"), 변수가 닿지 않는 헤더 안 코어 규칙(글자·아이콘 색, 컨트롤 테두리, 포커스 링)은 목록으로 만들어 헤더 토큰으로 다시 칠하며(§8.4 12, §8.6), 목록 밖 자손도 따르도록 `#header`의 일반 자손에 색을 명시하고, 요소마다 계산 스타일을 assert한다(§10.2). 흰 헤더가 맞지 않는 설치는 Ink 프리셋으로 어두운 헤더를 쓴다(§6.3, §11).

이 방향의 약점이었던 네 가지는 다른 방향의 요소와 필수 수정으로 보완한다. 편집한 컴파일 파일이 업데이트 때 덮이는 문제, 본문 링크를 색으로만 구분하는 문제, 주 버튼 hover가 보이지 않는 문제, 선택 행 명암 여유 부족이다. 검토에서 나온 빈틈(렌더된 화면의 코어 하드코딩 색, forced-colors와 인쇄, 코어 `overflow: hidden`에 잘리는 포커스 링, jstoolbar와 `url()` 이미지 아이콘)도 범위에 넣었다.

**핵심 결정 한눈에 보기**

| 항목 | 내용 | 상태 |
|---|---|---|
| 지원 범위 (§4.12) | Redmine 7.x 전용. 6.x 이하는 지원하지 않는다(소유자가 Redmine 7을 쓴다). 6/7 동등성 작업은 없앤다 | **결정** (2026-10-01) |
| 메인 컬러·크롬 (§4.1) | B Signature가 기본값: 2rem `#46009B` 상단 바(흰 글자, 앰버 포커스 링) + 흰 헤더(헤더 토큰으로 코어 밝은 글자 규칙을 다시 칠함). `#46009B`는 크롬에서는 상단 바(모바일 flyout 포함)에만, 본문에서는 선택·주 버튼·포커스에만, 링크는 파랑. A Ink(잉크 바이올렛 헤더 + 상단 바), C Calm, D 레드마인 블루, Brand-forward는 README 프리셋. RAVNUS Inc. 브랜드 색을 공개 MIT 테마의 기본값으로 쓰는 것은 소유자가 확인했다 | **결정** (2026-09-26 A → 2026-10-01 B로 변경) |
| 레이아웃 변경 범위 (§4.2) | 기존 Redmine 레이아웃을 유지하고(영역 재배치 없음) 스타일만 바꾼다. v1에 `javascripts/theme.js` 없음 | **결정** (2026-09-26, 2026-10-01 재확인) |
| 사이드바 기본 위치 (§4.3) | 오른쪽 기본(코어와 같음). `--ravnus-sidebar-at-start: 1`로 인라인 시작 쪽(LTR에서는 왼쪽)으로 전환 | **결정** (2026-09-26) |
| Pretendard 제공 방식 (§4.4) | jsDelivr CDN 기본(v1.3.9 고정, Pretendard Variable 동적 서브셋). 생성 스크립트(`npm run fonts`)가 절대 https URL의 `@font-face`를 담은 `src/_pretendard.scss`를 만들고, 빌드(`npm run build`)가 이를 테마 CSS에 컴파일한다. CDN 스타일시트는 `@import`하지 않는다. 폰트 파일은 저장소에 두지 않는다. 폐쇄망·엄격한 CSP는 `custom.css`나 자식 테마에서 자체 호스팅. 요청을 응답 없이 버리는 망에서는 자체 호스팅이나 "시스템 폰트만 쓰기"가 필수 | **결정** (2026-09-26, 2026-10-01 재확인). 동작은 Phase 0 확인(7.0.2, 부록) |
| 사용자 커스터마이즈 (§4.5) | `:where(:root)` 토큰 + 추적하는 빈 `custom.css` 스텁 + 자식 테마 문서화 | **결정** (2026-09-26). import 경로는 Phase 0 확인(7.0.2, 부록) |
| CJK 타이포 정책 (§4.6) | F1 + K2. 폰트: ko와 그 밖의 UI는 Pretendard, ja·zh·zh-TW UI는 OS 네이티브 우선(Pretendard는 한글만). keep-all: ja·zh를 뺀 모든 UI 언어 | **결정** (2026-09-26) |
| 아이콘 | 코어 Tabler SVG 스프라이트를 토큰으로 다시 칠하기만 한다 | 추천 |
| 밀도 | 일감 목록 행 약 32px. Compact 프리셋은 약 27px | 추천 (코어 실측 완료(Pretendard 로드 상태 25px, §4.8), 테마 행은 Phase 3에서 측정) |
| 테스트 기준 버전 (§4.12) | `redmine:7.0.2` 도커 한 개(패치 버전 태그로 고정). 크롬 배경 변수가 없는 7.0.0–7.0.1은 7.0.1 spot check(§10.4)로 확인 | **규칙** (2026-10-01, 지원 범위 결정에 따른 프로젝트 규칙이며 소유자 결정이 아니다. `CLAUDE.md` "지원 범위", `docker-compose.yml`) |

**바로 다음 할 일**
1. Phase 0 도커 검증은 2026-10-01 `redmine:7.0.2`에서 끝났다(부록 "Phase 0 검증 결과"). 결과는 이 문서(§3, §4.4, §4.5, §4.8, §6.2, §7.3, §8.4, §9–§12)와 `CLAUDE.md`("폰트 제공", "Redmine 7 테마 동작", "진행 상태"), README 설치 절의 `touch` 후 재시작 안내에 반영했다. `CLAUDE.md`의 결정·지원 범위·7.0.0–7.0.1 폴백 범위 문구도 이 문서와 맞췄다.
2. 다음은 Phase 1(v0.1.0)이다(§9, §12). Phase 0에서 넘긴 두 확인(실제 네 스택 테마로 덮기 매트릭스 재측정, CDN 차단 전후 텍스트 컨테이너 높이)은 Phase 1 완료 기준에 넣었다.
3. v0.1.0부터 README.md와 README.ko.md에 Pretendard 크레딧·OFL 고지와 CDN 안내(개인정보, CSP, 폐쇄망, 중국 본토)를 함께 싣는다. 폐쇄망 항목에는 요청을 응답 없이 버리는 망에서 "시스템 폰트만 쓰기"나 자체 호스팅이 필수라는 것과 그 증상을, 커스터마이즈 절에는 자식 테마 import 형식과 실패 형식, 자식 테마와 `custom.css`의 우선순위를 적는다(§4.4, §4.5, §12).

---

## 2. 디자인 원칙

원칙 1·2는 §4.2 결정(기존 레이아웃 유지, 스타일만 변경)을, 원칙 2의 대상 코어는 지원 범위 결정(Redmine 7.x, 2026-10-01, §4.12)을 따른다. 원칙 3의 폰트·줄바꿈 언어별 분기는 §4.6 결정(F1 + K2)을, 원칙 6의 강조색과 크롬은 §4.1 결정(B Signature, 2026-10-01)을 따른다.

1. **익숙함이 먼저다.** 코어에서 찾던 것은 RAVNUS에서도 같은 자리에 있다. 영역을 옮기거나 숨기지 않고 동작도 바꾸지 않는다. v1에는 `javascripts/theme.js`를 두지 않는다. 기존 Redmine 사용자에게 재학습을 요구하지 않는다.
2. **요소는 옮기지 않고 스타일만 바꾼다.** 코어 7의 id·class(`#top-menu`, `#header`, `#main-menu`, `#sidebar`, `#content`, `table.list`, `div.issue`, `.tabs`)를 스타일하고, 코어 기준선(헤더·메뉴 바 치수, indigo 메뉴 바, 컴포넌트 패딩)은 토큰 값으로 명시해 덮는다. 그래야 7.x 패치가 기준선을 조금 바꿔도(7.0.2의 메인 메뉴 탭 치수(탭이 32px 바를 채움)·`.profile-menu` 28px 예약처럼, §8.4) 테마 모습이 같다. 코어가 이름 붙인 의미 변수(`--fonts-main`, `--color-current-marker`, 7.0.2부터 `--color-header-background`·`--color-top-menu-background`)는 `--ravnus-*` 토큰으로 재매핑하고, 변수가 닿지 않는 곳(흰 헤더 위 글자·아이콘 색, 포커스 링)과 변수가 없는 7.0.0–7.0.1은 명시 셀렉터로 칠한다. 팔레트 단계 이름인 `--oc-*`는 재매핑하지 않는다(§8.4 5).
3. **타이포그래피가 제품이다.** 모든 텍스트 컨테이너에 단위 없는 line-height를 명시한다. 행간, 자간, 문자 사이 간격은 언어별(`:lang`)로 따로 둔다. 폰트와 줄바꿈을 언어별로 얼마나 나눌지는 §4.6 결정을 따른다. 12px보다 작은 글자는 없다(간트 제목 열 제외, §7.2). 폼 컨트롤도 페이지 폰트를 쓴다.
4. **가독성은 숫자로 지킨다.** 테마가 칠하는 모든 텍스트 쌍은 4.5:1 이상이고, 본문은 7:1 이상이다(실제 16.2:1). 컨트롤 경계, 포커스 링, 의미 있는 그래픽은 놓일 수 있는 **모든** 표면(hover 행, 선택 행 포함)에서 3:1 이상이다. 토큰 쌍은 CI가 기본값과 모든 프리셋에 대해 검사하고, 렌더된 화면은 axe-core로 검사해 테마가 덮지 않은 코어 하드코딩 색까지 잡는다(§10.2). 다만 axe-core는 핵심 화면에서만 돌리고 그라디언트·배경 이미지·가상 요소 위 글자는 판정하지 못하므로(incomplete), 그 밖의 화면과 글자는 스크린샷 검토로 확인한다.
5. **색만으로 구분하지 않는다(WCAG 1.4.1).** 우선순위는 막대 개수와 모양으로, 상태는 빈 원·반원·체크·채운 원으로, 기한 초과와 일정 지연은 굵기와 서로 다른 글리프로 표시한다. 문장 속 링크는 밑줄로도 구분한다. 이 단서는 forced-colors와 흑백 인쇄에서도 남아야 한다(§8.8, §8.9).
6. **브랜드는 절제한다.** 기본값(Signature)에서 크롬에 브랜드 바이올렛 `#46009B`를 면으로 쓰는 곳은 2rem 상단 바(모바일에서는 같은 토큰을 쓰는 flyout)뿐이다. 프리셋은 크롬 토큰이 가리키는 곳에만 쓴다(Brand-forward의 헤더, §4.1). 본문에서는 주 버튼 채움과 선택·포커스 표시에만 쓴다. 강조색(같은 `#46009B`)은 "지금 위치"와 "누를 곳"만 알리고, 상태·우선순위 같은 의미 색에는 쓰지 않는다. 로고의 앰버·라임·시안도 의미 역할에 넣지 않는다. 기본 헤더에 로고를 넣지 않는다.
7. **모든 값은 토큰이고 되돌릴 수 있다.** 색·크기·간격·라운드는 `--ravnus-*` 토큰이다. 틴트 표면은 `--ravnus-bg-canvas`와 섞고, 밝게·어둡게 하는 파생(hover, active)은 내부 토큰 `--_ravnus-mix-light`·`--_ravnus-mix-dark`와 섞는다(§5.4·§5.5). 헤더가 어두운 프리셋의 상단 바는 같은 식으로 빌드 때 계산한 값을 README 블록에 리터럴로 싣는다(§5.4 폴백). 그래서 다크 세트는 재정의만으로 끝난다. 눈에 띄는 선택은 설치마다 되돌릴 수 있다. 줄무늬, 사이드바 위치, 본문 폭 제한, keep-all 범위는 토큰 하나로, 밀도는 토큰 두 개(§6.3 Compact 프리셋)로 바꾼다.

---

## 3. 방향 비교

| | Ink & Paper | Calm Workspace | Manuscript |
|---|---|---|---|
| 핵심 | 코어 배치 유지, 잉크 바이올렛 크롬, `#46009B`는 상호작용 강조에만 | 흰 크롬, 밑줄 탭 스트립, 테두리 없는 표. 보라는 신호에만 | 본문(설명·저널·위키)을 조판물처럼 다룸. 흰 헤더에 2rem 보라 상단 바 |
| 장점 | 코어의 어두운 크롬 전제를 유지해 오버라이드가 가장 적고 플러그인에 강하다. `order` 사이드바 전환과 `scale` 셰브런의 RTL 반전이 7.0.1에서 확인됐다. 프리셋 체계(브랜드 강조, 흰 크롬, 레드마인 블루, 왼쪽 사이드바, 컴팩트. 최종 목록은 §6.3)를 갖췄다. 폰트 파일을 분리해 CDN 전환이 한 줄이다(원안 기준. §4.4 결정으로 해당 없음). color-mix `@supports` 폴백이 있다 | 실제 코어에서 돌려 본 프로토타입이다(7.0.1에서 행 33px, 헤더 93px). `:where(:root)` 토큰으로 업데이트 안전한 `custom.css`가 가능하다. 행 단위로 상태를 매핑하며 색과 모양을 함께 싣는다. hover는 밝게, active는 어둡게 한다 | 언어별 본문 행간(ko 1.7, ja·zh 1.75)과 ja 자간을 둔다. 모든 컨테이너에 line-height를 명시한다. 본문 링크에 상시 밑줄을 긋는다. 상태 모양을 모두 다르게 한다. 자식 테마 배포 모델을 제시했다 |
| 약점 | 편집한 컴파일 파일이 git pull에 덮인다. 본문 링크에 밑줄이 없다(본문 글자 대비 2.53:1). 주 버튼 hover가 1.19:1이라 보이지 않는다. 선택 행의 fg-subtle이 4.29:1이다. high2/highest 행 마커가 색으로만 다르다. 크롬이 무겁고 PurpleMine을 떠올리게 할 수 있다 (미검증: 사용자 인상) | 흰 헤더가 코어·플러그인의 밝은 글자 전제를 뒤집는다. `transform` 셰브런이 7의 RTL 반전을 깬다(검증됨). 스크린샷에서 브랜드 인상이 약하다. 제목 링크가 검정이고 줄무늬가 없어 가장 낯설다. 크롬이 약 126px이다 | 순수 텍스트 셀 + border-collapse라 td에 알약을 만들 수 없다. ja·zh UI에도 keep-all을 건다. 진행 막대를 보라로 칠해 의미 색 규칙을 어긴다. 자식 테마 import 경로 `../../ravnus/stylesheets/...`가 Propshaft에서 해석되지 않는다(소스 추적, 7.0.2 기동에서 404 확인, §4.5). 공수 추정이 낙관적이다 |
| 심사 점수 (구현·업그레이드 / CJK·접근성 / 제품·채택) | **8 / 8 / 8** | 7 / 7 / 6 | 6 / 7.5 / 6.5 |

이 표는 세 방향 원안의 평가 기록이다. 원안 평가 때는 지원 범위가 6.x / 7.x라 "6.1과 7.0에서 같은 모습"이 장점과 필수 수정의 근거였지만, 2026-10-01 지원 범위가 7.x 전용으로 바뀌어 6/7 동등성은 더 이상 기준이 아니다. 표와 아래 채택 요소에서 그 근거는 지우고 7.0.1에서 확인한 결과만 남겼다. 2026-10-01 기본 크롬이 Signature(흰 헤더)로 바뀌었으므로, Ink & Paper의 "코어의 어두운 크롬 전제를 유지해 오버라이드가 가장 적고 플러그인에 강하다"는 이제 Ink 프리셋에만 해당한다. Calm Workspace 약점의 "흰 헤더가 코어·플러그인의 밝은 글자 전제를 뒤집는다"는 기본 크롬에도 해당하며, 대응은 §4.1에 적었다.

### 채택안에 가져온 요소

| 출처 | 가져온 것 | 이유 |
|---|---|---|
| Ink & Paper (기반) | 배치 유지, 잉크 바이올렛 크롬(2026-10-01부터 README Ink 프리셋), 연한 메인 메뉴 바, 링크 파랑, 토큰 세트와 명암 수치, 크롬 토큰 체계(Ink 프리셋의 흰 포커스 링 포함), `@supports` color-mix 폴백, 프리셋 체계, 우선순위 막대 글리프, 줄무늬 유지 | 심사 세 건 모두 기반으로 추천 |
| Calm Workspace | 모든 토큰을 `:where(:root)`에 선언, 추적하는 `custom.css` 스텁, 행에 커스텀 속성을 주는 상태·트래커 매핑(id 개수 제한 없음), hover는 밝게·active는 어둡게, 목록 제목 14px/500과 메타 13px 구분, CSS 주입 프로브 하네스, 나중에 로드되는 코어 CSS보다 셀렉터를 한 단계 높이는 규칙 | 업데이트 안전성, 색+모양 매핑, 검증 방법 |
| Manuscript | 언어별 본문 행간·자간, 모든 텍스트 컨테이너의 명시적 line-height, 본문 링크 상시 밑줄, 상태 모양 4종 구분, 틴트만으로 구분하는 사이드바, 자식 테마 배포(경로 수정), CJK 합성 기울임 제거, Signature 크롬(2rem 브랜드 바이올렛 상단 바 + 흰 헤더, 앰버 포커스 링. 2026-10-01 소유자 결정으로 기본 크롬, §4.1), 일감 제목 확대 | CJK 읽기 품질. Signature 크롬은 소유자 선호(브랜드 선명도, 가벼운 크롬) |
| 심사 필수 수정 | `body.has-main-menu`는 코어가 주므로(7.0.2 `app/helpers/application_helper.rb` 920행) `:has()` 폴백을 뺀다. 셰브런은 `scale` 속성으로 뒤집는다. 사이드바 토큰은 논리 방향 이름으로 짓는다. 코어 기준선(헤더·메뉴 바 치수)을 명시적으로 리셋한다. 주 버튼은 allowlist로 정한다. td는 알약 대신 글리프+글자색으로 표시한다. 크롬 안 요소는 크롬 토큰만 쓴다. `border-control`은 모든 표면에서 3:1 이상이다. 선택 행은 마커 대신 배경과 체크박스로 표시한다. `--color-header-background`에만 기대지 않는다(원안 심사 때의 7.0.1에는 이 변수가 없었다. 7.0.2부터 재매핑하되(§8.4 5) 7.0.0–7.0.1용 셀렉터 폴백을 둔다(§8.4 "7.0.0–7.0.1 대응")) | 검증된 결함 |
| 검토 반영 | 행 단위 기본값을 명시도 0(`:where()`)으로 선언, 폰트 제공 방식 변경을 컴파일 파일이 아니라 `custom.css`·자식 테마에서(§4.4 결정 뒤에는 자체 호스팅 경로), 렌더 화면 axe-core 검사, forced-colors·인쇄 대응, 포커스 링을 자르는 코어 `overflow: hidden` 해소, 문장 속 링크 밑줄 범위 확대, 일정 지연 글리프, 이름 열 줄바꿈, 모바일 컨트롤 크기, 12px 하한 목록 | 검토 의견(부록) |

**채택안에서 뺀 요소**

아래 목록의 처음 세 항목은 §4에 검토한 선택지로 남아 있다.
- 기본값으로서의 흰 상단 바 크롬(§4.1 C Calm 선택지)과 기본값으로서의 어두운 잉크 바이올렛 크롬(§4.1 A. 2026-09-26 기본값이었으나 2026-10-01 기본값에서 뺐다). 둘 다 README 프리셋으로는 제공한다
- ja·zh UI의 keep-all(§4.6 K3 선택지)
- Pretendard 폰트 파일 번들과 별도 폰트 스타일시트(`ravnus-fonts.css`) 분리(§4.4 결정으로 CDN 기본. 폰트 파일은 저장소에 두지 않는다)
- `clamp()` 사이드바 폭(900–1090px 노트북에서 본문을 좁힘)
- 본문 폭 제한 기본 적용(opt-in 토큰으로만)
- CJK 권점 강조 기본 적용(opt-in으로만)
- 보라색 진행 막대
- 상태·트래커용 `@each 1..16` id 규칙(우선순위 위치 클래스와 태그 색 이름에는 map + `@each`를 계속 쓴다, §5.1)
- data: SVG 마스크 글리프(그라디언트·테두리로 대체하고 예비 수단으로만 둠)

---

## 4. 결정 사항

§4.1–§4.6의 여섯 항목은 2026-09-26 **소유자 결정**으로 확정했다. 2026-10-01 소유자가 §4.1의 기본값을 A에서 B로 바꾸고 §4.2와 §4.4는 다시 확인했으며, 지원 범위를 Redmine 7.x 전용으로 바꿨다(§4.12, 부록 "결정 기록"). 각 절의 선택지 표는 검토한 대안과 절충의 기록으로 남기고, 고른 선택지에 "결정"을 적는다. §5 이후의 사양은 이 결정을 따른다. §4.12의 테스트 기준(`redmine:7.0.2`)은 지원 범위 결정에 따라 정한 프로젝트 규칙이다(`CLAUDE.md` "지원 범위"). §4.7–§4.11은 "추천"이며 이견이 없으면 이 문서대로 확정한다.

### 4.1 메인 컬러·팔레트·크롬 (결정: 2026-09-26, 변경: 2026-10-01)

| 선택지 | 모습 | 장점 | 약점 |
|---|---|---|---|
| A. 잉크 바이올렛 (2026-09-26 기본값, 2026-10-01부터 README 프리셋 "Ink") | 상단 바 `#1C0F3A`, 헤더 `#311E5F`(흰 글자 14.17:1). 메인 메뉴는 연한 바 `#F6F6FC`에 `#46009B` 밑줄 마커 | 코어 크롬 전제를 유지해 오버라이드가 가장 적다. 밝은 글자를 전제한 플러그인 헤더 링크도 읽힐 것으로 본다 (미검증: 개별 플러그인을 시험하지 않았다). Theme_List 썸네일에서 "테마가 적용된" 화면으로 보인다. PurpleMine(`#614BA6`)보다 어둡고 채도가 낮다 | 어두운 띠 두 개(상단과 헤더의 대비 1.26:1, 헤어라인으로 보완). 크롬 합계가 약 116px(프로토타입을 7.0.1에서 측정)로 작업 자료의 코어 7.0.1(104px)보다 크다. 다만 7.0.2 코어는 익명 상단 바가 28px로 커져 크롬이 118px다(§8.4) (미검증: Phase 2에서 7.0.2와 최종 CSS로 재측정) |
| **B. Signature (결정: 기본값, 2026-10-01)** | 2rem `#46009B` 상단 바(흰 글자 12.11:1, 앰버 포커스 링 6.24:1) + 흰 헤더(본문 글자 16.20:1). 메인 메뉴는 A와 같은 연한 바 | 브랜드 서명이 선명하고 가볍다. 어두운 띠가 하나다 | 흰 헤더가 코어 `#header a` 밝은 글자 전제를 뒤집어 오버라이드가 늘어난다(§8.4 12, §8.6). 플러그인 헤더 콘텐츠가 흰 바탕에 흰 글자가 될 위험이 있다 (미검증). 크롬 합계가 약 120px로 A보다 4px 크다 (미검증: Phase 2에서 재측정) |
| C. Calm | 상단·헤더 모두 흰색. 보라는 탭 밑줄과 버튼에만 | 가장 조용하다 | 스크린샷에서 테마가 없는 것처럼 보인다. B의 흰 헤더 반전에 더해 상단 바·flyout의 밝은 글자 전제도 뒤집혀(§8.4 12, §8.6 "밝은 flyout") 반전 위험이 가장 크다 |
| D. 레드마인 블루 | 헤더 `#2B5F8A`(흰 글자 6.76:1), 강조 `#1864AB`(6.09:1) | 브랜드 색을 쓰지 않아 가장 중립적이다 | 차별점이 약하다 |

**결정 (2026-10-01): B(Signature)를 기본값으로 하고, A(Ink)·C(Calm)·D(레드마인 블루)와 Brand-forward(헤더 `#46009B`, 흰 글자 12.11:1)를 README 프리셋으로 제공한다.** Signature는 더 이상 프리셋이 아니다. 2026-09-26 결정(A 기본값, B·C·D·Brand-forward 프리셋)은 부록 "결정 기록"에 이력으로 남긴다. 채택안의 나머지(기반 방향 Ink & Paper의 배치, 타이포그래피, 크롬이 아닌 토큰, 목록 표현)는 그대로이고, 기본 크롬의 처리만 Signature를 따른다. 메인 메뉴 바의 색·탭 표현, 강조 `#46009B`, 링크 `#215DB3`과 크롬이 아닌 기존 토큰의 값은 그대로다. 흰 헤더와의 경계를 위해 메인 메뉴 바에 위아래 헤어라인(위는 header-divider, 아래는 새 토큰 `--ravnus-nav-border`)과 `box-sizing: border-box`만 더한다(§6.2, §8.4 3). 이 선은 크롬 선택과 상관없는 규칙이라 Ink 프리셋 화면(2026-09-26 기본값 A)에도 새로 생긴다. Phase 2가 끝날 때 기본값 B와 대안 크롬 프리셋 4종을 7.0.2에서 찍어 README 프리셋 스크린샷으로 쓴다(§9 Phase 2).

- **값**: 상단 바 `--ravnus-topbar-bg` #46009B(최소 높이 2rem), `--ravnus-topbar-fg` #FFFFFF, `--ravnus-topbar-fg-muted` #CAC5EA, `--ravnus-topbar-focus` #FEA800(앰버 링). 헤더 `--ravnus-header-bg`는 canvas(#FFFFFF), `--ravnus-header-fg`는 fg-default(#202026), `--ravnus-header-fg-muted`는 fg-subtle(#64626A), `--ravnus-header-focus`는 accent(#46009B). 대비와 경계선은 §6.2다.
- **근거**: 소유자 선호. 아래 1차 시각 비교의 프로토타입을 나란히 본 뒤, 브랜드가 선명하고(상단 바 한 줄이 RAVNUS 바이올렛) 크롬이 가볍다(어두운 띠 두 개 대신 한 개)는 이유로 B를 골랐다. 심사 점수로 고른 것이 아니다. 심사는 기반 방향(Ink & Paper)을 골랐다(§1).
- **받아들인 대가**:
  1. 흰 헤더가 코어의 "어두운 헤더 위 밝은 글자" 전제를 뒤집는다. 코어 7은 `#header`와 `#header a`에 밝은 글자를 주고, 모바일 `responsive.css`는 프로젝트 이동 글자·메뉴 토글 색을 하드코딩한 채 테마보다 나중에 로드된다(§8.3). 모바일 헤더 배경은 7.0.2부터 `--color-header-background`를 따르지만 7.0.0–7.0.1은 #628db6 하드코딩이다(§8.4). A에서는 테마가 규칙을 놓쳐도 어두운 헤더 위 밝은 글자라 읽히지만, B에서는 흰 바탕에 흰 글자가 되어 보이지 않는다.
  2. 다시 칠할 코어 규칙이 늘고(데스크톱 §8.4 12, 모바일 §8.6), 7.x 패치로 코어가 바뀔 때마다 이 목록을 다시 감사해야 한다(§11).
  3. 플러그인이 헤더에 넣는 링크·아이콘·글자가 밝은 글자를 전제하면 읽히지 않을 수 있다 (미검증: 특정 플러그인을 시험하지 않았다).
  4. 흰 헤더, 연한 메뉴 바(`#F6F6FC`, 흰색과 1.08:1), 흰 본문이 이어져 영역 경계가 약하다. 메뉴 바와 본문 사이의 1.08:1은 A에도 있었지만, B에서는 메뉴 바 위아래가 모두 흰색이 된다.
  5. 크롬이 A보다 4px 높다(프로토타입 120px. 7.0.1 코어 104–106.5px보다 13.5–16px, 7.0.2 코어 118px보다 약 2px 크다. Ink 프로토타입 116px는 7.0.2 코어보다 약 2px 작다) (미검증: 측정 조건이 달라 직접 비교할 수 없다. Phase 2에서 최종 CSS를 7.0.2로 재측정).
- **완화**:
  1. 7.0.2부터는 코어 크롬 배경 변수 두 개를 크롬 토큰으로 재매핑해(`--color-header-background`는 header-bg, `--color-top-menu-background`는 topbar-bg) 데스크톱 헤더·상단 바와 모바일 헤더·flyout 배경이 토큰을 따르게 한다. 이 재매핑은 아래 재칠 목록과 같은 릴리스(Phase 2, v0.2.0)에만 싣는다(§4.5). 변수가 없는 7.0.0–7.0.1을 위해 배경 셀렉터도 둔다(§8.4 "7.0.0–7.0.1 대응", §6.2). 변수가 닿지 않는 헤더 안의 코어 밝은 글자 규칙은 목록으로 만들어(§8.4 12, §8.6) 헤더 토큰으로 다시 선언한다. 목록 밖 자손도 따르도록 `#header`의 `color`, `#header a`와 그 hover·포커스, `#header svg.icon-svg`의 stroke, `#header svg.icon-svg-filled`의 fill에 헤더 토큰을 명시한다. 헤더 안 오버레이(`#project-jump .drdn-content`)와 상단 바 안의 계정 드롭다운(`#account .dropdown-content`)은 overlay 표면이므로 일반 토큰으로 되돌린다(§6.2).
  2. 어두운 헤더에서는 흰 필드 자체가 경계였던 빠른 검색 입력과 프로젝트 이동 트리거에 `--ravnus-header-control-border`(기본 border-control, 흰 헤더 위 4.12:1) 테두리를 준다.
  3. 헤더와 메뉴 바 사이, 상단 바와 헤더 사이, 모바일 헤더 아래에 `--ravnus-header-divider` 헤어라인(#D9D8DD)을, 메뉴 바와 본문 사이에 `--ravnus-nav-border` 헤어라인(#D9D8DD)을 둔다(§6.2). 메뉴 바의 선은 `box-sizing: border-box`로 nav-height 안에 넣어 헤더 예약 패딩과 맞춘다(§8.4 3).
  4. Phase 2에서 헤더 요소마다 계산 스타일 assert와 axe-core 검사를 1440·800px, 익명·로그인, 7.0.2에서 돌린다. 헤더 변수가 없는 경우는 7.0.1 spot check(§10.4)로 한 번 확인한다(§9, §10.2).
  5. 헤더에 콘텐츠를 넣는 플러그인 때문에 흰 헤더가 맞지 않는 설치는 Ink 프리셋 블록(§6.3)을 `custom.css`나 자식 테마에 넣어 코어와 같은 어두운 헤더로 돌아간다. 플러그인 CSS 자체는 범위 밖이다(§11).

**1차 시각 비교 (2026-09-26, 작업 자료)**: 같은 기반 CSS에 토큰만 바꾼 A·B·C·D 프로토타입을 로컬 도커의 7.0.1에 Pretendard를 로드해 입히고 일감 목록·상세를 캡처했다. 크롬 높이는 A·C·D 116px(상단 바 28 + 헤더 88, 헤더 안에 메뉴 바 36 포함. 즉 28 + 52 + 36), B 120px(상단 바 32 + 헤더 88, 즉 32 + 52 + 36), 코어 7.0.1은 104px다. 프로토타입은 저장소에 싣지 않는다 (미검증: 작업 자료의 프로토타입 측정. 7.0.2 코어와 최종 CSS의 높이는 Phase 2에서 잰다). 2026-10-01 소유자가 이 비교를 보고 B를 기본값으로 골랐다.
- 7.0.2 코어 참고값(2026-10-01, 로컬 도커, 코어 기본 테마, 익명 일감 목록, 1440px): 7.0.1 106.5px(상단 바 16.5 + 헤더 90), 7.0.2 118px(상단 바 28 + 헤더 90)다. 늘어난 11.5px는 7.0.2의 `.profile-menu` 28px 예약 때문이다(§8.4). 작업 자료의 104px와 이 106.5px는 측정 조건(로그인 여부·폰트)이 달라 다르다 (미검증: 작업 자료의 측정 조건은 기록이 없다). 테마는 상단 바 높이를 `--ravnus-topbar-height`(기본 2rem)로 정하므로 7.0.2의 28px 예약은 그 안에 든다.

**브랜드 색 사용**
- 소유자가 RAVNUS Inc. 브랜드 색(`#46009B`와 이를 바탕으로 만든 크롬 색)을 공개 MIT 테마의 기본값과 프리셋에 써도 된다고 확인했다(2026-09-26). 그래서 선행 조건이나 임시 기본값을 두지 않는다.
- 브랜드 색 사용에 조건이 없으므로 기본값 B의 상단 바에 `#46009B`를 그대로 쓴다. 대안 크롬 프리셋 4종(Ink, Brand-forward, Calm, Redmine Blue)의 README 블록과 스크린샷은 크롬 스타일이 들어가는 v0.2.0(Phase 2)부터 싣는다.
- D(레드마인 블루)는 브랜드 색을 쓰지 않는 프리셋으로 남는다. 로고는 기본 헤더에 넣지 않는다(§2 원칙 6).

모든 안에 공통으로 적용하는 규칙:
- 강조색(`#46009B`)은 본문에서 주 버튼, 선택 마커, 포커스 링, 체크박스 `accent-color`에만 쓴다. 크롬에서는 크롬 토큰이 가리킬 때만 면으로 쓴다(B의 상단 바와 같은 토큰을 쓰는 모바일 flyout, Brand-forward의 헤더).
- 링크는 `#215DB3`이고 방문한 링크도 같은 색이다. hover는 `#164384`에 밑줄을 긋는다. 코어의 빨간 hover를 대체한다.
- 중립 회색은 OKLCH 색상각 약 290, 채도 0.014 이하로 보라 기미만 준다.
- 로고의 앰버 `#FEA800`, 라임 `#90CF1F`, 시안 `#00B6C4`는 흰 바탕 텍스트 대비가 1.89–2.47:1이라 의미 역할에서 뺀다. 앰버는 Signature의 보라 바 위 포커스 링으로만 쓴다.

### 4.2 레이아웃 변경 범위 (결정: 2026-09-26, 재확인: 2026-10-01)

| 선택지 | 내용 | 장점 | 약점 |
|---|---|---|---|
| **1. 스타일만 바꾸고 CSS만 쓴다 (결정)** | 영역과 순서는 유지한다. 색·타이포·간격·라운드·크롬만 바꾼다 | 업그레이드 위험이 가장 작고 기존 사용자의 재학습이 없다 | 구조적으로 새로운 점은 없다 |
| 2. 크롬 재설계, CSS만 | 흰 헤더, 밑줄 탭 스트립, 테두리 없는 표(Calm) | 현대적이다 | 코어 전제를 뒤집고 유지 부담이 가장 크다 |
| 3. 재배치, theme.js 사용 | 세로 내비 레일, 메인 메뉴와 사이드바 병합 | 차별화된다 | `#main-menu`가 `#header` 안에 있고 `responsive.js`가 리사이즈 때마다 DOM을 옮긴다. Sidebar White(118KB JS)는 Redmine 7의 상태 필터를 깨뜨린 전례가 있다 |

**결정: 1.** 기존 Redmine 레이아웃을 유지한다. 영역을 옮기지 않고 스타일만 바꾼다. 2026-10-01 소유자가 이 결정을 다시 확인했다. 재배치(선택지 3)는 작업량이 늘어난다는 이유로 받아들이지 않았다.
- §4.1 B의 흰 헤더는 색 처리이고 영역·순서·크기 구조를 바꾸지 않으므로 이 결정 안에 있다. 선택지 2의 밑줄 탭 스트립과 테두리 없는 표는 들여오지 않는다.
- v1에는 `javascripts/theme.js`를 두지 않고 `javascripts/` 디렉터리도 만들지 않는다.
- theme.js는 레이아웃 변경(요소 재배치)에 쓰지 않는다. 레이아웃을 바꾸지 않는 theme.js 기능은 v2 이후에 따로 검토한다(§8.2).
- 같은 이름의 코어 파일 대체(테마 `stylesheets/responsive.css` 등)도 하지 않는다. 가능성은 있지만 시험하지 않았다.
- 이 결정에 맞춰 §6.2 크롬 토큰, §8.1 표, §8.2 범위, §12 공수를 썼다.

### 4.3 사이드바 기본 위치 (결정: 2026-09-26)

| 선택지 | 장점 | 약점 |
|---|---|---|
| **오른쪽 기본 (결정)** | 코어와 같다. Redmine 사이드바는 전역 내비가 아니라 문맥 패널이다(저장된 쿼리, 감시자, 위키 색인). GitHub·Linear도 문맥 패널을 오른쪽에 둔다 | 왼쪽 사이드바를 쓰는 테마에서 옮겨 오는 사용자에게는 위치가 바뀐다. 이런 설치는 `custom.css`나 자식 테마에 `--ravnus-sidebar-at-start: 1` 한 줄(§6.3 Left sidebar 프리셋)을 넣는다 |
| 왼쪽 기본 | 왼쪽 사이드바를 쓰는 테마에서 옮겨 오는 사용자에게 익숙하다 | 코어 사용자에게는 낯설다 |

**결정: 오른쪽 기본(코어와 같다).** `--ravnus-sidebar-at-start: 1`을 주면 인라인 시작 쪽(LTR에서는 왼쪽)으로 옮긴다(§6.3 Left sidebar 프리셋). 구현은 어느 쪽이든 같고 기본값 토큰만 다르다.

```css
:where(:root) { --ravnus-sidebar-at-start: 0; }         /* 1 = 인라인 시작 쪽(LTR에서는 왼쪽) */
#sidebar { order: var(--ravnus-sidebar-at-start, 0); }  /* 코어 #main의 row-reverse 안에서 */
#sidebar-switch-button svg { scale: calc(1 - 2 * var(--ravnus-sidebar-at-start, 0)) 1; }
```

- 확인 범위: 펼침·접힘, 좌우 전환, RTL 셰브런(he 로캘)을 7.0.1에서 확인했다(작업 자료의 프로토타입). 7.0.2의 관련 코어 규칙(`#main`·`#sidebar`·`#sidebar-switch-*`, `application.css` 318–377행, 셰브런 RTL 반전 2257–2259행)은 7.0.1과 같으므로 7.0.2에서도 같을 것으로 본다 (미검증: Phase 2에서 7.0.2로 확인).
- 측정 결과(`--ravnus-sidebar-at-start: 1`일 때, 7.0.1): 사이드바 x=0 w=309, 본문 x=309. 접으면 21px 띠가 되고, 토글은 [0,28]에서 클릭된다.
- `transform`이 아니라 `scale` 속성을 쓴다. 코어의 `html[dir="rtl"] svg.icon-svg.icon-rtl {transform: scaleX(-1)}`(2257–2259행)과 겹쳐 적용되기 때문이다(he 로캘에서 확인).
- 이름을 left가 아니라 at-start로 지은 이유: RTL에서는 코어 `#main`의 row-reverse(318행)가 이미 사이드바를 왼쪽에 둔다.
- 코어의 접힘 패딩은 유지한다. 없애면 토글이 x=-20으로 밀려난다.
- 폭은 코어 단계(22%, 240, 280, 320, 360, 380px, 321–326행)를 유지한다.
- 900px 미만에서는 `responsive.js`가 사이드바 내용을 flyout으로 옮기므로 이 토큰은 영향이 없다.

### 4.4 Pretendard 제공 방식 (결정: 2026-09-26, 재확인: 2026-10-01)

| 선택지 | 저장소 크기 | 첫 방문 전송량 | 장점 | 약점 |
|---|---|---|---|---|
| **jsDelivr CDN, 가변 동적 서브셋 (결정: 기본값)** | 폰트 파일 0. 생성된 `@font-face` 92개만 테마 CSS에 들어간다 | ko UI 첫 방문 기준 일감 목록 19조각 472,560바이트, /projects 8조각 208,188바이트, 위키 24조각 575,012바이트(7.0.2 측정, 아래 "폰트 전송량"). jsDelivr가 1년 immutable 캐시 헤더를 보내므로 이후 캐시 | 저장소와 설치 크기가 늘지 않는다. 테마 안에서 폰트 파일을 서빙하거나 기동 때 컴파일할 일이 없다. 폰트 캐시 헤더를 설치마다 설정하지 않아도 된다 | 폐쇄망에서는 시스템 폰트로 표시되고, 요청을 응답 없이 버리는 망에서는 window `load`가 늦어진다(아래). 방문자 IP가 jsDelivr로 가고, Referer와 Origin 헤더로 Redmine origin도 간다(아래 README 안내). CSP `font-src`에 CDN을 허용해야 한다. 중국 본토에서는 jsDelivr가 본토 밖 CDN으로 서빙돼 느리거나 불안정할 수 있다(근거는 아래 README 안내의 중국 본토 항목). 외부 의존이 생긴다(TW-Style·redmine.tokyo 사례). 대응은 아래와 §11 |
| 공식 가변 동적 서브셋 번들 | woff2 92개, 2.82MiB(2,957,724바이트) | CDN과 같다 | 폐쇄망과 CSP `'self'`에서도 동작한다. 사용자 IP와 Redmine origin이 CDN으로 가지 않는다 | 저장소가 커진다. OFL 전문을 함께 넣어야 한다. Propshaft 서빙과 기동 시 컴파일 시간은 확인하지 않았다 (미검증) |
| 단일 가변 woff2 번들 | 1.96MiB 1개(2,057,688바이트) | 1.96MiB 한 번 | 단순하다 | 첫 방문이 무겁다 |

파일 크기는 jsDelivr의 `pretendard@1.3.9` 파일 목록 합계(2026-09-26)이고, 이 절의 MiB는 2^20바이트다.

**폰트 전송량** (Phase 0 4, 2026-10-01, 7.0.2): 로컬 시드, 익명, 1440×900 뷰포트, 첫 방문(캐시 없음), headless Chrome 154, macOS 폰트. 값은 "조각 수 / 바이트"이고 바이트는 woff2 파일 크기의 합이다(전송된 본문은 약 1.8% 더 크다). ja·zh 열은 §7.1 스택을 `custom.css`로 흉내 내 잰 값이라 Phase 1에서 실제 테마로 다시 잰다.

| 페이지 | ko | ja | zh |
|---|---|---|---|
| `/projects/website-renewal/issues` | 19 / 472,560 | 11 / 288,588 | 11 / 288,588 |
| `/projects` | 8 / 208,188 | 7 / 183,696 | 7 / 183,696 |
| `/issues/4` | 10 / 259,792 | 9 / 232,828 | 9 / 232,828 |
| 위키 `타이포그래피_샘플` | 24 / 575,012 | 15 / 402,096 | 15 / 402,096 |

- 조각 수는 화면에 배치된 글자에 따라 달라진다. 일감 목록의 전체 페이지 스크린샷은 조각을 1개 더 받았다(서브셋 70). 측정값에는 이 조건을 함께 적는다.
- ja·zh UI에서도 한글이 있는 페이지는 Pretendard 조각을 7–15개 받는다. §7.1이 예상한 그대로다.
- 작업 자료의 수치(/issues 20조각 487KB, /projects 307KB, 위키 257KB)와 비교하면 위키가 두 배 넘게 크다. 원인은 확인하지 않았다.
- 테마가 `--fonts-main`을 바꾸면 코어가 자체 호스팅하는 Noto Sans는 요청되지 않는다(코어 폰트로 되돌리면 일감 목록에서 2개, 437,556바이트).

**결정: jsDelivr CDN을 기본으로 하고, 폰트 파일은 저장소에 넣지 않는다.** 초안의 추천(번들 기본, CDN opt-in)을 뒤집은 결정이다. 2026-10-01 소유자가 CDN 기본을 다시 확인했다. `fonts/` 디렉터리, 동봉 OFL 파일, `docker-compose.yml`의 폰트 마운트는 없다. 방식은 다음과 같다.

- **CDN 스타일시트를 `@import`하지 않는다.** `@import`로 불러온 스타일시트는 받거나 실패할 때까지 페이지 렌더링을 막는 것으로 본다. 그러면 폐쇄망에서 요청이 응답 없이 버려질 때 연결 시간 초과까지 화면이 늦게 뜰 수 있다 (미검증: 명세 근거와 브라우저 동작을 확인하지 않았다. 이 방식은 쓰지 않으므로 Phase 0에서도 재지 않았다).
- **생성 스크립트(`npm run fonts`)가 `src/_pretendard.scss`를 만들고, 빌드(`npm run build`)가 이를 테마 CSS에 컴파일한다.** 생성되는 `@font-face`는 업스트림 unicode-range를 그대로 쓰고 `font-family: "Pretendard Variable"; font-style: normal; font-weight: 45 920; font-display: swap`으로 선언한다. `src`는 절대 https CDN URL이다.
  ```css
  /* src/_pretendard.scss: 생성 파일이므로 직접 고치지 않는다. 92개 중 첫 규칙.
     src의 상대 URL만 절대 URL로 풀고, 나머지는 v1.3.9 업스트림 CSS 텍스트 그대로다(속성 순서, 작은따옴표, 소문자 unicode-range). */
  /* [0] */
  @font-face {
  	font-family: 'Pretendard Variable';
  	font-style: normal;
  	font-display: swap;
  	font-weight: 45 920;
  	src: url(https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2-dynamic-subset/PretendardVariable.subset.0.woff2) format('woff2-variations');
  	unicode-range: U+f9ca-fa0b, U+ff03-ff05, U+ff07, U+ff0a-ff0b, U+ff0d-ff19, U+ff1b, U+ff1d, U+ff20-ff5b, U+ff5d, U+ffe0-ffe3, U+ffe5-ffe6;
  }
  ```
  - 컴파일된 `stylesheets/application.css`에서는 Dart Sass가 들여쓰기를 공백 두 칸으로, 작은따옴표를 큰따옴표로 바꾼다. 따옴표 없는 `url()`과 unicode-range는 그대로 남는다(로컬 Dart Sass 1.105.0으로 이 규칙을 컴파일해 확인). 그래서 Phase 0(1a)도 URL 문자열로 비교했고, CI도 따옴표가 아니라 URL 문자열로 비교한다.
  - 폰트 요청은 스타일시트처럼 페이지 렌더링 전체를 기다리게 하지 않고, 그 폰트를 쓰는 글자의 표시만 잠깐 늦춘다. CSS Fonts 4 `font-display`에 따르면 `swap`은 face에 아주 짧은 block 기간(대부분의 경우 100ms 이하 권장)과 무한한 swap 기간을 주고, block 기간에는 보이지 않는 폴백으로 자리를 잡는다. 그래서 글자는 짧은 block 기간 뒤 폴백으로 그려지고, 폰트가 오면 바뀐다. CDN에 닿지 않으면 폰트 요청만 실패하고 글자는 스택의 나머지 폰트(로컬 Pretendard, system-ui 계열, 한글은 Apple SD Gothic Neo·Malgun Gothic 등, §7.1)로 남는다. Phase 0 2(Chrome 154, macOS)에서 CDN을 abort, DNS 실패, 무응답, 패킷 버림으로 막아도 첫 페인트는 늦어지지 않았다(일감 목록 FCP−DCL 중앙값 12–16ms(패킷 버림은 1회 30ms), 차단 없음 18ms). 무응답일 때는 FCP부터 모든 글자가 폴백 폰트로 보여, 글자가 보이지 않는 기간은 관찰되지 않았다. 단위 없는 line-height가 있는 요소는 차단 전후 높이가 같았고, `line-height: normal`인 요소만 1–3px 바뀌었다(§7.3).
  - **`load` 이벤트는 늦어진다.** 폰트 요청은 window `load`를 붙잡는다(Phase 0 2d). 요청이 바로 실패하는 망(DNS 실패, 연결 거절)은 영향이 없다(`load`−DCL 중앙값 abort 6ms, DNS 실패 2ms). 요청을 응답 없이 버리는 망에서는 페이지마다 연결 시간 초과까지 `load`가 늦어진다. macOS에서 일감 목록 300초(폰트 19개), 이어 연 일감 상세 225초(14개)를 쟀고, FCP는 1초 미만이었다. 다른 OS는 확인하지 않았다 (미검증). 7.0.2 소스(`app`, `lib`)에서 `$(window).on('load', …)`에 묶인 곳은 두 군데다.
    - 저장하지 않은 변경 경고 `warnLeavingUnsaved`(`app/helpers/application_helper.rb` 1816행)는 사용자 설정에서 끄지 않은 모든 페이지에서 `load` 때 등록된다. 그래서 `load` 전에는 경고 없이 다른 페이지로 이동해 입력이 사라지고, `load` 전에 입력한 내용은 `load` 뒤에도 보호되지 않는다(Phase 0 2f).
    - 일괄 편집 "지우기" 체크박스(`input[data-disables]`, `app/views/issues/bulk_edit.html.erb` 267–275행)는 `load` 때 값을 비우는 처리를 연결한다. 필드 비활성화는 document ready 때 `application-legacy.js` 1228행이 따로 걸므로 `load` 전에도 된다. 그래서 흐린 필드에 값이 남는 표시 차이만 있고, 비활성 필드는 제출되지 않아 결과는 같다(Phase 0 2e).
    - CSS만으로는 걸린 요청을 짧게 끊을 수 없다. 그래서 요청을 응답 없이 버리는 방화벽·폐쇄망에서는 "시스템 폰트만 쓰기" 블록이나 자체 호스팅이 필수다(아래 README 안내, §11).
  - CDN 스타일시트를 불러오지 않으므로 CSP `style-src`에는 CDN을 넣을 필요가 없다. 관계있는 것은 `font-src`뿐이다.
- **생성 스크립트** `src/tools/pretendard-font-face.mjs`(Node 내장 기능만 쓴다, `npm run fonts`):
  1. 고정 버전의 업스트림 `pretendardvariable-dynamic-subset.css`를 jsDelivr에서 받는다. 고정 버전은 이 스크립트가 내보내는 버전 상수 한 곳에만 둔다(현재 `1.3.9`). CI 폰트 검사(§10.2 6)도 이 상수를 읽어 기대 접두사 `https://cdn.jsdelivr.net/npm/pretendard@<버전>/`을 만든다. 네트워크는 이 스크립트를 돌릴 때만 쓴다. `npm run build`와 CI 빌드 비교는 커밋된 생성 파일만 읽는다. 업스트림 npm 패키지는 약 93.1MiB(jsDelivr 파일 목록 합계 97,653,151바이트, 2026-09-26)라 devDependency로 넣지 않는다.
  2. 각 `url()`을 그 CSS의 URL 기준으로 풀어 `..`가 없는 절대 URL로 바꾼다. 경로를 짐작해 붙이지 않는다. 예를 들어 gh 경로 CSS(`/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/…`)는 `../../../packages/pretendard/dist/…`를 가리키므로, CSS 위치에 `woff2-dynamic-subset/`을 그대로 붙인 URL은 404다(2026-09-26 curl 확인).
  3. family, style, weight, display, unicode-range, `src` 형식 문자열은 업스트림 값을 그대로 옮기고, 업스트림 CSS 머리의 저작권·OFL 주석도 옮긴다. 이유는 둘이고 서로 다르다.
     - 폰트 파일을 다시 서브셋하지 않는다(라이선스). 업스트림 CSS 머리는 "Reserved Font Name Pretendard"를 밝힌다. 웹폰트로 보내며 글리프 등 일부를 덜어 낸 파일은 OFL의 수정본(Modified Version)이 되고(OFL-FAQ 2.6, "Webfonts and Reserved Font Names"), 수정본은 원칙적으로 예약 글꼴명을 쓸 수 없다(OFL 조건 3). OFL-FAQ 2.7의 Functional Equivalence 예외는 판단이 필요하므로 기대지 않는다. 테마는 업스트림 배포본에 든 동적 서브셋 파일을 고치지 않고 가리키기만 한다.
     - family 이름도 업스트림 그대로 `Pretendard Variable`로 둔다(검사 편의). 생성 파일이 업스트림 CSS를 글자 그대로 따라야 4단계와 CI가 차이를 쉽게 검사할 수 있다. 라이선스 때문에 이름을 지키는 것이 아니다. CSS `@font-face`의 family 이름은 페이지 안에서 face를 가리키는 참조 이름이고 폰트 파일(Font Software)의 이름을 바꾸는 것이 아니라고 본다 (미검증: OFL-FAQ에 이 경우를 직접 다룬 항목이 없다). 그래도 이 해석에 기대지 않도록 자체 호스팅 예시의 별칭에는 예약 글꼴명을 넣지 않는다(아래).
  4. 규칙 수가 업스트림과 같은지(v1.3.9는 92개), 모든 URL이 고정 버전 접두사로 시작하는지, 각 URL이 200과 `font/woff2`를 돌려주는지 확인하고, 하나라도 어긋나면 실패한다.
  5. 결과 `src/_pretendard.scss`를 커밋한다. 엔트리가 `@use`하므로 `stylesheets/application.css`에 컴파일된다.
- **기준 URL**은 현재 고정 버전 기준으로 `https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/`이다. npm은 한 번 쓴 `package@version`을 다시 쓸 수 없다(npm 문서 "npm Unpublish Policy"). 그래서 이 경로의 파일 내용은 바뀌지 않을 것으로 본다. 다만 jsDelivr가 npm 게시본을 그대로 서빙하는지와, 버전이 게시 취소되거나 레지스트리에서 내려갔을 때의 동작은 확인하지 않았다 (미검증). gh 경로(`/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/…`)도 같은 파일을 서빙하고(조각 0·45·91의 SHA-256 일치), 두 경로 CSS의 unicode-range는 같다. 2026-09-26 curl로 두 경로의 woff2가 모두 200, `content-type: font/woff2`, `access-control-allow-origin: *`(교차 출처 폰트 요청에 필요), `cache-control: public, max-age=31536000, immutable`임을 확인했다.
- **CDN URL은 기동 때 재작성되지 않는다.** Redmine `lib/redmine/asset_path.rb`의 `convert_path`는 `url()` 안에서 테마 하위 디렉터리 사이의 상대 경로 키(`../fonts/…`처럼 `..`로 시작)만 바꾸므로 `..`가 없는 절대 URL은 그대로 남는다. Propshaft `compiler/css_asset_urls.rb`의 `ASSET_URL_PATTERN`은 `http:`·`https:`와 `//`로 시작하는 URL을 제외한다(7.0.2 이미지의 Propshaft 1.3.2 소스). Phase 0 1에서 7.0.2와 7.0.1 모두 서빙된 테마 CSS의 `https:` URL 92개가 생성 파일과 위치·글자 단위로 같았다(순서 같음, 따옴표 없음). 두 파일은 재작성된 import 두 줄만 다르다.
- **버전 고정과 갱신 담당**: 버전은 v1.3.9로 고정하고, 그 값은 생성 스크립트의 버전 상수 한 곳에만 둔다(스크립트 1단계). 업스트림 갱신은 저장소 유지관리자가 맡는다. 새 Pretendard 릴리스가 나오면 유지관리자가 다음 순서로 한다. (1) 버전 상수를 올린다. (2) `npm run fonts`로 `src/_pretendard.scss`를 다시 만들고 `npm run build`로 테마 CSS를 다시 컴파일해 함께 커밋한다. (3) CI 기대 접두사는 같은 상수에서 만들어지므로 따로 고치지 않고, CI 폰트 검사가 새 접두사로 통과하는지 본다. 규칙 수가 바뀌었으면 CI는 생성 파일의 규칙 수를 기준으로 삼으므로(§10.2 6) 역시 따로 고칠 곳이 없다. (4) 테스트 기준 버전(현재 7.0.2)에서 Phase 0의 폰트 확인(§9)을 반복하고 릴리스 노트에 적는다. 이 문서의 버전·개수 표기(1.3.9, 92개)는 현재 값의 기록이며 CI가 읽지 않는다. 자동 갱신은 하지 않는다.
- **자체 호스팅(폐쇄망, CSP `font-src 'self'`, 중국 본토)**: §4.5 커스터마이즈 경로로 한다. `custom.css`나 자식 테마에서 다른 family 이름(예: `"RAVNUS Sans Local"`)으로 `@font-face`를 선언하고, 네 폰트 스택(`--ravnus-font-sans`·`-ja`·`-zh`·`-zh-tw`)의 `"Pretendard Variable", Pretendard`를 그 이름으로 바꾼다. 별칭에는 예약 글꼴명 "Pretendard"를 넣지 않는다(스크립트 3단계). 폰트 파일은 업스트림 배포본을 고치지 않고 쓴다.
  ```css
  /* 자식 테마 themes/<이름>/stylesheets/application.css 예. 폰트 파일은 themes/<이름>/fonts/에 둔다 */
  @import url(../ravnus/application.css);
  @font-face {
    font-family: "RAVNUS Sans Local";
    font-weight: 45 920;
    font-display: swap;
    src: url(../fonts/PretendardVariable.woff2) format("woff2-variations");
  }
  /* §7.1의 네 스택에서 "Pretendard Variable", Pretendard만 별칭으로 바꾼다(아래 ja·zh·zh-TW 항목) */
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
  - 브라우저는 실제로 쓰는 face만 받는다. 스택에서 `"Pretendard Variable"`이 빠지면 테마 CSS의 CDN face는 요청하지 않는다(Phase 0 3a: 테마 CSS에 CDN `@font-face` 92개가 남아 있어도 CDN 요청 0건, 페이지마다 자체 폰트 요청 1건). 이 전제는 테마 CSS가 `"Pretendard Variable"`을 `@font-face` 블록과 네 폰트 스택 토큰(`--ravnus-font-sans`·`-ja`·`-zh`·`-zh-tw`) 값에서만 쓸 때 성립한다. 다른 규칙이 이 이름을 `font-family`에 직접 쓰면 스택을 바꿔도 CDN 조각을 요청하므로 CI가 막는다(§10.2 6).
  - 위 예처럼 `--ravnus-font-sans-ja`·`-zh`·`-zh-tw` 끝의 `"Pretendard Variable", Pretendard`도 같은 이름으로 바꾼다(§7.1). 그대로 두면 그 UI에서 OS 폰트에 없는 한글이 나올 때 CDN 조각을 요청한다. Phase 0 3c에서 `--ravnus-font-sans`만 바꾸면 ja·zh·zh-TW UI에서 한글이 있는 페이지마다 조각을 요청했고(20회 중 132건, ko·en 0건), 네 스택을 모두 바꾸면 0건이었다(§7.1 스택을 `custom.css`로 흉내 낸 측정, Phase 1에서 실제 테마로 다시 잰다).
  - family 이름이 달라서 테마 CSS의 CDN `@font-face`와 선언 순서를 맞출 필요가 없다.
  - 자식 테마의 `url(../fonts/PretendardVariable.woff2)`는 하위 디렉터리 이름이 빠진 `/assets/themes/<이름>/PretendardVariable-<digest>.woff2`로 재작성된다(Redmine `lib/redmine/asset_path.rb`의 경로 변환, Phase 0 3a에서 7.0.2 기동으로 확인).
  - `custom.css`를 쓸 때도 같은 `@font-face`와 `:root` 블록을 넣고, 폰트 파일은 `themes/ravnus/fonts/`처럼 추적하지 않는 하위 디렉터리에 둔다. `custom.css` 안 `url(../fonts/…)`는 `/assets/themes/ravnus/PretendardVariable-<digest>.woff2`로 재작성된다(Phase 0 3a). 추적하지 않는 파일은 `git pull`에 남지만 zip으로 다시 설치하면 사라지므로, 조직 단위 설치에는 자식 테마를 권한다.
  - 단일 가변 woff2(1.96MiB) 대신 동적 서브셋 92조각을 자체 호스팅할 수도 있다. 이때는 업스트림 CSS의 `@font-face`에서 family 이름(위와 같은 별칭)과 경로만 바꾸고 폰트 파일은 고치지 않는다. 어느 쪽이든 업스트림 배포본의 OFL 전문을 폰트 파일과 함께 둔다.
- **README 안내**(README.md와 README.ko.md, CDN 폰트를 처음 싣는 릴리스부터):
  - Pretendard 크레딧(저작권자 Kil Hyung-jin, 업스트림 저장소 링크)과 SIL OFL 1.1 고지. 테마는 폰트 파일을 배포하지 않고 jsDelivr에서 불러온다는 사실.
  - 개인정보: 방문자 브라우저가 jsDelivr에 직접 요청하므로 방문자 IP가 jsDelivr로 간다. Redmine origin은 다음과 같이 간다(Phase 0 1c, Chrome 154 로컬 관찰).
    - 7.0.2의 HTML 응답은 `Referrer-Policy: strict-origin-when-cross-origin`을 보내고, 폰트 요청을 시작하는 테마 스타일시트(`/assets/themes/ravnus/application-*.css`) 응답에는 `Referrer-Policy` 헤더가 없다(7.0.1도 같다).
    - 폰트 요청의 Referer는 페이지가 아니라 테마 스타일시트의 정책을 따른다. 기본 상태에서는 경로 없는 Redmine origin이고, 페이지 경로는 어느 경우에도 가지 않았다.
    - 폰트 요청은 CORS 요청이므로 `Origin` 헤더로도 origin이 간다.
    - 페이지 응답의 정책만 바꾸면 효과가 없다. `/assets` 응답에 `Referrer-Policy: no-referrer`를 보내면 Referer는 빠지지만 `Origin`은 남는다. origin을 보내지 않으려면 자체 호스팅이나 "시스템 폰트만 쓰기"를 쓴다.
    - Firefox와 Safari는 확인하지 않았다 (미검증). README에는 확인한 범위(Chrome)를 함께 적는다.
  - CSP: 리버스 프록시 등에서 CSP를 거는 설치는 `font-src https://cdn.jsdelivr.net`을 허용하거나 자체 호스팅한다. 로컬 도커 기본 설정의 7.0.2는 CSP 헤더를 보내지 않는다(2026-10-01 curl 확인).
  - 폐쇄망: CDN에 닿지 않으면 시스템 폰트로 표시된다. Pretendard가 필요하면 자체 호스팅한다. CDN 요청 자체를 없애려면 "시스템 폰트만 쓰기" 블록(네 폰트 스택 `--ravnus-font-sans`·`-ja`·`-zh`·`-zh-tw`에서 `"Pretendard Variable", Pretendard`를 뺀 `:root{}`)을 `custom.css`나 자식 테마에 넣는다. 이 블록을 넣으면 CDN 요청과 폰트 요청이 모두 0건이다(Phase 0 3b. ja는 Hiragino Kaku Gothic ProN, zh는 PingFang SC, zh-TW는 PingFang TC로 그려졌다).
    - 요청을 응답 없이 버리는 방화벽이나 폐쇄망에서는 이 블록이나 자체 호스팅이 **필수**다. 증상은 빈 화면이 아니라 페이지 `load` 지연과 저장하지 않은 변경 경고 누락이고, 편집 중에 다른 페이지로 가면 입력이 경고 없이 사라질 수 있다(위 `load` 항목, §11).
    - DNS가 실패하거나 연결이 바로 거절되는 환경은 시스템 폰트로 바뀔 뿐이다.
    - 지연 시간은 OS와 망 설정에 따라 다르므로 측정값(macOS 225–300초)을 모든 환경의 값으로 적지 않는다.
  - 중국 본토: 자체 호스팅을 권한다. 근거: jsDelivr는 2021-12-20 중국 ICP 라이선스를 잃어 중국 지역 CDN 계정이 중지됐다고 공지했고(공식 X 게시, jsdelivr/jsdelivr 이슈 #18348에 인용), 유지관리자는 같은 이슈에서 이후 중국 트래픽은 본토 밖 CDN이 맡아 느리게 동작한다고 밝혔다. 2024-02-12에도 중국 파트너가 당장은 ICP 라이선스 취득을 도울 수 없다고 답했다(#18552). 지금 중국 본토에서의 실제 속도와 접근성은 확인하지 않았다 (미검증).
  - 캐시: CDN 폰트는 jsDelivr 캐시 헤더를 따른다. 로컬 컨테이너의 `/assets` 응답(테마 CSS, 테마 안에 둔 자체 호스팅 폰트)에는 `Cache-Control`이 없으므로(둘 다 2026-10-01 7.0.2에서 확인) 리버스 프록시에 `Cache-Control: public, max-age=31536000, immutable`을 설정하도록 권한다. 파일명에 digest가 붙으므로 장기 캐시가 안전하다.

### 4.5 사용자 커스터마이즈 방식 (결정: 2026-09-26)

| 선택지 | 방법 | 업데이트 내구성 | 비고 |
|---|---|---|---|
| **A. `:where(:root)` 토큰 + 추적하는 빈 `custom.css` 스텁 + 자식 테마 문서화 (결정)** | `stylesheets/custom.css`에 `:root { --ravnus-accent: …; }`를 적는다 | 업스트림 스텁은 빈 파일이고 내용을 바꾸지 않으므로 병합 충돌이 없다. 기본 설정(merge)의 `git pull`은 그대로 된다. 다만 추적 파일을 고친 상태라 `pull.rebase=true`로 설정한 저장소에서는 `git pull`이 unstaged changes로 거부된다. `git pull --autostash`는 된다(셋 다 로컬 git 2.52.0에서 확인). README는 `git pull --autostash` 또는 로컬 브랜치에 커밋한 뒤 `git pull --rebase`를 안내한다. zip으로 다시 설치하면 덮인다 | 7.0.2 기동에서 확인했다. 빈 스텁은 200, 0바이트로 서빙되고, `custom.css`의 `:root`가 순서상 뒤인 테마의 `:where(:root)`를 이긴다(Phase 0 5a) |
| B. 컴파일 파일 상단 토큰 블록만 수정 | 결정 전 `CLAUDE.md`가 안내하던 방식 | 릴리스마다 덮이거나 충돌한다. Opale #19·#64와 같은 문제다 | 가장 단순하다 |
| C. 자식 테마만 | `themes/<이름>/stylesheets/application.css`에 `@import url(../ravnus/application.css);`와 `:root{}` 블록을 둔다 | 가장 안전하다. 조직 단위 설정을 별도(비공개 포함) 저장소로 관리할 수 있다 | 관리 화면에서 테마를 바꾸고 재시작해야 한다. 디렉터리 이름이 `ravnus`로 고정된다 |
| D. Sass 재빌드 | `src/` 수정 후 빌드 | 머지가 필요하다 | Node가 필요하다. 비추천 |

**결정: A.** 토큰은 `:where(:root)`에 선언하고, 추적하는 빈 스텁 `stylesheets/custom.css`를 테마가 import하며, 자식 테마 레시피를 문서화한다. 사용법 안내는 스텁이 아니라 README와 컴파일 파일 상단 주석에 둔다. B도 계속 쓸 수 있지만 "업데이트하면 덮인다"고 적는다. 조직 단위로 설정을 따로 관리하거나 폰트를 자체 호스팅하면 자식 테마(C 방식)를 권한다. import 경로는 Phase 0에서 7.0.2로 확인했다(부록 "Phase 0 검증 결과" 5·6). 메커니즘은 다음과 같다.

```css
@import url(../../../stylesheets/application.css);  /* 코어. 주석을 뺀 첫 규칙 */
@import url(custom.css);                              /* 사용자 스텁. 업스트림은 빈 파일로 두고 바꾸지 않는다 */
@font-face { font-family: "Pretendard Variable"; /* … */ src: url(https://cdn.jsdelivr.net/npm/pretendard@1.3.9/…); } /* 생성된 CDN @font-face 92개(§4.4) */
:where(:root) { --ravnus-accent: #46009b; /* … 기본 토큰(§4.1 결정 B Signature) … */ }
:root {                                              /* 코어 의미 변수 재매핑(§8.4 5). Phase 1(v0.1.0)부터 */
  --fonts-main: var(--ravnus-font-ui);
  --color-current-marker: var(--ravnus-accent);
}
:root {                                              /* 크롬 배경 변수 재매핑. Phase 2(v0.2.0) _chrome.scss부터, 흰 헤더 재칠과 함께 */
  --color-header-background: var(--ravnus-header-bg);       /* 7.0.2부터 코어가 씀 */
  --color-top-menu-background: var(--ravnus-topbar-bg);     /* 7.0.2부터 코어가 씀 */
}
```

```css
/* stylesheets/custom.css 사용 예. 업스트림 스텁은 빈 파일이다 */
:root {
  --ravnus-accent: #0b6e4f;           /* 토큰 노브. 기본 상단 바(topbar-bg)도 이 색이 된다 */
  --ravnus-topbar-fg-muted: #d3e6df;  /* 함께 바꾼다. 기본 #CAC5EA는 #0b6e4f 위 3.78로 AA 미달, 이 값은 4.81 */
  --ravnus-topbar-focus: #ffffff;     /* 함께 바꾼다. 기본 앰버 #FEA800은 #0b6e4f 위 3.22, 흰 링은 6.25 */
}
/* 폰트 자체 호스팅은 §4.4의 @font-face와 네 폰트 스택 :root 예시를 여기에 넣는다 */
/* 행 단위 매핑(§6.5): 색, 채움, 체크를 모두 적는다 */
tr.status-2 { --ravnus-status-color: var(--ravnus-status-progress-color); --ravnus-status-fill: 0.5; --ravnus-status-check: 0; }
```

- 기본 토큰은 명시도 0인 `:where(:root)`에 둔다. 그래서 사용자의 `:root{}`(0,1,0)가 어디에 있든 이긴다.
- 코어 의미 변수 재매핑은 예외로 일반 `:root`에 둔다. `--fonts-main`, `--color-current-marker`, 7.0.2부터 코어가 크롬 배경에 쓰는 `--color-header-background`·`--color-top-menu-background`다. 모두 코어 `application.css`의 `:root`(7.0.2 41–47행)를 이겨야 한다. 값은 `--ravnus-*` 토큰을 가리키기만 하므로 사용자가 `custom.css`에서 크롬 토큰을 바꾸면 코어가 이 변수로 칠하는 곳도 따라온다. 7.0.0–7.0.1에는 두 헤더 변수가 없어 이 선언은 효과가 없고 해도 없다(§8.4 "7.0.0–7.0.1 대응").
- 싣는 시점이 다르다. `--fonts-main`과 `--color-current-marker`는 Phase 1(v0.1.0)에 싣는다. 두 크롬 배경 변수의 재매핑은 흰 헤더 재칠 목록(§8.4 12, §8.6)과 함께 Phase 2(v0.2.0)의 `_chrome.scss`에만 싣고, v0.1.0에는 넣지 않는다. 재매핑만 먼저 실으면 7.0.2에서 헤더 배경이 header-bg(기본 canvas, 흰색)가 되는데, 코어 `#header`의 `color: var(--oc-white)`(153행)와 `#header a`의 gray-0(161행)이 그대로 남아 헤더 글자가 보이지 않는다. flyout도 같다. 재매핑은 800px flyout 표면(topbar-bg)과 h3 띠(header-bg)도 칠하므로(Phase 0 10a), 기본 Signature에서는 흰 h3 띠 위에 코어 `color: white`(`responsive.css` 307행)가 남고, Calm 프리셋에서는 밝아진 flyout 표면 위에 코어의 흰 글자·링크·아이콘이 남는다. 그래서 v0.2.0 `_chrome.scss`에는 §8.6의 flyout 재칠(글자·링크·h4·아이콘·사용자 링크는 topbar 토큰, h3 글자는 header-fg, h3 위아래 선은 header-divider)과 "밝은 flyout" 규칙(검색 입력 테두리, currentColor 구분선, 입력 안 돋보기 fg-icon)도 함께 싣는다.
- 행 단위 매핑(`tr.status-N`, `tr.tracker-N`)은 `:root` 토큰이 아니라 행에 거는 커스텀 속성이다. 테마의 행 단위 기본값도 명시도 0으로 선언하므로(§5.6) 순서상 앞에 오는 `custom.css`의 매핑이 이긴다.
- `custom.css`는 테마 규칙보다 먼저 로드된다. 토큰이 아닌 일반 규칙을 덮으려면 셀렉터를 한 단계 높여야 한다. README에 적는다.
- 파생 토큰은 선언된 곳(`:root`)에서 계산된다. 그래서 노브는 반드시 `:root`에서 바꿔야 한다.
- 기본 Signature의 상단 바는 `var(--ravnus-accent)`를 따르지만 상단 바 보조 글자 `--ravnus-topbar-fg-muted`(#CAC5EA)와 앰버 링 `--ravnus-topbar-focus`(#FEA800)는 `#46009B` 기준 고정값이다. 그래서 강조색을 바꾸면 이 둘도 함께 바꾼다(위 예시, §5.4 명암 한계). README의 커스터마이즈 안내에도 적는다.
- Propshaft digest에는 참조 파일 내용이 들어가므로 `custom.css`만 고쳐도 캐시가 갱신된다(7.0.2 이미지의 Propshaft 1.3.2 `asset.rb` 소스 확인). 다만 반영하려면 앱을 재시작해야 한다. 재시작 뒤에는 `custom`과 테마 `application`의 digest가 모두 바뀌고, HTML 응답이 `max-age=0`이라 새로고침만으로 반영된다(Phase 0 5b).
  - 기동 때 재컴파일은 `public/assets/.manifest.json`보다 수정 시각이 새로운 에셋 파일이 있을 때만 일어난다(`config/initializers/10-patches.rb` 146–148행 `manifest_outdated?`). 그래서 고친 파일의 수정 시각이 manifest보다 오래되면(`cp -p`, `rsync -a`, 시각을 보존하는 압축 해제) 재시작해도 오류 없이 이전 CSS를 서빙한다. 이때는 바꾼 파일을 `touch`하고 재시작한다(Phase 0 5b 확인). `git pull`이나 편집기로 저장한 파일은 수정 시각이 새로우므로 해당하지 않는다.
  - `.manifest.json`을 지워도 다시 컴파일될 것으로 본다 (미검증). 이전 digest 파일은 `public/assets`에 남는다(§11).
- 자식 테마 경로(Phase 0 5c·5d, 7.0.2 기동): `url(../ravnus/application.css)`와 절대 경로 `url(/themes/ravnus/application.css)` 모두 기동 때 부모 테마의 digest 자산으로 재작성된다. 원래 경로로 GET하면 404이므로 재작성 덕분에 동작한다. 코어, 부모 `custom.css`, CDN `@font-face`, 부모의 `--fonts-main` 재매핑이 모두 적용되고 자식 `:root`가 이긴다. 5.x식 `url(../../ravnus/stylesheets/application.css)`와 `url()` 없는 문자열형 `@import "../ravnus/application.css"`는 재작성되지 않아 404가 나고 페이지 스타일이 모두 빠진다(body가 Times). README는 `url(../ravnus/application.css)`를 권하고 두 실패 형식을 경고한다.
- 자식 테마와 부모 `custom.css`를 함께 쓰면 같은 토큰은 자식 테마의 `:root`가 이긴다(같은 명시도, 나중 순서, Phase 0 5e). 부모 `custom.css`를 바꾸면 재시작 뒤 부모와 자식의 digest가 모두 바뀐다. README 커스터마이즈 절에 이 우선순위를 적는다.
- Dart Sass는 plain CSS import 두 개(코어, `custom.css`)를 원래 순서대로 `@use`로 들어온 `@font-face`보다 위로 올린다. 로컬 빌드로 확인했다(2026-09-26, Dart Sass 1.105.0, `--fatal-deprecation=import`. 생성 `@font-face` 규칙 하나를 담은 모듈을 `@use`하고 그 뒤에 `@import url(../../../stylesheets/application.css);`, `@import url(custom.css);`를 둔 엔트리를 컴파일하면 두 import가 이 순서로 주석을 뺀 첫 두 규칙에, `@font-face`가 그 아래에 나온다. 도커는 쓰지 않았다). 실제 엔트리에서도 유지되는지는 CI 빌드 비교에 회귀 검사로 둔다(§10.2 6).

### 4.6 CJK 타이포 정책: 언어별 폰트 스택과 keep-all 범위 (결정: 2026-09-26)

확정 사항("기본 폰트 Pretendard, keep-all, 한글 기준 행간")을 UI 언어별로 어디까지 적용할지 정한다. 두 질문은 같은 기준(`<html lang>`의 UI 언어)과 같은 한계(UI 언어와 콘텐츠 언어가 다를 때)를 공유하므로 한 결정으로 묶는다.

**(가) ja·zh·zh-TW UI의 폰트 스택**

| 선택지 | 장점 | 약점 |
|---|---|---|
| **F1. OS 네이티브 우선, Pretendard는 한글만 (결정)** | 가나·한자·문장부호를 한 디자인으로 쓴다. 추가 용량이 없다. zh-TW에서 `，。`가 가운데에 놓인다 | OS마다 모습이 다르다. 이 세 언어에서는 라틴 글자도 OS 폰트가 되어 "기본 폰트 Pretendard"의 예외가 된다 |
| F2. ja는 Pretendard JP 번들, zh·zh-TW는 F1 | ja에서 가나·한자·라틴이 한 디자인이다. 지연 로드라 ko 사용자에게는 런타임 비용이 없다 | 저장소 +4.49MB. 번들은 §4.4 결정으로 제외하며, v2에서 CDN 방식으로 검토한다 |
| F3. 모든 언어에 Pretendard 우선 (현재 스켈레톤) | 확정 문구와 글자 그대로 같다. 단순하다 | 표준 Pretendard에는 한자가 0자다. ja에서 가나는 Pretendard, 한자는 OS 폰트로 섞인다. zh-TW에서는 `，。`가 왼쪽 아래에 놓여 번체 규범(clreq 2.1.2)을 어긴다 |

**(나) keep-all 적용 범위**

| 선택지 | 장점 | 약점 |
|---|---|---|
| K1. ko UI만 (원안) | ja·zh 콘텐츠가 어색하게 끊기는 범위가 ko UI로 한정된다 | en 등 다른 UI를 쓰는 한국어 사용자는 한국어 본문이 음절 단위로 끊긴다 |
| **K2. ja·zh를 뺀 모든 UI 언어 (결정)**, `:where(:root:not(:lang(ja)):not(:lang(zh)))` | 한국어 본문이 UI 언어와 상관없이 어절 단위로 끊긴다. 라틴 글자에는 keep-all이 normal과 같게 동작해 영향이 없다(CSS Text 3). `:lang(zh)`는 zh-TW에도 맞으므로 셀렉터 하나로 zh-TW까지 뺀다 | ko·en 등 UI에서 일본어·중국어 콘텐츠는 overflow-wrap 안전망으로만 줄이 바뀌어 어색한 위치에서 끊길 수 있다. 이 영향 범위가 K1보다 넓다 |
| K3. 모든 UI 언어 (확정 문구 그대로) | 규칙이 가장 단순하다 | ja·zh UI에서 가나·한자 연속열이 공백이나 문장부호가 나올 때까지 끊기지 않아, 긴 문장이 overflow-wrap 안전망에만 기대 임의 위치에서 끊긴다(표가 넓어지는 문제는 keep-all 공통이며 §7.6의 안전망이 모든 언어에서 처리한다). 비추천 |

**결정: F1 + K2.** ja·zh·zh-TW UI는 OS 네이티브 CJK 폰트를 먼저 쓰고, 이 UI에서 Pretendard는 한글만 맡는다. keep-all은 ja·zh를 뺀 모든 UI 언어(`:root:not(:lang(ja)):not(:lang(zh))`)에 적용한다. `:lang(zh)`는 zh-TW에도 맞으므로 zh-TW도 빠진다. 구현은 명시도 0인 `:where()`로 감싼다(§7.6). Pretendard JP는 v2 opt-in으로 두고, 제공 방식은 §4.4를 따른다(생성한 CDN `@font-face` 또는 자체 호스팅 레시피, 저장소에 폰트 파일 없음). keep-all 범위는 토큰 `--ravnus-word-break`로 설치마다 되돌릴 수 있다. `CLAUDE.md`의 폰트·keep-all 규칙은 이 결정에 맞춰 언어별 규칙으로 고쳤다. §7.1과 §7.6은 이 결정대로 썼다.

### 4.7 아이콘 (추천)

| 선택지 | 판단 |
|---|---|
| **코어 Tabler SVG 스프라이트(MIT, 7.0.2는 118개 심볼)를 토큰으로 다시 칠하기만 한다 (추천)** | 심볼에 stroke·fill 속성이 없어 CSS가 `<use>` 안까지 적용된다. 추가 파일이 없다. 스프라이트가 아닌 `url()` 이미지 아이콘은 칠할 수 없다(§8.7) |
| 테마 `images/icons.svg`로 일부 교체 | 코어는 테마 스프라이트를 읽는다(`lib/redmine/themes.rb`, `app/helpers/icons_helper.rb`. 7.0.2는 두 파일 모두 메모이즈만 바뀌었다, §8.4). JS 토글 쌍을 전부 넣어야 한다. `createSVGIcon`은 `#icon-copy-source`의 코어 스프라이트를 복제해 쓴다(`application-legacy.js` 73행). v2에서 검토한다 |
| 아이콘 웹폰트 | Opale 462KB, Bleuclair Font Awesome 5, TW-Style CDN 사례처럼 비용이 크다. 비추천 |

### 4.8 일감 목록 밀도 (추천)

| 선택지 | 내용 | 판단 |
|---|---|---|
| **약 32px 행 (추천)** | 제목 14px, 메타 13px, 세로 패딩 6px, 셀 행간 1.45 | 두 줄 한글 제목이 읽힌다. Carbon sm, Primer control-md와 같다 |
| Compact 약 27px | 패딩 4px, 제목 13px | 프리셋 한 블록으로 제공한다 |
| 코어 동등 25px | 코어 측정값(7.0.2, Pretendard 로드 상태, 머리 행 27.5px) | 한글 두 줄 제목이 빽빽하다 |

Phase 0 8(7.0.2, 일감 목록, ko, 1440px, 폰트 19/19 로드와 `td.subject`의 Pretendard 사용을 확인한 뒤 모든 행 측정)에서 Pretendard를 로드해도 코어 본문 행은 25px(첫 행만 위 테두리 때문에 25.5px), 머리 행은 27.5px였다. 셀은 13px, 위아래 패딩 3px, 위 테두리 1px다. 행 높이를 정하는 것은 글자 줄(15px)이 아니라 `td.buttons`의 18px 아이콘 링크다(18 + 3 + 3 + 1). 시스템 폰트(CDN 차단)는 25/28px, 코어 Noto Sans는 25.86/28.95px였다.
- 32px 목표는 행마다 7px를 더하므로 화면당 행 수가 약 22% 줄어든다(계산).
- Phase 3에서 행 높이를 정할 때 `td.buttons` 아이콘(18px)과 셀 패딩을 함께 계산한다. 32px와 Compact 27px 모두 이 아이콘이 만드는 바닥보다 크다.
- Calm 프로토타입 33px의 측정 조건은 기록이 없다 (미검증).

### 4.9 상태·우선순위·트래커 표현 (추천)

| 선택지 | 판단 |
|---|---|
| 행 전체 틴트(alternate 테마 방식) | hover·선택·줄무늬·닫힘 상태와 충돌한다. 다크 모드 토큰이 수준별로 약 4배 필요하다 |
| **셀 글리프 + 글자색 (추천)** | Jira·Linear·GitHub 방식이다. 모든 글리프를 CSS로 그리므로 `url()`이나 data:가 필요 없다. forced-colors와 인쇄에서 남도록 테두리 기반 모양을 우선한다(§8.8, §8.9) |
| td 알약 | 셀이 순수 텍스트 노드이고 `table.list`가 `border-collapse: collapse`라서 셀 전체가 칠해진다. 내부 셀의 border-radius는 명세상 보장되지 않는다 |

### 4.10 주 버튼 지정 방식 (추천)

`input[type=submit][name=commit]`에 전부 걸면 삭제 확인 버튼까지 주 버튼이 된다. users/destroy, wikis/destroy, groups/remove_users, users/bulk_destroy, projects/bulk_destroy, projects/destroy, my/destroy가 해당한다.

**추천: allowlist.** 명시한 폼만 주 버튼으로 칠하고 나머지는 보조 버튼이다. 대상은 일감 생성·수정, 로그인 `#login-submit`, 위키·뉴스 저장, 새 프로젝트 등이다. `.btn-alert`는 위험 스타일(`--ravnus-danger-solid` 채움, `--ravnus-on-solid` 글자, §6.1)로 칠한다. `.btn-alert`는 7.0.2에서 `users/bulk_destroy.html.erb:17`과 `projects/bulk_destroy.html.erb:23`에서 `btn-alert btn-small`로 쓰이고, 코어 CSS(`app/assets/stylesheets/`)에는 `.btn-alert` 스타일이 없다(7.0.2 소스 확인). 그래서 테마가 스타일을 정의해야 한다. 목록은 Phase 4–6에서 7.0.2 페이지를 감사해 확정한다.

### 4.11 CJK 강조(em) 표현 (추천, 시각 확인 필요)

Pretendard와 대부분의 CJK 폰트에는 이탤릭이 없어 브라우저가 가짜 기울임을 합성한다.

| 선택지 | 판단 |
|---|---|
| 코어 유지(합성 기울임) | 한글·한자가 찌그러져 보인다 |
| **ko·ja·zh UI의 본문 em: 똑바로 세우고 굵기 600 + 옅은 밑 배경 `--ravnus-em-bg`(accent 10% = `#E9E8F7`, 본문 글자 13.39:1). strong은 700 (추천)** | em과 strong을 배경으로 구분한다 (미검증: 시안 비교 전) |
| 언어별 권점(드러냄표, 傍点, 着重号) | 라틴 글자에도 점이 찍히고 Safari에는 `-webkit-` 접두사가 필요하다. opt-in 토큰으로만 둔다 |

### 4.12 지원 범위와 테스트 기준 버전 (결정: 2026-10-01)

- **지원 범위 (결정, 2026-10-01)**: Redmine 7.x 전용이다. 6.x 이하는 지원하지 않는다. 소유자가 Redmine 7을 쓰므로 6.x 지원을 중단한다(결정 기록 #7). `CLAUDE.md` "지원 범위"와 README 요구 사항에 반영했다.
- **결정에 따른 설계 메모**: 이 결정으로 6/7 동등성 작업(6.x 기준선까지 함께 맞추던 리셋과 그 6/7 비교, 6.0.x 확인, 두 버전 스크린샷·assert)이 없어진다. 7.x 패치 차이를 흡수하는 단일 7.x 기준선의 명시적 리셋(헤더·메뉴 바 치수, §8.4 1–3)은 그대로 둔다.
- **테스트 기준 (프로젝트 규칙, 2026-10-01. 지원 범위 결정에 따른 규칙이며 소유자 결정이 아니다)**: `redmine:7.0.2`(2026-10-01 릴리스) 도커 이미지 하나다. `CLAUDE.md` "지원 범위"에 프로젝트 규칙으로 적혀 있다(결정 기록 #7). `docker-compose.yml`은 이 태그로 고정한 서비스 하나(`redmine`, 127.0.0.1:3007)를 띄운다. 부동 태그(`redmine:7`)는 `docker compose pull` 한 번에 기준이 조용히 바뀌므로 쓰지 않는다. 결과표에는 컨테이너의 `Redmine::VERSION`(예: `7.0.2.stable`)을 함께 적는다.
- **7.0.0–7.0.1**: 지원 범위 안이지만 코어 크롬 배경 변수(`--color-header-background`, `--color-top-menu-background`)가 없다(7.0.1 `application.css` 41–44행의 `:root`에는 `--fonts-main`과 `--color-current-marker`만 있다). 테마는 배경 셀렉터 폴백으로 대응하고(§8.4 "7.0.0–7.0.1 대응"), 7.0.1 spot check(§10.4)로 확인한다. 7.0.0은 확인하지 않았다 (미검증: 변수가 7.0.2에서 추가됐으므로 7.0.0에도 없을 것으로 본다).
- **기준 버전을 올릴 때**(새 7.x 패치·마이너): compose 태그, 이 문서의 코어 인용(파일·행 번호, §8.4 패치 차이), `CLAUDE.md`, README를 같은 커밋에서 함께 고친다(§12). 절차는 §11 "향후 7.x 패치가 코어 크롬을 바꿈" 행을 따른다. 이때 코어 변수 목록(§8.4 5), 흰 헤더 재칠 목록(§8.4 12, §8.6)의 대상 규칙·행 번호, 헤더 계산 스타일 assert(§10.2 3)를 새 코어에서 다시 읽어 고친다. 이전 패치는 지원 범위에 남으므로 새 패치에만 있는 기능(예: 7.0.2의 크롬 배경 변수)에만 기대지 않고 폴백을 둔다.

---

## 5. 토큰 아키텍처

### 5.1 세 계층

| 계층 | 위치 | 출력 | 예 | 규칙 |
|---|---|---|---|---|
| 1. Primitive | `src/_tokens.scss` 안의 Sass map | CSS로 출력하지 않는다 | `$neutral`(hue 290), `$violet`, `$blue`, `$green`, `$amber`, `$red`. OKLCH로 작성해 `color.to-gamut($method: clip)` 뒤 hex로 쓴다 | 색 리터럴은 이 파일에만 둔다(`CLAUDE.md` 규칙 유지) |
| 2. Semantic | `:where(:root)` | 리터럴 또는 `color-mix()` | `--ravnus-bg-canvas`, `--ravnus-fg-muted`, `--ravnus-accent-subtle`, `--ravnus-danger-fg` | 다크 세트가 재정의하는 면이다 |
| 3. Component/domain | `:where(:root)`, 행 단위 값은 `:where(행 셀렉터)`(§5.6) | 2계층을 가리키는 `var()`만 | `--ravnus-priority-highest-fg`, `--ravnus-nav-bg`, `--ravnus-status-open-color`, `--ravnus-row-pad-y` | 컴포넌트 partial은 2·3계층만 참조한다 |

- 우선순위 위치 클래스(`priority-lowest`…`priority-highest`)와 태그 색 이름(red, orange, green, blue, violet, gray)은 Sass map + `@each`로 생성한다(`CLAUDE.md` 작성 규칙 유지). 설치마다 id가 다른 상태·트래커만 `custom.css`의 행 커스텀 속성 매핑으로 둔다(§6.5). 이 구분은 `CLAUDE.md` 작성 규칙과 "Redmine 7 테마 동작" 절에 반영했다.
- 파일이 커지면 `src/tokens/`로 나누고 `CLAUDE.md`의 "`_tokens.scss` 밖 hex 금지" 문구를 함께 고친다.

### 5.2 이름 규칙

`--ravnus-{category}-{role}-{variant}-{state}` 형식이고 kebab-case다. 해당하지 않는 부분은 생략한다(예: 역할 색 `--ravnus-danger-fg`는 category 없이 role과 variant만 쓴다). 이 문서에 나오는 모든 토큰은 아래 category 중 하나로 시작한다.
- category
  - 색: `bg`, `fg`, `border`, `accent`, `on`(`on-accent`, `on-solid`), `link`, `focus`, `shadow`, `em`(`em-bg`)
  - 타이포: `font`(`font-sans`, `font-mono`, `font-ui`, `font-feature-settings`), `font-size`, `line-height`, `letter-spacing`, `word-break`
  - 치수: `space`, `radius`, `control-height`
  - 영역: `header`(`header-divider`, `header-control-border`), `topbar`(`topbar-height`), `nav`(`nav-bg`, `nav-border`, `nav-height`), `sidebar`, `sticky-header`, `list`(`list-link`), `row`(`row-pad-y`, `row-stripe`, `row-marker-*`), `subject`(`subject-min-inline-size`), `prose`(`prose-max-inline-size`)
  - 도메인: `priority`, `status`, `tracker`, `tag`, `progress`
- role: `info`, `success`, `warning`, `danger`. 도메인 category에서는 값 이름(`high3`, `highest`, `open`, `progress`, `done`, `closed`, `red` 등)이 role 자리에 온다. 중립 표현은 별도 role 없이 `bg-*`·`fg-*`를 쓴다.
- variant: `subtle`(틴트 배경), `muted`(더 진한 틴트), `border`, `fg`(글자), `bg`, `solid`(채움), `color`. 표면·글자 단계 이름(`canvas`, `inset`, `raised`, `overlay`, `default`, `inverse`, `control`, `icon`, `decoration`)은 §6.1 표를 따른다.
- state: `hover`, `active`, `selected`, `disabled`
- 내부 보조 변수는 `--_ravnus-*`로 쓰고 사용자 노브가 아님을 주석으로 적는다.

### 5.3 사용자 노브 (컴파일 파일 상단 주석 순서)

| 그룹 | 토큰 (기본값) |
|---|---|
| 1. 브랜드 | `--ravnus-accent` (#46009B), `--ravnus-on-accent` (#FFFFFF), `--ravnus-link` (#215DB3), `--ravnus-topbar-bg` (var(--ravnus-accent) = #46009B), `--ravnus-topbar-fg-muted` (#CAC5EA), `--ravnus-topbar-focus` (#FEA800), `--ravnus-topbar-height` (2rem), `--ravnus-header-bg` (var(--ravnus-bg-canvas) = #FFFFFF), `--ravnus-bg-canvas` (#FFFFFF), `--ravnus-radius` (6px). 값은 §4.1 결정(B Signature)의 기본값이다. 나머지 크롬 토큰은 §6.2, 어두운 헤더는 §6.3 Ink 프리셋 블록이다 |
| 2. 타이포 | `--ravnus-font-sans`(기본 스택은 테마 CSS에 생성된 CDN `"Pretendard Variable"`로 시작한다. 폰트를 자체 호스팅하거나 시스템 폰트만 쓰면 네 폰트 스택 토큰을 모두 바꾼다, §4.4), `--ravnus-font-sans-ja`, `--ravnus-font-sans-zh`, `--ravnus-font-sans-zh-tw`, `--ravnus-font-mono`, `--ravnus-font-feature-settings` (normal), `--ravnus-word-break` (keep-all, ja·zh UI는 미설정이라 normal. §4.6) |
| 3. 레이아웃 | `--ravnus-sidebar-at-start` (0), `--ravnus-row-pad-y` (0.375rem), `--ravnus-font-size-cell` (0.8125rem), `--ravnus-font-size-cell-subject` (0.875rem), `--ravnus-row-stripe` (var(--ravnus-bg-subtle)), `--ravnus-list-link` (var(--ravnus-link)), `--ravnus-prose-max-inline-size` (none), `--ravnus-subject-min-inline-size` (12em) |
| 4. 도메인 훅 | 주석 예시만 둔다. `custom.css`에 `tr.status-N { … }`, `tr.tracker-N { … }` 형태로 적는다(§6.5). 테마 기본값이 명시도 0이라 이 예시가 이긴다(§5.6) |
| 5. 고급 | 시맨틱 전체 세트. 다크 모드가 재정의하는 면이다 |

리브랜딩은 보통 강조색과 그에 딸린 상단 바 토큰 두 개(아래), 곧 3개 안팎만 고치면 된다. 나머지는 모두 런타임에 파생된다. 기본 상단 바는 `var(--ravnus-accent)`이고 상단 바 글자는 `var(--ravnus-on-accent)`이므로 강조색을 바꾸면 상단 바도 함께 바뀐다. 그러나 `--ravnus-topbar-fg-muted`(#CAC5EA)와 `--ravnus-topbar-focus`(#FEA800, 앰버 링)는 파생하지 않는 `#46009B` 기준 고정값이다. 그래서 강조색을 바꾸면 이 둘도 함께 바꾼다(§4.5 예시). 예를 들어 강조색 `#0b6e4f`에서 기본 보조 글자는 3.78:1로 AA(4.5:1)에 못 미치고 앰버 링은 3.22:1이다(§5.4 명암 한계).

`--ravnus-list-link`는 `table.list` 셀 안 링크(일감 제목, 담당자, 프로젝트, 상위 일감 등)의 글자색이다. 기본값은 `--ravnus-link`이고, `--ravnus-fg-default`로 바꾸면 Calm처럼 검정 제목이 된다. hover 색은 `--ravnus-link-hover`, 밑줄은 hover에서만 긋는다(§7.9). 선택 행(§6.5)의 셀 링크도 이 노브를 따른다.

### 5.4 파생 규칙과 color-mix 결정

`--_ravnus-mix-light`(#FFFFFF)와 `--_ravnus-mix-dark`(#000000)는 밝게·어둡게 하는 파생에만 쓰는 내부 토큰이다. 다크 세트는 이 둘도 재정의할 수 있다.

| 파생 토큰 | 식 | 기본 결과 |
|---|---|---|
| `--ravnus-accent-hover` | `color-mix(in oklch, var(--ravnus-accent) 86%, var(--_ravnus-mix-light))` (어두운 강조색은 **밝게**) | #5A38AB, 흰 글자 8.11:1, 기본색과 1.49:1 차이 |
| `--ravnus-accent-active` | `… 85%, var(--_ravnus-mix-dark))` | #37007C, 흰 글자 14.45:1 |
| `--ravnus-accent-subtle` | `color-mix(in oklch, var(--ravnus-accent) 6%, var(--ravnus-bg-canvas))` | #F2F1FA |
| `--ravnus-accent-muted` | 같은 식, 12% | #E5E3F5 (선택 행) |
| `--ravnus-nav-bg` / `--ravnus-nav-hover-bg` | 4% / 9% | #F6F6FC / #ECEAF8 |
| `--ravnus-em-bg` | 같은 식, 10% | #E9E8F7 (본문 글자 13.39:1, §4.11) |
| `--ravnus-link-hover` | `color-mix(in oklch, var(--ravnus-link) 80%, var(--_ravnus-mix-dark))` | #164384 |
| `--ravnus-topbar-bg` | 기본(Signature)은 파생하지 않고 `var(--ravnus-accent)`다. 헤더가 어두운 프리셋(Ink, Brand-forward, Redmine Blue, §6.3)의 값은 `color-mix(in oklch, var(--ravnus-header-bg) 72%, var(--_ravnus-mix-dark))`로 빌드 때 계산하고, README 블록에는 식이 아니라 결과 리터럴을 싣는다(아래 폴백) | 기본 #46009B. 프리셋 Ink #1C0F3A, Brand-forward #2A0062, Redmine Blue #183A57 |
| `--ravnus-link-decoration` | `color-mix(in oklch, var(--ravnus-link) 75%, transparent)` | 문장 속 링크 밑줄. 합성색 canvas 위 약 #5886C6(3.72:1), bg-subtle 3.63, accent-subtle 3.48, bg-inset 3.52. 원안 50%는 canvas 위 2.27:1이라 올렸다 |
| `--ravnus-focus-ring` | `var(--ravnus-accent)` | #46009B |
| 그림자 | `color-mix(in srgb, var(--ravnus-shadow-color) N%, transparent)` | §8.5 |

**브라우저 기능 결정**
- **쓴다**: 인자 두 개짜리 `color-mix(in oklch, …)`. Baseline widely available(2025-11-09)이고 Chrome 111, Firefox 113, Safari 16.2부터 지원한다.
- **쓰지 않는다**: 상대 색 문법(Baseline low 2024-09-16), `light-dark()`(low 2024-05-13), `contrast-color()`(low 2026-04-10), 인자 셋 이상의 color-mix. OKLCH 리터럴은 Sass에서만 쓰고 출력은 hex다.
- **폴백**: Redmine은 최신 브라우저만 공식 지원하지만 조직의 관리형 브라우저는 늦을 수 있다. `var()`에 든 미지원 함수는 computed-value 시점에 무효가 되므로, 같은 속성을 두 번 선언하는 폴백은 동작하지 않는다. 대신 `@supports not (color: color-mix(in oklch, red, blue)) { :where(:root) { … } }` 블록에 리터럴 hex를 넣는다. 이 값은 빌드 때 Dart Sass `color.mix($method: oklch)`와 `color.to-gamut($method: clip)`로 생성해 런타임 값과 어긋나지 않게 한다. 폴백은 사용자가 바꾼 노브를 따라가지 않으므로(README에 적는다) 일치가 필요한 것은 기본값과 §6.3 프리셋의 파생값뿐이다.
  - **프리셋 블록은 리터럴로 싣는다.** 사용자 `:root`(0,1,0)에 적은 color-mix는 테마의 `@supports not (…) { :where(:root) { … } }` 폴백(0,0,0)이 덮지 못한다. color-mix를 지원하지 않는 브라우저에서는 그 값을 쓰는 속성이 computed-value 시점에 무효가 된다. 예를 들어 `--ravnus-topbar-bg`에 식을 적으면 `background: var(--ravnus-topbar-bg)`가 투명해져, 흰 페이지 위에 흰 상단 메뉴 글자가 남는다. 파생이 테마의 `:where(:root)`에만 있던 A 기본값에서는 폴백이 이 경우를 막았다. 그래서 README 프리셋 블록에는 파생값을 빌드가 계산한 리터럴 hex로 싣는다(헤더가 어두운 프리셋의 상단 바 Ink #1C0F3A, Brand-forward #2A0062, Redmine Blue #183A57). 강조색을 바꾸는 Redmine Blue는 accent 파생 7개(accent-hover·active·subtle·muted, nav-bg, nav-hover-bg, em-bg)도 리터럴로 싣는다. 싣지 않으면 식은 테마 `:where(:root)`에서 그대로 계산되지만, 미지원 브라우저에서는 테마 폴백의 기본(바이올렛) 값이 적용된다. 블록 주석에는 "header-bg(또는 accent)를 바꾸면 §5.4 식으로 다시 계산한다"고 적는다. CI는 README 블록의 리터럴이 Sass 파생 계산값과 같은지 검사한다(§10.2 6).
  - **색역**: 기본값의 파생값 8개(accent-hover·active·subtle·muted, nav-bg, nav-hover-bg, em-bg, link-hover), Ink 프리셋 상단 바 1개(#1C0F3A, 2026-09-26 기본값 A의 파생 상단 바와 같은 값), D 프리셋 8개, Brand-forward 상단 바 1개, 모두 18개가 sRGB 안에 있다(OKLab 계산, accent-active는 G 채널 0인 경계). sRGB 안의 값은 색역 매핑 방법(`clip`이든 CSS Color 4의 OKLCH 채도 축소든)과 표시 장치(sRGB든 P3든)와 상관없이 같은 색으로 보이므로 폴백 hex와 런타임 값이 같다.
  - 파생값이 sRGB 밖으로 나가면 둘이 달라질 수 있다. 브라우저가 어떤 방법으로 매핑하는지는 확인하지 않았고 (미검증), P3 같은 넓은 색역 디스플레이에서는 sRGB 밖 결과가 그대로 표시돼 sRGB로 자른 폴백과 달라질 수 있다 (미검증). 그래서 빌드 스크립트는 기본값·프리셋의 파생값이 sRGB 밖이면 실패시킨다.
  - Phase 1에서 Sass 결과를 OKLab 계산값, 그리고 sRGB 색 프로필로 고정한 Chrome(`--force-color-profile=srgb`)의 계산값과 비교한다 (미검증).
- **명암 한계**: 임의의 강조색에서 파생한 값은 명암을 보장하지 않는다. 예를 들어 흰 글자는 `#3B82F6` 위에서 3.68:1, `#F97316` 위에서 2.80:1이다. 그래서 `--ravnus-on-accent`를 별도 노브로 두고, CI는 기본값과 프리셋만 보장한다. 사용자 값은 검사하지 않는다.
  - **상단 바**: 기본 Signature에서는 상단 바가 `var(--ravnus-accent)`를 따르지만 상단 바 보조 글자 `--ravnus-topbar-fg-muted`(#CAC5EA)와 앰버 링 `--ravnus-topbar-focus`(#FEA800)는 고정값이라, 강조색만 바꾸면 이 둘의 명암이 떨어진다. 예를 들어 `#0b6e4f` 상단 바에서 보조 글자(상단 바의 링크가 아닌 글자 등, §6.2)는 3.78:1로 AA(4.5:1)에 못 미치고, 앰버 링은 3.22:1이다(흰 on-accent 글자는 6.25:1). 그래서 "강조색을 바꾸면 상단 바 보조 글자와 앰버 링도 바꾼다"를 §4.5 예시와 README 커스터마이즈 안내에 적는다. 상단 바를 강조색에 묶지 않는 프리셋(Ink, Brand-forward, Redmine Blue는 리터럴, Calm은 bg-subtle, §6.3)에는 해당하지 않는다.

### 5.5 다크 모드 준비

- **처음부터 있어야 하는 토큰**:
  - 표면: canvas, subtle, inset, hover, raised, overlay, header, topbar, nav, 선택 행, accent 틴트
  - 글자: default, muted, subtle, disabled, icon, on-accent, on-solid, link, link-hover, link-decoration, inverse
  - 테두리: muted, default, control, focus
  - 역할별 fg, subtle, border, solid
  - 그림자: 색과 형태를 분리
  - 내부 믹스: `--_ravnus-mix-light`, `--_ravnus-mix-dark`
  - 기타: scrim, `::selection`, 플래시, 위키 diff 추가·삭제, 저널 강조, 진행 막대, 간트 막대, 우선순위·상태·태그 색, 아이콘 stroke
- **규칙**:
  - 표면과 파생에 `white`·`black` 리터럴을 직접 쓰지 않는다. 틴트 표면은 `--ravnus-bg-canvas`와 섞고, 밝게·어둡게 하는 명암 파생(accent-hover·active, link-hover)은 `--_ravnus-mix-light`·`--_ravnus-mix-dark`를 거친다. 헤더가 어두운 프리셋의 topbar-bg는 같은 식의 계산 결과를 README 블록에 리터럴로 싣는다(§5.4 폴백).
  - 크롬 토큰은 가능하면 시맨틱 토큰을 참조한다.
  - 지금은 `color-scheme: light`를 선언한다.
- **다크 전에 남은 일**:
  - Pygments 구문 강조의 하드코딩 hex 44–48개를 토큰화한다(v1 범위 밖).
  - 브랜드 보라는 어두운 배경에서 쓸 수 없다(`#46009B` on `#1C1C1C` 1.41:1). 훨씬 밝은 보라 틴트가 필요하다.
  - 기본 상단 바는 `var(--ravnus-accent)`, 기본 헤더는 `var(--ravnus-bg-canvas)`를 가리킨다. 다크 세트가 강조색을 밝히고 canvas를 어둡게 하면 크롬도 따라 바뀌므로, 크롬 토큰(`--ravnus-topbar-*`, `--ravnus-header-*`)은 다크 세트에서 따로 정하고 명암을 다시 검사한다.
  - 코어의 `--oc-*` 사용(7.0.2 `application.css` 342회)을 명시 셀렉터로 모두 덮는다. `--oc-*`는 팔레트 단계 이름이라 다크 세트에서도 재매핑하지 않는다(§8.4 5). 코어 의미 변수(`--color-header-background` 등)는 크롬 토큰을 가리키므로 다크 세트가 크롬 토큰을 바꾸면 따라온다.
  - `url()` 이미지 아이콘(§8.7 목록. `jstoolbar.css`의 버튼 아이콘 `background-image: url()` 18개와 도움말 링크 `help.png` 1개 포함)은 토큰으로 칠할 수 없으므로 `mask-image`나 테마 대체 이미지가 필요하다.
  - 플러그인 CSS는 범위 밖이다.
- 다크 세트를 켜는 방법(`prefers-color-scheme` 또는 opt-in 클래스)은 그때 정한다.

### 5.6 행 단위 기본값의 명시도

`custom.css`는 `@import`라 테마 규칙보다 앞에 온다. 행 단위 매핑(`tr.status-2 { --ravnus-status-color: … }`, 명시도 0,1,1)은 `:root` 토큰이 아니라 행에 거는 커스텀 속성이다. 테마가 기본값을 `table.list tr.issue`(0,1,2)나 `tr.closed`(0,1,1, 순서상 뒤)에 걸면 사용자 매핑이 조용히 진다.
- 테마의 행 단위 기본값(`--ravnus-status-color`·`-fill`·`-check`, `--ravnus-tracker-color`, `--ravnus-priority-color`, `--ravnus-row-marker-width`·`-color`)은 모두 `:where(table.list tr.issue)`, `:where(table.list tr.issue.closed)`처럼 명시도 0으로 선언한다. 명시도가 같으므로 소스에서 뒤에 오는 규칙이 이긴다. 그래서 `tr.issue.closed` 기본값과 우선순위 위치 클래스 기본값은 일반 행 기본값보다 **뒤에** 둔다.
- 우선순위 위치 클래스의 기본값도 같은 방식으로 선언해, 사용자가 `tr.priority-high2 { … }`로 덮을 수 있게 한다.
- 이 변수를 **읽는** 규칙(`table.list td.status::before { … var(--ravnus-status-color) … }`)은 평소 명시도로 둔다.
- Phase 3에서 `custom.css`의 `tr.status-N` 매핑이 계산 스타일에 반영되는지 assert한다.

---

## 6. 색 체계

### 6.1 기본 라이트 팔레트

모든 대비는 WCAG 2.x 명암비다. "선택 행"은 `--ravnus-accent-muted`(#E5E3F5)를 말한다. 값은 기본값이다. 2026-10-01 §4.1 변경(A Ink → B Signature)은 크롬 토큰(§6.2)을 바꾸고, 이 절의 기존 값은 그대로다. 이 절에는 메인 메뉴 바와 본문 사이 경계를 위한 `--ravnus-nav-border` 한 개만 추가했다(비텍스트 요소 표). 흰 헤더와 메뉴 바 사이 선은 크롬 토큰 header-divider다(§6.2).

**표면**

| 토큰 | hex | 용도 | 대비 (fg-default / fg-muted / fg-subtle / link) |
|---|---|---|---|
| `--ravnus-bg-canvas` | #FFFFFF | 페이지, 본문, 표 행, 파생 틴트의 기준 | 16.20 / 7.62 / 6.01 / 6.40 |
| `--ravnus-bg-subtle` | #FAF9FC | 사이드바, `table.list th`, 줄무늬, 그룹 행, `div.issue`, 저널 헤더, `.box` | 15.45 / 7.26 / 5.73 / 6.10 |
| `--ravnus-bg-inset` | #F4F4F7 | `pre`, `code`, 비활성 필드 | 14.76 / 6.94 / 5.47 / 5.83 |
| `--ravnus-bg-hover` | #F0F0F6 | 행 hover(코어의 노랑 oc-yellow-0 #FFF9DB 대체), 보조 버튼 hover | 14.27 / 6.71 / 5.29 / 5.64 |
| `--ravnus-accent-subtle` | #F2F1FA | 사이드바 선택 항목, 저널 `:target`, 현재 페이지 번호 | 14.46 / 6.80 / 5.36 / 5.71 (accent 글자 10.81) |
| `--ravnus-accent-muted` | #E5E3F5 | 선택 행(`context-menu-selection`) | 12.84 / 6.04 / 4.76 / 5.07 |
| `--ravnus-nav-bg` | #F6F6FC | 메인 메뉴 바 | 15.05 / 7.08 / 5.58 / 5.94 (accent 마커 11.25) |
| `--ravnus-nav-hover-bg` | #ECEAF8 | 메인 메뉴 탭 hover | 13.65 / 6.42 / 5.06 / 5.39 |
| `--ravnus-bg-raised` | var(--ravnus-bg-canvas) = #FFFFFF | `--ravnus-shadow-raised`와 함께 쓰는 표면: `#sticky-issue-header` | canvas와 같음 |
| `--ravnus-bg-overlay` | var(--ravnus-bg-canvas) = #FFFFFF | 떠 있는 레이어: context menu, `#account .dropdown-content`, `.menu-children`, jQuery UI(autocomplete, dialog, datepicker), tribute 멘션 목록 | canvas와 같음 |

raised와 overlay는 라이트에서 canvas와 같다. 다크 세트에서 떠 있는 표면을 canvas보다 밝게 재정의할 수 있도록 따로 둔다.

**글자**

| 토큰 | hex | 용도 | canvas 대비 / 모든 표면 중 최저 |
|---|---|---|---|
| `--ravnus-fg-default` | #202026 | 본문과 모든 제목(코어 #333·#555 대체) | 16.20 / 12.84 (선택 행) |
| `--ravnus-fg-muted` | #53535B | 보조 글자: 속성 레이블, `th`, 저널 상세, 탭, 표 메타 셀, 그룹 합계 | 7.62 / 6.04 |
| `--ravnus-fg-subtle` | #64626A | 메타, placeholder, 푸터, 닫힌 일감(코어 gray-6 #868E96 3.32 대체) | 6.01 / 4.76. Ink & Paper 원안(#6A6972, 선택 행 4.29)에서 교체 |
| `--ravnus-link` | #215DB3 | 링크. 방문한 링크도 같은 색 | 6.40 / 5.07. 본문 글자와는 2.53:1이므로 문장 속 링크에는 상시 밑줄(§7.9) |
| `--ravnus-link-hover` | #164384 | hover(밑줄 동반) | 9.68 / 7.67 |
| `--ravnus-accent` | #46009B | 주 버튼 채움, 선택 마커, 포커스 링, 체크박스. 기본 상단 바(§6.2)도 이 토큰을 가리킨다 | 텍스트 12.11 / 9.60, 흰 글자 12.11 |
| `--ravnus-on-accent` | #FFFFFF | 강조색 위 글자·아이콘 | 12.11 |
| `--ravnus-fg-disabled` | #9F9DA3 | 비활성 컨트롤 전용(명암 요건 면제, 2.68). 정보를 담는 글자에는 쓰지 않는다 | — |
| `--ravnus-bg-inverse` / `--ravnus-fg-inverse` | var(fg-default) / var(bg-canvas) | `.ui-tooltip`(코어는 검정) | 16.20 |

**비텍스트 요소** (3:1 요건)

| 토큰 | hex | 용도 | 대비 |
|---|---|---|---|
| `--ravnus-border-muted` | #E6E6E9 | 행 구분선, 진행 막대 트랙 | 장식(요건 없음) |
| `--ravnus-border-default` | #D9D8DD | 카드, 박스, 탭, 플래시 구분선 | 장식 |
| `--ravnus-nav-border` | var(--ravnus-border-default) = #D9D8DD | 메인 메뉴 바와 본문 사이 선(`#main-menu`의 `border-block-end`, §6.2) | 장식. nav-bg 1.32, canvas 1.42 |
| `--ravnus-border-control` | #7D7C85 | 입력·셀렉트·보조 버튼 테두리 | canvas 4.12, 최저 3.27(선택 행), hover 행 3.63, inset 3.76 |
| `--ravnus-fg-icon` | #7D7C85 | `svg.icon-svg` 기본 stroke | border-control과 같음 |
| `--ravnus-focus-ring` | = accent | `:focus-visible` 2px 실선, offset 2px(잘리는 컨테이너 안에서는 안쪽, §8.1) | canvas 12.11, 선택 행 9.60 |
| `--ravnus-link-decoration` | link 75% | 문장 속 링크 밑줄 | canvas 3.72, bg-subtle 3.63, accent-subtle 3.48 |

**역할 색**

| 역할 | `--ravnus-{역할}-fg` / `-subtle` / `-border` | fg 대비 (canvas / 자기 틴트 / 선택 행) | 용도 |
|---|---|---|---|
| info | #0065A4 / #E9F5FF / #98C3E8 | 6.18 / 5.58 / 4.90 | 열림 상태, `.badge-status-open`, 멘션 |
| success | #176E4A / #E6F9EE / #90CEAC | 6.24 / 5.69 / 4.94 | `div.flash.notice`, 완료 범주, 진행 막대(닫힘) |
| warning | #8A560C / #FFF4DB / #EABC6E | 6.15 / 5.62 / 4.87 | `flash.warning`, `.conflict`, high3 글리프, 일정 지연. 원안 #915C08은 선택 행에서 4.45라 교체. 본문 글자와는 2.64:1이라 일정 지연에는 글리프를 함께 쓴다 |
| danger | #B32322 / #FFEEEE / #F2A7A4 | 6.60 / 5.89 / 5.23 (위 흰 글자 6.60) | `#errorExplanation`, `flash.error`, 기한 초과, 최고 우선순위, 비공개 노트. 본문 글자와는 2.45:1이라 기한 초과에는 굵기와 글리프를 함께 쓴다 |
| `--ravnus-priority-high2-fg` | #B24B0A | 5.38 / — / 4.26 (글리프 전용, 3:1 요건) | 긴급 글리프·행 마커 |

- **`--ravnus-{역할}-solid`**: 채움 배경이다. 우선순위 highest 사각형(§6.4), 기한 초과 "!" 원(§6.5), `.btn-alert`(danger)에 쓴다. 라이트 기본값은 같은 역할의 `-fg`를 가리킨다(`--ravnus-danger-solid: var(--ravnus-danger-fg)` 등).
- **`--ravnus-on-solid`**(#FFFFFF): solid 위 글자와 "!" 글리프 색이다. canvas가 흰색이므로 대비는 위 표의 fg canvas 대비와 같다(info 6.18, success 6.24, warning 6.15, danger 6.60).
- solid를 fg와 따로 두는 이유는 다크 세트에서 글자용 fg는 밝아지고 채움용 solid는 흰 글자를 받는 중간 명도로 남아야 하기 때문이다.

**진행 막대**: Redmine `progress_bar` 헬퍼(7.0.2 `app/helpers/application_helper.rb` 1646행)는 `td.closed`, `td.done`, `td.todo` 세 구간만 만든다. 일감 목록의 진행률 열과 일감 상세는 값이 하나라 완료 구간 `td.closed`와 나머지 `td.todo`만 나온다. 로드맵·버전 막대에는 `td.closed`와 `td.done`이 함께 나온다. Redmine의 녹색 관례를 지키고 보라는 쓰지 않는다. 퍼센트 글자는 항상 막대 옆에 표시한다.

| 토큰 | hex | 칠하는 곳 | 트랙 대비 |
|---|---|---|---|
| `--ravnus-progress-closed` | #176E4A | `td.closed`: 목록·상세의 완료 구간, 로드맵의 닫힌 일감 구간 | 5.01 |
| `--ravnus-progress-done` | #249163 | `td.done`: 로드맵의 진행 중 일감 완료율 구간 | 3.18 |
| `--ravnus-progress-behind` | #BD7221 | 별도 구간이 아니다. `tr.behind-schedule`와 `div.issue.behind-schedule` 막대의 완료 구간(`td.closed`)을 이 색으로 칠한다 | 3.01 |
| `--ravnus-progress-track` | var(--ravnus-border-muted) = #E6E6E9 | `td.todo` | — |

- progress-behind는 보통 행의 완료 구간 색(progress-closed)과 1.66:1이라 흑백에서 구분이 약하다(progress-done과는 1.05:1). 그래서 일정 지연 행의 완료 구간은 45° 빗금(`repeating-linear-gradient`)으로 칠해 모양으로도 구분한다.
- 로드맵 막대의 `td.closed`와 `td.done`은 서로 1.58:1이다. 판단: 구간 사이에 canvas 색 1px 구분선(`border-inline-start`)을 두고, 수치는 옆의 퍼센트와 `p.progress-info` 글자가 전달한다. 색 대비는 보조 단서로만 본다.
- forced-colors와 인쇄 대응은 §8.8, §8.9를 따른다.

**태그(opt-in 트래커·상태용 이름 색)**: 이름을 고정해 두어 다크 세트가 hex 대신 이름을 재매핑하게 한다. 이름 목록은 Sass map + `@each`로 생성한다.

| 이름 | `--ravnus-tag-{이름}-fg` / `-bg` | 대비 |
|---|---|---|
| red | #A5292B / #FFEAE8 | 6.16 |
| orange | #964D09 / #FFEEDA | 5.50 |
| green | #126B47 / #E0F7E9 | 5.79 |
| blue | #065DA0 / #E4F2FF | 5.99 |
| violet | #5A3CA5 / #F0EDFF | 6.96 |
| gray | #55545D / #EEEEF1 | 6.45 |

색각 이상에서는 파랑-보라, 빨강-주황이 구분되지 않는다. 그래서 동시에 쓰는 색은 4개 이하로 권하고, 의미는 트래커 이름 글자가 전달한다고 README에 적는다.

### 6.2 크롬 (기본 Signature)

크롬 안의 모든 요소(`#top-menu`, `#header`, 모바일 헤더와 flyout)는 아래 토큰에서만 색을 가져온다. 크롬 규칙은 fg-\* 계열이나 border-\* 계열 토큰을 직접 쓰지 않는다(아래 기본값처럼 크롬 토큰이 시맨틱 토큰을 가리키는 것은 된다). 그래야 모든 프리셋이 명암을 지킨다. 메인 메뉴 바(`#main-menu`)는 크롬 선택과 상관없이 `--ravnus-nav-*`(§6.1)를 쓴다. 헤더 안에서도 canvas 표면을 가진 컨트롤(빠른 검색 입력, 프로젝트 이동 트리거)의 글자와 오버레이(`#project-jump .drdn-content`)는 크롬 표면 위가 아니므로 폼 컨트롤·overlay 규칙을 따르고, 컨트롤 테두리만 아래 `--ravnus-header-control-border`를 쓴다. 상단 바도 같다. 상단 바의 일반 자손 규칙(`#top-menu a`, 아이콘 stroke)과 topbar-focus는 `#account .dropdown-content`(overlay 표면)를 빼고 적용한다. 이 드롭다운은 `#top-menu` 안에 있는 흰 오버레이다(7.0.2 `dropdown.css` 20–31행 배경 oc-white, 39–45행은 항목 링크에 색을 주지 않는다). `#top-menu a`에 topbar-fg를 그대로 주면 드롭다운 항목이 흰 바탕에 흰 글자가 되고, 앰버 링은 흰 오버레이 위에서 1.94:1이다. 드롭다운 항목은 overlay·focus-ring(accent) 규칙을 따른다. 기본값은 §4.1 결정 B(Signature, 2026-10-01)이고, 2026-09-26 기본값이던 A(Ink)의 값은 §6.3 프리셋 블록에 있다.

**코어 변수 브리지 (7.0.2부터)**: 7.0.2 코어는 크롬 배경을 `:root`의 `--color-top-menu-background`(#234761)와 `--color-header-background`(#3A78A3)로 칠한다(`application.css` 45·46행에 선언). 이 변수를 쓰는 곳은 여섯 군데다. `application.css`의 `nav.top-menu` 배경(92행)과 `#header` 배경(152행), `responsive.css`의 모바일 `#header` 배경(99행), flyout 표면 `.flyout-menu`(288행), flyout 절 제목 `.flyout-menu h3`의 위아래 선(308행, top-menu 변수)과 띠(309행, header 변수)다. 다섯 곳은 배경이고 여섯째인 h3 위아래 선만 테두리 색이다.
- 테마는 `--fonts-main`처럼 일반 `:root`에서 `--color-top-menu-background: var(--ravnus-topbar-bg)`, `--color-header-background: var(--ravnus-header-bg)`로 재매핑한다(§4.5). 이 브리지는 흰 헤더 재칠(§8.4 12, §8.6)과 함께 Phase 2(v0.2.0) `_chrome.scss`부터 싣는다. 재칠 없이 브리지만 실으면 흰 헤더 위에 코어의 흰 글자가 남는다(§4.5). 그러면 위 배경이 크롬 토큰을 따르고, 사용자가 `custom.css`에서 크롬 토큰을 바꿔도 따라온다. `responsive.css`는 테마보다 나중에 로드되지만 이 변수를 선언하지 않고 읽기만 하므로 재매핑이 그대로 적용된다. 2026-10-01 7.0.2 로컬 도커에서 코어 기본 테마에 같은 `:root` 재매핑을 `<style>`로 주입해 1440px의 `#header`·`#top-menu`와 800px의 모바일 `#header`·`.flyout-menu`·`.flyout-menu h3` 배경이 주입한 값이 되는 것을 확인했다. 같은 상태에서 메뉴 토글(#F8F9FA), 프로젝트 이동 제목(#FFFFFF), flyout 글자(#FFFFFF)는 코어의 밝은 색 그대로였다. Phase 0 10a에서는 RAVNUS 스파이크 테마를 적용한 상태에서 같은 `:root` 재매핑을 head 끝에 `<style>`로 넣어, 1440px의 `#header`·`nav.top-menu`와 800px(flyout을 연 상태 포함)의 모바일 `#header`(64px)·`.flyout-menu`·`.flyout-menu h3` 띠가 셀렉터 폴백 없이 변수만으로 칠해지는 것을 확인했다. 이때 `.flyout-menu h3` 글자와 메뉴 토글은 흰 바탕 위 흰 글자였다. 그래서 §8.6의 재칠 목록이 필요하고, 브리지는 재칠과 같은 릴리스에만 싣는다(§4.5). (미검증: 테마 CSS 안에 선언했을 때의 동작과 `custom.css`에서 크롬 토큰을 바꿨을 때의 추종은 Phase 2 완료 기준에서 확인한다. 같은 위치 메커니즘, 곧 테마 CSS의 일반 `:root`가 import한 코어 `:root`를 이기는 것은 `--fonts-main`으로 관찰했다.)
- 변수가 덮지 않는 것은 셀렉터로 칠한다. 흰 헤더 위 글자·링크·아이콘 색(§8.4 12), 헤더 안 컨트롤 테두리, 포커스 링, flyout 글자·링크·아이콘과 h3 글자(§8.6)다. flyout h3 위아래 선은 7.0.2 코어가 top-menu 변수(곧 topbar-bg)로 칠하지만 이 문서는 header-divider로 정하므로 셀렉터로 덮는다.
- 7.0.0–7.0.1에는 두 변수가 없으므로 같은 배경도 셀렉터로 칠한다(배경 폴백, §8.4 "7.0.0–7.0.1 대응", §8.6). 7.0.2에서는 폴백과 변수가 같은 토큰 값을 주므로 결과가 같다.
- `--oc-*`는 의미가 아니라 팔레트 단계 이름(예: `--oc-gray-0`)이다. 한 단계가 본문·크롬·배지 등 여러 역할에 쓰이므로 재매핑하면 그 단계를 쓰는 코어 규칙 전체가 바뀐다. 그래서 재매핑하지 않는다.

| 토큰 | 기본 (Signature) | 대비 | 쓰는 곳 |
|---|---|---|---|
| `--ravnus-topbar-bg` | var(--ravnus-accent) = #46009B | 흰 글자 12.11 | 상단 바, 모바일 flyout 표면. 7.0.2부터 코어 `--color-top-menu-background`가 이 토큰을 가리킨다(위 브리지) |
| `--ravnus-topbar-fg` | var(--ravnus-on-accent) = #FFFFFF | 12.11 | 상단 메뉴 링크·아이콘, 계정 드롭다운 트리거와 그 아이콘(코어 명시도가 높아 따로 선언, §8.4 12), flyout 글자·링크·아이콘 |
| `--ravnus-topbar-fg-muted` | #CAC5EA | 7.32 | 상단 바와 flyout의 보조 글자(상단 바의 링크가 아닌 글자. 코어 `nav.top-menu`의 상속 글자색 gray-2(93행)를 대체한다. 플러그인이 상단 바에 넣는 보조 글자도 이 색을 상속한다) |
| `--ravnus-topbar-focus` | #FEA800 (로고 앰버) | 상단 바 위 6.24 | 상단 바·flyout 포커스 링. 흰 헤더 위에서는 1.94이므로 링이 상단 바 밖으로 나가지 않게 `outline-offset`을 정한다 |
| `--ravnus-topbar-height` | 2rem (`min-block-size`로 적용) | — | 상단 바 높이. Ink·Brand-forward·Calm·Redmine Blue 프리셋은 1.75rem(프로토타입 A·C·D의 28px) |
| `--ravnus-header-bg` | var(--ravnus-bg-canvas) = #FFFFFF | 본문 글자 16.20 | 데스크톱·모바일 헤더, flyout 절 제목(h3) 띠. 7.0.2부터 코어 `--color-header-background`가 이 토큰을 가리킨다(위 브리지) |
| `--ravnus-header-fg` | var(--ravnus-fg-default) = #202026 | 16.20 | h1(앱 제목, 현재 프로젝트명 `.current-project`), 모바일 프로젝트 이동 제목, 메뉴 토글, 헤더 링크 hover, flyout h3 |
| `--ravnus-header-fg-muted` | var(--ravnus-fg-subtle) = #64626A | 6.01 | 브레드크럼 링크와 구분자, 빠른 검색 레이블과 링크, 모바일 펼침 캐럿 |
| `--ravnus-header-icon` | var(--ravnus-header-fg-muted) | 6.01(3:1 요건). hover 시 header-fg | `#header svg.icon-svg` stroke, `#header svg.icon-svg-filled` fill |
| `--ravnus-header-focus` | var(--ravnus-accent) = #46009B | 흰 헤더 12.11 | 헤더 안 포커스 링(브레드크럼, 검색 레이블 링크, 검색 입력 `#q`, 모바일 토글). 검색 입력은 코어 `input[type="text"]:focus {outline: none}`(0,2,1)을 이기도록 `#quick-search #q:focus-visible`처럼 명시도를 높인다(§8.4 12). 프로젝트 이동 트리거는 코어 마크업이 tabindex 없는 `span.drdn-trigger`라 키보드 포커스를 받지 않는다. 펼친 뒤의 포커스는 오버레이 안 `#projects-quick-search`에 가고 focus-ring 규칙을 따른다. 메인 메뉴 바의 탭은 일반 `--ravnus-focus-ring`(nav-bg 위 11.25)을 쓴다 |
| `--ravnus-header-divider` | var(--ravnus-border-default) = #D9D8DD | 장식 헤어라인. 흰 헤더 1.42, 메뉴 바(nav-bg) 1.32 | 아래 "경계선" |
| `--ravnus-header-control-border` | var(--ravnus-border-control) = #7D7C85 | 흰 헤더 4.12 | 헤더 안 빠른 검색 입력 `#q`와 `#project-jump .drdn-trigger`의 테두리. 두 컨트롤의 표면은 canvas다 |

**경계선** (`--ravnus-header-divider`와 `--ravnus-nav-border`, 1px 실선. 장식이라 3:1 요건은 없다. 배경 차이가 큰 곳(상단 바와 헤더 12.11:1)에서는 배경이 경계를 전달하지만, 배경 차이가 거의 없는 곳(흰 헤더와 메뉴 바, 메뉴 바와 본문, 모두 1.08:1)에서는 이 선이 경계의 주 단서다)
- 헤더와 메인 메뉴 바 사이: `#main-menu`의 `border-block-start`(header-divider). 흰 헤더와 메뉴 바(`#F6F6FC`)는 1.08:1이라 선이 없으면 경계가 보이지 않는다.
- 메인 메뉴 바와 본문 사이: `#main-menu`의 `border-block-end`(nav-border). 메뉴 바 아래는 크롬 선택과 상관없이 흰 본문이므로 크롬 토큰이 아니라 nav 토큰으로 둔다. 헤더가 어두운 프리셋의 header-divider(Ink #3E3463)는 흰 본문 위에서 11.19:1로 너무 진하기 때문이다. `#main-menu`는 `box-sizing: border-box`로 두어 위아래 선이 nav-height 안에 들어가게 하고, 헤더 예약 패딩(nav-height)과 메뉴 높이를 맞춘다(§8.4 3).
- 상단 바와 헤더 사이: `#header`의 `border-block-start`. Signature에서는 상단 바와 헤더가 12.11:1이라 없어도 구분되지만, 프리셋 공통 규칙으로 둔다. 상단 바가 연한 Calm(bg-subtle, 흰 헤더와 1.05:1)과 어두운 띠 두 개인 Ink(1.26:1)에서는 이 선이 경계를 만든다.
- 모바일 헤더 아래: `border-block-end`(§8.6). 흰 모바일 헤더가 흰 본문 위에 고정되기 때문이다. 코어 `responsive.css`는 `border: none`(98행)이다.
- flyout 절 제목(h3) 위아래 선(§8.6).
- 선 두께는 Phase 2 크롬 높이 측정에 포함한다.

**모바일 flyout**(§8.6): 표면은 topbar-bg, 글자·링크·아이콘은 topbar-fg, 보조 글자는 topbar-fg-muted, 절 제목 h3 띠는 header-bg 위 header-fg, h3 위아래 선은 header-divider, 항목 구분선은 topbar-fg(currentColor) 15%, 검색 입력 테두리는 header-control-border, 포커스는 topbar-focus다. Signature의 flyout 표면은 보라라서 코어 `responsive.css`의 "어두운 flyout 위 흰 글자" 전제가 그대로 맞는다. 상단 바가 연한 Calm 프리셋에서는 flyout 표면도 밝아지므로, 흰 필드와 흰색 10% 구분선에 기대던 경계를 위 두 규칙으로 만든다(§8.6 "밝은 flyout").

### 6.3 프리셋 (README 복사용 `:root{}` 블록)

기본값은 Signature(B)다(§6.2). 대안 크롬 프리셋 네 가지(Ink, Brand-forward, Calm, Redmine Blue)는 크롬 스타일이 들어가는 v0.2.0(Phase 2)부터 README에 싣는다(§4.1 결정. 브랜드 색 사용은 소유자가 확인했다). Signature는 기본값이므로 프리셋 목록에 없다. 헤더가 어두운 프리셋(Ink, Brand-forward, Redmine Blue)은 흰 헤더용 기본 크롬 토큰을 거의 모두 바꾸므로 크롬 토큰 블록 전체를 싣는다. `--ravnus-header-icon`(header-fg-muted를 따름)과 `--ravnus-header-control-border`는 바꾸지 않는다. 어두운 헤더 위에서는 canvas 필드 표면 자체가 경계가 된다(§6.6). 파생값(상단 바, Redmine Blue의 accent 파생)은 color-mix 식이 아니라 빌드가 계산한 리터럴 hex로 싣는다. 사용자 `:root`의 식은 테마 폴백이 덮지 못하기 때문이다(§5.4).

**Ink (A)**: 2026-09-26 기본값이던 잉크 바이올렛 크롬. 코어처럼 어두운 헤더 위 밝은 글자를 쓴다.

```css
:root {
  --ravnus-header-bg: #311E5F;            /* oklch 0.30 0.11 292. 흰 글자 14.17 */
  --ravnus-header-fg: #FFFFFF;
  --ravnus-header-fg-muted: #D1CEE4;      /* 헤더 위 9.22 */
  --ravnus-header-divider: #3E3463;       /* 장식 헤어라인, 헤더와 1.27 */
  --ravnus-header-focus: #FFFFFF;         /* 14.17. 헤더 위 accent는 1.17이라 쓸 수 없다 */
  --ravnus-topbar-bg: #1C0F3A;            /* 흰 글자 17.81. header-bg를 바꾸면 color-mix(in oklch, header-bg 72%, 검정)으로 다시 계산(§5.4). 식을 적으면 color-mix 미지원 브라우저에서 투명해진다 */
  --ravnus-topbar-fg: #FFFFFF;
  --ravnus-topbar-fg-muted: #D1CEE4;      /* 상단 바 위 11.59 */
  --ravnus-topbar-focus: #FFFFFF;         /* 17.81 */
  --ravnus-topbar-height: 1.75rem;
}
```

| 프리셋 | 바뀌는 토큰 | 핵심 대비 |
|---|---|---|
| Ink (A) | 위 블록 | 흰 글자 헤더 14.17 / 상단 바 17.81, muted 9.22 / 11.59, 흰 포커스 링 14.17 / 17.81, 상단 바와 헤더 1.26(헤어라인으로 보완) |
| Brand-forward | Ink 블록에서 header-bg #46009B, topbar-bg #2A0062(리터럴, §5.4) | 흰 글자 12.11, muted #D1CEE4 7.88. 상단 바 #2A0062는 흰 글자 16.47, muted 10.72 |
| Calm (C) | topbar-bg는 bg-subtle, topbar-fg는 fg-muted, topbar-fg-muted는 fg-subtle, topbar-focus는 accent, topbar-height 1.75rem. 헤더는 기본값(흰 헤더) 그대로 | 상단 바 글자 7.26, muted 5.73, 포커스 11.55. 상단 바와 헤더(1.05)는 header-divider로 구분(§6.2). 상단 바가 밝으므로 코어가 높은 명시도로 밝은 색을 주는 계정 트리거·아이콘을 topbar 토큰으로 다시 칠하는 규칙(§8.4 12)과, 모바일 flyout 표면도 밝아져 필요한 글자 재칠과 검색 입력 테두리·항목 구분선 규칙(§8.6 "밝은 flyout")이 이 프리셋의 전제다. 이 규칙들은 Calm 블록을 처음 싣는 v0.2.0에 함께 싣는다(§4.5) |
| Redmine Blue (D) | Ink 블록에 header-bg #2B5F8A, header-fg-muted #D4E2EF, topbar-bg #183A57(리터럴), accent #1864AB와 accent 파생 7개의 리터럴(빌드 계산값, §5.4) | 흰 글자 6.76, muted 5.13. 상단 바 #183A57은 흰 글자 11.79, topbar-fg-muted(Ink 값 #D1CEE4) 7.67. 파생 선택 행 #E4ECF6 위에서 link 5.37, fg-subtle 5.04, border-control 3.46 |
| Left sidebar | `--ravnus-sidebar-at-start: 1` | — |
| Compact | `--ravnus-row-pad-y: 0.25rem; --ravnus-font-size-cell-subject: 0.8125rem` | — |
| Classic stripes off | `--ravnus-row-stripe: transparent` | — |

### 6.4 우선순위 표현

위치 클래스(모든 설치에서 같은 뜻)만 기준으로 삼는다. `priority-N` id에는 기대지 않는다. 위치 클래스별 값은 map + `@each`로 생성하고, 기본값은 명시도 0으로 선언한다(§5.6).

- 색 토큰(`:where(:root)`): `--ravnus-priority-low-fg`(= fg-subtle), `--ravnus-priority-high3-fg`(= warning-fg), `--ravnus-priority-high2-fg`(#B24B0A), `--ravnus-priority-highest-fg`(= danger-fg).
- 행 변수(`:where(table.list tr.issue.priority-…)`): `--ravnus-priority-color`(글리프 색), `--ravnus-row-marker-width`(0, 3px, 6px), `--ravnus-row-marker-color`. 글리프 모양(막대 수, 사각형)은 변수가 아니라 위치 클래스별 규칙으로 정한다.

| 행 클래스 | `td.priority::before` 글리프 | 셀 글자 | 첫 셀 행 마커 |
|---|---|---|---|
| `priority-lowest`, `[class*=' priority-low']` | 막대 1개, fg-subtle | fg-default | 없음 |
| `priority-default` | 없음(행의 약 80%가 조용하게 유지됨, 비율은 추정) | fg-default | 없음 |
| `priority-high3`, `[class*=' priority-high']` 폴백 | 막대 2개, warning | fg-default | 없음 |
| `priority-high2` | 막대 3개, #B24B0A | fg-default | 3px 막대 |
| `priority-highest` | 14px 사각형을 danger-solid로 채우고 on-solid "!"를 얹음("!"는 글꼴이 아니라 그라디언트로 그림) | danger-fg, 600 | **6px** 막대 |

- 막대는 3개의 `linear-gradient`로 그린 12×10px 시그널 막대다. forced-colors와 인쇄에서 사라지지 않게 §8.8·§8.9 규칙을 적용한다.
- 수준은 막대 개수와 모양(막대 → 사각형), 마커 두께(3px → 6px)로 구분한다. 그래서 적록 색각 이상에서 색이 겹쳐도 읽힌다. Machado 2009(심도 1.0) 시뮬레이션 뒤 CIEDE2000으로 계산하면 제2색각에서 high3–highest가 1.4, 제1색각에서 high3–high2가 0.6이다. 정상 색각에서 high3–highest는 23.9다.
- 행 마커는 우선순위 열이 숨겨졌을 때를 위한 것이다. box-shadow가 아니라 첫 셀의 `border-inline-start: var(--ravnus-row-marker-width) solid var(--ravnus-row-marker-color)`(또는 `inset-inline-start`로 놓은 가상 요소)로 그린다.
  - 논리 속성이라 RTL 로캘(코어 7은 `<html dir="rtl">`을 준다, §10.4)에서 `[dir=rtl]` 셀렉터 없이 자동으로 뒤집힌다.
  - 테두리는 forced-colors에서도 남는다(box-shadow는 사라진다).
  - `border-collapse` 표에서 두꺼운 테두리가 행 구분선과 셀 정렬에 주는 영향을 보고 Phase 3에서 둘 중 하나로 정한다 (미검증).

### 6.5 상태·트래커·행 상태 표현

**상태 (td.status::before, 10px 글리프, 모두 CSS로 그림)**

| 경우 | 모양 | 색 |
|---|---|---|
| 기본: 열린 행 | 속 빈 원(1.5px 테두리) | info |
| 기본: `tr.closed` | 채운 원(10px 원에 5px 테두리로 채움) | fg-subtle. 행 글자도 fg-subtle(6.01). 목록 제목에는 취소선을 긋지 않는다(한글 음절 가운데를 가르기 때문. 판단이며 측정하지 않음) |
| opt-in: open | 속 빈 원 | info |
| opt-in: progress | 반만 채운 원 | warning |
| opt-in: done | 체크가 든 원 | success |
| opt-in: closed | 채운 원 | fg-subtle |

- 기본으로는 설치 간 의미가 같은 `closed`만 쓰므로 2종만 표시한다.
- **토큰과 그리는 방식**. 커스텀 속성 하나로 모양 이름을 골라 그리려면 style query(`@container style()`)가 필요한데, 이 기능은 Baseline low(2026-05-19)라 §5.4 기준으로 쓰지 않는다. 대신 모양을 숫자 변수 두 개로 나눈다.
  - 색 토큰(`:where(:root)`): `--ravnus-status-open-color`(= info-fg), `--ravnus-status-progress-color`(= warning-fg), `--ravnus-status-done-color`(= success-fg), `--ravnus-status-closed-color`(= fg-subtle).
  - 행 변수: `--ravnus-status-color`, `--ravnus-status-fill`(0 빈 원, 0.5 반원, 1 채운 원), `--ravnus-status-check`(0 또는 1). 기본값은 `:where(table.list tr.issue)`가 open 색·0·0, `:where(table.list tr.issue.closed)`가 closed 색·1이다(§5.6).
  - `td.status::before`: 10px 원, 테두리 두께 `max(1.5px, (fill − 0.5) × 10px)`. 그래서 fill 1은 5px 테두리로 속까지 채워진다. 반원은 `linear-gradient`의 정지점 `fill × 100%`로 칠한다.
  - 체크는 `td.status::after`에 두 테두리를 45° 돌려 그리고 `opacity: var(--ravnus-status-check)`로 켠다.
- 빈 원, 채운 원, 체크는 테두리로만 그리므로 forced-colors와 배경 그래픽을 끈 인쇄에서도 구분될 것으로 본다 (미검증: Phase 3에서 에뮬레이션과 인쇄 미리보기로 확인). 그라디언트로 칠하는 반원은 §8.8·§8.9 규칙을 따른다.
- opt-in은 `custom.css`에서 행 커스텀 속성으로 매핑한다. id 개수 제한이 없고 빌드가 필요 없다. 테마 기본값이 명시도 0이므로 이 예시가 이긴다(§5.6). 닫힌 상태에 매핑할 때 기본값(fill 1)이 남지 않도록 세 변수를 모두 적는다.
  ```css
  tr.status-2 { --ravnus-status-color: var(--ravnus-status-progress-color); --ravnus-status-fill: 0.5; --ravnus-status-check: 0; }
  tr.status-3 { --ravnus-status-color: var(--ravnus-status-done-color);     --ravnus-status-fill: 0;   --ravnus-status-check: 1; }
  ```
- README에는 기본 상태의 예시 매핑을 싣는다: 신규는 open, 진행·의견은 progress, 해결은 done, 완료·거절은 closed. id는 설치마다 다르므로 규칙을 기본으로 싣지는 않는다.
- 10px에서 체크 모양이 알아볼 만한지는 확인 전이다 (미검증).
- 일감 상세의 실제 `span.badge-status-open/closed/locked`는 알약 모양이다. radius full, 12px 이상, 각각 info 틴트 / 중립(bg-inset, fg-muted) / warning 틴트다.

**트래커**: 기본은 중립 fg-muted 글자다(`:where(table.list tr.issue) { --ravnus-tracker-color: var(--ravnus-fg-muted); }`). opt-in으로 `tr.tracker-1 { --ravnus-tracker-color: var(--ravnus-tag-red-fg); }`를 주면 `td.tracker` 글자색과 앞의 8px 사각 점이 바뀐다. 알약은 쓰지 않는다.

**기타 행 상태**

| 클래스 | 표현 |
|---|---|
| `overdue` | `tr.overdue td.due_date`, `div.issue.overdue .due-date .value`를 danger-fg, 600으로 하고 앞에 "!" 원 글리프를 붙인다. 글리프는 `::before`에 그린 10px 원(border-radius 50%)을 danger-solid 배경으로 채우고, on-solid "!"를 `linear-gradient` 두 개(세로 막대와 점)로 얹는다. 글꼴 글자는 쓰지 않는다(§6.4 사각형과 같은 방식). danger-fg는 본문 글자와 2.45:1이라 굵기와 글리프가 색 외 단서다 |
| `behind-schedule:not(.overdue)` | due_date를 warning-fg, 500으로 하고 앞에 삼각형 글리프(clip-path)를 붙인다. warning-fg는 본문 글자와 2.64:1이라 색만으로는 구분되지 않는다(WCAG 1.4.1). 이 행의 진행 막대는 따로 지연 구간이 없고, 완료 구간(`td.closed`)을 `--ravnus-progress-behind` 빗금으로 칠한다(§6.1) |
| `parent` | `td.subject`를 600으로 한다 |
| `child` | 코어 들여쓰기(`idnt-N`)를 유지하고, 트리 셀에 `overflow-wrap: anywhere`를 준다 |
| `assigned-to-me` | `td.assigned_to`를 600으로 한다 |
| 줄무늬, hover | `--ravnus-row-stripe`(bg-subtle), `--ravnus-bg-hover` |
| `context-menu-selection` | 배경 accent-muted, 글자 fg-default, 링크 `--ravnus-list-link`(기본 link 5.07), 아이콘 currentColor. 표시는 배경과 **체크된 체크박스**(색 외 단서)로 하고 마커는 쓰지 않는다 |

- **겹칠 때 순서**: 줄무늬 < hover < 선택 배경 순으로 덮는다. 우선순위 행 마커(테두리)는 배경과 독립이라 모든 상태에서 유지된다. 기한 초과·일정 지연·닫힘 글자색은 선택 행에서도 4.5:1 이상이다(danger 5.23, warning 4.87, fg-subtle 4.76).
- **선택 행 셀렉터**: 코어 `context_menu.css`는 `!important`를 쓰고 테마보다 나중에 로드된다. 그래서 `table.list tr.context-menu-selection`과 그 `:hover`, `a`, `a:hover`, `svg.icon-svg`에 `!important`를 둔다. `div#gantt_area .context-menu-selection`은 v1에서 코어 그대로 둔다.

**그룹 행과 합계** (코어가 하드코딩한 색이 AA 미만인 곳)

| 요소 | 표현 | 대체하는 코어 값 (canvas 대비, 7.0.2 `application.css`) |
|---|---|---|
| `tr.group td` | bg-subtle, 그룹명 fg-default 600 | — |
| `tr.group span.count` | 중립 배지(bg-inset, fg-muted, radius-full, 12px) | — |
| `tr.group span.totals` / `.value` | fg-muted / fg-default 600 | gray-5 #ADB5BD 2.07, gray-6 #868E96 3.32(712·713행) |
| `tr.group a.toggle-all` | UI 링크 규칙(link, hover 밑줄) | gray-5 2.07(714행) |
| `.query-totals`, `.value` | fg-muted / fg-default 600 | — |
| `p.progress-info`, `p.percent` | fg-muted, 12px 하한(§7.2) | gray-6 3.32(`p.progress-info` 1804행) |

토큰 쌍 검사로는 이런 코어 값을 잡지 못한다. 렌더된 화면의 axe-core 검사(§10.2)가 남은 곳을 찾는다.

### 6.6 CI 명암 게이트 쌍

`culori` 또는 `colorjs.io`를 devDependency로 추가한다. 추가하기 전에 의존성과 라이선스를 확인한다. 기본값과 §6.3의 모든 프리셋에 대해 다음 쌍을 검사한다.
- fg-default, fg-muted, fg-subtle, link, 역할별 fg가 canvas, subtle, inset, hover, raised, overlay, accent-subtle, accent-muted, nav-bg, 네 역할 틴트 위에서 4.5 이상(본문 fg-default는 7 이상)
- on-accent / accent, on-solid / 역할별 solid가 4.5 이상
- header-fg·header-fg-muted / header-bg, topbar-fg·topbar-fg-muted / topbar-bg가 4.5 이상. flyout h3(header-fg / header-bg)도 여기에 들어간다
- border-control, fg-icon, focus-ring, header-focus, topbar-focus, header-icon이 자기 표면 전부에서 3 이상(header-focus·header-icon은 header-bg, topbar-focus는 topbar-bg. 메뉴 바 탭은 focus-ring이 nav-bg 위에서 검사된다)
- 헤더 안 컨트롤 경계: header-control-border / header-bg 또는 canvas(필드 표면) / header-bg 중 하나가 3 이상. 기본 흰 헤더는 앞의 것(4.12), 어두운 헤더 프리셋은 뒤의 것(Ink 14.17, Brand-forward 12.11, Redmine Blue 6.76)으로 통과한다
- link-decoration(canvas 위 합성)이 canvas, subtle, inset, accent-subtle에서 3 이상
- 진행 막대 구간 / 트랙이 3 이상

이 게이트는 토큰 쌍만 본다. 테마가 덮지 않은 코어 색은 §10.2의 렌더 화면 검사가 맡는다. 특히 흰 헤더에서 테마가 놓친 코어 밝은 글자 규칙(§8.4 12, §8.6)은 토큰 쌍 검사로 잡히지 않으므로 계산 스타일 assert(§10.2 3)로 잡는다.

---

## 7. 타이포그래피 사양

### 7.1 언어별 폰트 스택

§4.6 결정(F1)을 따른다. `"Pretendard Variable"`은 테마 CSS에 생성된 CDN `@font-face`(§4.4)를 가리키고, `Pretendard`는 로컬에 설치된 폰트를 위한 이름이다. 폰트를 자체 호스팅하는 설치는 네 스택의 이 두 이름을 자기 family 이름으로 바꾼다(§4.4). `:lang(a, b)` 목록 문법은 Chrome에서 무효라 규칙 전체가 버려진다. 그래서 인자를 하나씩만 쓴다. `:lang(zh)`는 zh-TW에도 맞으므로 zh-TW 규칙은 zh 뒤에 둔다.

```css
:where(:root) {
  --ravnus-font-sans: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui,
    "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "Noto Sans CJK KR", "Segoe UI", Roboto,
    "Helvetica Neue", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
  --ravnus-font-sans-ja: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans",
    "Hiragino Kaku Gothic ProN", "RAVNUS Yu Gothic", Meiryo, "Noto Sans JP", "Noto Sans CJK JP",
    "Pretendard Variable", Pretendard, sans-serif;
  --ravnus-font-sans-zh: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC",
    "Pretendard Variable", Pretendard, sans-serif;
  --ravnus-font-sans-zh-tw: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC",
    "Microsoft JhengHei UI", "Microsoft JhengHei", "Noto Sans CJK TC", "Source Han Sans TC",
    "Pretendard Variable", Pretendard, sans-serif;
  --ravnus-font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", D2Coding,
    "Noto Sans Mono CJK KR", monospace;
  --ravnus-font-ui: var(--ravnus-font-sans);
}
:where(:root:lang(ja))    { --ravnus-font-ui: var(--ravnus-font-sans-ja); }
:where(:root:lang(zh))    { --ravnus-font-ui: var(--ravnus-font-sans-zh); }
:where(:root:lang(zh-TW)) { --ravnus-font-ui: var(--ravnus-font-sans-zh-tw); }  /* zh 뒤에 둔다 */
:root { --fonts-main: var(--ravnus-font-ui); }  /* 코어 :root를 이긴다 */
```

- ko와 그 밖의 UI(en 등)는 `--ravnus-font-sans`를 쓴다. ko에서 Pretendard에 없는 한자(Hanja)는 Apple SD Gothic Neo, Malgun Gothic, Noto CJK KR이 한국식 자형으로 채운다.
- ja와 zh에서 Pretendard는 한글만 맡는다. zh-TW는 네이티브 폰트가 Pretendard보다 앞에 있어야 `，。`가 가운데에 놓인다.
- ja 모노스페이스 변형은 "Noto Sans Mono CJK JP", "MS Gothic"을, zh는 "Noto Sans Mono CJK SC/TC"를 쓴다.
- Windows의 Yu Gothic Regular는 얇게 렌더된다. `"RAVNUS Yu Gothic"`은 `local("Yu Gothic Medium")`, `local("YuGothic-Medium")`을 가리키는 `@font-face` 별칭이다. tats-u/yu-gothic-css(MIT) 패턴을 참고해 직접 작성한다. Windows Chrome에서의 동작은 확인 전이다 (미검증).

### 7.2 크기 (rem만 쓰고 html font-size는 건드리지 않는다)

| 토큰 | 값 | 적용 |
|---|---|---|
| `--ravnus-font-size-min` | 0.75rem (12px) | 하한. 다음을 올린다: 코어의 11px 지점(`.badge`, `thead.related-issues th`), `div.issue span.private`·`div.journal span.private`(코어 60%, 약 8.4px), `p.percent`·`p.progress-info`(코어 86%, 13px 문맥에서 약 11.2px), 푸터 |
| `--ravnus-font-size-sm` | 0.8125rem (13px) | 사이드바, 상단 메뉴, `.contextual`, 브레드크럼, 저널 상세, `th`, 표 메타 셀(`--ravnus-font-size-cell`) |
| `--ravnus-font-size-base` | 0.875rem (14px) | 본문, UI, 폼 컨트롤, 메인 메뉴 탭, 목록 제목 `td.subject`(`--ravnus-font-size-cell-subject`, 500) |
| `--ravnus-font-size-prose` | 0.9375rem (15px) | 모든 `div.wiki`(일감 설명, 저널, 위키, 뉴스)와 `textarea.wiki-edit`. Pretendard 한글은 같은 px에서 Noto Sans KR보다 약 4% 작아 보이는 것을 보정한다 |
| 제목 | `#content h2` 1.25rem, h3 1.0625rem, h4 0.9375rem | 코어 체계 유지 |
| 헤더 h1 | 1.375rem (22px), 700 | 코어(1.375rem, normal, 7.0.2 169·170행)와 같은 크기에 굵기만 올린다 |
| 일감 제목 `div.issue div.subject h3` | 1.375rem (22px), 700 | 코어는 17px. 코어의 h2("결함 #8")는 그대로 둔다 |
| 위키 h1–h6 | 1.5 / 1.3125 / 1.125 / 1 / 0.9375 / 0.875rem (h6는 fg-muted) | 코어의 1.6/1.4/1.2/1.1/1/1em 혼합을 대체한다 |
| 코드 | `max(0.875em, var(--ravnus-font-size-min))` | 15px 본문 안에서 약 13.1px. 13px 셀·사이드바 안에서는 0.875em(약 11.4px) 대신 하한 12px |

**하한 예외: 간트.** 간트 제목 열(`.gantt_subjects`)은 하한과 행간 규칙에서 명시적으로 뺀다. 코어는 제목을 0.8em, line-height 16px로 그리고(`gantt.css`), 행 간격 20px을 `lib/redmine/helpers/gantt.rb`의 `:top_increment => 20`(7.0.2 222행)에 고정해 두었다. 전역 크기나 행간 규칙이 닿으면 제목과 막대가 어긋난다.

### 7.3 행간 (모두 단위 없는 값, 모든 텍스트 컨테이너에 명시)

코어에는 body line-height가 없다. Pretendard의 `normal`은 1.193이고 코어 Noto Sans는 1.362다. 명시하지 않으면 줄이 약 12% 좁아지고, 폰트가 swap될 때 줄 상자가 움직인다. Phase 0 2b(7.0.2, CDN 차단 전후 비교)에서 단위 없는 line-height가 있는 요소는 높이가 같았고(`div.wiki p` 44.8px, `#main-menu li a` 32px, `#header h1` 44px), `line-height: normal`인 요소만 바뀌었다(`#content h2` 27→28px, `div.wiki h1` 29→32px).

| 토큰 | ko / 기본 | ja | zh·zh-TW | 적용 |
|---|---|---|---|---|
| `--ravnus-line-height-tight` | 1.25 | 1.25 | 1.25 | 버튼, 배지, 탭, 상단 메뉴 |
| `--ravnus-line-height-heading` | 1.4 (22px 이상은 1.35) | 1.45 | 1.45 | 제목 |
| `--ravnus-line-height-ui` | 1.5 | 1.5 | 1.5 | body, 폼, 사이드바 |
| `--ravnus-line-height-cell` | 1.45 | 1.45 | 1.45 | `table.list td` |
| `--ravnus-line-height-prose` | 1.7 | 1.75 | 1.75 | `div.wiki p, li`(코어 1.6 대체), 비례폭 위키 편집기 |
| `--ravnus-line-height-mono` | 1.55 | 1.55 | 1.55 | `pre`, 모노스페이스 편집기 |

위키 안의 표와 `table.list` 안의 위키 텍스트는 ui/cell 값으로 돌아간다. 문단 간격은 코어의 1em을 유지하고, 위키 제목은 `margin-block: 1.6em 0.6em`으로 한다. 텍스트 상자에 고정 높이를 주지 않는다(WCAG 1.4.12). 코어가 고정 높이를 준 `#content .tabs`는 §8.1에서 다룬다.

### 7.4 자간

- 본문, UI, 표 글자는 모든 언어에서 0이다. KRDS는 13–19px에서 0을 쓰고, Pretendard README도 보정이 필요 없다고 한다.
- 20px 이상 제목은 ko와 라틴만 `--ravnus-letter-spacing-heading: -0.01em`이다. ja·zh 제목은 0이다.
- ja 본문만 +0.02em이다(일본 디지털청 standard 스타일). 토큰으로 0으로 되돌릴 수 있다.
- 14px 이하에는 음수 자간을 쓰지 않는다.

### 7.5 굵기

- 400: 본문
- 500: 탭, 버튼, 목록 제목, 일정 지연 날짜
- 600: `th`, 레이블, `strong`(UI), 선택 항목, 부모 일감, 기한 초과 날짜
- 700: h1, h2, 일감 제목, 헤더 프로젝트명, 본문 `strong`
- 16px 이하 글자에는 400 미만을 쓰지 않는다. `-webkit-font-smoothing`은 전역으로 설정하지 않는다.

### 7.6 줄바꿈과 keep-all 적용 위치

§4.6 결정(K2)을 따른다.

```css
/* ja·zh를 뺀 모든 UI 언어에서 어절 단위로 줄바꿈한다. :lang(zh)는 zh-TW에도 맞는다 */
:where(:root:not(:lang(ja)):not(:lang(zh))) { --ravnus-word-break: keep-all; }
body { word-break: var(--ravnus-word-break, normal); overflow-wrap: break-word; }
textarea.wiki-edit { word-break: var(--ravnus-word-break, normal); }  /* 상속 여부 미확인이라 명시 */

/* 코어가 word-break: break-word를 직접 준 곳은 상속이 지므로 다시 선언한다 (7.0.2 913·974행) */
div.issue div.subject div div,
#issue_tree .issue > td.subject,
#relations .issue > td.subject { word-break: var(--ravnus-word-break, normal); overflow-wrap: anywhere; }

/* 긴 글이 드는 셀: auto 레이아웃 표가 100%를 넘지 않게 한다 (keep-all만 주면 300px 표가 392px로 늘어남, Chrome 측정) */
table.list td:is(.subject, .string, .text, .list, .relations, .parent) { overflow-wrap: anywhere; }
table.list td.subject { min-inline-size: var(--ravnus-subject-min-inline-size, 12em); } /* 값은 12열 쿼리로 조정 (미검증) */
/* 이름 열(assigned_to, author, last_updated_by, category, name)은 anywhere에서 빼고 body의 break-word를 상속한다 */

:root:lang(ja) body { line-break: strict; }
@supports (word-break: auto-phrase) {
  :root:lang(ja) :is(#content h1, #content h2, #content h3, div.issue div.subject h3) { word-break: auto-phrase; }
}
:is(#content h1, #content h2, #content h3, #content h4, div.issue div.subject h3) { text-wrap: balance; }
div.wiki p { text-wrap: pretty; } /* 점진적 향상 */
```

- **keep-all이 적용되는 곳**: ja·zh를 뺀 UI 언어(ko, en 등)에서 상속되는 모든 글자(본문, 표, 사이드바, 제목, 위키), 코어가 break-word를 직접 준 3곳(다시 선언), 위키 편집 textarea. textarea가 word-break를 상속하는지는 확인 전이라 명시적으로 선언한다 (미검증). 라틴 글자에는 keep-all이 normal과 같게 동작한다.
- **적용하지 않는 곳**: ja, zh, zh-TW UI. `pre`·`code`처럼 공백을 보존하는 글자. 긴 URL은 `overflow-wrap`이 처리한다.
- **안전망**: 블록에는 `break-word`, 긴 글 셀에는 `anywhere`, 제목 셀에는 최소 폭 토큰을 둔다. `anywhere`는 셀의 min-content를 한 글자로 줄이므로, 열이 많은 쿼리에서 제목이 음절 단위로 쪼개지지 않게 최소 폭이 필요하다.
- **이름 열**: 담당자·작성자·최종 수정자·범주·이름 열에 `anywhere`를 주면 자동 표 레이아웃이 열을 한 글자 폭까지 좁혀 "홍길/동"처럼 쪼갤 수 있다. 코어는 `assigned_to`에 nowrap을 두지 않는다. 그래서 이 열은 `break-word`(min-content를 줄이지 않음)만 쓴다.
- **한계**: 기준은 콘텐츠 언어가 아니라 UI 언어다. ko·en 등 UI에서 일본어·중국어 일감은 overflow-wrap으로만 줄이 바뀌어 어색한 위치에서 끊길 수 있다. ja·zh UI의 한국어 일감은 음절 단위로 끊긴다. 스크립트 감지에는 theme.js가 필요해 v2 이후에 검토한다.
- **zh**: 기본값(`word-break: normal`, `line-break: auto`)에 긴 글 셀 `anywhere`만 더한다.
- keep-all + anywhere의 표 동작은 Chrome에서만 측정했다. Firefox·Safari는 확인 전이다 (미검증).

### 7.7 문자 사이 간격

```css
:root:lang(ja), :root:lang(zh) { text-autospace: normal; }  /* 각각 단일 인자 셀렉터라 유효하다 */
:root:lang(ko) { text-autospace: no-autospace; }            /* CSSWG가 초기값을 바꿀 경우에 대비. 한글-한자 문제 미해결(#9979) */
pre, code, kbd, samp, textarea { text-autospace: no-autospace; }
```

- `text-autospace`는 Chrome 140, Firefox 145, Safari 18.4부터 지원한다.
- `text-spacing-trim`은 기본값으로 둔다. Pretendard에는 halt·chws 기능이 없어 효과가 없다.

### 7.8 숫자

- `font-variant-numeric: tabular-nums`을 다음에 적용한다: `td.id`, 날짜 열(created_on, updated_on, start_date, due_date, closed_on), 시간 열(estimated·spent·total), `td.done_ratio`, `.pagination`, `div.issue .attributes .value`, 저널 시각, `.query-totals .value`, `tr.group span.totals .value`.
- 본문은 코어처럼 proportional-nums를 유지한다.
- 숫자 설정은 항상 `font-variant-*`로 하고 `font-feature-settings`는 쓰지 않는다. `font-feature-settings`는 목록 전체를 덮어써 캐스케이드에서 합쳐지지 않는다.
- `--ravnus-font-feature-settings: normal`은 opt-in 훅이다. Pretendard 가독성 대체 글리프(cv05, cv08, cv13, ss06)를 켤 수 있다. 시각 효과는 확인 전이다 (미검증).

### 7.9 링크, 강조, 폼 컨트롤, 코드

- **링크**: `text-underline-offset: 0.2em; text-decoration-thickness: 1px`. Pretendard의 기본 밑줄은 받침 획과 0.01–0.02em밖에 떨어지지 않는다(글리프 계측).
  - **문장 속 링크는 평소에도 밑줄을 긋는다.** 밑줄 색은 `--ravnus-link-decoration`(link 75%, canvas 위 3.72:1)이다. 링크 색은 본문 글자와 2.53:1이라 색만으로는 WCAG 1.4.1(F73)에 걸린다.
  - 대상: `div.wiki a`, 일감 `p.author`와 저널 머리글의 작성자·시각 링크, 저널 `ul.journal-details`의 일감·첨부 링크(§8.4 9), `#activity dd`와 `#search-results dd`의 링크, 뉴스 요약. 셀렉터 목록은 Phase 5–6에서 7.0.2 마크업을 감사해 확정한다.
  - 표 셀, 사이드바, 메뉴, 탭, 페이지 번호, 버튼처럼 링크만 단독으로 있는 곳은 hover에서만 밑줄을 긋는다.
- **강조**: §4.11 추천을 따른다. ko·ja·zh UI의 본문 `em`은 `font-style: normal; font-weight: 600; background: var(--ravnus-em-bg)`, `strong`은 700이다 (미검증: 시안 비교).
- **폼 컨트롤**: `input, select, textarea, button { font-family: inherit; font-size: var(--ravnus-font-size-base); line-height: var(--ravnus-line-height-tight); }`. 코어 7은 폼 컨트롤에 font-family를 주지 않아(7.0.2 `application.css` 842–848행) 지금은 Arial 13.33px로 계산된다(2026-10-01 7.0.2 측정). `textarea.wiki-edit`는 prose 크기와 행간을 써서 쓰는 모습과 읽는 모습을 같게 한다. 900px 미만에서는 코어 `responsive.css`가 같은 명시도로 나중에 크기를 다시 선언하므로 §8.6 규칙으로 토큰에 연결한다.
- **코드**: `pre`, `code`, `.sample-data`, `body.textarea-monospace textarea.wiki-edit`에 `--ravnus-font-mono`를 준다. `pre`는 bg-inset, `--ravnus-radius`를 쓴다. 크기는 §7.2 코드 행을 따른다. Pygments 색은 v1에서 코어 그대로 둔다.

---

## 8. 레이아웃·밀도·컴포넌트 범위

§4.2 결정(기존 레이아웃 유지, 스타일만 변경, CSS만)을 따른다.

### 8.1 바꾸는 것과 유지하는 것

| 영역 | 바꾸는 것 | 유지하는 것 |
|---|---|---|
| 상단 메뉴 `#top-menu` | `--ravnus-topbar-height`(기본 2rem, 어두운 헤더 프리셋과 Calm은 1.75rem) 바, topbar 토큰(기본 `#46009B` 위 흰 글자), 13px, 아이콘 색, 바 안에 머무는 앰버 포커스 링. 배경은 7.0.2부터 코어 변수 재매핑으로도 칠해진다(§6.2) | 항목, 순서, 동작, 계정 드롭다운 |
| 헤더 `#header` | 평면 header-bg(기본 흰색. 7.0.2는 코어 변수 재매핑, 7.0.0–7.0.1은 셀렉터 폴백, §6.2), 상단 바·메뉴 바와의 경계 헤어라인(header-divider, §6.2), h1 22px/700, 브레드크럼 13px, 검색 필드와 `#project-jump` 트리거(canvas, 2rem, `--ravnus-radius`, header-control-border 테두리. 트리거의 필드 표면은 `@media (min-width: 900px)`로 한정하거나 모바일 규칙에서 `background: transparent; border: 0`을 다시 선언한다, §8.6). 헤더 안 글자·링크·아이콘·포커스는 모두 header 토큰으로 다시 칠한다. 대상 코어 규칙은 §8.4 12(데스크톱)와 §8.6(모바일) | 모든 요소의 위치 |
| 메인 메뉴 `#main-menu` | 전폭 연한 바 `nav-bg`(높이 `--ravnus-nav-height` 2.25rem). 탭은 14px/500 fg-muted, hover는 nav-hover-bg, 선택은 fg-default 600 + `inset 0 -3px 0 accent`(forced-colors에서는 테두리, §8.8). `.new-object`는 테두리 버튼, `.menu-children`은 오버레이 | 절대 위치 구조, 탭 순서, `.tabs-buttons` 넘침 버튼 |
| 사이드바 | bg-subtle 틴트(테두리 없음. 구분이 약하면 양쪽 `border-inline`을 border-muted로 주면 위치 토큰과 상관없이 동작, 미검증), h3 13px/600 fg-muted(대문자 변환 없음), 링크 13px/1.5, 선택 항목은 accent-subtle + accent 글자(10.81) + 3px 인라인 시작 마커(`border-inline-start`), 위치 토큰 | 코어 폭 단계, 접기 토글, localStorage 상태, 접힘 패딩 |
| 본문 `#content` | 패딩 20px 24px 16px, 본문 폭 제한 opt-in 토큰(위키·뉴스 본문 전용, 기본 none) | `overflow-x: auto` |
| 일감 목록 | 밀도, 글리프, 행 상태, 그룹 행·합계(§6.5), `th`(bg-subtle, 13px/600, fg-muted, 본문 행과 같은 높이), 행 구분선 border-muted | 열 구성, 정렬, 체크박스, `nowrap` 열 |
| 일감 상세 | `div.issue` 카드(bg-subtle, 1px border-default, radius-lg, 패딩 16px 20px), 제목 22px, 레이블 fg-muted 600. 저널 헤더는 bg-subtle, `--ravnus-radius`, `:target`은 accent-subtle, 비공개 노트는 3px danger 인라인 시작선(`border-inline-start`). `#sticky-issue-header`도 같은 토큰 | 2열 속성 그리드, 170px 레이블 폭(토큰화), 모든 요소 순서 |
| 폼·버튼 | 폰트 상속, 높이 2rem(표·필터 안은 1.75rem), radius, border-control, 포커스 링, 주 버튼 allowlist, 텍스트 입력 포커스 링 복원(코어 `input[type="text"]:focus, … {border: 1px solid var(--oc-blue-5); outline: none}`(7.0.2 876–884행, 명시도 0,2,1)이 outline을 없애므로 일반 `:focus-visible`(0,1,0)로는 이기지 못한다. 테마 규칙을 `input[type="text"]:focus-visible`처럼 0,2,1 이상으로 선언한다), `.btn-alert` 위험 스타일. `.tabular` 레이블의 고정 line-height를 풀어 긴 CJK 레이블이 줄바꿈되게 한다. 코어 `html>body .tabular p {overflow: hidden}`(7.0.2 1312행)은 세로 패딩이 3px뿐이라 입력 밖으로 4px 나오는 포커스 링의 위아래를 자른다. `overflow: visible; display: flow-root`로 바꿔 float 정리는 유지한다. 넓은 내용이 넘치는 곳이 생기는지 Phase 4에서 확인한다 (미검증) | `.tabular` 구조 |
| 메시지 | 플래시·오류·경고·충돌 박스를 역할 토큰과 `--ravnus-radius`로. `.nodata`는 중립(bg-subtle, fg-muted). 닫힌 프로젝트 `p.warning`. 코어 7의 메시지 아이콘은 마크업 안 SVG(`div.flash svg.icon-svg` 등, 7.0.2 1513–1565행)라 아이콘 색도 역할 토큰으로 칠한다 | 마크업 |
| 본문 내 탭 `#content .tabs` | 박스형 탭을 유지하고 색만 바꾼다(선택 탭은 canvas, fg-default 600). 코어는 `block-size: 2.6em`에 `overflow: hidden`이다(7.0.2 1810행). 그래서 탭 포커스 링이 잘리고, 고정 높이라 CJK 행간이나 WCAG 1.4.12 간격 덮어쓰기에서 글자가 잘릴 수 있다(소스에서 유도, 미검증). 탭 링크의 포커스 링은 안쪽(`outline-offset: -2px`)에 그린다. 높이는 (1) 절대 위치 `ul`을 정적 배치로 바꿔 auto로 두거나 (2) `lh` 단위로 계산한다. 탭 `ul`은 `min-inline-size: 100%; inline-size: max-content`(7.0.2 1811–1817행)라 탭 영역보다 넓어질 수 있다. 이를 가리는 overflow는 유지해야 하므로 Phase 6에서 프로브로 둘 중 하나를 고른다 (미검증) | 구조, 넘침 버튼 |
| 편집기 툴바 `.jstElements`, `.jstTabs`(편집·미리보기 탭), 도움말 링크 | 버튼 표면·테두리·hover·선택 상태를 토큰으로 바꾼다. 대체하는 코어 hover는 `.jstElements button:hover`의 `border-color`·`background-color`로, `var(--oc-gray-5)`·`var(--oc-gray-3)`(7.0.2 `jstoolbar.css` 69행부터)이다. 표 생성기의 선택·hover 셀(`.table-generator td.selected-cell, td:hover`, `var(--oc-blue-1)`, 97·98행)도 토큰으로. 포커스 링, 미리보기 탭은 본문 탭과 같은 규칙 | 버튼 아이콘과 도움말 링크 아이콘. 버튼 아이콘 `background-image: url()` 18개와 도움말 링크 `help.png` 1개(7.0.2 `jstoolbar.css` 88·109–166행)는 이미지라 다시 칠할 수 없다(§8.7) |
| 플로팅 레이어 | context menu, `#account .dropdown-content`, jQuery UI(autocomplete, dialog, datepicker, tooltip), tribute 멘션 목록에 `--ravnus-bg-overlay` 표면, border-default, radius, shadow-overlay를 준다. 툴팁은 inverse | 동작 |
| 로그인 | 박스(bg-subtle, radius-lg, shadow-raised. 코어 `#login-form`의 주황 oc-orange-1 #FFE8CC 대체, 7.0.2 381–389행), `#login-submit` 주 버튼 | 구조 |
| 모바일 (<900px) | 흰 모바일 헤더와 그 안 글자 재칠(코어 `responsive.css` 목록), 헤더 아래 헤어라인, flyout 색, 컨트롤 크기 연결(§8.6) | `responsive.js`의 DOM 이동 |
| 로드맵, 간트, 달력, 활동, 저장소, 관리 | 색만 다시 칠한다(진행 막대는 녹색 계열). 간트 제목 열은 크기·행간 규칙에서 뺀다(§7.2) | 구조 |
| forced-colors, 인쇄 | §8.8, §8.9 | 코어 `@media print`의 크롬 숨김 |
| Pygments, 위키 문법 도움말 | v1 유지. 도움말 페이지는 `wiki_syntax.css`를 확장자까지 붙여 링크하므로 테마로 바꿀 수 없다 | — |

### 8.2 CSS만 쓴다(theme.js 없음)

§4.2 결정에 따라 v1은 CSS만 쓰고 `javascripts/theme.js`를 두지 않는다. theme.js는 레이아웃 변경에 쓰지 않으므로 다음 재배치는 v2 이후에도 계획하지 않는다.
- 세로 내비 레일(`#main-menu`를 사이드바로 합치기)
- 상단 메뉴 항목을 헤더로 옮기기

다음은 레이아웃을 바꾸지 않지만 theme.js가 필요해 v1 범위 밖이고, v2 이후에 검토한다.
- 런타임 밀도 토글(토큰 값만 바꾸는 UI). 사이드바 위치는 §4.3 토큰과 §6.3 Left sidebar 프리셋으로만 바꾸고 theme.js 토글은 두지 않는다.
- 콘텐츠 언어 감지

JS가 DOM을 건드리면 `responsive.js`가 리사이즈 때마다 하는 detach/prepend와 공존해야 한다. 그래서 그때 따로 설계한다.

### 8.3 로드 순서 규칙

- 테마 `application.css`는 `dropdown.css`와 `responsive.css`보다 **먼저** 로드된다(7.0.2 `app/views/layouts/base.html.erb` 11행의 순서 `jquery-ui`, `tribute`, `application`, `dropdown`, `responsive`. 테마가 있으면 `application` 자리에 테마 CSS가 온다. 2026-10-01 7.0.2 응답의 `<link>` 순서로도 확인). 그 뒤에 페이지별로 `context_menu.css`, `jstoolbar.css`, `gantt.css`, `scm.css`가 온다. 명시도가 같으면 코어 규칙이 이긴다.
- 이 파일들을 덮는 규칙은 셀렉터를 한 단계 높인다. 검증된 예로, 모바일 토글에서 `body #header .mobile-toggle-button`은 지고 `body #header a.mobile-toggle-button`은 이긴다(7.0.1에서 확인. 상대 규칙인 `responsive.css` 110–112행 `#header a.mobile-toggle-button`은 7.0.2와 같다).
- 나중에 로드되는 코어 CSS가 **읽기만 하는** 코어 변수(7.0.2 `responsive.css`의 `--color-header-background`·`--color-top-menu-background`)는 로드 순서와 상관없이 테마의 `:root` 재매핑을 따른다(§6.2 브리지).
- `!important`는 코어가 쓴 곳에만 쓴다. `.context-menu-selection` 계열과, 프로젝트 이동 목록 `#project-jump .drdn-items>*`와 그 hover(7.0.2 `application.css` 546–547행)다. 프로젝트 이동 목록 항목과 hover는 overlay 토큰으로 `!important` 재선언한다(코어 hover 명암은 흰 글자/blue-7 #1C7ED6 4.20:1로 AA 미달). 이 둘은 §10.2 3 계산 스타일 assert에 넣는다.
- 명시도가 높은 `:has()` 규칙으로 자기 모바일 리셋을 덮지 않는다.
- 사용자가 덮을 행 단위 기본값은 반대로 명시도 0으로 둔다(§5.6).

### 8.4 Redmine 7.0.x 패치 차이

2026-10-01 지원 범위가 Redmine 7.x 전용으로 바뀌어(§4.12) 6.1·7.0 차이 처리 목록은 없앴다. 이 절은 테스트 기준 7.0.2와 앞선 패치(7.0.0–7.0.1)의 차이, 테마가 덮는 코어 7 기준선(항목 1–11), 흰 헤더 재칠 목록(항목 12)을 다룬다. 다른 절이 항목 번호(§8.4 3, 5, 12)로 참조하므로 번호는 유지한다. 행 번호는 `redmine:7.0.2` 이미지에서 읽었고, 파일을 따로 적지 않으면 `app/assets/stylesheets/application.css`다.

**7.0.1 → 7.0.2 코어 변경 (크롬 관련)**: 7.0.2는 2026-10-01 릴리스다. `redmine:7.0.1`과 `redmine:7.0.2` 이미지의 `app`, `lib`, `config`를 꺼내 `diff -rq`로 바뀐 파일을 찾은 뒤 내용을 비교했다. Propshaft는 두 이미지 모두 1.3.2다(`Gemfile.lock`).

| 위치 (7.0.2) | 7.0.1 | 7.0.2 | 테마 처리 |
|---|---|---|---|
| `:root`(41–47행) | `--fonts-main`, `--color-current-marker`만 있다(41–44행) | `--color-top-menu-background: #234761`, `--color-header-background: #3A78A3`를 더했다 | 두 변수를 topbar-bg·header-bg로 재매핑한다(항목 5, §6.2 브리지) |
| `nav.top-menu` 배경(92행) | `#234761` 하드코딩(80행) | `var(--color-top-menu-background)` | 7.0.2는 재매핑으로 topbar-bg. 7.0.0–7.0.1은 셀렉터 폴백 |
| `#header` 배경(152행) | `#3A78A3` 하드코딩(136행) | `var(--color-header-background)` | 7.0.2는 재매핑으로 header-bg. 7.0.0–7.0.1은 셀렉터 폴백 |
| `responsive.css` 모바일 `#header`(99행) | `#628db6` | `var(--color-header-background)` | 7.0.2에서는 재매핑만으로 header-bg가 된다. 테마의 모바일 배경 선언은 7.0.0–7.0.1 폴백이다(§8.6) |
| `responsive.css` `.flyout-menu` 표면(288행) | `#3e5b76` | `var(--color-top-menu-background)` | 같은 방식(topbar-bg) |
| `responsive.css` `.flyout-menu h3`(308·309행) | 위아래 선 `#506a83`, 띠 `#628db6` | 선은 top-menu 변수, 띠는 header 변수 | 띠는 7.0.2에서 재매핑으로 header-bg. 선은 이 문서가 header-divider로 정하므로 7.0.2에서도 셀렉터로 덮는다 |
| `body`(51–60행) | 한 줄 규칙 | `position: relative` 추가(Tribute 5.1.3 멘션 메뉴 위치 보정, 코어 주석 #44408) | 테마는 `body`의 position을 바꾸지 않는다 |
| 상단 바 링크·계정 트리거 hover(117–122행) | — | `border-radius: 3px` 추가(121행) | hover 배경 모양만 바뀐다. 테마의 상단 바 hover 규칙은 radius를 명시해 패치에 따라 달라지지 않게 한다 |
| `.profile-menu`(134행) | 규칙 없음 | `display: flex; align-items: center; min-block-size: 28px`(로그인 전후 상단 바 높이를 같게 하려는 예약) | 익명 상단 바가 7.0.1 16.5px에서 7.0.2 28px로 커졌다(2026-10-01 로컬 도커, 코어 기본 테마, 1440px 측정. §4.1). 테마는 `--ravnus-topbar-height`(기본 2rem, 프리셋 1.75rem = 28px)를 `min-block-size`로 주므로 이 예약은 그 안에 든다 |
| `#main-menu`(215–225행), `#main-menu ul`(226–234행), `#main-menu li a`(244–257행) | 바 padding-block 2px, `ul` min-block-size 28px, 탭 padding-block 7px 5px, line-height 1.2 | 바 padding-block 0, `ul` 32px, 탭 padding-block 9px 7px, line-height 16px | 바 높이는 둘 다 32px다(2026-10-01 측정). 7.0.2에서는 탭이 바 높이를 채워 본문에 닿는다(7.0.1 탭 27.6px). 테마는 바·탭 치수를 토큰으로 명시해 이 차이를 덮는다(항목 3) |

- 같은 비교에서 `dropdown.css`, `open-color.css`, `context_menu.css`, `jstoolbar.css`, `gantt.css`, `scm.css`, `lib/redmine/asset_path.rb`, `config/initializers/10-patches.rb`·`30-redmine.rb`, `app/views/layouts/base.html.erb`, `app/helpers/application_helper.rb`는 바뀌지 않았다.
- `lib/redmine/themes.rb`는 테마 아이콘 이름 목록을 메모이즈하는 변경뿐이다(`asset_paths`는 그대로이고 7.0.1의 124–132행에서 131–139행으로 옮겨졌다).
- `app/helpers/icons_helper.rb`는 요청마다 테마 아이콘 이름 집합(`theme_icon_set`)과 스프라이트 `asset_path`를 한 번만 구해 메모이즈하도록 바뀌었다. §4.7의 테마 스프라이트 경로가 지나는 곳이지만 출력하는 `<use href>`와 셀렉터는 그대로라 테마가 칠하는 곳에는 영향이 없고, v2 테마 스프라이트(§4.7)를 검토할 때만 관계있다.
- 크롬 밖 마크업 변경으로는 프로젝트 목록 행의 `hascontextmenu` 클래스가 관리 목록에만 붙게 됐다(`app/views/projects/_list.html.erb` 43행). 테마는 이 클래스를 기준으로 칠하지 않는다. 그 밖의 변경(웹훅 관리 화면, 모델·컨트롤러, 로캘, `application-legacy.js`의 jQuery UI sortable 성능 보정 등)은 테마가 칠하는 셀렉터와 관계없다고 본다 (미검증: Phase 8 화면 검토에서 확인).
- 행 번호: `application.css`는 위 변경 때문에 행이 밀려, 메인 메뉴 규칙 뒤로는 7.0.1보다 17행 크다. `responsive.css`는 값만 바뀌어 행 번호가 같다.

**7.0.0–7.0.1 대응(헤더 변수 없음)**: 테마의 재매핑 선언은 정의되지 않은 변수를 선언만 하는 것이라 효과도 해도 없다. 배경은 다음 셀렉터 폴백이 칠한다. 데스크톱은 `#header`(background 약식, header-bg)와 `#top-menu`(topbar-bg)다. 900px 미만은 `@media screen and (max-width: 899px)` 안의 `html body #header`(header-bg), `html body .flyout-menu`(topbar-bg), `html body .flyout-menu h3`(header-bg)다. 7.0.0–7.0.1의 `responsive.css`는 테마보다 나중에 로드되고 같은 미디어 쿼리 안에서 `#header`(1,0,0), `.flyout-menu`(0,1,0), `.flyout-menu h3`(0,1,1)에 하드코딩 배경을 주므로, 모바일 폴백 셋은 §8.3대로 명시도를 높인다(같은 명시도의 `.flyout-menu`로 쓰면 7.0.0–7.0.1에서 코어가 이긴다). 7.0.2에서는 폴백과 변수가 같은 토큰 값을 주므로 결과가 같다. 폴백은 지원 범위의 하한이 7.0.2 이상으로 오를 때 지운다. Phase 0 10c에서 7.0.1 코어에는 두 변수가 없고, 같은 `:root` 재매핑을 주입해도 크롬 배경이 코어 값 그대로임을 확인했다(`#header` #3A78A3, `nav.top-menu` #234761, 800px 모바일 `#header` #628db6, `.flyout-menu` #3e5b76, h3 띠 #628db6). 폴백 자체는 Phase 2의 7.0.1 spot check(§10.4)에서 확인한다 (미검증). 7.0.0은 확인하지 않았다 (미검증: 변수가 7.0.2에서 추가됐으므로 7.0.0에도 없을 것으로 본다). 메인 메뉴 치수와 `.profile-menu` 차이는 항목 1·3처럼 테마가 치수를 명시해 덮으므로 패치와 상관없이 같은 모습일 것으로 본다 (미검증: 7.0.1 spot check(§10.4)의 크롬 높이로 확인).

**코어 7 기준선과 테마 처리**

1. **상단 메뉴**: `nav.top-menu#top-menu`(flex, `.top-menu__links`, `.profile-menu > #account.dropdown`, 0.75rem, 91–99행)다. 익명이면 `#account`가 `.top-menu__links` 목록이고, 로그인하면 아바타 트리거와 `.dropdown-content` 오버레이다(`base.html.erb` 59–88행). 테마는 `#top-menu`와 `#account`를 기준으로 칠하고, 높이는 `--ravnus-topbar-height`로 정한다. 계정 드롭다운 표면은 `dropdown.css`보다 명시도를 높인다. 7.0.2의 hover radius와 `.profile-menu` 예약은 위 표다.
   - 로그인 상태(Phase 0 7a, 7.0.2, admin, 1440·800px): `#top-menu`는 익명과 로그인 모두 28px이고 `#header`는 90px다. 트리거 `#account a.dropdown-trigger`(아바타와 셰브런, 52×28)에는 `aria-expanded`가 없어 열림 상태를 ARIA로 잡을 수 없다. 펼치면 `.dropdown-content`에서 `hidden` 클래스가 빠지고(코어 `.hidden {display: none}`, 7.0.2 406행. 열림 상태는 `#account .dropdown-content:not(.hidden)`으로 잡는다), 바깥을 누르거나 Esc를 누르면 닫힌다. 드롭다운의 코어 표면(배경 `#fff`, radius 4px, 그림자 `0 4px 6px rgba(0,0,0,.1)`, z-index 1000)은 테마가 overlay 토큰으로 다시 칠하는 대상이다(§8.1 플로팅 레이어). 800px에서는 `#top-menu`가 숨고 `#header`가 64px다.
2. **헤더**: `#header`(150–157행)는 `background: var(--color-header-background)`(7.0.1은 하드코딩), padding-block 0.25rem 0, padding-inline 1.25rem이다. h1은 flex column에 min-block-size 2.75rem과 line-height 1.15(163–176행), `#quick-search`는 min-block-size 2.75rem(190–196행)이다. 테마는 헤더 치수를 토큰 값으로 명시한다. 코어 7 헤더 높이는 메뉴 바 예약을 포함해 90px다(7.0.1·7.0.2 같음, 2026-10-01 측정). 헤더 글자와 링크는 코어가 밝게 두므로, 흰 헤더(기본 Signature)에서 다시 칠할 규칙은 항목 12에 모았다.
3. **메인 메뉴**: 코어는 헤더 아래쪽에 절대 위치한 전폭 바(`inset-inline: 0`, padding-inline 20px, 배경 indigo-0, 215–225행)이고, 바 높이는 32px다(7.0.2 변경은 위 표). 테마는 `inset-inline: 0; margin: 0; inline-size: auto`와 토큰으로 바를 다시 정하고, 탭 링크의 padding·line-height도 토큰으로 명시해 패치 차이를 덮는다. 헤더의 메뉴 공간 예약은 코어 `body.has-main-menu #header {padding-block-end: 2rem}`(158–160행, 7.0.1은 142–144행)를 `body.has-main-menu #header { padding-block-end: var(--ravnus-nav-height) }`로 바꾼다. `#main-menu`는 `box-sizing: border-box`로 두고 블록 크기를 nav-height로 준다. 코어는 box-sizing을 주지 않으므로(215–225행) 그대로 두면 위아래 경계선(§6.2) 2px만큼 절대 위치 메뉴가 예약 패딩보다 커진다. 예약 패딩의 nav-height는 선을 포함한 값이다. `has-main-menu` 클래스는 코어가 준다(`app/helpers/application_helper.rb` 920행. 2026-10-01 7.0.2 익명 `/projects` 응답의 `<body>` class로도 확인). `:has()` 폴백은 쓰지 않는다.
4. **논리 속성과 방향**: 코어 7은 논리 속성(`padding-inline-start` 등)을 쓰고, `<html>`에 `dir`을 준다(`base.html.erb` 2행, RTL 로캘에서 `rtl`, §10.4). 테마도 논리 속성으로 쓰고, 방향이 필요한 표현(행 마커, 인라인 시작선)은 `[dir=rtl]` 셀렉터 대신 논리 속성으로 쓴다. 같은 박스 면에 대한 논리·물리 선언은 캐스케이드 순서로 정해진다.
5. **색과 코어 변수**: 코어 `application.css`는 Open Color 팔레트 변수 `--oc-*`(`open-color.css`)를 342회 쓰고, Pygments(`.syntaxhl`) 밖의 hex는 상단 바·헤더 배경 2개뿐이다. 7.0.2는 이 둘을 `:root`의 의미 변수로 옮겼다. 그래서 코어가 이름 붙인 의미 변수는 넷이다. `--fonts-main`(본문·제목·위키 편집기 폰트), `--color-current-marker`(선택 탭·사이드바 선택 항목의 인셋 마커, 달력 오늘 표시. 267·432·1698행), `--color-header-background`, `--color-top-menu-background`(7.0.2부터, 쓰는 곳은 §6.2 브리지)다.
   - 테마는 넷을 일반 `:root`에서 `--ravnus-*` 토큰으로 재매핑한다(§4.5). `--fonts-main`은 font-ui, `--color-current-marker`는 accent, `--color-header-background`는 header-bg, `--color-top-menu-background`는 topbar-bg다.
   - 싣는 시점: `--fonts-main`과 `--color-current-marker`는 Phase 1(v0.1.0)이다. 두 크롬 배경 변수의 재매핑은 흰 헤더 재칠(항목 12)과 §8.6 전체(모바일 헤더, flyout 글자·h3, "밝은 flyout")와 함께 Phase 2(v0.2.0)의 `_chrome.scss`에만 싣고 v0.1.0에는 넣지 않는다. 재매핑만 먼저 실으면 7.0.2에서 헤더 배경이 header-bg(흰색)가 되는데 코어 `#header`의 `color: var(--oc-white)`(153행)와 `#header a`의 gray-0(161행)이 남아 헤더 글자가 보이지 않는다. flyout h3 띠와 Calm 프리셋의 flyout 표면도 같은 이유다(§4.5).
   - 브리지가 칠하는 곳과 칠하지 않는 곳은 §6.2 "코어 변수 브리지"다. 변수가 없는 7.0.0–7.0.1의 배경은 위 셀렉터 폴백이 칠한다.
   - `--oc-*`는 의미가 아니라 팔레트 단계 이름이라 재매핑하지 않는다. 한 단계가 본문·크롬·배지 등 여러 역할에 쓰여 재매핑하면 코어 전체가 예측할 수 없이 바뀐다. 테마는 명시 셀렉터에 `--ravnus-*`를 준다.
6. **코어 CSS 파일**: 전역 `dropdown.css`(55줄)와 페이지별 `context_menu.css`, `jstoolbar.css`, `gantt.css`(간트), `scm.css`가 있다. 모두 7.0.1과 7.0.2가 같다. 로드 순서는 §8.3이다.
7. **크롬·뉴스 코어 클래스**: `.top-menu*`, `.dropdown*`, `.profile-menu`, `.current-project`(185–188행. 마크업은 `application_helper.rb` 857행), `#new-object`(243행), `.news-article`(2500행부터). 이 클래스들을 직접 스타일한다.
8. **컴포넌트 기준선**: `div.issue`(테두리 없음, 배경 oc-yellow-0, 16px 패딩, radius 3px, 901–906행, `div.issue.details > hr` 929행), `.box`(그림자 없음, 814행부터), 입력(padding 4px 7px, 842–848행), `#content`(padding-block 18px 10px, padding-inline 20px, 366–373행), 사이드바 선택 항목(indigo-1 배경, indigo-9 글자, current-marker 3px 인셋, 425–433행). 테마는 이 속성들을 모두 명시해 기준선을 덮는다.
9. **저널·반응·히스토리 탭**: 7.0에서 크게 바뀐 영역이다(Opale #27이 7에서 깨진 곳). 7.0.1→7.0.2에서 이 영역의 뷰·헬퍼 HTML 변경은 없다(`issues_helper.rb`의 변경은 API 응답의 하위 일감 목록뿐이다). Phase 0 7b에서 로그인 상태의 7.0.2 마크업을 캡처했고(`/issues/4`의 네 탭, 비공개 노트가 있는 `/issues/10`, 인라인 편집과 `/issues/4/edit`), Phase 4는 다음 셀렉터를 기준으로 한다. 캡처 파일은 저장소에 싣지 않는다.
   - 저널: `div.journal.has-notes.has-details#change-N > div.note#note-N` 안에 `h4.journal-header`(`.journal-info`, `.journal-meta > .journal-actions`, `a.journal-link`)와 `div.journal-content`(`ul.journal-details`, `div.wiki.journal-note`)가 있다(`app/views/issues/tabs/_history.html.erb` 8–40행, 노트 본문은 `app/helpers/journals_helper.rb` 73행).
   - 비공개 노트는 `.private-notes`, 작업시간 탭 항목은 `div.time_entry.journal`이다. 속성 탭은 노트만 있는 저널을 숨긴다.
   - 편집 폼의 입력과 셀렉트는 Arial 13.33px, 높이 25px다. 인라인 편집으로 이동하면 sticky 일감 헤더가 폼 위를 가린다(§8.5, Phase 4).
10. **아이콘**: 코어 스프라이트는 118개 심볼이다(`app/assets/images/icons.svg`). 다시 칠하기만 하므로 패치 차이의 영향이 없다.
11. **이미지**: `application.css`의 고유 `url()`은 14개(폰트·open-color 포함)이고 7.0.1과 같다. 칠할 수 없는 이미지는 §8.7이다.
12. **헤더의 밝은 글자 전제(흰 헤더 재칠 목록, 데스크톱)**: 코어 7은 헤더를 어두운 파랑으로 칠하고 그 위 글자와 링크를 밝게 둔다. 기본 크롬 Signature의 헤더는 흰색이므로 배경은 코어 변수 재매핑(7.0.2)과 셀렉터 폴백(7.0.0–7.0.1)으로, 나머지는 아래 규칙을 header 토큰으로 다시 선언해 칠한다. A(Ink)에서는 규칙을 놓쳐도 어두운 헤더 위 밝은 글자라 드러나지 않지만, 흰 헤더에서는 흰 바탕에 흰 글자가 되어 보이지 않는다. 그래서 Phase 2에서 요소마다 계산 스타일을 assert한다(§10.2 3). 행 번호는 `redmine:7.0.2` 이미지의 `app/assets/stylesheets/application.css`이고, 모바일(`responsive.css`) 목록은 §8.6이다.

    | 대상 | 코어 7.0.2 | 테마 처리 |
    |---|---|---|
    | 헤더 배경과 상속 글자색(h1의 앱 제목, 현재 프로젝트명, 브레드크럼 구분자 `span.separator`, 검색 레이블의 ":") | `#header` 150–157행: `background: var(--color-header-background)`(152행. 7.0.1은 136행 `#3A78A3`), `color: var(--oc-white)`(153행) | 배경은 7.0.2에서 변수 재매핑이 header-bg로 바꾸고, 7.0.0–7.0.1을 위해 `background` 약식으로도 header-bg를 준다. `color`는 header-fg |
    | 헤더 링크(브레드크럼의 상위 프로젝트 `a.root`·`a.ancestor`, 빠른 검색 레이블의 "검색" 링크) | `#header a {color: var(--oc-gray-0)}`(161행, #F8F9FA, 흰 헤더와 1.05:1), `#header a:hover {color: var(--oc-white)}`(162행) | `#header a`는 header-fg-muted, hover는 header-fg와 밑줄, `:focus-visible`은 header-focus. 이 hover 밑줄(`#header a:hover`, 1,1,1)은 코어 `.mobile-toggle-button:hover, :active {text-decoration: none}`(`responsive.css` 255–258행, 0,2,0)을 이기므로, 모바일 메뉴 토글에서는 밑줄을 다시 지운다(§8.6 메뉴 토글 행) |
    | 브레드크럼 `#header h1 .breadcrumbs` | 177–184행(색 없음, 153행 상속) | header-fg-muted |
    | 현재 프로젝트명 `#header h1 .current-project` | 185–188행(말줄임만, 색 없음, 153행 상속) | header-fg |
    | 빠른 검색 레이블 `#quick-search form label` | 207–212행(색 없음, 153행 상속) | header-fg-muted |
    | 빠른 검색 입력 `#quick-search #q` | 197–204행 `border: 1px solid var(--oc-gray-4)`(202행, #CED4DA, 흰 헤더와 1.49:1) | 어두운 헤더에서는 흰 필드 자체가 경계였다. 테두리를 header-control-border(4.12)로 |
    | 텍스트 입력 포커스(검색 입력 `#q`에 적용) | 876–884행 `input[type="text"]:focus, … {border: 1px solid var(--oc-blue-5); outline: none}`(`outline: none` 883행). 명시도 0,2,1 | 일반 `:focus-visible`(0,1,0)로는 outline을 되살리지 못한다. `#quick-search #q:focus-visible`처럼 0,2,1 이상으로 header-focus outline을 선언한다. 테두리는 코어처럼 `#quick-search #q`(2,0,0)가 포커스 때도 이기므로 header-control-border 그대로다. 본문 입력에도 같은 코어 규칙이 걸린다(§8.1 폼·버튼) |
    | 프로젝트 이동 트리거 `#project-jump .drdn-trigger` | 531–543행: `border:1px solid var(--oc-gray-4)`(538행), `color:var(--oc-gray-7)`(541행), `background:var(--oc-white) url(/chevron-down.svg)`(542행) | 테두리는 header-control-border. 글자는 canvas 필드 위이므로 폼 컨트롤 규칙(fg-default)을 따른다. 필드 표면(canvas 배경, 테두리, 화살표 이미지)은 `@media (min-width: 900px)`로 한정하거나 모바일 규칙에서 `background: transparent; border: 0`을 다시 선언한다. 코어 모바일 규칙(§8.6, 명시도 1,1,0)보다 높은 명시도로 필드 표면을 주면 모바일에서 canvas 배경이 남는다. 흰 헤더에서는 드러나지 않지만 헤더가 어두운 프리셋에서는 header-fg(#FFFFFF) 제목이 흰 canvas 위에 놓여 1.0:1이 된다. 트리거는 tabindex 없는 `span`이라(`application_helper.rb` 618행) click 처리만 있고(`application-legacy.js` 898행) 키보드 포커스를 받지 않는다. 펼친 뒤 포커스는 오버레이 안 `#projects-quick-search`(focus-ring)로 간다 |
    | 펼침 화살표 | `url(/chevron-down.svg)`(542행), 펼친 상태 `url(/arrow_up.png)`(544행) | `url()` 이미지라 다시 칠할 수 없지만 canvas 필드 안에 있어 헤더 색과 상관없다. 그대로 둔다(§8.7) |
    | 헤더 아이콘 | 헤더 전용 규칙 없음. 전역 `svg.icon-svg {stroke: var(--oc-gray-8)}`(2245–2250행) | 코어 헤더에서 메뉴 바와 오버레이 밖에 놓이는 아이콘은 없다. 플러그인 대비로 `#header svg.icon-svg` stroke와 `#header svg.icon-svg-filled` fill에 header-icon(hover header-fg)을 준다 |

    - **일반 자손 규칙의 범위**: `#header a`, `#header svg.icon-svg` 같은 일반 자손 규칙은 메인 메뉴 바(`#main-menu`, nav 토큰)와 헤더 안 오버레이(`#project-jump .drdn-content`, overlay 표면)를 빼고 적용한다. 그렇지 않으면 어두운 헤더 프리셋에서 흰 header-fg·밝은 header-icon이 흰 오버레이나 연한 메뉴 바로 새어 들어간다. 예: 프로젝트 이동 목록의 검색 아이콘(`application_helper.rb` 627행), 메뉴 넘침 버튼 아이콘(`button.tab-left/right svg.icon-svg`, 1885–1888행 gray-6). 검색 입력, 프로젝트 이동 트리거처럼 canvas 표면을 가진 헤더 안 컨트롤도 크롬 표면이 아니므로 글자는 폼 컨트롤 규칙을 따른다. 상단 바도 같다. 상단 바의 일반 자손 규칙(`#top-menu a`, 아이콘 stroke)과 topbar-focus는 `#account .dropdown-content`(overlay 표면)를 빼고 적용한다. 드롭다운 항목은 overlay·focus-ring(accent) 규칙을 따른다(§6.2). 이 드롭다운은 `#top-menu` 안의 흰 오버레이이고(`dropdown.css` 20–31행) 코어는 항목 링크에 색을 주지 않는다(39–45행). 그래서 `#top-menu a` 규칙(1,0,1)이 그대로 닿으면 항목이 흰 바탕에 흰 글자가 되고, 앰버 링은 흰 오버레이 위에서 1.94:1이다.
    - **흰 헤더 전용이 아닌 것**: 코어 메인 메뉴는 이미 연한 바다(`#main-menu li a` 244–257행, gray-8 글자). 테마는 크롬 선택과 상관없이 nav 토큰으로 덮는다(§8.1). 상단 바 규칙(`nav.top-menu` 91–99행 배경 `--color-top-menu-background`·글자 gray-2, `.top-menu__links a`·`#account .dropdown-trigger` 108–115행과 hover 117–122행, 아이콘 stroke 124–131행)도 밝은 글자를 전제하지만, Signature의 상단 바는 `#46009B`로 어두우므로 그 전제가 유지된다. 테마는 이 규칙들을 topbar 토큰으로 다시 칠한다(배경은 7.0.2에서 재매핑으로도 바뀐다). 상단 바가 연한 Calm 프리셋(bg-subtle #FAF9FC)에서는 이 전제가 뒤집히므로, 코어가 테마의 `#top-menu a`(1,0,1)보다 높은 명시도로 색을 주는 규칙을 놓치면 안 된다. 계정 드롭다운 트리거다. `#account .dropdown-trigger`(108–115행, 1,1,0, gray-1 글자), 그 hover(117–122행, 1,2,0, 흰 글자와 `rgba(255,255,255,0.12)` 배경, 7.0.2부터 radius 3px), `#account .dropdown-trigger .icon-svg`(124–127행, 1,2,0, gray-1 stroke), hover 아이콘(129–131행, 1,3,0, 흰 stroke)이다. 테마는 `#top-menu #account .dropdown-trigger`(2,1,0)와 hover(2,2,0)에 topbar-fg, `#top-menu #account .dropdown-trigger .icon-svg`(2,2,0)와 hover 아이콘(2,3,0)에 topbar-fg stroke를 준다. 이렇게 하지 않으면 gray-1(#F1F3F5) 글자·아이콘이 Calm 상단 바 위에서 1.06:1로 보이지 않는다. Signature에서는 gray-1이 보라 위 10.89:1로 읽히지만 토큰 색이 아니다. hover 배경(흰색 12%)은 Calm에서 보이지 않을 뿐 글자를 가리지 않으므로 둔다.
    - **관계없는 파일**: `dropdown.css`(전체 55줄)에는 `#header` 규칙이 없고 상단 바 계정 드롭다운과 `.dropdown-content` 오버레이만 다룬다.
    - **헤더 안 플러그인 콘텐츠**: 레이아웃(`app/views/layouts/base.html.erb`, `#header`는 90행부터)은 `#header` 안에 훅 출력 지점이 없다. 플러그인은 메뉴 API로 `#main-menu`에 항목을 넣거나(nav 규칙이 칠한다), 훅으로 넣은 JS·CSS로 헤더에 요소를 더하거나 색을 바꿀 수 있다. `view_layouts_base_html_head` 훅은 테마 스타일시트(11행의 `application`)와 `heads_for_theme`(14행) 뒤인 17행에서 출력된다. 그래서 이 훅의 CSS는 같은 명시도에서 테마의 `#header a` 등을 이긴다. `view_layouts_base_body_top`·`view_layouts_base_body_bottom` 훅(22·167행)으로 넣은 JS도 헤더를 바꿀 수 있다. 이런 콘텐츠가 밝은 글자를 직접 지정하면 흰 헤더에서 읽히지 않는다 (미검증: 개별 플러그인을 시험하지 않았다). 플러그인이 코어 변수 `--color-header-background`를 직접 쓰면 7.0.2에서는 테마의 header-bg를 따른다. 대응은 §11이다.

### 8.5 밀도·간격·라운드·그림자

- **간격**(4px 그리드): `--ravnus-space-025` 2px, `-050` 4px, `-075` 6px, `-100` 8px, `-150` 12px, `-200` 16px, `-250` 20px, `-300` 24px, `-400` 32px.
- **높이**:
  - 일감 목록 행은 제목 14px × 1.45 + 6px × 2 ≈ 32px다. 헤더 행도 같은 높이다(Carbon 규칙).
  - 컨트롤은 `--ravnus-control-height` 2rem, `-sm` 1.75rem이다.
  - 상단 바는 min-block-size `--ravnus-topbar-height`(기본 Signature 2rem, 어두운 헤더 프리셋과 Calm은 1.75rem), 메인 메뉴는 2.25rem이다(`box-sizing: border-box`라 위아래 경계선 포함, 헤더 예약 패딩과 같은 값, §8.4 3). 크롬 합계는 프로토타입에서 기본 B 약 120px(상단 바 32 + 헤더 88, 헤더 안 메뉴 바 36 포함), 상단 바 28px인 A·C·D 116px였다(§4.1) (미검증: Phase 2에서 최종 CSS로 재측정).
  - 텍스트 크기를 키우거나 WCAG 1.4.12 간격을 덮어써도 잘리지 않도록 크롬 높이는 고정 px가 아니라 rem과 `min-block-size`로 준다.
- **라운드**: `--ravnus-radius-sm` 3px(인라인 코드, 작은 태그, 사이드바 항목), `--ravnus-radius`(노브) 6px(버튼, 입력, 헤더 검색 필드, 플래시·메시지, `.box`, 저널 헤더, `pre`, 드롭다운), `--ravnus-radius-lg` 8px(`div.issue`, 로그인, 대화상자), `--ravnus-radius-full` 9999px(배지, 점).
- **그림자**: 본문은 테두리와 틴트로만 구분하고, 그림자는 떠 있는 레이어에만 쓴다. `--ravnus-shadow-color: var(--ravnus-fg-default)`로 두고 다크에서는 재정의한다. 그림자에 의미를 싣지 않는다(forced-colors에서 사라짐).
  - `--ravnus-shadow-raised`: `0 1px 2px` 6%, `0 1px 3px` 10%. 로그인 박스, sticky 헤더.
  - `--ravnus-shadow-overlay`: `0 8px 24px` 12%, `0 2px 6px` 8%. context menu, 드롭다운, `.menu-children`, 자동완성, 대화상자, 툴팁.
- **sticky 일감 헤더**: 표면은 `--ravnus-bg-raised`와 `--ravnus-shadow-raised`다. 코어는 일감 상세의 앵커(`div.wiki a[name]`, `#history div[id^="note-"]`, `div[id^="change-"]`, `#update`)에 `scroll-margin`을 고정값으로 준다. 데스크톱 50px(7.0.2 `application.css` 1028–1033행), 900px 미만 114px(`responsive.css` 871–876행)다. 테마는 `--ravnus-sticky-header-block-size`를 기본 50px, 900px 미만 114px로 선언하고, 같은 앵커의 `scroll-margin-block-start`를 이 토큰으로 다시 선언한다(`responsive.css`는 나중에 로드되므로 §8.3대로 명시도를 높인다). 테마가 sticky 헤더의 글자 크기나 패딩을 바꾸면 Phase 4에서 실측해 기본값을 고친다 (미검증: 테마 적용 후 높이). WCAG 2.4.11 대응이다.

### 8.6 모바일 (<900px)

- **헤더**: 코어 `responsive.css`의 모바일 헤더 배경은 7.0.2부터 `var(--color-header-background)`라 테마의 재매핑(§6.2)만으로 header-bg가 된다. 7.0.0–7.0.1은 #628db6을 하드코딩하고 테마보다 나중에 로드되므로, `@media screen and (max-width: 899px)` 안에서 `html body #header`에 header-bg를 주는 배경 폴백을 둔다. 데스크톱용 메뉴 공간 예약 패딩은 0으로 되돌린다. 코어도 2rem 예약이 모바일까지 새지만 `#project-jump`가 절대 위치라 드러나지 않을 뿐이다. 900px 미만에서는 `#top-menu`가 숨으므로(`responsive.css` 116–119행) 같은 셀렉터에서 `border-block-start: 0`을 다시 선언하고 아래 선(header-divider)만 둔다. 그래야 border-box 64px 안의 절대 위치 `#project-jump.drdn`과 메뉴 토글이 어긋나지 않는다(소스에서 유도, 미검증).
- **흰 모바일 헤더**: 기본 Signature에서는 800px 헤더도 흰색이다. 코어 모바일 헤더는 어두운 파랑 위 흰 글자를 전제하므로 아래 규칙을 모두 다시 칠한다(§8.3대로 명시도를 높인다). 흰 헤더가 흰 본문 위에 고정되므로 헤더 아래에 header-divider `border-block-end`를 준다. 이 미디어 쿼리 안에서 코어가 모든 요소에 `box-sizing: border-box`(`responsive.css` 44–50행)를 주므로 선을 더해도 헤더 높이 64px는 그대로이고 sticky 일감 헤더의 64px 오프셋(867행 `inset-block-start`)과 어긋나지 않는다 (소스에서 유도, 미검증: Phase 2에서 800px로 확인). 행 번호는 7.0.2 `app/assets/stylesheets/responsive.css`이고(7.0.1과 행 번호가 같다) 모두 34행에서 시작하는 `@media screen and (max-width: 899px)` 안이다. "7.0.2 변수 브리지" 열은 코어 변수 재매핑(§6.2)이 그 행을 칠하는지다.

  | 대상 | 코어 7.0.2 | 7.0.2 변수 브리지 | 테마 처리 |
  |---|---|---|---|
  | 모바일 헤더 `#header` | 92–102행: `border: none`(98행), `background-color: var(--color-header-background)`(99행. 7.0.1은 `#628db6`) | 배경을 칠한다 | 7.0.2에서는 재매핑이 header-bg를 준다. 7.0.0–7.0.1용 배경 폴백(`html body #header`)과 헤더 아래 header-divider 선은 둔다 |
  | 메뉴 토글 `#header a.mobile-toggle-button`(`:after`의 "≡"·"×" 글자) | 110–112행 `color: var(--oc-gray-0)`. hover·active 밑줄 제거는 255–258행 `.mobile-toggle-button:hover, .mobile-toggle-button:active {text-decoration: none}`(0,2,0) | 해당 없음 | header-fg. 포커스는 header-focus. 테마의 `#header a:hover` 밑줄(1,1,1, §8.4 12)이 코어 255–258행을 이겨 display:block 링크의 "≡"·"×" 글리프에 밑줄이 생기므로, `#header a.mobile-toggle-button:hover, #header a.mobile-toggle-button:active`(1,2,1)에 `text-decoration: none`을 다시 선언한다. 메뉴 바·오버레이 제외(§8.4 12 "일반 자손 규칙의 범위") 때문에 테마 hover 규칙의 명시도가 오르면 이 선언도 그보다 높게 올린다 |
  | 토글 왼쪽 구분선 `.mobile-toggle-button` | 236–253행 `border-inline-start: 1px solid var(--oc-gray-3)`(252행) | 해당 없음 | header-divider |
  | 프로젝트 이동 제목 `#project-jump .drdn-trigger`(모바일에서는 투명 배경의 1.5em 굵은 제목) | 142–153행: `color:var(--oc-white)`(147행), `background:transparent`(149행), `border:0`(152행) | 해당 없음 | header-fg. 데스크톱 필드 표면(canvas 배경, header-control-border 테두리, 화살표 이미지)은 쓰지 않는다. 데스크톱 규칙을 `@media (min-width: 900px)`로 한정하거나, 이 미디어 쿼리 안에서 `background: transparent; border: 0`을 코어(1,1,0)와 데스크톱 테마 규칙보다 높은 명시도로 다시 선언한다. 그러지 않으면 헤더가 어두운 프리셋에서 흰 제목이 canvas 위에 놓인다(§8.4 12) |
  | 펼침 캐럿 `#project-jump .drdn-trigger:before`("^" 글자를 뒤집어 그림) | 154–171행, `opacity: .6`(170행), 색은 147행 상속 | 해당 없음 | opacity를 1로 되돌리고 header-fg-muted(6.01). 흰 헤더에서 60% 불투명도 글자는 명암이 떨어진다 |
  | flyout 표면과 글자 `.flyout-menu` | 275–289행: `color: white`(287행), `background-color: var(--color-top-menu-background)`(288행. 7.0.1은 `#3e5b76`) | 표면을 칠한다 | 표면 topbar-bg는 7.0.2에서 재매핑이 주고, 7.0.0–7.0.1용 배경 폴백(`html body .flyout-menu`, §8.4 "7.0.0–7.0.1 대응")을 둔다. 글자 topbar-fg는 셀렉터로 |
  | flyout 절 제목 `.flyout-menu h3` | 296–310행: `color: white`(307행), `border-block: 1px solid var(--color-top-menu-background)`(308행. 7.0.1은 `#506a83`), `background-color: var(--color-header-background)`(309행. 7.0.1은 `#628db6`) | 띠를 칠한다. 선은 topbar-bg가 된다 | 띠 header-bg는 7.0.2에서 재매핑이 주고, 7.0.0–7.0.1용 배경 폴백(`html body .flyout-menu h3`, §8.4 "7.0.0–7.0.1 대응")을 둔다. 글자 header-fg와 위아래 선 header-divider는 셀렉터로(7.0.2 코어의 선은 topbar-bg라 표면과 구분되지 않는다) |
  | `.flyout-menu h4` | 312–314행 `color: white`(313행) | 해당 없음 | topbar-fg |
  | flyout 링크 `.flyout-menu a` | 449–451행 `color: white`(450행) | 해당 없음 | topbar-fg |
  | flyout 아이콘 `.flyout-menu .icon svg, .flyout-menu .icon-only svg` | 453–455행 `stroke: white`(454행) | 해당 없음 | topbar-fg |
  | 사용자 링크 `.flyout-menu__avatar a` | 505–510행 `color: white`(509행) | 해당 없음 | topbar-fg |
  | flyout 항목 구분선 | `rgba(255,255,255,.1)`(364·421·440·494행) | 해당 없음 | 장식선이다. 흰색 10%라 어두운 flyout(Signature, Ink, Brand-forward, Redmine Blue)에서만 보이고, 표면이 밝은 Calm에서는 사라진다. 선 색을 `color-mix(in srgb, currentColor 15%, transparent)`(flyout 안 currentColor는 topbar-fg)로 다시 선언한다(아래 "밝은 flyout") |
  | flyout 검색 입력 `.flyout-menu__search input[type='text']`(0,2,1) | 474–487행: `border: none`(483행), `background-color: var(--oc-white)`(486행) | 해당 없음 | 표면은 canvas 그대로, 테두리는 header-control-border 1px(canvas 4.12, Calm 표면 bg-subtle 위 3.93). 글자는 폼 컨트롤 규칙을 따른다. 필드 안 돋보기(`label.search-magnifier--flyout`의 아이콘, `base.html.erb` 31행)는 canvas 위이므로 flyout 아이콘 규칙(topbar-fg)에서 빼고 fg-icon을 쓴다 |

- **7.0.2에서 필요 없어지는 재칠**: 모바일 헤더 배경(99행), flyout 표면 배경(288행), flyout h3 띠 배경(309행)은 7.0.2에서 변수 재매핑만으로 토큰 색이 된다(2026-10-01 7.0.2 800px 프로브, §6.2). 테마의 이 세 배경 선언은 7.0.0–7.0.1 폴백으로만 남고, 지원 하한이 7.0.2 이상으로 오르면 지운다. 글자·링크·아이콘 색, 캐럿 불투명도, 토글 구분선, h3 위아래 선, 항목 구분선, 검색 입력 테두리, 헤더 아래 선, 예약 패딩 0은 변수가 덮지 않으므로 7.0.2에서도 필요하다.
- **flyout**: `.flyout-menu`는 topbar-bg와 topbar-fg, h3는 header-bg와 header-fg, h3 위아래 선은 header-divider로 한다(배경은 7.0.2에서 재매핑, 7.0.0–7.0.1의 #3e5b76·#628db6은 폴백이 대체하고, 선은 두 경우 모두 셀렉터, §6.2). 항목 구분선과 검색 입력은 위 표대로 한다. Signature의 flyout 표면은 `#46009B`라 코어의 "어두운 flyout 위 흰 글자" 전제가 유지되고, 흰색이 되는 것은 h3 띠뿐이다.
- **밝은 flyout(Calm 프리셋)**: Calm은 topbar-bg가 bg-subtle(#FAF9FC)이라 flyout 표면도 밝다. 코어의 "어두운 flyout" 전제가 뒤집히는 곳은 세 가지이고, 모두 프리셋과 상관없는 같은 규칙으로 처리한다(§8.3대로 명시도를 높인다).
  1. 글자·링크·아이콘: 코어의 `white`를 topbar 토큰으로 다시 칠한다(위 표. Calm은 fg-muted 7.26, fg-subtle 5.73).
  2. 검색 입력: 코어 입력은 테두리 없는 흰 필드라 어두운 flyout에서는 필드 자체가 경계지만, Calm 표면과는 1.05:1이다. header-control-border 테두리가 경계를 만든다(위 표).
  3. 항목 구분선: 흰색 10%는 Calm 표면에서 사라진다. currentColor(topbar-fg) 15%로 바꾸면 sRGB 합성 기준 표면 대비가 Signature 약 1.37, Calm 약 1.25다(코어 흰색 10% 선은 7.0.2 코어 flyout #234761 위 약 1.32, 7.0.1 #3e5b76 위 약 1.28). 장식선이라 3:1 요건은 없다. 이 선언은 `var()` 없이 `color-mix(in srgb, currentColor 15%, transparent)`로 쓴다. 그래서 color-mix를 지원하지 않는 브라우저는 선언을 파싱 단계에서 버리고 코어 값을 쓴다. 어두운 flyout은 코어와 같고, Calm에서만 선이 사라진다.
  - Calm의 계정 트리거는 flyout이 아니라 상단 바 규칙이다(§8.4 12).
  - 브리지가 flyout 표면을 칠하므로 이 세 규칙과 위 표의 flyout 행은 브리지와 같은 v0.2.0에 싣고, Phase 2에서 flyout을 연 상태로 처음 확인한 뒤 Phase 7에서 다시 본다(§4.5) (미검증: flyout 재칠 규칙을 실은 테마로는 재지 않았다).
- **폼 컨트롤 크기**: 코어 `responsive.css`는 같은 미디어 쿼리에서 `body, input, select, textarea, button { font-size: 0.875rem }`을 테마보다 나중에, 같은 명시도로 선언한다(`responsive.css` 69–75행, 크기는 74행). 그래서 그대로 두면 모바일에서 `--ravnus-font-size-base` 노브가 body와 컨트롤에 반영되지 않는다. 같은 미디어 쿼리 안에서 `html body`, `html body :is(input, select, textarea, button)`처럼 명시도를 높여 토큰에 연결한다.
- **열린 항목: iOS 입력 확대.** iOS Safari는 16px 미만 입력에 포커스하면 화면을 확대한다 (미검증: 도커 환경에 iOS 실기가 없다). 코어는 flyout 검색 입력에만 1rem을 준다(`responsive.css` 291–294행 `.flyout-menu input[type='text']`, 0,2,1, 코어 주석이 iOS 확대 방지라고 밝힌다). 테마의 폼 컨트롤 크기 규칙은 이 규칙보다 명시도를 낮게 두어 덮지 않는다. 나머지 입력의 선택지는 (1) 14px 유지(확대 감수, 데스크톱과 같은 크기), (2) 900px 미만이나 `(pointer: coarse)`에서 입력 컨트롤만 16px이다. 2026-09-26 소유자 결정 6건과는 별개다. Phase 7 전에 실기로 확인한 뒤 소유자 결정 요청 여부를 정한다.
- **DOM**: `responsive.js`의 메뉴·사이드바 이동에는 손대지 않는다.

### 8.7 아이콘

- `svg.icon-svg { stroke: var(--ravnus-fg-icon) }`. 코어의 #343a40, `--oc-gray-8`을 대체한다.
- `a.icon .icon-svg, a .icon-svg { stroke: currentColor }`. 아이콘이 링크 색과 hover 색을 따르고, 코어의 빨간 hover를 대체한다.
- `.icon-svg-filled { fill: currentColor }`.
- `.icon-ok`, `.icon-error`, `.icon-warning`은 각각 success, danger, warning fg를 쓴다.
- 헤더 안 아이콘은 `--ravnus-header-icon`, 상단 바와 flyout 아이콘은 `--ravnus-topbar-fg`를 쓴다(§6.2). 메인 메뉴 바, 헤더 안 오버레이, 상단 바 안의 계정 드롭다운 목록의 아이콘은 여기서 빼고 nav·overlay 규칙을 따른다(§8.4 12). flyout 검색 입력 안 돋보기도 canvas 필드 위이므로 빼고 fg-icon을 쓴다(§8.6). 선택 행에서는 코어가 강제한 흰색을 currentColor로 되돌린다(`!important`).
- stroke-width는 코어의 1.5를 유지한다.
- 상태·우선순위·기한 초과·일정 지연 글리프는 아이콘이 아니라 CSS 그림(테두리, border-radius, 그라디언트, clip-path)이다. 그래서 `url()`이나 data:가 없고 토큰으로 다시 칠해진다.
- **토큰으로 칠할 수 없는 코어 이미지** (v1 유지, 다크 전에 처리, §5.5):
  - `jstoolbar.css`: 편집기 버튼 아이콘 `background-image: url()` 18개와 도움말 링크 `help.png` 1개(7.0.2 `jstoolbar.css` 88·109–166행, 7.0.1과 같다).
  - `application.css`: select 화살표 chevron-down.svg, 트리 들여쓰기 chevron-left/right-idnt.svg, search.svg, `#project-jump` arrow_up.png, external.png, exclamation.png(`em.info.error`), loading.gif, transparent.png. `gantt.css`의 간트 PNG(task_*, milestone_*, project_marker, version_marker). 7.0.2 기준이고 7.0.1과 같다.

### 8.8 forced-colors (Windows 고대비)

코어에는 forced-colors 처리가 없다(7.0.2 `app/assets/stylesheets` grep 0건). CSS Color Adjust 명세상 이 모드에서는 box-shadow가 none이 되고, `url()`이 아닌 background-image도 none이 되며, 글자·배경·테두리 색은 시스템색으로 강제된다. 그래서 그라디언트 글리프, box-shadow 마커, 배경색으로 채운 모양이 사라진다. `@media (forced-colors: active)` 블록에서 다음을 처리한다.
- 행 마커와 인라인 시작선은 처음부터 테두리로 그린다(§6.4, §8.1). 테두리는 이 모드에서도 남는다.
- 메인 메뉴 선택 탭은 `inset` 그림자 대신 `border-block-end: 3px solid Highlight`를 준다.
- 이 모드에서는 상단 바·헤더·메뉴 바 배경이 모두 시스템 배경색이 된다. 크롬 경계선(header-divider, nav-border, §6.2)은 테두리로 그리므로 남아 영역을 나눈다 (미검증: Phase 2 에뮬레이션).
- 상태의 빈 원, 채운 원, 체크는 테두리로 그리므로 이 모드에서도 같은 모양일 것으로 본다(§6.5) (미검증: Phase 3).
- 그라디언트나 배경으로 채우는 글리프(우선순위 막대, 우선순위 "!" 사각형, 기한 초과 "!" 원, 반원, 일정 지연 삼각형, 진행 막대 구간과 빗금)는 `forced-color-adjust: none`을 주고 시스템색(`CanvasText`, `Canvas`, `Highlight`)으로 다시 그린다.
- 포커스 링은 `outline`이라 남는다. 확인만 한다.
- 확인: Playwright `emulateMedia({ forcedColors: 'active' })`로 일감 목록, 메인 메뉴, 진행 막대, 선택 행을 본다(§10.4). 이 에뮬레이션이 실제 Windows 고대비 모드와 같은 강제 색을 적용하는지는 확인 전이다 (미검증). Windows 실기 확인은 §10.4 장비 항목에 둔다.

### 8.9 인쇄

코어 `@media print`(7.0.2 2619행)는 크롬만 숨긴다. `print-color-adjust`의 초기값 `economy`는 인쇄 때 배경을 빼는 것을 허용하고(CSS Color Adjust 명세), 브라우저 인쇄 대화상자의 "배경 그래픽"을 끄면 배경색과 그라디언트로 그린 우선순위 막대, 우선순위 "!" 사각형, 기한 초과 "!" 원, 반원, 일정 지연 삼각형, 진행 막대 구간과 빗금이 인쇄물에서 사라진다. 흑백 인쇄는 색 외 단서가 가장 필요한 상황이다.
- 글리프 가상 요소와 진행 막대 셀에 `print-color-adjust: exact`와 `-webkit-print-color-adjust: exact`를 함께 준다. 테두리로 그린 모양은 배경 그래픽 설정과 상관없이 인쇄될 것으로 본다 (미검증: Phase 3 인쇄 미리보기).
- 줄무늬, hover, 선택 행, 틴트 배경은 인쇄에서 뺀다(`--ravnus-row-stripe: transparent` 등).
- 문장 속 링크 밑줄은 유지한다.
- 확인: 일감 목록 인쇄 미리보기(배경 그래픽 끔)에서 우선순위 5단계, 상태, 기한 초과, 일정 지연이 구분되는지 본다(Phase 3).

---

## 9. 화면별 적용 순서와 각 단계 완료 기준

공통 완료 기준(모든 단계):
- 7.0.2에서 1440px와 800px 스크린샷을 검토한다.
- 명암 게이트(토큰 쌍)와 해당 화면의 axe-core 검사가 통과한다.
- 1440·1280·1024px에서 페이지 가로 스크롤이 없다(표 내부 스크롤은 허용).
- `npm run build` 결과를 같은 커밋에 넣는다.
- 결과표에 확인한 것과 확인하지 못한 것을 구분해 적는다.

| 단계 | 범위 | 완료 기준 |
|---|---|---|
| **Phase 0 검증 스파이크 (완료, 2026-10-01)** | 1. CDN `@font-face` 보존: `redmine:7.0.2` 기동 후(컨테이너의 `Redmine::VERSION`을 결과표에 적는다, §4.12) `/assets`로 서빙된 테마 CSS를 받아 절대 https `url()` 92개의 URL 문자열이 생성 파일과 글자 그대로 같은지 비교하고, 폰트 요청이 고정 버전의 `cdn.jsdelivr.net` URL로 가서 200 `font/woff2`를 받는지, 폰트 요청에 실린 `Referer` 헤더 값이 무엇인지 기록(§4.4 README 개인정보 문구의 근거) · 2. CDN 차단 시 폴백과 렌더링: Playwright `page.route`로 `cdn.jsdelivr.net` 요청을 abort했을 때와 응답 없이 붙잡아 둘 때(폐쇄망의 연결 시간 초과 흉내) 글자가 §7.1 시스템 폰트로 그려지는지, 첫 페인트가 차단 전후로 늦어지지 않고 첫 글자 표시가 `swap`의 짧은 block 기간(§4.4)보다 더 늦어지지 않는지, 테마 CSS 말고 기다리는 스타일시트 요청이 없는지. 무응답 경우에는 `page.goto`를 `waitUntil: 'domcontentloaded'`로 부르고(기본값 `'load'`로는 시험이 멈출 수 있다) window `load` 이벤트 시각을 재며, 그동안 일괄 편집의 "지우기" 체크박스가 필드를 비활성화하는지와 저장하지 않은 변경 경고가 등록되는지 본다(둘 다 `load`에 묶여 있다, §4.4) · 3. 덮었을 때 CDN 미요청: 시험용 자식 테마와 `custom.css`에 (가) §4.4의 `"RAVNUS Sans Local"` `@font-face`와 네 폰트 스택(`--ravnus-font-sans`·`-ja`·`-zh`·`-zh-tw`), (나) "시스템 폰트만 쓰기" 블록을 각각 넣고 ko·en·ja·zh·zh-TW UI에서 `cdn.jsdelivr.net` 요청이 0건인지 네트워크 탭으로 확인. 자식 테마의 `url(../fonts/…)` 재작성도 함께 본다 · 4. 페이지별 폰트 조각 수와 바이트: /issues, /projects, 일감 상세, 위키 `타이포그래피_샘플`을 ko·ja·zh UI에서 잰다(작업 자료의 487/307/257KB 재측정) · 5. `custom.css` 스텁 import, 자식 테마 `url(../ravnus/application.css)`와 `url(/themes/ravnus/application.css)` · 6. import 순서: Dart Sass 동작은 로컬 빌드로 확인했으므로(§4.5) 1에서 받은 서빙된 테마 CSS의 주석을 뺀 첫 두 규칙이 코어·`custom.css` import 순서인지만 함께 본다 · 7. 로그인 상태 크롬과 저널·히스토리 마크업: 7.0.2에서 로그인 상태의 상단 바(`#account` 드롭다운 트리거와 아바타, `.profile-menu`의 28px 예약)와 저널·반응·히스토리 탭 마크업을 캡처해 Phase 2·4의 기준으로 기록하고, 익명과 로그인의 상단 바 높이를 잰다. 로그인은 로그인 폼과 비밀번호를 쓰지 않는다. `rails runner`는 `docker compose exec -T -u redmine`으로 실행해 새로 생기는 파일의 소유자를 서버 실행 유저와 맞춘다. 이것으로 `Setting.autologin`(일 수, 기본 0이면 자동 로그인이 꺼져 있다)을 켜고, `Token.create!(user: admin, action: "autologin")`로 만든 토큰 값을 브라우저 쿠키 `autologin`으로 넣는다(쿠키 이름은 `Redmine::Configuration['autologin_cookie_name']` 기본값, `app/controllers/application_controller.rb` 188–202행). admin의 `generate_autologin_token`(`app/models/user.rb` 476행)을 거치는 경로는 시험하지 않았다 (미검증). 토큰 값은 결과표·로그·커밋에 남기지 않고, 시험이 끝나면 `delete_autologin_token`으로 지우거나 `docker compose down -v`로 데이터와 함께 지운다 · 8. Pretendard 로드 상태의 코어 행 높이 재측정 · 9. UI 언어 전환을 하네스에 연결: 익명과 로그인 화면 모두 Playwright `locale`(Accept-Language)로 바꾼다. 시드의 admin 언어가 비어 있어 로그인 화면도 Accept-Language를 따른다. admin 언어 설정은 Accept-Language보다 우선하므로 사용자 언어를 따로 정한 경우를 시험할 때만 바꾸고, DB에 남으므로 시험이 끝나면 비운다(§10.4) · 10. 7.0.2 코어 변수 브리지: 시험용 테마 CSS(§4.5의 크롬 배경 변수 `:root` 재매핑. 실제로는 흰 헤더 재칠과 함께 Phase 2에 싣는다)로 1440px에서 `#header`·`nav.top-menu`, 800px에서 모바일 `#header`·`.flyout-menu`·`.flyout-menu h3`의 계산 배경이 header-bg·topbar-bg인지 확인한다. 배경 셀렉터 폴백을 뺀 시험 CSS로도 같은지(변수만으로 칠해지는지), `custom.css`에서 `--ravnus-header-bg`·`--ravnus-topbar-bg`를 바꾸면 그 변수를 쓰는 다섯 곳의 계산 배경이 따라오는지(여섯째 사용처인 h3 선은 셀렉터로 덮음, §6.2), 변수가 덮지 않는 글자색(메뉴 토글, 프로젝트 이동 제목, flyout 글자·h3 글자)은 셀렉터가 칠하는지, flyout h3 위아래 선의 계산 색이 header-divider인지(7.0.2 코어 값 topbar-bg를 셀렉터가 덮음) 본다. 7.0.1 이미지를 1회 실행해(커밋하지 않는 compose override로 이미지만 바꾼다) 시험 CSS의 폴백만으로 같은 크롬 배경(데스크톱 헤더·상단 바, 800px 모바일 헤더·flyout·h3 띠)이 되는지 미리 본다. 크롬 높이는 최종 CSS가 있어야 비교할 수 있으므로 Phase 2의 7.0.1 spot check(§10.4)에서 잰다 | **완료(`7.0.2.stable`, 결과표는 부록 "Phase 0 검증 결과").** 실패는 2의 `load` 지연과 그에 묶인 저장하지 않은 변경 경고뿐이라 §11 "CDN 차단 때 렌더링이나 `load`가 늦어짐"의 `load` 대응을 적용했다. 1·3·5·6·8·9·10a는 통과했고(5b에서 수정 시각 조건을 새로 찾았다, §4.5), 4는 측정(§4.4), 7은 캡처(§8.4 1·9)다. 실패 시 대응으로 적어 둔 §11 행은 해당 없음으로 기록했다. 실제 네 스택 테마의 덮기 매트릭스와 CDN 차단 전후 텍스트 높이는 Phase 1로, 10b(테마 CSS 안의 브리지 선언, `custom.css` 추종, 글자 셀렉터)와 7.0.1 배경 폴백은 Phase 2로 넘겼다. 결과는 이 문서, `CLAUDE.md`, README 설치 절에 반영했다. 아래는 Phase 1 재측정에 쓸 방법이다(Phase 0은 저장소 밖 임시 디렉터리를 같은 방식의 1회 override로 마운트했다). 폰트 파일이 저장소에 없으므로 `docker-compose.yml`에 상시 폰트 마운트를 추가하지 않는다. 3의 시험용 폰트 파일은 시험할 때 내려받아 `.gitignore`에 추가한 경로(예: `.docker/fonts-test/`)에 두고 커밋하지 않는다(`.docker/`는 추적되는 디렉터리다). `.docker/`는 서비스에 `/ravnus-dev`로 읽기 전용 마운트돼 있어 컨테이너 안에서 보이지만 테마 디렉터리가 아니므로 서빙되지 않는다. 그래서 3에는 1회 실행용 마운트를 따로 준다(커밋하지 않는 compose override 파일을 `docker compose -f docker-compose.yml -f <override> up -d`로 얹는다). `custom.css` 경우는 `.docker/fonts-test`를 `/usr/src/redmine/themes/ravnus/fonts:ro`로 마운트하고(§4.4의 `themes/ravnus/fonts/` 위치), 시험용 `custom.css`는 추적 스텁을 고치지 않고 커밋하지 않는 파일을 `/usr/src/redmine/themes/ravnus/stylesheets/custom.css:ro`에 파일 단위로 마운트한다. 자식 테마 경우는 시험용 자식 테마 디렉터리(예: `.docker/theme-test/`, 안의 `stylesheets/`와, `.gitignore`에 추가한 `fonts/`)를 `/usr/src/redmine/themes/<시험 이름>:ro`로 마운트한다. 커밋할 수 있는 것은 시험용 자식 테마의 CSS뿐이다. 저장소의 테마 런타임 디렉터리(`stylesheets/` 등)에는 시험 중에도 폰트 파일을 넣지 않는다. 컨테이너 안의 `themes/ravnus/fonts/`는 위 1회 실행용 마운트로만 생긴다. 기본 compose 프로젝트와 섞이지 않도록 1회 실행은 별도 프로젝트 이름(`docker compose -p <이름>`)과 다른 포트(`REDMINE_PORT`)로 띄우고, 끝나면 `docker compose -p <이름> down -v`로 지운다 |
| **Phase 1 기반** | 토큰 3계층, `@supports` 폴백 생성, `color-scheme`, 타이포(§7 전부), 코어 의미 변수 재매핑 중 `--fonts-main`·`--color-current-marker`만(크롬 배경 변수 둘의 재매핑은 흰 헤더 재칠과 함께 Phase 2, §4.5), Pretendard `@font-face` 생성 스크립트와 생성 파일(§4.4), `custom.css` 빈 스텁, README의 Pretendard 크레딧·OFL 고지와 CDN 안내, CI(빌드 비교 + 명암 게이트 + 폰트 검사), 프로브 하네스와 axe-core 검사 | 모든 페이지에 body line-height가 명시된다. CI 폰트 검사(§10.2 6)가 통과한다. 컴파일된 CSS의 CDN `@font-face` 수가 생성 파일과 같고(v1.3.9는 92개), 모든 폰트 URL이 고정 버전 접두사(생성 스크립트의 버전 상수에서 만든 값, 현재 `https://cdn.jsdelivr.net/npm/pretendard@1.3.9/`)로 시작하며, 외부 스타일시트 `@import`가 없고, 주석을 뺀 첫 두 규칙이 코어·`custom.css` import 순서이며, `"Pretendard Variable"`이 `@font-face` 블록과 네 폰트 스택 토큰 값에만 나온다. 폰트가 로드된 상태와 CDN을 막은 상태 모두에서 글자가 표시된다. CDN을 막기 전후로 텍스트 컨테이너(본문 문단, 메뉴 탭, 제목, 표 셀)의 높이가 같다(Phase 0 2b에서는 `line-height: normal`인 코어 요소만 1–3px 바뀌었다, §7.3). 실제 네 스택 테마로 Phase 0 3의 덮기 매트릭스(`custom.css` 자체 호스팅, "시스템 폰트만 쓰기", 자식 테마 자체 호스팅 × ko·en·ja·zh·zh-TW × 4페이지)를 다시 돌려 모든 경우에 CDN 요청이 0건이고, §4.4 폰트 전송량 표의 ja·zh 값을 다시 잰다(Phase 0은 `custom.css`로 흉내 냈다). 입력·셀렉트·버튼의 계산 폰트가 Pretendard 스택 14px다(지금은 Arial 13.33px). 위키 `타이포그래피_샘플`이 ko·ja·zh·zh-TW UI에서 §7.1대로 대체된다(zh-TW에서 `，。`가 가운데). 일감 #8 제목이 목록과 상세에서 셀 밖으로 넘치지 않는다. 빌드로 생성한 폴백 hex가 OKLab 계산값, sRGB 프로필로 고정한 Chrome의 계산값과 같다. 기본값·프리셋 파생값이 sRGB 밖이면 빌드가 실패한다(§5.4) |
| **Phase 2 크롬** | 상단 메뉴, 헤더, 메인 메뉴, 빠른 검색, 프로젝트 이동, 계정 드롭다운, 새 항목 버튼, 하위 메뉴, 사이드바 스킨과 위치 토큰. 흰 헤더 재칠(§8.4 12)과 §8.6 재칠 전체(모바일 헤더, flyout 글자·링크·h4·아이콘·사용자 링크, flyout h3 글자와 위아래 선, 항목 구분선, 검색 입력, "밝은 flyout" 규칙. 브리지가 flyout 표면과 h3 띠를 칠하므로 같은 릴리스에 싣는다, §4.5), 코어 변수 브리지(크롬 배경 변수 재매핑. 재칠과 같은 릴리스에서 처음 싣는다, §4.5)와 7.0.0–7.0.1 배경 폴백(§6.2, §8.4 "7.0.0–7.0.1 대응"), 크롬 경계선(§6.2) | 1440px에서 익명과 로그인의 크롬 요소 위치·높이 차이가 1px 이내다(프로브 측정. 7.0.2 코어의 `.profile-menu` 28px 예약이 테마 상단 바 높이 안에 든다). 7.0.2에서 테마 CSS 안의 브리지 선언으로 코어 변수 재매핑의 계산값(`--color-header-background`·`--color-top-menu-background`)이 header-bg·topbar-bg이고, 그 변수를 쓰는 다섯 곳의 계산 배경이 토큰이다(여섯째 사용처인 h3 선은 셀렉터로 덮음, 1440·800px, §6.2). `custom.css`에서 `--ravnus-header-bg`·`--ravnus-topbar-bg`를 바꾸면 그 다섯 곳의 계산 배경이 따라온다(두 확인은 Phase 0 10b에서 넘겼다. Phase 0은 `<style>` 주입으로만 확인했다). 800px에서 flyout h3 위아래 선의 계산 색이 header-divider다(7.0.2 코어 값 topbar-bg를 셀렉터가 덮음, §8.6). 7.0.1 spot check(§10.4)에서 배경과 높이가 7.0.2와 같다(§8.4 "7.0.0–7.0.1 대응"). 긴 한국어·일본어 프로젝트명에서 제목과 탭이 겹치지 않는다. 기본값이 Signature(흰 헤더 + `#46009B` 상단 바)이고, 크롬 안 색이 모두 header·topbar 토큰에서 온다(기본 Signature와 대안 크롬 프리셋 4종 Ink·Brand-forward·Calm·Redmine Blue, 모두 5종의 스크린샷 + 명암 게이트). 기본 Signature와 Ink 프리셋을 같은 페이지(일감 목록·상세, 익명·로그인)에서 나란히 찍어 비교한다. §8.4 12 표의 행과 §8.6의 헤더 5행·flyout h3에서는 계산 글자색·stroke가 header 토큰이고 header-bg와의 대비가 글자 4.5, 아이콘과 컨트롤 경계 3 이상이다. §8.6의 나머지 flyout 행(검색 입력 행 제외)에서는 topbar 토큰이고 topbar-bg와의 대비가 같은 기준 이상이다(장식선인 토글 구분선과 flyout 항목 구분선은 대비 기준에서 빼고 계산 색만 확인한다: header-divider, currentColor 15%). 검색 입력 행은 표면이 canvas 필드라 따로 본다. 테두리(header-control-border)와 canvas의 대비(4.12), Calm 프리셋에서 테두리와 flyout 표면 bg-subtle의 대비(3.93)가 3 이상이고, 어두운 flyout에서는 canvas 필드와 topbar-bg의 대비(Signature 12.11)가 3 이상이다(계산 스타일 assert, 7.0.2, 1440·800px, 800px은 flyout을 연 상태 포함). 800px에서 flyout을 연 상태로 h3 글자색이 header-fg이고, Calm 프리셋의 flyout 글자·링크·아이콘이 topbar-fg, 검색 입력 테두리가 header-control-border, 입력 안 돋보기가 fg-icon이다(§8.6 "밝은 flyout"). 헤더 영역의 axe-core color-contrast 위반이 0건이다. 상단 바가 밝은 Calm 프리셋에서 계정 트리거의 계산 글자색·아이콘 stroke(hover 포함)가 topbar 토큰이고 topbar-bg 대비가 글자 4.5, 아이콘 3 이상이다(assert, §8.4 12). 800px에서 모바일 헤더가 흰색(header-bg. 7.0.2 코어 기본 #3A78A3이나 7.0.1의 #628db6이 아님)이고 프로젝트 이동 제목·펼침 캐럿·메뉴 토글이 읽히며, 헤더 아래 경계선만 보이고 위 경계선은 없으며 헤더 높이가 64px로 유지된다(§8.6). 프로젝트 이동 목록 항목과 hover의 계산 색이 overlay 토큰이다(§8.3 `!important`). 메뉴 토글의 hover·active 계산 `text-decoration-line`이 `none`이다(테마 `#header a:hover` 밑줄이 새지 않음, §8.6). 헤더와 메뉴 바 사이, 메뉴 바와 본문 사이 경계선이 보이고(1440px, 기본과 Ink), 메뉴 바의 계산 높이가 헤더 예약 패딩(nav-height)과 같다. 헤더와 상단 바의 포커스 가능한 요소에서 포커스 링이 보인다. 헤더(accent)는 브레드크럼, 검색 레이블 링크, 검색 입력 `#q`(코어 `outline: none`을 이기는지 계산 스타일로도 확인), 모바일 토글이다. 상단 바(앰버)는 상단 메뉴 링크와 계정 드롭다운 트리거다. 펼친 계정 드롭다운의 항목은 흰 오버레이 위이므로 accent 링과 overlay 글자색이다. 앰버 링이 흰 헤더나 오버레이로 넘치지 않는다(1440·800px 프로브 스크린샷). 프로젝트 이동 트리거는 코어가 키보드 포커스를 주지 않으므로(§6.2) 목록에서 빼고, 펼친 뒤 `#projects-quick-search`의 focus-ring을 확인한다. 크롬 높이를 최종 CSS로 재측정해 기록한다(프로토타입 기본 120px, Ink 116px, 7.0.2 코어 118px). 사이드바 시작 쪽 전환과 접힘, RTL(he) 셰브런이 7.0.2에서 동작한다. forced-colors에서 선택 탭과 크롬 경계선이 보인다. 기본값 B와 대안 크롬 프리셋 4종의 7.0.2 스크린샷을 README 프리셋 자료로 쓴다(§4.1) |
| **Phase 3 일감 목록** | 밀도, 우선순위·상태·트래커 글리프, 행 상태, 그룹 행·합계(`tr.group`, `span.count`, `span.totals`, `a.toggle-all`, `.query-totals`), 선택 행, 쿼리 필터 컨트롤, 인쇄·forced-colors 대응 | Pretendard가 로드된 상태에서 기본 행이 32±1px, Compact가 27±1px다(코어 25px 바닥은 `td.buttons`의 18px 아이콘과 셀 패딩이 만들므로 함께 계산한다, §4.8). 흑백 스크린샷에서 우선순위 5단계, 상태(기본 2종, opt-in 4종), 기한 초과, 일정 지연(삼각형 글리프, 빗금 막대), 부모, 닫힘, 선택이 모두 구분된다. 같은 구분이 인쇄 미리보기(배경 그래픽 끔)와 forced-colors 에뮬레이션에서도 된다. 선택 행 글자가 4.5 이상, 경계가 3 이상이다. 12열 이상 쿼리에서 제목이 음절 단위로 쪼개지지 않고, 이름 열(담당자·작성자·범주)도 음절 단위로 쪼개지지 않으며, 표가 `#content` 안에서 스크롤된다. 선택 스타일이 코어 `context_menu.css`를 이긴다. `custom.css`의 `tr.status-N` 매핑이 계산 스타일에 반영된다(assert). 그룹 행·합계에서 axe-core color-contrast 위반이 0건이다 |
| **Phase 4 일감 상세·저널·편집 폼** | `div.issue`, 속성, 설명, 저널, 비공개 노트, 히스토리 탭, 하위·관련 일감 트리, sticky 헤더, 편집 폼, 주 버튼 allowlist, `.tabular` overflow 수정 | `div.issue`가 §8.1 카드 사양대로다(코어 기준선, §8.4 8을 모두 덮음). 트리 제목이 keep-all + anywhere로 넘치지 않는다. 앵커로 이동할 때 sticky 헤더에 가려지지 않는다(인라인 편집으로 이동할 때 포함. 7.0.2 코어에서는 가린다, §8.4 9). 저널·히스토리 탭 스타일은 Phase 0 7b에서 캡처한 7.0.2 셀렉터(§8.4 9)를 기준으로 한다. 긴 사용자 정의 필드 레이블이 줄바꿈된다. 삭제 확인 버튼(users/bulk_destroy, projects/bulk_destroy 포함)이 주 버튼이 아니고 `.btn-alert`는 위험 스타일이다. 편집 폼 입력의 포커스 링이 잘리지 않는다(프로브 스크린샷) |
| **Phase 5 위키·본문** | 본문 행간, 제목 체계, 문장 속 링크 밑줄(범위 감사 포함), 코드, 위키 표, 편집기와 jstoolbar(`.jstElements`, `.jstTabs`, 도움말), em 표현, 본문 폭 opt-in | ko 15/1.7, ja·zh 15/1.75가 적용된다. §7.9 대상의 링크에 상시 밑줄이 있고 밑줄 대비가 3:1 이상이다. `pre`·`code`에서 autospace가 꺼진다. 편집기와 렌더 텍스트의 크기·행간이 같다. 툴바 버튼의 hover·포커스가 토큰 색이다. em 시안 비교 후 결정을 기록한다 |
| **Phase 6 공통 컴포넌트·플로팅** | 플래시, `#errorExplanation`, `.nodata`, `.box`, 배지(12px), 본문 탭, 로그인, 푸터, 페이지 번호, context menu, 드롭다운, 자동완성, jQuery UI | 나중에 로드되는 코어 CSS를 이기는지 계산 스타일 assert로 확인한다. 그림자가 떠 있는 레이어에만 있다. 계산 font-size가 12px 미만인 텍스트 노드가 0개다(간트 제목 열 제외). 본문 탭의 포커스 링과 글자가 잘리지 않는다(행간 덮어쓰기 포함). 핵심 화면의 axe-core color-contrast 위반이 0건이다 |
| **Phase 7 모바일** | 800px 헤더, flyout, 쌓인 폼, 컨트롤 크기 | 헤더가 header-bg다(7.0.2는 재매핑. 7.0.1은 Phase 2의 7.0.1 spot check(§10.4) 결과를 따르고, Phase 7에서 크롬 배경 폴백을 바꾸면 다시 돌린다). 흰 모바일 헤더 위 글자와 캐럿(§8.6 표)이 header 토큰이다(Phase 2에서 확인한 것을 다시 본다). 헤더가 어두운 프리셋(Ink)에서도 800px 프로젝트 이동 트리거의 계산 배경이 투명하고 테두리가 0이다(assert, 데스크톱 canvas 필드 표면이 새지 않음, §8.6). 예약 패딩이 0이다. 메뉴 토글("≡"·"×")에 hover·active 밑줄이 없다. flyout이 토큰 색이다(h3 띠 포함. Phase 2에서 확인한 것을 다시 본다). flyout h3 위아래 선의 계산 색이 header-divider다(7.0.2 코어 값 topbar-bg를 셀렉터가 덮음, §8.6). 상단 바가 밝은 Calm 프리셋의 flyout에서 검색 입력 테두리(header-control-border)와 항목 구분선이 보이고, 입력 안 돋보기가 fg-icon이다(§8.6 "밝은 flyout"). 메뉴 이동이 정상이다. 800px에서 body와 입력의 계산 font-size가 `--ravnus-font-size-base`를 따른다(assert). iOS 입력 확대 처리 결과를 기록한다(§8.6) |
| **Phase 8 색만 다시 칠하기** | 로드맵·버전, 활동, 시간 기록, 달력, 간트(`gantt.css`), 저장소·diff(`scm.css`), 관리 표·탭, 내 페이지, 프로젝트 목록·개요, 검색 | 화면마다 7.0.2 스크린샷을 검토한다. 코어 hex와 칠할 수 없는 `url()` 이미지가 남아 보이는 곳을 목록으로 남긴다(Pygments 제외) |
| **Phase 9 QA·문서·릴리스** | §10 매트릭스, README, 스크린샷, Theme_List | 매트릭스 결과표를 쓴다. README.md와 README.ko.md를 동시에 갱신한다. 스크린샷은 `.github/` 또는 별도 브랜치에 둔다. Theme_List 항목 초안을 쓰고 태그를 단다 |

---

## 10. 검증 방법

### 10.1 환경

- `docker compose up -d`로 띄운다(서비스 `redmine` 하나, Redmine 7.0.2, 127.0.0.1:3007에만 열림). CSS를 바꾸면 `npm run build` 후 `docker compose restart`를 한다.
- 이미지 태그는 `redmine:7.0.2`로 고정돼 있다(§4.12). 모든 결과표에 컨테이너의 `Redmine::VERSION`을 적는다.
- 7.0.1 spot check(범위는 §10.4)는 커밋하지 않는 compose override로 이미지만 `redmine:7.0.1`로 바꿔 1회 실행한다. 별도 프로젝트 이름(`-p`)과 다른 포트(`REDMINE_PORT`)를 쓰고 끝나면 `down -v`로 지운다.
- 로그인 화면은 로그인 폼과 비밀번호를 쓰지 않고 `rails runner`로 만든 autologin 토큰 쿠키로 연다(§9 Phase 0 7). `rails runner`는 `docker compose exec -T -u redmine`으로 실행해 새로 생기는 파일의 소유자를 서버 실행 유저와 맞춘다. UI 언어는 익명과 같이 Playwright `locale`로 바꾼다(§10.4).
- Pretendard는 CDN에서 오므로 브라우저에 인터넷 연결이 있을 때만 로드된다. Pretendard 로드가 전제인 측정(행 높이, 크롬 높이, 글자 폭)은 폰트 요청이 성공했는지 확인한 뒤 잰다. 폴백 측정은 CDN을 막고 따로 한다.
- 로컬 도커 결과는 운영 검증이 아니다. 모든 보고와 PR에 이 사실을 적는다.
- 운영 중인 Redmine 서버에서 직접 확인하지 않는다.

### 10.2 도구

1. **프로브 하네스**(Calm 방식): playwright-core와 시스템 Chrome을 쓴다. 테마 `<link>` 바로 뒤에 `<style>`을 주입하거나 빌드된 CSS를 그대로 쓴다. 1440·1024·800px에서 요소 박스와 계산 스타일을 JSON으로 남긴다. 위치는 서빙되지 않는 dot-디렉터리(예: `.docker/probe/`)다. devDependency를 추가하기 전에 의존성과 라이선스를 확인한다.
2. **스크린샷 비교**: 같은 데이터로 코어 기본 테마와 RAVNUS를 비교하고, 기본 크롬과 프리셋을 비교한다. 7.0.1 spot check(§10.4)는 같은 조건의 7.0.2와 비교한다. 폰트 렌더링 차이가 있어 픽셀 diff는 참고로만 쓰고 판단은 사람이 한다.
3. **계산 스타일 assert**: 로드 순서 위험 지점을 확인한다. 모바일 `#header` 배경, 재칠 목록의 요소별 글자색·아이콘 stroke·컨트롤 테두리와 그 표면 대비(§8.4 12 행과 §8.6의 헤더 5행·flyout h3는 header-bg, §8.6의 나머지 flyout 행(검색 입력 행 제외)은 topbar-bg. 장식선인 토글 구분선과 flyout 항목 구분선은 대비 기준에서 빼고 계산 색만 확인한다: header-divider, currentColor 15%. 검색 입력은 테두리를 canvas와 Calm 표면 bg-subtle에, 어두운 flyout에서는 canvas 필드를 topbar-bg에 대 본다. 1440·800px, 800px은 flyout을 연 상태 포함. 코어나 플러그인의 밝은 글자가 남으면 흰 바탕에서 보이지 않으므로 목록 전체를 assert한다), 포커스된 검색 입력 `#q`의 outline(코어 `outline: none`), 헤더가 어두운 프리셋의 800px 프로젝트 이동 트리거 배경(투명), `.context-menu-selection`의 배경·링크·아이콘, `.dropdown-content` 표면과 항목 글자색(상단 바 규칙이 새지 않음), Calm 프리셋에서 `#account .dropdown-trigger`의 글자색·아이콘 stroke(hover 포함, 코어가 `#top-menu a`보다 높은 명시도로 밝은 색을 줌, §8.4 12), 코어 변수 재매핑 값(`--color-header-background`·`--color-top-menu-background`)과 그 변수를 쓰는 다섯 곳의 계산 배경(여섯째 사용처인 h3 선은 셀렉터로 덮음, 1440·800px, §6.2), flyout h3 위아래 선의 계산 색이 header-divider인지(7.0.2 코어 값 topbar-bg를 셀렉터가 덮음, 800px, §8.6), 800px 메뉴 토글 hover의 `text-decoration-line`(§8.6), 폼 컨트롤 폰트, `--fonts-main` 해석값, `custom.css`의 `tr.status-N` 매핑, 800px 컨트롤 font-size, 계산 font-size 12px 미만 텍스트 노드 수(간트 제외)다.
4. **명암 CI 게이트**: §6.6. 토큰 쌍만 본다.
5. **렌더 화면 명암**: 프로브 하네스에서 axe-core `color-contrast` 규칙을 7.0.2의 핵심 화면(일감 목록·상세, 위키, 로드맵, 관리 표)에 익명과 admin으로 돌린다. 헤더 영역은 1440px와 800px 모두에서 돌린다. 토큰 쌍 검사가 못 잡는 코어 하드코딩 색(예: `tr.group span.totals` gray-5 2.07:1, `p.progress-info` gray-6 3.32:1)을 잡는다. devDependency를 추가하기 전에 의존성과 라이선스를 확인한다.
6. **빌드 비교 CI**: `CLAUDE.md`에 계획돼 있다. 커밋된 CSS와 소스 빌드 결과가 다르면 실패시킨다. 같은 CI에서 폰트 검사도 한다. 기대값은 문서가 아니라 저장소에서 읽는다. 버전 접두사는 생성 스크립트의 버전 상수에서 만들고, 규칙 수는 생성 파일 `src/_pretendard.scss`에서 센다. 그래서 Pretendard 버전을 올릴 때 CI를 고칠 필요가 없다(§4.4). 검사 항목은 다음과 같다(§4.4, §4.5, Phase 1).
   - 컴파일된 CSS의 CDN `@font-face` 수가 생성 파일과 같은지(v1.3.9는 92개)
   - 모든 폰트 URL이 고정 npm 접두사(현재 `https://cdn.jsdelivr.net/npm/pretendard@1.3.9/`)로 시작하는지
   - 외부(http·https) 스타일시트 `@import`가 없는지
   - 주석을 뺀 첫 두 규칙이 코어 import, `custom.css` import 순서인지(Dart Sass 동작의 회귀 검사, §4.5). 노브 안내 주석은 `_tokens.scss`에 두어 import 뒤에 출력되게 하고, 엔트리에는 `//` 주석만 쓴다
   - `"Pretendard Variable"`(따옴표 종류 무관)이 `@font-face` 블록의 `font-family`와 네 폰트 스택 토큰(`--ravnus-font-sans`·`-ja`·`-zh`·`-zh-tw`)의 값에만 나오는지. 주석은 검사에서 제외한다. 다른 규칙이 이 이름을 `font-family`나 다른 토큰에 직접 쓰면 자체 호스팅과 "시스템 폰트만 쓰기" 레시피(§4.4)로 스택을 바꿔도 CDN 조각이 요청되므로 실패시킨다.
   - 프리셋 블록을 싣는 v0.2.0부터: README.md·README.ko.md 프리셋 블록에 `color-mix(`가 없고, 블록의 파생 리터럴(헤더가 어두운 프리셋의 상단 바, Redmine Blue의 accent 파생)이 Sass 파생 계산값과 같은지(§5.4 폴백)
7. **흑백·색각 이상 확인**: 흑백 스크린샷으로 상태와 우선순위가 구분되는지 본다. Machado 2009 행렬 시뮬레이션은 선택 사항이다.
8. **forced-colors·인쇄 에뮬레이션**: Playwright `emulateMedia`로 `forcedColors: 'active'`와 `media: 'print'`를 켜고 핵심 화면을 찍는다. 인쇄는 배경 그래픽을 끈 미리보기로도 확인한다.
9. **네트워크 확인**(§4.4): 페이지별·UI 언어별 폰트 조각 수와 바이트를 잰다. 모든 폰트 요청이 고정 버전의 `cdn.jsdelivr.net` URL인지, 서빙된 테마 CSS의 폰트 URL이 생성 파일과 같은지, 폰트 요청에 실린 `Referer` 헤더가 무엇인지 본다. Playwright `page.route`로 CDN을 막았을 때(abort와 무응답 둘 다) 시스템 폰트로 그려지고 첫 페인트가 늦어지지 않는지 본다. 무응답 경우는 `waitUntil: 'domcontentloaded'`로 이동하고 window `load` 시각과 `load`에 묶인 코어 동작(일괄 편집 "지우기" 체크박스, 저장하지 않은 변경 경고)을 본다. 실제 연결 시간 초과는 `page.route`가 아니라 CDN 호스트를 응답 없는 주소로 매핑해(Chrome `--host-resolver-rules`) 잰다(Phase 0 2d). 자체 호스팅이나 "시스템 폰트만 쓰기"로 덮었을 때 ko·en·ja·zh·zh-TW UI에서 CDN 요청이 0건인지 본다.

### 10.3 CJK 샘플 (시드에 이미 있음)

- 위키 `타이포그래피_샘플`: 한국어, 日本語, 简体中文, 繁體中文, English 문단, 섞어 쓰기, 한자 자형 비교(骨 直 今 角 刃 次), 띄어쓰기 없는 긴 한국어, 긴 URL, 3언어 표, 인용, CSS 코드 블록
- 일감 #8: 띄어쓰기 없는 긴 한국어 제목(목록과 상세)
- 일감 #7 "한글 제목이 목록에서 음절 단위로 줄바꿈됨": 저널, 인라인 코드, 일감 참조
- 일본어·중국어·영어 제목 일감(ログイン画面の日本語メッセージを見直す, 优化中文界面的字体显示, Footer links open in the same tab)
- 비공개 노트가 있는 일감(문의 폼 500 오류), 닫힘·기한 초과·일정 지연 행, 부모·자식 일감(통합 검색), 뉴스 2건, 로드맵 버전 3개, 한·일·중 이름 사용자
- **시드 추가 제안**: `*강조*`, `**굵게**`, 링크가 섞인 ko·ja·zh 문단, 긴 한국어·일본어 프로젝트 이름, 긴 사용자 정의 필드 레이블, 담당자별로 묶은 저장된 쿼리(그룹 행·합계 확인용), 12열 이상 저장된 쿼리

### 10.4 매트릭스

| 축 | 값 |
|---|---|
| Redmine | 7.0.2(전체 매트릭스). 7.0.1은 아래 7.0.1 spot check만 한다 |
| 폭 | 1440, 1024, 800 |
| UI 언어 | ko, ja, zh, zh-TW, en, he(RTL, `dir="rtl"`) |
| 로그인 | 익명, admin |
| 프리셋 | 기본(Signature 크롬), Compact, 시작 쪽 사이드바. 대안 크롬 프리셋 4종(Ink, Brand-forward, Calm, Redmine Blue)은 크롬이 보이는 대표 페이지에서만(1440·800px) |
| 표시 모드 | 기본, forced-colors(에뮬레이션), 인쇄 미리보기(배경 그래픽 끔). 뒤의 둘은 일감 목록·상세와 크롬에서만 |
| 폰트 로드 | CDN 정상(기본), CDN 차단(시스템 폰트 폴백). 차단은 크롬, 일감 목록, 위키에서만 |
| 브라우저·OS | Chrome(자동). Firefox와 Safari는 수동으로 확인한다(keep-all + anywhere 표 동작은 Chrome에서만 측정됨). Windows(Malgun Gothic, Yu Gothic, YaHei, ClearType)와 iOS Safari(입력 확대)는 장비 확보가 필요하다 (미검증) |

- **7.0.1 spot check**(이 문서의 다른 절은 이 정의를 가리킨다): 크롬 배경 변수가 없는 7.0.0–7.0.1용 배경 폴백(§8.4 "7.0.0–7.0.1 대응")을 확인한다. 대상은 크롬이 보이는 대표 페이지의 크롬 배경(데스크톱 헤더·상단 바, 800px 모바일 헤더, flyout을 연 상태의 flyout 표면과 h3 띠)과 크롬 높이다. 조건은 1440·800px, 익명, Signature·Ink이고, 같은 조건의 7.0.2와 비교한다. 실행 방법은 §10.1이다. 7.0.0은 확인하지 않는다.
- UI 언어 전환: 익명 요청에 `Accept-Language: ja`, `zh-TW`, `he`를 보내면 `<html lang>`이 바뀌고, he에서는 `dir="rtl"`이 된다(LTR 언어에도 `dir="ltr"`이 붙는다. 7.0.2 로컬 도커 기본 설정, 2026-10-01 확인. 헤더 없이 요청하면 시드의 기본 언어 ko다). 사용자 언어 설정이 있으면 Accept-Language보다 우선하지만 시드의 admin 언어는 비어 있어 Accept-Language를 따른다(Phase 0 9). 그래서 익명과 로그인 화면 모두 Playwright `locale` 옵션으로 바꾼다. admin 언어 설정은 사용자 언어를 따로 정한 경우를 시험할 때만 바꾸고, DB에 남으므로 시험이 끝나면 비운다.
- 릴리스마다 핵심 화면(크롬, 일감 목록, 일감 상세, 위키)은 전체 매트릭스를 돌리고, 나머지 화면은 기본 조합만 돌린다.

---

## 11. 리스크와 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| 나중에 로드되는 코어 CSS(`responsive`, `dropdown`, `context_menu`, `jstoolbar`, `gantt`, `scm`)가 같은 명시도에서 이김 | 모바일 헤더와 컨트롤 크기, 선택 행, 드롭다운이 코어 값으로 돌아감. 흰 모바일 헤더에서는 코어의 흰 글자(프로젝트 이동 제목, 메뉴 토글)가 남아 보이지 않게 됨 | §8.3 규칙, 계산 스타일 assert, 릴리스마다 기준 버전(7.0.2) 확인 |
| 흰 헤더(기본 Signature)가 코어의 "어두운 헤더 위 밝은 글자" 전제를 뒤집음(§4.1 결정의 받아들인 대가) | 테마가 놓친 코어 규칙은 흰 바탕에 흰 글자가 되어 헤더 링크·프로젝트 이동 제목·메뉴 토글이 보이지 않음. A(Ink)에서는 같은 누락이 색 차이에 그침 | 7.0.2부터 코어 크롬 배경 변수를 크롬 토큰으로 재매핑하고(§6.2, §8.4 5) 7.0.0–7.0.1용 배경 폴백을 둠(§8.4 "7.0.0–7.0.1 대응"). 변수가 닿지 않는 재칠 대상 규칙을 파일·행 단위로 목록화(데스크톱 §8.4 12, 모바일 §8.6). 목록 밖 자손도 따르도록 `#header`의 `color`, `#header a`, `#header svg.icon-svg`에 헤더 토큰을 명시(메뉴 바와 오버레이 제외). 어두운 헤더에서 흰 필드가 하던 경계는 header-control-border로, 흰 헤더와 메뉴 바의 경계는 header-divider로, 메뉴 바와 본문의 경계는 nav-border로 보완(§6.2). Phase 2에서 요소별 계산 스타일 assert와 헤더 axe-core를 1440·800px, 익명·로그인, 7.0.2에서 돌리고 7.0.1 spot check(§10.4)를 한다(§9, §10.2) |
| 흰 헤더 재칠 규칙의 수와 유지보수 | 재칠 대상은 데스크톱 9행(§8.4 12 표에서 "그대로 둔다"를 뺀 행, 텍스트 입력 포커스 포함)과 모바일 6행(§8.6 표의 헤더 5행과 flyout h3. flyout은 표면이 어두워 제외하되 흰 header-bg로 바뀌는 h3 띠는 코어가 `color: white`(`responsive.css` 307행)를 주므로 포함)이다. 유지보수 위험의 근거는 행 수가 아니라 놓치면 흰 헤더에서 글자나 경계가 보이지 않게 되는 코어 선언이다. 데스크톱은 밝은 글자·경계 선언 7.0.2 `application.css` 153·161·162·202·538행이고, 헤더 색과 상관없이 검색 입력의 포커스 링을 지우는 `outline: none`(883행)이 더해진다. 모바일은 `responsive.css`의 메뉴 토글 111행, 프로젝트 이동 제목 147행, flyout h3 307행이다. 헤더 배경(데스크톱 152행, 모바일 99행)은 7.0.2에서 변수 재매핑이 칠하고, 7.0.0–7.0.1의 하드코딩(#3A78A3, #628db6)은 배경 폴백이 덮는다. 나머지 행(브레드크럼, `.current-project`, 검색 레이블, 헤더 아이콘, 토글 구분선, 펼침 캐럿)은 자체 밝은 선언이 없어 부모 선언을 상속하거나 장식이고, 헤더 아이콘은 코어 stroke가 어두워(#343a40, 흰 바탕 11.51:1) 흰 헤더에서도 보인다. 이 행들은 테마가 토큰으로 맞추는 대상이다. 코어가 헤더 마크업이나 규칙을 바꾸면(향후 7.x 패치·마이너) 새 밝은 글자 선언이 목록 밖에 생겨 조용히 보이지 않게 될 수 있음 | 목록을 이 문서에 파일·행 단위로 두고, 기준 버전을 올릴 때마다 코어 `application.css`·`responsive.css`의 `#header`, `#quick-search`, `#project-jump`, `.mobile-toggle-button`, `.flyout-menu` 규칙과, Calm 프리셋의 밝은 상단 바에 걸리는 `#top-menu`·`#account` 규칙(§8.4 12)을 다시 감사해 목록과 assert를 함께 고친다(§4.12, §12). 일반 자손 규칙이 목록 밖 요소의 기본값을 잡는다. 목록 안의 회귀는 요소별 assert가, 목록 밖의 누락은 헤더 영역 axe-core 검사와 릴리스마다의 7.0.2 스크린샷(1440·800px)이 드러낸다(§10.2) |
| 헤더에 콘텐츠를 넣는 플러그인 (미검증: 개별 플러그인을 시험하지 않았다) | 플러그인이 JS·CSS로 헤더에 넣은 링크·아이콘·글자가 코어의 밝은 글자 전제에 맞춰 흰색 계열이나 흰 래스터 아이콘을 직접 쓰면 흰 헤더에서 읽히지 않음. 코어 레이아웃은 `#header` 안에 훅 출력 지점이 없으므로 주로 `view_layouts_base_html_head` 훅의 JS·CSS, `view_layouts_base_body_top`·`view_layouts_base_body_bottom` 훅의 JS, 메뉴 API로 들어온다. `html_head` 훅은 테마 스타일시트 뒤에 출력되므로(7.0.2 `base.html.erb` 17행) 그 CSS는 같은 명시도에서 테마 규칙을 이긴다(§8.4 12) | 테마는 헤더의 일반 자손(`#header`의 `color`, `#header a`와 hover·포커스, `#header svg.icon-svg` stroke, `#header svg.icon-svg-filled` fill)에 헤더 토큰을 명시해, 색을 직접 지정하지 않은 플러그인 콘텐츠가 흰 헤더에서 읽히게 한다. 메뉴 API로 들어온 메인 메뉴 항목은 nav 규칙이 칠한다. 플러그인이 직접 지정한 색이나 래스터 이미지, 테마보다 나중에 로드되어 같은 명시도에서 이기는 플러그인 CSS, JS가 인라인으로 준 색은 플러그인 쪽 문제라서 범위 밖이다. 그런 플러그인을 쓰는 설치는 Ink 프리셋(어두운 헤더, §6.3)을 `custom.css`나 자식 테마에 넣는다고 README에 적는다 |
| 향후 7.x 패치·마이너가 코어 크롬을 바꿈(7.0.2가 크롬 배경 변수, 메인 메뉴 탭 padding·line-height, `.profile-menu` 28px 예약, hover radius를 바꾼 것처럼, §8.4) | 테마가 모르는 새 코어 규칙이나 옮겨진 행 때문에 흰 헤더 글자가 보이지 않거나 크롬 배경·높이가 달라짐. 이 문서의 행 번호와 재칠 목록이 실제 코어와 어긋남. 새 패치에만 있는 기능에 기대면 이전 패치(지원 범위 안)가 깨짐 | 재검증 절차. (1) 새 이미지 태그(예: `redmine:7.0.3`)와 현재 기준 이미지에서 `app`, `lib`, `config`, `Gemfile.lock`을 꺼내(`docker run --rm --entrypoint sh <이미지> -c 'cd /usr/src/redmine && tar cf - app lib config Gemfile.lock' \| tar xf - -C <디렉터리>`) `diff -rq`로 바뀐 파일을 먼저 찾는다(§8.4가 쓴 방법). 그중 반드시 내용을 비교할 것은 `app/assets/stylesheets/` 디렉터리 전체(`application.css`, `responsive.css`, `dropdown.css`, `open-color.css`, `context_menu.css`, `jstoolbar.css`, `gantt.css`, `scm.css` 등), `app/views/layouts/base.html.erb`, `app/helpers/application_helper.rb`·`icons_helper.rb`, `lib/redmine/themes.rb`·`asset_path.rb`, `config/initializers/`(`10-patches.rb`, `30-redmine.rb` 등), `Gemfile.lock`의 Propshaft 버전(§4.4의 `ASSET_URL_PATTERN` 근거)이다. (2) `:root`의 코어 변수 목록이 바뀌었으면 §8.4 5와 §6.2 브리지를 고친다. 새 의미 변수는 크롬 토큰으로 재매핑하되 이전 패치용 셀렉터 폴백을 둔다. (3) `#header`, `#top-menu`, `#account`, `#quick-search`, `#project-jump`, `#main-menu`, `.profile-menu`, `.mobile-toggle-button`, `.flyout-menu` 규칙을 다시 감사해 §8.4 12·§8.6 목록과 행 번호, §10.2 3 assert를 고친다. (4) 매트릭스의 크롬 조합(크롬이 보이는 대표 페이지, 기본과 대안 크롬 프리셋 4종, 1440·800px, 익명·admin, §10.4)과 헤더 axe-core를 새 이미지로 돌린다. (5) 통과하면 compose 태그, 이 문서(§8.4 패치 차이 표 포함), `CLAUDE.md`, README를 같은 커밋에서 고친다(§4.12, §12). 릴리스마다 페이지 카탈로그 스크린샷(Bleuclair 방식)을 남긴다 |
| 이미지 태그를 부동 태그(`redmine:7`)로 되돌려 테스트 기준이 조용히 바뀜 | `docker compose pull` 뒤 결과표와 문서의 버전(7.0.2)이 실제 컨테이너와 달라짐 | compose는 `redmine:7.0.2`로 고정했다. 결과표에 `Redmine::VERSION`을 적는다(§4.12). 기준을 올릴 때는 위 재검증 절차로 태그와 문서를 함께 고친다 |
| jsDelivr 장애·일시 차단 | Pretendard 대신 시스템 폰트로 표시. 첫 페인트와 글자 표시는 늦어지지 않는다(Phase 0 2a). 요청이 응답 없이 버려지면 연결 시간 초과까지 window `load`가 늦어져, 그동안 저장하지 않은 변경 경고가 등록되지 않는다(일괄 편집 "지우기"는 표시만 다르다, §4.4) | 설계: CDN 스타일시트를 `@import`하지 않고 `@font-face`만 생성한다. `font-display: swap`이라 글자는 폴백으로 바로 그려진다(§4.4). 행간을 단위 없는 값으로 명시해 폰트가 바뀌어도 줄 높이가 같게 한다(§7.3). 폴백: 장애가 오래 이어지면 README의 "시스템 폰트만 쓰기" 블록이나 자체 호스팅(§4.4)으로 CDN 요청을 없앤다. 요청이 응답 없이 버려지는 환경은 아래 "CDN 차단 때 렌더링이나 `load`가 늦어짐" 행대로 둘 중 하나가 필수다 |
| CDN 폰트 URL이 기동 때 재작성됨 (Phase 0 1 통과로 7.0.2·7.0.1에서 해당 없음. 이후 7.x 패치나 Propshaft 갱신 때를 위한 기록) | 서빙된 CSS의 폰트 URL이 잘못된 경로가 되어 폰트 요청이 실패하고 모든 설치에서 시스템 폰트로 표시 | 기준 버전을 올릴 때 §4.4의 URL 비교를 반복한다. 재작성되면 재작성한 코드와 규칙을 새 소스에서 찾아 기록한다. 그 규칙이 건드리지 않는 URL 표기 가운데 새 버전과 지원 범위의 이전 패치에서 모두 보존되는 것을 골라 생성 스크립트의 출력 형식을 바꾼다. 후보는 따옴표로 감싼 URL과 프로토콜 상대 URL(`//cdn.jsdelivr.net/…`, Propshaft 패턴이 제외하는 형태)이다. 바꾼 형식은 Phase 0 1 방법으로 다시 확인하고, CI 폰트 검사(§10.2)의 기대 형식도 맞춘다. 어떤 표기로도 보존되지 않으면 기준 버전을 올리기 전에 구현 경로를 소유자와 다시 정한다(CDN 기본이라는 결정 기록 #4는 유지) |
| CDN 차단 때 렌더링이나 `load`가 늦어짐 (Phase 0 2: 렌더링은 해당 없음, `load`는 확인) | 첫 화면과 첫 글자는 늦어지지 않는다(2a). 요청을 응답 없이 버리는 방화벽·폐쇄망에서는 페이지마다 연결 시간 초과까지 `load`가 늦어지고(macOS 225–300초, 다른 OS는 미검증), 그동안 저장하지 않은 변경 경고가 없어 편집 중 이동하면 입력이 경고 없이 사라진다. `load` 전에 입력한 내용은 `load` 뒤에도 보호되지 않는다(2d·2f). DNS 실패·연결 거절은 영향이 없다 | 적용한다. 원인은 폰트 요청뿐이다(2c: 폰트가 아닌 CDN 요청 0건, 끝나지 않은 요청은 폰트 요청뿐). CSS만으로는 걸린 요청을 짧게 끊을 수 없으므로, README 폐쇄망 항목에서 요청을 응답 없이 버리는 망에는 "시스템 폰트만 쓰기" 블록이나 자체 호스팅을 선택이 아니라 필수 절차로 적고, 증상(빈 화면이 아니라 `load` 지연과 경고 누락)을 함께 적는다. 측정값을 모든 환경의 값으로 적지 않는다. README 설치 안내 첫머리에 "브라우저가 `cdn.jsdelivr.net`에 닿는지" 확인 단계를 둔다. 기본값(CDN)은 바꾸지 않는다(결정 기록 #4) |
| 폐쇄망 설치 | Pretendard 없이 시스템 폰트로 표시. 요청을 응답 없이 버리는 망은 `load` 지연과 경고 누락(위 행) | README에 폴백 동작, CDN 요청을 없애는 "시스템 폰트만 쓰기" 블록, 자체 호스팅 레시피(§4.4, §4.5)를 적고, 요청을 응답 없이 버리는 망에서는 둘 중 하나가 필수라고 적는다 |
| CSP `font-src` 제한(예: `'self'`) | 폰트 요청이 차단돼 시스템 폰트로 표시된다. 콘솔에 CSP 위반이 기록되고, 보고 설정(`report-to`·`report-uri`)이 있으면 위반 보고가 전송됨 | README에 `font-src https://cdn.jsdelivr.net` 허용 또는 자체 호스팅을 안내한다. CDN 스타일시트를 쓰지 않으므로 `style-src`는 바꿀 필요가 없다 |
| 개인정보: 방문자 IP와 Redmine origin(경로 없음)이 jsDelivr로 감(Phase 0 1c, Chrome 154) | 외부 요청을 허용하지 않는 조직은 기본값을 그대로 쓸 수 없음. 페이지 응답의 정책만 엄격하게 바꾼 관리자는 폰트 요청의 origin도 막았다고 잘못 알 수 있음 | README에 전송되는 정보를 관찰한 범위로 적는다(§4.4). Referer는 페이지가 아니라 테마 스타일시트의 정책을 따르고 기본은 경로 없는 origin이며, CORS 요청이라 `Origin` 헤더로도 origin이 간다. 페이지 응답의 정책만 바꾸면 효과가 없고, `/assets` 응답에 `no-referrer`를 보내도 `Origin`은 남는다. origin을 보내지 않으려면 "시스템 폰트만 쓰기" 블록이나 자체 호스팅 레시피를 쓴다. Firefox·Safari의 동작은 확인하지 않았다 (미검증) |
| 중국 본토의 jsDelivr 접속 불안정(jsDelivr는 2021-12-20 중국 ICP 라이선스를 잃었고 중국 트래픽은 본토 밖 CDN이 맡는다고 밝혔다, jsdelivr/jsdelivr 이슈 #18348·#18552) (미검증: 현재 접속 품질) | 폰트 로드가 늦거나 실패 | README에 적고 자체 호스팅을 권한다(§4.4) |
| 업스트림 갱신 누락, CDN 경로 변경 | 오래된 폰트를 계속 씀. 드물게 경로가 바뀌면 폰트가 폴백으로 나옴 | v1.3.9를 npm 경로로 고정한다(npm 문서 "npm Unpublish Policy": 한 번 쓴 `package@version`은 다시 쓸 수 없다. jsDelivr가 그대로 서빙하는지는 미검증). 저장소 유지관리자가 갱신을 맡고, 생성 스크립트가 모든 URL의 200·`font/woff2`를 확인한다(§4.4) |
| 자체 호스팅으로 덮어도 CDN 조각이 요청됨 | 폐쇄망·CSP 환경에서 불필요한 요청. CSP 환경에서는 콘솔에 CSP 위반이 기록되고, 보고 설정이 있으면 위반 보고가 전송됨. `--ravnus-font-sans`만 바꾸면 ja·zh·zh-TW UI에서 한글이 있는 페이지마다 조각을 요청한다(Phase 0 3c) | 예약 글꼴명이 없는 다른 family 이름(예: `"RAVNUS Sans Local"`)을 쓰고 네 폰트 스택 토큰을 모두 바꾸게 안내한다(§4.4). 테마 CSS가 `"Pretendard Variable"`을 `@font-face`와 네 폰트 스택 토큰 밖에서 쓰지 못하게 CI가 막는다(§10.2 6). Phase 0 3에서 네 스택을 모두 바꾸면 ko·en·ja·zh·zh-TW UI의 CDN 요청이 0건임을 `custom.css` 흉내로 확인했고, Phase 1에서 실제 네 스택 테마로 다시 잰다(자식 테마로 네 스택을 바꾸는 경우 포함). 요청이 남으면 원인(남은 스택 이름, `font-family`를 따로 지정한 셀렉터 등)을 기록해 README 레시피에 바꿔야 할 곳을 더한다 |
| `custom.css`나 자식 테마 import 실패 (Phase 0 5: 7.0.2에서 해당 없음. 5.x식 경로와 `url()` 없는 문자열 import만 실패) | 업데이트 안전 경로와 폰트 자체 호스팅 경로가 없음. 잘못된 import 형식을 쓰면 페이지 스타일이 모두 빠짐 | README 자식 테마 안내에 `url(../ravnus/application.css)`를 권하고 실패 형식을 경고한다(§4.5). 이후 패치에서 import가 실패하면 상단 블록 수정(B)만 안내하고, 로컬 브랜치 리베이스 가이드를 둔다. 자체 호스팅은 컴파일 파일의 `--ravnus-font-sans`와 `@font-face` 수정으로 안내하고, 업데이트 때 덮인다고 적는다 |
| 수정 시각이 오래된 파일로 테마나 `custom.css`를 바꿈(`cp -p`, `rsync -a`, 시각을 보존하는 압축 해제) | 재시작해도 이전 스타일이 서빙되고 오류가 없음. 기동 때 재컴파일은 manifest보다 새로운 파일이 있을 때만 일어난다(Phase 0 5b, §4.5) | README.md·README.ko.md 설치 절에 "재시작해도 바뀐 CSS가 반영되지 않으면 바꾼 파일을 `touch`하고 다시 재시작한다"를 적었다. `git pull`이나 편집기로 저장한 파일은 해당하지 않는다. zip으로 테마를 업데이트할 때도 같을 것으로 본다 (미검증). 이전 digest 파일은 `public/assets`에 남는다 |
| 추적 중인 `custom.css`를 고친 뒤 `git pull` 거부(`pull.rebase=true`로 설정한 저장소, 로컬 git 2.52.0 확인) | 업데이트가 막혀 사용자가 파일을 지우거나 덮어씀 | README에 `git pull --autostash` 또는 로컬 커밋 후 `git pull --rebase`를 안내한다 |
| PurpleMine 연상 (미검증: 사용자 인상) | 테마 인상이 약해짐 | 기본 크롬 Signature는 흰 헤더에 2rem 브랜드 바이올렛 상단 바 한 줄이라 헤더 전체가 보라인 PurpleMine과 구성이 다르다. Ink 프리셋은 PurpleMine(`#614BA6`)보다 어둡고 채도가 낮다. 로고를 쓰지 않는다. 브랜드 색을 쓰지 않는 Redmine Blue 프리셋(§6.3)을 둔다. 브랜드 색 사용은 소유자가 확인했다(§4.1) |
| 밀도 증가(25px에서 32px) | 파워 유저 불만, 화면당 행 약 22% 감소(계산) | Compact 프리셋 한 블록, 짧은 이름·날짜 열은 `nowrap` 유지. 코어 25px는 Pretendard 로드 상태에서도 같음을 확인했고(Phase 0 8, §4.8), 테마 행은 Phase 3에서 잰다 |
| 크롬 높이 증가(프로토타입을 7.0.1에서 측정해 기본 Signature 약 120px(상단 바 32 + 헤더 88), Ink·Calm·Redmine Blue 116px, 작업 자료의 코어 7.0.1은 104px. 7.0.2 코어는 익명 118px(2026-10-01 측정, §4.1)라 7.0.2 기준으로는 Signature가 약 2px 크고 Ink 등은 약 2px 작다. 미검증: 측정 조건이 달라 직접 비교할 수 없고, Phase 2에서 경계선을 포함한 최종 CSS로 7.0.2에서 재측정) | 본문 영역 감소(7.0.1 코어 대비 기본 Signature 13.5–16px, Ink 등 9.5–12px. 7.0.2 코어 대비로는 ±2px 안팎) | rem과 min-block-size 사용, 상단 바 높이 토큰 `--ravnus-topbar-height`(기본 2rem, 1.75rem으로 줄일 수 있음), Phase 2 재측정 후 조정 |
| UI 언어와 콘텐츠 언어가 다름 | ko·en UI에서 일본어·중국어 줄바꿈이 어색하고, ja·zh UI에서 한국어가 음절 단위로 끊김 | overflow-wrap 안전망과 제목 최소 폭 토큰. 스크립트 감지는 v2에서 검토 |
| 코어 `overflow: hidden`과 고정 높이(`.tabular p`, `#content .tabs`) | 포커스 링과 CJK 글자가 잘림(WCAG 2.4.7, 1.4.12) | §8.1 폼·탭 행의 수정, Phase 4·6 프로브 스크린샷 |
| forced-colors와 배경 그래픽을 끈 인쇄에서 CSS 글리프 소실 | 고대비 사용자와 흑백 인쇄물에서 우선순위·상태·지연 구분 불가 | 테두리 기반 모양 우선, §8.8·§8.9 규칙, 매트릭스 에뮬레이션 |
| 토큰 쌍 게이트가 코어 하드코딩 색을 못 잡음 | "모든 텍스트 4.5:1" 약속이 깨짐 | 렌더 화면 axe-core 검사(§10.2), 그룹 행·합계 명시 스타일(§6.5) |
| 플러그인의 하드코딩 색, 레거시 래스터 아이콘 | 토큰을 따르지 않는 화면 | 플러그인 CSS는 v1 범위 밖이다. 일반화할 수 있는 호환 수정만 공개 저장소에 받고, 배포별 수정은 자식 테마나 `custom.css`에 둔다 |
| 주 버튼 오지정 | 삭제 버튼이 강조됨 | allowlist와 7.0.2 페이지 감사 |
| color-mix 미지원 구형 브라우저 | 선택 행·탭 틴트가 빠짐. 사용자 `:root`에 color-mix 식을 적으면 테마 폴백이 덮지 못해 그 속성이 무효가 됨(예: 상단 바가 투명해져 흰 페이지 위 흰 상단 메뉴 글자) | 빌드로 생성한 `@supports` 폴백. README 프리셋 블록의 파생값은 리터럴 hex로 싣고 CI가 계산값과 대조한다(§5.4, §10.2 6). README에 브라우저 하한과 "노브는 리터럴로 적는다"를 적는다 |
| 사용자가 고른 강조색의 명암 실패 | 흰 글자가 읽히지 않음. 기본 Signature에서는 상단 바가 강조색을 따르므로, 고정값인 상단 바 보조 글자(#CAC5EA)와 앰버 링(#FEA800)의 명암도 떨어짐(예: `#0b6e4f` 위 3.78:1, 3.22:1) | `--ravnus-on-accent` 노브와 README 경고. 강조색을 바꾸면 `--ravnus-topbar-fg-muted`와 `--ravnus-topbar-focus`도 바꾼다고 §4.5 예시와 README에 적는다(§5.4 명암 한계). CI는 프리셋만 보장한다 |
| iOS Safari 입력 확대 (미검증) | 모바일에서 입력 포커스 때 화면이 확대됨 | §8.6 열린 항목. 실기 확인 후 결정 |
| 테마 CSS와 테마 안 자체 호스팅 폰트의 캐시 헤더 없음(로컬 컨테이너 `/assets` 응답에 `Cache-Control` 없음) | 재방문 때 다시 받음 | README에 리버스 프록시 장기 캐시 설정을 안내한다. CDN 폰트는 jsDelivr가 1년 immutable 캐시 헤더를 보낸다 |
| Windows 일본어 Yu Gothic이 얇게 나옴 (미검증) | ja 가독성 저하 | `local()` 별칭 `@font-face`, Windows 실기 확인 |
| Pygments hex 44–48개, `url()` 이미지 아이콘 | 다크 모드를 막음 | v1은 유지하고, 다크 작업 전에 토큰화·대체한다 |
| 헤더의 절대 위치 메인 메뉴와 긴 제목 겹침 | 제목과 탭이 겹침 | 예약 패딩을 nav 토큰과 같게 하고, 긴 이름으로 테스트한다 |
| 토큰 기반 경쟁 테마 등장(Gitmike v2 토큰화 진행 중) | 차별점 약화 | README 전면에 CJK 타이포와 빌드 없는 커스터마이즈를 내세운다 |
| 공수 초과 | 일정 지연 | 단계별 릴리스(§12). Phase 8 색 칠하기는 v1.x로 미룰 수 있다 |

---

## 12. 로드맵

| 단계 | 범위 | 산출물 | 예상 공수 (미검증 추정) |
|---|---|---|---|
| 결정 (2026-09-26 완료, 2026-10-01 #1·#7 변경) | 소유자 결정 6건(RAVNUS Inc. 브랜드 색 사용 확인 포함, 부록 "결정 기록"). 2026-10-01 기본 크롬을 A(Ink)에서 B(Signature)로 바꾸고 #2·#4를 다시 확인했으며, 지원 범위를 Redmine 7.x 전용으로 바꿈(#7) | `CLAUDE.md` "디자인 결정"·"지원 범위"·"Redmine 7 테마 동작"(7.0.0–7.0.1 폴백 범위 포함)·"진행 상태" 반영. 구현 단계의 문서 수정은 아래 문서 반영 규칙 | — |
| Phase 0 (완료, 2026-10-01) | 검증 스파이크(CDN `@font-face` 보존·차단 폴백·자체 호스팅 확인, 7.0.2 로그인 크롬 캡처, 7.0.2 코어 변수 브리지 확인, 7.0.1 변수 부재 확인) | 검증 결과표(부록 "Phase 0 검증 결과"), 실패 항목(`load` 지연)의 대응(§11) | 1.5–2일(추정) |
| v0.1.0 | Phase 1 | `src/_tokens.scss` 3계층 + 프리셋 주석, `src/_typography.scss`, 코어 의미 변수 재매핑(`--fonts-main`·`--color-current-marker`만. 크롬 배경 변수는 v0.2.0, §4.5), Pretendard `@font-face` 생성 스크립트 `src/tools/pretendard-font-face.mjs`(`npm run fonts`)와 생성 파일 `src/_pretendard.scss`(CDN `@font-face` 92개, 컴파일 결과 `stylesheets/application.css`에 포함), `stylesheets/custom.css` 빈 스텁, README.md·README.ko.md의 Pretendard 크레딧·OFL 고지와 CDN 안내(§4.4. 개인정보는 Phase 0에서 관찰한 Referer·Origin, 폐쇄망은 요청을 버리는 망의 필수 절차와 증상), 커스터마이즈 절(`custom.css` 방식, `git pull --autostash`, 자식 테마 `@import url(../ravnus/application.css);`와 실패 형식 경고, 자식 테마 `:root`가 부모 `custom.css`를 이긴다는 우선순위, 폰트 블록은 네 폰트 토큰을 모두 바꿈, §4.5), `.github/workflows/`(빌드 비교 + 명암 게이트 + 폰트 검사: CDN `@font-face` 수가 생성 파일과 같음(v1.3.9는 92개), 모든 폰트 URL이 고정 버전 접두사(생성 스크립트의 버전 상수에서 만든 값, 현재 `https://cdn.jsdelivr.net/npm/pretendard@1.3.9/`)로 시작, 외부 스타일시트 `@import` 없음, 주석을 뺀 첫 두 규칙이 코어·`custom.css` import, `"Pretendard Variable"`은 `@font-face`와 네 폰트 스택 토큰에만, §10.2), 프로브 하네스와 axe-core 검사 | 4–4.5일 |
| v0.2.0 | Phase 2–3 | `src/components/_index.scss`, `_chrome.scss`(기본 Signature, 코어 변수 브리지(크롬 배경 변수 재매핑. 흰 헤더 재칠과 같은 릴리스에만 싣고 v0.1.0에는 넣지 않는다, §4.5)와 7.0.0–7.0.1 배경 폴백 §8.4 "7.0.0–7.0.1 대응", 흰 헤더 재칠 목록 §8.4 12와 §8.6 전체(모바일 헤더, flyout 글자·h3 글자와 선·구분선·검색 입력, "밝은 flyout" 규칙. 브리지가 flyout 표면과 h3 띠를 칠하므로 함께 싣는다, §4.5), 크롬 경계선), `_sidebar.scss`, `_issue-list.scss`(그룹 행, forced-colors·인쇄 포함), 흰 헤더 요소별 계산 스타일 assert(800px은 flyout을 연 상태 포함), 기본 Signature와 Ink 프리셋 비교 스크린샷, README 대안 크롬 프리셋 블록(Ink, Brand-forward, Calm, Redmine Blue)과 스크린샷(§4.1), README에 헤더 플러그인과 Ink 프리셋 안내(§11), 강조색을 바꾸면 상단 바 보조 글자와 앰버 링도 바꾼다는 커스터마이즈 안내(§5.4) | 6.5–7.5일 (Phase 2 후 확정) |
| v0.3.0 | Phase 4–5 | `_issue.scss`, `_journal.scss`, `_forms.scss`, `_wiki.scss`(jstoolbar 포함), 주 버튼 allowlist | 5일 |
| v0.4.0 | Phase 6–8 | `_messages.scss`, `_overlays.scss`, `_mobile.scss`, `_misc.scss` | 4–5일 |
| v1.0.0 | Phase 9 | README.md와 README.ko.md(설치, 재시작·precompile 트러블슈팅을 맨 앞에, 커스터마이즈 3방법, 업데이트 절차(`git pull --autostash`), 프리셋 블록, Pretendard 크레딧·OFL 고지, CDN 폰트 안내(개인정보와 Phase 0에서 관찰한 Referer, CSP `font-src`, 폐쇄망 폴백, 중국 본토), 폰트 자체 호스팅 레시피와 "시스템 폰트만 쓰기" 블록(`custom.css`·자식 테마), 테마 CSS 캐시 권장), 스크린샷(`.github/` 또는 images 브랜치), redmine.org Theme_List 항목, 태그 | 2.5–3일 |
| v1.x | 안정화 | 일반화할 수 있는 플러그인 호환 수정, 밀도·본문 폭 기본값 조정, 사용자 피드백 반영, iOS 입력 크기 결정 반영 | 별도 |
| v2 | 확장 | 다크 토큰 세트, Pygments 토큰화와 `url()` 이미지 대체, Pretendard JP opt-in(§4.4 CDN 방식), 테마 아이콘 스프라이트, theme.js 기능 검토(콘텐츠 언어 감지 등. 레이아웃 변경은 제외, §4.2) | 별도 |

v1.0까지 약 24–27인일로 추정한다 (미검증). 원래 Ink & Paper 추정치는 18–22인일이었고, 가져온 요소(커스터마이즈 경로, 읽기 레이어, 검증 스파이크)로 24–26인일이 됐다. 여기에 검토 반영분(axe-core, forced-colors·인쇄, jstoolbar, 포커스 링)만큼 늘렸다. §4.2 결정(스타일만 변경)을 전제로 한 추정이다. §4.4 결정으로 폰트 번들 작업이 빠지고 생성 스크립트와 CDN 확인이 들어왔으며, 둘의 공수는 비슷하다고 보고 합계를 그대로 두었다 (미검증 추정). 2026-10-01 §4.1 변경으로 v0.2.0에 다음 작업이 늘었다. 흰 헤더 재칠 대상 약 15행(데스크톱 9행, 모바일 6행, §11), 1440·800px 요소별 계산 스타일 assert, 크롬 경계선(헤더와 메뉴 바, 상단 바와 헤더, 모바일 헤더 아래, 메뉴 바와 본문, §6.2), 텍스트 입력 포커스 복원과 상단 바 드롭다운 제외 규칙, README 프리셋 블록의 리터럴 파생값과 그 CI 대조, Signature와 Ink의 나란히 비교다. 그래서 v0.2.0을 7일에서 7–8일로, 합계를 27–29인일에서 27–30인일로 늘려 잡았었다. 같은 날 지원 범위가 7.x 전용으로 바뀌어(#7) 6/7 동등성 작업이 빠졌다. 6.0.x 확인, 6.x 기준선까지 함께 맞추던 리셋과 그 6/7 비교(단일 7.x 기준선의 명시적 리셋은 남는다, §8.4 1–3), 모든 단계의 두 버전 스크린샷·assert·페이지 감사, 매트릭스의 Redmine 축 절반이다. 대신 7.0.2 코어 변수 브리지와 7.0.0–7.0.1 배경 폴백, 7.0.1 spot check, autologin 토큰 하네스가 조금 들었다. 그래서 Phase 0을 2–2.5일에서 1.5–2일로, v0.1.0을 4.5일에서 4–4.5일로, v0.2.0을 7–8일에서 6–7일로, v0.3.0을 5.5일에서 5일로, v0.4.0을 5–6일에서 4.5–5.5일로, v1.0.0을 3일에서 2.5–3일로 낮췄다. 합계는 27–30인일에서 약 24–27인일이다. Phase 0 뒤 flyout 재칠과 "밝은 flyout" 규칙을 v0.4.0(Phase 7)에서 v0.2.0으로 옮겼다(브리지가 flyout 표면을 칠하므로, §4.5). 그래서 v0.2.0을 6–7일에서 6.5–7.5일로 늘리고 v0.4.0을 4.5–5.5일에서 4–5일로 줄였다. 같은 작업을 옮긴 것이라 합계는 그대로 두었다. 모두 추정이며 Phase 2가 끝나면 실제 공수로 확정한다 (미검증 추정).

**문서 반영 규칙**: 2026-09-26 소유자 결정은 `CLAUDE.md`의 "디자인 결정"과 관련 규칙(작성 규칙, CJK 타이포그래피, 테마 동작 절(지금 이름은 "Redmine 7 테마 동작"), 남은 확인 사항(지금은 "진행 상태"))에 반영했다. 2026-10-01 #1 변경(기본 크롬 Signature, Ink는 README 프리셋)은 `CLAUDE.md` "디자인 결정"의 크롬·컬러 항목에 반영했다. 2026-10-01 #7 변경(지원 범위 Redmine 7.x 전용)과 테스트 기준 `redmine:7.0.2`는 `CLAUDE.md` "지원 범위"·"Redmine 7 테마 동작"(코어 의미 변수 재매핑과 7.0.0–7.0.1의 헤더·상단 바·모바일 헤더·flyout(h3 띠 포함) 배경 폴백 포함)·디렉터리 구조·개발 명령, README.md·README.ko.md의 소개·요구 사항·테스트 환경 절, `docker-compose.yml`(서비스 `redmine` 하나, `redmine:7.0.2`, 127.0.0.1:3007, `REDMINE_PORT`)에 반영했다. 구현 단계에서 함께 고칠 것은 다음과 같다.
- Phase 0 후(완료, 2026-10-01): 자식 테마 import 형식과 실패 형식, `custom.css`·자식 테마의 `url(../fonts/…)` 재작성 경로, 수정 시각 조건과 `touch` 후 재시작, 요청을 버리는 폐쇄망의 필수 절차, 진행 상태를 `CLAUDE.md`("Redmine 7 테마 동작", "폰트 제공", "진행 상태")에, `touch` 후 재시작 안내를 README.md·README.ko.md 설치 절에 반영했다. CDN 안내와 커스터마이즈 절의 Phase 0 결과는 v0.1.0 README에 싣는다(§4.4, §4.5).
- Phase 1(v0.1.0): 파일을 만들 때 디렉터리 구조에 `src/tools/`, `src/_pretendard.scss`, `stylesheets/custom.css`를 추가한다(빈 placeholder를 만들지 않는 규칙). 작성 규칙에 "`src/_pretendard.scss`는 생성 파일이므로 직접 고치지 않고, 버전 상수를 바꿔 `npm run fonts`로 다시 만든다"를 넣고 `package.json` 설명에 `fonts` 스크립트를 적는다. 코어 import 규칙에 "`custom.css` import는 주석을 뺀 둘째 규칙"을 더하고, CI 문장에 폰트 검사를 넣는다. README의 커스터마이즈 절을 `custom.css` 방식과 `git pull --autostash` 안내로 바꾼다.
- `_tokens.scss`를 나누면 hex 금지 문구를 고친다(§5.1).
- 테스트 기준 버전(7.x 패치·마이너)을 올릴 때(§4.12): §11 "향후 7.x 패치가 코어 크롬을 바꿈"의 재검증 절차를 따른다. compose 태그, 이 문서의 코어 인용(파일·행 번호, §8.4 패치 차이 표), `CLAUDE.md` "지원 범위"의 기준 태그와 "Redmine 7 테마 동작"의 코어 변수 목록, README 테스트 환경 절을 같은 커밋에서 고친다. 코어 변수 목록(§8.4 5), 흰 헤더 재칠 목록(§8.4 12, §8.6), 헤더 계산 스타일 assert(§10.2 3)도 새 코어에서 다시 읽어 고친다.
- 지원 하한을 올릴 때(예: 7.0.2 이상만 지원): `CLAUDE.md` "지원 범위", README 요구 사항, §4.12를 고치고, 그 아래 패치용 배경 폴백(§8.4 "7.0.0–7.0.1 대응", §8.6)을 지운다.

문서 위치의 근거: Redmine은 `src`와 dot-디렉터리를 뺀 테마 하위 디렉터리를 모두 `/assets/themes/ravnus/` 아래에 서빙하고(7.0.2 `lib/redmine/themes.rb` 131–139행 `asset_paths`, `lib/redmine/asset_path.rb`는 확장자를 거르지 않음) 루트 파일은 서빙하지 않는다. 그래서 이 문서는 `docs/` 같은 하위 디렉터리가 아니라 저장소 루트의 `DESIGN.md`로 둔다.

설치·커스터마이즈·업데이트 방법이 바뀌면 README.md와 README.ko.md를 함께 갱신한다.

---

## 부록: Phase 0 검증 결과 (2026-10-01, Redmine 7.0.2)

> 환경: `redmine:7.0.2` 도커(컨테이너 `Redmine::VERSION` = `7.0.2.stable`, Propshaft 1.3.2, 127.0.0.1 전용). 항목 1·6·10에서는 비교용으로 `redmine:7.0.1`(`7.0.1.stable`)을 커밋하지 않는 compose override로 1회 띄웠다. 브라우저는 headless Chrome 154.0.8037.58(playwright-core)이고 실행마다 새 컨텍스트를 썼다(캐시 없음). OS는 macOS(Hiragino·PingFang·Apple SD Gothic Neo 있음), 기본 창 크기는 1440×900이다. 모두 로컬 측정이며 운영 검증이 아니다. Windows·Linux·Firefox·Safari는 재지 않았다.
> 시험 테마는 Phase 1 테마가 아니라 스파이크 빌드다. 코어 import, `custom.css` import, 생성한 `@font-face` 92개(Pretendard 1.3.9 npm 경로), `:where(:root)`의 `--ravnus-font-sans` 하나, `:root { --fonts-main: var(--ravnus-font-sans) }`로 이뤄진다. §7.1의 `-ja`·`-zh`·`-zh-tw` 스택이 없어서 네 스택이 필요한 확인(3c, 4의 ja·zh)은 `custom.css`로 §7.1 토큰 층을 흉내 내 쟀다. 로그인은 `rails runner`로 만든 autologin 토큰 쿠키만 썼고 로그인 폼과 비밀번호는 쓰지 않았다. 토큰은 시험 데이터 볼륨과 함께 지웠다. 증거 파일(JSON, 서빙된 CSS 사본, 스크린샷, 캡처한 마크업)은 저장소에 싣지 않는다.

**요약**: 렌더링, URL 보존, 커스터마이즈 경로, 자체 호스팅은 모두 통과했다. 실패는 2의 `load` 지연과 그에 묶인 저장하지 않은 변경 경고뿐이고, §11의 해당 대응을 `load`에 한정해 적용했다. 7.0.2 브리지를 테마 CSS 안에 선언했을 때의 동작과 7.0.1 폴백은 Phase 2로, 실제 네 스택 테마의 덮기 매트릭스는 Phase 1로 넘겼다.

| 항목 | 결과 | 방법 | 근거 | 반영한 곳 |
|---|---|---|---|---|
| 1a. CDN `@font-face` URL 보존 | 통과 | 서빙된 테마 CSS와 컴파일 파일에서 `https:` `url()`을 모두 뽑아 위치와 글자 단위로 비교하고, 두 파일을 행 단위로 diff했다. 7.0.1에서 반복했다 | 7.0.2와 7.0.1 모두 92/92 일치. 불일치 0, 순서와 목록 해시가 같고 따옴표가 없으며 모두 `https://cdn.jsdelivr.net/npm/pretendard@1.3.9/`로 시작한다. 두 파일은 재작성된 import 두 줄만 다르다 | §4.4 "CDN URL은 기동 때 재작성되지 않는다", §11 해당 행(해당 없음). 생성 형식과 CI의 URL 문자열 비교는 유지 |
| 1b. 폰트 요청 대상과 응답 | 통과 | 4페이지 × ko·ja·zh × 두 변형으로 24회 실행했다. 폰트 요청마다 호스트, 상태, content-type, 접두사를 생성 목록과 대조했다 | 모든 요청이 `cdn.jsdelivr.net`으로 가서 200 `font/woff2`를 받았고, 모두 고정 접두사로 시작하며 생성 목록 안에 있다. 실패와 대기는 0이다. 응답 헤더는 `access-control-allow-origin: *`, `cache-control: public, max-age=31536000, s-maxage=31536000, immutable`, `x-jsd-version: 1.3.9`다 | 변경 없음(§4.4 캐시·CORS 서술 유지) |
| 1c. Referer와 Referrer-Policy | 통과(문구 수정) | 요청·응답 헤더를 기록했다. HTML 문서와 `/assets/*.css` 응답의 `Referrer-Policy`를 따로 바꿔 넣었다(`no-referrer`, `unsafe-url`) | HTML 응답은 `strict-origin-when-cross-origin`이다(7.0.2·7.0.1). `/assets` CSS 응답에는 `Referrer-Policy`와 `Cache-Control`이 없다. 폰트 요청은 모두 `Referer: http://127.0.0.1:<포트>/`(origin만)와 `Origin` 헤더를 보냈고, 페이지 정책을 바꿔도 같았다. CSS 응답에 `no-referrer`를 주면 Referer만 빠지고 `Origin`은 남았다. `unsafe-url`을 주면 Referer가 스타일시트 URL이 됐다. 페이지 경로는 어느 경우에도 가지 않았다 | §4.4 README 개인정보 안내, §11 개인정보 행 |
| 2a. CDN 차단 때 첫 페인트와 글자 표시 | 통과 | 차단 없음, abort, DNS 실패, 무응답(route를 붙잡아 둠), 패킷 버림(`cdn.jsdelivr.net`을 192.0.2.1로 매핑)을 비교했다. 일감 목록 7회, `/issues/8` 5회씩 돌렸고, 서버 응답 편차를 빼려고 FCP−DCL로 비교했다. 무응답 때는 FCP 뒤 0, 100, 1000, 3500ms에 스크린샷을 찍었다 | 일감 목록 FCP−DCL 중앙값(ms): 차단 없음 18, abort 16, DNS 실패 14, 무응답 12, 패킷 버림 30(1회). 무응답 때는 FCP부터 모든 글자가 폴백 폰트로 보였고 네 스크린샷이 바이트 단위로 같았다. abort 1회의 FCP 832ms는 반복 7회에서 재현되지 않았다 | §4.4 `font-display` 문단 |
| 2b. 폴백 폰트와 줄 높이 | 통과 | abort와 무응답에서 CDP 플랫폼 폰트, `document.fonts`, 요소 높이를 차단 없음과 비교했다 | Pretendard는 쓰이지 않았다. 라틴은 `.SF NS`, 한글은 Apple SD Gothic Neo, 한자는 PingFang이다. 단위 없는 line-height가 있는 요소는 높이가 같았고(`div.wiki p` 44.8px, `#main-menu li a` 32px, `#header h1` 44px), `line-height: normal`인 요소는 1–3px 바뀌었다(`#content h2` 27→28px, `div.wiki h1` 29→32px) | §7.3, §9 Phase 1 완료 기준(차단 전후 텍스트 컨테이너 높이) |
| 2c. CDN을 기다리는 스타일시트 | 통과 | 모든 실행의 요청을 유형, 호스트, 상태로 집계했다 | 스타일시트 9개(위키는 8개)는 모두 로컬에서 200을 받았다. 59회 실행 동안 폰트가 아닌 `cdn.jsdelivr.net` 요청은 0건이고, 무응답 때 끝나지 않은 요청은 폰트 요청뿐이다 | 변경 없음 |
| 2d. window `load` | 실패(`load`만) | 위 실행에서 `load`까지 최대 10초 기다렸다. 패킷 버림은 한 컨텍스트에서 두 페이지를 이어 열고 페이지마다 최대 420초 기다렸다 | 폰트 요청이 `load`를 붙잡는다. `load`−DCL 중앙값은 차단 없음 106ms, abort 6ms, DNS 실패 2ms다. 무응답에서는 10초 안에 `load`가 0/12회 발생했다. 패킷 버림에서는 일감 목록 300,266ms(폰트 19개 모두 `ERR_CONNECTION_TIMED_OUT`), 이어 연 `/issues/8` 225,221ms(14개)였고 FCP는 264ms와 224ms였다. ceil(요청 수/6) × 75초와 맞는다(호스트당 연결 6개, macOS `net.inet.tcp.keepinit` 75초. 두 점으로 추정한 모형) | §4.4 `load` 항목과 README 폐쇄망 안내, §11 "CDN 차단 때 렌더링이나 `load`가 늦어짐"(`load` 대응 적용), `CLAUDE.md` 폰트 제공 |
| 2e. 일괄 편집 "지우기"(`input[data-disables]`) | 부분 통과(표시만 다름) | admin으로 `/issues/bulk_edit?ids[]=4&ids[]=9`를 열고 시작일을 입력한 뒤 "지우기"를 체크했다. 제출하지 않고 `FormData`로 읽었다. 차단 없음, 무응답, 8초 뒤 해제를 비교했다 | 무응답에서도 필드는 비활성화됐다(`application-legacy.js` 1228행이 document ready 때 `#content`에 `toggleDisabledOnChange`를 건다). 값만 비워지지 않아 흐린 필드에 날짜가 남는다. 비활성 필드는 제출되지 않으므로 `FormData`는 차단 없음과 같다 | §4.4 `load` 항목, §11 jsDelivr 행. 테마가 대응할 것은 없다 |
| 2f. 저장하지 않은 변경 경고(`warnLeavingUnsaved`) | 실패 | admin으로 `/issues/8/edit`에서 메모를 입력하고 메인 메뉴 링크를 눌렀다(대화상자는 기록한 뒤 닫았다). 차단 없음, 무응답, 8초 뒤 해제, 해제 전 입력을 비교했다 | 무응답 동안 `window.onbeforeunload`가 없어 경고 없이 이동했고 입력이 사라졌다. `load` 뒤에 입력한 내용은 보호됐지만, `load` 전에 입력한 내용은 `load` 뒤에도 보호되지 않았다 | 2d와 같다 |
| 3a. 자체 호스팅으로 덮기(`custom.css`, 자식 테마) | 통과 | 단일 가변 woff2를 `themes/ravnus/fonts/`(`custom.css` 경우) 또는 자식 테마의 `fonts/`에 1회 마운트했다. 각각 4페이지 × ko·en·ja·zh-CN·zh-TW로 20회 돌리고 기본 테마와 비교했다 | 기본 테마는 CDN 요청이 362건이었고 두 경우 모두 0건이었다. 페이지마다 자체 폰트 요청이 1건이다(200 `font/woff2`, 2,057,688바이트). `custom.css`의 `url(../fonts/…)`는 `/assets/themes/ravnus/PretendardVariable-<digest>.woff2`로, 자식 테마의 것은 `/assets/themes/<자식>/PretendardVariable-<digest>.woff2`로 재작성됐다(`Cache-Control` 없음). 테마 CSS의 CDN `@font-face` 92개는 남아 있었지만 요청되지 않았다 | §4.4 자체 호스팅 항목, `CLAUDE.md` "Redmine 7 테마 동작" |
| 3b. "시스템 폰트만 쓰기" | 통과 | 3a와 같은 20회에 로그인 3회를 더했다 | CDN 요청 0건, 폰트 요청 0건이다. ja는 Hiragino Kaku Gothic ProN, zh는 PingFang SC, zh-TW는 PingFang TC로 그려졌다 | §4.4 README 폐쇄망 안내(2d·2f의 필수 절차) |
| 3c. 네 스택을 모두 바꿀 때와 일부만 바꿀 때 | 통과(흉내) | `custom.css`로 §7.1 네 스택을 흉내 냈다. 그대로, 넷 모두 자체 호스팅, 넷 모두 시스템 폰트, `--ravnus-font-sans`만 교체를 각 20회 돌렸다 | CDN 요청은 그대로 261건, 넷 모두 자체 호스팅 0건, 넷 모두 시스템 폰트 0건, sans만 교체 132건이다(ko·en 0, ja·zh·zh-TW 각 44). ja·zh UI에서도 한글이 있는 페이지는 Pretendard 조각을 받는다. 자식 테마로 네 스택을 바꾸는 경우는 재지 않았다 (미검증) | §4.4, §11 자체 호스팅 행, §9 Phase 1 완료 기준(실제 테마로 재측정) |
| 4. 페이지별 폰트 조각 수와 바이트 | 측정 | 4페이지 × ko·ja·zh, 익명, 1440×900, 첫 방문. 바이트는 woff2 파일 크기의 합이다 | §4.4 "폰트 전송량" 표. 참고로 모든 UI에 Pretendard를 먼저 둔 스파이크 빌드에서는 ja·zh도 14–24조각(343,764–575,012바이트)을 받았다 | §4.4 표(작업 자료 수치를 대체) |
| 5a. `custom.css` 스텁 import와 토큰 덮기 | 통과 | `custom.css`에 `:root { --ravnus-font-sans: … }`를 넣었다. CSSOM을 캐스케이드 순서로 읽고 계산값을 확인했다 | 빈 스텁은 200, 0바이트로 서빙된다. `custom.css`의 `:root`는 테마의 `:where(:root)`보다 순서상 앞이지만 이겼다. `--fonts-main`, body, h2의 계산값이 사용자 값이 됐다 | §4.5 표 A |
| 5b. `custom.css` 수정 반영 | 부분 통과 | 마운트한 파일을 단계별로 고치면서 링크, digest, 서빙 내용, `public/assets/.manifest.json` 시각을 기록했다 | 재시작 전에는 이전 내용이 서빙됐다. 재시작 뒤에는 `custom`과 테마 `application`의 digest가 모두 바뀌었다(HTML이 `max-age=0`이라 새로고침만으로 반영된다). 수정 시각을 2020-01-01로 둔 파일은 재시작해도 반영되지 않았고, `touch`한 뒤 재시작하자 반영됐다. 이전 digest 파일은 `public/assets`에 남는다 | §4.5, §11 수정 시각 행, `CLAUDE.md`, README 설치 절 |
| 5c. 자식 테마 import | 통과 | 시험용 자식 테마 두 개를 1회 마운트하고 `ui_theme`을 바꿨다 | `url(../ravnus/application.css)`와 `url(/themes/ravnus/application.css)` 모두 부모 테마의 digest 자산으로 재작성됐다(원래 경로로 GET하면 404). 코어, 부모 `custom.css`, `@font-face` 92개, 부모의 `--fonts-main` 재매핑이 모두 적용되고 자식 `:root`가 이겼다 | §4.5 자식 테마 경로, `CLAUDE.md` |
| 5d. 음성 대조 | 예상대로 실패 | 5.x식 `url(../../ravnus/stylesheets/application.css)`와 문자열형 `@import "../ravnus/application.css"`를 쓴 자식 테마를 시험했다 | 둘 다 재작성되지 않아 404가 났고, 페이지에 스타일이 전혀 적용되지 않았다(body가 Times) | §4.5, §11 import 행, v0.1.0 README 경고 |
| 5e. 자식 테마와 부모 `custom.css`를 함께 쓸 때 | 통과 | 자식 테마에 부모 `custom.css`를 함께 마운트했다 | 부모 `custom.css`를 바꾸면 재시작 뒤 부모와 자식의 digest가 모두 바뀐다(내용이 같으면 digest도 같다). 같은 토큰을 둘 다 정하면 자식 `:root`가 이긴다(같은 명시도, 나중 순서) | §4.5, v0.1.0 README 커스터마이즈 절 |
| 6. import 순서 | 통과 | 서빙된 CSS의 첫 문장과 CSSOM을 확인했다. 비어 있지 않은 `custom.css`와 7.0.1에서도 확인했다 | 주석을 뺀 첫 두 규칙은 `@import url("/assets/application-<digest>.css")`와 `@import url("/assets/themes/ravnus/custom-<digest>.css")`다. 외부 import는 없다. 코어 import는 200 `text/css`다. `custom.css` 내용이 바뀌면 테마 digest도 바뀐다 | 변경 없음(CI 첫 두 규칙 검사 유지). §11 import 실패 대응은 7.0.2에서 필요 없다 |
| 7a. 로그인 상태 상단 바와 계정 드롭다운 | 캡처 완료 | autologin 쿠키로 admin으로 열었다. 1440px와 800px에서 트리거를 누르고 outerHTML, 계산 스타일, 스크린샷을 남겼다. GET이 아닌 요청은 막았고 0건이었다 | `#top-menu`는 익명과 로그인 모두 28px(`.profile-menu` 예약)이고 `#header`는 90px다. 트리거 `#account a.dropdown-trigger`(아바타와 셰브런)는 52×28이고 `aria-expanded`가 없다. `.dropdown-content`에서 `hidden` 클래스가 빠진다. 표면은 `#fff`, radius 4px, 그림자 `0 4px 6px rgba(0,0,0,.1)`, z-index 1000이다. 바깥을 누르거나 Esc를 누르면 닫힌다. 800px에서는 `#top-menu`가 숨고 `#header`가 64px다 | §8.4 1(Phase 2 기준 자료) |
| 7b. 저널·히스토리 탭과 편집 폼 | 캡처 완료 | `/issues/4`의 네 탭, 비공개 노트가 있는 `/issues/10`, 인라인 편집과 `/issues/4/edit`를 캡처했다 | 셀렉터는 §8.4 9에 적었다. 폼의 입력과 셀렉트는 Arial 13.33px, 높이 25px다. 인라인 편집으로 이동하면 sticky 일감 헤더가 폼 위를 가린다 | §8.4 9, §9 Phase 4 |
| 8. Pretendard 로드 상태의 코어 행 높이 | 통과 | 일감 목록, ko, 1440px. 폰트 19/19 로드와 `td.subject`의 Pretendard 사용을 확인한 뒤 모든 행을 쟀다. CDN 차단(시스템 폰트)과 코어 Noto Sans와도 비교했다 | 본문 행은 25px(첫 행만 위 테두리 때문에 25.5px), 머리 행은 27.5px다. 셀은 13px, 위아래 패딩 3px, 위 테두리 1px다. 행 높이를 정하는 것은 글자 줄(15px)이 아니라 `td.buttons`의 18px 아이콘 링크다(18+3+3+1). 시스템 폰트는 25/28px, 코어 Noto Sans는 25.86/28.95px다 | §4.8, §1 표 밀도, §9 Phase 3 |
| 9. UI 언어 전환 | 통과 | 익명은 Playwright `locale`을 ko·ja·zh-CN·zh-TW·en·he로 바꿨다. 로그인은 `rails runner`로 admin 언어를 바꾸고 Accept-Language를 다르게 줬다 | 익명 `<html lang>`은 ko·ja·zh·zh-TW·en·he였다. he는 `dir="rtl"`이고 LTR 언어에도 `dir="ltr"`이 붙는다. admin 언어가 설정돼 있으면 Accept-Language보다 우선하고, 비어 있으면(시드 값) Accept-Language를 따른다 | §9 Phase 0 9, §10.1, §10.4 |
| 10a. 7.0.2 브리지: 변수만으로 칠해지는가 | 통과 | 스파이크 테마를 적용한 상태에서 `:root{--color-header-background:#ffffff;--color-top-menu-background:#46009B}`를 head 끝에 `<style>`로 넣었다. 1440px와 800px(flyout을 연 상태 포함)에서 쟀다 | 1440px에서 `#header`는 흰색, `nav.top-menu`는 `#46009B`가 됐다. 800px에서 모바일 `#header`(64px)는 흰색, `.flyout-menu`는 `#46009B`, `.flyout-menu h3` 띠는 흰색이 됐다. 셀렉터 폴백 없이 변수만으로 칠해졌다. 이 상태에서 `.flyout-menu h3` 글자와 모바일 메뉴 토글은 흰 바탕 위 흰 글자였다 | §6.2 브리지, §4.5(브리지는 §8.6 재칠과 같은 릴리스). §8.6 목록은 그대로 |
| 10b. 7.0.2 브리지: 테마 CSS 안의 선언, 토큰 경유, `custom.css` 추종, 글자 셀렉터 | (미검증) | 스파이크 테마에 크롬 토큰과 재칠 규칙이 없어 하지 않았다 | 같은 위치 메커니즘(테마 CSS의 일반 `:root`가 import한 코어 `:root`를 이김)은 `--fonts-main`으로 관찰했다 | §9 Phase 2 완료 기준 |
| 10c. 7.0.1 | 변수 없음 확인. 폴백 자체는 (미검증) | `redmine:7.0.1`을 1회 띄워 같은 주입을 하고 코어를 grep했다 | 7.0.1 코어에는 두 변수가 없다. 주입해도 `#header` #3A78A3, `nav.top-menu` #234761, 800px 모바일 `#header` #628db6, `.flyout-menu` #3e5b76, h3 띠 #628db6이 그대로다. 배경 셀렉터 폴백을 넣은 시험은 하지 않았다 | §8.4 "7.0.0–7.0.1 대응"(폴백 유지), Phase 2의 7.0.1 spot check(§10.4) |

**넘긴 확인과 재지 않은 것**
- Phase 1: 실제 네 스택 테마(§7.1)로 3의 덮기 매트릭스와 4의 ja·zh 전송량을 다시 잰다(자식 테마로 네 스택을 바꾸는 경우 포함). CDN 차단 전후 텍스트 컨테이너 높이를 비교한다.
- Phase 2: 10b(테마 CSS 안의 브리지 선언, `custom.css` 크롬 토큰 추종, 글자 셀렉터)와 7.0.1 배경 폴백(7.0.1 spot check, §10.4).
- 재지 않은 것 (미검증): Windows·Linux의 연결 시간 초과, Firefox·Safari의 Referer와 `swap` 동작, Windows 폰트, `.manifest.json`을 지웠을 때의 재컴파일, zip으로 업데이트할 때의 수정 시각, admin의 `generate_autologin_token`을 거치는 토큰 경로.

---

## 부록: 결정 기록

2026-09-26 소유자 결정 6건. 모두 최종 결정이다. Phase 0 결과는 구현 경로나 폴백만 바꿀 수 있고 결정은 바꾸지 않는다는 원칙에 따라, 2026-10-01 Phase 0은 결정을 바꾸지 않았고, #4의 구현에 요청을 버리는 폐쇄망의 필수 절차만 더했다(부록 "Phase 0 검증 결과", §11). 결정을 바꿀 때는 소유자가 정하고 이 표와 `CLAUDE.md`를 먼저 고친다. 그 절차로 2026-10-01 소유자가 #1을 바꾸고 #2·#4를 다시 확인했으며, 지원 범위를 바꿨다(#7). 아래 첫 표는 2026-09-26 원래 결정의 이력이고, 현재 결정은 두 번째 표가 우선한다.

| # | 항목 | 결정 (2026-09-26) | 반영한 곳 |
|---|---|---|---|
| 1 | 메인 컬러·크롬 (§4.1) | A "잉크 바이올렛"이 기본값이다(헤더 `#311E5F`, 상단 바 `#1C0F3A`, 강조 `#46009B`, 링크 `#215DB3`). B Signature, C Calm, D 레드마인 블루, Brand-forward는 README 프리셋으로 제공한다. RAVNUS Inc. 브랜드 색(`#46009B`와 이를 바탕으로 만든 크롬 색)을 공개 MIT 테마의 기본값으로 쓰는 것을 소유자가 확인했으므로 선행 조건과 임시 기본값은 없다. **2026-10-01에 B 기본값으로 바뀌었다(아래 표)** | §1, §2, §4.1, §5.3, §6.1, §6.3, §9 Phase 2, §11 |
| 2 | 레이아웃 변경 범위 (§4.2) | 기존 Redmine 레이아웃을 유지한다(영역 재배치 없음). 스타일만 바꾼다. v1에는 `javascripts/theme.js`가 없고, theme.js는 레이아웃 변경에 쓰지 않는다 | §1, §2, §4.2, §8, §8.2, §12 |
| 3 | 사이드바 기본 위치 (§4.3) | 오른쪽 기본(코어와 같다). `--ravnus-sidebar-at-start: 1`로 인라인 시작 쪽으로 바꾼다 | §1, §4.3, §6.3 |
| 4 | Pretendard 제공 방식 (§4.4) | jsDelivr CDN 기본(v1.3.9 고정, Pretendard Variable 동적 서브셋). CDN 스타일시트를 `@import`하지 않는다. 생성 스크립트(`npm run fonts`)가 절대 https URL과 업스트림 unicode-range로 `@font-face`(`font-weight: 45 920`, `font-display: swap`)를 담은 `src/_pretendard.scss`를 만들고, 빌드(`npm run build`)가 이를 테마 CSS에 컴파일한다. 폰트 파일·OFL 파일·폰트 마운트는 저장소에 없고, README에 Pretendard 크레딧·OFL 고지와 개인정보·CSP·폐쇄망·중국 본토 안내를 싣는다. 폐쇄망과 엄격한 CSP는 `custom.css`나 자식 테마의 자체 호스팅(예약 글꼴명이 없는 다른 family 이름 + `--ravnus-font-sans`)으로 대응한다. 업스트림 갱신은 저장소 유지관리자가 맡는다 | §1, §3, §4.4, §4.5, §5.3, §7.1, §9 Phase 0·1, §10, §11, §12 |
| 5 | 사용자 커스터마이즈 (§4.5) | A: 토큰은 `:where(:root)`에 선언하고, 추적하는 빈 `stylesheets/custom.css` 스텁을 테마가 import하며, 자식 테마 레시피를 문서화한다. import 경로는 Phase 0에서 확인한다(2026-10-01 7.0.2에서 확인, §4.5) | §1, §4.5, §9 Phase 0·1, §11, §12 |
| 6 | CJK 타이포 정책 (§4.6) | F1 + K2: ja·zh·zh-TW UI는 OS 네이티브 CJK 폰트를 먼저 쓰고 Pretendard는 한글만 맡는다. keep-all은 ja·zh를 뺀 모든 UI 언어(`:root:not(:lang(ja)):not(:lang(zh))`)에 적용한다 | §1, §2, §4.6, §7.1, §7.6, §12 |

**2026-10-01 변경·재확인** (소유자 결정, 최종)

| # | 항목 | 결정 (2026-10-01) | 반영한 곳 |
|---|---|---|---|
| 1 | 메인 컬러·크롬 (§4.1) | **변경: A → B.** B "Signature"가 기본값이다. 상단 바 `--ravnus-topbar-bg` `#46009B`(최소 높이 2rem), 글자 `#FFFFFF`, 보조 글자 `#CAC5EA`, 포커스 링 앰버 `#FEA800`. 헤더는 canvas(`#FFFFFF`), 글자 fg-default(`#202026`), 보조 글자 fg-subtle(`#64626A`), 포커스 accent(`#46009B`). A "Ink"(헤더 `#311E5F`, 상단 바 `#1C0F3A`)는 C Calm, D 레드마인 블루, Brand-forward와 함께 README 프리셋이고, Signature는 더 이상 프리셋이 아니다. 메인 메뉴 바의 색·탭 표현, 강조 `#46009B`, 링크 `#215DB3`, 크롬이 아닌 기존 토큰의 값과 채택안의 나머지(배치, 타이포그래피, 목록 표현)는 그대로다. 흰 헤더와의 경계를 위해 메인 메뉴 바 위아래 헤어라인(header-divider, 새 토큰 `--ravnus-nav-border`)과 `box-sizing: border-box`만 더한다(Ink 프리셋 화면에도 적용). 브랜드 색 사용은 2026-09-26에 확인됐다. 근거: 프로토타입을 나란히 비교한 뒤의 소유자 선호(브랜드 선명도, 가벼운 크롬). 흰 헤더가 코어의 밝은 글자 전제를 뒤집는 대가는 받아들이고, 재칠 목록(지원 범위 변경(#7) 뒤로는 7.0.2 기준과 코어 변수 브리지), 헤더 경계선, 요소별 assert, Ink 프리셋으로 완화한다 | 머리말, §1, §2, §3, §4.1, §4.2, §4.5, §5.2, §5.3, §5.4, §5.5, §6.1, §6.2, §6.3, §6.6, §8.1, §8.4, §8.5, §8.6, §8.7, §8.8, §9 Phase 2·7, §10, §11, §12 |
| 2 | 레이아웃 변경 범위 (§4.2) | **재확인.** 기존 Redmine 레이아웃을 유지하고 스타일만 바꾼다. v1에 theme.js가 없다. 재배치는 작업량이 늘어난다는 이유로 받아들이지 않았다 | §1, §4.2 |
| 4 | Pretendard 제공 방식 (§4.4) | **재확인.** jsDelivr CDN 기본(v1.3.9 고정). 나머지 내용은 2026-09-26 결정과 같다 | §1, §4.4 |
| 7 | 지원 범위와 테스트 기준 (§4.12) | **결정: 지원 범위 7.x 전용(Redmine 6.x / 7.x에서 변경).** 소유자가 Redmine 7을 쓰므로 6.x 지원을 중단한다. 이 결정으로 6/7 동등성 작업(6.x 기준선까지 함께 맞추던 리셋과 그 6/7 비교, 6.0.x 확인, 두 버전 스크린샷·assert)이 없어진다. 단일 7.x 기준선의 명시적 리셋(§8.4 1–3)은 남는다. **테스트 기준: `redmine:7.0.2`(2026-10-01 릴리스) 고정 이미지 하나.** 지원 범위 결정에 따라 같은 날 정한 프로젝트 규칙이다(`CLAUDE.md` "지원 범위", `docker-compose.yml`). 이 뒤의 내용은 이 결정에 따른 설계이며 소유자 결정이 아니다. 7.0.2가 더한 코어 크롬 배경 변수(`--color-header-background`, `--color-top-menu-background`)는 `--fonts-main`처럼 일반 `:root`에서 header-bg·topbar-bg로 재매핑하되 흰 헤더 재칠과 함께 v0.2.0부터 싣고(§4.5), 변수가 없는 7.0.0–7.0.1은 배경 셀렉터 폴백으로 지원한다(7.0.1 spot check, §10.4). `--oc-*`는 재매핑하지 않는다. 결정 문서(`CLAUDE.md` "지원 범위")에 먼저 반영한 뒤 이 문서를 고쳤다 | 머리말, §1, §2, §3, §4.1, §4.3, §4.4, §4.5, §4.7, §4.10, §4.12, §5.4, §5.5, §6.1, §6.2, §6.3, §6.4, §6.5, §7.2, §7.6, §7.9, §8.1, §8.3, §8.4, §8.5, §8.6, §8.7, §8.8, §8.9, §9, §10, §11, §12. `CLAUDE.md`("지원 범위", "Redmine 7 테마 동작"(7.0.0–7.0.1 폴백 범위 포함), 디렉터리 구조, 개발 명령, "진행 상태"), README, `docker-compose.yml` |

---

## 부록: 개정 이력

2026-10-01 Phase 0 검증 결과 반영(7.0.2): 부록 "Phase 0 검증 결과" 추가, §3 Manuscript 약점의 자식 테마 경로 404 근거, §4.4 폰트 전송량 실측·`load` 지연과 요청을 버리는 폐쇄망의 필수 절차·Referer와 Origin 문구, §4.5 import 경로·수정 시각 조건·자식 테마 우선순위, §4.8 코어 행 높이, §6.2 브리지 근거, §7.3 CDN 차단 전후 높이, §8.4 로그인 크롬·저널 셀렉터, §11 행 갱신과 수정 시각 행 추가, §9–§12 Phase 0 완료와 Phase 1·2 완료 기준 추가. 같은 검토로 flyout 재칠을 브리지와 같은 v0.2.0으로 옮기고, 7.0.1 spot check 정의를 §10.4 한 곳에 두었다.

2026-10-01 지원 범위 7.x 전용 반영(결정 기록 #7): 기준 `redmine:7.0.2`, 6/7 동등성 작업 삭제, §8.4를 7.0.x 패치 차이로 교체, 코어 인용 7.0.2로 재확인, 크롬 배경 변수 브리지와 7.0.0–7.0.1 폴백, Phase 0 7·10, §11 패치 재검증 절차, §12 공수 하향.

2026-10-01 소유자 결정 반영: 기본 크롬 A(Ink) → B(Signature), Ink는 프리셋, #2·#4 재확인, 흰 헤더 재칠 목록(§8.4 12·§8.6), 헤더 경계선·컨트롤 테두리 토큰(§6.2), 헤더 assert·플러그인 위험(§9–§12) 추가.

2026-09-26 소유자 결정 6건 반영. 머리말 상태, §1 표와 다음 할 일, §4 각 절을 결정으로 바꾸고, §4.4 CDN 기본 결정을 §4.5, §5.3, §7.1, §9, §10, §11, §12에 반영했다. 브랜드 색 선행 조건과 임시 기본값(D)을 없앴다. 같은 날 두 차례 교차 검토로 크롬 높이 실측값, CDN 무응답 시 위험과 Phase 0 확인 항목, OFL 근거, 폰트 생성·버전 고정 절차, CI 폰트 검사, import 순서 검사 기준, 프리셋 게재 시점을 바로잡았다. 결정 내용은 부록 "결정 기록"에 있다.

2026-09-26 검토 의견 23건 반영.

1. 레이아웃 변경 범위를 "추천"에서 소유자 결정 항목으로 올렸다(§1 표, §4 서두, §4.2). (결정은 2026-09-26, 부록 "결정 기록" 참조)
2. ja·zh·zh-TW 폰트 스택을 소유자 결정 항목 §4.6(가)로 올리고, `CLAUDE.md` 폰트 문구 개정을 §12에 넣었다. (결정은 2026-09-26, 부록 "결정 기록" 참조)
3. keep-all 범위를 소유자 결정 항목 §4.6(나)로 올리고 추천을 "ja·zh를 뺀 모든 UI 언어"로 바꿨다(§7.6 코드, §3 채택안에서 뺀 요소. K3는 선택지로 남김). (결정은 2026-09-26, 부록 "결정 기록" 참조)
4. 행 단위 기본값을 `:where()` 명시도 0으로 선언하는 §5.6을 추가하고, Phase 3에 `tr.status-N` assert를 넣었다.
5. CDN 전환을 컴파일 파일 수정에서 `custom.css` 첫 줄 `@import`로 바꾸고, Phase 0 네트워크 확인을 넣었다(§4.4, §4.5). (2026-09-26 §4.4 결정으로 대체: CDN이 기본이고 CDN 스타일시트는 `@import`하지 않는다.)
6. 렌더 화면 axe-core 검사를 §10.2와 Phase 1·3·6에 넣고, 그룹 행·합계·`p.progress-info`를 §6.5에 명시했다.
7. 일정 지연에 삼각형 글리프와 굵기 500을 주고, 일정 지연 행의 완료 구간(`td.closed`)을 빗금으로 칠하게 했으며, 막대 구간 정의와 `td.closed`·`td.done` 구분 판단을 §6.1에 기록했다.
8. 상시 밑줄을 문장 속 링크 전체로 넓히고(§7.9), `--ravnus-link-decoration`을 75%(canvas 3.72:1)로 올렸다(§5.4).
9. `.tabular p`와 `#content .tabs`의 포커스 링·글자 잘림 수정을 §8.1에 넣고, Phase 4·6 완료 기준에 반영했다.
10. forced-colors 절(§8.8)을 추가하고, 행 마커를 테두리로, 원 글리프를 테두리 두께로 바꿨으며, 배경·그라디언트 글리프 목록(기한 초과 "!" 원 포함)과 매트릭스 에뮬레이션을 넣었다.
11. 인쇄 절(§8.9)을 추가하고 Phase 3에 인쇄 미리보기 확인을 넣었다.
12. jstoolbar 행(§8.1)과 칠할 수 없는 `url()` 이미지 목록(§8.7)을 추가하고, §5.5 다크 차단 목록과 6 flash PNG 주의를 넣었다. (2026-10-01 지원 범위 변경으로 6 관련 내용은 없어졌다.)
13. `git pull --autostash` 안내를 §4.5, §11, §12 README 항목에 넣었다.
14. 이름 열을 `anywhere`에서 빼 `break-word`를 쓰게 하고(§7.6), Phase 3 기준에 이름 열 검사를 넣었다.
15. 모바일 컨트롤 크기를 명시도를 높여 토큰에 연결하고, iOS 16px 문제를 열린 항목으로 적었다(§8.6, Phase 7).
16. 12px 하한 목록에 `span.private`, `p.percent`, `p.progress-info`를 넣고, 코드 크기를 `max()`로, 간트 제목 열을 예외로 적었으며, Phase 6 게이트를 바꿨다(§7.2).
17. best-effort 표현을 지우고 지원 범위를 그대로 두었으며, Phase 0에 6.0.x 확인을 넣었다(§4.12). (2026-10-01 지원 범위가 7.x 전용으로 바뀌어 6.0.x 확인은 없어졌다.)
18. `.btn-alert`와 익명 Accept-Language 전환을 확인된 사실로 적고, projects/bulk_destroy를 삭제 버튼 목록에 넣었다(§4.10, §10.4).
19. 사이드바 확인 범위를 "펼침·접힘은 두 버전, RTL은 7.0.1"로 고치고, 행 마커를 논리 속성으로 그려 6의 RTL에서도 뒤집히게 했다(§4.3, §6.4, §8.4). (2026-10-01 지원 범위 변경으로 6 관련 내용은 없어졌다.)
20. 선행 조건을 "RAVNUS Inc. 브랜드 색 사용 확인"으로 좁히고, 확인 대기 중 임시 기본값(D)을 결정 항목 안에 명시했다(§4.1). (2026-09-26 §4.1 결정으로 선행 조건과 임시 기본값은 없어졌다.)
21. 우선순위 위치 클래스와 태그 색 이름에는 map + `@each`를 유지한다고 적고, `CLAUDE.md` 문구 개정을 §12에 넣었다(§5.1).
22. `--ravnus-font-size-cell-subject`를 노브 목록에 넣고, `white`·`black` 규칙을 내부 믹스 토큰으로 고쳤으며, `color.to-gamut($method: clip)`을 명시했다(§5.3–§5.5).
23. 특정 배포 환경을 전제한 문장을 일반화하고(§4.3, §11), 문서 위치를 서빙되지 않는 루트 `DESIGN.md`로 정했다(머리말, §12).
