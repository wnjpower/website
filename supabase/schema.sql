-- ─────────────────────────────────────────────
--  우앤주전력 웹사이트 — Supabase 스키마
--  사용법: Supabase 대시보드 → SQL Editor에 전체 복사·실행
--
--  이 앱은 anon(=publishable) 키로만 INSERT 한다. service_role 키는 쓰지 않는다.
--  따라서 Vercel에 넣어야 할 값은 아래 두 개뿐이다.
--    NEXT_PUBLIC_SUPABASE_URL
--    NEXT_PUBLIC_SUPABASE_ANON_KEY
-- ─────────────────────────────────────────────

-- 1) 견적문의 테이블
--    category 값은 애플리케이션(lib/validators.ts)의 Zod 스키마에서 검증하므로
--    DB CHECK 제약은 두지 않는다. (카테고리 개편 시 제약-코드 불일치로
--    insert가 깨지는 사고를 막기 위함)
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


-- 2) Row Level Security
alter table public.quotes enable row level security;

-- 익명 사용자는 INSERT만 가능
drop policy if exists "anon can insert quotes" on public.quotes;
create policy "anon can insert quotes"
  on public.quotes
  for insert
  to anon
  with check (true);

-- SELECT 정책 없음 → 익명은 조회 불가.
-- 앱은 .insert()만 하고 .select()를 붙이지 않으므로 SELECT 권한이 필요 없다.
-- 접수 내역 확인은 Supabase 대시보드(Table Editor)에서 한다.


-- 3) ⚠️ Data API 노출 — 이 GRANT를 빠뜨리면 폼이 조용히 실패한다
--
--    2026-04-28부터 신규 프로젝트는 public 스키마에 만든 테이블이
--    Data API(PostgREST)에 자동으로 노출되지 않는다. RLS 정책과는 별개 문제로,
--    RLS는 "어떤 행을 볼 수 있는가"이고 이 GRANT는 "테이블에 접근이 되는가"다.
--
--    GRANT가 없으면 anon 키 INSERT가 권한 오류로 거부되고,
--    app/api/quote/route.ts 는 오류를 콘솔에만 남기고 200을 반환하기 때문에
--    화면상으로는 접수된 것처럼 보이지만 데이터는 저장되지 않는다.
grant insert on table public.quotes to anon;

-- id는 identity 컬럼이라 시퀀스 권한을 따로 줄 필요가 없다.
-- (bigserial을 쓸 경우에는 `grant usage on sequence public.quotes_id_seq to anon;`이 추가로 필요하다)


-- ─────────────────────────────────────────────
--  4) 검증 — 위 SQL 실행 후 아래를 실행해 결과를 확인한다
-- ─────────────────────────────────────────────
-- 4-1) 테이블·RLS 활성화 확인 (rowsecurity 가 true 여야 한다)
--   select relname, relrowsecurity as rowsecurity
--   from pg_class where relname = 'quotes';
--
-- 4-2) 정책 확인 (anon / INSERT 한 건이 나와야 한다)
--   select policyname, roles, cmd from pg_policies
--   where schemaname = 'public' and tablename = 'quotes';
--
-- 4-3) anon 권한 확인 (INSERT 가 나와야 한다)
--   select grantee, privilege_type from information_schema.role_table_grants
--   where table_schema = 'public' and table_name = 'quotes' and grantee = 'anon';


-- ─────────────────────────────────────────────
--  5) 마이그레이션 (이미 quotes 테이블이 존재하는 운영 DB용)
--     신규 프로젝트라면 이 섹션은 실행할 필요 없다.
-- ─────────────────────────────────────────────
-- alter table public.quotes drop constraint if exists quotes_category_check;
-- alter table public.quotes add column if not exists customer_type text;
-- alter table public.quotes add column if not exists company_name  text;
-- alter table public.quotes add column if not exists email         text;
-- grant insert on table public.quotes to anon;
-- -- 기존 테이블이 bigserial 로 만들어졌다면 시퀀스 권한도 필요하다
-- grant usage on sequence public.quotes_id_seq to anon;
