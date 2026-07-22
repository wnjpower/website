# 우앤주전력 웹사이트 — 남은 작업

> **프로덕션**: https://www.wnjpower.com (apex → www 308 리다이렉트)
> **GitHub**: https://github.com/wnjpower/website · **Vercel**: `wnjpower-erp` 팀 / `wnj-website`
> **Supabase**: `wnj-website` (서울 `ap-northeast-2`)
> **최종 업데이트**: 2026-07-22

> ✅ **완료된 변경 이력은 [`CHANGELOG.md`](CHANGELOG.md)** 참조.
> 이 문서는 아직 끝나지 않은 **운영·콘텐츠·선택** 항목만 추적한다.
> 코드(개발)는 완료 상태이며, 아래는 대부분 외부 설정·사장님 제공·운영 등록 건이다.

---

## 🔴 서비스 운영 — 필수

- [x] **Resend 이메일 활성화** — 완료(CHANGELOG 2026-07-22 참조). `wnjpower.com` 도메인 인증 +
  신규 `RESEND_API_KEY`·`NOTIFY_FROM_EMAIL=quote@wnjpower.com` 로컬/Vercel Production 설정,
  Naver 받은편지함 도착 확인. **단, 환경변수는 다음 재배포부터 실배포에 반영됨.**
- [ ] **프로덕션 재배포** — Vercel 환경변수 정정 값을 실배포에 반영하려면 재배포 필요
  (`git push` 자동 배포 또는 `vercel --prod`).
- [ ] **견적 폼 실배포 E2E 테스트** — 재배포 후 프로덕션에서 실제 폼 제출 → Supabase 저장 +
  사장님 Naver 메일 수신 동시 확인. (로컬 `npm run test:resend`로 Resend→Naver 발신 도착은 확인됨)

## 🔴 카카오 알림톡 활성화 (코드 완료 — 외부 설정만)

> 코드 준비 완료(`lib/kakao-alimtalk.ts`). 아래 후 Vercel 환경변수 입력 시 자동 활성화.

- [ ] **STEP 1** — 카카오 비즈니스 채널 개설 ([business.kakao.com](https://business.kakao.com), 인증 1~2영업일)
- [ ] **STEP 2** — Solapi 가입·API 키 발급 + 채널 연동 + 발신번호 `010-8552-9994` 등록
- [ ] **STEP 3** — 알림톡 템플릿 등록·카카오 검수 (1~3영업일, 템플릿은 `.env.example` 참고)
- [ ] **STEP 4** — Vercel 환경변수 입력 후 재배포
  ```
  SOLAPI_API_KEY / SOLAPI_API_SECRET / SOLAPI_PF_ID
  SOLAPI_SENDER_NUMBER=010-8552-9994
  SOLAPI_TEMPLATE_TO_REQUESTER / SOLAPI_TEMPLATE_TO_OWNER
  OWNER_MOBILE=010-8552-9994
  ```

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
- [ ] 포트폴리오 CMS화 — Supabase Storage + 관리자 페이지

---

## 📁 주요 파일 위치 참조

| 목적 | 경로 |
|------|------|
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
| 서비스/시공사례/FAQ 콘텐츠 | [`content/service-pages.ts`](content/service-pages.ts) · [`content/portfolio.ts`](content/portfolio.ts) · [`content/faq.ts`](content/faq.ts) |
| 서브페이지 골격 | [`components/SubPageShell.tsx`](components/SubPageShell.tsx) · [`components/PageHero.tsx`](components/PageHero.tsx) |
| 히어로 수치 | [`components/sections/Hero.tsx`](components/sections/Hero.tsx) |
| 비용표 | [`components/sections/Pricing.tsx`](components/sections/Pricing.tsx) |
| 영업시간 | [`components/Header.tsx`](components/Header.tsx) · [`components/sections/Contact.tsx`](components/sections/Contact.tsx) · [`components/SchemaOrg.tsx`](components/SchemaOrg.tsx) |
| 개인정보처리방침 | [`app/privacy/page.tsx`](app/privacy/page.tsx) |
