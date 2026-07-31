-- ─────────────────────────────────────────────
--  우앤주전력 웹사이트 — 어드민 / CMS / 분석 스키마
--
--  기존 supabase/schema.sql(견적문의)에 이어서 실행한다.
--  Supabase SQL Editor에 통째로 붙여넣으면 되고, 여러 번 실행해도 안전하다
--  (전부 if not exists / drop policy if exists 로 감쌌다).
--
--  [설계 원칙]
--  1) 익명(anon)에게는 "공개돼야 하는 것"만 SELECT를 준다.
--     초안(draft)은 별도 테이블로 분리해 컬럼 단위 노출 사고를 원천 차단한다.
--  2) 관리자 판별은 public.admins 화이트리스트 + is_admin() 한 곳에서만 한다.
--     Supabase Auth에 계정이 있어도 admins에 없으면 아무 권한이 없다.
--  3) service_role 키는 여전히 쓰지 않는다. 어드민은 로그인 사용자의 JWT로
--     RLS를 통과한다. 서버에 비밀 키를 늘리지 않기 위해서다.
-- ─────────────────────────────────────────────


-- ═══════════════════════════════════════════════
--  0) 공통 유틸
-- ═══════════════════════════════════════════════

-- updated_at 자동 갱신
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ═══════════════════════════════════════════════
--  1) 관리자 화이트리스트
--
--  Supabase Auth(Authentication → Users)에서 사장님 계정을 만든 뒤,
--  그 user id를 이 테이블에 넣어야 비로소 어드민 권한이 생긴다.
--    insert into public.admins (user_id, email, name)
--    values ('<auth.users의 id>', 'wnj-2023@naver.com', '임태훈');
-- ═══════════════════════════════════════════════
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text,
  created_at timestamptz not null default now()
);

-- RLS 정책 안에서 관리자 여부를 판별한다.
--
-- security definer 이므로 admins 테이블의 RLS를 우회한다. 이게 없으면
-- "admins를 읽으려면 admin이어야 하고, admin인지 알려면 admins를 읽어야 하는"
-- 무한 재귀에 빠진다.
-- search_path 고정은 필수다. 고정하지 않으면 호출자가 search_path를 바꿔
-- 가짜 admins 테이블을 심는 권한 상승이 가능하다.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$$;

alter table public.admins enable row level security;

drop policy if exists "admins readable by admins" on public.admins;
create policy "admins readable by admins"
  on public.admins for select to authenticated
  using (public.is_admin());

revoke all on table public.admins from anon, authenticated;
grant select on table public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;


-- ═══════════════════════════════════════════════
--  2) 사이트 콘텐츠 — 발행본 / 초안 분리
--
--  발행본(site_content)만 익명이 읽는다. 초안(site_drafts)은 관리자 전용이다.
--  한 테이블에 draft/published 컬럼을 같이 두면 "익명은 published 컬럼만"이라는
--  제약을 RLS로 표현할 수 없어(RLS는 행 단위) 초안이 새어나간다.
--
--  data 형태는 앱의 lib/content/schema.ts 가 정의한다. DB는 jsonb로만 본다.
--  키 예: 'header' | 'hero' | 'services' | 'whyus' | 'process' | 'pricing'
--        | 'faq' | 'quote' | 'contact' | 'footer' | 'seo'
-- ═══════════════════════════════════════════════
create table if not exists public.site_content (
  key          text primary key,
  data         jsonb not null default '{}'::jsonb,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users(id) on delete set null
);

create table if not exists public.site_drafts (
  key        text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

drop trigger if exists site_drafts_touch on public.site_drafts;
create trigger site_drafts_touch before update on public.site_drafts
  for each row execute function public.touch_updated_at();

alter table public.site_content enable row level security;
alter table public.site_drafts  enable row level security;

drop policy if exists "site_content public read" on public.site_content;
create policy "site_content public read"
  on public.site_content for select to anon, authenticated using (true);

drop policy if exists "site_content admin write" on public.site_content;
create policy "site_content admin write"
  on public.site_content for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "site_drafts admin only" on public.site_drafts;
create policy "site_drafts admin only"
  on public.site_drafts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on table public.site_content from anon, authenticated;
revoke all on table public.site_drafts  from anon, authenticated;
grant select on table public.site_content to anon, authenticated;
grant insert, update, delete on table public.site_content to authenticated;
grant select, insert, update, delete on table public.site_drafts to authenticated;


-- ═══════════════════════════════════════════════
--  3) CTA — 슬롯별 버튼 정의 + A/B 변형
--
--  slot    : 화면에서 이 버튼이 놓이는 자리 (앱이 아는 고정 값)
--  variant : 같은 슬롯의 실험 변형. 'A'만 있으면 실험 없이 그대로 노출된다.
--  weight  : 변형별 배정 가중치. 세션 해시로 고정 배정하므로 새로고침해도 안 바뀐다.
-- ═══════════════════════════════════════════════
create table if not exists public.ctas (
  id         uuid primary key default gen_random_uuid(),
  slot       text not null,
  variant    text not null default 'A',
  label      text not null,
  sublabel   text,
  href       text not null,
  style      text not null default 'primary',   -- primary | signal | outline | ghost
  icon       text,                              -- lucide 아이콘 이름 (Phone, ArrowRight ...)
  weight     int  not null default 100,
  active     boolean not null default true,
  note       text,                              -- 실험 메모 (관리자만 봄)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ctas_slot_len    check (char_length(slot)  between 1 and 40),
  constraint ctas_variant_len check (char_length(variant) between 1 and 10),
  constraint ctas_label_len   check (char_length(label) between 1 and 60),
  constraint ctas_href_len    check (char_length(href)  between 1 and 300),
  constraint ctas_weight_rng  check (weight between 0 and 1000)
);

create unique index if not exists ctas_slot_variant_uidx on public.ctas (slot, variant);

drop trigger if exists ctas_touch on public.ctas;
create trigger ctas_touch before update on public.ctas
  for each row execute function public.touch_updated_at();

alter table public.ctas enable row level security;

drop policy if exists "ctas public read active" on public.ctas;
create policy "ctas public read active"
  on public.ctas for select to anon, authenticated using (active);

drop policy if exists "ctas admin write" on public.ctas;
create policy "ctas admin write"
  on public.ctas for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on table public.ctas from anon, authenticated;
grant select on table public.ctas to anon, authenticated;
grant insert, update, delete on table public.ctas to authenticated;


-- ═══════════════════════════════════════════════
--  4) 이벤트 — 자체 수집 분석
--
--  GA4는 표본 추출·지연이 있고 광고 클릭과 실제 리드를 한 화면에서 잇기 어렵다.
--  여기 쌓는 원본 이벤트가 어드민 실시간 대시보드의 데이터 소스다.
--
--  개인정보는 담지 않는다. IP는 저장하지 않고, session_id는 방문자가 만든
--  임의 문자열이며 쿠키에만 남는다.
-- ═══════════════════════════════════════════════
create table if not exists public.events (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  type          text not null,   -- pageview | cta_impression | cta_click | phone_click
                                 -- | kakao_click | form_start | lead | scroll_depth
  session_id    text not null,
  path          text,
  referrer_host text,
  channel       text,            -- naver_ad | naver_organic | google_ad | ... | direct
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_term      text,
  utm_content   text,
  device        text,            -- mobile | tablet | desktop
  browser       text,
  os            text,
  cta_id        uuid,
  variant       text,
  label         text,
  value         numeric,

  -- 공개 키로 PostgREST를 직접 두드려 테이블을 부풀리는 것에 대한 방어.
  -- 값 열거 CHECK는 두지 않는다(코드와 어긋나면 정상 수집까지 막힌다).
  constraint events_type_len       check (char_length(type)       between 1 and 30),
  constraint events_session_len    check (char_length(session_id) between 1 and 64),
  constraint events_path_len       check (path          is null or char_length(path)          <= 300),
  constraint events_referrer_len   check (referrer_host is null or char_length(referrer_host) <= 120),
  constraint events_channel_len    check (channel       is null or char_length(channel)       <= 30),
  constraint events_utm_source_len check (utm_source    is null or char_length(utm_source)    <= 80),
  constraint events_utm_medium_len check (utm_medium    is null or char_length(utm_medium)    <= 80),
  constraint events_utm_camp_len   check (utm_campaign  is null or char_length(utm_campaign)  <= 120),
  constraint events_utm_term_len   check (utm_term      is null or char_length(utm_term)      <= 120),
  constraint events_utm_cont_len   check (utm_content   is null or char_length(utm_content)   <= 120),
  constraint events_device_len     check (device        is null or char_length(device)        <= 12),
  constraint events_browser_len    check (browser       is null or char_length(browser)       <= 30),
  constraint events_os_len         check (os            is null or char_length(os)            <= 30),
  constraint events_variant_len    check (variant       is null or char_length(variant)       <= 10),
  constraint events_label_len      check (label         is null or char_length(label)         <= 80)
);

create index if not exists events_created_idx      on public.events (created_at desc);
create index if not exists events_type_created_idx on public.events (type, created_at desc);
create index if not exists events_session_idx      on public.events (session_id);
create index if not exists events_channel_idx      on public.events (channel, created_at desc);
create index if not exists events_cta_idx          on public.events (cta_id, variant) where cta_id is not null;

alter table public.events enable row level security;

drop policy if exists "events anon insert" on public.events;
create policy "events anon insert"
  on public.events for insert to anon, authenticated with check (true);

drop policy if exists "events admin read" on public.events;
create policy "events admin read"
  on public.events for select to authenticated using (public.is_admin());

revoke all on table public.events from anon, authenticated;
grant insert on table public.events to anon, authenticated;
grant select on table public.events to authenticated;


-- 원본 이벤트 보관기간 제한 — 무료 tier 500MB를 잠식하지 않게 한다.
-- pg_cron이 켜져 있으면 매일 돌리고, 아니면 어드민 대시보드 진입 시 가끔 호출된다.
create or replace function public.prune_events(keep_days int default 180)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  removed bigint;
begin
  delete from public.events
   where created_at < now() - make_interval(days => keep_days);
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.prune_events(int) from public, anon;
grant execute on function public.prune_events(int) to authenticated;


-- ═══════════════════════════════════════════════
--  5) 견적문의 — 광고 귀속 + 진행상태
--
--  "이 광고에서 리드가 몇 건 나왔나"를 답하려면 리드 행 자체에
--  유입 정보가 붙어 있어야 한다. 이벤트 테이블과 session_id로도 이을 수 있지만,
--  이벤트는 보관기간이 지나면 지워지므로 리드에는 복사해 둔다.
-- ═══════════════════════════════════════════════
alter table public.quotes add column if not exists session_id   text;
alter table public.quotes add column if not exists channel      text;
alter table public.quotes add column if not exists utm_source   text;
alter table public.quotes add column if not exists utm_medium   text;
alter table public.quotes add column if not exists utm_campaign text;
alter table public.quotes add column if not exists utm_term     text;
alter table public.quotes add column if not exists utm_content  text;
alter table public.quotes add column if not exists landing_path text;
alter table public.quotes add column if not exists referrer_host text;
-- 사장님이 어드민에서 처리 상태를 관리한다
alter table public.quotes add column if not exists status text not null default 'new';
alter table public.quotes add column if not exists memo   text;

create index if not exists quotes_status_idx  on public.quotes (status, created_at desc);
create index if not exists quotes_channel_idx on public.quotes (channel, created_at desc);

-- 익명은 여전히 INSERT만. 관리자는 조회·상태변경이 가능해야 한다.
drop policy if exists "quotes admin read" on public.quotes;
create policy "quotes admin read"
  on public.quotes for select to authenticated using (public.is_admin());

drop policy if exists "quotes admin update" on public.quotes;
create policy "quotes admin update"
  on public.quotes for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select, update on table public.quotes to authenticated;


-- ═══════════════════════════════════════════════
--  6) 게시글 — 블로그 / 공지 / 시공실적
-- ═══════════════════════════════════════════════
create table if not exists public.posts (
  id               uuid primary key default gen_random_uuid(),
  type             text not null default 'blog',   -- blog | notice | portfolio
  slug             text not null unique,
  title            text not null,
  excerpt          text,
  body             text not null default '',       -- 마크다운 원문
  cover_image      text,
  cover_alt        text,
  status           text not null default 'draft',  -- draft | published
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  author           text,

  -- SEO (RankMath/Yoast식 글쓰기 도우미가 채운다)
  focus_keyword    text,
  meta_title       text,
  meta_description text,
  seo_score        int,
  noindex          boolean not null default false,

  -- 시공실적 등 타입별 추가 필드 (location, workType, period, scale, images[])
  meta             jsonb not null default '{}'::jsonb,
  sort_order       int not null default 0,

  constraint posts_type_chk    check (type in ('blog','notice','portfolio')),
  constraint posts_status_chk  check (status in ('draft','published')),
  constraint posts_slug_fmt    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint posts_slug_len    check (char_length(slug)  between 1 and 100),
  constraint posts_title_len   check (char_length(title) between 1 and 200),
  constraint posts_body_len    check (char_length(body)  <= 200000)
);

create index if not exists posts_type_status_idx on public.posts (type, status, published_at desc);
create index if not exists posts_published_idx   on public.posts (published_at desc) where status = 'published';

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

alter table public.posts enable row level security;

-- 공개 사이트는 발행된 글만 본다. 초안은 관리자에게만 보인다
-- (관리자는 아래 admin 정책으로 전체를 읽으므로 이 정책과 OR 결합된다).
drop policy if exists "posts public read published" on public.posts;
create policy "posts public read published"
  on public.posts for select to anon, authenticated
  using (status = 'published');

drop policy if exists "posts admin read all" on public.posts;
create policy "posts admin read all"
  on public.posts for select to authenticated using (public.is_admin());

drop policy if exists "posts admin write" on public.posts;
create policy "posts admin write"
  on public.posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on table public.posts from anon, authenticated;
grant select on table public.posts to anon, authenticated;
grant insert, update, delete on table public.posts to authenticated;


-- ═══════════════════════════════════════════════
--  7) 색인 제출(IndexNow 등) 이력
-- ═══════════════════════════════════════════════
create table if not exists public.index_pings (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  target     text not null,        -- indexnow | naver | google
  urls       text[] not null,
  ok         boolean not null default false,
  status     int,
  response   text
);

create index if not exists index_pings_created_idx on public.index_pings (created_at desc);

alter table public.index_pings enable row level security;

drop policy if exists "index_pings admin all" on public.index_pings;
create policy "index_pings admin all"
  on public.index_pings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on table public.index_pings from anon, authenticated;
grant select, insert on table public.index_pings to authenticated;


-- ═══════════════════════════════════════════════
--  8) 이미지 저장소 (Supabase Storage)
--
--  사장님이 어드민에서 올린 사진이 여기 들어간다. 공개 읽기 + 관리자 쓰기.
-- ═══════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 10485760,
  array['image/jpeg','image/png','image/webp','image/avif','image/gif','image/svg+xml']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 10485760,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media public read"   on storage.objects;
create policy "media public read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());


-- ═══════════════════════════════════════════════
--  9) 적용 후 확인 쿼리
-- ═══════════════════════════════════════════════
-- 9-1) 관리자 계정 연결 (Authentication → Users에서 계정 생성 후 실행)
--   insert into public.admins (user_id, email, name)
--   select id, email, '임태훈' from auth.users where email = 'wnj-2023@naver.com'
--   on conflict (user_id) do nothing;
--
-- 9-2) 테이블·RLS 상태 점검
--   select tablename,
--          (select relrowsecurity from pg_class where oid = ('public.'||tablename)::regclass) as rls
--     from pg_tables
--    where schemaname='public'
--      and tablename in ('admins','site_content','site_drafts','ctas','events','posts','index_pings','quotes')
--    order by tablename;
--
-- 9-3) 익명 권한 점검 — events=INSERT / site_content,ctas,posts=SELECT / quotes=INSERT 만 나와야 정상
--   select table_name, string_agg(privilege_type, ',' order by privilege_type) as anon_grants
--     from information_schema.role_table_grants
--    where table_schema='public' and grantee='anon'
--    group by table_name order by table_name;
