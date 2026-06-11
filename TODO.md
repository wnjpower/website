# 우앤주전력 웹사이트 — 단계별 To-Do 체크리스트

> 진행 상황을 체크하면서 사용하세요. 각 STEP 완료 후 git commit 권장.

---

## ☐ STEP 0 — 사전 준비 (사람이 1회만)

> Claude Code를 실행하기 **전에** 사장님 또는 담당자가 직접 처리.

- [ ] GitHub 저장소 생성 (`wnj-website`, private 권장)
- [ ] Vercel 가입 + GitHub 연동 (https://vercel.com)
- [ ] Supabase 가입 + 새 프로젝트 생성 (https://supabase.com)
  - [ ] Project URL 메모
  - [ ] anon public key 메모
  - [ ] service_role key 메모 (절대 외부 노출 금지)
- [ ] Resend 가입 + API key 발급 (https://resend.com)
  - [ ] 발신 도메인 verify (없으면 `onboarding@resend.dev`로 시작)
- [ ] (선택) 카카오 비즈니스 채널 생성
- [ ] (선택) Cloudflare Turnstile 사이트 등록

---

## ☐ STEP 1 — 프로젝트 부트스트랩

```bash
# 자동 스크립트 실행
bash scripts/bootstrap.sh
```

또는 수동:
- [ ] `npx create-next-app@latest . --ts --tailwind --app --eslint --import-alias "@/*"`
- [ ] `npx shadcn@latest init` (기본값 권장)
- [ ] `npm i @supabase/supabase-js resend zod react-hook-form @hookform/resolvers lucide-react`
- [ ] `npx shadcn@latest add button input textarea select checkbox toast accordion`
- [ ] Pretendard 웹폰트 적용 (`app/globals.css` + `app/layout.tsx`)
- [ ] `cp .env.example .env.local` → 실제 키 입력
- [ ] `git init && git add . && git commit -m "feat(step-1): bootstrap"`

---

## ☐ STEP 2 — 데이터베이스 & API 라우트

- [ ] Supabase SQL Editor에서 `supabase/schema.sql` 전체 실행
- [ ] `lib/supabase.ts` 작성 (`snippets/lib/supabase.ts` 참조)
- [ ] `lib/validators.ts` 작성 (`snippets/lib/validators.ts` 참조)
- [ ] `app/api/quote/route.ts` 작성 (`snippets/app/api/quote/route.ts` 참조)
- [ ] cURL로 API 단독 테스트

```bash
curl -X POST http://localhost:3000/api/quote \
  -H "Content-Type: application/json" \
  -d '{
    "name":"홍길동","phone":"010-1234-5678","region":"대구 서구",
    "category":"electric","message":"테스트","agree":true,
    "loadedAt":'$(($(date +%s%N)/1000000 - 5000))'
  }'
```

- [ ] Supabase 대시보드에서 quotes 테이블에 row 들어왔는지 확인
- [ ] 메일 수신 확인 (`wnj-2023@naver.com`)
- [ ] commit: `feat(step-2): db + quote api`

---

## ☐ STEP 3 — 디자인 시스템 & 레이아웃

- [ ] `tailwind.config.ts`에 색상 토큰 추가 (primary `#0B5FFF`, accent `#FFB800`)
- [ ] `app/layout.tsx` — `<html lang="ko">`, 메타데이터, Pretendard 폰트
- [ ] `components/SchemaOrg.tsx` 작성 (`snippets/components/SchemaOrg.tsx` 참조)
- [ ] 공통 `<Section>`, `<Container>` 래퍼 컴포넌트
- [ ] commit: `feat(step-3): design system + layout`

---

## ☐ STEP 4 — 섹션 구현 (10개 + Floating CTA)

- [ ] `components/sections/Hero.tsx` — 배경 + 헤드라인 + 2개 CTA
- [ ] `components/sections/TrustBar.tsx` — 1줄 신뢰 띠
- [ ] `components/sections/Services.tsx` — 5개 카드 (lucide 아이콘)
- [ ] `components/sections/WhyUs.tsx` — 4가지 차별점
- [ ] `components/sections/Process.tsx` — 4단계 타임라인
- [ ] `components/sections/Portfolio.tsx` — 그리드 (placeholder부터)
- [ ] `components/sections/Faq.tsx` — shadcn Accordion
- [ ] `components/sections/QuoteForm.tsx` — RHF + Zod, 토스트
- [ ] `components/sections/Contact.tsx` — 카카오맵 링크 + 정보
- [ ] `components/sections/Footer.tsx` — 사업자정보·개인정보처리방침
- [ ] `components/FloatingCta.tsx` — 우측 하단 고정 (전화·카톡)
- [ ] `app/page.tsx`에서 모두 import 후 순서대로 배치
- [ ] commit: `feat(step-4): all sections`

---

## ☐ STEP 5 — SEO / OG / 분석

- [ ] `app/sitemap.ts` 작성
- [ ] `app/robots.ts` 작성
- [ ] `app/opengraph-image.tsx` 동적 OG 이미지
- [ ] `npm i @vercel/analytics` + `<Analytics />` 삽입
- [ ] (선택) GA4 스크립트 — Consent Mode v2
- [ ] `app/privacy/page.tsx` — 개인정보처리방침
- [ ] commit: `feat(step-5): seo + analytics`

---

## ☐ STEP 6 — 접근성 / 성능 / QA

- [ ] 키보드 Tab으로 모든 인터랙션 도달 가능 확인
- [ ] focus ring 시각적으로 명확한지 확인
- [ ] Hero 이미지만 `priority`, 나머지는 lazy
- [ ] Lighthouse 모바일 측정 (Chrome DevTools)
  - [ ] Performance ≥ 90
  - [ ] Accessibility ≥ 90
  - [ ] SEO ≥ 90
- [ ] 폼 E2E 수동 테스트 3종
  - [ ] 정상 제출 → DB 저장 + 메일 수신
  - [ ] 검증 실패 → 에러 메시지 표시
  - [ ] 네트워크 차단 → 실패 토스트
- [ ] iPhone SE (375px), Galaxy (412px), iPad (768px), Desktop (1280px) 시각 점검
- [ ] commit: `chore(step-6): qa fixes`

---

## ☐ STEP 7 — 배포

- [ ] GitHub에 push (main)
- [ ] Vercel에서 import (자동 감지)
- [ ] Vercel 환경변수 입력 (Production / Preview / Development)
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `RESEND_API_KEY`
  - [ ] `NOTIFY_TO_EMAIL`
  - [ ] `NOTIFY_FROM_EMAIL`
  - [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] 첫 배포 성공 확인
- [ ] Production URL에서 폼 제출 실제 테스트
- [ ] (선택) 커스텀 도메인 연결 — DNS 설정 후 자동 HTTPS
- [ ] Google Search Console 등록 + 사이트맵 제출
- [ ] 네이버 서치어드바이저 등록 + 사이트맵 제출

---

## ☐ STEP 8 — 운영 인계

- [ ] `README.md` 최종 업데이트
- [ ] 사장님께 운영 가이드 전달
  - [ ] Supabase 대시보드에서 견적문의 조회 방법
  - [ ] 콘텐츠 교체 방법 (`content/*.ts`)
  - [ ] Vercel·Supabase·Resend 사용량 확인 방법
- [ ] 네이버 플레이스 정보 일치 최종 확인
- [ ] 시공 사진 6~9장 최종 교체
- [ ] FAQ 6건 답변 사장님 검수 반영
- [ ] commit + tag: `git tag v1.0.0 && git push --tags`

---

## 운영 체크 (월 1회)

- [ ] Vercel Analytics 트래픽 / 전환율 확인
- [ ] Supabase quotes 테이블 백업 (CSV export)
- [ ] Vercel·Supabase·Resend 사용량 확인 (한도 80% 도달 시 알림)
- [ ] 시공 사례 신규 추가 (월 1~2건 권장 → SEO에 유리)
