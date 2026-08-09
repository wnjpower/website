# 우앤주전력 웹사이트 — 남은 작업

> **프로덕션**: https://www.wnjpower.com (apex → www 308 리다이렉트)
> **GitHub**: https://github.com/wnjpower/website · **Vercel**: `wnjpower-erp` 팀 / `wnj-website`
> **Supabase**: `wnj-website` (서울 `ap-northeast-2`, ref `wtlvbilsakoktcrrqlfi`)
> **최종 업데이트**: 2026-08-09

> ✅ **완료된 변경 이력은 [`CHANGELOG.md`](CHANGELOG.md)** 참조.
> 이 문서는 아직 끝나지 않은 항목만 추적한다.

---

## 2026-08-05 세션 요약 — 무엇이 끝났나

커밋 11개가 master에 들어갔다(PR #1~#4). 시작은 어드민 개편이었는데,
**검증하려다 이 저장소가 초기 커밋부터 `npm run build`·`npm run lint`가 한 번도
성공한 적 없다는 것을 발견한 것**이 분기점이었다.

| | 한 일 | 커밋 |
|---|---|---|
| ① | 어드민을 1b 블루프린트로 이관 + 편집 스키마 동기화 | `2b579f4` |
| ② | 죽어 있던 `build`·`lint` 복구 | `87cce89` |
| ③ | 1b 잔재 정리 — 파일 29개·2,799줄·패키지 4개 | `aef00b8` `613550b` `0cbbab1` |
| ④ | 공지 띠 액센트 통일 + 옛 팔레트 제거 + 미사용 export 6개 | `2791bd1` |
| ⑤ | Next.js 14 → 15 (React 19) | `059ed3f` |
| ⑥ | DB 잔재 정리 — 옛 JSON 키·`footer` 행 | `049c880` |

**이 문서에서 지운 항목들** — 위 작업으로 해소되어 더 이상 추적하지 않는다:
서브페이지 1b 이관(전 페이지 `SubPageShell` = 블루프린트) · 구 컴포넌트 정리 ·
`@vercel/og` 로컬 빌드 실패(Next 15가 업스트림에서 수정) · 관리자 계정 등록(2명) ·
어드민 배포.

> ⚠️ **이전 판(2026-07-31)의 파일 위치 참조표는 10개 중 9개가 깨져 있었다.**
> `components/sections/*` · `components/ui/section.tsx` · `components/Header.tsx` ·
> `components/ClickTracking.tsx` · `content/faq.ts` 등 이미 없는 경로였다.
> 맨 아래 표를 **실제 파일 존재를 확인하며** 다시 만들었다.

---

## 2026-08-06 세션 — 코드 잔재가 소진됐다

TODO에 남아 있던 «코드로 처리 가능한» 항목을 전부 끝냈다. 상세는
[`CHANGELOG.md`](CHANGELOG.md) 2026-08-06 항목.

| | 한 일 | 비고 |
|---|---|---|
| ① | `ctas.style` 컬럼 삭제 | Supabase MCP가 이번엔 동작해 적용 — 마이그레이션 2/2 완료 |
| ② | `CONTENT_DEFAULTS` 죽은 필드 22개 제거 (76 → 54) | 「고쳐도 화면이 그대로인 칸」 0개 |
| ③ | `public/` 미참조 파일 6개 삭제 | 남은 파일은 전부 참조처 확인 |
| ④ | 어드민 레일의 마지막 "+" 정합 마크 제거 | `d7912c8`이 놓친 파일 |

**이 문서에서 지운 항목** — 위 작업으로 해소: `ctas.style` 삭제 ·
`public/` 기본 파일 6개 · `CONTENT_DEFAULTS` 죽은 필드.

> **남은 것은 대부분 «사장님·외부 계정이 있어야 하는 일»이다.** 아래 🔴 3건과
> 🟡 콘텐츠·SEO 항목이 그렇다. 코드 쪽은 판단 대기(디자인·기획) 항목만 남았다.

---

## 🔴 지금 바로

- [ ] **🔴 Supabase 유출 비밀번호 차단(Leaked Password Protection) 켜기**
      **2026-08-06에도 꺼져 있음을 재확인했다**(보안 권고 조회). 관리자 계정이
      견적문의 DB 전체의 유일한 관문인데 HaveIBeenPwned에 올라온 비밀번호도
      그대로 통과된다. Supabase → Authentication → Policies → 활성화. 클릭 한 번.
      > 이건 대시보드 전용 설정이라 코드·MCP로는 켤 수 없다. **지금 남은 보안
      > 권고 중 실제로 조치가 필요한 유일한 항목이다** (아래 «확인 완료» 참조).

- [ ] **실시간 알림 기기 등록** — `/admin/notifications`에서 **휴대폰·PC 각각**
      [이 기기에서 알림 받기] → [시험 알림 보내기]로 도착 확인.
      코드·키·SQL·환경변수는 전부 완료됐고 기기 등록만 남았다.
      - 아이폰은 사파리 [공유] → [홈 화면에 추가] 후 **그 아이콘으로 들어와서** 켜야 한다
        (iOS 16.4+ 애플 정책, 우회 불가)
- [ ] **알림 실사용 점검** — 며칠 써 보고 잦으면 '그 밖의 버튼 클릭'을 끄거나
      반복 억제 간격을 늘린다. 밤에 방해되면 방해금지 시간(예: 22~07) 설정

- [ ] **광고 링크에 UTM 붙이기** (사장님/광고 담당)
      `?utm_source=naver&utm_medium=cpc&utm_campaign=이름`.
      특히 **`utm_medium=cpc`가 빠지면 유료 광고가 자연 검색으로 잡힌다.**

---

## 🟠 남긴 코드 잔재 — 이제 하나뿐

- [ ] **`components.json`의 `utils` 별칭** — 사라진 `@/lib/utils`를 가리킨다.
      shadcn CLI가 컴포넌트를 새로 받을 때만 보는 값이라 그대로 뒀다
      (그때 CLI가 파일을 다시 만든다). `shadcn` devDependency와 이 파일은
      `globals.css`의 `@import "shadcn/tailwind.css"`와 토스트가 계속 쓰므로 유지.

## ✅ 확인 완료 — 다시 조사하지 말 것

조사해 보니 문제가 아니었던 것들. 같은 걸 두 번 파지 않도록 결론만 남긴다.

- **Supabase 보안 권고의 `SECURITY DEFINER` 경고 3건은 악용 불가** (2026-08-06 확인)
  - `rls_auto_enable()` — 이벤트 트리거 함수라 권한과 무관하게 직접 호출이 거부된다.
    실제로 호출해 확인했다: `ERROR 0A000: trigger functions can only be called as triggers`
  - `prune_events(keep_days)` — 첫 문장이 `is_admin()` 검사이고 아니면 `42501`로 중단
  - `is_admin()` — 호출자 «본인»의 관리자 여부만 돌려준다
- **`public/`에 남은 파일은 전부 참조처가 있다** (2026-08-06 확인) —
  `app-icon-512.png`→manifest · `logo.png`·`logo-mark.png`→헤더/SchemaOrg ·
  `factory-electrical.jpg`·`switchgear.jpg`→SchemaOrg · `sw.js`→푸시 ·
  `7cc4061689…txt`→IndexNow 키
- **편집 화면(`SECTION_DEFS`)과 기본값(`CONTENT_DEFAULTS`)은 양방향으로 일치한다**
  (2026-08-06 확인) — 편집 칸이 가리키는 값이 전부 존재하고, 기본값의 모든 값이
  편집 가능하다. 「고쳐도 화면이 그대로인 칸」이 0개다.
  > ⚠️ **이건 `tsc`가 못 잡는다.** `FieldDef.key`가 `string`이라 없는 키를 가리켜도
  > 타입 오류가 아니다. 스키마를 손볼 때는 런타임 대조로 확인할 것.

## 🟠 Next.js 15 이후 — 지켜볼 것

- [ ] **First Load JS 87.3 kB → 103 kB (+15.7 kB)** — React 19 런타임이 커진 몫이고
      애플리케이션 코드 증가가 아니다. Next 15가 React 19를 요구하므로 되돌릴 수 없다.
      모바일 유입이 많은 리드 제너레이션 사이트이니 **Vercel Analytics에서 실사용
      지표를 며칠 지켜볼 것.**
- [ ] **Next 16 검토(선택)** — 16부터 `eslint-config-next`가 플랫 설정을 직접
      내보내므로 [`eslint.config.mjs`](eslint.config.mjs)의 `FlatCompat`과
      `@eslint/eslintrc` 의존을 걷어낼 수 있다. 급하지 않다.
- [ ] **CI를 붙인다면 `tsc`와 `build`를 둘 다 돌릴 것.**
      Next 15 전환 때 `npx tsc --noEmit`은 **통과**했는데 빌드의 라우트 타입 검사가
      `admin/leads`의 `searchParams`를 잡아냈다. `tsc`는 소스만, 빌드는
      `.next/types`의 라우트 계약까지 본다 — **둘이 보는 범위가 다르다.**

## 🟠 1b 이관 — 남은 판단 (디자인·기획)

- [ ] **콜백폼 폐지 판단** — 퀵폼이 대체하지만 스펙 §5는 2주 병행 후 지표로 결정하라고
      한다. `source`별 전환율(`quick_bar` vs `main_form`)로 비교할 것.
      > 참고: 옛 `CallbackForm.tsx`는 이번 정리에서 삭제됐다(어디서도 쓰이지 않았다).
      > 즉 사실상 이미 폐지 상태이며, 남은 것은 «되살릴지» 판단이다.
- [ ] **서비스 상세에서 빠진 것** — 원본 디자인이 의도적으로 뺀 항목. 되살릴지 판단.
      - **페이지 내 견적폼** — 지금은 홈(`/#quote`)으로 보낸다. 공종별 리드 귀속이
        끊기므로 CTA 클릭에 `service_cta_{slug}` 슬롯을 달아 클릭까지는 집계한다.
      - **관련 시공 사례 3건** — `/portfolio/*`로 가던 문맥 내부링크가 사라졌다.
- [ ] **한글 서체** — 스펙은 IBM Plex Sans KR을 지정하지만 이미 전역으로 싣는
      Pretendard를 한글 폴백으로 썼다(한글 웹폰트 2벌 = 모바일 첫 화면 지연).
      디자이너 확인 필요. ([`lib/fonts.ts`](lib/fonts.ts))
- [ ] **홈 모바일(900px 미만) 실기기 확인** — 미디어쿼리·하단바·safe-area가 배포물에
      들어간 것은 확인했으나 실기기로 보지는 못했다.
- [ ] **제도 수치 실무 검수** — 계약전력 기준(저압 100kW), 시설부담금 기본거리
      (공중 200m·지중 50m), 사용전점검/검사 구분(75kW·100kW), 감소 후 3년 내 재증설
      면제 등. [`content/service-pages.ts`](content/service-pages.ts) 주석과 스펙 §10이
      모두 검수를 요청하고 있다.

---

## 🟡 카카오 알림톡 연동 (추후) — 코드 완료, 외부 설정만 남음

> 리드 알림의 **기본 경로(이메일)는 이미 라이브**다. 알림톡은 그 위에 얹는 선택
> 강화이며 지금 없어도 리드는 정상 전달된다. 설정 전까지는 이메일만 발송된다.

- [ ] **STEP 1** — 카카오 비즈니스 채널 개설 ([business.kakao.com](https://business.kakao.com), 인증 1~2영업일)
- [ ] **STEP 2** — Solapi 가입·API 키 발급 + 채널 연동 + 발신번호 `010-8552-9994` 등록
- [ ] **STEP 3** — 알림톡 템플릿 등록·카카오 검수 (1~3영업일, 템플릿은 `.env.example` 참고)
      - ⚠️ 콜백 접수는 이름이 `콜백 요청`으로 저장된다. 신청자 수신 템플릿의 `#{성함}`이
        어색하지 않은지 검토할 것
- [ ] **STEP 4** — Vercel 환경변수 입력 후 재배포 (입력 시 자동 활성화)
      ```
      SOLAPI_API_KEY / SOLAPI_API_SECRET / SOLAPI_PF_ID
      SOLAPI_SENDER_NUMBER=010-8552-9994
      SOLAPI_TEMPLATE_TO_REQUESTER / SOLAPI_TEMPLATE_TO_OWNER
      OWNER_MOBILE=010-8552-9994
      ```
      > ⚠️ Vercel 환경변수는 이 환경의 CLI(`vercel env add`)로는 값이 빈 채로 저장된다.
      > REST API 또는 대시보드로 입력할 것.

## 🟡 콘텐츠 — 사장님 제공 필요

- [ ] **실제 시공 사진** 6~9장 — 현재 실적은 텍스트 원장(시공 실적표)이다.
      촬영 우선순위: **배전반 설계·설치 3단계(외함→결선→완성품)** / 수전설비 /
      노후 분전반 교체 전·후 같은 앵글 / 공장 내부 전경
- [ ] **대표 사진** — 현재 `/about`은 사진 없이 인용부호 심볼로 대체 중
- [ ] **"대표 현장경력 20년+" 사실 확인** — 재구축에서 "업력 20년+"(2023 법인설립과
      모순)을 이렇게 교정했다. 실제 연수 확인 필요
- [ ] **히어로 수치 확정** — 누적 시공 건수·배전반 면수 확보 시 `hero.trustStats` 교체
      (어드민 → 홈페이지 편집 → 히어로에서 직접 수정 가능)
- [ ] **비용 기준 실제 단가** — 현재 전부 "협의 후 견적"
- [ ] **카카오톡 채널 URL / 네이버 플레이스·블로그 URL** — [`lib/site.ts`](lib/site.ts)
      한 곳만 입력하면 **연락처 섹션 버튼 + SchemaOrg `sameAs`에 동시 반영**된다
      (현재 `null`이라 버튼이 아예 렌더되지 않음).
      > 2026-08-06 수정: 이전 판은 «Contact에 자동 반영»이라 적어 뒀는데 **사실이
      > 아니었다.** 상수가 `SchemaOrg`의 `sameAs`에만 연결돼 있어 URL을 넣어도
      > 버튼이 생기지 않았다. 연락처 섹션에 실제로 구현했다.
- [ ] **FAQ 내용 검수** — 어드민 → 홈페이지 편집 → 자주 묻는 질문
      (기본값은 [`lib/content/schema.ts`](lib/content/schema.ts)의 `faq`)
- [ ] **영업시간 확정** — 현재 `평일 09:00–18:00 · 토 09:00–13:00`.
      **확정되면 [`lib/site.ts`](lib/site.ts)의 `BUSINESS_HOURS` 한 곳만 고치면 된다** —
      사이트 표시·구조화 데이터·플레이스 등록 시트가 모두 여기서 파생된다.
      > 2026-08-06 수정: 이전에는 표시 문구와 구조화 데이터가 따로 있어 **사이트는
      > 토요일 영업을 안내하는데 구조화 데이터에는 토요일이 아예 없었다.**
      > 로컬 검색은 구조화 데이터로 「영업 중」을 판정하므로, 토요일에 검색한
      > 발주처에게 닫힌 업체로 보였다. 단일 소스로 묶어 해결했다.

## 🟢 SEO · 분석 (운영 등록)

- [ ] **🔴 네이버 스마트플레이스 등록** (사장님) — 보고서가 꼽은 **네이버 유입 최우선**.
      로컬 검색 최상단이 플레이스 영역인데 현재 미등록.
      **👉 입력값을 그대로 옮겨 적을 수 있게 시트를 만들어 뒀다 —
      [`docs/네이버_스마트플레이스_등록.md`](docs/네이버_스마트플레이스_등록.md)**
      - ⚠️ **신규 등록 전에 「미클레임 플레이스」부터 확인할 것.** 이미 자동 생성된
        항목이 있는데 새로 만들면 같은 업체가 둘이 되어 리뷰·조회수가 갈린다
      - 등록 후 **플레이스 URL을 알려주면** `lib/site.ts`에 넣는다 → 연락처 버튼과
        `sameAs`가 동시에 켜지고, 사이트↔플레이스 양방향 링크가 완성된다
- [x] ~~**네이버 플레이스 NAP 일치**~~ — **사이트 쪽 준비 완료(2026-08-06).**
      상호·주소·전화·영업시간·시공지역이 [`lib/site.ts`](lib/site.ts) 단일 소스에서
      사이트 표시·구조화 데이터·등록 시트 세 곳으로 파생된다. 남은 것은 플레이스
      등록 화면에 **시트 값을 그대로** 넣는 일뿐이다.
      > 대표번호는 반드시 `053-525-0424`. 모바일을 대표번호로 넣으면 구조화
      > 데이터와 어긋난다(모바일은 «추가 번호»에).
- [ ] **네이버 서치어드바이저 사이트맵 제출** — `https://www.wnjpower.com/sitemap.xml`
      (소유확인은 이미 완료 — 확인 태그가 `app/layout.tsx`에 박혀 있다)
- [ ] **Google Search Console 등록** — 소유 확인 후 `/sitemap.xml` 제출.
      **코드는 준비됨** — HTML 태그 방식의 확인 코드를 받아 Vercel 환경변수
      `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`에 넣고 재배포하면 meta가 자동으로 붙는다.
- [ ] **OG·카카오 공유 미리보기 확인** — [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서
      캐시 초기화 + 미리보기 확인
- [ ] **GA4 전환 이벤트 확인** — 실사용 유입 후 실시간 보고서에서
      `phone_click`·`generate_lead`·`callback_request` 수신 확인
- [ ] **게시판 콘텐츠 0건** — `posts` 테이블이 비어 있다. 블로그·공지·시공실적 모두
      아직 글이 없다. SEO상 정기 발행이 유리하다(어드민 → 게시판)

## 🟢 AEO (답변엔진 최적화) — 2026-08-09 추가

> 어드민 → **AEO 추적**에서 키워드별 인용 준비도를 보고, 실제 인용 여부를 기록한다.
> 점수는 사이트 문구가 바뀌면 즉시 다시 계산된다(저장하지 않는다).

- [ ] **🔴 서비스 상세 4곳에 `FaqSchema` 붙일지 결정** — 진단이 시드 키워드 6개 중
      4개에서 같은 지적을 냈다. `/services/*`는 각각 고유 FAQ 4개(합 16개)를 화면에
      노출하면서 구조화 데이터로는 내보내지 않는다.
      > 판단이 필요한 이유: [`components/FaqSchema.tsx`](components/FaqSchema.tsx)의
      > 주석은 «중복은 감점이라 정본인 /faq에서만 렌더한다»고 하는데, 실제로는
      > **홈과 /faq가 같은 항목을 중복 노출**하고 있다(홈 쪽 주석은 스펙 §7-1을 근거로
      > 든다). 서비스 상세는 FAQ가 서로 달라 중복 문제가 없으므로 붙이는 쪽이
      > 유리해 보이지만, 홈·/faq 중복부터 정리할지 함께 정해야 한다.
- [ ] **관찰 기록을 월 1회 돌리기** — 등록된 질문을 ChatGPT·Perplexity·네이버 큐:에
      그대로 물어보고 결과를 남긴다. 같은 질문도 답이 매번 달라지므로 **같은 조건으로
      주기적으로** 봐야 추이가 보인다. 어드민 화면이 물어볼 문장을 그대로 보여준다.
- [ ] **직답 문장에 주어 넣기** — 「계약전력 증설」·「배전반 설치」·「수전설비 공사」의
      직답 문장이 «누가·어디서» 없이 시작한다. 답변엔진이 문맥에서 뽑아내면 주체가
      사라져 인용되지 않는다. 「주식회사 우앤주전력은 …」 또는 「대구·경북에서 …」로
      시작하도록 [`content/service-pages.ts`](content/service-pages.ts)의 `lead`를 손볼 것
- [ ] **시드 키워드 6개 검토** — 사이트의 기존 SEO 키워드에서 뽑아 넣어 뒀다.
      실제로 노릴 말이 아니면 지우고, 빠진 것은 추가하면 된다

## ⚪ 추후 개선 (선택)

- [ ] **견적서 이메일 양식 개선** — 알림 메일을 "견적서" 양식으로 발전시키고
      받은편지함에서 일반 메일과 시각적으로 구분되게(전용 발신자 표시명·제목 규칙 등).
      현재는 [`app/api/quote/route.ts`](app/api/quote/route.ts)의 `buildEmailHtml` 단일 템플릿
- [ ] **CTA A/B 실험 시작** — `ctas` 테이블이 0행이라 지금은 전부 코드 기본값으로
      렌더된다. 어드민 → CTA 버튼에서 한 자리에 변형을 2개 만들면 실험이 시작된다.
      히어로 주 버튼부터 권장
- [ ] **이벤트 자동 정리 스케줄** — `prune_events(180)` 함수는 있으나 자동 실행 미설정.
      Supabase `pg_cron`으로 하루 1회 돌리면 무료 tier 500MB를 안정적으로 유지.
      > **사장님 승인 대기.** 이제 MCP로 걸 수 있지만, «180일 지난 이벤트를 매일
      > 자동 삭제»하는 상시 규칙이라 한 번 물어보고 걸어야 한다. 보관 기간을
      > 180일이 아닌 값으로 하고 싶으면 그때 정하면 된다.
- [ ] **Vercel MCP 재인증** — `wnjpower-erp` 팀 스코프 권한이 없어 MCP 도구로는 403.
      단 `npx vercel` CLI는 정상 동작하므로(2026-08-05 배포 확인에 사용) 급하지 않다
      > 참고: **Supabase MCP는 2026-08-06 세션에서 정상 동작했다.** 이전에 OAuth가
      > 실패해 PAT로 우회했었는데, 이제 DDL까지 MCP로 적용된다.
- [ ] **로컬 `.env.local`의 `NEXT_PUBLIC_SITE_URL`이 `http://localhost:3210`**
      프로덕션은 정상. 다만 이 값으로 로컬에서 색인 제출을 실행하면 localhost 주소가
      IndexNow에 올라가 거부된다. 로컬 발행 테스트 전에 확인할 것
- [ ] Cloudflare Turnstile — 견적 폼 봇 차단 강화
- [ ] 카카오맵 실제 임베드 — 현재는 카카오맵 링크 카드
- [ ] Lighthouse 모바일 90점 이상 최적화
- [ ] **서비스 상세를 어드민 편집 대상으로** — 현재 `content/service-pages.ts` 파일 기반.
      제도 수치가 많은 긴 기술 문서라 제외했다

---

## 📁 주요 파일 위치 참조

> 2026-08-06에 **실제 파일 존재를 확인하며** 재검증했다(내부 링크 46개 전부 유효).
> 1b 재구축으로 `components/sections/*`와 `components/ui/*`(sonner 제외)는 전부 없어졌다.

| 목적 | 경로 |
|------|------|
| **어드민 사용법 (사장님용)** | [`docs/어드민_사용법.md`](docs/어드민_사용법.md) |
| **네이버 플레이스 등록 입력값 (사장님용)** | [`docs/네이버_스마트플레이스_등록.md`](docs/네이버_스마트플레이스_등록.md) |
| **편집 가능한 문구·기본값·어드민 폼 정의 (단일 소스)** | [`lib/content/schema.ts`](lib/content/schema.ts) |
| **회사 정보·영업시간·시공지역·외부 채널 URL (단일 소스)** | [`lib/site.ts`](lib/site.ts) |
| **디자인 토큰·유틸리티 (1b 블루프린트)** | [`components/redesign/blueprint.css`](components/redesign/blueprint.css) |
| 전역 기반 CSS(리셋·크로스브라우징·모션) | [`app/globals.css`](app/globals.css) |
| 홈 히어로(단선결선도·신뢰지표) | [`components/redesign/home/Hero.tsx`](components/redesign/home/Hero.tsx) |
| 홈 섹션(사업영역·절차·실적·자격·비용·오시는길) | [`components/redesign/home/Sections.tsx`](components/redesign/home/Sections.tsx) |
| 헤더 · 모바일 내비 | [`components/redesign/HeaderBar.tsx`](components/redesign/HeaderBar.tsx) · [`components/redesign/MobileNav.tsx`](components/redesign/MobileNav.tsx) |
| 푸터·하단바·섹션머리(SectionHead) | [`components/redesign/Chrome.tsx`](components/redesign/Chrome.tsx) |
| 견적폼 · 빠른 접수 바 | [`components/redesign/home/QuoteBlock.tsx`](components/redesign/home/QuoteBlock.tsx) · [`components/redesign/home/QuickQuoteBar.tsx`](components/redesign/home/QuickQuoteBar.tsx) |
| 서브페이지 골격 | [`components/SubPageShell.tsx`](components/SubPageShell.tsx) · [`components/PageHero.tsx`](components/PageHero.tsx) |
| **어드민 전용 스타일·프리미티브** | [`components/admin/admin.css`](components/admin/admin.css) · [`components/admin/ui.tsx`](components/admin/ui.tsx) |
| 어드민 스키마 · 분석 집계 함수 | [`supabase/admin-schema.sql`](supabase/admin-schema.sql) · [`supabase/analytics-functions.sql`](supabase/analytics-functions.sql) |
| **DB 마이그레이션** | [`supabase/migrations/`](supabase/migrations) |
| 유입 경로(광고 귀속) 판정 | [`lib/analytics/attribution.ts`](lib/analytics/attribution.ts) |
| CTA 슬롯·A/B 배정 | [`lib/cta/schema.ts`](lib/cta/schema.ts) · [`lib/cta/get.ts`](lib/cta/get.ts) |
| 한국어 SEO 분석기 (글 단위 점수) | [`lib/seo/analyze.ts`](lib/seo/analyze.ts) |
| **AEO 진단기 · 사이트 텍스트 코퍼스** | [`lib/seo/aeo.ts`](lib/seo/aeo.ts) · [`lib/seo/corpus.ts`](lib/seo/corpus.ts) |
| 게시판(블로그·공지·시공실적) | [`lib/posts.ts`](lib/posts.ts) |
| IndexNow 자동 색인 제출 | [`lib/indexnow.ts`](lib/indexnow.ts) · 키 파일 `public/<키>.txt` |
| 인증·어드민 가드 | [`middleware.ts`](middleware.ts) · [`lib/supabase-server.ts`](lib/supabase-server.ts) |
| GA4 / 클릭·이벤트 추적 | [`components/GoogleAnalytics.tsx`](components/GoogleAnalytics.tsx) · [`components/analytics/Tracker.tsx`](components/analytics/Tracker.tsx) |
| 견적 API | [`app/api/quote/route.ts`](app/api/quote/route.ts) · [`lib/validators.ts`](lib/validators.ts) |
| **실시간 알림(웹 푸시)** | [`lib/push/`](lib/push) · [`public/sw.js`](public/sw.js) · [`supabase/push-schema.sql`](supabase/push-schema.sql) |
| 카카오 알림톡 | [`lib/kakao-alimtalk.ts`](lib/kakao-alimtalk.ts) |
| OG 이미지 · 구조화 데이터 | [`app/opengraph-image.tsx`](app/opengraph-image.tsx) · [`components/SchemaOrg.tsx`](components/SchemaOrg.tsx) · [`components/FaqSchema.tsx`](components/FaqSchema.tsx) |
| 서비스/시공사례 콘텐츠 | [`content/service-pages.ts`](content/service-pages.ts) · [`content/portfolio.ts`](content/portfolio.ts) |
| 개인정보처리방침 | [`app/privacy/page.tsx`](app/privacy/page.tsx) |
| 개편 기획 보고서 | [`docs/웹사이트_전면개편_기획보고서.md`](docs/웹사이트_전면개편_기획보고서.md) |
| 환경변수 템플릿 | [`.env.example`](.env.example) |
