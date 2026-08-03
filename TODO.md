# 우앤주전력 웹사이트 — 남은 작업

> **프로덕션**: https://www.wnjpower.com (apex → www 308 리다이렉트)
> **GitHub**: https://github.com/wnjpower/website · **Vercel**: `wnjpower-erp` 팀 / `wnj-website`
> **Supabase**: `wnj-website` (서울 `ap-northeast-2`)
> **최종 업데이트**: 2026-07-31

> ✅ **완료된 변경 이력은 [`CHANGELOG.md`](CHANGELOG.md)** 참조.
> 이 문서는 아직 끝나지 않은 **운영·콘텐츠·선택** 항목만 추적한다.
> 코드(개발)는 완료 상태이며, 아래는 대부분 외부 설정·사장님 제공·운영 등록 건이다.

---

> ✅ **리드 알림(이메일) 라이브** — 견적폼·콜백 퀵폼 모두 `/api/quote`로 접수돼 Supabase 저장 +
> 사장님 Naver 메일 발송이 프로덕션에서 동작 중. (상세: [`CHANGELOG.md`](CHANGELOG.md) 2026-07-22)

## 🔴 지금 바로 — 어드민 활성화

> 2026-07-31 관리형 전환(어드민 CMS·분석·CTA 실험·게시판). **코드와 DB는 완료**됐다.
> 남은 것은 **관리자 계정 등록**과 **배포**뿐이다.
> 사용법: [`docs/어드민_사용법.md`](docs/어드민_사용법.md)

- [x] ~~**STEP 0 — Supabase 프로젝트 재개**~~ ✅ 완료 (2026-07-31)
  `wnj-website`(`wtlvbilsakoktcrrqlfi`)가 일시중지 상태였다 → 재개함. 무료 tier는 일정 기간
  미사용 시 자동 정지되고, **정지 중에는 견적문의 DB 저장이 실패**한다(이메일은 정상이라
  리드 자체는 전달됨). 앞으로도 방문이 뜸하면 다시 정지될 수 있으니 주기적으로 확인할 것.
- [x] ~~**STEP 1 — SQL 실행**~~ ✅ 완료 (2026-07-31)
  `admin-schema.sql`·`analytics-functions.sql`을 마이그레이션으로 적용. 적용 후 Supabase
  보안 점검(advisors)에서 나온 경고를 반영해 아래를 추가로 조였고, 저장소 SQL 파일도 동일하게 맞췄다.
  - 전 함수 `search_path` 고정 (미고정 시 가짜 테이블을 앞세우는 권한 상승 경로가 열린다)
  - `prune_events()`에 관리자 검사 추가 — 없으면 **관리자가 아닌 로그인 사용자가 RPC로
    분석 데이터를 통째로 삭제**할 수 있었다
  - `is_admin()`·분석 함수의 PUBLIC EXECUTE 회수 (익명 호출 가능 함수 0개 확인)
  - media 버킷 익명 목록 조회 차단 (public 버킷은 SELECT 정책 없이도 사진이 정상 노출됨)
  - 검증 결과: 익명은 `site_content`·`ctas`·`posts` 읽기 200 / 나머지 전부 401,
    `quotes`·`events` INSERT는 정상 동작
- [ ] **STEP 2 — 관리자 계정 등록** ← 지금 할 일
  현재 `auth.users`가 **0명**이라 아직 아무도 로그인할 수 없다.
  Supabase → Authentication → Users → Add user (**Auto Confirm User 체크**) 후 SQL 실행:
  ```sql
  insert into public.admins (user_id, email, name)
  select id, email, '임태훈' from auth.users where email = 'wnj-2023@naver.com'
  on conflict (user_id) do nothing;
  ```
  ⚠️ 이걸 빼면 로그인은 되지만 "관리자 권한이 없는 계정" 화면이 나온다.
- [ ] **STEP 3 — 배포** — `git push` (Vercel 자동 배포). 배포 전까지 `/admin`은 열리지 않는다.
- [ ] **STEP 4 — 확인**
  `/admin` 로그인 → 실시간 현황 → 홈페이지 편집에서 문구 하나 바꿔 [발행] → 사이트 반영 확인 →
  게시판에 시험 글 1건 발행 → `/admin/seo`에서 IndexNow 제출 성공 확인
  (키 파일 `https://www.wnjpower.com/7cc4061689dcd8a0e0b037335893d356.txt` 가 200이어야 한다)

## 🔴 실시간 알림 활성화 (CTA 클릭 → 폰 알림)

> 2026-07-31 추가. **코드는 완료**됐고 남은 것은 키 발급·SQL·기기 등록뿐이다.
> 셋 중 무엇이 빠져도 **알림만 꺼지고 사이트·견적 접수는 정상 동작**한다.
> 사용법: [`docs/어드민_사용법.md`](docs/어드민_사용법.md) 7번

- [x] ~~**STEP 1 — VAPID 키 생성**~~ ✅ 완료 (2026-07-31)
      키는 Vercel(production·development)과 로컬 `.env.local`에 들어가 있다.
      바꾸면 등록된 기기가 전부 무효가 되므로 그대로 쓸 것.
- [x] ~~**STEP 2 — SQL 실행**~~ ✅ 완료 (2026-07-31)
      `supabase/push-schema.sql`을 Management API로 적용. 검증 결과:
      `push_subscriptions`·`notification_settings` 생성 · RLS 활성 · 정책 각 1개 ·
      **익명 권한 0**(anon REST 접근 404) · 설정 기본행 1건 · updated_at 트리거 2개
- [x] ~~**STEP 3 — Vercel 환경변수 입력**~~ ✅ 완료 (2026-07-31)
      `NEXT_PUBLIC_VAPID_PUBLIC_KEY` · `VAPID_PRIVATE_KEY` · `SUPABASE_SERVICE_ROLE_KEY`
      3개를 **production + development**에 encrypted 타입으로 등록하고, 저장된 값이
      원본과 일치하는지 되읽어 확인함. (`VAPID_SUBJECT`는 코드 기본값으로 충분해 생략)
      > ⚠️ `SUPABASE_SERVICE_ROLE_KEY`는 RLS를 전부 우회하는 키다. `NEXT_PUBLIC_` 접두어를
      > 절대 붙이지 말 것. 이 앱에서는 알림 발송 경로(`lib/push/*`)에서만 쓴다.
- [x] ~~**STEP 3.5 — 배포**~~ ✅ 완료 (2026-07-31, `58d769d`)
      프로덕션 확인: `/api/push/key`가 VAPID 공개키를 반환(= 코드·환경변수 모두 반영) ·
      `/manifest.webmanifest`·`/sw.js`·아이콘 200 · `/api/push` 401(관리자 전용 가드 정상)
- [ ] **STEP 4 — 기기 등록** ← 지금 할 일 — `/admin/notifications`에서 **휴대폰·PC 각각** [이 기기에서
      알림 받기] → [시험 알림 보내기]로 도착 확인
      - 아이폰은 사파리 [공유] → [홈 화면에 추가] 후 **그 아이콘으로 들어와서** 켜야 한다
        (iOS 16.4+ 애플 정책, 우회 불가)
- [ ] **STEP 5 — 실사용 점검** — 며칠 써 보고 알림이 잦으면 '그 밖의 버튼 클릭'을 끄거나
      반복 억제 간격을 늘린다. 밤에 방해되면 방해금지 시간(예: 22~07)을 설정

- [ ] **광고 링크에 UTM 붙이기** (사장님/광고 담당)
  광고 성과를 경로별로 나누려면 도착 URL에 `?utm_source=naver&utm_medium=cpc&utm_campaign=이름`
  형태를 붙여야 한다. 특히 **`utm_medium=cpc`가 빠지면 유료 광고가 자연 검색으로 잡힌다.**

## 🟠 1b 블루프린트 리디자인 — 서비스 상세만 이관 완료

> 디자인 원본: Claude Design 프로젝트 `WnjPower 웹사이트 UX/UI 개선안`
> 이관 스펙: 같은 프로젝트의 `docs/실코드-이관-스펙.md` (9단계 PR 순서 포함)

- [x] ~~**서비스 상세 `/services/[slug]`**~~ ✅ 완료 (2026-08-03, 스펙 9단계 중 6단계)
      디자인 토큰·유틸리티는 `components/redesign/blueprint.css`에 있고 `.blueprint-theme`
      스코프 안에 갇혀 있다. Next가 이 CSS를 라우트 청크로 분리해서 **다른 페이지에는
      아예 로드되지 않는다**(확인: `/services/[slug]/page.css`, `:root` 오염 0건).
- [x] ~~**홈 `/`**~~ ✅ 완료 (2026-08-03, 스펙 3~5단계)
      히어로(단선결선도)·퀵폼·사업영역·진행절차·실적 원장표·자격(다크)·비용 기준·
      노출형 FAQ·견적폼·오시는 길. 어드민 편집·CTA A/B·`/api/quote`·알림톡은 그대로다.
      - 신규 CTA 슬롯: `quick_bar_submit`, `service_card_{slug}` (스펙 §8)
      - 히어로 CTA 위계를 뒤집었다 — 견적(채움) > 전화(테두리). 이전엔 전화가 주 버튼이라
        근무 중 전화가 어려운 발주 담당자에게 막다른 길이었다
      - 퀵폼은 `source='quick_bar'`로 접수돼 어드민 실시간 현황에서 본폼과 전환율 비교 가능
- [ ] **나머지 페이지 이관** — 지금은 `/`와 `/services/*`가 새 디자인이고 `/portfolio`·`/faq`·
      `/about`·`/blog`는 기존 네이비 디자인이다(SubPageShell). **헤더·푸터가 페이지마다
      다르게 보이는 상태**이므로 오래 두지 말 것. 남은 순서:
      `WNJ 시공실적 (1b)` 이관 → SubPageShell을 블루프린트 골격으로 교체 →
      토큰을 globals.css `:root`로 승격(그 시점에 `components/redesign/blueprint.css`의
      `.blueprint-theme` 스코프를 풀면 된다)
- [ ] **구 컴포넌트 정리** — 홈이 새 섹션으로 갈아타면서 아래가 서브페이지에서만 쓰인다.
      전체 이관이 끝나면 삭제 대상: `components/sections/Hero·Services·WhyUs·Process·
      Pricing·Faq·QuoteSection·QuoteForm·CallbackForm·Contact·Footer`, `components/Header.tsx`,
      `components/FloatingCta.tsx`
- [ ] **콜백폼 폐지 판단** — 퀵폼이 대체하지만 스펙 §5는 2주 병행 후 지표로 결정하라고 한다.
      현재 콜백폼은 서브페이지(SubPageShell)에만 남아 있다. `source`별 전환율로 비교할 것
- [ ] **서비스 상세에서 빠진 것** (원본 디자인·스펙이 의도적으로 뺀 항목. 되살릴지 판단 필요)
      - **페이지 내 견적폼** — 기존에는 `SubPageShell`이 폼을 심어 `source='service_{slug}'`로
        접수됐다. 새 디자인은 홈(`/#quote`)으로 보낸다. 공종별 리드 귀속이 끊기므로
        CTA 클릭에 `service_cta_{slug}` 슬롯을 달아 클릭 단계까지는 계속 집계된다.
        폼을 페이지에 다시 넣으면 전환은 오르지만 디자인 원안과 달라진다.
      - **관련 시공 사례 3건** — `/portfolio/*`로 가던 문맥 내부링크가 사라졌다.
      - **다른 사업영역 카드** — 상단 공종 탭이 같은 역할을 하므로 중복 제거됨.
- [ ] **한글 서체** — 스펙은 IBM Plex Sans KR을 지정하지만, 이미 전역으로 싣는 Pretendard를
      한글 폴백으로 썼다(한글 웹폰트 2벌 = 모바일 첫 화면 지연). 디자이너 확인 필요.
- [ ] **어드민에서 안 쓰이게 된 필드** — 저장된 값을 잃지 않으려고 기본값에는 남겼지만
      화면에는 나오지 않고 편집 화면에서도 뺐다: `header.topBar*`(상단 유틸 띠 삭제 — P3),
      `whyus.reasons`·`verifyTitle`(차별점 4가지 → 자격 카드로 통합 — P3),
      `hero.segments`(고객 유형 안내 링크). 전체 이관이 끝나면 기본값에서도 지울지 결정.
- [ ] **홈 모바일(900px 미만) 실기기 확인** — 미디어쿼리·하단바·safe-area가 배포물에 들어간
      것은 확인했으나, 브라우저 창 리사이즈가 먹지 않아 눈으로 보지는 못했다.
- [ ] **제도 수치 실무 검수** — 서비스 상세 본문의 계약전력 기준(저압 100kW), 시설부담금
      기본거리(공중 200m·지중 50m), 사용전점검/검사 구분(75kW·100kW), 감소 후 3년 내 재증설
      면제 등. 원본 `content/service-pages.ts` 주석과 스펙 §10이 모두 검수를 요청하고 있다.

## 🟡 카카오 알림톡 연동 (추후) — 코드 완료, 외부 설정만 남음

> 리드 알림의 **기본 경로(이메일)는 이미 라이브**다. 알림톡은 그 위에 얹는 **선택 강화**이며
> 지금 당장 없어도 리드는 정상 전달된다. 코드는 준비 완료(`lib/kakao-alimtalk.ts`)이고,
> 견적폼·콜백폼이 모두 `/api/quote`를 타므로 아래 설정만 마치면 **두 경로 모두 자동으로
> 알림톡이 함께 발송**된다. 설정 전까지는 알림톡 없이 이메일만 발송된다(graceful degradation).

- [ ] **STEP 1** — 카카오 비즈니스 채널 개설 ([business.kakao.com](https://business.kakao.com), 인증 1~2영업일)
- [ ] **STEP 2** — Solapi 가입·API 키 발급 + 채널 연동 + 발신번호 `010-8552-9994` 등록
- [ ] **STEP 3** — 알림톡 템플릿 등록·카카오 검수 (1~3영업일, 템플릿은 `.env.example` 참고)
  - ⚠️ 콜백 접수는 이름이 `콜백 요청`으로 저장된다. 신청자 수신 템플릿의 `#{성함}` 문구가
    어색하지 않은지("콜백 요청님") 검토하거나 콜백 전용 문구를 별도로 둘지 정할 것.
- [ ] **STEP 4** — Vercel 환경변수 입력 후 재배포 (입력 시 자동 활성화)
  ```
  SOLAPI_API_KEY / SOLAPI_API_SECRET / SOLAPI_PF_ID
  SOLAPI_SENDER_NUMBER=010-8552-9994
  SOLAPI_TEMPLATE_TO_REQUESTER / SOLAPI_TEMPLATE_TO_OWNER
  OWNER_MOBILE=010-8552-9994
  ```
  > ⚠️ Vercel 환경변수는 이 환경의 CLI(`vercel env add`)로는 값이 빈 채로 저장되니 주의.
  > REST API 또는 Vercel 대시보드로 입력할 것 (배경: memory `wnj-vercel-env-cli-gotcha`).

## 🟡 콘텐츠 — 사장님 제공 필요

- [ ] **실제 시공 사진** 6~9장 — 현재 실적은 텍스트 원장(시공 실적표)으로 표시 중.
  사진 확보 시 `Portfolio`를 사진 카드 레이아웃으로 전환(재구축으로 기존 "샘플 배지" 방식은
  폐기됨). 촬영 우선순위: **배전반 제작 3단계(외함→결선→완성품)** ← "자체 제작"의 유일한 증거 /
  수전설비 / 노후 분전반 교체 전·후 같은 앵글 / 공장 내부 전경 (상세: 개편 보고서 §7.2)
- [ ] **대표 사진** — 확보 시 `components/sections/About.tsx`에 사진 영역 추가
  (현재는 사진 없이 인용부호 심볼로 대체 중)
- [ ] **"대표 현장경력 20년+" 사실 확인** — 재구축에서 "업력 20년+"(2023 법인설립과 모순)을
  이렇게 교정함. 실제 연수 확인 필요 (`Hero.tsx`·`About.tsx`·`Credentials.tsx`)
- [ ] **히어로 수치 확정** — 누적 시공 건수·배전반 제작 면수 확보 시 `Hero.tsx` `trustStats` 교체
- [ ] **비용 가이드 실제 단가** — `Pricing.tsx` `priceItems`가 전부 "협의 후 견적". 확정 단가 기입
- [ ] **카카오톡 채널 URL / 네이버 플레이스·블로그 URL** — [`lib/site.ts`](lib/site.ts) 한 곳만
  입력하면 FloatingCta·Contact·SchemaOrg에 자동 반영(현재 null이라 버튼 숨김)
- [ ] **FAQ 내용 검수** — [`content/faq.ts`](content/faq.ts)
- [ ] **영업시간 확정** — 현재 Header·Contact는 `평일 09:00–18:00 · 토 09:00–13:00`로 통일됨.
  실제 시간 확인 후, `components/SchemaOrg.tsx`의 openingHours도 일치시킬 것
- [ ] **서비스 페이지 제도 수치 검수** — 계약전력 기준 등(계약전력 100kW 저압, 시설부담금 거리 등).
  공식 출처로 작성했으나 제도 개정·현장 실무 대조 필요 (`content/service-pages.ts`)

## 🟢 SEO · 분석 (운영 등록)

- [ ] **🔴 네이버 스마트플레이스 등록·최적화** — 보고서가 꼽은 **네이버 유입 최우선**. 로컬 검색
  최상단이 플레이스 영역인데 현재 미등록. 미클레임 플레이스 확인 → 없으면 신규 등록(90일 부스팅)
- [ ] **네이버 플레이스 NAP 일치** — 사이트 이름·주소·전화 = 플레이스 동일 확인
- [ ] **네이버 서치어드바이저 사이트맵 제출** — `https://www.wnjpower.com/sitemap.xml`
- [ ] **Google Search Console 등록** — 소유 확인 후 `/sitemap.xml` 제출
- [ ] **OG·카카오 공유 미리보기 확인** — [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서
  캐시 초기화 + 미리보기 확인 (재구축으로 OG 이미지 색상 변경됨)
- [ ] **GA4 전환 이벤트 확인** — 실사용 유입 후 실시간 보고서에서 `phone_click`·`generate_lead`·`callback_request` 수신 확인

## ⚪ 추후 개선 (선택)

- [ ] **견적서 이메일 양식 개선** — 견적문의 알림 메일을 "견적서" 양식으로 발전시키고,
  받은편지함에서 **일반 메일과 시각적으로 명확히 구분**되게 설정(전용 발신자 표시명·제목
  규칙·전용 라벨/템플릿 등). 현재는 `app/api/quote/route.ts`의 `buildEmailHtml` 단일 템플릿.
- [ ] Cloudflare Turnstile — 견적 폼 봇 차단 강화
- [ ] 카카오맵 실제 임베드 — 현재는 카카오맵 링크 카드(`Contact.tsx`)
- [ ] Lighthouse 모바일 90점 이상 최적화
- [x] ~~포트폴리오 CMS화~~ — 완료. 어드민 게시판(`/admin/posts`, 타입 `시공실적`)에서
      사진과 함께 등록하면 `/portfolio`에 노출된다. 기존 파일 기반 실적 원장은 그대로 유지
- [ ] **서비스 상세 페이지도 어드민 편집 대상으로** — 현재 `content/service-pages.ts` 파일 기반.
      제도 수치가 많은 긴 기술 문서라 이번 범위에서 제외했다
- [ ] **이벤트 자동 정리 스케줄** — `prune_events(180)` 함수는 만들어 뒀으나 자동 실행은 미설정.
      Supabase `pg_cron`을 켜서 하루 1회 돌리면 무료 tier 500MB를 안정적으로 유지할 수 있다
- [ ] **@vercel/og 로컬 빌드 실패 (Windows 전반)** — `npm run build`가 `/opengraph-image`에서
      `TypeError: Invalid URL`로 멈춘다. 원인은 `@vercel/og` 내부의
      `fileURLToPath(join(import.meta.url, '../noto-sans...ttf'))`인데, Windows의 `path.join`은
      `file:///C:/...` 를 `.\file:\C:\...` 로 바꿔버려 URL이 깨진다.
      **경로에 공백·한글이 없어도 Windows면 항상 실패**한다(재현: 위 두 줄을 node로 실행).
      Vercel(리눅스) 빌드는 정상이라 **배포에는 영향이 없고**, 나머지 37개 페이지는 모두 생성된다.
      로컬에서 빌드를 끝까지 돌려야 하면 WSL/리눅스에서 빌드하거나 해당 라우트를 임시로 비울 것.

---

## 📁 주요 파일 위치 참조

| 목적 | 경로 |
|------|------|
| **어드민 사용법 (사장님용)** | [`docs/어드민_사용법.md`](docs/어드민_사용법.md) |
| **편집 가능한 문구·기본값·어드민 폼 정의 (단일 소스)** | [`lib/content/schema.ts`](lib/content/schema.ts) |
| 어드민 스키마 · 분석 집계 함수 | [`supabase/admin-schema.sql`](supabase/admin-schema.sql) · [`supabase/analytics-functions.sql`](supabase/analytics-functions.sql) |
| 유입 경로(광고 귀속) 판정 | [`lib/analytics/attribution.ts`](lib/analytics/attribution.ts) |
| CTA 슬롯·A/B 배정 | [`lib/cta/schema.ts`](lib/cta/schema.ts) · [`lib/cta/get.ts`](lib/cta/get.ts) |
| 한국어 SEO 분석기 | [`lib/seo/analyze.ts`](lib/seo/analyze.ts) |
| 게시판(블로그·공지·시공실적) | [`lib/posts.ts`](lib/posts.ts) |
| IndexNow 자동 색인 제출 | [`lib/indexnow.ts`](lib/indexnow.ts) · 키 파일 `public/<키>.txt` |
| 인증·어드민 가드 | [`middleware.ts`](middleware.ts) · [`lib/supabase-server.ts`](lib/supabase-server.ts) |
| **회사 정보·외부 채널 URL (단일 소스)** | [`lib/site.ts`](lib/site.ts) |
| **디자인 토큰·유틸리티** | [`app/globals.css`](app/globals.css) |
| **공용 레이아웃·CTA 프리미티브** | [`components/ui/section.tsx`](components/ui/section.tsx) · [`components/ui/cta.tsx`](components/ui/cta.tsx) |
| 개편 기획 보고서 | [`docs/웹사이트_전면개편_기획보고서.md`](docs/웹사이트_전면개편_기획보고서.md) |
| 환경변수 템플릿 | [`.env.example`](.env.example) |
| DB 스키마 | [`supabase/schema.sql`](supabase/schema.sql) |
| 견적 API | [`app/api/quote/route.ts`](app/api/quote/route.ts) |
| Zod 검증 스키마 | [`lib/validators.ts`](lib/validators.ts) |
| GA4 / 클릭 추적 | [`components/GoogleAnalytics.tsx`](components/GoogleAnalytics.tsx) · [`components/ClickTracking.tsx`](components/ClickTracking.tsx) |
| OG 이미지 | [`app/opengraph-image.tsx`](app/opengraph-image.tsx) |
| 구조화 데이터 | [`components/SchemaOrg.tsx`](components/SchemaOrg.tsx) · [`components/FaqSchema.tsx`](components/FaqSchema.tsx) |
| 카카오 알림톡 | [`lib/kakao-alimtalk.ts`](lib/kakao-alimtalk.ts) |
| **실시간 알림(웹 푸시)** | [`lib/push/`](lib/push) · [`public/sw.js`](public/sw.js) · [`supabase/push-schema.sql`](supabase/push-schema.sql) |
| 서비스/시공사례/FAQ 콘텐츠 | [`content/service-pages.ts`](content/service-pages.ts) · [`content/portfolio.ts`](content/portfolio.ts) · [`content/faq.ts`](content/faq.ts) |
| 서브페이지 골격 | [`components/SubPageShell.tsx`](components/SubPageShell.tsx) · [`components/PageHero.tsx`](components/PageHero.tsx) |
| 히어로 수치 | [`components/sections/Hero.tsx`](components/sections/Hero.tsx) |
| 비용표 | [`components/sections/Pricing.tsx`](components/sections/Pricing.tsx) |
| 영업시간 | [`components/Header.tsx`](components/Header.tsx) · [`components/sections/Contact.tsx`](components/sections/Contact.tsx) · [`components/SchemaOrg.tsx`](components/SchemaOrg.tsx) |
| 개인정보처리방침 | [`app/privacy/page.tsx`](app/privacy/page.tsx) |
