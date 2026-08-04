import Link from 'next/link';
import LeadTable, { type LeadRow } from '@/components/admin/LeadTable';
import PageHeader from '@/components/admin/PageHeader';
import { Notice } from '@/components/admin/ui';
import { createServerSupabase } from '@/lib/supabase-server';
import { LEAD_STATUS_LABELS } from '@/lib/leads';

const FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: '전체' },
  ...Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status ?? 'all';

  const db = createServerSupabase();
  let query = db
    .from('quotes')
    .select(
      'id, created_at, company_name, name, phone, email, region, category, message, source, status, memo, channel, utm_campaign, utm_term, landing_path',
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (status !== 'all' && status in LEAD_STATUS_LABELS) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  const rows = (data ?? []) as LeadRow[];
  const newCount = rows.filter((r) => r.status === 'new').length;

  return (
    <div className="space-y-4">
      <PageHeader
        no="02"
        title="견적문의"
        description={
          newCount > 0
            ? `아직 연락하지 않은 문의가 ${newCount}건 있습니다. 상태를 눌러 진행 상황을 기록하세요.`
            : '접수된 문의와 어느 광고에서 왔는지를 함께 확인할 수 있습니다.'
        }
      />

      {/* 상태 필터 — 분절 선택과 같은 모양이지만 링크라 뒤로가기가 동작한다 */}
      <div className="bp-seg flex-wrap">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === 'all' ? '/admin/leads' : `/admin/leads?status=${f.value}`}
            className="bp-seg-opt display"
            data-active={status === f.value ? '' : undefined}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {error ? (
        <Notice tone="warn" title="문의 목록을 불러오지 못했습니다">
          <p>{error.message}</p>
          <p className="mt-1 opacity-80">
            <code>supabase/admin-schema.sql</code>의 quotes 관리자 정책이 적용되었는지 확인해 주세요.
          </p>
        </Notice>
      ) : (
        <LeadTable rows={rows} />
      )}
    </div>
  );
}
