'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { gtagEvent } from '@/components/GoogleAnalytics';
import { track } from '@/components/analytics/Tracker';
import { CornerMarks } from '@/components/redesign/Chrome';
import { COMPANY } from '@/lib/site';
import type { SiteContent } from '@/lib/content/schema';

/**
 * 히어로 직하 퀵폼 — 이탈 회수 경로.
 *
 * 본 견적폼은 입력 요소가 9개다. 공사 사양을 글로 적기 부담스러워 이탈하는 사람을
 * 위해 "연락처만" 경로를 앞쪽에 둔다. 접수는 기존 /api/quote 파이프라인을 그대로
 * 타고 source='quick_bar'로 구분되므로, 어드민 실시간 현황에서 본폼과 전환율을
 * 나란히 비교할 수 있다(스펙 §8 — 이번 개편의 핵심 지표).
 *
 * 유형(공장·산업 / 인테리어·일반)만 받아 category로 매핑한다. 정확한 공종은
 * 어차피 통화로 확인하므로 여기서 더 묻지 않는다.
 */

const TYPES = [
  { key: 'industrial', label: '공장·산업',    category: 'factory_new' },
  { key: 'interior',   label: '인테리어·일반', category: 'interior_store' },
] as const;

export default function QuickQuoteBar({ content }: { content: SiteContent['quickForm'] }) {
  const [typeKey, setTypeKey] = useState<string>(TYPES[0].key);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const loadedAt = useRef(0);

  useEffect(() => {
    loadedAt.current = Date.now();
  }, []);

  if (!content.enabled) return null;

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length < 4) return digits;
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(phone)) {
      toast.error('연락처 형식을 확인해 주세요.');
      return;
    }

    const selected = TYPES.find((t) => t.key === typeKey) ?? TYPES[0];
    setSubmitting(true);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // 성함은 선택이라 비어 있을 수 있다. 서버 스키마가 2자 이상을 요구하므로
          // 비면 접수 경로를 알 수 있는 값으로 채운다(사장님이 목록에서 바로 구분 가능).
          name: name.trim() || '빠른 접수',
          phone,
          customerType: selected.key,
          category: selected.category,
          message: `[빠른 견적 접수] 유형: ${selected.label}`,
          agree: true,
          website: '',
          loadedAt: loadedAt.current,
          source: 'quick_bar',
        }),
      });

      if (res.ok) {
        gtagEvent('generate_lead', { source: 'quick_bar', category: selected.category });
        track({ type: 'lead', label: 'quick_bar' });
        setDone(true);
      } else if (res.status === 429) {
        toast.error('제출이 너무 빠릅니다. 잠시 후 다시 시도해 주세요.');
      } else {
        toast.error(`접수에 실패했습니다. ${COMPANY.mobile}로 전화 주세요.`, { duration: 10000 });
      }
    } catch {
      toast.error('네트워크 오류가 발생했습니다. 전화로 연락 주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="grid-field">
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 clamp(16px,4vw,48px) clamp(40px,5vw,64px)',
        }}
      >
        <div
          className="blueprint elev-md"
          style={{ position: 'relative', background: 'var(--color-bg)', padding: '22px clamp(16px,2vw,26px)' }}
        >
          <CornerMarks />

          {done ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '6px 0' }}>
              <CheckCircle2 size={28} strokeWidth={1.5} style={{ color: 'var(--color-accent-700)', flex: 'none' }} />
              <div>
                <p className="display" style={{ fontSize: 19, margin: 0 }}>
                  {content.successTitle}
                </p>
                <p className="text-muted" style={{ fontSize: 12.5, margin: '2px 0 0' }}>
                  {content.successNote}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'end' }}>
                <div style={{ flex: 'none', minWidth: 180 }}>
                  <p className="display" style={{ fontSize: 19, margin: 0 }}>
                    {content.title}
                  </p>
                  <p className="text-muted" style={{ fontSize: 12.5, margin: '2px 0 0' }}>
                    {content.note}
                  </p>
                </div>

                <div className="bp-seg" style={{ flex: 'none' }} role="group" aria-label="공사 유형">
                  {TYPES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTypeKey(t.key)}
                      aria-pressed={typeKey === t.key}
                      className="bp-seg-opt"
                      data-active={typeKey === t.key ? 'true' : undefined}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <label style={{ flex: 1, minWidth: 140, display: 'block' }}>
                  <span className="bp-label">성함 (선택)</span>
                  <input
                    className="bp-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    autoComplete="name"
                  />
                </label>

                <label style={{ flex: 1.2, minWidth: 170, display: 'block' }}>
                  <span className="bp-label">연락처 (필수)</span>
                  <input
                    className="bp-input mono-num"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="010-0000-0000"
                    autoComplete="tel"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  data-cta-slot="quick_bar_submit"
                  data-cta-variant="A"
                  className="display btn-solid"
                  style={{
                    flex: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 16,
                    padding: '9px 22px',
                    border: '1px solid var(--color-accent)',
                    cursor: 'pointer',
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  {submitting ? <Loader2 size={15} strokeWidth={1.5} className="bp-spin" /> : null}
                  견적 접수
                  {!submitting && <ArrowRight size={15} strokeWidth={1.5} />}
                </button>
              </div>

              <p className="text-muted" style={{ fontSize: 11.5, margin: '12px 0 0' }}>
                {content.consentNote} ·{' '}
                <a href="/privacy" style={{ textDecoration: 'underline' }}>
                  개인정보처리방침
                </a>{' '}
                · 자세한 문의는 <a href="#quote" style={{ textDecoration: 'underline' }}>아래 견적폼</a>으로
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
