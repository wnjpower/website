# CLAUDE.md — 우앤주전력 원페이지 리드 제너레이션 웹사이트

> 이 파일은 Claude Code의 **single source of truth**입니다. Claude Code 실행 시 이 문서의 사양을 그대로 따라 프로젝트를 구축하세요.

---

## 1. 프로젝트 개요

### 1.1 클라이언트 정보 (사업자등록증 기준)

| 항목 | 내용 |
|------|------|
| 법인명 | 주식회사 우앤주전력 |
| 영문 브랜드 | WNJ Electric (로고 기준) |
| 대표자 | 임태훈 |
| 사업자등록번호 | 637-81-02833 |
| 법인등록번호 | 170111-0899990 |
| 개업일 | 2023년 03월 17일 |
| 본점 / 사업장 | 대구광역시 서구 문화로63길 19, 1층 (평리동) |
| 업태 | 건설업 / 제조업 / 도매 및 소매업 |
| 종목 | 전기공사업 / 분전함 제조 / 신재생에너지 발전설비(태양광) / 실내인테리어 / 전기자재 |
| 대표 전화 | 053-525-0424 |
| 모바일 | 010-8552-9994 |
| 팩스 | 053-525-0414 |
| 이메일 | wnj-2023@naver.com |
| 거래은행 | 기업은행 162-140168-04-018 |

### 1.2 프로젝트 목표

- **유형**: 1-page Lead Generation 웹사이트 (리뉴얼)
- **핵심 KPI**: 견적문의 폼 제출 수 / 전화 클릭 수 / 카카오톡 상담 수
- **운영 비용**: $0/월 (전 구간 무료 tier)
- **타겟**: 대구·경북 지역 건축주, 시공사, 태양광 설치 희망자, 인테리어 업체
- **차별화**: "전기공사 + 태양광 + 분전함 자체 제작 + 인테리어"가 한 곳에서 가능한 종합 전기 솔루션

---

## 2. 기술 스택 (전부 무료 tier)

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | **Next.js 14 (App Router)** | Vercel 무료 호스팅 최적화, SEO 강점, 이미지 최적화 |
| 언어 | TypeScript | 타입 안정성 |
| 스타일링 | **Tailwind CSS** + shadcn/ui | 가볍고 빠름, 디자인 일관성 |
| 폼/상태 | React Hook Form + Zod | 가벼운 검증, 클라이언트 번들 최소화 |
| 백엔드 | **Supabase** (Postgres + RLS) | 무료 500MB DB, 견적문의 저장 |
| 알림 | **Resend** (월 3,000건 무료) + **카카오톡 알림톡(선택)** | 폼 제출 시 사장님께 즉시 메일 발송 |
| 호스팅 | **Vercel** Hobby (무료) | Next.js 1st-class, 자동 HTTPS |
| 코드 저장 | **GitHub** Public/Private (무료) | Vercel 자동 배포 트리거 |
| 도메인 | 기존 도메인 또는 `.vercel.app` 서브도메인 | 비용 0 (커스텀 도메인은 별도) |
| 분석 | **Vercel Analytics** (무료 tier) + GA4 | 트래픽 / 폼 전환 추적 |
| 폰트 | Pretendard (CDN) | 한글 가독성, 무료 |

> **무료 tier 한계 체크**: Vercel Hobby 100GB 대역폭/월, Supabase 500MB DB·50,000 MAU, Resend 100건/일·3,000건/월. 지역 중소업체 사이트로는 충분.

---

## 3. 사이트 구조 (One-Page)

스크롤 순서대로 섹션을 배치합니다. 각 섹션은 독립 컴포넌트로 분리합니다.

```
┌─────────────────────────────────────────────┐
│  ① Hero          : 핵심 메시지 + 1차 CTA      │
│  ② TrustBar      : 사업자번호·경력·면허 신뢰 띠 │
│  ③ Services      : 5대 서비스 카드           │
│  ④ Why Us        : 경쟁사 대비 차별점 4가지   │
│  ⑤ Process       : 견적→시공→사후관리 4단계   │
│  ⑥ Portfolio     : 시공 사례 갤러리 (6~9건)   │
│  ⑦ FAQ           : 자주 묻는 질문 6건         │
│  ⑧ Quote Form    : 핵심 CTA — 견적문의 폼     │
│  ⑨ Contact/Map   : 전화·카톡·주소·약도       │
│  ⑩ Footer        : 사업자정보·개인정보처리방침 │
│  ★ Floating CTA  : 우측 하단 전화·카톡 고정 버튼│
└─────────────────────────────────────────────┘
```

### 3.1 섹션별 카피 가이드

#### ① Hero
- 헤드라인: **"대구·경북 전기공사, 우앤주전력이 책임집니다"**
- 서브: "전기공사업 면허 / 태양광 발전설비 / 분전함 자체 제작 — 견적 무료 상담"
- 1차 CTA 버튼: **"무료 견적문의"** (→ #quote 앵커 스크롤)
- 2차 CTA 버튼: **"전화상담 053-525-0424"** (`tel:` 링크)
- 배경: 시공 사진 + 어두운 그라데이션 오버레이 (텍스트 가독성 확보)

#### ② TrustBar (얇은 띠 1줄)
"사업자등록 637-81-02833 · 전기공사업 등록업체 · 2023년 설립 · 대구광역시 서구"

#### ③ Services (카드 5개)
1. **전기공사** — 신축/리모델링 옥내외 전기공사
2. **태양광 발전설비** — 신재생에너지 (자가소비/판매)
3. **분전함 제조** — 자체 제작 맞춤형 분전반·배전반
4. **실내 인테리어 전기** — 카페·상가·주택 조명·콘센트 설계 시공
5. **전기자재 도소매** — 자재 단품 판매·납품

각 카드: 아이콘(lucide-react) + 제목 + 1줄 설명 + "이 항목으로 문의하기" 링크 (폼 prefill).

#### ④ Why Us (4가지 차별점)
1. **원스톱 시공** — 전기·태양광·분전함·인테리어 한 번에
2. **자체 분전함 제조** — 중간 마진 없는 직접 제작
3. **신재생에너지 전문성** — 태양광 발전설비 시공 실적
4. **신속한 A/S** — 대구·경북 지역 당일 출동

#### ⑤ Process (4단계)
1. 문의 접수 (폼/전화/카톡) → 2. 현장 실사·견적 → 3. 시공 → 4. 사후관리·A/S

#### ⑥ Portfolio
- 6~9개 카드형 갤러리 (Next.js `<Image>`로 최적화)
- 각 항목: 썸네일 + 프로젝트명 + 위치 + 공사유형
- 이미지 없을 시 placeholder + "준비 중" 라벨로 대체 (콘텐츠 받은 후 교체)

#### ⑦ FAQ
- 견적은 정말 무료인가요?
- 출장비가 따로 발생하나요?
- 시공 가능 지역은?
- 태양광 설치 시 정부 보조금 안내해 주시나요?
- 분전함 맞춤 제작 가능한가요?
- A/S 보증 기간은?

#### ⑧ Quote Form (핵심 전환 지점)

**필드 설계 — 입력 부담 최소화**
| 필드 | 타입 | 필수 | 비고 |
|------|------|------|------|
| 이름 | text | ✓ | 2~20자 |
| 연락처 | tel | ✓ | 010-XXXX-XXXX 패턴 |
| 지역 | text | ✗ | 대구/경북 시군구 |
| 문의 유형 | select | ✓ | 5대 서비스 + 기타 |
| 상세 내용 | textarea | ✗ | 최대 1,000자 |
| 개인정보 동의 | checkbox | ✓ | 필수 동의 |

**제출 후 동작**
1. Supabase `quotes` 테이블에 INSERT
2. Resend로 사장님 이메일 (`wnj-2023@naver.com`)에 즉시 발송
3. 사용자에게 "1영업일 내 연락드립니다" 토스트 + 페이지 상단 성공 배너
4. (선택) GA4 `generate_lead` 이벤트 발화

**스팸 방지**: honeypot 필드 + 제출 간격 3초 미만 차단 + Cloudflare Turnstile (무료) 선택 적용.

#### ⑨ Contact / Map
- 주소: 대구광역시 서구 문화로63길 19, 1층 (평리동)
- 전화 / 모바일 / 팩스 / 이메일 / 영업시간
- 지도: **카카오맵 정적 이미지 임베드** (무료, 키 발급) 또는 단순 `<a>`로 카카오맵 링크

#### ⑩ Footer
사업자등록번호, 대표자명, 주소, 전화, 이메일, 통신판매업 신고(해당 시), 개인정보처리방침 링크, ⓒ 2025 주식회사 우앤주전력.

### 3.2 Floating CTA (모바일 필수)
화면 우측 하단 고정. 두 버튼: 📞 전화 / 💬 카카오톡 채널. 모바일에서 항상 노출 → 1탭 전환.

---

## 4. 디자인 시스템

| 항목 | 값 |
|------|-----|
| 주 색상 (Primary) | `#0B5FFF` (전력/안전·신뢰의 블루) |
| 보조 색상 | `#FFB800` (전기 에너지 옐로 — 강조 CTA에만) |
| 중립 | `#0F172A` (텍스트), `#F8FAFC` (배경) |
| 폰트 | Pretendard Variable |
| 라운드 | `rounded-2xl` 카드 / `rounded-xl` 버튼 |
| 그림자 | `shadow-sm` 기본, hover 시 `shadow-md` |
| 반응형 | Mobile-first, 브레이크포인트 `sm 640 / md 768 / lg 1024` |

> 로고 PDF (`우앤주전력_로고_2.pdf`)에서 색상을 추출해 Primary를 미세 조정할 것. 로고가 모노톤이면 위 블루 유지.

---

## 5. 데이터베이스 스키마 (Supabase)

```sql
-- quotes: 견적문의
create table public.quotes (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  name        text        not null,
  phone       text        not null,
  region      text,
  category    text        not null,  -- 'electric'|'solar'|'panel'|'interior'|'material'|'etc'
  message     text,
  source      text,                   -- 'hero'|'service_card'|'main_form' 등 유입 위치
  user_agent  text,
  ip_hash     text                    -- 원본 IP는 저장하지 않고 해시만
);

-- RLS: 익명 INSERT만 허용, SELECT는 service_role만
alter table public.quotes enable row level security;

create policy "anon can insert" on public.quotes
  for insert to anon
  with check (true);

-- (SELECT 정책 없음 → 익명은 조회 불가)
```

> **Service Role Key는 절대 클라이언트에 노출 금지.** 폼 제출은 Next.js Route Handler (`app/api/quote/route.ts`)에서 서버 측에서만 service_role 또는 anon insert 사용. 본 프로젝트는 anon insert + RLS로 충분.

---

## 6. 환경 변수 (`.env.local`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # 서버 라우트에서만 사용

# Resend
RESEND_API_KEY=
NOTIFY_TO_EMAIL=wnj-2023@naver.com
NOTIFY_FROM_EMAIL=quote@yourdomain.com   # 또는 onboarding@resend.dev (테스트)

# (선택) Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# (선택) GA4
NEXT_PUBLIC_GA_ID=
```

`.env.example`을 동일 키로 빈 값으로 작성해 커밋. `.env.local`은 `.gitignore`.

---

## 7. 프로젝트 구조

```
wnj-website/
├── CLAUDE.md                 ← 이 파일
├── README.md
├── package.json
├── next.config.mjs
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.example
├── .gitignore
├── public/
│   ├── og-image.png
│   ├── favicon.ico
│   └── images/portfolio/...
├── app/
│   ├── layout.tsx            ← <html lang="ko">, 메타데이터, 폰트
│   ├── page.tsx              ← 원페이지 본체 (섹션 import)
│   ├── globals.css
│   ├── privacy/page.tsx      ← 개인정보처리방침
│   ├── api/quote/route.ts    ← POST: Supabase insert + Resend 메일
│   └── opengraph-image.tsx   ← 동적 OG 이미지
├── components/
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── TrustBar.tsx
│   │   ├── Services.tsx
│   │   ├── WhyUs.tsx
│   │   ├── Process.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Faq.tsx
│   │   ├── QuoteForm.tsx
│   │   ├── Contact.tsx
│   │   └── Footer.tsx
│   ├── ui/                   ← shadcn/ui 컴포넌트
│   ├── FloatingCta.tsx
│   └── SchemaOrg.tsx         ← JSON-LD LocalBusiness
├── lib/
│   ├── supabase.ts
│   ├── resend.ts
│   └── validators.ts         ← Zod schema
└── content/
    ├── services.ts
    ├── faq.ts
    └── portfolio.ts          ← 시공사례 데이터 (이미지 경로 + 메타)
```

---

## 8. SEO / 로컬 검색 최적화

1. **`<title>`** — "대구 전기공사 | 태양광 시공 | 우앤주전력 (대구 서구 평리동)"
2. **메타 디스크립션** — 핵심 키워드 ("대구 전기공사", "대구 태양광", "분전함 제작") 자연스럽게 삽입
3. **JSON-LD `LocalBusiness`** — 사업장 주소, 전화, 영업시간, geo 좌표 입력. `components/SchemaOrg.tsx`에서 주입.
4. **OG 이미지** — `app/opengraph-image.tsx`로 동적 생성 (제목 + 로고 + 전화번호)
5. **sitemap.xml / robots.txt** — Next.js 14 metadata 라우트 활용
6. **이미지 alt** — 모든 시공 사진에 위치·공사유형 포함한 alt
7. **카카오톡 링크 미리보기** — OG 메타 정상 동작 확인
8. **네이버 서치어드바이저 / Google Search Console** 등록 (배포 후)
9. **네이버 플레이스** 정보와 NAP(이름·주소·전화) 100% 일치
10. **페이지 속도** — Lighthouse 모바일 90+ 목표 (이미지 lazy, 폰트 preconnect)

---

## 9. 단계별 To-Do List

> Claude Code는 아래 단계를 **순서대로** 실행. 각 단계 완료 시 git commit (메시지: `feat(step-N): ...`).

### STEP 0 — 사전 준비 (사람이 1회만)
- [ ] GitHub 저장소 생성 (private 권장)
- [ ] Vercel·Supabase·Resend 계정 가입 (무료)
- [ ] Supabase 프로젝트 생성 → URL / anon key / service role 확보
- [ ] Resend API key 생성, 발신 도메인 verify (없으면 `onboarding@resend.dev` 임시 사용)

### STEP 1 — 프로젝트 부트스트랩
- [ ] `npx create-next-app@latest wnj-website --ts --tailwind --app --src-dir=false --eslint --import-alias "@/*"`
- [ ] shadcn/ui 초기화: `npx shadcn@latest init` → button, input, textarea, select, checkbox, toast 추가
- [ ] 추가 패키지: `npm i @supabase/supabase-js resend zod react-hook-form @hookform/resolvers lucide-react`
- [ ] Pretendard 웹폰트 적용 (`globals.css` + layout `<link>`)
- [ ] `.env.example`, `.env.local` 작성

### STEP 2 — 데이터베이스 & API
- [ ] Supabase SQL 에디터에서 `quotes` 테이블 + RLS 정책 실행
- [ ] `lib/supabase.ts` (브라우저용 anon 클라이언트) 작성
- [ ] `lib/validators.ts` Zod 스키마: `QuoteSchema`
- [ ] `app/api/quote/route.ts` 구현
  - 입력 검증 (Zod)
  - honeypot 필드 검사
  - Supabase insert
  - Resend 메일 발송 (한국어 템플릿, 사장님께)
  - 에러 핸들링 + 200/4xx/5xx 분기

### STEP 3 — 디자인 시스템 & 레이아웃
- [ ] `tailwind.config.ts`에 색상 토큰 / 폰트 / 컨테이너 너비 설정
- [ ] `app/layout.tsx` — 메타데이터, 폰트, `<SchemaOrg />`, 한국어 locale
- [ ] `components/SchemaOrg.tsx` JSON-LD LocalBusiness
- [ ] 공통 컨테이너·섹션 래퍼 컴포넌트

### STEP 4 — 섹션 구현 (위→아래 순서)
- [ ] Hero (배경 + CTA 2개)
- [ ] TrustBar
- [ ] Services (5 카드, 카테고리 클릭 시 폼 prefill)
- [ ] WhyUs (4 항목)
- [ ] Process (4단계 타임라인)
- [ ] Portfolio (그리드, placeholder 이미지부터)
- [ ] Faq (Accordion, shadcn)
- [ ] QuoteForm (RHF + Zod, 토스트, 성공/실패 UI)
- [ ] Contact (지도 링크, 전화/카톡 버튼)
- [ ] Footer
- [ ] FloatingCta (sm:hidden 위치 조정으로 데스크톱에서도 표시 옵션)

### STEP 5 — SEO / OG / 분석
- [ ] `sitemap.ts`, `robots.ts`
- [ ] `opengraph-image.tsx`
- [ ] Vercel Analytics 패키지 설치 + `<Analytics />`
- [ ] (선택) GA4 스크립트 — Consent Mode v2 고려

### STEP 6 — 접근성 / 성능 / QA
- [ ] 모든 인터랙션 키보드 접근 가능, focus ring 보장
- [ ] 이미지 `<Image>` + `priority` (Hero만), 그 외 lazy
- [ ] Lighthouse 모바일: 성능·접근성·SEO 모두 90+ 목표
- [ ] 폼 제출 E2E 수동 테스트 (성공/검증실패/네트워크실패 3 케이스)
- [ ] 다양한 디바이스 (iPhone SE / Galaxy / iPad / 1080p) 시각 점검

### STEP 7 — 배포
- [ ] GitHub push → Vercel 프로젝트 import
- [ ] Vercel 환경변수 입력 (Production / Preview / Development 모두)
- [ ] 첫 배포 후 폼 제출 실제 테스트 (메일 도착 확인)
- [ ] 커스텀 도메인 연결 (있을 경우) — DNS A/CNAME, HTTPS 자동
- [ ] 네이버/구글 서치콘솔 등록, 사이트맵 제출

### STEP 8 — 운영 인계
- [ ] `README.md`에 환경변수·운영 방법·콘텐츠 교체 가이드 작성
- [ ] 사장님께: 시공 사진·FAQ 최종 확정·네이버 플레이스 정보 일치 요청
- [ ] 월 1회 Vercel/Supabase 사용량 점검 알림 설정

---

## 10. Claude Code 실행 가이드

이 저장소를 받은 직후 Claude Code에서 아래 프롬프트로 시작하세요:

```
이 프로젝트의 CLAUDE.md를 먼저 읽고, "9. 단계별 To-Do List"의 STEP 1부터 순서대로 진행해줘.
각 STEP이 끝날 때마다 변경 파일을 요약해서 보여주고, 사용자 승인을 받으면 다음 STEP으로 넘어가.
환경변수가 필요한 시점에는 .env.example을 먼저 만들고 사용자에게 실제 값을 요청해.
```

### 작업 원칙
1. **CLAUDE.md를 절대적 사양**으로 본다. 임의로 섹션·기능을 추가하지 않는다.
2. 의존성 추가 시 무료 tier 한도 영향 검토 후 보고한다.
3. 한국어 콘텐츠는 본 문서의 카피 가이드를 그대로 사용 (사장님 검토 후 교체 가능).
4. 사업자정보(번호·주소·전화 등)는 본 문서 §1.1 표만을 정답으로 한다.
5. 비밀키는 코드/커밋에 절대 포함하지 않는다.

---

## 11. 콘텐츠 체크리스트 (사장님 제공 필요)

Claude Code 작업과 병행하여 사장님께 받아야 할 자료:

- [ ] 시공 현장 사진 6~9장 (전기공사·태양광·분전함·인테리어 골고루)
- [ ] 보유 면허·자격증 스캔 (TrustBar에 라벨로 노출)
- [ ] 카카오톡 채널 URL (있을 경우)
- [ ] 네이버 플레이스 URL
- [ ] 영업시간 (예: 평일 09:00–18:00, 토 09:00–13:00)
- [ ] 시공 가능 지역 정확한 표기
- [ ] FAQ 답변 사장님 검수
- [ ] 개인정보처리방침에 들어갈 정보 (수집 항목·보유기간) 동의

---

## 12. 향후 확장 (당장은 X)

- 공사사례 CMS (Supabase Storage + 관리자 페이지)
- 다국어 (한/영) — 다국적 발주처 대응
- 블로그/뉴스 (SEO 강화) — 월 2~4건 발행
- 카카오 알림톡 연동 (유료, 건당 ~10원)
- 챗봇 (Channel.io 무료 tier)

---

**문서 버전**: v1.0  
**최종 수정**: 2025-XX-XX  
**작성**: Claude (Anthropic)
