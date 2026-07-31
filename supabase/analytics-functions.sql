-- ─────────────────────────────────────────────
--  우앤주전력 — 어드민 실시간 분석용 집계 함수
--
--  supabase/admin-schema.sql 실행 후에 이어서 실행한다.
--
--  [왜 함수로 두는가]
--  events 원본을 브라우저로 다 내려받아 자바스크립트에서 집계하면, 30일치가
--  수만 행이 되는 순간 어드민이 멈춘다. 집계는 DB가 가장 잘하는 일이므로
--  DB에서 끝내고 결과만 내려보낸다.
--
--  [권한]
--  전부 security invoker(기본값)다. 따라서 events·quotes의 RLS가 그대로 적용되어,
--  관리자가 아닌 계정이 호출하면 빈 결과가 나온다. 함수에 별도 권한 검사를
--  넣지 않는 이유이기도 하다 — 검사 지점이 둘로 갈리면 한쪽만 고치는 사고가 난다.
-- ─────────────────────────────────────────────


-- 1) 핵심 지표 요약
--    세션 수 / 페이지뷰 / 전화클릭 / 견적문의 / 전환율의 분자·분모를 한 번에 낸다.
create or replace function public.analytics_overview(
  from_ts timestamptz,
  to_ts   timestamptz default now()
)
returns table (
  sessions      bigint,
  pageviews     bigint,
  phone_clicks  bigint,
  kakao_clicks  bigint,
  form_starts   bigint,
  leads         bigint,
  cta_clicks    bigint
)
language sql
stable
set search_path = public, pg_temp
as $$
  select
    count(distinct session_id)                                          as sessions,
    count(*) filter (where type = 'pageview')                           as pageviews,
    count(*) filter (where type = 'phone_click')                        as phone_clicks,
    count(*) filter (where type = 'kakao_click')                        as kakao_clicks,
    count(*) filter (where type = 'form_start')                         as form_starts,
    count(*) filter (where type = 'lead')                               as leads,
    count(*) filter (where type = 'cta_click')                          as cta_clicks
  from public.events
  where created_at >= from_ts and created_at < to_ts;
$$;


-- 2) 유입 채널별 성과 — 광고비 판단의 핵심 표
--    "네이버 광고로 들어온 세션 100개 중 몇 건이 전화/문의로 이어졌나"
create or replace function public.analytics_by_channel(
  from_ts timestamptz,
  to_ts   timestamptz default now()
)
returns table (
  channel      text,
  sessions     bigint,
  pageviews    bigint,
  phone_clicks bigint,
  leads        bigint
)
language sql
stable
set search_path = public, pg_temp
as $$
  select
    coalesce(e.channel, 'direct')                        as channel,
    count(distinct e.session_id)                         as sessions,
    count(*) filter (where e.type = 'pageview')          as pageviews,
    count(*) filter (where e.type = 'phone_click')       as phone_clicks,
    count(*) filter (where e.type = 'lead')              as leads
  from public.events e
  where e.created_at >= from_ts and e.created_at < to_ts
  group by 1
  order by sessions desc;
$$;


-- 3) 캠페인별 성과 — utm_campaign 단위. 광고 소재/키워드 비교용.
create or replace function public.analytics_by_campaign(
  from_ts timestamptz,
  to_ts   timestamptz default now()
)
returns table (
  channel      text,
  campaign     text,
  term         text,
  sessions     bigint,
  phone_clicks bigint,
  leads        bigint
)
language sql
stable
set search_path = public, pg_temp
as $$
  select
    coalesce(e.channel, 'direct')                   as channel,
    coalesce(e.utm_campaign, '(캠페인 없음)')        as campaign,
    coalesce(e.utm_term, '')                        as term,
    count(distinct e.session_id)                    as sessions,
    count(*) filter (where e.type = 'phone_click')  as phone_clicks,
    count(*) filter (where e.type = 'lead')         as leads
  from public.events e
  where e.created_at >= from_ts and e.created_at < to_ts
    and e.utm_campaign is not null
  group by 1, 2, 3
  order by sessions desc
  limit 50;
$$;


-- 4) 인기 페이지
create or replace function public.analytics_top_paths(
  from_ts timestamptz,
  to_ts   timestamptz default now()
)
returns table (
  path      text,
  pageviews bigint,
  sessions  bigint
)
language sql
stable
set search_path = public, pg_temp
as $$
  select
    coalesce(e.path, '/')          as path,
    count(*)                       as pageviews,
    count(distinct e.session_id)   as sessions
  from public.events e
  where e.created_at >= from_ts and e.created_at < to_ts
    and e.type = 'pageview'
  group by 1
  order by pageviews desc
  limit 20;
$$;


-- 5) CTA A/B 성과 — 같은 자리(label=slot)의 변형끼리 전환율을 비교한다.
--    노출(impression)이 분모, 클릭이 분자다.
create or replace function public.analytics_cta_performance(
  from_ts timestamptz,
  to_ts   timestamptz default now()
)
returns table (
  slot        text,
  variant     text,
  impressions bigint,
  clicks      bigint
)
language sql
stable
set search_path = public, pg_temp
as $$
  select
    coalesce(e.label, '(알 수 없음)')                        as slot,
    coalesce(e.variant, 'A')                                as variant,
    count(*) filter (where e.type = 'cta_impression')        as impressions,
    count(*) filter (where e.type = 'cta_click')             as clicks
  from public.events e
  where e.created_at >= from_ts and e.created_at < to_ts
    and e.type in ('cta_impression', 'cta_click')
  group by 1, 2
  order by 1, 2;
$$;


-- 6) 시간대별 추이 — 그래프용. bucket_minutes로 구간을 조절한다.
--    (오늘=60분, 7일=1440분 같은 식으로 화면이 정한다)
create or replace function public.analytics_timeseries(
  from_ts        timestamptz,
  to_ts          timestamptz default now(),
  bucket_minutes int default 60
)
returns table (
  bucket    timestamptz,
  sessions  bigint,
  pageviews bigint,
  leads     bigint
)
language sql
stable
set search_path = public, pg_temp
as $$
  select
    to_timestamp(
      floor(extract(epoch from e.created_at) / (bucket_minutes * 60)) * (bucket_minutes * 60)
    )                                              as bucket,
    count(distinct e.session_id)                   as sessions,
    count(*) filter (where e.type = 'pageview')    as pageviews,
    count(*) filter (where e.type = 'lead')        as leads
  from public.events e
  where e.created_at >= from_ts and e.created_at < to_ts
  group by 1
  order by 1;
$$;


-- 7) 기기·브라우저 분포
--    한국은 카카오톡·네이버 인앱 브라우저 비중이 커서, 여기 숫자가
--    크로스브라우징 점검의 우선순위를 정해 준다.
create or replace function public.analytics_by_device(
  from_ts timestamptz,
  to_ts   timestamptz default now()
)
returns table (
  device   text,
  browser  text,
  sessions bigint
)
language sql
stable
set search_path = public, pg_temp
as $$
  select
    coalesce(e.device, 'unknown')   as device,
    coalesce(e.browser, 'other')    as browser,
    count(distinct e.session_id)    as sessions
  from public.events e
  where e.created_at >= from_ts and e.created_at < to_ts
  group by 1, 2
  order by sessions desc;
$$;


-- 8) 지금 이 순간 — 최근 N분간 활동한 세션 수
create or replace function public.analytics_live(minutes int default 5)
returns table (
  active_sessions bigint,
  recent_events   bigint
)
language sql
stable
set search_path = public, pg_temp
as $$
  select
    count(distinct session_id) as active_sessions,
    count(*)                   as recent_events
  from public.events
  where created_at >= now() - make_interval(mins => minutes);
$$;


-- 9) 리드(견적문의) 채널별 집계 — events가 정리된 뒤에도 남는 영구 기록 기준
create or replace function public.leads_by_channel(
  from_ts timestamptz,
  to_ts   timestamptz default now()
)
returns table (
  channel  text,
  campaign text,
  leads    bigint,
  won      bigint
)
language sql
stable
set search_path = public, pg_temp
as $$
  select
    coalesce(q.channel, 'direct')             as channel,
    coalesce(q.utm_campaign, '')              as campaign,
    count(*)                                  as leads,
    count(*) filter (where q.status = 'won')  as won
  from public.quotes q
  where q.created_at >= from_ts and q.created_at < to_ts
  group by 1, 2
  order by leads desc;
$$;


-- ─────────────────────────────────────────────
--  실행 권한 — RLS가 실제 접근을 판정하지만, 권한도 최소로 맞춘다.
--
--  Postgres는 함수를 만들면 PUBLIC에 EXECUTE를 자동으로 준다. anon에서만 회수하면
--  PUBLIC 경유로 여전히 호출된다. 그래서 PUBLIC에서 먼저 회수하고 필요한 역할에만 준다.
--  (security invoker라 익명이 불러도 RLS에 막혀 빈 결과가 나오지만,
--   "부를 수는 있다"는 상태를 남겨둘 이유가 없다)
-- ─────────────────────────────────────────────
revoke execute on function public.analytics_overview(timestamptz, timestamptz)        from public;
revoke execute on function public.analytics_by_channel(timestamptz, timestamptz)      from public;
revoke execute on function public.analytics_by_campaign(timestamptz, timestamptz)     from public;
revoke execute on function public.analytics_top_paths(timestamptz, timestamptz)       from public;
revoke execute on function public.analytics_cta_performance(timestamptz, timestamptz) from public;
revoke execute on function public.analytics_timeseries(timestamptz, timestamptz, int) from public;
revoke execute on function public.analytics_by_device(timestamptz, timestamptz)       from public;
revoke execute on function public.analytics_live(int)                                 from public;
revoke execute on function public.leads_by_channel(timestamptz, timestamptz)          from public;

grant execute on function public.analytics_overview(timestamptz, timestamptz)        to authenticated;
grant execute on function public.analytics_by_channel(timestamptz, timestamptz)      to authenticated;
grant execute on function public.analytics_by_campaign(timestamptz, timestamptz)     to authenticated;
grant execute on function public.analytics_top_paths(timestamptz, timestamptz)       to authenticated;
grant execute on function public.analytics_cta_performance(timestamptz, timestamptz) to authenticated;
grant execute on function public.analytics_timeseries(timestamptz, timestamptz, int) to authenticated;
grant execute on function public.analytics_by_device(timestamptz, timestamptz)       to authenticated;
grant execute on function public.analytics_live(int)                                 to authenticated;
grant execute on function public.leads_by_channel(timestamptz, timestamptz)          to authenticated;

-- ─────────────────────────────────────────────
--  적용 후 확인 — 익명이 호출 가능한 함수가 남아 있으면 안 된다 (빈 결과가 정상)
-- ─────────────────────────────────────────────
--   select p.proname
--     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--    where n.nspname = 'public'
--      and has_function_privilege('anon', p.oid, 'EXECUTE');
