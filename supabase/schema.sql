-- ─────────────────────────────────────────────
--  우앤주전력 웹사이트 — Supabase 스키마
--  사용법: Supabase 대시보드 → SQL Editor에 전체 복사·실행
-- ─────────────────────────────────────────────

-- 1) 견적문의 테이블 (신규 설치용)
--    category 값은 애플리케이션(lib/validators.ts)의 Zod 스키마에서 검증하므로
--    DB CHECK 제약은 두지 않는다. (카테고리 개편 시 제약-코드 불일치로
--    insert가 깨지는 사고를 막기 위함)
create table if not exists public.quotes (
  id            bigserial primary key,
  created_at    timestamptz not null default now(),
  name          text        not null,
  phone         text        not null,
  region        text,
  category      text        not null,  -- factory_new | power_receiving | ... | etc (앱에서 검증)
  customer_type text,                  -- industrial | interior | unknown | null
  message       text,
  source        text,
  user_agent    text,
  ip_hash       text
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

-- SELECT 정책 없음 → service_role 키로만 조회 가능


-- ─────────────────────────────────────────────
--  마이그레이션 (이미 quotes 테이블이 존재하는 운영 DB용)
--  아래 두 줄을 Supabase SQL Editor에서 실행하세요.
--  - 기존 category CHECK 제약이 신규 카테고리 값과 불일치해 insert가 실패하므로 제거
--  - customer_type 컬럼 추가
-- ─────────────────────────────────────────────
-- alter table public.quotes drop constraint if exists quotes_category_check;
-- alter table public.quotes add column if not exists customer_type text;
