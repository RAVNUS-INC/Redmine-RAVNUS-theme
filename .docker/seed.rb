# frozen_string_literal: true

# Sample data for the RAVNUS theme test environment (see docker-compose.yml).
#
# docker compose runs this once per fresh database:
#   bin/rails runner /ravnus-dev/seed.rb
#
# Every person, e-mail address and text below is fictional. Korean, Japanese,
# Chinese and English are mixed on purpose to exercise CJK typography on the
# main screens: issue list/detail, forms, wiki, roadmap, Gantt, calendar,
# activity and news.

if Project.exists?(identifier: 'website-renewal')
  puts '[ravnus-seed] Sample data already exists. Skipping.'
  return
end

TODAY = Date.current

def time_ago(days, hour: 10)
  (TODAY - days).in_time_zone.change(hour: hour)
end

# Writes issue timestamps by id. Issue uses optimistic locking and Redmine
# callbacks bump lock_version through update_all, so update_columns on a loaded
# issue can silently match no row.
def set_issue_times!(issue, times)
  Issue.where(id: issue.id).update_all(times)
  issue.reload
end

def create_user!(login, lastname, firstname)
  user = User.new
  user.login = login
  user.lastname = lastname
  user.firstname = firstname
  user.mail = "#{login}@example.com"
  user.password = user.password_confirmation = SecureRandom.alphanumeric(24)
  user.mail_notification = 'none'
  user.save!
  user
end

def create_project!(identifier, name, description, modules, parent: nil)
  project = Project.new(identifier: identifier, name: name, description: description, is_public: true)
  project.parent = parent
  project.enabled_module_names = modules
  project.trackers = Tracker.sorted.to_a
  project.save!
  project
end

def add_members!(project, role_by_user)
  role_by_user.each do |user, role|
    Member.create!(project: project, principal: user, role_ids: [role.id])
  end
end

# start/due are day offsets from today; created is how many days ago.
def create_issue!(project, tracker, subject, author:, created:, status: nil, priority: nil,
                  assignee: nil, version: nil, category: nil, start: nil, due: nil,
                  estimated: nil, done: 0, parent: nil, is_private: false, description: nil)
  issue = Issue.new(project: project, tracker: tracker, author: author)
  issue.subject = subject
  issue.description = description
  issue.status = status if status
  issue.priority = priority if priority
  issue.assigned_to = assignee
  issue.fixed_version = version
  issue.category = category
  issue.start_date = start && TODAY + start
  issue.due_date = due && TODAY + due
  issue.estimated_hours = estimated
  issue.done_ratio = done
  issue.parent_issue_id = parent&.id
  issue.is_private = is_private
  issue.save!
  at = time_ago(created)
  if issue.closed?
    # Close on the due date (never before creation or after now) so closed
    # issues do not close before they start.
    due_at = issue.due_date&.in_time_zone&.change(hour: 17)
    closed_at = [[due_at || at, at].max, Time.current].min
    set_issue_times!(issue, created_on: at, updated_on: closed_at, closed_on: closed_at)
  else
    set_issue_times!(issue, created_on: at, updated_on: at, closed_on: nil)
  end
end

def add_journal!(issue, user, notes, days_ago:, private_notes: false, **changes)
  at = time_ago(days_ago, hour: 15)
  last_journal_id = Journal.maximum(:id).to_i
  issue.reload
  issue.init_journal(user, notes)
  issue.current_journal.private_notes = private_notes
  changes.each { |attribute, value| issue.public_send(:"#{attribute}=", value) }
  issue.save!
  closing = issue.saved_change_to_status_id? && issue.closed?
  # init_journal memoizes the journal on the instance (reload keeps it), so
  # clear it before the next journal or relation callback writes into it.
  issue.clear_journal
  # Private notes combined with attribute changes are split into two journals.
  # updated_on must equal created_on, or Redmine marks the note as "Edited".
  Journal.where(journalized: issue).where('id > ?', last_journal_id).update_all(created_on: at, updated_on: at)
  times = { updated_on: at }
  times[:closed_on] = at if closing
  set_issue_times!(issue, times)
end

def create_wiki_page!(wiki, title, text, author:, parent: nil)
  page = WikiPage.new(wiki: wiki, title: title)
  page.parent = parent
  page.content = WikiContent.new(text: text, author: author, comments: '샘플 데이터')
  page.save!
  page
end

Mailer.with_deliveries(false) do
  ActiveRecord::Base.transaction do
    # Roles, trackers, statuses, priorities and workflows with Korean names.
    Redmine::DefaultData::Loader.load('ko') if Redmine::DefaultData::Loader.no_data?

    role = %i[manager developer reporter].zip(Role.givable.sorted.to_a).to_h
    tracker = %i[bug feature support].zip(Tracker.sorted.to_a).to_h
    status = %i[new in_progress resolved feedback closed rejected].zip(IssueStatus.sorted.to_a).to_h
    priority = %i[low normal high urgent immediate].zip(IssuePriority.sorted.to_a).to_h
    activity = %i[design development].zip(TimeEntryActivity.sorted.to_a).to_h

    Setting.default_language = 'ko'
    Setting.ui_theme = 'ravnus'
    Setting.user_format = 'lastname_firstname'
    Setting.welcome_text = <<~'MD'
      ## RAVNUS 테마 테스트 환경

      이 Redmine은 [RAVNUS](https://github.com/RAVNUS-INC/Redmine-RAVNUS-theme) 테마 개발용 로컬 테스트 환경입니다.
      모든 사람, 연락처, 내용은 가상의 예시입니다.

      - project:website-renewal 에서 일감 목록·상세, 로드맵, 간트 차트, 달력을 확인하세요.
      - 위키의 **타이포그래피 샘플** 페이지에서 한·중·일 텍스트 렌더링을 비교할 수 있습니다.
    MD

    admin = User.find_by!(login: 'admin')
    admin.must_change_passwd = false
    admin.mail_notification = 'none'
    admin.save!
    User.current = admin

    seoyeon = create_user!('seoyeon', '이', '서연')
    minjun = create_user!('minjun', '김', '민준')
    jihoon = create_user!('jihoon', '박', '지훈')
    hanako = create_user!('hanako', '佐藤', '花子')
    wei = create_user!('wei', '王', '伟')

    # --- RAVNUS 웹사이트 리뉴얼 ------------------------------------------------

    web = create_project!('website-renewal', 'RAVNUS 웹사이트 리뉴얼',
                          '회사 웹사이트를 전면 개편하는 프로젝트입니다. 반응형 레이아웃, 검색, 다국어(한·영·일) 지원을 목표로 합니다.',
                          %w[issue_tracking time_tracking news wiki calendar gantt])
    add_members!(web, admin => role[:manager], seoyeon => role[:manager], minjun => role[:developer],
                      jihoon => role[:developer], hanako => role[:developer], wei => role[:reporter])

    design, frontend, backend, content = %w[디자인 프런트엔드 백엔드 콘텐츠].map do |name|
      IssueCategory.create!(project: web, name: name)
    end
    v10 = Version.create!(project: web, name: 'v1.0 기획·디자인', effective_date: TODAY - 20,
                          description: '정보 구조와 메인 디자인 확정')
    v11 = Version.create!(project: web, name: 'v1.1 퍼블리싱', effective_date: TODAY + 10,
                          description: '공통 레이아웃과 주요 페이지 퍼블리싱')
    v20 = Version.create!(project: web, name: 'v2.0 정식 오픈', effective_date: TODAY + 45,
                          description: '검색, 다국어, 콘텐츠 편집 기능 포함 정식 오픈')

    ia = create_issue!(web, tracker[:feature], '정보 구조(IA) 설계 및 사이트맵 확정',
                       author: seoyeon, created: 42, status: status[:closed], assignee: seoyeon,
                       version: v10, category: content, start: -40, due: -30, estimated: 16, done: 100,
                       description: <<~'MD')
                         ## 목표

                         리뉴얼 범위의 모든 페이지를 정의하고 메뉴 구조를 확정합니다.

                         - 대메뉴는 5개 이하로 유지
                         - 모든 페이지는 3번 이내 클릭으로 도달
                       MD
    sitemap = <<~'MD'
      # 사이트맵 초안

      - 회사 소개
        - 비전
        - 연혁
      - 서비스
      - 채용
      - 문의하기
    MD
    Attachment.create!(container: ia, file: StringIO.new(sitemap), filename: '사이트맵_초안.md',
                       content_type: 'text/markdown', author: seoyeon, description: '사이트맵 초안')

    create_issue!(web, tracker[:feature], '메인 페이지 시안 3종 제작',
                  author: seoyeon, created: 36, status: status[:closed], assignee: hanako,
                  version: v10, category: design, start: -35, due: -24, estimated: 24, done: 100)
    stats = create_issue!(web, tracker[:support], '구 웹사이트 방문자 통계 추출',
                          author: seoyeon, created: 30, assignee: jihoon, version: v10, category: backend)
    add_journal!(stats, seoyeon, '분석 도구 권한 문제로 v1.1에서 다시 요청하겠습니다.',
                 days_ago: 22, status: status[:rejected])

    header = create_issue!(web, tracker[:feature], '공통 헤더·푸터 퍼블리싱',
                           author: seoyeon, created: 10, assignee: minjun, version: v11,
                           category: frontend, start: -8, due: 3, estimated: 12, done: 0,
                           description: <<~'MD')
                             - [x] 헤더 마크업
                             - [x] 전체 메뉴(모바일)
                             - [ ] 푸터 사이트맵 링크
                             - [ ] 법인 정보 영역

                             시안: v1.0 **메인 페이지 시안** 참고
                           MD
    add_journal!(header, minjun, '헤더 마크업 작업을 시작합니다.', days_ago: 7, status: status[:in_progress], done_ratio: 20)
    add_journal!(header, minjun, '푸터 사이트맵 링크 구조를 확인해 주세요.', days_ago: 2, done_ratio: 60)
    add_journal!(header, seoyeon, '확인했습니다. 법인 정보 영역은 v2.0에서 다국어로 교체할 예정입니다.', days_ago: 1)

    grid = create_issue!(web, tracker[:feature], '반응형 그리드 시스템 적용',
                         author: minjun, created: 14, status: status[:in_progress], assignee: minjun,
                         version: v11, category: frontend, start: -12, due: -2, estimated: 16, done: 70)
    add_journal!(grid, minjun, '브레이크포인트 3단계(모바일·태블릿·데스크톱) 적용을 완료했습니다.',
                 days_ago: 4, status: status[:resolved], done_ratio: 100)

    create_issue!(web, tracker[:bug], '모바일 사파리에서 전체 메뉴가 두 번 열리는 문제',
                  author: wei, created: 3, priority: priority[:urgent], assignee: minjun, version: v11,
                  category: frontend, due: 1, description: <<~'MD')
                    ## 재현 절차

                    1. iOS 사파리에서 메인 페이지 접속
                    2. 햄버거 버튼을 빠르게 두 번 탭

                    ## 기대 결과

                    메뉴가 한 번만 열려야 합니다.
                  MD
    wrap = create_issue!(web, tracker[:bug], '한글 제목이 목록에서 음절 단위로 줄바꿈됨',
                         author: hanako, created: 5, priority: priority[:high], assignee: hanako,
                         version: v11, category: design)
    long = create_issue!(web, tracker[:bug], '띄어쓰기없이아주길게이어지는한국어제목이목록과상세화면에서넘치지않고어떻게줄바꿈되는지확인하기위한일감',
                         author: wei, created: 4, priority: priority[:low], version: v11, category: design)
    add_journal!(wrap, hanako, "목록 열이 좁을 때 '리뉴얼'이 '리뉴'와 '얼'로 나뉩니다. `word-break: keep-all` 적용을 제안합니다.",
                 days_ago: 3)
    add_journal!(wrap, seoyeon, "keep-all을 적용하면 긴 단어가 칸을 넘치는지도 함께 확인해 주세요. ##{long.id} 참고.",
                 days_ago: 2, status: status[:feedback])
    IssueRelation.create!(issue_from: wrap, issue_to: long, relation_type: IssueRelation::TYPE_RELATES)

    form = create_issue!(web, tracker[:feature], '문의하기 폼 서버 검증 추가',
                         author: seoyeon, created: 7, status: status[:in_progress], assignee: jihoon,
                         version: v11, category: backend, start: -5, due: 6, estimated: 10, done: 30)
    crash = create_issue!(web, tracker[:bug], '문의 폼 제출 후 500 오류 발생',
                          author: wei, created: 2, priority: priority[:immediate], assignee: jihoon,
                          version: v11, category: backend, start: -2, due: -1, is_private: true)
    add_journal!(crash, jihoon, '서버 로그에서 CSRF 토큰 만료를 확인했습니다. 원인 분석 중입니다.',
                 days_ago: 1, private_notes: true, status: status[:in_progress])
    IssueRelation.create!(issue_from: crash, issue_to: form, relation_type: IssueRelation::TYPE_BLOCKS)

    create_issue!(web, tracker[:support], 'ログイン画面の日本語メッセージを見直す',
                  author: hanako, created: 6, assignee: hanako, version: v11, category: content,
                  description: 'エラーメッセージの敬語表現と句読点(、。)を統一します。')
    create_issue!(web, tracker[:bug], '优化中文界面的字体显示',
                  author: wei, created: 6, assignee: wei, version: v11, category: design,
                  description: '中文段落的行距偏小，标点符号「，」「。」的位置也需要确认。')
    create_issue!(web, tracker[:bug], 'Footer links open in the same tab',
                  author: wei, created: 9, status: status[:resolved], priority: priority[:low],
                  assignee: minjun, version: v11, category: frontend, done: 100)

    search = create_issue!(web, tracker[:feature], '통합 검색 결과 페이지',
                           author: seoyeon, created: 8, assignee: jihoon, version: v20, category: backend)
    create_issue!(web, tracker[:feature], '검색 API 설계',
                  author: jihoon, created: 6, status: status[:in_progress], assignee: jihoon, version: v20,
                  category: backend, start: -3, due: 4, estimated: 8, done: 40, parent: search)
    search_ui = create_issue!(web, tracker[:feature], '검색 결과 UI 퍼블리싱',
                              author: jihoon, created: 6, assignee: minjun, version: v20,
                              category: frontend, start: 5, due: 9, estimated: 12, parent: search)
    IssueRelation.create!(issue_from: header, issue_to: search_ui, relation_type: IssueRelation::TYPE_PRECEDES)
    # Creating children recalculates the parent, and the precedes relation may
    # reschedule search_ui; both re-save the issues, so stamp them again.
    set_issue_times!(search, updated_on: time_ago(6))
    set_issue_times!(search_ui, updated_on: time_ago(6))

    create_issue!(web, tracker[:feature], '다국어(한·영·일) 전환 기능',
                  author: seoyeon, created: 12, assignee: hanako, version: v20, category: content,
                  start: 15, due: 35, estimated: 40)
    create_issue!(web, tracker[:feature], '관리자용 콘텐츠 편집기 도입 검토',
                  author: seoyeon, created: 11, assignee: admin, version: v20, category: content, due: 20)
    create_issue!(web, tracker[:support], '개인정보 처리방침 페이지 문구 검토 요청',
                  author: seoyeon, created: 5, status: status[:feedback], priority: priority[:high],
                  assignee: admin, version: v20, category: content, due: 7)

    v10.update!(status: 'closed')

    [[wrap, hanako, activity[:design], 1.5, 3], [header, minjun, activity[:development], 3.5, 6],
     [header, minjun, activity[:development], 2, 2], [grid, minjun, activity[:development], 6, 5],
     [form, jihoon, activity[:development], 4, 3]].each do |issue, user, act, hours, days|
      TimeEntry.create!(project: web, issue: issue, user: user, author: user, activity: act,
                        hours: hours, spent_on: TODAY - days, comments: issue.subject)
    end

    kickoff = News.create!(project: web, author: seoyeon, title: '웹사이트 리뉴얼 킥오프',
                           summary: '리뉴얼 일정과 역할을 공유합니다.',
                           description: '킥오프 회의에서 v1.0 ~ v2.0 일정과 담당 영역을 확정했습니다. 회의록은 위키를 참고하세요.')
    kickoff.update_columns(created_on: time_ago(25))
    milestone = News.create!(project: web, author: seoyeon, title: 'v1.0 기획·디자인 단계 완료',
                             summary: '정보 구조와 메인 시안이 확정되었습니다.',
                             description: '다음 단계인 v1.1 퍼블리싱을 시작합니다.')
    milestone.update_columns(created_on: time_ago(18))

    wiki = web.reload.wiki
    start = create_wiki_page!(wiki, 'Wiki', <<~'MD', author: seoyeon)
      # RAVNUS 웹사이트 리뉴얼

      리뉴얼 프로젝트의 공용 문서 공간입니다.

      - [[타이포그래피_샘플]] — 한·중·일·영 텍스트 렌더링 비교
      - [[회의록]] — 주요 회의 기록
    MD
    create_wiki_page!(wiki, '타이포그래피_샘플', <<~'MD', author: hanako, parent: start)
      # 타이포그래피 샘플

      ## 한국어

      레드마인은 일감과 일정, 문서를 한곳에서 관리하는 프로젝트 관리 도구입니다. 한글 문장이 음절 단위로 줄바꿈되면 단어가 둘로 쪼개져 읽는 흐름이 끊깁니다. 이 문단은 어절 단위 줄바꿈과 행간이 긴 글에서 어떻게 보이는지 확인하기 위한 예시입니다.

      ## 日本語

      このページは、日本語の文章がどのように表示されるかを確認するためのサンプルです。ひらがな、カタカナ、漢字が混在する文章では、行間と文字間のバランスが読みやすさを大きく左右します。

      ## 简体中文

      本页面用于检查中文文本的显示效果。中文的词与词之间没有空格，因此换行规则与韩文不同。请比较行距、字距以及标点符号的位置。

      ## 繁體中文

      本頁面用於檢查繁體中文的顯示效果。請比較字形、行距與標點符號的位置。

      ## English

      The quick brown fox jumps over the lazy dog. This paragraph checks how Latin text sits next to CJK text, including numbers such as 1,234,567 and dates like 2026-09-26.

      ## 섞어 쓰기

      RAVNUS 테마는 Redmine 6.x·7.x를 지원하며, CSS 변수 `--ravnus-font-sans`로 기본 글꼴을 바꿀 수 있습니다.

      같은 한자도 글꼴에 따라 자형이 다릅니다: 骨 直 今 角 刃 次

      ## 줄바꿈 경계 사례

      띄어쓰기없이아주길게이어지는한국어단어가좁은영역에서넘치지않는지확인하는문장입니다

      https://example.com/very/long/path/that/should/wrap/in/narrow/containers?query=%ED%95%9C%EA%B8%80&lang=ko

      ## 표

      | 언어 | 예시 | 비고 |
      |------|------|------|
      | 한국어 | 다람쥐 헌 쳇바퀴에 타고파 | 팡그램 |
      | 日本語 | いろはにほへと | 仮名 |
      | 中文 | 天地玄黄 | 千字文 |

      ## 인용과 코드

      > 인용문 안의 한글 행간과 글자 간격도 확인합니다.

      ```css
      :root {
        --ravnus-font-sans: "Pretendard Variable", Pretendard, sans-serif;
      }
      ```
    MD
    create_wiki_page!(wiki, '회의록', <<~MD, author: seoyeon, parent: start)
      # 회의록

      ## 킥오프 회의 (#{(TODAY - 25).iso8601})

      | 항목 | 내용 |
      |------|------|
      | 참석 | 이서연, 김민준, 박지훈, 佐藤 花子, 王 伟 |
      | 안건 | 일정, 역할 분담, 디자인 방향 |

      ### 결정 사항

      - [x] v1.0 ~ v2.0 일정 확정
      - [x] 반응형 기준 해상도 3단계로 결정
      - [ ] 다국어 번역 담당자 지정
    MD

    # --- 모바일 앱 (하위 프로젝트) --------------------------------------------

    app = create_project!('mobile-app', '모바일 앱', '리뉴얼 웹사이트와 연동되는 모바일 앱입니다.',
                          %w[issue_tracking calendar gantt], parent: web)
    add_members!(app, seoyeon => role[:manager], minjun => role[:developer], hanako => role[:developer])
    beta = Version.create!(project: app, name: '앱 베타', effective_date: TODAY + 30)
    create_issue!(app, tracker[:feature], '푸시 알림 설정 화면',
                  author: seoyeon, created: 9, status: status[:in_progress], assignee: minjun, version: beta,
                  start: -6, due: 8, estimated: 20, done: 40)
    create_issue!(app, tracker[:bug], '안드로이드에서 로그인 상태가 유지되지 않음',
                  author: minjun, created: 2, priority: priority[:high], assignee: minjun, version: beta, due: 5)
    create_issue!(app, tracker[:feature], '앱 아이콘·스플래시 화면 디자인',
                  author: seoyeon, created: 15, status: status[:resolved], assignee: hanako, version: beta,
                  start: -14, due: -4, done: 100)
    create_issue!(app, tracker[:support], '베타 테스터 모집 공지 작성',
                  author: seoyeon, created: 16, status: status[:closed], assignee: seoyeon, version: beta,
                  done: 100)

    # --- 인프라 운영 -------------------------------------------------------------

    ops = create_project!('infra-ops', '인프라 운영', '서버, 배포, 모니터링 관련 작업을 관리합니다.',
                          %w[issue_tracking time_tracking calendar gantt])
    add_members!(ops, jihoon => role[:manager], wei => role[:developer])
    create_issue!(ops, tracker[:support], '백업 스크립트 점검',
                  author: jihoon, created: 20, status: status[:closed], assignee: jihoon,
                  start: -18, due: -15, done: 100)
    disk = create_issue!(ops, tracker[:bug], '스테이징 서버 디스크 사용률 90% 초과',
                         author: wei, created: 3, priority: priority[:urgent], assignee: jihoon, due: 2)
    add_journal!(disk, jihoon, '오래된 로그를 정리하고 로그 보관 주기를 조정하겠습니다.',
                 days_ago: 1, status: status[:in_progress], done_ratio: 50)
    create_issue!(ops, tracker[:feature], '모니터링 대시보드 구성',
                  author: jihoon, created: 10, assignee: wei, start: 3, due: 17, estimated: 16)
    create_issue!(ops, tracker[:support], 'SSL 인증서 갱신',
                  author: jihoon, created: 4, priority: priority[:high], assignee: jihoon, due: 12)
  end
end

puts "[ravnus-seed] Created #{Project.count} projects, #{Issue.count} issues and #{User.where(type: 'User').count} users."
