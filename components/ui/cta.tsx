import Link from 'next/link';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COMPANY } from '@/lib/site';
import { Icon } from '@/components/ui/icon';
import type { Cta } from '@/lib/cta/schema';

/* =========================================================
   전환 CTA — 전화(강조색)·견적(네이비) 버튼을 한 곳에서 관리한다.
   강조색(signal)은 이 전화 버튼처럼 "행동을 부르는 지점"에만 쓴다.
   전화 링크는 tel: 형태라 Tracker(문서 위임)가 자동 추적한다.
   ========================================================= */

const sizeClass = {
  md: 'px-6 py-3.5 text-base gap-2.5',
  lg: 'px-8 py-4 text-[1.0625rem] sm:text-lg gap-3',
} as const;

type Size = keyof typeof sizeClass;

const base =
  'inline-flex items-center justify-center rounded-lg font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand';

export function PhoneButton({
  size = 'md',
  showLabel = false,
  className,
}: {
  size?: Size;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <a
      href={`tel:${COMPANY.mobile}`}
      className={cn(
        base,
        sizeClass[size],
        'bg-signal text-white shadow-sm shadow-brand-dark/20 hover:brightness-105',
        className,
      )}
    >
      <Phone className="w-5 h-5 flex-shrink-0" />
      <span className="tabular-nums">{showLabel ? `전화상담 ${COMPANY.mobile}` : COMPANY.mobile}</span>
    </a>
  );
}

type QuoteVariant = 'navy' | 'outlineLight' | 'outlineDark';

const quoteVariantClass: Record<QuoteVariant, string> = {
  navy: 'bg-brand text-white hover:bg-brand-700 shadow-sm shadow-brand-dark/20',
  outlineLight: 'border border-brand/25 text-brand hover:bg-brand-tint',
  outlineDark: 'border border-white/25 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm',
};

export function QuoteButton({
  variant = 'navy',
  size = 'md',
  label = '무료 견적문의',
  href = '#quote',
  className,
}: {
  variant?: QuoteVariant;
  size?: Size;
  label?: string;
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(base, sizeClass[size], quoteVariantClass[variant], className)}>
      {label}
    </Link>
  );
}

export function CtaRow({
  tone = 'light',
  size = 'lg',
  className,
}: {
  tone?: 'light' | 'dark';
  size?: Size;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-3', className)}>
      <PhoneButton size={size} />
      <QuoteButton variant={tone === 'dark' ? 'outlineDark' : 'outlineLight'} size={size} />
    </div>
  );
}

/* =========================================================
   어드민에서 관리하는 CTA.

   data-cta-* 속성이 붙어 있어 Tracker가 노출·클릭을 자동으로 집계한다.
   A/B 변형은 서버에서 이미 확정돼 내려오므로 여기서는 그리기만 한다.
   ========================================================= */

const ctaStyleClass: Record<Cta['style'], string> = {
  primary: 'bg-brand text-white hover:bg-brand-700 shadow-sm shadow-brand-dark/20',
  signal:  'bg-signal text-white hover:brightness-105 shadow-sm shadow-brand-dark/20',
  outline: 'border border-brand/25 text-brand hover:bg-brand-tint',
  ghost:   'border border-white/25 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm',
};

export function CtaButton({
  cta,
  size = 'md',
  className,
  block = false,
}: {
  cta: Cta;
  size?: Size;
  className?: string;
  block?: boolean;
}) {
  const classes = cn(
    base,
    sizeClass[size],
    ctaStyleClass[cta.style] ?? ctaStyleClass.primary,
    block && 'w-full',
    className,
  );

  const inner = (
    <>
      {cta.icon && <Icon name={cta.icon} className="w-5 h-5 flex-shrink-0" />}
      <span className={cn(cta.href.startsWith('tel:') && 'tabular-nums')}>{cta.label}</span>
    </>
  );

  const trackingProps = {
    'data-cta-slot': cta.slot,
    'data-cta-variant': cta.variant,
    'data-cta-id': cta.id,
  };

  // tel:·외부 링크는 next/link가 아니라 순수 <a>여야 한다.
  const isExternal = /^(tel:|mailto:|https?:)/.test(cta.href);
  if (isExternal) {
    return (
      <a href={cta.href} className={classes} {...trackingProps}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={cta.href} className={classes} {...trackingProps}>
      {inner}
    </Link>
  );
}
