-- 1b 재구축이 남긴 DB 잔재 정리 (2026-08-05)
--
-- 화면에서 쓰지 않게 된 지 오래인 두 가지를 지운다. 코드에서 참조를 먼저 걷어내고
-- 배포한 뒤에 이 파일을 적용해야 한다 — 순서를 뒤집으면 어드민의 CTA 저장이
-- "column style does not exist"로 깨진다.
--
-- 적용:
--   POST https://api.supabase.com/v1/projects/wtlvbilsakoktcrrqlfi/database/query
--   본문 {"query": "<이 파일 전체>"}   (PAT 필요)
--   또는 Supabase 대시보드 → SQL Editor 에 붙여넣기.
--
-- 이 파일은 몇 번을 돌려도 안전하다(멱등).
--   · drop column if exists      — 이미 없으면 넘어간다
--   · data - '키'                — 이미 없으면 값이 그대로다
--   · delete ... where key=...   — 이미 없으면 0행이다
--
-- ── 적용 현황 ─────────────────────────────────────────────────────────────
--   [x] ② site_content / site_drafts 옛 키 정리 (2026-08-05) — service_role로 적용.
--          결과: 두 테이블 모두 header(8키)·services(3키)·seo(3키)만 남음.
--          footer 행은 site_content에서 1행 삭제(site_drafts에는 원래 없었음).
--   [x] ① alter table ... drop column style (2026-08-06) — Supabase MCP로 적용.
--          service_role로는 DDL이 안 돼 미뤄 뒀던 한 줄이다. 적용 직전 확인:
--          ctas 0행 · style 컬럼 존재. 적용 후 남은 컬럼이 코드의 Cta 타입과
--          정확히 일치한다(id·slot·variant·label·sublabel·href·icon·weight·
--          active·note·created_at·updated_at).
--
-- 되돌리기: 파일 맨 아래 주석 참조.

begin;

-- ── ① ctas.style ──────────────────────────────────────────────────────────
--
-- 1b 블루프린트에는 강조색이 액센트 하나뿐이라 어느 값을 골라도 화면이 같았다.
-- 편집 화면 → 이름표(CTA_STYLE_LABELS) → 타입·조회·저장 순으로 걷어냈고
-- 마지막으로 컬럼을 지운다.
--
-- 적용 시점에 ctas 테이블은 0행이었다. 즉 잃는 데이터가 없다.
-- (0행인 이유: 어드민에서 "이 자리를 실험에 쓰겠다"고 등록한 슬롯만 행이 생기고,
--  아직 아무 자리도 등록하지 않아 전부 코드의 CTA_DEFAULTS로 렌더되고 있다.)

alter table public.ctas drop column if exists style;

-- ── ② site_content / site_drafts 의 옛 키 ─────────────────────────────────
--
-- 스키마에서 사라진 필드들이 저장된 JSON에 남아 있었다.
--   header.logoSub        — 로고+한글 상호로 교체되며 없어짐
--   services.eyebrow      — 섹션 머리말이 제목+리드 2단으로 정리됨
--   seo.ogImageHeadline   — OG 이미지가 고정 문구로 바뀜
--
-- 이 값들은 이미 화면에 도달하지 못한다. lib/content/get.ts 의 mergeDeep 이
-- "기본값에 없는 키는 버린다"고 명시적으로 걸러내기 때문이다. 따라서 이 정리는
-- 동작을 바꾸지 않고, 저장된 것과 실제로 쓰이는 것을 일치시킬 뿐이다.

update public.site_content set data = data - 'logoSub'        where key = 'header';
update public.site_content set data = data - 'eyebrow'        where key = 'services';
update public.site_content set data = data - 'ogImageHeadline' where key = 'seo';

update public.site_drafts  set data = data - 'logoSub'        where key = 'header';
update public.site_drafts  set data = data - 'eyebrow'        where key = 'services';
update public.site_drafts  set data = data - 'ogImageHeadline' where key = 'seo';

-- footer 섹션 자체가 없어졌다. 푸터는 사업자정보 고정 블록이라 편집 대상이 아니다.
-- 행이 남아 있어도 렌더되지 않지만, 어드민에 보이지 않는 행이 DB에 있으면
-- 다음 사람이 "이건 왜 있지"를 다시 조사하게 된다.
delete from public.site_content where key = 'footer';
delete from public.site_drafts  where key = 'footer';

commit;

-- ── 되돌리기 ──────────────────────────────────────────────────────────────
--
-- 컬럼:
--   alter table public.ctas add column style text not null default 'primary';
--
-- 옛 키: 적용 직전 값을 그대로 옮겨 둔다. 아래 UPDATE를 거꾸로 돌리면 복구된다.
--
--   update public.site_content set data = data
--     || '{"logoSub":"공장·산업 전기공사 전문"}'::jsonb where key = 'header';
--   update public.site_content set data = data
--     || '{"eyebrow":"사업영역"}'::jsonb where key = 'services';
--   update public.site_content set data = data
--     || '{"ogImageHeadline":"대구·경북 공장·상업시설 전기공사"}'::jsonb where key = 'seo';
--   insert into public.site_content (key, data) values ('footer',
--     '{"note":"","tagline":"대구·경북 공장·산업·상업시설 전기공사 전문 · 전기공사업 등록 법인"}'::jsonb);
--
--   site_drafts 도 header·services·seo 세 행에 같은 값이 있었다(footer 행은 없었다).
