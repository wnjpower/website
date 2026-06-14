# 우앤주전력 웹사이트 작업 현황

> **프로덕션 URL**: https://wnj-website.vercel.app  
> **GitHub**: https://github.com/sinequanon2002/wnjpower  
> **최종 업데이트**: 2026-06-14

---

## ✅ 완료된 작업

### 기반 구축
- [x] Next.js 14 App Router + TypeScript + Tailwind CSS v4 + shadcn/ui 프로젝트 세팅
- [x] Supabase 견적문의 저장 연동 (`quotes` 테이블 + RLS 정책) — `supabase/schema.sql`
- [x] Resend 이메일 알림 연동 (폼 제출 시 사장님께 발송) — `app/api/quote/route.ts`
- [x] GitHub 레포지토리 생성 (`wnjpower`) 및 Vercel 자동 배포 연동
- [x] `git push` → Vercel 자동 빌드·배포 파이프라인 완성
- [x] `.npmrc` `legacy-peer-deps` 설정 (eslint 피어 의존성 충돌 해결)
- [x] `lib/supabase.ts` 빌드 타임 오류 방지 (env 미설정 시 placeholder fallback)

### 섹션 구현
- [x] **Header** — 상단 정보 띠 + 메인 헤더, 스크롤 시 정보 띠 자동 수납, 모바일 햄버거 메뉴
- [x] **Hero** — 헤드라인, 서브카피, CTA 버튼 2개, 고객유형 퀵네비 카드 3개, 신뢰 스탯 4개
- [x] **TrustBar** — 사업자·면허·설립·지역 4항목
- [x] **CustomerSegments** — 주택·상가·상업건물 3개 고객군 카드 (페인포인트 + 솔루션 + CTA)
- [x] **Services** — 전기공사·분전함 자체제작·인테리어전기 3대 서비스 카드 + 서비스별 상세 체크리스트 4항목
- [x] **About** — 대표 인사말 + 회사 소개 + 업력 20년+·월평균 6현장·1년보증 수치 카운트업 행
- [x] **Credentials** — 전기공사업 면허·사업자등록·법인등록 (다크 앵커 섹션)
- [x] **WhyUs** — 원스톱 시공·분전함 자체제작·신속 A/S 3가지 차별점
- [x] **Process** — STEP 01~04 진행 프로세스 (문의→실사→시공→A/S)
- [x] **Pricing** — 견적서 양식 스타일 표준 작업 항목표 (모바일 가로 스크롤)
- [x] **Portfolio** — 시공 사례 갤러리 (사진 없을 시 텍스트 리스트 fallback)
- [x] **FAQ** — 16개 FAQ, 고객군별 탭 필터 (전체/주택/상가/상업건물)
- [x] **QuoteForm** — 고객유형 선택 + 이름·연락처·지역·문의유형·상세내용·개인정보동의, honeypot 스팸 방지
- [x] **Contact** — 연락처 목록·영업시간·카카오맵 링크
- [x] **Footer** — 사업자정보·서비스 링크·개인정보처리방침
- [x] **FloatingCta** — 우측 하단 고정 전화·카카오톡 버튼

### 디자인·UX 개선
- [x] 딥 네이비 `#0A3D91` Engineering Trust 디자인 시스템 (Primary 컬러 전체 교체)
- [x] Blueprint 도면 격자 배경 패턴 (Hero, QuoteSection)
- [x] 카드 섹션 hover 효과 전체 적용 (`-translate-y-1.5` + `shadow-xl` + 테두리 하이라이트)
- [x] Services 카드 — hover 시 아이콘 배경 navy 전환
- [x] 한국어 자연스러운 줄바꿈 (`word-break: keep-all` 전역 적용)
- [x] 모바일 반응형 개선 (Hero h1 `text-3xl`, 강제 `<br>` 제거, 섹션 설명 텍스트 축소)
- [x] 헤더 폰트 전체 확대 (로고 `text-xl`, 네비 `text-[1.0625rem]`, 전화 버튼 `text-[1.0625rem]`)

### 동적 효과 (2026-06-14)
- [x] **ScrollReveal** — IntersectionObserver 기반 스크롤 등장 애니메이션, 전 섹션 적용 (`data-reveal`)
- [x] **CountUp** — 화면 진입 시 0→목표값 카운트업 컴포넌트 (About 섹션 수치 행에 적용)
- [x] **Hero 진입 모션** — 헤드라인→서브→CTA→카드→스탯 단계적 페이드업 (0.05s 간격 stagger)
- [x] **블루프린트 배경 흐름** — 40초 주기 은은한 격자 드리프트 애니메이션
- [x] **FloatingCta 강화** — Hero 통과(600px) 후 부드럽게 등장, 전화 버튼 맥박(pulse) 모션
- [x] **QuoteForm 인터랙션** — 제출 성공 시 체크 팝+드로우 애니메이션, 입력 포커스 라벨 강조, 버튼 리프트
- [x] `prefers-reduced-motion` 가드 — 멀미 민감 사용자 모션 비활성화
- [x] `<noscript>` 폴백 — JS 비활성 환경에서 `[data-reveal]` 콘텐츠 즉시 노출

### 콘텐츠 정제
- [x] 영업력 수치 부각 — Hero 신뢰 스탯 "전기공사 업력 20년 이상" 업데이트
- [x] Credentials 법인카드 — "대표 업력 20년 이상의 베테랑이 2023년 법인으로 출범" 문구
- [x] About 수치 행 — 업력 20년+, 월 평균 6개 현장, 1년 보증
- [x] **태양광 관련 내용 전면 제거** — 서비스·FAQ·포트폴리오·Pricing·CustomerSegments·Footer·메타데이터 전 영역
- [x] **분전함 자체제작 차별점으로 격상** — Services 카드·WhyUs·FAQ·Pricing에 상세 내용 추가
- [x] 서비스 체계 재편: 전기공사·분전함 자체제작·인테리어전기 3대 서비스
- [x] 견적 폼 카테고리: `solar` 제거, `panel`(분전함 자체제작) 추가
- [x] SEO 메타데이터 키워드: 태양광 → 분전함·분전반 제작으로 교체

---

## 🔲 남은 작업

### 🔴 필수 — 서비스 오픈 전 완료

- [ ] **환경변수 설정** — Vercel 대시보드 → Settings → Environment Variables
  ```
  NEXT_PUBLIC_SUPABASE_URL       = (Supabase 프로젝트 URL)
  NEXT_PUBLIC_SUPABASE_ANON_KEY  = (Supabase anon key)
  SUPABASE_SERVICE_ROLE_KEY      = (Supabase service role key — 절대 외부 노출 금지)
  RESEND_API_KEY                 = (Resend API key)
  NOTIFY_TO_EMAIL                = wnj-2023@naver.com
  NOTIFY_FROM_EMAIL              = (발신 이메일)
  NEXT_PUBLIC_SITE_URL           = (커스텀 도메인 연결 후 실제 도메인 주소)
  ```
- [ ] **Supabase 테이블 생성** — `supabase/schema.sql` 을 Supabase SQL 에디터에서 실행
- [ ] **견적 폼 실제 제출 테스트** — 환경변수 설정 후 폼 제출 → DB 저장 + 이메일 수신 확인
- [ ] **커스텀 도메인 연결** — Vercel 대시보드 → Domains → 도메인 입력 → DNS 설정 후 `NEXT_PUBLIC_SITE_URL` 업데이트

### 🟡 콘텐츠 — 사장님 제공 필요

- [ ] **시공 현장 사진** 6~9장 — 전기공사·분전함·인테리어 골고루
  - `public/images/portfolio/` 에 저장 후 `content/portfolio.ts` 경로 업데이트
- [ ] **대표 사진** — `components/sections/About.tsx` placeholder HardHat 아이콘 대체
- [ ] **카카오톡 채널 URL** — `https://pf.kakao.com/` 를 실제 채널 주소로 교체
  - 파일: `components/FloatingCta.tsx`, `components/sections/Contact.tsx`, `components/sections/Portfolio.tsx`
- [ ] **FAQ 내용 검수** — 사장님이 실제 답변 확인 후 `content/faq.ts` 업데이트
- [ ] **영업시간 확인** — Header 상단 띠 및 Contact 섹션의 영업시간 정확한 내용으로 수정
- [ ] **About 수치 확인** — "월 평균 6개 현장" 실제 수치와 다르면 `components/sections/About.tsx` 수정
- [ ] **시공 가능 지역 범위** — FAQ·서비스 소개에 정확한 지역 명시

### 🟢 SEO / 분석

- [ ] **Google Search Console 등록** — 배포 후 사이트맵(`/sitemap.xml`) 제출
- [ ] **네이버 서치어드바이저 등록** — 사이트 소유 확인 후 사이트맵 제출
- [ ] **GA4 연동** — `.env`에 `NEXT_PUBLIC_GA_ID` 추가 후 `app/layout.tsx` 스크립트 삽입
- [ ] **Vercel Analytics 활성화** — Vercel 대시보드 → Analytics 탭 Enable
- [ ] **OG 이미지·카카오 공유 확인** — 카카오톡 링크 공유 시 미리보기 정상 표시 여부
- [ ] **네이버 플레이스 NAP 일치** — 사이트의 이름·주소·전화번호가 네이버 플레이스와 동일한지 확인

### ⚪ 추후 개선 (선택)

- [ ] **Cloudflare Turnstile 적용** — 견적 폼 봇 차단 강화
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` 환경변수 추가
- [ ] **카카오맵 실제 임베드** — 현재 링크 방식 → 카카오맵 JavaScript API 키 발급 후 지도 직접 삽입
- [ ] **포트폴리오 CMS화** — 시공 사례를 Supabase Storage로 관리하는 간단한 관리자 페이지
- [ ] **카카오 알림톡 연동** — 폼 제출 시 사장님 카카오톡으로 즉시 알림 (유료, 건당 약 10원)
- [ ] **Lighthouse 최적화** — 모바일 Performance·Accessibility·SEO 각 90점 이상 목표

---

## 📁 주요 파일 위치 참조

| 목적 | 경로 |
|------|------|
| 환경변수 템플릿 | `.env.example` |
| DB 스키마 | `supabase/schema.sql` |
| 견적 API | `app/api/quote/route.ts` |
| 서비스 콘텐츠 수정 | `content/services.ts` |
| FAQ 콘텐츠 수정 | `content/faq.ts` |
| 시공사례 콘텐츠 수정 | `content/portfolio.ts` |
| 카카오톡 URL 교체 | `components/FloatingCta.tsx` (line 9), `components/sections/Contact.tsx` (line 57), `components/sections/Portfolio.tsx` |
| 영업시간 수정 | `components/Header.tsx` |
| About 수치 수정 | `components/sections/About.tsx` |
| 개인정보처리방침 | `app/privacy/page.tsx` |
