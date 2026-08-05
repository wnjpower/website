# 변경 이력 — 우앤주전력 웹사이트

> **프로덕션**: https://www.wnjpower.com (apex → www 308 리다이렉트)
> **GitHub**: https://github.com/wnjpower/website · **Vercel**: `wnjpower-erp` 팀 / `wnj-website`
> **Supabase**: `wnj-website` (서울 `ap-northeast-2`)

이 문서는 완료된 변경 이력을 최신순으로 기록합니다. 아직 끝나지 않은 운영·콘텐츠
항목은 [`TODO.md`](TODO.md)에서 추적합니다.

---

## 2026-08-05 — 1b 잔재 DB 정리

코드 잔재를 정리하며 «되돌릴 수 없으니 남긴다»고 미뤄 뒀던 DB 두 가지를 정리했다.
[`supabase/migrations/20260805_drop_legacy_content.sql`](supabase/migrations/20260805_drop_legacy_content.sql)

### 조사에서 드러난 것 — 앞선 설명이 부정확했다

«`ctas.style`은 사이트가 읽지 않는다»고 적어 뒀는데, 실제로는 **`lib/cta/get.ts`가
SELECT에 `style`을 넣고 있었고 `saveCta`는 INSERT까지** 하고 있었다. 화면에 그리지
않을 뿐 DB 경로에는 살아 있었다는 뜻이다. **컬럼만 지웠으면 어드민의 CTA 저장이
`column style does not exist`로 깨졌을 것이다.**

그래서 순서를 «코드 먼저, SQL 나중»으로 잡고 아래 네 곳을 먼저 걷어냈다.

| 파일 | 걷어낸 것 |
|---|---|
| `lib/cta/get.ts` | `Row` 타입 · SELECT 컬럼 목록 · 매핑 |
| `lib/cta/schema.ts` | `CtaStyle` 타입 · `Cta.style` · `CTA_DEFAULTS` 8곳 |
| `app/admin/actions.ts` | `CtaInput.style` · `saveCta`의 row |
| `components/admin/CtaManager.tsx` | `CtaRow` · 폼 상태 · 저장 payload |

### 안전성 판단

- **`ctas` 테이블은 0행이다.** 어드민에서 «이 자리를 A/B 실험에 쓰겠다»고 등록한
  슬롯만 행이 생기는데 아직 아무 자리도 등록하지 않았다. 전부 코드의
  `CTA_DEFAULTS`로 렌더된다 — 즉 잃는 데이터가 없다.
- **옛 JSON 키는 이미 화면에 도달하지 못했다.** `lib/content/get.ts`의 `mergeDeep`이
  «기본값에 없는 키는 버린다»고 명시적으로 걸러낸다. 이 정리는 동작을 바꾸지 않고
  저장된 것과 실제로 쓰이는 것을 일치시킬 뿐이다.
- **`footer` 행은 읽는 코드가 없다.** 푸터는 사업자정보 고정 블록이다.

### 적용 결과

`site_content`·`site_drafts` 두 테이블에서 `header.logoSub` · `services.eyebrow` ·
`seo.ogImageHeadline`을 제거하고 `footer` 행을 지웠다. 이제 저장된 키가 스키마와
정확히 일치한다 — header(8) · services(3) · seo(3).

**`ctas.style` 컬럼 삭제는 미적용이다.** DDL이라 `service_role`로는 안 되고
Management API PAT 또는 대시보드 SQL Editor가 필요한데 토큰이 없다. 남아 있어도
무해하다 — `not null default 'primary'`가 걸려 있고 코드가 더 이상 INSERT에 넣지
않으므로 기본값이 채워진다.

적용 전 `site_content` 4행 · `site_drafts` 3행 · `ctas` 0행을 JSON으로 백업했고,
되돌리는 SQL을 마이그레이션 파일 하단에 **실제 값 그대로** 적어 뒀다(추측으로 적었다가
백업과 대조해 세 곳을 바로잡았다). 파일 전체가 멱등이라 몇 번을 돌려도 안전하다.

검증: `tsc`·`lint`·`build`(30/30) 통과. 배포 후 운영 사이트 홈·서비스 상세·실적·
회사소개·FAQ 전부 200이고, 홈에 CTA(«무료 현장 견적 신청» 5회)와 전화번호(41회)가
그대로 나오는 것까지 확인했다.

---

## 2026-08-05 — Next.js 14 → 15 업그레이드

[공식 업그레이드 가이드](https://nextjs.org/docs/app/guides/upgrading/version-15)를 먼저 읽고,
문서가 열거한 파괴적 변경 전부를 코드베이스에 대조한 뒤 진행했다.

`next` **14.2.35 → 15.5.22**, `react`·`react-dom` **18.3.1 → 19.2.8**,
`@types/react(-dom)` 19. `eslint-config-next`는 앞선 작업에서 이미 15.5.22였다.

### 문서가 열거한 변경 vs 이 저장소

| 파괴적 변경 | 이 저장소 |
|---|---|
| **비동기 요청 API** (`cookies`·`headers`·`draftMode`) | **해당** — 5곳 |
| **`params`·`searchParams`가 Promise** | **해당** — 14곳 |
| React 19 최소 요구 | **해당** — 올림 |
| `runtime: 'experimental-edge'` 제거 | 해당 없음 (`'nodejs'`만 씀) |
| `NextRequest`의 `geo`·`ip` 제거 | 해당 없음 |
| `experimental.serverComponentsExternalPackages` 개명 | 해당 없음 (`next.config.mjs`에 experimental 없음) |
| `@next/font` 제거 | 해당 없음 (이미 `next/font/google`) |
| Speed Insights 자동 계측 제거 | 해당 없음 (`@vercel/analytics`를 명시적으로 씀) |
| `fetch` 기본 캐시 해제 | 실질 영향 없음 — 호출 두 곳이 빌드 1회(OG 폰트)와 POST(IndexNow)다 |
| Route Handler `GET` 기본 캐시 해제 | 실질 영향 없음 — 전부 `force-dynamic`이거나 `revalidate`를 명시 |
| 클라이언트 캐시에서 페이지 세그먼트 재사용 안 함 | 기본값 수용 |

### 손댄 곳

**`createServerSupabase()`가 async가 됐다** — `cookies()`가 비동기라 어쩔 수 없다.
호출처 **25곳**에 `await`를 붙였다. 나머지는 `lib/cta/get.ts`의 `cookies()`,
`lib/content/get.ts`와 미리보기 라우트 두 곳의 `draftMode()`.

`params`·`searchParams`는 타입을 `Promise<…>`로 바꾸고 `await`했다.
`app/services/[slug]/page.tsx`는 동기 함수였어서 `generateMetadata`와 본체를
async로 바꿨다.

> **타입 검사가 안전망이었다.** Next 15의 타입이 이 값들을 Promise로 바꾸므로
> 빠뜨린 곳은 컴파일이 잡는다. 실제로 `npx tsc --noEmit`은 통과했는데 빌드의
> 라우트 타입 검사가 `admin/leads`의 `searchParams`를 잡아냈다 — 두 검사가
> 보는 범위가 달라서, **둘 다 돌려야 한다.**

**`outputFileTracingRoot` 추가** — Next 15는 lockfile로 워크스페이스 루트를
추론하는데, 이 환경은 홈 디렉터리에도 `package-lock.json`이 있어 그쪽을 루트로
잡았다. 서버리스 번들에 넣을 파일 추적 범위가 어긋나므로 저장소를 루트로 명시했다.

**`scripts/patch-og-windows.mjs` 삭제** — Next 15의 `@vercel/og`는 문제의 세 줄이
이미 `new URL("./파일", import.meta.url)`로 고쳐져 있다(직접 확인: `join(import.meta.url)`
0개). 패치가 하던 일을 업스트림이 했으므로 스크립트와 `postinstall`을 걷어냈다.

### 감수한 것

**First Load JS 87.3 kB → 103 kB (+15.7 kB).** React 19 런타임이 커진 몫이고
애플리케이션 코드가 늘어서가 아니다. 되돌릴 방법은 없다 — Next 15가 React 19를
요구한다.

### 확인

`npx tsc --noEmit` · `npm run lint` · `npm run build`(30/30, 경고 0) 통과.
실 데이터로 홈 · 서비스 상세(동기→비동기 전환) · 실적 상세 · 개인정보처리방침과,
로그인한 어드민의 대시보드 · 견적문의(`?status=new` 필터) · 히어로 편집 화면
(미리보기 iframe 포함)을 띄워 dev 로그에 오류가 없는 것까지 확인했다.

---

## 2026-08-05 — 1b 재구축이 남긴 죽은 코드 정리 (4단계)

사이트를 «1b 블루프린트»로 다시 지으면서 옛 화면을 만들던 코드가 그대로 남아 있었다.
빌드에는 들어가지 않지만 저장소에 남아 **«어느 쪽이 진짜인지» 헷갈리게 한다** —
`components/sections/Hero.tsx`와 `components/redesign/home/Hero.tsx`가 나란히 있으면
다음 사람은 둘 다 읽어야 한다.

### 어떻게 찾았나

`app/` 아래 전 파일과 `middleware.ts`를 뿌리로 `import` · `export … from` · 동적
`import()` · `require()` · CSS `@import`를 따라가며 도달 가능한 파일을 표시하고,
남은 것을 죽은 파일로 봤다. `@/` 별칭과 확장자 생략, `index` 파일을 모두 해석한다.

### 지운 것 — 파일 29개 · 2,799줄 · 패키지 4개

삭제에는 **순서가 있다.** 1단계를 지워야 2단계가 고아가 되고, 2단계를 지워야 패키지가
떨어진다. 거꾸로 하면 «아직 쓰는 데가 있다»고 나온다.

| 단계 | 무엇 | 규모 |
|---|---|---|
| 1 | 어디서도 import되지 않는 파일 | 16개 · 1,583줄 |
| 2 | 1단계 파일만이 쓰던 파일 | 13개 · 1,216줄 |
| 3 | 2단계 파일만이 쓰던 패키지 | 4개 (전이 포함 11개) |

1단계의 대체 관계 — 옛것이 어디로 갔는지:

| 지운 것 | 지금 그 일을 하는 것 |
|---|---|
| `sections/Hero.tsx` | `redesign/home/Hero.tsx` |
| `Header.tsx` | `redesign/HeaderBar.tsx` + `MobileNav.tsx` |
| `sections/Services · Process · Pricing · Contact · WhyUs · Credentials` | `redesign/home/Sections.tsx` |
| `sections/Faq.tsx` | `redesign/home/HomeFaq.tsx` |
| `sections/Portfolio.tsx` | `redesign/portfolio/Ledger.tsx` |
| `sections/QuoteSection.tsx` | `redesign/home/QuoteBlock.tsx` |
| `sections/Footer.tsx` · `FloatingCta.tsx` | `redesign/Chrome.tsx` |
| `sections/About.tsx` | `app/about/page.tsx`가 직접 조립 |
| `ui/select.tsx` | 폼이 네이티브 `<select>`로 |
| `CountUp.tsx` | 대체 없이 참조만 끊김 |

3단계에서 빠진 패키지는 전부 shadcn 계열이다 — `@base-ui/react`(13.6MB) ·
`tailwind-merge` · `class-variance-authority` · `clsx`. 1b는 `blueprint.css`의
손으로 쓴 클래스로 갈아탔다.

`components/sections/`는 통째로 없어졌고 `components/ui/`에는 `sonner.tsx`만 남는다.

> **번들 크기는 그대로다** (First Load JS 87.3 kB). 죽은 코드는 이미 트리셰이킹으로
> 빠져 있었다. 줄어드는 것은 설치 용량과 잠금 파일이지 사용자가 받는 바이트가 아니다.
> 얻는 것은 저장소를 읽는 사람이 «진짜 화면을 만드는 코드»만 보게 되는 것이다.

### 비어 보이지만 남긴 것

- **`react-dom`** — import 구문이 한 곳도 없지만 Next가 화면을 그리는 데 반드시 필요하다.
  의존성 검사 도구가 가장 흔히 틀리는 항목이라 적어 둔다.
- **`shadcn`(devDependency) · `components.json`** — `globals.css`가
  `@import "shadcn/tailwind.css"`를 쓰고, 토스트(`ui/sonner.tsx`)도 계속 쓴다.
  `components.json`의 `utils` 별칭이 사라진 `lib/utils.ts`를 가리키게 되지만 CLI가
  컴포넌트를 새로 받을 때만 보는 값이라 그대로 뒀다.
- **`next.config.mjs` · `postcss.config.mjs` · `public/sw.js`** — import되지 않는 게
  정상이다. 빌드 도구와 브라우저가 규약으로 직접 읽는다.

각 단계마다 `npx tsc --noEmit` · `npm run lint` · `npm run build`(40/40)로 확인했다.

### 4단계 — 공지 띠를 액센트로 통일하고 옛 팔레트를 걷어냄

1b 이관 뒤에도 **최상단 공지 띠만 옛 강조색**(번트 앰버 `#C2620E`)에 남아, 사이트에서
혼자 다른 시스템의 색으로 떠 있었다. 이것 하나 때문에 옛 팔레트 전체가 살아 있었다.

**색 단계를 700으로 내린 이유** — 채움 버튼(`.btn-solid`)이 쓰는 `--color-accent`를
그대로 쓰면 이 띠의 13px 본문 크기에서 대비가 **3.7:1**로 WCAG AA(4.5:1)에 못 미친다.
`--color-accent-700`은 **5.78:1**로 통과한다(헤드리스 크롬에서 계산값 확인). 버튼은
글자가 커서 문제가 없지만 이 띠는 작아서 단계를 내렸다.

> 옛 앰버도 실은 **4.2:1로 AA 미달**이었다 — 「흰 글씨 AA」라고 적힌 주석이 틀렸던
> 것이고, 색을 바꾸며 함께 고쳤다.

`Banner`를 `.blueprint-theme` **안으로 옮겼다.** 토큰이 그 아래 정의돼 있어 밖에서는
풀리지 않는다. `fixed`라서 화면상 위치는 그대로다.

**`globals.css` 421 → 290줄**

| 지운 것 | 사유 |
|---|---|
| `--color-brand*` · `--color-ink` · `--color-signal*` (9개) | 화면에서 쓰는 곳이 하나도 없어짐 |
| `.tech-dark` · `.tech-light` · `.rule-accent` | 1b가 격자를 `.grid-field`로, 강조선을 헤어라인으로 다시 그림 |
| `.prose-wnj` 전체 | `blueprint.css`로 옮김 (아래) |

**`.prose-wnj`를 한곳으로 합침** — 이관 중에는 뼈대(여백·글자 크기)가 `globals.css`,
색만 `blueprint.css`가 덮어쓰는 2단 구조였다. 옛 팔레트가 살아 있어 두 시스템이 한
화면에 섞이는 것을 막아야 했기 때문이다. 그 위험이 사라졌고 한 요소를 고치려 두 파일을
오가는 비용만 남아서 합쳤다. 쓰이는 곳(개인정보처리방침·게시글·실적 상세)이 전부
`SubPageShell`을 거쳐 항상 테마 안이므로 스코프를 좁혀도 안전하다.

**미사용 export 6개 제거** — `enablePreview`/`disablePreview`/`exitPreviewAndGoHome`
(미리보기가 `app/api/preview` 라우트로 옮겨간 뒤 남은 서버 액션), `CTA_STYLE_LABELS`,
`CONTENT_KEYS`, `portfolioByCategory`. 딸려 나온 미사용 import는 **되살린 lint가 잡아
줬다** — 복구해 둔 값이 바로 나타난 셈이다.

실 데이터로 홈·개인정보처리방침·실적 상세를 띄워 옛 색이 남지 않은 것과 prose가 그대로인
것을 눈으로 확인했다.

### 남은 것 — DB (손대지 않음)

- **`ctas.style` 컬럼** — 사이트가 읽지 않지만 저장된 값이 있다. 타입(`CtaStyle`)은
  코드에 남겨 뒀다.
- **`site_content` JSON의 옛 키** — `eyebrow`·`segments`·`footer`·`ogImageHeadline`.

둘 다 **코드와 달리 `git revert`로 되돌릴 수 없다.** 읽지 않는 값이 남아 있는 비용은
사실상 0이고, 지우면 되돌릴 수 없으므로 남긴다. 정말 지운다면 사이트 정리가 충분히
안정된 뒤 별도 마이그레이션으로 하는 편이 안전하다.

---

## 2026-08-05 — 한 번도 돌지 않던 `npm run build`·`npm run lint` 복구

이 저장소는 처음부터 **두 검증 명령이 모두 죽어 있었다.** 로컬에서 빌드가 통과한 적이
없으니 «타입은 되는데 빌드가 깨지는» 변경을 잡을 방법이 없었고, lint는 아예 단 한 줄도
검사한 적이 없었다. 배포는 Vercel(리눅스)에서만 성공하고 있었다.

### ① `next build` — Windows에서 `/opengraph-image` 프리렌더 실패

Next 14가 번들한 `@vercel/og`가 폰트·wasm 파일을 이렇게 읽는다.

```js
fs.readFileSync(fileURLToPath(join(import.meta.url, "../yoga.wasm")))
```

`path.join()`에 **파일 경로가 아니라 `file://` URL**을 넘긴 게 잘못이다. POSIX에서는
`file:/home/…/yoga.wasm`이 되어 (이상하지만) 유효한 URL이라 통과한다 — Vercel 빌드가
멀쩡했던 이유다. Windows에서는 `path.win32.join`이 슬래시를 뒤집고 앞에 `./`를 붙여

```
.\file:\C:\Users\…\yoga.wasm
```

이 되는데 이건 URL이 아니다 → `new URL()`이 `Invalid URL`을 던진다. 모듈 최상위에서
터지므로 `next build`뿐 아니라 `next dev`의 OG 렌더도 함께 죽는다.

> 한동안 «사용자 경로에 공백이 있어서»로 알고 있었으나 **틀린 진단이었다.**
> 공백 없는 경로에서도 똑같이 터진다 — Windows면 무조건이다.

- [`scripts/patch-og-windows.mjs`](scripts/patch-og-windows.mjs) — 문제의 세 줄을
  `new URL("./파일", import.meta.url)` 형태로 바꾼다. `postinstall`로 자동 실행.
- **운영 동작은 한 바이트도 바뀌지 않는다.** 치환된 코드는 리눅스에서 정확히 같은
  파일을 가리키고, OG 이미지는 지금처럼 빌드 시점에 정적으로 생성된다
  (`○ /opengraph-image`). 요청 시점 생성(`runtime = 'edge'`)이나 정적 PNG 커밋도
  검토했지만, 둘 다 Windows 개발 환경 문제를 고치자고 운영을 건드리는 선택이었다.
- 스크립트는 **설치를 절대 실패시키지 않는다**(항상 exit 0). 못 고쳐도 리눅스에서는
  원래 코드가 잘 돌기 때문에 배포를 막는 쪽이 더 위험하다. 멱등이라 여러 번 돌아도 된다.
- Next를 15+로 올리면 이 패치는 불필요해진다 — 그때 스크립트째 지우면 된다.

### ② `eslint` — 설정 파일이 설치된 버전과 맞지 않았다

`eslint.config.mjs`는 create-next-app이 만들어 준 그대로였는데, **플랫 설정을 직접
내보내는 최신 `eslint-config-next`를 전제로** 쓰여 있었다. 실제로 깔린 14.2.35는 여전히
eslintrc 스타일이라 `ERR_MODULE_NOT_FOUND`로 죽었다(초기 커밋부터 그대로).

감싸는 것만으로는 부족했다 — **14는 peer가 `eslint ^7 || ^8`이라 ESLint 9를 아예
지원하지 않는다.** 규칙 두 개가 ESLint 9에서 사라진 API를 부른다.

| 문제 | 조치 |
|---|---|
| `eslint-config-next@14`가 플랫 설정 미지원 | `FlatCompat`으로 감쌈 |
| `@next/eslint-plugin-next@14` → `context.getAncestors is not a function` | lint 전용 devDependency만 `eslint-config-next@15`로 (Next 런타임은 14 그대로) |
| `eslint-plugin-react-hooks` 2023년 canary → `context.getScope is not a function` | `overrides`로 v5 안정판 고정 |

한 번도 검사된 적 없는 코드베이스치고는 깨끗해서, 나온 지적은 7건뿐이었고 전부 고쳤다.

- `components/Header.tsx` — `<a href="/#quote">` → `<Link>` (전체 새로고침 방지)
- 안 쓰는 import 3건, `sw.js`의 빈 `catch (e)` 2건, 익명 default export 1건

> `components/Header.tsx`와 `components/sections/QuoteForm.tsx`는 **어디서도
> import되지 않는다** — 1b 재구축 때 `components/redesign/`로 옮겨 가며 남은 잔재다.
> 이번에는 lint만 맞추고 남겨 뒀다. 삭제는 별도로 판단할 것.

---

## 2026-08-04 — 어드민을 사이트와 같은 디자인 시스템으로 이관

사이트 본문은 «1b 블루프린트»로 전부 옮겼는데 어드민만 옛 팔레트(네이비 `#0F2E4D` ·
둥근 모서리 · 슬레이트 회색)에 남아 있었다. 사장님은 «사이트 보기»와 어드민을 하루에도
여러 번 오가는데 두 화면이 서로 다른 제품처럼 보였다. 더 나쁜 것은 **편집 화면이 실제
사이트 구조와 어긋나 있었던 것** — 고쳐도 화면이 바뀌지 않는 칸이 10개쯤 있었다.

### 디자인 — 토큰·프리미티브를 사이트와 공유
- [`components/admin/admin.css`](components/admin/admin.css) — 어드민 전용 레이어.
  토큰·유틸리티(`.blueprint`/`.corner`/`.bp-table`/`.bp-input`/`.bp-seg`/`.display`/
  `.mono-num`)는 [`blueprint.css`](components/redesign/blueprint.css)를 그대로 쓰고,
  대시보드에만 필요한 것(사이드 레일·패널·버튼·칩·알림 상자·스위치)만 얹었다.
  규칙은 전부 `.admin-theme` 아래에 가둬 로드 순서에 의존하지 않는다.
- [`components/admin/ui.tsx`](components/admin/ui.tsx) — 공용 프리미티브
  (`Panel`·`Notice`·`Chip`·`StatTile`·`Field`·`Switch`·`Segmented`).
  화면마다 손으로 반복하던 카드 마크업을 한곳으로 모았다.
- 테마는 [`app/admin/layout.tsx`](app/admin/layout.tsx)가 씌운다 — 로그인·권한 없음·
  대시보드가 모두 같은 팔레트를 쓴다.
- 사이드 레일에 **메뉴 번호(`01`~`07`)** 를 붙였다. 사이트 본문이 섹션을 «01 사업영역»
  처럼 부르므로 같은 언어를 쓰고, [사용법 문서](docs/어드민_사용법.md)의 장 번호와도 일치한다.
- 정합 마크(`+`)는 «그 화면의 주인공»에만 켠다(수치 타일·발행 버튼·로그인 카드).
  패널마다 켜면 도면이 아니라 잡음이 된다.
- 차트 색을 액센트 계열로 옮겼다(`#416180` ↔ `#C2620E`). 파랑↔주황은 색각 이상에서도
  구분되는 조합이고, 파랑을 블루프린트 액센트에 맞춰 팔레트 밖으로 나가지 않게 했다.

### 구조 — 편집 화면을 실제 사이트와 일치시킴
재구축 뒤 화면에서 사라졌는데 편집 칸만 남아 있던 항목을 [`lib/content/schema.ts`](lib/content/schema.ts)
의 `SECTION_DEFS`에서 뺐다. **기본값(`CONTENT_DEFAULTS`)은 그대로 두어 저장된 값은 잃지 않는다.**

| 뺀 것 | 이유 |
|---|---|
| 섹션별 `작은 머리말(eyebrow)` 7개 | 새 섹션 머리는 «번호 + 제목 + 보조 설명»이라 자리가 없다 |
| 헤더 `로고 아래 한 줄` | 헤더가 로고 이미지 + 상호로 바뀌며 사라졌다 |
| 히어로 `고객 유형 안내 링크`·`아이콘` | 새 히어로가 쓰지 않는다 |
| 연락처 `제목`·`설명` | 제목("연락처"·"오시는 길")이 고정으로 바뀌었다 |
| **푸터 섹션 전체** | 등록번호 줄만 남아 편집 대상이 없다 |
| 검색엔진 `공유 이미지 문구` | OG 이미지 문구가 고정으로 바뀌었다 |

- 히어로 미리보기 앵커를 `hero` → `top`으로 고쳤다. 실제 섹션 id가 `top`이라
  **미리보기가 히어로로 스크롤되지 않고 있었다.**
- 빠른 견적 접수 영역에 `id="quick"`을 주고 앵커를 연결했다
  ([`QuickQuoteBar.tsx`](components/redesign/home/QuickQuoteBar.tsx)).
- «여기서 못 바꾸는 것» 안내에 **시공 실적 원장·푸터**를 명시했다. 못 바꾸는 것을
  적어두지 않으면 찾다가 없는 메뉴를 찾게 된다.

### 실제 화면을 띄워 보고 고친 것
로컬에 실 데이터를 연결해(`vercel env pull`) 전 화면을 확인하고 잡은 것들이다.

- **CTA 버튼 성과가 표 12개로 늘어져 있었다.** 변형이 하나뿐인 자리는 «비교»할 것이
  없는데도 자리마다 한 줄짜리 표를 그려서, 정작 실험 중인 자리가 묻혔다. 단일 문구는
  한 표로 모으고 실험 중인 자리만 따로 펼친다. 대시보드 길이가 2,834px → 1,870px.
- **집계에만 잡히는 자리 이름이 영문 id로 보였다** (`service_card_factory`,
  `quick_bar_submit` …). 1b 재구축에서 사업영역 카드·서비스 상세·실적 상세·퀵폼에
  `data-cta-slot`을 새로 달았는데 이름표가 없었다.
  [`ctaSlotLabel()`](lib/cta/schema.ts)로 한국어 이름을 붙였다(접두사 + 공종 조합).
- **CTA 편집의 «색상» 선택을 뺐다.** 블루프린트에는 강조색이 액센트 하나뿐이라 어느
  값을 골라도 화면이 같았다. 타입·DB 컬럼은 남겨 둔다.
- 정합 마크(`+`)는 상자 바깥 6px에 그려진다. 수치 타일·편집 카드 그리드 간격이
  12·14px이라 옆 상자의 마크와 겹쳐 «+»가 두 개씩 붙은 것처럼 보였다 → 24·28px로.
- 페이지 머리에서 `justify-content: space-between`을 걷어냈다. 폰에서 줄이 접히면
  «01»과 제목이 양 끝으로 벌어져 한 덩어리로 읽히지 않았다.

---

## 2026-08-03 — 비밀번호 재설정이 아예 동작하지 않던 문제

재설정 메일의 링크를 열면 `localhost` 연결 거부로 끝났다. 원인이 둘이었고 **둘 다**
고쳐야 했다.

### 원인 1 — Supabase Site URL이 기본값 그대로 (프로젝트 설정)
`site_url`이 프로젝트 생성 이후 한 번도 바뀌지 않은 `http://localhost:3000`이었다.
대시보드에서 보내는 복구 메일은 이 값을 기준으로 되돌아올 주소를 만든다.
`uri_allow_list`는 아예 비어 있어서, 앱이 `redirectTo`를 지정해도 무시됐을 것이다.

- `site_url` → `https://www.wnjpower.com`
- `uri_allow_list` → `https://www.wnjpower.com/**,https://wnjpower.com/**,http://localhost:3000/**`
  (apex도 넣는다 — www로 308 리다이렉트되지만 허용목록 검사는 그 전에 일어난다)

### 원인 2 — 링크가 도착할 라우트가 없었다 (코드)
[`middleware.ts`](middleware.ts)가 예전부터 `/admin/auth`를 비로그인 통과 경로로 열어
두었는데 정작 그 라우트를 만든 적이 없었다. **Site URL만 고쳐도 해결되지 않는다** —
링크는 홈으로 떨어지고 아무 일도 일어나지 않는다. 비밀번호 찾기 UI도 없었다.

- [`app/admin/auth/callback/route.ts`](app/admin/auth/callback/route.ts) — 이메일 링크를
  세션으로 바꾼다. 형식 세 가지를 모두 받는다: `token_hash`(기기 무관) / `code`(PKCE,
  요청한 브라우저에서만) / 프래그먼트(서버로 오지 않아 아래 화면이 처리).
  `next`는 `/admin` 하위로만 허용해 오픈 리다이렉트를 막는다. Vercel 프록시 뒤라
  `x-forwarded-host`로 공개 도메인을 계산한다(내부 주소로 되돌리면 링크가 죽는다).
- [`app/admin/auth/reset-password/page.tsx`](app/admin/auth/reset-password/page.tsx) —
  새 비밀번호 설정. 프래그먼트로 온 토큰을 세션으로 바꾸고 **주소창에서 토큰을 지운다**.
  세션이 없으면 조용히 실패하지 않고 «링크 만료»를 분명히 알리고 재발송 버튼을 준다.
- [`app/admin/login/page.tsx`](app/admin/login/page.tsx) — «비밀번호를 잊으셨나요?» 추가.
  발송 결과는 성공/실패를 구분하지 않는다 — 구분하면 가입된 이메일을 캐낼 수 있다.
- [`components/RecoveryLinkCatcher.tsx`](components/RecoveryLinkCatcher.tsx) — 대시보드에서
  보낸 메일은 되돌아올 주소로 Site URL을 그대로 쓴다(우리 콜백을 지정할 방법이 없다).
  그래서 홈에 토큰만 매달린 채 떨어지는데, 이를 재설정 화면으로 넘긴다. 토큰이
  프래그먼트에 있어 서버로 오지 않으므로 브라우저에서만 할 수 있는 판단이다.
  프래그먼트에 recovery 토큰이 있을 때만 동작하며 평소 방문자에게는 아무 일도 없다.

### 이어서 — 메일 템플릿 교체 + Resend SMTP 연결
기기 제약(«요청한 브라우저에서만 열림»)을 없애려고 복구 메일 템플릿을 `{{ .TokenHash }}`
형식으로 바꾸려 했으나 Supabase가 거부했다.

> Email template modification is not available for free tier projects
> using the default email provider.

무료 tier + 기본 발송기 조합에서는 템플릿을 못 바꾼다. 확인하는 김에 더 큰 문제가
드러났다 — **`rate_limit_email_sent`가 시간당 2통**이었다. 기본 발송기는 개발용이라
이렇게 묶여 있고, 재설정을 두어 번 재시도하면 그 시간 동안 메일이 아예 오지 않는다.

이미 견적 알림에 쓰던 **Resend를 SMTP로 연결**해 셋을 한 번에 해결했다(추가 비용 없음).

- SMTP: `smtp.resend.com:465` / user `resend` / pass = `RESEND_API_KEY`
- 발신: `quote@wnjpower.com` (표시 이름 «우앤주전력»).
  Resend 키가 **발송 전용 제한 키**라 도메인 목록을 조회할 수 없어, 추측 대신
  프로덕션에서 배달이 검증된 이 주소를 그대로 썼다.
- 시간당 발송 한도 2 → 30
- 템플릿: 한국어 + `{{ .TokenHash }}` 링크. 원본을
  [`supabase/email-templates/recovery.html`](supabase/email-templates/recovery.html)에
  보관한다(템플릿은 저장소가 아니라 프로젝트 설정에 저장되므로 사본이 없으면 복구 불가).

**검증**: `admin/generate_link`로 메일 발송 없이 실제 토큰만 발급받아
`/admin/auth/callback?token_hash=…&type=recovery`를 호출 → 307로
`/admin/auth/reset-password`로 이동하는 것을 확인했다. 즉 `verifyOtp` 경로가
실제 Supabase 토큰을 받아들인다. 이제 **어느 기기에서 열어도 된다.**

---

## 2026-07-31 — 실시간 알림: CTA 버튼 클릭 → 사장님 휴대폰·PC 팝업

방문자가 사이트의 **CTA 버튼(전화·카카오톡·견적문의 등)을 누르는 순간** 사장님 기기에
알림 팝업이 뜬다. 브라우저 표준 웹 푸시(VAPID)라 **추가 비용이 없고**, 사이트를 닫아 둔
상태·화면이 꺼진 상태에서도 도착한다. 운영 방법은
[`docs/어드민_사용법.md`](docs/어드민_사용법.md) 7번에 정리했다.

> ⚠️ **적용 전 필수**: `supabase/push-schema.sql` 실행 + 환경변수 3개
> (`NEXT_PUBLIC_VAPID_PUBLIC_KEY` · `VAPID_PRIVATE_KEY` · `SUPABASE_SERVICE_ROLE_KEY`).
> 셋 중 하나라도 없으면 **알림만 조용히 꺼지고 사이트·견적 접수는 그대로 동작**한다.
> 키 생성은 `npm run push:keys`.

### 동작
- 수집 경로에 얹었다. `/api/track`가 받는 클릭 이벤트(`cta_click`·`phone_click`·
  `kakao_click`·`form_start`)와 `/api/quote`의 접수(`lead`)가 그대로 알림 트리거가 된다.
  버튼 쪽 코드는 한 줄도 건드리지 않았다 — 이미 모든 CTA에 `data-cta-slot`이 붙어 있고
  [`Tracker.tsx`](components/analytics/Tracker.tsx)가 클릭을 잡고 있었기 때문이다.
- 견적문의 알림은 **`/api/quote`에서만** 보낸다. 거기엔 고객 이름·연락처가 있어 알림
  하나로 판단이 끝난다. `/api/track`의 `lead`는 제외했다 — 안 그러면 한 건에 두 번 울린다.
- 알림을 누르면 해당 화면이 열린다(문의는 `/admin/leads`, 클릭은 `/admin`).
  이미 열린 어드민 창이 있으면 새 창을 띄우지 않고 그 창을 쓴다.

### 알림 피로 방지 — 세 겹으로 거른다
알림은 많을수록 좋은 게 아니다. 잦으면 며칠 안에 꺼버리고, 그러면 정작 견적문의도 놓친다.
- **종류 선택** — 어드민에서 켠 이벤트만. '그 밖의 버튼 클릭'은 끄기 쉽게 따로 뒀다.
- **반복 억제** — 같은 방문자·같은 종류는 설정 간격(기본 30분) 안에 한 번만.
  판정은 `events` 테이블을 보는데, **INSERT 전에** 조회해야 방금 넣은 행이
  "이미 알림" 으로 잡히지 않는다(`app/api/track/route.ts`의 순서를 바꾸지 말 것).
- **방해금지 시간** — 설정 시간대에는 클릭 알림을 보내지 않는다.
  **견적문의 접수만은 예외**로 항상 보낸다.

### 어드민 (`/admin/notifications`)
- 기기마다 [이 기기에서 알림 받기] 한 번. 휴대폰·PC 여러 대를 동시에 등록할 수 있다.
- **[시험 알림 보내기]** — 이 기능은 "설정을 다 했는데 안 온다"가 가장 흔한 실패라,
  권한·구독·키·푸시 서비스 중 어디가 막혔는지 즉시 확인할 수단을 화면에 뒀다.
- 기기 목록에 마지막 도착 시각·연속 실패·오류 메시지를 그대로 노출한다.
  브라우저가 구독을 폐기하면(404/410) 자동으로 목록에서 내리고 배지로 알린다.
- 아이폰은 **홈 화면에 추가한 뒤**에만 알림이 가능하다(iOS 16.4+ 애플 정책).
  아이폰에서 접속하면 그 안내가 화면에 뜨고, 이를 위해 [`app/manifest.ts`](app/manifest.ts)를 추가했다.
- **설정 UI는 스위치 + 자동 저장**이다. 체크박스는 폰에서 누르기 어렵고, 무엇보다 저장 버튼을
  두면 스위치만 넘기고 나가는 실수가 반드시 나온다. 그러면 껐다고 믿는데 알림은 계속 오고
  원인을 찾을 방법이 없다. 줄 전체가 버튼이며, 색만으로 상태를 알리지 않도록 «켜짐/꺼짐»
  글자를 함께 둔다. 저장 결과는 «저장 중 / 저장됨 / 실패(다시 시도)»로 항상 보인다.

### 보안 — service_role 키를 한 곳에만 도입
- 알림을 보낼 시점의 요청 주체는 **로그인하지 않은 방문자**다. 그 요청에서 기기 목록을
  읽어야 하는데, 익명(anon)에게 열면 사장님 기기의 푸시 주소가 공개된다. 그래서
  **발송 경로에만** service_role을 쓴다([`lib/supabase-service.ts`](lib/supabase-service.ts) —
  브라우저에서 import되면 예외를 던져 유출을 런타임에서 막는다).
- 어드민 화면의 조회·저장은 종전대로 **로그인 JWT + RLS**로 나간다. 두 테이블 모두
  익명 권한 0, 관리자만 접근하는 정책이다.
- 서비스워커([`public/sw.js`](public/sw.js))에는 **fetch 핸들러를 두지 않았다.**
  캐싱까지 하면 사장님이 [발행]한 내용이 방문자에게 옛 화면으로 남는 사고가 난다.

### 변경 파일
- 신규: `supabase/push-schema.sql` · `lib/push/{config,send,dispatch}.ts` ·
  `lib/supabase-service.ts` · `public/sw.js` · `app/manifest.ts` ·
  `app/api/push/{route,subscribe,test,key}` · `app/admin/(dashboard)/notifications/page.tsx` ·
  `components/admin/PushManager.tsx` · `scripts/generate-vapid-keys.mjs`
- 수정: `app/api/track/route.ts`(알림 트리거) · `app/api/quote/route.ts`(접수 알림) ·
  `components/admin/AdminNav.tsx`(메뉴) · `.env.example` · `package.json`(`web-push`)

---

## 2026-07-31 — 관리형 전환: 어드민 CMS · 실시간 분석 · CTA 실험 · 게시판 · 자동 색인

개발자 없이 마케팅을 운영할 수 있도록 사이트를 **관리형 구조로 전환**했다.
사장님이 직접 문구·사진·버튼을 바꾸고, 광고 성과를 보고, 검색 유입용 글을 쓸 수 있다.
운영 방법은 [`docs/어드민_사용법.md`](docs/어드민_사용법.md)에 정리했다.

> ⚠️ **적용 전 필수**: Supabase SQL Editor에서 `supabase/admin-schema.sql` →
> `supabase/analytics-functions.sql` 순서로 실행하고, 관리자 계정을 `public.admins`에
> 등록해야 어드민이 동작한다. 실행 전까지 **공개 사이트는 코드 기본값으로 정상 동작**한다.

### 콘텐츠 편집 (`/admin/content`)
- [`lib/content/schema.ts`](lib/content/schema.ts) **한 파일이 기본값·타입·어드민 폼을 동시에 정의**한다.
  필드를 늘릴 때 어드민 화면 코드를 건드릴 필요가 없다.
- DB(`site_content`) 값을 코드 기본값 위에 병합하므로, **DB가 비어 있거나 죽어 있어도
  사이트는 그대로 동작**한다(빌드 중 DB 접속 실패 시 기본값으로 렌더되는 것을 확인).
- 초안(`site_drafts`)과 발행본(`site_content`)을 **테이블로 분리**했다. 한 테이블에
  draft/published 컬럼을 두면 "익명은 published 컬럼만"을 RLS로 표현할 수 없어
  미발행 문구가 새어나간다.
- 편집 화면은 좌측 폼 / 우측 실제 사이트 iframe. 입력을 멈추면 1.5초 뒤 자동 임시 저장 →
  미리보기 갱신. 반영은 [발행]을 눌러야 하며 **재배포 없이 즉시** 적용된다(`revalidateTag`).
- 홈 섹션 전체가 콘텐츠 소비형으로 리팩터됨(Hero·Services·WhyUs·Process·Pricing·Faq·
  Quote·Contact·Footer·Header). 사업자 등록번호류는 **의도적으로 편집 대상에서 제외**했다.

### 실시간 분석 (`/admin`)
- 자체 이벤트 수집(`events`) + GA4 병행. GA4의 지연·표본 문제 없이 **15초 주기로 갱신**된다.
- 유입 경로 판정은 [`lib/analytics/attribution.ts`](lib/analytics/attribution.ts) 한 곳에서만 한다.
  UTM 우선, 없으면 referrer. `gclid`·`fbclid`·`n_ad_group` 같은 광고 클릭 식별자도 인식한다.
- **last non-direct click** 귀속(90일). 광고로 들어왔다가 나중에 직접 방문해 문의해도
  광고 성과로 남는다. 귀속 정보는 리드 행(`quotes`)에 복사 저장해 이벤트 보관기간(180일)이
  지나도 성과가 사라지지 않는다.
- 집계는 전부 DB 함수([`supabase/analytics-functions.sql`](supabase/analytics-functions.sql)).
  원본을 브라우저로 내려받아 집계하면 데이터가 쌓이는 순간 어드민이 멈춘다.
- 알림 메일에도 **유입 경로·캠페인**이 표시된다.

### CTA 실험 (`/admin/cta`)
- 슬롯 8곳(헤더·히어로·비용·폼·플로팅 등)의 문구·색·링크·아이콘을 어드민에서 직접 편집.
- 같은 슬롯에 변형을 추가하면 A/B 실험. **세션 ID 해시로 고정 배정**해 새로고침 시 버튼이
  바뀌지 않고, 서버에서 확정해 내려보내므로 깜빡임(CLS)이 없다.
- 노출·클릭을 집계해 클릭률 비교. 변형당 노출 100회 미만이면 "판단하기 이릅니다"로 표시해
  **표본이 적을 때 잘못된 결론을 내리지 않도록** 막았다.

### 게시판 + 한국어 SEO 글쓰기 도우미 (`/admin/posts`)
- `posts` 테이블 하나로 블로그(`/blog`)·공지(`/notice`)·시공실적(`/portfolio`) 운용.
  기존 파일 기반 시공실적 원장은 그대로 두고 **DB 글을 함께 노출**해 하위 호환을 지켰다.
- [`lib/seo/analyze.ts`](lib/seo/analyze.ts) — RankMath/Yoast식 실시간 점검(0~100점).
  영어권 기준(300 단어·수동태·전환어)을 그대로 쓰지 않고 **한국어 기준으로 재조정**했다:
  본문 글자 수(600/1,500자), 제목 15~35자, 메타 70~90자, 어절 기준 키워드 밀도.
  한국어 신뢰도가 낮은 수동태·전환어 검사는 넣지 않았다.
- 검색 결과 미리보기, 포커스 키워드 위치 점검(제목·메타·첫 문단·소제목·이미지 alt),
  내부/외부 링크, 이미지 alt 누락 검사.
- Article JSON-LD, `/feed.xml` RSS, sitemap 자동 반영.

### 자동 색인 제출
- 발행 시 **IndexNow**로 네이버 서치어드바이저·Bing에 자동 제출([`lib/indexnow.ts`](lib/indexnow.ts)).
  제출 이력은 `/admin/seo`에서 확인.
- **구글은 IndexNow 미참여**이고 공식 Indexing API도 채용공고·방송 전용이라 일반 페이지에는
  쓸 수 없다. 대신 sitemap `lastmod`를 **글의 실제 수정 시각**으로 내보내도록 고쳤다
  (기존에는 전 항목이 빌드 시각이라 변경 신호로서 의미가 없었다).

### 크로스브라우징
- Tailwind v4는 Safari 16.4+/Chrome 111+/Firefox 128+를 요구한다. 그 미만에서는 화면이
  깨진 채 렌더되므로, `@supports`로 기능을 검사해 **안내 띠 + 전화번호**를 노출한다
  (UA 판별이 아니라 기능 검사라 브라우저가 새로 나와도 오탐이 없다).
- 카카오톡·네이버 인앱 브라우저 대응: iOS 16px 미만 입력창 자동 확대 방지, `safe-area-inset`
  하단 여백, `-webkit-tap-highlight-color` 제거, `text-size-adjust` 고정, 가로 넘침 차단.
- 대시보드에 **기기·브라우저 분포**를 넣어 인앱 브라우저 비중을 실제 수치로 확인할 수 있게 했다.
- `browserslist` 명시, `viewport` export(`viewportFit: cover`), 404 페이지 추가.

### 보안
- Supabase Auth + `public.admins` 화이트리스트. 계정이 있어도 화이트리스트에 없으면 권한 없음.
- **service_role 키를 도입하지 않았다.** 어드민도 로그인 사용자의 JWT로 접근하므로
  DB의 RLS(`is_admin()`)가 최종 방어선이다. 앱 코드에 구멍이 나도 데이터가 새지 않는다.
- `is_admin()`은 `security definer` + `search_path` 고정(미고정 시 권한 상승 경로가 열린다).
- 이벤트 수집 API는 클라이언트가 보낸 유입 정보를 믿지 않고 **서버가 쿠키에서 읽는다**.
  그대로 믿으면 조작된 광고 성과가 쌓인다.
- 어드민 `robots: noindex` + `robots.txt` `/admin` 차단.

### 기타 수정
- `app/opengraph-image.tsx` — 폰트 CDN 실패 시 예외로 **배포 전체가 실패**하던 것을
  기본 글꼴 폴백으로 완화.
- 미사용 `content/faq.ts` 제거(어드민 편집으로 이관). `ClickTracking` → `Tracker`로 통합.

---

## 2026-07-22 — 리드 알림 파이프라인 프로덕션 라이브 · 사업영역 3대 개편

**리드 알림 라이브 확정.** Resend 환경변수 정정 후 프로덕션 재배포(`git push` 자동 배포)로
실배포에 반영. 콜백 퀵폼(번호만 남기는 이탈 회수 경로, `source='callback'`) 정상 작동 확인 —
견적폼·콜백폼 모두 `/api/quote`를 타고 **Supabase 저장 + 사장님 Naver 메일 발송**이 라이브.
카카오 알림톡 연동은 추후 선택 항목으로 [`TODO.md`](TODO.md)에 정리(코드는 준비 완료).

**홈 사업영역 4대 → 3대 개편.** 고압 수전설비·계약전력 증설은 협력업체 의존 형태라 독립
'주력' 카드에서 제외하고, 공장·산업 전기공사 카드의 하위 항목('계약전력 증설·수전설비 연계
시공')으로 편입 — 공사 가능함은 유지. `/services/power` 상세페이지·푸터 링크·견적폼 옵션은
SEO 위해 유지(홈 카드에서만 제외). (`content/services.ts`·`Services.tsx`, 커밋 6cf84b1)

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
