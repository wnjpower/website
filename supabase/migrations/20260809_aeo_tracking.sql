-- AEO(답변엔진 최적화) 키워드 추적 (2026-08-09)
--
-- 두 가지를 나눠 담는다.
--
--   ① aeo_keywords     — 무엇을 추적할 것인가 (키워드 + 실제 질문 문장)
--   ② aeo_observations — 실제로 인용됐는가 (사람이 물어보고 남기는 기록)
--
-- 자동 진단 점수는 저장하지 않는다. 사이트 콘텐츠가 바뀌면 즉시 달라지는 값이라
-- 저장하면 곧 낡은다. 화면을 열 때마다 lib/seo/aeo.ts로 다시 계산한다.
-- 반대로 «그날 ChatGPT가 우리를 인용했는가»는 다시 계산할 수 없는 관측이므로
-- 반드시 남긴다.
--
-- 적용: Supabase MCP 또는 대시보드 SQL Editor. 멱등하다.

-- ═══════════════════════════════════════════════
--  ① 추적 키워드
-- ═══════════════════════════════════════════════
create table if not exists public.aeo_keywords (
  id          uuid primary key default gen_random_uuid(),
  -- 노리는 검색어. 예: '계약전력 증설 비용'
  keyword     text not null,
  -- 사람이 답변엔진에 실제로 던지는 문장. 진단의 정확도가 여기서 갈린다 —
  -- 키워드만으로는 «무엇을 묻는지»를 알 수 없어 인용 후보를 고르지 못한다.
  question    text not null default '',
  -- 이 키워드를 책임질 페이지 경로. 비우면 진단기가 코퍼스에서 자동으로 고른다.
  target_path text,
  -- 작을수록 먼저 본다. 목록 정렬용.
  priority    int  not null default 100,
  active      boolean not null default true,
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- 공개 키로 테이블을 부풀리는 것에 대한 방어 (events 테이블과 같은 방식)
  constraint aeo_keywords_keyword_len  check (char_length(keyword)  between 1 and 100),
  constraint aeo_keywords_question_len check (char_length(question) between 0 and 300),
  constraint aeo_keywords_note_len     check (note is null or char_length(note) <= 1000)
);

-- 같은 키워드를 두 번 등록하면 진단이 갈리고 관찰 기록도 나뉜다.
create unique index if not exists aeo_keywords_keyword_uidx
  on public.aeo_keywords (lower(keyword));

drop trigger if exists aeo_keywords_touch on public.aeo_keywords;
create trigger aeo_keywords_touch before update on public.aeo_keywords
  for each row execute function public.touch_updated_at();

-- ═══════════════════════════════════════════════
--  ② 관찰 기록
-- ═══════════════════════════════════════════════
--
-- 답변엔진은 순위·인용 조회 API를 제공하지 않는다. 같은 질문에도 답이 매번
-- 달라지므로 크롤링으로도 신뢰할 수 없다. 그래서 사람이 직접 물어보고 결과를
-- 남기는 것 외에 방법이 없다 — 이 테이블이 그 기록이다.
create table if not exists public.aeo_observations (
  id          uuid primary key default gen_random_uuid(),
  keyword_id  uuid not null references public.aeo_keywords(id) on delete cascade,
  -- chatgpt | perplexity | google_ai | naver_cue | copilot | gemini
  -- 값 열거 CHECK는 두지 않는다. 답변엔진은 계속 생기고 없어지는데,
  -- 코드와 어긋나면 정상 기록까지 막힌다(events 테이블과 같은 판단).
  engine      text not null,
  observed_at timestamptz not null default now(),
  -- 우리 사이트가 답변에 인용·언급됐는가
  cited       boolean not null,
  -- 인용된 문장 또는 답변에서 우리를 언급한 대목. 무엇이 뽑혔는지 알아야
  -- «어떤 문장이 먹히는지»를 배울 수 있다.
  snippet     text,
  note        text,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),

  constraint aeo_obs_engine_len  check (char_length(engine) between 1 and 30),
  constraint aeo_obs_snippet_len check (snippet is null or char_length(snippet) <= 2000),
  constraint aeo_obs_note_len    check (note is null or char_length(note) <= 1000)
);

create index if not exists aeo_observations_keyword_idx
  on public.aeo_observations (keyword_id, observed_at desc);

-- ═══════════════════════════════════════════════
--  RLS — 둘 다 관리자 전용
-- ═══════════════════════════════════════════════
--
-- ctas와 달리 공개 읽기 정책을 두지 않는다. 어떤 키워드를 노리고 있고 어디서
-- 밀리는지는 경쟁사에 그대로 보여줄 이유가 없는 내부 운영 정보다.

alter table public.aeo_keywords     enable row level security;
alter table public.aeo_observations enable row level security;

drop policy if exists "aeo_keywords admin all" on public.aeo_keywords;
create policy "aeo_keywords admin all"
  on public.aeo_keywords for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "aeo_observations admin all" on public.aeo_observations;
create policy "aeo_observations admin all"
  on public.aeo_observations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on table public.aeo_keywords     from anon, authenticated;
revoke all on table public.aeo_observations from anon, authenticated;
grant select, insert, update, delete on table public.aeo_keywords     to authenticated;
grant select, insert, update, delete on table public.aeo_observations to authenticated;

-- ── 되돌리기 ──────────────────────────────────────────────────────────────
--   drop table if exists public.aeo_observations;
--   drop table if exists public.aeo_keywords;
