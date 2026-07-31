'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Check, Loader2, Rocket, RotateCcw, Undo2, Monitor, Smartphone,
  RefreshCw, AlertCircle, Eye,
} from 'lucide-react';
import { FieldRenderer } from './Fields';
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
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/content"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-brand hover:border-brand transition-colors flex-shrink-0"
            aria-label="목록으로"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-ink truncate">{section.label}</h1>
            <p className="text-sm text-slate-500 truncate">{section.summary}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SaveIndicator state={saveState} hasDraft={hasDraft} />
          <button
            onClick={onPublish}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-700 text-white font-bold px-5 py-2.5 text-[0.9375rem] transition-colors disabled:opacity-60"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            발행
          </button>
        </div>
      </div>

      {message && (
        <p
          className={`flex gap-2 items-start rounded-lg px-4 py-3 text-sm ${
            saveState === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-green-50 border border-green-200 text-green-800'
          }`}
        >
          {saveState === 'error' ? (
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,420px)_1fr] gap-5 items-start">
        {/* ── 편집 폼 ── */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-6">
          {section.fields.map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={data[field.key]}
              onChange={(next) => update(field.key, next)}
            />
          ))}

          <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-2">
            {hasDraft && (
              <button
                onClick={onDiscard}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:border-slate-400 transition-colors disabled:opacity-60"
              >
                <Undo2 className="w-3.5 h-3.5" />
                수정 취소
              </button>
            )}
            <button
              onClick={onReset}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-500 hover:text-red-600 hover:border-red-300 transition-colors disabled:opacity-60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              기본 문구로
            </button>
          </div>
        </div>

        {/* ── 미리보기 ── */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden sticky top-4">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-200 bg-slate-50">
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600">
              <Eye className="w-4 h-4" />
              미리보기
              <span className="hidden sm:inline text-xs font-normal text-slate-400">
                — 방문자에게는 아직 보이지 않습니다
              </span>
            </span>
            <div className="flex items-center gap-1">
              <DeviceButton active={device === 'desktop'} onClick={() => setDevice('desktop')} label="데스크톱">
                <Monitor className="w-4 h-4" />
              </DeviceButton>
              <DeviceButton active={device === 'mobile'} onClick={() => setDevice('mobile')} label="모바일">
                <Smartphone className="w-4 h-4" />
              </DeviceButton>
              <button
                onClick={refreshPreview}
                aria-label="미리보기 새로고침"
                className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-brand hover:bg-white"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className={`bg-slate-200 ${device === 'mobile' ? 'p-4 flex justify-center' : ''}`}>
            <iframe
              ref={iframeRef}
              src={previewSrc}
              title="사이트 미리보기"
              className={`bg-white ${
                device === 'mobile'
                  ? 'w-[390px] max-w-full h-[720px] rounded-xl border border-slate-300 shadow-lg'
                  : 'w-full h-[720px]'
              }`}
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
      className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
        active ? 'bg-white text-brand shadow-sm' : 'text-slate-400 hover:text-brand'
      }`}
    >
      {children}
    </button>
  );
}

function SaveIndicator({ state, hasDraft }: { state: SaveState; hasDraft: boolean }) {
  if (state === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        저장 중…
      </span>
    );
  }
  if (state === 'saved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-green-700">
        <Check className="w-3.5 h-3.5" />
        임시 저장됨
      </span>
    );
  }
  if (hasDraft) {
    return <span className="text-sm text-amber-600 font-medium">발행 대기 중</span>;
  }
  return null;
}
