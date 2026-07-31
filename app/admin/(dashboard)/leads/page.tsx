import Link from 'next/link';
import LeadTable, { type LeadRow } from '@/components/admin/LeadTable';
import PageHeader from '@/components/admin/PageHeader';
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
    <div className="space-y-5">
      <PageHeader
        title="견적문의"
        description={
          newCount > 0
            ? `아직 연락하지 않은 문의가 ${newCount}건 있습니다. 상태를 눌러 진행 상황을 기록하세요.`
            : '접수된 문의와 어느 광고에서 왔는지를 함께 확인할 수 있습니다.'
        }
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === 'all' ? '/admin/leads' : `/admin/leads?status=${f.value}`}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              status === f.value
                ? 'bg-brand text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-brand hover:text-brand'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          문의 목록을 불러오지 못했습니다: {error.message}
          <br />
          <span className="text-xs">
            supabase/admin-schema.sql의 quotes 관리자 정책이 적용되었는지 확인해 주세요.
          </span>
        </div>
      ) : (
        <LeadTable rows={rows} />
      )}
    </div>
  );
}
