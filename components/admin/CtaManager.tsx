'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2, FlaskConical, Pencil, X } from 'lucide-react';
import { Panel, Chip, Field, ResultNote, Switch } from './ui';
import {
  CTA_SLOTS, CTA_SLOT_LABELS, CTA_SLOT_HINTS, CTA_DEFAULTS,
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
    <div className="space-y-3.5">
      {message && <ResultNote ok={message.ok} text={message.text} />}

      {CTA_SLOTS.map((slot) => {
        const variants = (bySlot.get(slot) ?? []).sort((a, b) => a.variant.localeCompare(b.variant));
        const usingDefault = variants.length === 0;
        const fallback = CTA_DEFAULTS[slot];

        return (
          <Panel
            key={slot}
            title={CTA_SLOT_LABELS[slot]}
            note={CTA_SLOT_HINTS[slot]}
            flush
            action={
              <div className="flex items-center gap-2 flex-shrink-0">
                {variants.length > 1 && (
                  <Chip tone="outline">
                    <FlaskConical className="w-3.5 h-3.5" strokeWidth={1.5} />
                    A/B 실험 중
                  </Chip>
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
                  className="a-btn a-btn--sm"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {usingDefault ? '직접 설정' : '변형 추가'}
                </button>
              </div>
            }
          >
            <div className="a-rows">
              {usingDefault && (
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span className="display w-6 text-center flex-shrink-0" style={{ color: 'rgba(29,31,32,0.3)' }}>
                    –
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-muted truncate" style={{ fontWeight: 500 }}>{fallback.label}</p>
                    <p className="text-muted mono-num truncate" style={{ fontSize: 11.5 }}>{fallback.href}</p>
                  </div>
                  <span className="text-muted whitespace-nowrap" style={{ fontSize: 12 }}>기본값 사용 중</span>
                </div>
              )}

              {variants.map((cta) => (
                <div key={cta.id} className="flex items-center gap-3 px-4 py-3.5">
                  <span
                    className="display w-6 text-center flex-shrink-0"
                    style={{ fontSize: 16, color: 'var(--color-accent-700)' }}
                  >
                    {cta.variant}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate"
                      style={{
                        fontWeight: 500,
                        opacity: cta.active ? 1 : 0.5,
                        textDecoration: cta.active ? undefined : 'line-through',
                      }}
                    >
                      {cta.label}
                    </p>
                    <p className="text-muted mono-num truncate" style={{ fontSize: 11.5 }}>{cta.href}</p>
                    {cta.note && (
                      <p className="text-muted truncate" style={{ fontSize: 12 }}>메모: {cta.note}</p>
                    )}
                  </div>
                  {variants.length > 1 && (
                    <span className="mono-num text-muted whitespace-nowrap hidden sm:block" style={{ fontSize: 12 }}>
                      비중 {cta.weight}
                    </span>
                  )}
                  <button onClick={() => setEditing(cta)} aria-label="수정" className="a-btn a-btn--icon a-btn--sm a-btn--ghost">
                    <Pencil className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => remove(cta.id, cta.label)}
                    aria-label="삭제"
                    className="a-btn a-btn--icon a-btn--sm a-btn--ghost a-btn--danger"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          </Panel>
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
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-5"
      style={{ background: 'rgba(29,45,61,0.5)' }}
    >
      <div
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--a-panel)', border: '1px solid var(--color-divider)' }}
      >
        <div className="a-panel-head sticky top-0 z-10" style={{ alignItems: 'center', background: 'var(--a-panel)' }}>
          <h2 className="a-panel-title">
            {CTA_SLOT_LABELS[value.slot as CtaSlot] ?? '버튼'} — {value.id ? '수정' : '추가'}
          </h2>
          <button onClick={onCancel} aria-label="닫기" className="a-btn a-btn--icon a-btn--sm a-btn--ghost">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="a-panel-body space-y-4">
          <Field label="버튼 문구" help="실제로 버튼에 보이는 글자입니다.">
            <input className="bp-input" value={form.label} onChange={(e) => set('label', e.target.value)} maxLength={60} />
          </Field>

          <Field label="링크" help="전화는 tel:010-8552-9994, 견적폼은 #quote, 페이지는 /portfolio 형태로 씁니다.">
            <input className="bp-input mono-num" value={form.href} onChange={(e) => set('href', e.target.value)} />
          </Field>

          {/*
            «색상» 선택은 뺐다. 1b 블루프린트에는 강조색이 액센트 하나뿐이라
            어느 값을 골라도 화면이 같았다 — 고쳐도 안 바뀌는 칸은 «저장이 안 된다»는
            오해를 만든다. 저장된 값과 DB 컬럼은 그대로 두므로 되살리기는 쉽다.
          */}
          <Field label="아이콘" help="문구 앞에 붙는 작은 그림입니다. 전화 버튼에만 쓰고 있습니다.">
            <select className="bp-input" value={form.icon} onChange={(e) => set('icon', e.target.value)}>
              {ICON_CHOICES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>

          <div className="space-y-3 p-4" style={{ border: '1px solid var(--color-divider)', background: 'var(--color-bg)' }}>
            <p className="display flex items-center gap-2" style={{ fontSize: 15 }}>
              <FlaskConical className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-accent-700)' }} />
              A/B 실험 설정
            </p>
            <p className="a-help">
              같은 자리에 변형을 두 개 이상 만들면 방문자에게 나눠 보여주고 클릭률을 비교합니다.
              한 사람에게는 항상 같은 변형이 보이므로 화면이 바뀌어 혼란스러울 일은 없습니다.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="변형 이름">
                <input
                  className="bp-input display"
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
                  className="bp-input mono-num"
                  value={form.weight}
                  onChange={(e) => set('weight', Number(e.target.value))}
                />
              </Field>
            </div>
            <Field label="실험 메모" help="무엇을 시험하는지 적어두면 나중에 결과를 해석하기 쉽습니다.">
              <input className="bp-input" value={form.note} onChange={(e) => set('note', e.target.value)} maxLength={200} />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span style={{ fontWeight: 500 }}>이 버튼을 사이트에 표시</span>
            <Switch checked={form.active} onChange={(v) => set('active', v)} label="사이트에 표시" />
          </div>
        </div>

        <div
          className="sticky bottom-0 flex gap-2 px-4 py-3.5"
          style={{ borderTop: '1px solid var(--color-divider)', background: 'var(--a-panel)' }}
        >
          <button onClick={onCancel} className="a-btn flex-1">취소</button>
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
            className="a-btn a-btn--solid flex-1"
          >
            {pending && <Loader2 className="w-4 h-4 bp-spin" strokeWidth={1.5} />}
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
