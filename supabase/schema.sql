-- ─────────────────────────────────────────────
--  우앤주전력 웹사이트 — Supabase 초기 스키마
--  사용법: Supabase 대시보드 → SQL Editor에 전체 복사·실행
-- ─────────────────────────────────────────────

-- 1) 견적문의 테이블
create table if not exists public.quotes (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  name        text        not null,
  phone       text        not null,
  region      text,
  category    text        not null check (category in
              ('electric','solar','panel','interior','material','etc')),
  message     text,
  source      text,
  user_agent  text,
  ip_hash     text
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
