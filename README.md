# 우앤주전력 웹사이트 (WNJ Electric)

대구·경북 지역 전기공사 전문업체 **주식회사 우앤주전력**의 원페이지 리드 제너레이션 사이트입니다.

## 빠른 시작

```bash
# 1) 의존성 설치
npm install

# 2) 환경변수 설정
cp .env.example .env.local
# → .env.local 파일을 열어 Supabase, Resend 키를 채워 넣으세요

# 3) 개발 서버 실행
npm run dev
# http://localhost:3000
```

## 운영 스택 (전부 무료 tier)

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + shadcn/ui
- **Supabase** — Postgres DB + Row Level Security
- **Resend** — 견적문의 알림 메일
- **Vercel** — 호스팅 + Analytics
- **GitHub** — 코드 저장 + Vercel 자동 배포

## 핵심 문서

- 📘 **[CLAUDE.md](./CLAUDE.md)** — Claude Code 작업 사양 (모든 사양·카피·디자인 가이드)
- 📗 **[개발계획서.docx](./docs/개발계획서.docx)** — 사장님 보고용 한글 문서

## 디렉터리

```
wnj-website/
├── CLAUDE.md           ← Claude Code 단일 진실 공급원
├── app/                ← Next.js App Router
├── components/         ← UI 컴포넌트
├── lib/                ← Supabase·Resend·Validators
├── content/            ← 카피·서비스·FAQ 데이터
└── public/             ← 정적 자산
```

## 환경변수

`.env.local`에 다음 키들이 필요합니다 (`.env.example` 참조).

| 키 | 설명 |
|-----|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용. 실시간 알림 발송 경로(`lib/push/*`)에서만 사용 |
| `RESEND_API_KEY` | Resend API 키 |
| `NOTIFY_TO_EMAIL` | 견적문의 받을 이메일 (wnj-2023@naver.com) |
| `NOTIFY_FROM_EMAIL` | 발신자 이메일 (verified domain) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` · `VAPID_PRIVATE_KEY` | 실시간 알림(웹 푸시). `npm run push:keys`로 생성 |

### 실시간 알림 (CTA 클릭 → 사장님 휴대폰·PC 팝업)

`npm run push:keys` → `supabase/push-schema.sql` 실행 → 위 환경변수 입력 후 배포 →
`/admin/notifications`에서 기기마다 알림 켜기. 자세한 순서는 [`TODO.md`](./TODO.md)와
[`docs/어드민_사용법.md`](./docs/어드민_사용법.md) 7번 참조.
키가 없으면 알림만 꺼지고 나머지 기능은 그대로 동작합니다.

## 콘텐츠 교체 가이드

- 시공 사례: `content/portfolio.ts` + `public/images/portfolio/` 이미지 교체
- FAQ: `content/faq.ts`
- 서비스 카드: `content/services.ts`
- 사업자 정보: `components/sections/Footer.tsx` 및 `components/SchemaOrg.tsx`

## 배포

GitHub `main`에 push하면 Vercel이 자동 배포합니다. Preview 환경은 PR마다 자동 생성됩니다.

## 라이선스

Private — 주식회사 우앤주전력 단독 사용.
