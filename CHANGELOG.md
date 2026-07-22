# 변경 이력 — 우앤주전력 웹사이트

> **프로덕션**: https://www.wnjpower.com (apex → www 308 리다이렉트)
> **GitHub**: https://github.com/wnjpower/website · **Vercel**: `wnjpower-erp` 팀 / `wnj-website`
> **Supabase**: `wnj-website` (서울 `ap-northeast-2`)

이 문서는 완료된 변경 이력을 최신순으로 기록합니다. 아직 끝나지 않은 운영·콘텐츠
항목은 [`TODO.md`](TODO.md)에서 추적합니다.

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
