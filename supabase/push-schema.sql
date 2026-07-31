-- ─────────────────────────────────────────────
--  우앤주전력 웹사이트 — 실시간 알림(웹 푸시) 스키마
--
--  supabase/schema.sql · supabase/admin-schema.sql 다음에 실행한다.
--  여러 번 실행해도 안전하다 (전부 if not exists / drop policy if exists).
--
--  [무엇을 하는가]
--  방문자가 사이트의 CTA 버튼(전화·카카오톡·견적문의 등)을 누르면 사장님
--  휴대폰·PC에 알림 팝업이 즉시 뜬다. 여기 두 테이블이 그 기반이다.
--
--    push_subscriptions     : 알림을 받을 기기 목록 (브라우저가 발급한 구독 정보)
--    notification_settings  : 어떤 클릭에 알릴지 / 방해금지 시간 / 중복 억제 간격
--
--  [보안 — 왜 이 테이블만 service_role을 쓰는가]
--  알림을 보내는 시점의 요청 주체는 "사이트를 보고 있는 방문자"다. 방문자는
--  로그인하지 않았으므로 어드민 JWT가 없고, 그렇다고 익명(anon)에게 기기 목록
--  SELECT를 열어주면 사장님 기기의 푸시 엔드포인트가 공개된다. 그래서 발송 경로
--  (app/api/track · app/api/quote)만 서버 전용 service_role 키로 이 두 테이블에
--  접근한다. 아래 RLS/GRANT는 그 외 모든 경로(익명·일반 로그인)를 차단한다.
--  service_role 키는 클라이언트 번들에 절대 들어가면 안 된다 —
--  lib/supabase-service.ts 가 서버 전용임을 런타임에서 강제한다.
-- ─────────────────────────────────────────────


-- ═══════════════════════════════════════════════
--  1) 알림 받을 기기
--
--  브라우저가 알림 권한을 받으면 PushSubscription을 발급한다. 그 값이 곧
--  "이 기기로 알림을 보내는 주소"다. endpoint는 기기마다 유일하므로
--  같은 기기가 다시 등록하면 새 행이 아니라 기존 행을 갱신한다(upsert).
-- ═══════════════════════════════════════════════
create table if not exists public.push_subscriptions (
  id              uuid primary key default gen_random_uuid(),
  endpoint        text not null unique,     -- 푸시 서비스(FCM/Mozilla/WNS) 주소
  p256dh          text not null,            -- 페이로드 암호화용 공개키
  auth            text not null,            -- 페이로드 암호화용 인증 시크릿
  label           text,                     -- 사장님이 알아볼 이름 ('사장님 아이폰')
  user_agent      text,
  device          text,                     -- mobile | tablet | desktop
  active          boolean not null default true,
  failure_count   int not null default 0,   -- 연속 실패 횟수 (일시 장애 판단용)
  last_error      text,
  last_success_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references auth.users(id) on delete set null,

  constraint push_sub_endpoint_len check (char_length(endpoint) between 20 and 1000),
  constraint push_sub_p256dh_len   check (char_length(p256dh)   between 10 and 200),
  constraint push_sub_auth_len     check (char_length(auth)     between 5  and 100),
  constraint push_sub_label_len    check (label      is null or char_length(label)      <= 40),
  constraint push_sub_ua_len       check (user_agent is null or char_length(user_agent) <= 300),
  constraint push_sub_device_len   check (device     is null or char_length(device)     <= 12)
);

create index if not exists push_subscriptions_active_idx
  on public.push_subscriptions (active, created_at desc);

drop trigger if exists push_subscriptions_touch on public.push_subscriptions;
create trigger push_subscriptions_touch before update on public.push_subscriptions
  for each row execute function public.touch_updated_at();

alter table public.push_subscriptions enable row level security;

-- 관리자만 자기 기기 목록을 보고 지울 수 있다. 익명에게는 어떤 권한도 없다.
-- (발송은 RLS를 우회하는 service_role이 담당한다 — 위 헤더 주석 참고)
drop policy if exists "push_subscriptions admin all" on public.push_subscriptions;
create policy "push_subscriptions admin all"
  on public.push_subscriptions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on table public.push_subscriptions from anon, authenticated;
grant select, insert, update, delete on table public.push_subscriptions to authenticated;


-- ═══════════════════════════════════════════════
--  2) 알림 설정 (한 행만 존재)
--
--  types                : 알림을 보낼 이벤트 종류
--                         cta_click | phone_click | kakao_click | form_start | lead
--  min_interval_minutes : 같은 방문자·같은 종류의 반복 알림 억제 간격.
--                         이게 없으면 한 사람이 버튼을 세 번 누를 때 알림도 세 번 온다.
--  quiet_start/end      : 방해금지 시간대 (한국시간 0~23시). null이면 없음.
--                         예) 22~7 이면 밤 10시부터 아침 7시까지 알림을 보내지 않는다.
--                         단, 견적문의 접수(lead)는 방해금지에도 항상 보낸다.
-- ═══════════════════════════════════════════════
create table if not exists public.notification_settings (
  id                   boolean primary key default true,
  enabled              boolean not null default true,
  types                text[]  not null default array['cta_click','phone_click','kakao_click','lead'],
  min_interval_minutes int     not null default 30,
  quiet_start          int,
  quiet_end            int,
  updated_at           timestamptz not null default now(),
  updated_by           uuid references auth.users(id) on delete set null,

  constraint notification_settings_singleton check (id),
  constraint notification_settings_interval  check (min_interval_minutes between 0 and 1440),
  constraint notification_settings_quiet_s   check (quiet_start is null or quiet_start between 0 and 23),
  constraint notification_settings_quiet_e   check (quiet_end   is null or quiet_end   between 0 and 23),
  constraint notification_settings_types_len check (array_length(types, 1) is null or array_length(types, 1) <= 10)
);

insert into public.notification_settings (id) values (true) on conflict (id) do nothing;

drop trigger if exists notification_settings_touch on public.notification_settings;
create trigger notification_settings_touch before update on public.notification_settings
  for each row execute function public.touch_updated_at();

alter table public.notification_settings enable row level security;

drop policy if exists "notification_settings admin all" on public.notification_settings;
create policy "notification_settings admin all"
  on public.notification_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on table public.notification_settings from anon, authenticated;
grant select, insert, update on table public.notification_settings to authenticated;


-- ═══════════════════════════════════════════════
--  3) 적용 후 확인
-- ═══════════════════════════════════════════════
-- 3-1) 익명 권한 점검 — 두 테이블 모두 결과에 나오지 않아야 정상
--   select table_name, string_agg(privilege_type, ',' order by privilege_type)
--     from information_schema.role_table_grants
--    where table_schema='public' and grantee='anon'
--      and table_name in ('push_subscriptions','notification_settings')
--    group by table_name;
--
-- 3-2) 설정 확인
--   select * from public.notification_settings;
--
-- 3-3) 등록된 기기 확인 (어드민 → 알림 설정 화면에서도 볼 수 있다)
--   select label, device, active, failure_count, last_success_at
--     from public.push_subscriptions order by created_at;
