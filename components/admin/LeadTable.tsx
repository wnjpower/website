'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Mail, ChevronDown, ChevronUp, Loader2, Check } from 'lucide-react';
import { Chip, Empty } from './ui';
import { updateLead } from '@/app/admin/actions';
import { LEAD_STATUS_LABELS, type LeadStatus } from '@/lib/leads';
import { CHANNEL_LABELS, PAID_CHANNELS, type Channel } from '@/lib/analytics/attribution';
import { CategoryLabels } from '@/lib/validators';

export interface LeadRow {
  id: number;
  created_at: string;
  company_name: string | null;
  name: string;
  phone: string;
  email: string | null;
  region: string | null;
  category: string;
  message: string | null;
  source: string | null;
  status: string;
  memo: string | null;
  channel: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  landing_path: string | null;
}

/** 상태 배지 — 미연락(new)만 액센트로 채워 눈에 걸리게 한다 */
const STATUS_TONE: Record<string, 'accent' | 'outline' | 'ok' | 'warn' | 'muted'> = {
  new:       'accent',
  contacted: 'outline',
  quoted:    'warn',
  won:       'ok',
  lost:      'muted',
};

export default function LeadTable({ rows }: { rows: LeadRow[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  if (rows.length === 0) {
    return (
      <div className="a-panel">
        <Empty>아직 접수된 견적문의가 없습니다.</Empty>
      </div>
    );
  }

  return (
    <div className="a-panel a-rows">
      {rows.map((lead) => (
        <LeadItem
          key={lead.id}
          lead={lead}
          open={openId === lead.id}
          onToggle={() => setOpenId(openId === lead.id ? null : lead.id)}
        />
      ))}
    </div>
  );
}

function LeadItem({
  lead,
  open,
  onToggle,
}: {
  lead: LeadRow;
  open: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [memo, setMemo] = useState(lead.memo ?? '');
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const channel = (lead.channel ?? 'direct') as Channel;
  const isPaid = PAID_CHANNELS.includes(channel);

  function save(patch: { status?: string; memo?: string }) {
    startTransition(async () => {
      const result = await updateLead(lead.id, patch);
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    });
  }

  return (
    <div style={status === 'new' ? { background: 'rgba(89,128,166,0.06)' } : undefined}>
      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <button
          onClick={onToggle}
          aria-expanded={open}
          className="flex-1 min-w-0 text-left flex flex-wrap items-center gap-x-3 gap-y-1"
        >
          <Chip tone={STATUS_TONE[status] ?? 'accent'}>
            {LEAD_STATUS_LABELS[status as LeadStatus] ?? status}
          </Chip>
          <span className="truncate" style={{ fontWeight: 700 }}>
            {lead.name}
            {lead.company_name && (
              <span className="text-muted" style={{ fontWeight: 400 }}> · {lead.company_name}</span>
            )}
          </span>
          <span className="mono-num" style={{ fontSize: 14 }}>{lead.phone}</span>
          <span className="text-muted truncate" style={{ fontSize: 13 }}>
            {CategoryLabels[lead.category as keyof typeof CategoryLabels] ?? lead.category}
          </span>
          <span className="mono-num text-muted ml-auto whitespace-nowrap" style={{ fontSize: 12 }}>
            {formatDate(lead.created_at)}
          </span>
        </button>

        <a
          href={`tel:${lead.phone}`}
          aria-label={`${lead.name}에게 전화`}
          className="a-btn a-btn--icon a-btn--solid"
        >
          <Phone className="w-4 h-4" strokeWidth={1.5} />
        </a>
        <button
          onClick={onToggle}
          aria-label={open ? '접기' : '펼치기'}
          className="a-btn a-btn--icon a-btn--ghost"
        >
          {open
            ? <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
            : <ChevronDown className="w-4 h-4" strokeWidth={1.5} />}
        </button>
      </div>

      {open && (
        <div
          className="px-3.5 pb-5 pt-4 space-y-4"
          style={{ background: 'var(--a-panel)', borderTop: '1px solid var(--color-divider)' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5" style={{ fontSize: 13.5 }}>
            <Detail label="유입 경로">
              {CHANNEL_LABELS[channel] ?? channel}
              {isPaid && <Chip tone="warn" className="ml-2">유료 광고</Chip>}
            </Detail>
            {lead.utm_campaign && <Detail label="캠페인">{lead.utm_campaign}</Detail>}
            {lead.utm_term && <Detail label="검색어">{lead.utm_term}</Detail>}
            {lead.landing_path && <Detail label="첫 방문 페이지">{lead.landing_path}</Detail>}
            {lead.region && <Detail label="시공 지역">{lead.region}</Detail>}
            {lead.email && (
              <Detail label="이메일">
                <a href={`mailto:${lead.email}`} className="a-link inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {lead.email}
                </a>
              </Detail>
            )}
            {lead.source && <Detail label="접수 위치">{lead.source}</Detail>}
          </div>

          {lead.message && (
            <div>
              <p className="bp-label">문의 내용</p>
              <p
                className="whitespace-pre-wrap break-keep"
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.7,
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-divider)',
                  padding: '11px 13px',
                }}
              >
                {lead.message}
              </p>
            </div>
          )}

          <div>
            <p className="bp-label">진행 상태</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatus(s); save({ status: s }); }}
                  disabled={isPending}
                  className={`a-btn a-btn--sm ${status === s ? 'a-btn--solid' : ''}`}
                >
                  {LEAD_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="bp-label" htmlFor={`memo-${lead.id}`}>처리 메모</label>
            <textarea
              id={`memo-${lead.id}`}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              onBlur={() => memo !== (lead.memo ?? '') && save({ memo })}
              rows={2}
              placeholder="통화 내용, 견적 금액, 다음 할 일 등"
              className="bp-input"
            />
            <div className="h-5 mt-1">
              {isPending && (
                <span className="text-muted inline-flex items-center gap-1.5" style={{ fontSize: 12 }}>
                  <Loader2 className="w-3 h-3 bp-spin" strokeWidth={1.5} /> 저장 중…
                </span>
              )}
              {saved && !isPending && (
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{ fontSize: 12, color: 'var(--a-ok)' }}
                >
                  <Check className="w-3 h-3" strokeWidth={1.5} /> 저장됨
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted flex-shrink-0">{label}</span>
      <span className="min-w-0 break-all" style={{ fontWeight: 500 }}>{children}</span>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
    : d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
}
