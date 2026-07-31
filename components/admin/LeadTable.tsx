'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Mail, ChevronDown, ChevronUp, Loader2, Check } from 'lucide-react';
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

const STATUS_STYLES: Record<string, string> = {
  new:       'bg-brand text-white',
  contacted: 'bg-blue-100 text-blue-800',
  quoted:    'bg-amber-100 text-amber-800',
  won:       'bg-green-100 text-green-800',
  lost:      'bg-slate-200 text-slate-600',
};

export default function LeadTable({ rows }: { rows: LeadRow[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
        <p className="text-slate-400">아직 접수된 견적문의가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
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
    <div className={status === 'new' ? 'bg-brand-tint/40' : ''}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <button
          onClick={onToggle}
          aria-expanded={open}
          className="flex-1 min-w-0 text-left flex flex-wrap items-center gap-x-3 gap-y-1"
        >
          <span
            className={`text-[0.6875rem] font-bold px-2 py-0.5 rounded flex-shrink-0 ${STATUS_STYLES[status] ?? STATUS_STYLES.new}`}
          >
            {LEAD_STATUS_LABELS[status as LeadStatus] ?? status}
          </span>
          <span className="font-bold text-ink truncate">
            {lead.name}
            {lead.company_name && <span className="font-normal text-slate-500"> · {lead.company_name}</span>}
          </span>
          <span className="text-sm text-slate-500 font-mono tabular-nums">{lead.phone}</span>
          <span className="text-sm text-slate-400 truncate">
            {CategoryLabels[lead.category as keyof typeof CategoryLabels] ?? lead.category}
          </span>
          <span className="text-xs text-slate-400 tabular-nums ml-auto whitespace-nowrap">
            {formatDate(lead.created_at)}
          </span>
        </button>

        <a
          href={`tel:${lead.phone}`}
          aria-label={`${lead.name}에게 전화`}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-signal text-white hover:brightness-105 flex-shrink-0"
        >
          <Phone className="w-4 h-4" />
        </a>
        <button
          onClick={onToggle}
          aria-label={open ? '접기' : '펼치기'}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 flex-shrink-0"
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {open && (
        <div className="px-4 pb-5 space-y-4 bg-white border-t border-slate-100 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <Detail label="유입 경로">
              {CHANNEL_LABELS[channel] ?? channel}
              {isPaid && (
                <span className="ml-2 text-[0.6875rem] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                  유료 광고
                </span>
              )}
            </Detail>
            {lead.utm_campaign && <Detail label="캠페인">{lead.utm_campaign}</Detail>}
            {lead.utm_term && <Detail label="검색어">{lead.utm_term}</Detail>}
            {lead.landing_path && <Detail label="첫 방문 페이지">{lead.landing_path}</Detail>}
            {lead.region && <Detail label="시공 지역">{lead.region}</Detail>}
            {lead.email && (
              <Detail label="이메일">
                <a href={`mailto:${lead.email}`} className="text-brand hover:underline inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {lead.email}
                </a>
              </Detail>
            )}
            {lead.source && <Detail label="접수 위치">{lead.source}</Detail>}
          </div>

          {lead.message && (
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">문의 내용</p>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-3">
                {lead.message}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); save({ status: s }); }}
                disabled={isPending}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  status === s
                    ? 'bg-brand text-white'
                    : 'border border-slate-300 text-slate-600 hover:border-brand hover:text-brand'
                }`}
              >
                {LEAD_STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">처리 메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              onBlur={() => memo !== (lead.memo ?? '') && save({ memo })}
              rows={2}
              placeholder="통화 내용, 견적 금액, 다음 할 일 등"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            />
            <div className="h-5 mt-1">
              {isPending && (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Loader2 className="w-3 h-3 animate-spin" /> 저장 중…
                </span>
              )}
              {saved && !isPending && (
                <span className="inline-flex items-center gap-1.5 text-xs text-green-700">
                  <Check className="w-3 h-3" /> 저장됨
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
      <span className="text-slate-400 flex-shrink-0">{label}</span>
      <span className="text-ink font-medium min-w-0 break-all">{children}</span>
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
