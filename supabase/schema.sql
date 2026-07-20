-- ─────────────────────────────────────────────
--  우앤주전력 웹사이트 — Supabase 스키마
--
--  ✅ 이 스키마는 이미 적용·검증되었다.
--     프로젝트: wnj-website (ap-northeast-2 / 서울)
--     적용 방식: Supabase 마이그레이션 3건
--       1) create_quotes_table
--       2) restrict_quotes_grants_to_insert_only
--       3) add_quotes_length_constraints
--
--  이 파일은 위 마이그레이션을 합친 최종 상태이며,
--  프로젝트를 처음부터 다시 만들 때 SQL Editor에 통째로 붙여넣으면 된다.
--
--  이 앱은 anon(publishable) 키로 INSERT만 한다. service_role 키는 쓰지 않는다.
--  Vercel에 넣을 값은 두 개뿐:
--    NEXT_PUBLIC_SUPABASE_URL
--    NEXT_PUBLIC_SUPABASE_ANON_KEY   (sb_publishable_... 형식)
-- ─────────────────────────────────────────────


-- 1) 견적문의 테이블
create table if not exists public.quotes (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  company_name  text,                  -- 업체명 (선택)
  name          text        not null,
  phone         text        not null,
  email         text,                  -- 이메일 (선택)
  region        text,
  category      text        not null,  -- factory_new | power_receiving | ... | etc (앱에서 검증)
  customer_type text,                  -- industrial | interior | unknown | null
  message       text,
  source        text,                  -- main_form | callback | service_factory | portfolio_{slug} ...
  user_agent    text,
  ip_hash       text                   -- 원본 IP는 저장하지 않고 해시만
);

create index if not exists quotes_created_at_idx
  on public.quotes (created_at desc);


-- 2) Row Level Security — 익명은 INSERT만, 조회 불가
alter table public.quotes enable row level security;

drop policy if exists "anon can insert quotes" on public.quotes;
create policy "anon can insert quotes"
  on public.quotes
  for insert
  to anon
  with check (true);

-- SELECT 정책 없음 → 익명은 조회 불가.
-- 앱은 .insert()만 하고 .select()를 붙이지 않으므로 SELECT 권한이 필요 없다.
-- 접수 내역 확인은 Supabase 대시보드(Table Editor)에서 한다.


-- 3) 테이블 권한 — 실제로 필요한 INSERT만 남긴다
--
--    Supabase 기본 설정은 public 스키마 테이블에 anon/authenticated 전체 권한을 준다.
--    RLS가 막고 있긴 하지만, RLS가 실수로 꺼지는 순간 익명 사용자가 견적문의를
--    전부 읽거나 지울 수 있게 되므로 방어를 한 겹 더 둔다.
--
--    ⚠️ 반대로 GRANT가 아예 없으면 테이블은 만들어지지만 anon INSERT가
--       권한 오류로 거부된다. (2026-04-28부터 신규 프로젝트는 public 스키마
--       테이블이 Data API에 자동 노출되지 않는다. RLS와는 별개 문제로,
--       RLS는 "어떤 행을 볼 수 있는가", GRANT는 "테이블에 접근이 되는가"다)
revoke all on table public.quotes from anon;
revoke all on table public.quotes from authenticated;

grant insert on table public.quotes to anon;

-- id는 identity 컬럼이라 시퀀스 권한을 따로 줄 필요가 없다.
-- (bigserial을 쓸 경우에는 `grant usage on sequence public.quotes_id_seq to anon;`이 추가로 필요)


-- 4) 길이 제약 — 공개 키를 통한 직접 호출 악용 방어
--
--    anon INSERT 정책은 WITH CHECK (true)일 수밖에 없다. 공개 견적문의 폼이라
--    누구나 로그인 없이 접수할 수 있어야 하기 때문이다.
--    다만 publishable 키는 공개되어 있어 앱을 거치지 않고 PostgREST를 직접
--    호출하는 것이 가능하다. 앱 레벨 방어(허니팟·3초 게이트)를 우회당해도
--    피해가 커지지 않도록 DB에서 길이 상한을 둔다.
--
--    값을 열거하는 CHECK(예: category IN (...))는 두지 않는다. 카테고리를
--    개편할 때 제약과 코드가 어긋나 정상 문의까지 막히는 사고가 더 위험하다.
--    길이 상한은 업무 로직과 무관해서 그런 위험이 없다.
alter table public.quotes
  add constraint quotes_name_len          check (char_length(name)  between 1 and 40),
  add constraint quotes_phone_len         check (char_length(phone) between 1 and 20),
  add constraint quotes_company_name_len  check (company_name  is null or char_length(company_name)  <= 100),
  add constraint quotes_email_len         check (email         is null or char_length(email)         <= 100),
  add constraint quotes_region_len        check (region        is null or char_length(region)        <= 60),
  add constraint quotes_category_len      check (char_length(category) between 1 and 40),
  add constraint quotes_customer_type_len check (customer_type is null or char_length(customer_type) <= 20),
  add constraint quotes_message_len       check (message       is null or char_length(message)       <= 2000),
  add constraint quotes_source_len        check (source        is null or char_length(source)        <= 40),
  add constraint quotes_user_agent_len    check (user_agent    is null or char_length(user_agent)    <= 300),
  add constraint quotes_ip_hash_len       check (ip_hash       is null or char_length(ip_hash)       <= 128);


-- ─────────────────────────────────────────────
--  5) 검증 쿼리 — 적용 후 아래를 실행해 결과를 확인한다
-- ─────────────────────────────────────────────
-- 5-1) RLS 활성화 · 정책 · anon 권한을 한 번에 확인
--      기대값: rls_enabled=true / policies="anon can insert quotes [anon/INSERT]" / anon_grants="INSERT"
--
--   select
--     (select relrowsecurity from pg_class where oid = 'public.quotes'::regclass) as rls_enabled,
--     (select string_agg(policyname || ' [' || array_to_string(roles,',') || '/' || cmd || ']', ' | ')
--        from pg_policies where schemaname='public' and tablename='quotes') as policies,
--     (select string_agg(privilege_type, ',' order by privilege_type)
--        from information_schema.role_table_grants
--        where table_schema='public' and table_name='quotes' and grantee='anon') as anon_grants;
--
-- 5-2) 실제 INSERT가 되는지는 사이트 견적폼으로 제출해 보고
--      Table Editor → quotes 에 행이 들어오는지 확인하는 것이 가장 확실하다.
--      API 라우트 응답의 "savedToDb": true 로도 판별할 수 있다.


-- ─────────────────────────────────────────────
--  6) 마이그레이션 (이미 quotes 테이블이 있는 예전 DB용)
--     위 1~4번으로 새로 만든 프로젝트라면 실행할 필요 없다.
-- ─────────────────────────────────────────────
-- alter table public.quotes drop constraint if exists quotes_category_check;
-- alter table public.quotes add column if not exists customer_type text;
-- alter table public.quotes add column if not exists company_name  text;
-- alter table public.quotes add column if not exists email         text;
-- revoke all on table public.quotes from anon, authenticated;
-- grant insert on table public.quotes to anon;
-- -- 기존 테이블이 bigserial 로 만들어졌다면 시퀀스 권한도 필요하다
-- grant usage on sequence public.quotes_id_seq to anon;
