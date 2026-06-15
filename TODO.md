# 우앤주전력 웹사이트 작업 현황

> **프로덕션 URL**: https://www.wnjpower.com  
> **GitHub**: https://github.com/sinequanon2002/wnjpower  
> **최종 업데이트**: 2026-06-15 (6차 — 파비콘 · 네이버 서치어드바이저 · GA4 연동)

---

## ✅ 완료된 작업

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

- [ ] **Resend·Supabase 환경변수 Vercel 입력** (Supabase URL·anon key는 확보됨, Resend API key 미입력)
  ```
  NEXT_PUBLIC_SUPABASE_URL       = https://ugxydqyjajozsnbzagbe.supabase.co  ✅
  NEXT_PUBLIC_SUPABASE_ANON_KEY  = sb_publishable_tS4v-YA5g_...              ✅
  SUPABASE_SERVICE_ROLE_KEY      = (Supabase Settings → API → service_role)
  RESEND_API_KEY                 = (Resend 대시보드에서 발급)
  NOTIFY_TO_EMAIL                = wnj-2023@naver.com
  NOTIFY_FROM_EMAIL              = quote@wnjpower.com
  NEXT_PUBLIC_SITE_URL           = https://www.wnjpower.com                  ✅
  NEXT_PUBLIC_GA_ID              = G-7XRHSS9V0F                              ✅
  ```
- [ ] **견적 폼 실제 제출 테스트** — 환경변수 설정 후 폼 제출 → DB 저장 + 이메일 수신 확인

### 🟡 콘텐츠 — 사장님 제공 필요

- [ ] **시공 현장 사진** 6~9장 → `public/images/portfolio/` 저장 후 `content/portfolio.ts` 업데이트
- [ ] **대표 사진** → `components/sections/About.tsx` placeholder 교체
- [ ] **카카오톡 채널 URL** → `FloatingCta.tsx` · `Contact.tsx` · `Portfolio.tsx` 교체
- [ ] **FAQ 내용 검수** → `content/faq.ts` 업데이트
- [ ] **영업시간 확인** → `components/Header.tsx` · `Contact.tsx` 수정
- [ ] **About 수치 확인** → `components/sections/About.tsx` 실제 수치로 수정

### 🟢 SEO / 분석

- [x] **GA4 연동** — `G-7XRHSS9V0F` 환경변수 설정 완료
- [x] **네이버 서치어드바이저 소유 확인 메타태그** — 삽입 완료
- [ ] **네이버 서치어드바이저 사이트맵 제출** — [searchadvisor.naver.com](https://searchadvisor.naver.com) → 요청 → 사이트맵 제출 → `https://www.wnjpower.com/sitemap.xml`
- [ ] **Google Search Console 등록** — 소유 확인 후 `/sitemap.xml` 제출
- [ ] **네이버 플레이스 NAP 일치** — 사이트 이름·주소·전화번호 = 네이버 플레이스 동일 확인
- [ ] **OG 이미지·카카오 공유 확인** — 카카오톡 링크 공유 시 미리보기 정상 여부
- [ ] **Vercel Analytics 활성화** — Vercel 대시보드 → Analytics 탭 Enable

### ⚪ 추후 개선 (선택)

- [ ] **Cloudflare Turnstile 적용** — 견적 폼 봇 차단 강화
- [ ] **카카오맵 실제 임베드** — 카카오맵 JavaScript API 지도 직접 삽입
- [ ] **Lighthouse 최적화** — 모바일 90점 이상 목표
- [ ] **포트폴리오 CMS화** — Supabase Storage + 관리자 페이지

---

## 📁 주요 파일 위치 참조

| 목적 | 경로 |
|------|------|
| 환경변수 템플릿 | [`.env.example`](.env.example) |
| DB 스키마 | [`supabase/schema.sql`](supabase/schema.sql) |
| 견적 API | [`app/api/quote/route.ts`](app/api/quote/route.ts) |
| GA4 컴포넌트 | [`components/GoogleAnalytics.tsx`](components/GoogleAnalytics.tsx) |
| 카카오 알림톡 | [`lib/kakao-alimtalk.ts`](lib/kakao-alimtalk.ts) |
| Zod 검증 스키마 | [`lib/validators.ts`](lib/validators.ts) |
| 서비스 콘텐츠 | [`content/services.ts`](content/services.ts) |
| FAQ 콘텐츠 | [`content/faq.ts`](content/faq.ts) |
| 시공사례 콘텐츠 | [`content/portfolio.ts`](content/portfolio.ts) |
| 카카오톡 URL 교체 | [`components/FloatingCta.tsx`](components/FloatingCta.tsx) · [`components/sections/Contact.tsx`](components/sections/Contact.tsx) |
| 영업시간 수정 | [`components/Header.tsx`](components/Header.tsx) |
| About 수치 수정 | [`components/sections/About.tsx`](components/sections/About.tsx) |
| 개인정보처리방침 | [`app/privacy/page.tsx`](app/privacy/page.tsx) |
