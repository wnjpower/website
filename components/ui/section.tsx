import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* =========================================================
   레이아웃 프리미티브 — "절제된 기관형" 디자인 시스템의 뼈대.
   모든 섹션이 같은 세로 리듬·컨테이너 너비·헤딩 위계를 공유하도록 한다.
   ========================================================= */

type Tone = 'white' | 'muted' | 'tint' | 'dark';

const toneClass: Record<Tone, string> = {
  white: 'bg-white text-ink',
  muted: 'bg-slate-50 text-ink',
  tint: 'bg-brand-tint text-ink',
  dark: 'tech-dark text-white',
};

export function Section({
  id,
  tone = 'white',
  className,
  children,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn('py-20 sm:py-24', toneClass[tone], className)}>
      {children}
    </section>
  );
}

export function Container({
  size = 'wide',
  className,
  children,
}: {
  size?: 'wide' | 'narrow' | 'reading';
  className?: string;
  children: ReactNode;
}) {
  const width =
    size === 'narrow' ? 'max-w-4xl' : size === 'reading' ? 'max-w-3xl' : 'max-w-7xl';
  return <div className={cn(width, 'mx-auto px-5 sm:px-6 lg:px-8', className)}>{children}</div>;
}

export function Eyebrow({
  children,
  tone = 'light',
  className,
}: {
  children: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em]',
        tone === 'dark' ? 'text-slate-300' : 'text-brand-700',
        className,
      )}
    >
      <span className="rule-accent" aria-hidden />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'center',
  tone = 'light',
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'center' | 'left';
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const isCenter = align === 'center';
  return (
    <div
      data-reveal
      className={cn(
        isCenter ? 'text-center mx-auto' : 'text-left',
        isCenter && 'max-w-2xl',
        'mb-12 sm:mb-14',
        className,
      )}
    >
      {eyebrow && (
        <div className={cn('mb-4', isCenter && 'flex justify-center')}>
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </div>
      )}
      <h2
        className={cn(
          'text-[1.75rem] leading-tight sm:text-4xl font-bold tracking-tight',
          tone === 'dark' ? 'text-white' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            'mt-4 text-base sm:text-lg leading-relaxed',
            tone === 'dark' ? 'text-slate-300' : 'text-slate-500',
            isCenter && 'max-w-2xl mx-auto',
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
