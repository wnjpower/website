'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Check, Loader2, Rocket, RotateCcw, Undo2, Monitor, Smartphone,
  RefreshCw, Eye,
} from 'lucide-react';
import { FieldRenderer } from './Fields';
import { Notice } from './ui';
import type { SectionDef } from '@/lib/content/schema';
import { saveDraft, publishSection, discardDraft, resetSection } from '@/app/admin/actions';

type Obj = Record<string, unknown>;
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const AUTOSAVE_DELAY = 1500;

/**
 * 섹션 편집기 — 좌측 폼 / 우측 실시간 미리보기.
 *
 * 입력을 멈추면 1.5초 뒤 자동으로 임시 저장하고 미리보기를 갱신한다.
 * "저장 버튼을 눌러야 보인다"는 단계를 없앤 것이 이 화면의 핵심이다.
 * 다만 임시 저장은 방문자에게 보이지 않는다 — 실제 반영은 [발행]을 눌러야 한다.
 * 이 구분이 없으면 문구를 고치다 만 상태가 그대로 광고 랜딩에 나가 버린다.
 */
export default function SectionEditor({
  section,
  initialData,
  hasDraft: initialHasDraft,
}: {
  section: SectionDef;
  initialData: Obj;
  hasDraft: boolean;
}) {
  const [data, setData] = useState<Obj>(initialData);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(initialHasDraft);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isPending, startTransition] = useTransition();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);

  const previewSrc = `/api/preview?path=${encodeURIComponent(
    section.anchor ? `/#${section.anchor}` : '/',
  )}`;

  const refreshPreview = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    // src를 다시 대입해야 초안이 반영된 새 HTML을 받는다.
    // contentWindow.location.reload()는 교차 출처 정책에 걸릴 수 있어 쓰지 않는다.
    frame.src = `${previewSrc}&_r=${Date.now().toString(36)}`;
  }, [previewSrc]);

  const persist = useCallback(
    async (next: Obj) => {
      setSaveState('saving');
      const result = await saveDraft(section.key, next);
      if (result.ok) {
        dirtyRef.current = false;
        setHasDraft(true);
        setSaveState('saved');
        setMessage(null);
        refreshPreview();
      } else {
        setSaveState('error');
        setMessage(result.error);
      }
    },
    [section.key, refreshPreview],
  );

  // 입력이 멈춘 뒤 자동 임시 저장
  useEffect(() => {
    if (!dirtyRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void persist(data), AUTOSAVE_DELAY);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, persist]);

  // 저장하지 않은 변경이 있는 채로 화면을 떠나려 할 때 경고
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  function update(key: string, value: unknown) {
    dirtyRef.current = true;
    setSaveState('idle');
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function onPublish() {
    startTransition(async () => {
      // 자동 저장이 아직 안 돌았을 수 있으니, 화면의 최신 값을 그대로 발행한다
      if (timerRef.current) clearTimeout(timerRef.current);
      const result = await publishSection(section.key, data);
      if (result.ok) {
        dirtyRef.current = false;
        setSaveState('saved');
        setMessage(result.message ?? '발행했습니다.');
        refreshPreview();
      } else {
        setSaveState('error');
        setMessage(result.error);
      }
    });
  }

  function onDiscard() {
    if (!confirm('수정 중이던 내용을 버리고 현재 사이트에 올라간 상태로 되돌립니다. 계속할까요?')) return;
    startTransition(async () => {
      const result = await discardDraft(section.key);
      setMessage(result.ok ? (result.message ?? null) : result.error);
      if (result.ok) window.location.reload();
    });
  }

  function onReset() {
    if (!confirm('이 섹션을 처음 기본 문구로 되돌립니다. 지금까지 편집한 내용이 사라집니다. 계속할까요?')) return;
    startTransition(async () => {
      const result = await resetSection(section.key);
      setMessage(result.ok ? (result.message ?? null) : result.error);
      if (result.ok) window.location.reload();
    });
  }

  return (
    <div className="space-y-4">
      {/* ── 상단 바 ── */}
      <div className="a-pagehead" style={{ alignItems: 'center' }}>
        <Link href="/admin/content" className="a-btn a-btn--icon" aria-label="목록으로">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate" style={{ fontSize: 24 }}>{section.label}</h1>
          <p className="text-muted truncate" style={{ fontSize: 12.5 }}>{section.summary}</p>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          <SaveIndicator state={saveState} hasDraft={hasDraft} />
          <button onClick={onPublish} disabled={isPending} className="a-btn a-btn--solid">
            {isPending
              ? <Loader2 className="w-4 h-4 bp-spin" strokeWidth={1.5} />
              : <Rocket className="w-4 h-4" strokeWidth={1.5} />}
            발행
          </button>
        </div>
      </div>

      {message && (
        <Notice tone={saveState === 'error' ? 'err' : 'ok'}>
          <span>{message}</span>
        </Notice>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,420px)_1fr] gap-4 items-start">
        {/* ── 편집 폼 ── */}
        <div className="a-panel">
          <div className="a-panel-body space-y-6">
            {section.fields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                value={data[field.key]}
                onChange={(next) => update(field.key, next)}
              />
            ))}
          </div>

          <div
            className="flex flex-wrap gap-2 px-4 py-3.5"
            style={{ borderTop: '1px solid var(--color-divider)' }}
          >
            {hasDraft && (
              <button onClick={onDiscard} disabled={isPending} className="a-btn a-btn--sm">
                <Undo2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                수정 취소
              </button>
            )}
            <button onClick={onReset} disabled={isPending} className="a-btn a-btn--sm a-btn--danger">
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
              기본 문구로
            </button>
          </div>
        </div>

        {/* ── 미리보기 ── */}
        <div className="a-panel sticky top-4">
          <div className="a-panel-head" style={{ alignItems: 'center' }}>
            <span className="display inline-flex items-center gap-1.5" style={{ fontSize: 15 }}>
              <Eye className="w-4 h-4" strokeWidth={1.5} />
              미리보기
              <span className="text-muted hidden sm:inline" style={{ fontSize: 12 }}>
                — 방문자에게는 아직 보이지 않습니다
              </span>
            </span>
            <div className="flex items-center gap-1">
              <DeviceButton active={device === 'desktop'} onClick={() => setDevice('desktop')} label="데스크톱">
                <Monitor className="w-4 h-4" strokeWidth={1.5} />
              </DeviceButton>
              <DeviceButton active={device === 'mobile'} onClick={() => setDevice('mobile')} label="모바일">
                <Smartphone className="w-4 h-4" strokeWidth={1.5} />
              </DeviceButton>
              <button
                onClick={refreshPreview}
                aria-label="미리보기 새로고침"
                className="a-btn a-btn--icon a-btn--sm a-btn--ghost"
              >
                <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div
            className={device === 'mobile' ? 'p-4 flex justify-center' : ''}
            style={{ background: 'var(--color-surface)' }}
          >
            <iframe
              ref={iframeRef}
              src={previewSrc}
              title="사이트 미리보기"
              className={device === 'mobile' ? 'w-[390px] max-w-full h-[720px] elev-md' : 'w-full h-[720px]'}
              style={{ background: '#fff', border: device === 'mobile' ? '1px solid var(--color-divider)' : 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DeviceButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`a-btn a-btn--icon a-btn--sm ${active ? 'a-btn--solid' : 'a-btn--ghost'}`}
    >
      {children}
    </button>
  );
}

function SaveIndicator({ state, hasDraft }: { state: SaveState; hasDraft: boolean }) {
  if (state === 'saving') {
    return (
      <span className="text-muted inline-flex items-center gap-1.5" style={{ fontSize: 12.5 }}>
        <Loader2 className="w-3.5 h-3.5 bp-spin" strokeWidth={1.5} />
        저장 중…
      </span>
    );
  }
  if (state === 'saved') {
    return (
      <span className="inline-flex items-center gap-1.5" style={{ fontSize: 12.5, color: 'var(--a-ok)' }}>
        <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
        임시 저장됨
      </span>
    );
  }
  if (hasDraft) {
    return <span style={{ fontSize: 12.5, color: 'var(--a-warn)' }}>발행 대기 중</span>;
  }
  return null;
}
