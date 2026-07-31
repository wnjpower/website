'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Check, Loader2, AlertCircle, FlaskConical, Pencil, X } from 'lucide-react';
import {
  CTA_SLOTS, CTA_SLOT_LABELS, CTA_SLOT_HINTS, CTA_STYLE_LABELS, CTA_DEFAULTS,
  type CtaSlot, type CtaStyle,
} from '@/lib/cta/schema';
import { saveCta, deleteCta, type CtaInput } from '@/app/admin/actions';

export interface CtaRow {
  id: string;
  slot: string;
  variant: string;
  label: string;
  sublabel: string | null;
  href: string;
  style: string;
  icon: string | null;
  weight: number;
  active: boolean;
  note: string | null;
}

const ICON_CHOICES = [
  { value: '',       label: '없음' },
  { value: 'Phone',  label: '전화' },
  { value: 'ArrowRight', label: '화살표' },
  { value: 'FileText',   label: '문서' },
  { value: 'MessageSquare', label: '말풍선' },
  { value: 'CheckCircle2',  label: '체크' },
];

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-ink ' +
  'focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand';

export default function CtaManager({ rows }: { rows: CtaRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Partial<CtaRow> | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const bySlot = new Map<string, CtaRow[]>();
  for (const row of rows) {
    const list = bySlot.get(row.slot) ?? [];
    list.push(row);
    bySlot.set(row.slot, list);
  }

  function save(input: CtaInput) {
    startTransition(async () => {
      const result = await saveCta(input);
      if (result.ok) {
        setMessage({ ok: true, text: result.message ?? '저장했습니다.' });
        setEditing(null);
        router.refresh();
      } else {
        setMessage({ ok: false, text: result.error });
      }
    });
  }

  function remove(id: string, label: string) {
    if (!confirm(`'${label}' 버튼을 삭제합니다. 계속할까요?`)) return;
    startTransition(async () => {
      const result = await deleteCta(id);
      setMessage(result.ok ? { ok: true, text: result.message ?? '삭제했습니다.' } : { ok: false, text: result.error });
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {message && (
        <p
          className={`flex gap-2 items-start rounded-lg px-4 py-3 text-sm ${
            message.ok
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.ok ? <Check className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          {message.text}
        </p>
      )}

      {CTA_SLOTS.map((slot) => {
        const variants = (bySlot.get(slot) ?? []).sort((a, b) => a.variant.localeCompare(b.variant));
        const usingDefault = variants.length === 0;
        const fallback = CTA_DEFAULTS[slot];

        return (
          <div key={slot} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-bold text-ink">{CTA_SLOT_LABELS[slot]}</h2>
                  <p className="text-sm text-slate-500 break-keep">{CTA_SLOT_HINTS[slot]}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {variants.length > 1 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded bg-brand-tint text-brand-700">
                      <FlaskConical className="w-3.5 h-3.5" />
                      A/B 실험 중
                    </span>
                  )}
                  <button
                    onClick={() =>
                      setEditing({
                        slot,
                        variant: nextVariantName(variants),
                        label: usingDefault ? fallback.label : '',
                        href: usingDefault ? fallback.href : '',
                        style: usingDefault ? fallback.style : 'primary',
                        icon: usingDefault ? fallback.icon : '',
                        weight: 100,
                        active: true,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:border-brand hover:text-brand transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {usingDefault ? '직접 설정' : '변형 추가'}
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {usingDefault && (
                <div className="px-4 sm:px-5 py-4 flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-slate-300 w-6">–</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-500 truncate">{fallback.label}</p>
                    <p className="text-xs text-slate-400 truncate font-mono">{fallback.href}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">기본값 사용 중</span>
                </div>
              )}

              {variants.map((cta) => (
                <div key={cta.id} className="px-4 sm:px-5 py-4 flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-brand w-6 flex-shrink-0">{cta.variant}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold truncate ${cta.active ? 'text-ink' : 'text-slate-400 line-through'}`}>
                      {cta.label}
                    </p>
                    <p className="text-xs text-slate-400 truncate font-mono">{cta.href}</p>
                    {cta.note && <p className="text-xs text-slate-500 mt-0.5 truncate">메모: {cta.note}</p>}
                  </div>
                  {variants.length > 1 && (
                    <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap hidden sm:block">
                      비중 {cta.weight}
                    </span>
                  )}
                  <button
                    onClick={() => setEditing(cta)}
                    aria-label="수정"
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand hover:bg-slate-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => remove(cta.id, cta.label)}
                    aria-label="삭제"
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {editing && (
        <CtaDialog
          value={editing}
          pending={isPending}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

/** A, B, C … 순으로 다음 이름을 제안한다. */
function nextVariantName(existing: CtaRow[]): string {
  const used = new Set(existing.map((v) => v.variant));
  for (const c of 'ABCDEFGH') if (!used.has(c)) return c;
  return `V${existing.length + 1}`;
}

function CtaDialog({
  value,
  pending,
  onCancel,
  onSave,
}: {
  value: Partial<CtaRow>;
  pending: boolean;
  onCancel: () => void;
  onSave: (input: CtaInput) => void;
}) {
  const [form, setForm] = useState({
    label:    value.label ?? '',
    sublabel: value.sublabel ?? '',
    href:     value.href ?? '',
    style:    (value.style ?? 'primary') as CtaStyle,
    icon:     value.icon ?? '',
    variant:  value.variant ?? 'A',
    weight:   value.weight ?? 100,
    active:   value.active ?? true,
    note:     value.note ?? '',
  });

  function set<K extends keyof typeof form>(key: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: v }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-5">
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
          <h2 className="font-bold text-ink">
            {CTA_SLOT_LABELS[value.slot as CtaSlot] ?? '버튼'} — {value.id ? '수정' : '추가'}
          </h2>
          <button onClick={onCancel} aria-label="닫기" className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Field label="버튼 문구" help="실제로 버튼에 보이는 글자입니다.">
            <input className={inputClass} value={form.label} onChange={(e) => set('label', e.target.value)} maxLength={60} />
          </Field>

          <Field label="링크" help="전화는 tel:010-8552-9994, 견적폼은 #quote, 페이지는 /portfolio 형태로 씁니다.">
            <input className={`${inputClass} font-mono text-sm`} value={form.href} onChange={(e) => set('href', e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="색상">
              <select className={inputClass} value={form.style} onChange={(e) => set('style', e.target.value as CtaStyle)}>
                {Object.entries(CTA_STYLE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="아이콘">
              <select className={inputClass} value={form.icon} onChange={(e) => set('icon', e.target.value)}>
                {ICON_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <p className="text-sm font-bold text-ink flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-brand" />
              A/B 실험 설정
            </p>
            <p className="text-xs text-slate-500 leading-relaxed break-keep">
              같은 자리에 변형을 두 개 이상 만들면 방문자에게 나눠 보여주고 클릭률을 비교합니다.
              한 사람에게는 항상 같은 변형이 보이므로 화면이 바뀌어 혼란스러울 일은 없습니다.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="변형 이름">
                <input
                  className={`${inputClass} font-mono`}
                  value={form.variant}
                  onChange={(e) => set('variant', e.target.value.toUpperCase().slice(0, 10))}
                  maxLength={10}
                />
              </Field>
              <Field label="노출 비중" help="둘 다 100이면 반반">
                <input
                  type="number"
                  min={0}
                  max={1000}
                  className={inputClass}
                  value={form.weight}
                  onChange={(e) => set('weight', Number(e.target.value))}
                />
              </Field>
            </div>
            <Field label="실험 메모" help="무엇을 시험하는지 적어두면 나중에 결과를 해석하기 쉽습니다.">
              <input className={inputClass} value={form.note} onChange={(e) => set('note', e.target.value)} maxLength={200} />
            </Field>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set('active', e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-brand focus:ring-brand"
            />
            <span className="text-sm font-semibold text-ink">이 버튼을 사이트에 표시</span>
          </label>
        </div>

        <div className="sticky bottom-0 flex gap-2 px-5 py-4 border-t border-slate-200 bg-white">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-300 py-3 font-semibold text-slate-600 hover:border-slate-400"
          >
            취소
          </button>
          <button
            onClick={() =>
              onSave({
                id: value.id,
                slot: value.slot!,
                variant: form.variant,
                label: form.label,
                sublabel: form.sublabel || null,
                href: form.href,
                style: form.style,
                icon: form.icon || null,
                weight: form.weight,
                active: form.active,
                note: form.note || null,
              })
            }
            disabled={pending}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand-700 text-white font-bold py-3 transition-colors disabled:opacity-60"
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-bold text-ink">{label}</label>
      {children}
      {help && <p className="text-xs text-slate-500 leading-relaxed">{help}</p>}
    </div>
  );
}
