import type { ReactNode } from 'react';
import { AlertCircle, Check, Info, TriangleAlert } from 'lucide-react';
import { CornerMarks } from '@/components/redesign/CornerMarks';

/**
 * 어드민 공용 프리미티브 — 1b 블루프린트.
 *
 * 사이트 본문이 쓰는 것과 같은 조각(사각형 프레임·정합 마크·헤어라인 표)을
 * 대시보드 밀도에 맞춰 다시 묶은 것이다. 화면마다 같은 카드 마크업을
 * 손으로 반복하던 것을 여기로 모아, 톤이 한 곳에서만 바뀌도록 한다.
 *
 * 정합 마크(corner)는 상자 바깥 -6px에 그려진다. 그래서 기본값은 끄고,
 * "이 화면의 주인공"인 상자에만 켠다 — 패널마다 켜면 도면이 아니라 잡음이 된다.
 */

export { CornerMarks };

// ─────────────────────────────────────────────
//  패널
// ─────────────────────────────────────────────

export function Panel({
  title,
  note,
  action,
  children,
  /** 본문 여백 없이 표·목록을 테두리까지 붙일 때 */
  flush = false,
  marks = false,
  className = '',
}: {
  title?: string;
  note?: string;
  action?: ReactNode;
  children?: ReactNode;
  flush?: boolean;
  marks?: boolean;
  className?: string;
}) {
  return (
    <section className={`a-panel ${className}`}>
      {marks && <CornerMarks />}
      {title && (
        <div className="a-panel-head">
          <div className="min-w-0">
            <h2 className="a-panel-title">{title}</h2>
            {note && <p className="a-panel-note break-keep">{note}</p>}
          </div>
          {action}
        </div>
      )}
      {children && (flush ? children : <div className="a-panel-body">{children}</div>)}
    </section>
  );
}

// ─────────────────────────────────────────────
//  알림 상자
// ─────────────────────────────────────────────

export type Tone = 'ok' | 'warn' | 'err' | 'info';

const TONE_ICON = {
  ok: Check,
  warn: TriangleAlert,
  err: AlertCircle,
  info: Info,
} as const;

export function Notice({
  tone = 'info',
  title,
  children,
  action,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const Icon = TONE_ICON[tone];
  return (
    <div className={`a-note ${tone === 'info' ? '' : `a-note--${tone}`}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} aria-hidden />
      <div className="min-w-0 flex-1 break-keep">
        {title && <p className="font-bold mb-1">{title}</p>}
        {children}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

/** 서버 액션 결과처럼 성공/실패만 있는 짧은 메시지 */
export function ResultNote({ ok, text }: { ok: boolean; text: string }) {
  return (
    <Notice tone={ok ? 'ok' : 'err'}>
      <span>{text}</span>
    </Notice>
  );
}

// ─────────────────────────────────────────────
//  칩 · 빈 상태 · 수치 타일
// ─────────────────────────────────────────────

export function Chip({
  tone,
  children,
  className = '',
}: {
  tone?: 'accent' | 'outline' | 'ok' | 'warn' | 'err' | 'muted';
  children: ReactNode;
  className?: string;
}) {
  return <span className={`a-chip ${tone ? `a-chip--${tone}` : ''} ${className}`}>{children}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="a-empty break-keep">{children}</p>;
}

export function StatTile({
  label,
  value,
  hint,
  icon,
  marks = false,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  marks?: boolean;
}) {
  return (
    <div className="a-stat">
      {marks && <CornerMarks />}
      <p className="a-stat-label">
        {icon}
        {label}
      </p>
      <p className="a-stat-value">{value}</p>
      {hint && <p className="a-stat-hint break-keep">{hint}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
//  폼
// ─────────────────────────────────────────────

export function Field({
  label,
  help,
  htmlFor,
  suffix,
  children,
}: {
  label: string;
  help?: string;
  htmlFor?: string;
  /** 라벨 오른쪽 끝(글자 수 표시 등) */
  suffix?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="bp-label" style={{ marginBottom: 0 }}>
          {label}
        </label>
        {suffix}
      </div>
      {children}
      {help && <p className="a-help break-keep">{help}</p>}
    </div>
  );
}

/**
 * 스위치.
 *
 * 색만으로 상태를 알리지 않는다 — 오른쪽에 «켜짐/꺼짐» 글자를 함께 둔다.
 * 색 구분이 어려운 분에게 색은 아무 정보가 아니고, 이 화면의 스위치는
 * "알림이 지금 켜져 있나"처럼 오해하면 곤란한 것들을 다룬다.
 */
export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 disabled:opacity-50"
    >
      <span className="a-switch" data-on={checked ? '' : undefined} aria-hidden>
        <span />
      </span>
      <span
        className="display text-[11.5px]"
        style={{ color: checked ? 'var(--color-accent-700)' : 'rgba(29,31,32,0.5)' }}
        aria-hidden
      >
        {checked ? '켜짐' : '꺼짐'}
      </span>
    </button>
  );
}

/** 기간 선택 등 분절 선택 — blueprint의 .bp-seg를 그대로 쓴다 */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (next: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="bp-seg" role="group" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className="bp-seg-opt display"
          data-active={value === opt.value ? '' : undefined}
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
