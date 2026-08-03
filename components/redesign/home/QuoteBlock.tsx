'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle2, Loader2, Phone } from 'lucide-react';
import {
  QuoteSchema,
  type QuoteInput,
  CategoryLabels,
  CATEGORIES_BY_CUSTOMER_TYPE,
  CUSTOMER_TYPES,
  CustomerTypeLabels,
} from '@/lib/validators';
import { gtagEvent } from '@/components/GoogleAnalytics';
import { track } from '@/components/analytics/Tracker';
import { COMPANY } from '@/lib/site';
import { CornerMarks, SectionHead } from '@/components/redesign/Chrome';
import type { SiteContent } from '@/lib/content/schema';
import type { Cta, CtaSlot } from '@/lib/cta/schema';

/**
 * 07 견적 문의.
 *
 * 검증(zod)·제출(/api/quote)·알림톡·전환 추적은 기존 QuoteForm의 것을 그대로 쓴다.
 * 이번 개편에서 바뀐 건 표현뿐이다 — 단계 표시(STEP 1/2/3)를 없애고 한 화면에
 * 펼쳐 "얼마나 남았지"를 묻지 않게 했고, 오른쪽에 접수 후 절차를 두어 제출 전에
 * 무슨 일이 생기는지 알 수 있게 했다(P9).
 */

// 전화번호 자동 하이픈 (숫자만 입력 → 010-0000-0000)
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.startsWith('02')) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

/**
 * 서브페이지에서 넘어오는 공종 식별자를 견적폼 카테고리로 옮긴다.
 * `/services/panel`에서 들어온 사람에게 '공장 신축'이 선택돼 있으면
 * 직접 바꿔야 하고, 그만큼 이탈 지점이 하나 늘어난다.
 */
const CATEGORY_BY_SERVICE: Record<string, QuoteInput['category']> = {
  factory: 'factory_new',
  power: 'power_receiving',
  panel: 'switchboard',
  interior: 'interior_store',
};

export default function QuoteBlock({
  content,
  ctas,
  source = 'main_form',
  initialCategory,
  initialCustomerType,
}: {
  content: SiteContent['quote'];
  ctas: Record<CtaSlot, Cta>;
  source?: string;
  /** 서비스/사례 페이지의 공종 (factory·power·panel·interior) */
  initialCategory?: string;
  initialCustomerType?: string;
}) {
  const loadedAt = useRef(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [alimtalkSent, setAlimtalkSent] = useState(false);
  const submitCta = ctas.quote_submit;

  const startCategory: QuoteInput['category'] =
    (initialCategory ? CATEGORY_BY_SERVICE[initialCategory] : undefined) ?? 'factory_new';
  const startCustomerType: QuoteInput['customerType'] =
    (initialCustomerType as QuoteInput['customerType'] | undefined) ??
    (initialCategory === 'interior' ? 'interior' : 'industrial');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuoteInput>({
    resolver: zodResolver(QuoteSchema),
    defaultValues: {
      customerType: startCustomerType,
      category: startCategory,
      source,
      loadedAt: loadedAt.current,
    },
  });

  const customerType = watch('customerType') ?? 'industrial';
  const category = watch('category');
  const agree = watch('agree');
  const available = CATEGORIES_BY_CUSTOMER_TYPE[customerType];

  // 고객 유형을 바꾸면 선택 가능한 공종이 달라진다. 이전 선택이 목록에 없으면 첫 항목으로.
  useEffect(() => {
    if (!available.includes(category as never)) setValue('category', available[0]);
  }, [customerType, available, category, setValue]);

  const { onChange: phoneOnChange, ...phoneRest } = register('phone');

  async function onSubmit(data: QuoteInput) {
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, loadedAt: loadedAt.current }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (res.status === 429) {
          toast.error('제출이 너무 빠릅니다. 잠시 후 다시 시도해 주세요.');
        } else if (json?.error === 'delivery_failed') {
          toast.error(`접수에 실패했습니다. ${COMPANY.mobile}로 전화 주시면 바로 상담해 드립니다.`, {
            duration: 10000,
          });
        } else {
          toast.error('오류가 발생했습니다. 다시 시도해 주세요.');
        }
        return;
      }

      const json = await res.json().catch(() => ({}));
      setAlimtalkSent(Boolean(json?.alimtalkSent));
      setSubmitted(true);
      gtagEvent('generate_lead', { category: data.category, source });
      track({ type: 'lead', label: data.category, variant: submitCta.variant, ctaId: submitCta.id });
    } catch {
      toast.error('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  return (
    <section id="quote" className="grid-field" style={{ borderTop: '1px solid var(--color-divider)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(44px,6vw,72px) clamp(16px,4vw,48px)' }}>
        <SectionHead no="07" title={content.title} note={content.lead} gap={40} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))',
            gap: 'clamp(28px,4vw,56px)',
            alignItems: 'start',
          }}
        >
          {/* ── 폼 ── */}
          <div
            className="blueprint elev-md"
            style={{ position: 'relative', background: 'var(--color-bg)', padding: 'clamp(20px,3vw,30px)' }}
          >
            <CornerMarks />

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                <CheckCircle2
                  size={44}
                  strokeWidth={1.5}
                  style={{ color: 'var(--color-accent-700)', margin: '0 auto 14px' }}
                />
                <p className="display" style={{ fontSize: 24, margin: '0 0 8px' }}>
                  {content.successTitle}
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.65, margin: '0 0 6px', opacity: 0.8 }}>
                  {content.successBody}
                </p>
                {alimtalkSent && (
                  <p className="text-muted" style={{ fontSize: 13, margin: '0 0 20px' }}>
                    접수 확인 카카오 알림톡이 발송되었습니다.
                  </p>
                )}
                <a
                  href={`tel:${COMPANY.mobile}`}
                  className="display btn-outline mono-num"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 17, padding: '12px 22px', marginTop: 14 }}
                >
                  <Phone size={16} strokeWidth={1.5} />
                  {COMPANY.mobile}
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* 봇 차단 — 사람에게는 보이지 않는 필드 */}
                <input type="text" {...register('website')} className="bp-hp" tabIndex={-1} aria-hidden autoComplete="off" />
                <input type="hidden" {...register('loadedAt', { valueAsNumber: true })} />
                <input type="hidden" {...register('source')} />
                <input type="hidden" {...register('category')} />

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 18 }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <span className="bp-label">공사 유형 (필수)</span>
                    <div className="bp-seg" role="group" aria-label="공사 유형">
                      {CUSTOMER_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setValue('customerType', t)}
                          aria-pressed={customerType === t}
                          className="bp-seg-opt"
                          data-active={customerType === t ? 'true' : undefined}
                        >
                          {t === 'industrial' ? '공장·산업' : t === 'interior' ? '인테리어·일반' : '잘 모르겠어요'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label style={{ flex: 1, minWidth: 200 }}>
                    <span className="bp-label">공사 종류</span>
                    <select
                      className="bp-input"
                      value={category}
                      onChange={(e) => setValue('category', e.target.value as QuoteInput['category'])}
                    >
                      {available.map((c) => (
                        <option key={c} value={c}>
                          {CategoryLabels[c]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 18, marginBottom: 18 }}>
                  <label>
                    <span className="bp-label">성함 (필수)</span>
                    <input className="bp-input" {...register('name')} placeholder="홍길동" autoComplete="name" />
                    {errors.name && <FieldError>{errors.name.message}</FieldError>}
                  </label>
                  <label>
                    <span className="bp-label">연락처 (필수)</span>
                    <input
                      className="bp-input mono-num"
                      {...phoneRest}
                      type="tel"
                      inputMode="numeric"
                      placeholder="010-0000-0000"
                      autoComplete="tel"
                      onChange={(e) => {
                        e.target.value = formatPhone(e.target.value);
                        phoneOnChange(e);
                      }}
                    />
                    {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
                  </label>
                </div>

                <label style={{ display: 'block', marginBottom: 18 }}>
                  <span className="bp-label">상세 내용 (선택) — 시공 장소·면적·요청 사항</span>
                  <textarea
                    className="bp-input"
                    {...register('message')}
                    rows={3}
                    maxLength={1000}
                    placeholder="예) 칠곡 공장 증축, 동력 380V 라인 4개 증설 희망"
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 18, marginBottom: 20 }}>
                  <label>
                    <span className="bp-label">업체명 (선택)</span>
                    <input className="bp-input" {...register('companyName')} placeholder="예) ○○산업" autoComplete="organization" />
                  </label>
                  <label>
                    <span className="bp-label">시공 지역 (선택)</span>
                    <input className="bp-input" {...register('region')} placeholder="예) 대구 서구, 경북 경산" />
                  </label>
                </div>

                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 20, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    className="bp-check"
                    checked={!!agree}
                    onChange={(e) =>
                      setValue('agree', (e.target.checked ? true : undefined) as unknown as true, {
                        shouldValidate: true,
                      })
                    }
                  />
                  <span>
                    <strong>[필수]</strong> {content.privacyNote}{' '}
                    <a href="/privacy" target="_blank" style={{ textDecoration: 'underline' }}>
                      개인정보처리방침
                    </a>
                  </span>
                </label>
                {errors.agree && <FieldError>{errors.agree.message}</FieldError>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-cta-slot={submitCta.slot}
                  data-cta-variant={submitCta.variant}
                  data-cta-id={submitCta.id}
                  className="display blueprint btn-solid is-solid"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    fontSize: 19,
                    padding: 15,
                    border: '1px solid var(--color-accent)',
                    cursor: 'pointer',
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  <CornerMarks />
                  {isSubmitting ? <Loader2 size={17} strokeWidth={1.5} className="bp-spin" /> : null}
                  {isSubmitting ? '접수 중…' : submitCta.label}
                  {!isSubmitting && <ArrowRight size={17} strokeWidth={1.5} />}
                </button>
              </form>
            )}
          </div>

          {/* ── 우측 레일: 접수 후 절차 + 전화 ── */}
          <div>
            <h3 style={{ fontSize: 20, margin: '0 0 18px' }}>{content.afterTitle}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--color-divider)' }}>
              {content.afterSteps.map((step) => (
                <div
                  key={step.no}
                  style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--color-divider)' }}
                >
                  <span className="display" style={{ fontSize: 17, color: 'var(--color-accent-700)', flex: 'none', width: 28 }}>
                    {step.no}
                  </span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{step.title}</p>
                    <p className="text-muted" style={{ fontSize: 12.5, margin: '2px 0 0' }}>
                      {step.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="blueprint" style={{ position: 'relative', marginTop: 24, padding: 20 }}>
              <CornerMarks />
              <p className="text-muted" style={{ fontSize: 12, margin: '0 0 4px' }}>
                {content.callNote}
              </p>
              <a
                href={`tel:${COMPANY.mobile}`}
                className="display mono-num"
                style={{ fontSize: 'clamp(26px,3vw,32px)', fontWeight: 600 }}
              >
                {COMPANY.mobile}
              </a>
              <p className="text-muted" style={{ fontSize: 12, margin: '6px 0 0' }}>
                평일 09:00–18:00 · 토 09:00–13:00 · 긴급 A/S 상시 접수
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 12, color: '#b91c1c', margin: '5px 0 0' }} role="alert">
      {children}
    </p>
  );
}
