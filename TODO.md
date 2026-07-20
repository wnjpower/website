# 우앤주전력 웹사이트 작업 현황

> **프로덕션 URL**: https://www.wnjpower.com  
> **GitHub**: https://github.com/sinequanon2002/wnjpower  
> **최종 업데이트**: 2026-07-20 (7차 — 전면 개편 Phase 0: 측정·공유·신뢰 결함 수정)

> 📄 **개편 방향 문서**: [`docs/웹사이트_전면개편_기획보고서.md`](docs/웹사이트_전면개편_기획보고서.md)
> 리드 미발생 원인 진단(유입·전문성·전환/측정·운영)과 Phase 0~3 로드맵. 아래 작업은 그 Phase 0에 해당한다.

---

## ✅ 완료된 작업

### 전면 개편 Phase 2 — 멀티페이지 IA 전환 (2026-07-20 9차)

> 유입 문제의 본체. 원페이지라 색인 가능한 URL이 2개(`/`, `/privacy`)뿐이었고
> 키워드 10여 개가 홈 한 장에 몰려 어느 키워드에서도 관련성이 분산됐다.
> **색인 대상 URL 2개 → 17개**, 정적 페이지 11개 → 26개로 확장.

**구조 전환**
- [x] **`app/page.tsx` 서버 컴포넌트화** — 견적폼 프리필 상태를 `components/QuotePrefill.tsx`
  컨텍스트로 내렸다. 기존에는 페이지가 이 상태를 들고 있느라 전체가 `'use client'`였고,
  그래서 페이지별 `generateMetadata`를 붙일 수 없었다(멀티페이지 SEO의 걸림돌)
- [x] **서비스 상세 4페이지** — `/services/{factory,power,panel,interior}`.
  각 페이지가 키워드 클러스터를 하나씩 담당한다
- [x] **시공사례 목록·상세** — `/portfolio`, `/portfolio/[slug]` 8건. 지역+공종 롱테일 담당
- [x] **회사소개·FAQ 페이지** — `/about`, `/faq`
- [x] **`components/SubPageShell.tsx`** — 서브페이지 공통 골격. 견적폼을 모든 서비스·사례
  페이지 하단에 임베드한다(B2B 리드는 콘텐츠 소비 직후 전환율이 가장 높음)

**콘텐츠**
- [x] **서비스 페이지 본문 작성** (`content/service-pages.ts`) — 각 페이지에 시공 범위,
  진행 절차, 비용·기간 변수, 전용 FAQ 4건. 제도·법령 수치는 한전 전기공급약관·
  전기공사업법·전기안전관리법 공식 출처를 확인해 작성
- [x] **시공사례 상세 콘텐츠** (`content/portfolio.ts`) — 8건에 공사 개요·범위·시공 단계 추가.
  계약전력·공기 등 개별 현장 수치는 **추측하지 않고 '확인 중'으로 비워 뒀다**

**SEO**
- [x] **사이트맵 자동 생성** — 콘텐츠 파일에서 생성하므로 서비스·사례를 추가하면 자동 반영
- [x] **페이지별 메타데이터·canonical** — title·description·keywords 개별 지정
- [x] **BreadcrumbList 구조화 데이터** (`components/Breadcrumbs.tsx`) — 전 서브페이지
- [x] **Service 구조화 데이터** — 서비스 페이지별
- [x] **FAQPage 중복 정리** — 같은 FAQ가 여러 URL에 중복 노출되지 않도록 정본을 `/faq`로 지정.
  서비스 페이지는 각자 고유한 FAQ를 별도로 출력
- [x] **내부 링크 구성** — 홈 → 서비스, 서비스 ↔ 사례, 사례 → 서비스, 헤더 네비 실제 라우트화
- [x] **리드 유입 위치 추적** — 견적폼 `source`에 `service_factory`·`portfolio_{slug}` 등 기록

> ⚠️ **사장님 검수 필요**: 서비스 페이지 본문에 제도 관련 수치(계약전력 100kW 저압 기준,
> 일반용/자가용 전기설비 구분 75kW·100kW, 시설부담금 기본거리 공중 200m·지중 50m,
> 계약전력 감소 후 3년 내 재증설 시 면제 등)가 들어가 있다. 공식 출처로 확인했으나
> 제도는 개정될 수 있고 현장 실무와 다를 수 있으니 한 번 훑어봐 주시면 좋겠다.

### 전면 개편 Phase 1 — 톤 정리·전환 경로 재편 (2026-07-20 8차)

**디자인 톤 — "전문적으로 안 보이던" 원인 제거**
- [x] **강조색 단일화** — 옐로(`#FFB800`)·테라코타(`#C8581F`)를 안전 오렌지(`#FF5500`) 1종으로 통합.
  스크롤할 때마다 강조색이 바뀌어 브랜드가 통제돼 보이지 않던 문제 해소
- [x] **디자인 토큰 교정** — `--primary`가 주석(#0A3D91)과 달리 훨씬 밝고 채도 높은 값(색역 초과)이라
  shadcn 기본 컴포넌트와 하드코딩된 색이 미묘하게 어긋났음. 실측값 `oklch(0.386 0.148 260)`으로 수정
- [x] **다크 히어로 전환** — 유일한 현장 사진 위에 흰색 워시(좌측 alpha 0.97)를 덮어 사진이 사실상
  보이지 않고 "연회색 배경 + 파란 글씨"의 SaaS 랜딩이 돼 있던 것을, 어두운 현장 사진이 화면을
  지배하는 구조로 전환
- [x] **라운드 통일** — `rounded-3xl/2xl/xl` 혼용 → `rounded-lg` 단일 반경. 각진 형태가 산업 장비 조형과 맞음
- [x] **블루프린트 드리프트 애니메이션 제거** (미사용 dead CSS였음)
- [x] **오렌지 버튼 대비 개선** — 흰 글씨(대비 3.1:1, AA 미달) → 네이비 글씨(5.9:1). 접근성과
  안전 표지판 문법을 동시에 충족

**전환 경로 — 전화 1순위로 재편**
- [x] **히어로 CTA 순서 반전** — 전화(오렌지, 번호 노출)를 1차, 견적폼을 2차로.
  공사 사양이 복잡한 B2B일수록 폼보다 통화 전환율이 높다
- [x] **모바일 하단 고정 CTA 바 신설** — 우하단 원형 버튼(600px 스크롤 후 등장) → 전화·견적 2분할
  하단 바를 상시 노출. 탭 면적이 훨씬 넓고 시공업체 모바일 표준 패턴
- [x] **콜백 퀵폼 신설** (`CallbackForm.tsx`) — "번호만 남기면 저희가 겁니다". 본 견적폼은 입력 요소가
  9개라 B2B 기준 상한선이라, 작성 부담으로 이탈하는 층을 회수한다.
  기존 `/api/quote` 파이프라인을 타되 `source='callback'`으로 구분되며 `callback_request` 이벤트 발화
- [x] **컨텍스트 CTA 밴드** — 시공사례 하단에 "비슷한 공사를 계획 중이신가요?" 전화·견적 CTA 추가
- [x] **응답 SLA 구체화** — "1영업일 내" → "영업시간 내 접수는 당일, 그 외 다음 영업일 오전"

**신뢰·SEO**
- [x] **히어로에 등록번호 노출** — 형용사형 신뢰 스탯("전기공사업 면허")을 조회 가능한 번호
  (`대구-01425` · `637-81-02833`)로 교체
- [x] **FAQPage 구조화 데이터** (`components/FaqSchema.tsx`) — 기존 FAQ 14건을 그대로 활용,
  콘텐츠 추가 작성 없이 구글 리치 결과 후보 확보
- [x] **시공사례 갤러리 활성화** — 샘플 플레이스홀더 8장 생성해 레이아웃 확인 가능 상태로 전환.
  각 카드에 `샘플` 배지 + 상단 안내 배너가 붙어 실제 시공사진으로 오인될 수 없음
- [x] **대표 사진 자리** — 아이콘 placeholder → 샘플 이미지(`public/images/ceo-placeholder.png`)

> ⚠️ **샘플 이미지는 반드시 교체할 것.** `public/images/portfolio/*.png` 8장과
> `ceo-placeholder.png`는 레이아웃 확인용으로 생성한 도면풍 자리표시 이미지다.
> 실제 사진을 넣고 `content/portfolio.ts`의 `isPlaceholder` 플래그를 지우면
> 샘플 배지와 안내 배너가 자동으로 사라진다.

### 전면 개편 Phase 0 — 측정·공유·신뢰 결함 수정 (2026-07-20 7차)

**측정 (성과를 알 수 없던 문제)**
- [x] **GA4 측정 ID 결함 수정** — 코드 폴백이 `7XRHSS9V0F`로 `G-` 접두어가 빠져 있어 환경변수 미주입 빌드에서 조용히 실패하던 문제. 접두어 없이 입력돼도 자동 보정하도록 변경 (`components/GoogleAnalytics.tsx`)
- [x] **전화·카카오톡 클릭 추적 신설** — 기존에는 폼 제출(`generate_lead`)만 측정됐고 주 전환 경로인 전화는 측정 불가였음. `phone_click` / `kakao_click` 이벤트 추가 (`components/ClickTracking.tsx`). document 클릭 위임 방식이라 앞으로 추가되는 전화 링크도 자동 추적됨
- [x] **Vercel Analytics 코드 연동** — `@vercel/analytics` 설치 + `<Analytics />` 삽입 (기존엔 패키지 자체가 없었음)

**공유·SEO**
- [x] **OG 이미지 동적 생성** — `app/opengraph-image.tsx` 신설 (1200×630, Pretendard 주입으로 한글 렌더). 기존엔 OG 이미지가 아예 없어 카카오톡 공유 미리보기가 깨졌음. `twitter` 카드 메타도 추가
- [x] **SchemaOrg 보강** — 존재하지 않는 `/og-image.png` 참조 제거하고 실제 이미지 절대 URL로 교체. `geo`(위경도) · `taxID` · `foundingDate` · `hasCredential`(전기공사업 등록) · `hasOfferCatalog`(4대 서비스) · `logo` · `faxNumber` 추가. `sameAs`는 `lib/site.ts` 채널 URL에서 자동 생성

**신뢰 (전문성 인상을 깎던 요소)**
- [x] **카카오톡 더미 URL 제거** — 3곳 모두 `https://pf.kakao.com/`(카카오 홈으로 이동)이었음. 채널 개설 전까지 버튼이 자동으로 숨겨지고, Portfolio는 전화 CTA로 대체
- [x] **저작권 연도 동적화** — `© 2025` 고정 → 현재 연도 자동 반영
- [x] **면허번호 본문 노출** — Credentials 섹션에서 `null`로 미표시되던 전기공사업 등록번호 `대구-01425` 표기 (Footer에만 있던 불일치 해소)
- [x] **자격 조회 링크를 실제 조회 화면으로** — 협회·홈택스 메인 페이지 → 전기공사종합정보시스템(ECIC) · 홈택스 사업자등록상태조회 딥링크
- [x] **법인등록번호·팩스 표기 추가**, Contact에 **길찾기 링크** 추가
- [x] **`lib/site.ts` 신설** — 회사 정보·외부 채널 URL의 단일 소스. 채널 URL을 여기 한 곳만 채우면 전역 반영됨

> ⚠️ **로컬 빌드 주의**: Windows에서 `npm run build` 시 `/apple-icon` · `/opengraph-image`가
> `TypeError: Invalid URL`로 실패한다. `next/og`의 Windows 전용 버그로 **코드 문제가 아니며
> Vercel(Linux) 빌드는 정상**이다(프로덕션 `/apple-icon`이 200 PNG 응답). 로컬에서 OG 이미지를
> 확인하려면 배포 후 카카오 공유 디버거를 사용할 것.

### SEO · 분석 연동 (2026-06-15 6차)
- [x] **WNJ 로고 파비콘 적용** — `app/icon.svg` (금색 다이아몬드 + W/J + 빨간 번개볼트). `app/apple-icon.tsx` iOS 홈화면 아이콘 (Satori 호환 base64 방식).
- [x] **네이버 서치어드바이저 소유 확인** — `naver-site-verification` 메타태그 삽입 완료 (`f7b584dc796aff64d9a1fe441b6d9df228316a23`)
- [x] **사이트 설명 80자 이내 단축** — 107자 → 74자 (네이버 간단체크 경고 해소)
- [x] **robots.txt 보강** — `/api/` · `/_next/` 차단, 사이트맵 URL · host 도메인 명시
- [x] **Google Analytics 4 연동** — `components/GoogleAnalytics.tsx` 신설, `NEXT_PUBLIC_GA_ID` 미설정 시 무음 통과. 견적 폼 제출 성공 시 `generate_lead` 이벤트 발화. 측정 ID `G-7XRHSS9V0F` Vercel 환경변수 설정 완료.
- [x] **사이트 URL 전면 통일** — `og:url` · `metadataBase` · `sitemap` · `robots host` 모두 `https://www.wnjpower.com` 으로 수정 (기존 `wnj-electric.vercel.app` 제거)

### 이메일·알림 개선 (2026-06-15 5차)
- [x] **Resend 이메일 템플릿 시각화 개선** — navy 배너 헤더 + 오렌지 `견적요청` 뱃지 + 공사종류 하이라이트 블록 + 고객 연락처 클릭 전화 CTA 버튼 + KST 타임스탬프 · 회사 정보 푸터.
- [x] **카카오 알림톡 연동 코드 준비** — `lib/kakao-alimtalk.ts` (Solapi SDK) 신설. SOLAPI_* 환경변수 입력 시 자동 활성화 (미입력 시 이메일만 발송). 신청자·사장님 양방향 발송.
- [x] **견적폼 성공 화면 개선** — 카카오 알림톡 발송 안내 카드 추가 (실제 발송 시에만 표시). 빠른 전화 CTA 버튼 추가.

### 견적폼·헤더·Footer 개선 (2026-06-14~15)
- [x] **Footer 전기공사업 면허번호 추가** — `대구-01425` 표기
- [x] **헤더 메뉴 레이블 변경** — `공장전기` → `사업영역`
- [x] **로고 이미지 헤더 적용** — `public/images/logo.png` → `<Image>` 컴포넌트
- [x] **견적폼 연락처 필드 개편** — 업체명(선택) / 성함(필수) / 연락처(필수, 자동 하이픈) / 이메일(선택, 도메인 자동완성)
- [x] **공사 종류 6개로 단순화** — 공장 신축·수전설비·배전반·상업인테리어·주택인테리어·기타

### Supabase DB 구축 (2026-06-14 4차)
- [x] Supabase 프로젝트 생성 — 프로젝트 ID `ugxydqyjajozsnbzagbe` (도쿄 리전)
- [x] `quotes` 테이블 스키마 생성 + RLS 정책 설정 (익명 INSERT 허용, SELECT 차단)
- [x] E2E 검증 완료

### 공장·산업 전기공사 중심 전면 개편 (2026-06-14 3차)
- [x] 서비스 4종 재편, 고객군 2분할, 견적 폼 다단계 재편
- [x] 사진 배경 시스템, 디자인 전문성 격상
- [x] 🐛 견적 폼 치명적 버그 수정 (RHF forwardRef)

### 기반 구축 및 섹션 구현
- [x] Next.js 14 App Router + TypeScript + Tailwind CSS v4 + shadcn/ui
- [x] Supabase · Resend · GitHub → Vercel 자동 배포
- [x] 전 섹션 구현 + 동적 효과 + 접근성 처리

---

## 🔲 남은 작업

### 🔴 카카오 알림톡 활성화 (코드 완료 — 외부 설정만 남음)

> 코드는 준비 완료. 아래 4단계 후 Vercel 환경변수 입력 시 자동 활성화.

- [ ] **STEP 1 — 카카오 비즈니스 채널 개설** — [business.kakao.com](https://business.kakao.com) → 공개 채널 전환 + 비즈니스 인증 (1~2 영업일)
- [ ] **STEP 2 — Solapi 가입 및 API 키 발급** — [console.solapi.com](https://console.solapi.com) → API Key + 채널 연동(`SOLAPI_PF_ID`) + 발신번호 `010-8552-9994` 등록
- [ ] **STEP 3 — 알림톡 템플릿 등록 및 카카오 검수** (1~3 영업일) — `.env.example` 내 템플릿 내용 참고
- [ ] **STEP 4 — Vercel 환경변수 입력 후 재배포**
  ```
  SOLAPI_API_KEY / SOLAPI_API_SECRET / SOLAPI_PF_ID
  SOLAPI_SENDER_NUMBER=010-8552-9994
  SOLAPI_TEMPLATE_TO_REQUESTER / SOLAPI_TEMPLATE_TO_OWNER
  OWNER_MOBILE=010-8552-9994
  ```

### 🔴 필수 — 서비스 오픈 전 완료

> 🚨 **현재 견적문의가 유실되고 있다.** 계정 이관으로 Supabase·Resend가 모두 비활성이라
> 폼을 제출해도 DB 저장·메일 발송 없이 성공 응답만 반환된다(graceful degradation).
> 아래 3단계가 Phase 0에서 가장 시급하다.

- [ ] **① Supabase 신규 프로젝트 생성 + 스키마 적용**
  - 이관된 계정에서 새 프로젝트 생성(리전: 도쿄 권장)
  - SQL Editor에 [`supabase/schema.sql`](supabase/schema.sql)의 **1) · 2) 섹션 전체**를 붙여넣고 실행
    (`quotes` 테이블 + RLS. `company_name` · `email` · `customer_type` 컬럼이 이미 포함돼 있어 별도 마이그레이션 불필요)
  - Settings → API에서 URL · anon key · service_role key 확보
- [ ] **② Resend 신규 계정 설정** — API Key 발급 + `wnjpower.com` 도메인 인증(DNS 레코드 추가).
  도메인 인증 전에는 발신 주소를 `onboarding@resend.dev`로 두면 테스트 발송 가능
- [ ] **③ Vercel 환경변수 입력 후 재배포** (Production · Preview · Development 모두)
  ```
  NEXT_PUBLIC_SUPABASE_URL       = (신규 프로젝트 URL)          ← 이관으로 기존값 무효
  NEXT_PUBLIC_SUPABASE_ANON_KEY  = (신규 anon key)              ← 이관으로 기존값 무효
  SUPABASE_SERVICE_ROLE_KEY      = (신규 service_role key)
  RESEND_API_KEY                 = (Resend 대시보드에서 발급)
  NOTIFY_TO_EMAIL                = wnj-2023@naver.com
  NOTIFY_FROM_EMAIL              = quote@wnjpower.com
  NEXT_PUBLIC_SITE_URL           = https://www.wnjpower.com
  NEXT_PUBLIC_GA_ID              = G-7XRHSS9V0F
  ```
- [ ] **견적 폼 실제 제출 테스트** — 환경변수 설정 후 폼 제출 → DB 저장 + 이메일 수신 확인
- [ ] **정규 도메인 확정** — Vercel에 `www.wnjpower.com` · `wnjpower.com` 둘 다 연결돼 있음.
  코드는 www 기준으로 통일했으므로, Vercel에서 non-www → www 리다이렉트가 걸려 있는지 확인할 것

### 🟡 콘텐츠 — 사장님 제공 필요

- [ ] **🔴 시공 현장 사진** 6~9장 → `public/images/portfolio/` 의 샘플 파일을 실사진으로 교체 후
  `content/portfolio.ts`의 `isPlaceholder` 플래그 삭제 (교체 즉시 샘플 배지·안내 배너가 사라짐)
  - 촬영 우선순위: **배전반 제작 3단계(외함→결선→완성품)** ← "자체 제작" 주장의 유일한 증거 /
    배전반 앞 작업 장면(안전장구 착용) / 수전설비 / **노후 분전반 교체 전·후 같은 앵글** /
    공장 내부 전경. 상세 가이드는 개편 보고서 §7.2 참조
- [ ] **대표 사진** → `public/images/ceo-placeholder.png` 를 실사진으로 교체
  (`components/sections/About.tsx`의 `샘플` 배지도 함께 제거)
- [ ] **히어로 수치 확정** — 누적 시공 건수 · 배전반 제작 면수를 받으면
  `components/sections/Hero.tsx`의 `trustStats` 2·3번을 수치로 교체 (TODO 주석 표시됨)
- [ ] **카카오톡 채널 URL** → [`lib/site.ts`](lib/site.ts)의 `KAKAO_CHANNEL_URL` **한 곳만** 입력하면
  FloatingCta · Contact · Portfolio에 자동 반영됨 (현재는 null이라 버튼이 숨겨진 상태)
- [ ] **네이버 플레이스 · 블로그 URL** → [`lib/site.ts`](lib/site.ts)의 `NAVER_PLACE_URL` · `NAVER_BLOG_URL`.
  입력 시 SchemaOrg `sameAs`에 자동 반영되어 채널 간 신뢰 신호가 연결됨
- [ ] **FAQ 내용 검수** → `content/faq.ts` 업데이트
- [ ] **영업시간 확인** → `components/Header.tsx` · `Contact.tsx` 수정
- [ ] **About 수치 확인** → `components/sections/About.tsx` 실제 수치로 수정

### 🟢 SEO / 분석

- [x] **GA4 연동** — `G-7XRHSS9V0F` 환경변수 설정 완료
- [x] **네이버 서치어드바이저 소유 확인 메타태그** — 삽입 완료
- [ ] **네이버 서치어드바이저 사이트맵 제출** — [searchadvisor.naver.com](https://searchadvisor.naver.com) → 요청 → 사이트맵 제출 → `https://www.wnjpower.com/sitemap.xml`
- [ ] **Google Search Console 등록** — 소유 확인 후 `/sitemap.xml` 제출
- [ ] **🔴 네이버 스마트플레이스 등록·최적화** — 개편 보고서가 꼽은 **네이버 유입의 최우선 항목**.
  로컬 검색("대구 전기공사")에서 광고 다음 최상단이 플레이스 영역인데 현재 미등록 상태.
  기존 미클레임 플레이스가 있는지 먼저 확인 → 없으면 신규 등록(등록 후 90일 '신규' 부스팅 기간 활용)
- [ ] **네이버 플레이스 NAP 일치** — 사이트 이름·주소·전화번호 = 네이버 플레이스 동일 확인
- [x] **OG 이미지 구현** — `app/opengraph-image.tsx` (한글 렌더 확인 완료)
- [ ] **OG·카카오 공유 미리보기 확인** — 배포 후 [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서
  캐시 초기화 + 미리보기 정상 여부 확인
- [x] **Vercel Analytics 코드 연동** — `@vercel/analytics` 설치 + `<Analytics />` 삽입
- [ ] **Vercel Analytics 활성화** — Vercel 대시보드 → Analytics 탭 Enable (코드는 완료, 대시보드 토글만 남음)
- [ ] **GA4 이벤트 수신 확인** — 배포 후 GA4 실시간 보고서에서 `phone_click` · `generate_lead` 발생 확인

### ⚪ 추후 개선 (선택)

- [ ] **Cloudflare Turnstile 적용** — 견적 폼 봇 차단 강화
- [ ] **카카오맵 실제 임베드** — 카카오맵 JavaScript API 지도 직접 삽입
- [ ] **Lighthouse 최적화** — 모바일 90점 이상 목표
- [ ] **포트폴리오 CMS화** — Supabase Storage + 관리자 페이지

---

## 📁 주요 파일 위치 참조

| 목적 | 경로 |
|------|------|
| **회사 정보·외부 채널 URL (단일 소스)** | [`lib/site.ts`](lib/site.ts) |
| 개편 기획 보고서 | [`docs/웹사이트_전면개편_기획보고서.md`](docs/웹사이트_전면개편_기획보고서.md) |
| 환경변수 템플릿 | [`.env.example`](.env.example) |
| DB 스키마 | [`supabase/schema.sql`](supabase/schema.sql) |
| 견적 API | [`app/api/quote/route.ts`](app/api/quote/route.ts) |
| GA4 컴포넌트 | [`components/GoogleAnalytics.tsx`](components/GoogleAnalytics.tsx) |
| 전화·카톡 클릭 추적 | [`components/ClickTracking.tsx`](components/ClickTracking.tsx) |
| OG 이미지 | [`app/opengraph-image.tsx`](app/opengraph-image.tsx) |
| FAQ 구조화 데이터 | [`components/FaqSchema.tsx`](components/FaqSchema.tsx) |
| 콜백 퀵폼 | [`components/sections/CallbackForm.tsx`](components/sections/CallbackForm.tsx) |
| 색·라운드·오버레이 토큰 | [`app/globals.css`](app/globals.css) |
| **서비스 페이지 본문** | [`content/service-pages.ts`](content/service-pages.ts) |
| **시공사례 본문·수치** | [`content/portfolio.ts`](content/portfolio.ts) |
| 서브페이지 공통 골격 | [`components/SubPageShell.tsx`](components/SubPageShell.tsx) · [`components/PageHero.tsx`](components/PageHero.tsx) |
| 견적폼 프리필 컨텍스트 | [`components/QuotePrefill.tsx`](components/QuotePrefill.tsx) |
| 사이트맵(자동 생성) | [`app/sitemap.ts`](app/sitemap.ts) |
| 카카오 알림톡 | [`lib/kakao-alimtalk.ts`](lib/kakao-alimtalk.ts) |
| Zod 검증 스키마 | [`lib/validators.ts`](lib/validators.ts) |
| 서비스 콘텐츠 | [`content/services.ts`](content/services.ts) |
| FAQ 콘텐츠 | [`content/faq.ts`](content/faq.ts) |
| 시공사례 콘텐츠 | [`content/portfolio.ts`](content/portfolio.ts) |
| 카카오톡 URL 교체 | [`lib/site.ts`](lib/site.ts) (한 곳에서 전역 반영) |
| 영업시간 수정 | [`components/Header.tsx`](components/Header.tsx) · [`components/sections/Contact.tsx`](components/sections/Contact.tsx) — ⚠️ 현재 Header는 `토 09:00–13:00` 포함, Contact·SchemaOrg는 평일만으로 **불일치**. 사장님 확인 후 통일 필요 |
| About 수치 수정 | [`components/sections/About.tsx`](components/sections/About.tsx) |
| 개인정보처리방침 | [`app/privacy/page.tsx`](app/privacy/page.tsx) |
