# 변경 이력 — 우앤주전력 웹사이트

> **프로덕션**: https://www.wnjpower.com (apex → www 308 리다이렉트)
> **GitHub**: https://github.com/wnjpower/website · **Vercel**: `wnjpower-erp` 팀 / `wnj-website`
> **Supabase**: `wnj-website` (서울 `ap-northeast-2`)

이 문서는 완료된 변경 이력을 최신순으로 기록합니다. 아직 끝나지 않은 운영·콘텐츠
항목은 [`TODO.md`](TODO.md)에서 추적합니다.

---

## 2026-07-31 — 실시간 알림: CTA 버튼 클릭 → 사장님 휴대폰·PC 팝업

방문자가 사이트의 **CTA 버튼(전화·카카오톡·견적문의 등)을 누르는 순간** 사장님 기기에
알림 팝업이 뜬다. 브라우저 표준 웹 푸시(VAPID)라 **추가 비용이 없고**, 사이트를 닫아 둔
상태·화면이 꺼진 상태에서도 도착한다. 운영 방법은
[`docs/어드민_사용법.md`](docs/어드민_사용법.md) 7번에 정리했다.

> ⚠️ **적용 전 필수**: `supabase/push-schema.sql` 실행 + 환경변수 3개
> (`NEXT_PUBLIC_VAPID_PUBLIC_KEY` · `VAPID_PRIVATE_KEY` · `SUPABASE_SERVICE_ROLE_KEY`).
> 셋 중 하나라도 없으면 **알림만 조용히 꺼지고 사이트·견적 접수는 그대로 동작**한다.
> 키 생성은 `npm run push:keys`.

### 동작
- 수집 경로에 얹었다. `/api/track`가 받는 클릭 이벤트(`cta_click`·`phone_click`·
  `kakao_click`·`form_start`)와 `/api/quote`의 접수(`lead`)가 그대로 알림 트리거가 된다.
  버튼 쪽 코드는 한 줄도 건드리지 않았다 — 이미 모든 CTA에 `data-cta-slot`이 붙어 있고
  [`Tracker.tsx`](components/analytics/Tracker.tsx)가 클릭을 잡고 있었기 때문이다.
- 견적문의 알림은 **`/api/quote`에서만** 보낸다. 거기엔 고객 이름·연락처가 있어 알림
  하나로 판단이 끝난다. `/api/track`의 `lead`는 제외했다 — 안 그러면 한 건에 두 번 울린다.
- 알림을 누르면 해당 화면이 열린다(문의는 `/admin/leads`, 클릭은 `/admin`).
  이미 열린 어드민 창이 있으면 새 창을 띄우지 않고 그 창을 쓴다.

### 알림 피로 방지 — 세 겹으로 거른다
알림은 많을수록 좋은 게 아니다. 잦으면 며칠 안에 꺼버리고, 그러면 정작 견적문의도 놓친다.
- **종류 선택** — 어드민에서 켠 이벤트만. '그 밖의 버튼 클릭'은 끄기 쉽게 따로 뒀다.
- **반복 억제** — 같은 방문자·같은 종류는 설정 간격(기본 30분) 안에 한 번만.
  판정은 `events` 테이블을 보는데, **INSERT 전에** 조회해야 방금 넣은 행이
  "이미 알림" 으로 잡히지 않는다(`app/api/track/route.ts`의 순서를 바꾸지 말 것).
- **방해금지 시간** — 설정 시간대에는 클릭 알림을 보내지 않는다.
  **견적문의 접수만은 예외**로 항상 보낸다.

### 어드민 (`/admin/notifications`)
- 기기마다 [이 기기에서 알림 받기] 한 번. 휴대폰·PC 여러 대를 동시에 등록할 수 있다.
- **[시험 알림 보내기]** — 이 기능은 "설정을 다 했는데 안 온다"가 가장 흔한 실패라,
  권한·구독·키·푸시 서비스 중 어디가 막혔는지 즉시 확인할 수단을 화면에 뒀다.
- 기기 목록에 마지막 도착 시각·연속 실패·오류 메시지를 그대로 노출한다.
  브라우저가 구독을 폐기하면(404/410) 자동으로 목록에서 내리고 배지로 알린다.
- 아이폰은 **홈 화면에 추가한 뒤**에만 알림이 가능하다(iOS 16.4+ 애플 정책).
  아이폰에서 접속하면 그 안내가 화면에 뜨고, 이를 위해 [`app/manifest.ts`](app/manifest.ts)를 추가했다.

### 보안 — service_role 키를 한 곳에만 도입
- 알림을 보낼 시점의 요청 주체는 **로그인하지 않은 방문자**다. 그 요청에서 기기 목록을
  읽어야 하는데, 익명(anon)에게 열면 사장님 기기의 푸시 주소가 공개된다. 그래서
  **발송 경로에만** service_role을 쓴다([`lib/supabase-service.ts`](lib/supabase-service.ts) —
  브라우저에서 import되면 예외를 던져 유출을 런타임에서 막는다).
- 어드민 화면의 조회·저장은 종전대로 **로그인 JWT + RLS**로 나간다. 두 테이블 모두
  익명 권한 0, 관리자만 접근하는 정책이다.
- 서비스워커([`public/sw.js`](public/sw.js))에는 **fetch 핸들러를 두지 않았다.**
  캐싱까지 하면 사장님이 [발행]한 내용이 방문자에게 옛 화면으로 남는 사고가 난다.

### 변경 파일
- 신규: `supabase/push-schema.sql` · `lib/push/{config,send,dispatch}.ts` ·
  `lib/supabase-service.ts` · `public/sw.js` · `app/manifest.ts` ·
  `app/api/push/{route,subscribe,test,key}` · `app/admin/(dashboard)/notifications/page.tsx` ·
  `components/admin/PushManager.tsx` · `scripts/generate-vapid-keys.mjs`
- 수정: `app/api/track/route.ts`(알림 트리거) · `app/api/quote/route.ts`(접수 알림) ·
  `components/admin/AdminNav.tsx`(메뉴) · `.env.example` · `package.json`(`web-push`)

---

## 2026-07-31 — 관리형 전환: 어드민 CMS · 실시간 분석 · CTA 실험 · 게시판 · 자동 색인

개발자 없이 마케팅을 운영할 수 있도록 사이트를 **관리형 구조로 전환**했다.
사장님이 직접 문구·사진·버튼을 바꾸고, 광고 성과를 보고, 검색 유입용 글을 쓸 수 있다.
운영 방법은 [`docs/어드민_사용법.md`](docs/어드민_사용법.md)에 정리했다.

> ⚠️ **적용 전 필수**: Supabase SQL Editor에서 `supabase/admin-schema.sql` →
> `supabase/analytics-functions.sql` 순서로 실행하고, 관리자 계정을 `public.admins`에
> 등록해야 어드민이 동작한다. 실행 전까지 **공개 사이트는 코드 기본값으로 정상 동작**한다.

### 콘텐츠 편집 (`/admin/content`)
- [`lib/content/schema.ts`](lib/content/schema.ts) **한 파일이 기본값·타입·어드민 폼을 동시에 정의**한다.
  필드를 늘릴 때 어드민 화면 코드를 건드릴 필요가 없다.
- DB(`site_content`) 값을 코드 기본값 위에 병합하므로, **DB가 비어 있거나 죽어 있어도
  사이트는 그대로 동작**한다(빌드 중 DB 접속 실패 시 기본값으로 렌더되는 것을 확인).
- 초안(`site_drafts`)과 발행본(`site_content`)을 **테이블로 분리**했다. 한 테이블에
  draft/published 컬럼을 두면 "익명은 published 컬럼만"을 RLS로 표현할 수 없어
  미발행 문구가 새어나간다.
- 편집 화면은 좌측 폼 / 우측 실제 사이트 iframe. 입력을 멈추면 1.5초 뒤 자동 임시 저장 →
  미리보기 갱신. 반영은 [발행]을 눌러야 하며 **재배포 없이 즉시** 적용된다(`revalidateTag`).
- 홈 섹션 전체가 콘텐츠 소비형으로 리팩터됨(Hero·Services·WhyUs·Process·Pricing·Faq·
  Quote·Contact·Footer·Header). 사업자 등록번호류는 **의도적으로 편집 대상에서 제외**했다.

### 실시간 분석 (`/admin`)
- 자체 이벤트 수집(`events`) + GA4 병행. GA4의 지연·표본 문제 없이 **15초 주기로 갱신**된다.
- 유입 경로 판정은 [`lib/analytics/attribution.ts`](lib/analytics/attribution.ts) 한 곳에서만 한다.
  UTM 우선, 없으면 referrer. `gclid`·`fbclid`·`n_ad_group` 같은 광고 클릭 식별자도 인식한다.
- **last non-direct click** 귀속(90일). 광고로 들어왔다가 나중에 직접 방문해 문의해도
  광고 성과로 남는다. 귀속 정보는 리드 행(`quotes`)에 복사 저장해 이벤트 보관기간(180일)이
  지나도 성과가 사라지지 않는다.
- 집계는 전부 DB 함수([`supabase/analytics-functions.sql`](supabase/analytics-functions.sql)).
  원본을 브라우저로 내려받아 집계하면 데이터가 쌓이는 순간 어드민이 멈춘다.
- 알림 메일에도 **유입 경로·캠페인**이 표시된다.

### CTA 실험 (`/admin/cta`)
- 슬롯 8곳(헤더·히어로·비용·폼·플로팅 등)의 문구·색·링크·아이콘을 어드민에서 직접 편집.
- 같은 슬롯에 변형을 추가하면 A/B 실험. **세션 ID 해시로 고정 배정**해 새로고침 시 버튼이
  바뀌지 않고, 서버에서 확정해 내려보내므로 깜빡임(CLS)이 없다.
- 노출·클릭을 집계해 클릭률 비교. 변형당 노출 100회 미만이면 "판단하기 이릅니다"로 표시해
  **표본이 적을 때 잘못된 결론을 내리지 않도록** 막았다.

### 게시판 + 한국어 SEO 글쓰기 도우미 (`/admin/posts`)
- `posts` 테이블 하나로 블로그(`/blog`)·공지(`/notice`)·시공실적(`/portfolio`) 운용.
  기존 파일 기반 시공실적 원장은 그대로 두고 **DB 글을 함께 노출**해 하위 호환을 지켰다.
- [`lib/seo/analyze.ts`](lib/seo/analyze.ts) — RankMath/Yoast식 실시간 점검(0~100점).
  영어권 기준(300 단어·수동태·전환어)을 그대로 쓰지 않고 **한국어 기준으로 재조정**했다:
  본문 글자 수(600/1,500자), 제목 15~35자, 메타 70~90자, 어절 기준 키워드 밀도.
  한국어 신뢰도가 낮은 수동태·전환어 검사는 넣지 않았다.
- 검색 결과 미리보기, 포커스 키워드 위치 점검(제목·메타·첫 문단·소제목·이미지 alt),
  내부/외부 링크, 이미지 alt 누락 검사.
- Article JSON-LD, `/feed.xml` RSS, sitemap 자동 반영.

### 자동 색인 제출
- 발행 시 **IndexNow**로 네이버 서치어드바이저·Bing에 자동 제출([`lib/indexnow.ts`](lib/indexnow.ts)).
  제출 이력은 `/admin/seo`에서 확인.
- **구글은 IndexNow 미참여**이고 공식 Indexing API도 채용공고·방송 전용이라 일반 페이지에는
  쓸 수 없다. 대신 sitemap `lastmod`를 **글의 실제 수정 시각**으로 내보내도록 고쳤다
  (기존에는 전 항목이 빌드 시각이라 변경 신호로서 의미가 없었다).

### 크로스브라우징
- Tailwind v4는 Safari 16.4+/Chrome 111+/Firefox 128+를 요구한다. 그 미만에서는 화면이
  깨진 채 렌더되므로, `@supports`로 기능을 검사해 **안내 띠 + 전화번호**를 노출한다
  (UA 판별이 아니라 기능 검사라 브라우저가 새로 나와도 오탐이 없다).
- 카카오톡·네이버 인앱 브라우저 대응: iOS 16px 미만 입력창 자동 확대 방지, `safe-area-inset`
  하단 여백, `-webkit-tap-highlight-color` 제거, `text-size-adjust` 고정, 가로 넘침 차단.
- 대시보드에 **기기·브라우저 분포**를 넣어 인앱 브라우저 비중을 실제 수치로 확인할 수 있게 했다.
- `browserslist` 명시, `viewport` export(`viewportFit: cover`), 404 페이지 추가.

### 보안
- Supabase Auth + `public.admins` 화이트리스트. 계정이 있어도 화이트리스트에 없으면 권한 없음.
- **service_role 키를 도입하지 않았다.** 어드민도 로그인 사용자의 JWT로 접근하므로
  DB의 RLS(`is_admin()`)가 최종 방어선이다. 앱 코드에 구멍이 나도 데이터가 새지 않는다.
- `is_admin()`은 `security definer` + `search_path` 고정(미고정 시 권한 상승 경로가 열린다).
- 이벤트 수집 API는 클라이언트가 보낸 유입 정보를 믿지 않고 **서버가 쿠키에서 읽는다**.
  그대로 믿으면 조작된 광고 성과가 쌓인다.
- 어드민 `robots: noindex` + `robots.txt` `/admin` 차단.

### 기타 수정
- `app/opengraph-image.tsx` — 폰트 CDN 실패 시 예외로 **배포 전체가 실패**하던 것을
  기본 글꼴 폴백으로 완화.
- 미사용 `content/faq.ts` 제거(어드민 편집으로 이관). `ClickTracking` → `Tracker`로 통합.

---

## 2026-07-22 — 리드 알림 파이프라인 프로덕션 라이브 · 사업영역 3대 개편

**리드 알림 라이브 확정.** Resend 환경변수 정정 후 프로덕션 재배포(`git push` 자동 배포)로
실배포에 반영. 콜백 퀵폼(번호만 남기는 이탈 회수 경로, `source='callback'`) 정상 작동 확인 —
견적폼·콜백폼 모두 `/api/quote`를 타고 **Supabase 저장 + 사장님 Naver 메일 발송**이 라이브.
카카오 알림톡 연동은 추후 선택 항목으로 [`TODO.md`](TODO.md)에 정리(코드는 준비 완료).

**홈 사업영역 4대 → 3대 개편.** 고압 수전설비·계약전력 증설은 협력업체 의존 형태라 독립
'주력' 카드에서 제외하고, 공장·산업 전기공사 카드의 하위 항목('계약전력 증설·수전설비 연계
시공')으로 편입 — 공사 가능함은 유지. `/services/power` 상세페이지·푸터 링크·견적폼 옵션은
SEO 위해 유지(홈 카드에서만 제외). (`content/services.ts`·`Services.tsx`, 커밋 6cf84b1)

---

## 2026-07-22 — Resend→Naver 견적 알림 메일 연동 완료

신규 Resend 계정 기준으로 견적문의 알림 메일 발송을 활성화. 발신 도메인 `wnjpower.com`
인증 완료(SPF/DKIM), 발신 `quote@wnjpower.com` → 수신 사장님 Naver 메일함
(`wnj-2023@naver.com`) 받은편지함 도착 확인.

- `.env.local`에 신규 `RESEND_API_KEY` + `NOTIFY_FROM_EMAIL=quote@wnjpower.com` 설정
- **Vercel Production 환경변수 정정** — 기존 값이 내용 없는 `sensitive` 타입
  (`RESEND_API_KEY=""`, `NOTIFY_FROM_EMAIL=onboarding@resend.dev`)이라 실배포에서 메일이
  발송되지 않던 문제를, 읽기 가능한 `encrypted` 타입 + 신규 키·인증 도메인 값으로 교체해 정상화
- `scripts/test-resend.mjs` + `npm run test:resend` 스모크 테스트 신설(Naver 도착 확인용)
- ⚠️ 환경변수 반영은 **다음 프로덕션 재배포부터** 적용됨
- 참고(개발 환경): 이 Windows/Git Bash 환경에서 `vercel env add`는 stdin 값이 전달되지 않아
  빈 값으로 저장되므로, Vercel 환경변수는 REST API로 설정함

---

## 2026-07-22 — 절제된 기관형 디자인·정보구조 전면 재구축

디자인이 전문적으로 보이지 않고 정보 구조가 직관적이지 않던 문제를 해결하기 위해
표현 계층과 정보구조를 밑바닥부터 재구축. 백엔드(Supabase·Resend·API·폼 로직·SEO·
스키마·GA4)는 그대로 유지. **프로덕션 배포 완료.**

### 디자인 시스템 — "절제된 기관형"
- 딥 스틸네이비를 지배색으로, 강조색(번트 앰버 `#C2620E`)은 전화 CTA 등 극소수 지점에만.
  고채도 로열블루(`#0A3D91`) + 네온오렌지(`#FF5500`) 남발이 주던 "전단지" 인상을 제거
- `app/globals.css`에 `brand`/`signal` 토큰 정리(shadcn `--primary`도 새 네이비로 통일),
  기존 `bg-photo-*` 사진 오버레이 → `tech-dark`(네이비 + 미세 도면격자) 유틸리티로 대체
- 공용 프리미티브 신설: `components/ui/section.tsx`(Section·Container·Eyebrow·SectionHeading),
  `components/ui/cta.tsx`(PhoneButton·QuoteButton·CtaRow) — 전 페이지가 같은 디자인 언어 공유
- 히어로/서브히어로: 전기와 무관하던 스톡사진 제거 → 네이비 배경 + 단선결선도(one-line
  diagram) 라인아트로 사진 없이 전기 엔지니어링 인상 구현 (실사진 확보 시 교체 가능)
- 과한 hover(대형 translate/scale)·CTA 맥박 애니메이션 제거해 차분한 톤으로

### 정보구조 (홈)
- 중복이던 3개 섹션 정리: `CustomerSegments`·`TrustBar` 삭제(dead code),
  `Credentials`·`About`은 `/about` 전용으로 이동
- 새 순서: Hero → Services → WhyUs(차별점 + 검증 가능한 자격 통합) → Process →
  Portfolio → Pricing → Faq → Quote → Contact. 각 섹션이 방문자의 질문 하나씩만 담당
- **시공 실적**: 가짜 "샘플 사진 + 경고배너"를 완전히 제거하고 정직한 실적 원장(텍스트
  트랙레코드, "시공 실적표")으로 전환 — 신뢰를 크게 깎던 요소 해소

### 정확성·기타
- "업력 20년+"(법인 2023 설립과 모순) → "대표 현장경력 20년+ · 2023 법인 설립"으로 교정
- OG 공유 이미지 배경·강조색을 새 팔레트로 통일
- 서브페이지(서비스 상세·시공실적·회사소개·FAQ·개인정보)·플로팅 CTA 전부 새 톤으로 정렬
- TypeScript 타입체크 통과, 데스크톱 전 섹션 시각 검증, 프로덕션 라이브 확인

---

## 2026-07-20 — 전면 개편 Phase 0~2 · 계정 이관 · Supabase 연동

### Phase 2 — 멀티페이지 IA 전환
- `app/page.tsx` 서버 컴포넌트화(프리필 상태를 `QuotePrefill` 컨텍스트로 분리)
- 서비스 상세 4페이지(`/services/{factory,power,panel,interior}`), 시공사례 목록·상세
  (`/portfolio`, `/portfolio/[slug]` 8건), 회사소개·FAQ 페이지 신설
- `SubPageShell`로 서브페이지 하단에 견적폼 임베드
- 사이트맵 자동 생성, 페이지별 메타데이터·canonical, BreadcrumbList·Service 구조화 데이터,
  내부 링크 구성 — 색인 대상 URL 2개 → 17개

### Phase 1 — 톤 정리·전환 경로 재편
- 강조색 단일화(옐로·테라코타 → 오렌지 1종), 디자인 토큰 교정, 다크 히어로 전환,
  라운드 통일, 오렌지 버튼 대비 개선(AA 충족)
- 전화 1순위 CTA 재편, 모바일 하단 고정 CTA 바 신설, 콜백 퀵폼(`CallbackForm`) 신설,
  컨텍스트 CTA 밴드, 응답 SLA 구체화
- 히어로에 등록번호 노출, FAQPage 구조화 데이터

### Phase 0 — 측정·공유·신뢰 결함 수정
- GA4 측정 ID 결함 수정, 전화·카카오톡 클릭 추적(`ClickTracking`) 신설, Vercel Analytics 연동
- OG 이미지 동적 생성(`opengraph-image.tsx`), SchemaOrg 보강(geo·taxID·hasCredential 등)
- 카카오톡 더미 URL 제거, 저작권 연도 동적화, 면허번호 본문 노출, 자격 조회 딥링크,
  `lib/site.ts`(회사 정보·채널 URL 단일 소스) 신설

### 인프라 이관·연동
- Supabase 신규 프로젝트 `wnj-website`(서울) 생성 + `quotes` 스키마·RLS 적용, E2E 검증
- Vercel 계정 이관(`wnjpower-erp` 팀), 도메인 `www.wnjpower.com` 연결, 환경변수 입력
- apex → www 정규화, 홈 canonical 추가, 견적 API `emailSent` 응답 노출
- Vercel Analytics 활성화·GA4 발화 라이브 확인

---

## 2026-06-15 — SEO·분석 연동 · 이메일/알림 개선

- WNJ 로고 파비콘(`app/icon.svg`)·iOS 아이콘(`apple-icon.tsx`)
- 네이버 서치어드바이저 소유 확인 메타태그, robots.txt 보강, 사이트 URL 통일
- GA4 연동(`generate_lead` 이벤트), 사이트 설명 80자 이내 단축
- Resend 이메일 템플릿 시각화 개선, 카카오 알림톡 연동 코드 준비(`lib/kakao-alimtalk.ts`),
  견적폼 성공 화면 개선

---

## 2026-06-14 — Supabase DB 구축 · 공장·산업 전기공사 중심 개편

- Supabase `quotes` 테이블 + RLS(익명 INSERT 허용, SELECT 차단), E2E 검증
- 서비스 4종 재편·고객군 2분할·견적 폼 다단계 재편, 사진 배경 시스템
- 견적 폼 치명적 버그 수정(RHF forwardRef)
- Footer 면허번호, 헤더 메뉴 레이블 변경, 로고 이미지 적용, 연락처 필드 개편

---

## 초기 — 기반 구축

- Next.js 14 App Router + TypeScript + Tailwind CSS v4 + shadcn/ui
- Supabase · Resend · GitHub → Vercel 자동 배포 파이프라인
- 전 섹션 구현 + 동적 효과 + 접근성 처리
