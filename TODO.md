# 우앤주전력 웹사이트 작업 현황

> **프로덕션 URL**: https://wnjpower.com  
> **GitHub**: https://github.com/sinequanon2002/wnjpower  
> **최종 업데이트**: 2026-06-15 (5차 — 이메일 템플릿 개선 · 알림톡 연동 준비)

---

## ✅ 완료된 작업

### 이메일·알림 개선 (2026-06-15 5차)
- [x] **Resend 이메일 템플릿 시각화 개선** — navy 배너 헤더 + 오렌지 `견적요청` 뱃지 + 공사종류 하이라이트 블록 + 고객 연락처 클릭 전화 CTA 버튼 + KST 타임스탬프 · 회사 정보 푸터. 수신 즉시 한눈에 견적 요청임을 인지 가능.
- [x] **카카오 알림톡 연동 코드 준비** — `lib/kakao-alimtalk.ts` (Solapi SDK) 신설. SOLAPI_* 환경변수 입력 시 자동 활성화 (미입력 시 기존 이메일만 발송, 무음 통과). 신청자·사장님 양방향 발송.
- [x] **견적폼 성공 화면 개선** — 카카오 알림톡 발송 안내 카드 추가 (실제 발송 시에만 표시, 입력 번호 표시 + SMS 대체 안내). 빠른 전화 CTA 버튼 추가.

### 견적폼·헤더·Footer 개선 (2026-06-14~15 사이)
- [x] **Footer 전기공사업 면허번호 추가** — `대구-01425` 표기
- [x] **헤더 메뉴 레이블 변경** — `공장전기` → `사업영역` (서비스 범위를 공장으로만 국한하는 인상 제거)
- [x] **로고 이미지 헤더 적용** — `content/logo_woonjoo.png` → `public/images/logo.png` 복사 후 `<Image>` 컴포넌트로 적용
- [x] **견적폼 연락처 필드 개편** — 업체명(선택) / 성함(필수) / 연락처(필수, 자동 하이픈) / 이메일(선택, 도메인 자동완성)
- [x] **연락처 자동 하이픈 포맷** — 숫자만 입력해도 `010-XXXX-XXXX` 형식으로 자동 변환
- [x] **이메일 도메인 자동완성** — `@` 뒤 첫 글자 입력 시 naver.com · gmail.com · kakao.com 등 드롭다운 제안
- [x] **공사 종류 6개로 단순화** — 공장 신축·수전설비·배전반·상업인테리어·주택인테리어·기타 (고객유형별 동적 필터링 유지)
- [x] **접수 완료 빠른 상담 전화번호** — `010-8552-9994` 로 교체

### Supabase DB 구축 완료 (2026-06-14 4차)
- [x] **Supabase 신규 프로젝트 생성** — 조직 `wnjpower`, 프로젝트 ID `ugxydqyjajozsnbzagbe` (도쿄 리전)
- [x] **`quotes` 테이블 전체 스키마 생성** — `company_name`·`email`·`customer_type` 컬럼 포함, `category` CHECK 제약 없음(Zod 검증으로 대체)
- [x] **RLS 정책 설정** — 익명 INSERT 허용 + SELECT 차단 (개인정보 보호)
- [x] **E2E 검증 완료** — `category='factory_new'`, `customer_type='industrial'` INSERT 성공(HTTP 201) + SELECT 차단 확인

### 공장·산업 전기공사 중심 전면 개편 (2026-06-14 3차)
- [x] 사이트 전체 포지셔닝 전환 — 공장 신축·증축·증설 전기공사를 최우선 주력으로, 인테리어 전기는 부수 서비스
- [x] 서비스 4종 재편 — ①공장·산업 전기공사 ②수전설비·계약전력 증설 ③배전반·분전반 자체제작 ④인테리어·일반 전기
- [x] 고객군 2분할 — 공장·산업(메인, 사진배경 대형 카드) + 인테리어·일반(서브)
- [x] 견적 폼 다단계 재편 — 고객유형 → 공사종류 → 연락처 3단계, validators/QuoteForm/API/DB 다층 일관성
- [x] 사진 배경 시스템 — `public/images/`에 스톡사진 + `.bg-photo` 오버레이 유틸. Hero·공장 메인카드·견적폼 적용
- [x] 디자인 전문성 격상 — 산업 아이콘(Factory/Gauge/CircuitBoard), eyebrow 라벨, 공장 중심 카피
- [x] 🐛 견적 폼 치명적 버그 수정 — Input/Textarea `forwardRef` 미사용으로 RHF 값 미수집 버그 수정

### 기반 구축 및 섹션 구현
- [x] Next.js 14 App Router + TypeScript + Tailwind CSS v4 + shadcn/ui 세팅
- [x] Supabase 연동 · Resend 이메일 알림 연동 · GitHub → Vercel 자동 배포
- [x] 전 섹션 구현: Header · Hero · TrustBar · CustomerSegments · Services · About · Credentials · WhyUs · Process · Pricing · Portfolio · FAQ · QuoteForm · Contact · Footer · FloatingCta
- [x] ScrollReveal · CountUp · Hero 진입 모션 · 블루프린트 배경 · FloatingCta 맥박 등 동적 효과
- [x] `prefers-reduced-motion` 가드 · `<noscript>` 폴백

---

## 🔲 남은 작업

### 🔴 카카오 알림톡 활성화 (코드 완료 — 외부 설정만 남음)

> 코드는 이미 준비되어 있음. 아래 4단계 완료 후 환경변수만 입력하면 자동 활성화.

- [ ] **STEP 1 — 카카오 비즈니스 채널 개설** (무료)
  - [business.kakao.com](https://business.kakao.com) → 채널명 `우앤주전력` 생성
  - 채널 유형 **공개 채널**로 전환 (알림톡 발송 필수 조건)
  - **비즈니스 인증** 완료 (사업자등록증 첨부 → 1~2 영업일 처리)

- [ ] **STEP 2 — Solapi 가입 및 API 키 발급** (알림톡 1건 약 8원)
  - [console.solapi.com](https://console.solapi.com) 회원가입
  - [API Key 관리] → API Key + Secret 발급
  - [카카오채널 연동] → 우앤주전력 채널 연동 → `SOLAPI_PF_ID` (`KA01PF...`) 확인
  - [발신번호 관리] → `010-8552-9994` 등록 (본인인증 문자 수신)

- [ ] **STEP 3 — 알림톡 템플릿 등록 및 카카오 검수** (1~3 영업일)
  - Solapi 대시보드 [알림톡 템플릿] → 아래 두 개 등록 후 검수 신청
  - 검수 완료 후 템플릿 ID (`KA01TP...`) 두 개 발급됨

  **① 신청자 수신용 템플릿 내용:**
  ```
  [우앤주전력] 견적문의 접수 완료

  안녕하세요, #{성함}님.
  우앤주전력에 견적문의가 정상 접수되었습니다.

  ■ 접수 내용
  - 공사 종류: #{공사종류}
  - 접수 일시: #{접수일시}

  1영업일 이내에 담당자가 직접 연락드리겠습니다.

  빠른 연락: 010-8552-9994
  wnjpower.com
  ```

  **② 사장님 수신용 템플릿 내용:**
  ```
  [우앤주전력] 새 견적문의 접수

  고객 문의가 접수되었습니다.

  ■ 고객 정보
  - 업체명: #{업체명}
  - 성함: #{성함}
  - 연락처: #{연락처}
  - 공사 종류: #{공사종류}
  - 지역: #{지역}
  - 접수 일시: #{접수일시}

  고객에게 빠른 연락 부탁드립니다!
  ```

- [ ] **STEP 4 — Vercel 환경변수 입력 후 재배포** (알림톡 즉시 활성화)
  ```
  SOLAPI_API_KEY                  = (Solapi API Key)
  SOLAPI_API_SECRET               = (Solapi API Secret)
  SOLAPI_PF_ID                    = KA01PF...  (채널 연동 후 발급)
  SOLAPI_SENDER_NUMBER            = 010-8552-9994
  SOLAPI_TEMPLATE_TO_REQUESTER    = KA01TP...  (신청자용 템플릿 ID)
  SOLAPI_TEMPLATE_TO_OWNER        = KA01TP...  (사장님용 템플릿 ID)
  OWNER_MOBILE                    = 010-8552-9994
  ```
  > Vercel 대시보드 → Settings → Environment Variables → Production에 입력 → Redeploy

### 🔴 필수 — 서비스 오픈 전 완료

- [ ] **Resend·Supabase 환경변수 설정** — Vercel 대시보드 → Settings → Environment Variables
  ```
  NEXT_PUBLIC_SUPABASE_URL       = https://ugxydqyjajozsnbzagbe.supabase.co  ✅ 확보됨
  NEXT_PUBLIC_SUPABASE_ANON_KEY  = sb_publishable_tS4v-YA5g_nyMa4Wq2HBLQ_vi6KPxFo  ✅ 확보됨
  SUPABASE_SERVICE_ROLE_KEY      = (Supabase Settings → API → service_role — 절대 외부 노출 금지)
  RESEND_API_KEY                 = (Resend 대시보드에서 발급)
  NOTIFY_TO_EMAIL                = wnj-2023@naver.com
  NOTIFY_FROM_EMAIL              = quote@wnjpower.com  (Resend 도메인 인증 후 사용)
  NEXT_PUBLIC_SITE_URL           = https://wnjpower.com
  ```
- [ ] **견적 폼 실제 제출 테스트** — 환경변수 설정 후 폼 제출 → DB 저장 + 이메일 수신 확인

### 🟡 콘텐츠 — 사장님 제공 필요

- [ ] **시공 현장 사진** 6~9장 — 전기공사·배전반·인테리어 골고루
  - `public/images/portfolio/` 저장 후 `content/portfolio.ts` 경로 업데이트
- [ ] **대표 사진** — `components/sections/About.tsx` placeholder 아이콘 대체
- [ ] **카카오톡 채널 URL** — `https://pf.kakao.com/` 실제 채널 주소로 교체
  - 교체 파일: [`components/FloatingCta.tsx`](components/FloatingCta.tsx) · [`components/sections/Contact.tsx`](components/sections/Contact.tsx) · [`components/sections/Portfolio.tsx`](components/sections/Portfolio.tsx)
- [ ] **FAQ 내용 검수** — 사장님 답변 확인 후 [`content/faq.ts`](content/faq.ts) 업데이트
- [ ] **영업시간 확인** — Header 상단 띠 및 Contact 섹션의 실제 영업시간으로 수정
- [ ] **About 수치 확인** — "월 평균 6개 현장" 등 실제 수치와 다르면 [`components/sections/About.tsx`](components/sections/About.tsx) 수정
- [ ] **시공 가능 지역 범위** — FAQ·서비스 소개에 정확한 지역 명시

### 🟢 SEO / 분석

- [ ] **Google Search Console 등록** — 배포 후 `/sitemap.xml` 제출
- [ ] **네이버 서치어드바이저 등록** — 사이트 소유 확인 후 사이트맵 제출
- [ ] **네이버 플레이스 NAP 일치** — 사이트의 이름·주소·전화번호가 네이버 플레이스와 동일한지 확인
- [ ] **OG 이미지·카카오 공유 확인** — 카카오톡 링크 공유 시 미리보기 정상 표시 여부
- [ ] **GA4 연동** — `.env`에 `NEXT_PUBLIC_GA_ID` 추가 후 `app/layout.tsx` 스크립트 삽입
- [ ] **Vercel Analytics 활성화** — Vercel 대시보드 → Analytics 탭 Enable

### ⚪ 추후 개선 (선택)

- [ ] **Cloudflare Turnstile 적용** — 견적 폼 봇 차단 강화 (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`)
- [ ] **카카오맵 실제 임베드** — 현재 링크 방식 → 카카오맵 JavaScript API 지도 직접 삽입
- [ ] **Lighthouse 최적화** — 모바일 Performance·Accessibility·SEO 각 90점 이상 목표
- [ ] **포트폴리오 CMS화** — Supabase Storage + 간단한 관리자 페이지

---

## 📁 주요 파일 위치 참조

| 목적 | 경로 |
|------|------|
| 환경변수 템플릿 | [`.env.example`](.env.example) |
| DB 스키마 | [`supabase/schema.sql`](supabase/schema.sql) |
| 견적 API | [`app/api/quote/route.ts`](app/api/quote/route.ts) |
| 카카오 알림톡 | [`lib/kakao-alimtalk.ts`](lib/kakao-alimtalk.ts) |
| Zod 검증 스키마 | [`lib/validators.ts`](lib/validators.ts) |
| 서비스 콘텐츠 | [`content/services.ts`](content/services.ts) |
| FAQ 콘텐츠 | [`content/faq.ts`](content/faq.ts) |
| 시공사례 콘텐츠 | [`content/portfolio.ts`](content/portfolio.ts) |
| 카카오톡 URL 교체 | [`components/FloatingCta.tsx`](components/FloatingCta.tsx) · [`components/sections/Contact.tsx`](components/sections/Contact.tsx) |
| 영업시간 수정 | [`components/Header.tsx`](components/Header.tsx) |
| About 수치 수정 | [`components/sections/About.tsx`](components/sections/About.tsx) |
| 개인정보처리방침 | [`app/privacy/page.tsx`](app/privacy/page.tsx) |
