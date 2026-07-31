'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bell, BellOff, Send, Trash2, Loader2, Check, AlertCircle,
  Smartphone, Monitor, Tablet, Share, PlusSquare, Moon, RotateCcw,
} from 'lucide-react';
import {
  NOTIFY_TYPES, NOTIFY_TYPE_LABELS, NOTIFY_TYPE_HINTS, DEFAULT_SETTINGS,
  type NotificationSettings, type NotifyType, type PushDevice,
} from '@/lib/push/config';

/**
 * 알림 설정 화면.
 *
 * 세 가지를 한 화면에서 한다.
 *   1) 지금 보고 있는 기기에서 알림 켜기/끄기 (권한 요청 → 구독 등록)
 *   2) 등록된 기기 목록 확인·삭제, 시험 알림 발송
 *   3) 어떤 클릭에 알릴지 / 방해금지 / 반복 억제 설정
 *
 * 알림은 "설정했는데 안 온다"가 가장 흔한 실패다. 그래서 지금 상태(권한·구독·
 * 서버 설정)를 숨기지 않고 전부 드러내고, 시험 발송 버튼을 눈에 띄게 둔다.
 */

interface PushState {
  settings: NotificationSettings;
  devices: PushDevice[];
  publicKey: string | null;
  ready: boolean;
  vapidConfigured: boolean;
  serviceRoleConfigured: boolean;
}

type Banner = { ok: boolean; text: string } | null;

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const cardClass = 'rounded-xl border border-slate-200 bg-white overflow-hidden';
const sectionHeadClass = 'px-4 sm:px-5 py-3.5 border-b border-slate-200 bg-slate-50';

// 반환 타입을 명시하지 않는다. `Uint8Array`로 적으면 ArrayBufferLike로 넓어져
// applicationServerKey(BufferSource)에 넣을 수 없다 — 추론된 타입이 정확하다.
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/** 아이폰·아이패드에서 홈 화면에 추가하지 않은 상태인가 (이 경우 알림 자체가 불가) */
function needsIosInstall(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua) ||
    // 아이패드는 iPadOS 13부터 UA가 맥으로 나온다
    (/macintosh/i.test(ua) && 'ontouchend' in document);
  if (!isIos) return false;
  const standalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
  return !standalone;
}

function DeviceIcon({ device }: { device: string | null }) {
  const cls = 'w-4 h-4 text-slate-400 flex-shrink-0';
  if (device === 'mobile') return <Smartphone className={cls} />;
  if (device === 'tablet') return <Tablet className={cls} />;
  return <Monitor className={cls} />;
}

/**
 * 스위치 한 줄.
 *
 * 줄 전체가 버튼이다. 작은 체크박스는 폰에서 누르기 어렵고, 사장님이 실제로 쓰는
 * 환경이 폰이다. 스위치 모양만 두고 색으로만 상태를 알리면 색 구분이 어려운 분에게
 * 아무 정보가 없으므로 «켜짐/꺼짐» 글자를 함께 붙인다.
 */
function ToggleRow({
  checked, onChange, disabled = false, title, hint, icon, emphasis = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  title: string;
  hint?: string;
  icon?: React.ReactNode;
  /** 대표 스위치(알림 전체 켜기) — 더 크고 눈에 띄게 */
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-3 text-left transition-colors ${
        emphasis ? 'px-4 sm:px-5 py-4' : 'px-4 sm:px-5 py-3.5'
      } ${disabled ? 'opacity-45 cursor-not-allowed' : 'hover:bg-slate-50 active:bg-slate-100'} ${
        emphasis && checked ? 'bg-brand-tint hover:bg-brand-tint' : ''
      } focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}

      <span className="flex-1 min-w-0">
        <span className={`block text-ink ${emphasis ? 'font-bold text-[1.0625rem]' : 'font-semibold'}`}>
          {title}
        </span>
        {hint && <span className="block text-sm text-slate-500 break-keep mt-0.5">{hint}</span>}
      </span>

      <span className="flex flex-col items-center gap-1 flex-shrink-0">
        {/* 시각 요소일 뿐이다. 상태는 바깥 button의 role=switch/aria-checked가 알린다 */}
        <span
          aria-hidden
          className={`relative block rounded-full transition-colors duration-150 ${
            emphasis ? 'w-[3.25rem] h-[1.75rem]' : 'w-[3rem] h-[1.625rem]'
          } ${checked ? 'bg-brand' : 'bg-slate-300'}`}
        >
          <span
            className={`absolute top-[0.125rem] left-[0.125rem] block rounded-full bg-white shadow transition-transform duration-150 ${
              emphasis ? 'w-[1.5rem] h-[1.5rem]' : 'w-[1.375rem] h-[1.375rem]'
            } ${
              checked
                ? emphasis ? 'translate-x-[1.5rem]' : 'translate-x-[1.375rem]'
                : 'translate-x-0'
            }`}
          />
        </span>
        <span className={`text-[0.6875rem] font-bold ${checked ? 'text-brand' : 'text-slate-400'}`}>
          {checked ? '켜짐' : '꺼짐'}
        </span>
      </span>
    </button>
  );
}

/** 자동 저장 상태 표시 — 저장 버튼을 없앤 대신 지금 무슨 일이 일어났는지 항상 보인다 */
function SaveStatus({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  if (state === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> 저장 중…
      </span>
    );
  }
  if (state === 'saved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-green-700 font-semibold">
        <Check className="w-3.5 h-3.5" /> 저장됨
      </span>
    );
  }
  if (state === 'error') {
    return (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-sm text-red-700 font-semibold hover:underline"
      >
        <RotateCcw className="w-3.5 h-3.5" /> 저장 실패 — 다시 시도
      </button>
    );
  }
  return <span className="text-sm text-slate-400">변경하면 자동 저장됩니다</span>;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '아직 없음';
  return new Date(iso).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export default function PushManager() {
  const [state, setState] = useState<PushState | null>(null);
  const [tableMissing, setTableMissing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<Banner>(null);
  const [busy, setBusy] = useState<'enable' | 'disable' | 'test' | null>(null);

  // 브라우저 쪽 상태
  const [supported, setSupported] = useState(true);
  const [iosInstallNeeded, setIosInstallNeeded] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [myEndpointTail, setMyEndpointTail] = useState<string | null>(null);

  /*
   * 설정은 «자동 저장»한다.
   *
   * 저장 버튼을 두면 스위치만 넘기고 나가는 실수가 반드시 나온다. 그러면 사장님은
   * 껐다고 믿는데 알림은 계속 오고, 원인을 찾을 방법이 없다. 스위치를 넘긴 것이
   * 곧 의사표시이므로 그대로 저장하고, 대신 «저장 중 / 저장됨 / 실패»를 항상 보여준다.
   */
  const [form, setForm] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const pendingRef = useRef<NotificationSettings | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushSave = useCallback(async () => {
    const payload = pendingRef.current;
    if (!payload) return;
    setSaveState('saving');
    try {
      const res = await fetch('/api/push', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      // 저장에 성공한 값만 «서버가 가진 값»으로 승격한다
      pendingRef.current = null;
      setState((s) => (s ? { ...s, settings: payload } : s));
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }, []);

  /** 스위치·선택 변경 → 화면은 즉시 바꾸고 저장은 짧게 묶어서 보낸다 */
  const update = useCallback((patch: Partial<NotificationSettings>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      pendingRef.current = next;
      return next;
    });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { void flushSave(); }, 600);
  }, [flushSave]);

  // 저장이 예약된 채 화면을 떠나면 변경이 사라진다. 떠나기 전에 흘려보낸다.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && pendingRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        void flushSave();
      }
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pendingRef.current) void flushSave();
    };
  }, [flushSave]);

  const loadState = useCallback(async () => {
    try {
      const res = await fetch('/api/push', { cache: 'no-store' });
      if (res.status === 503) { setTableMissing(true); return; }
      if (!res.ok) { setBanner({ ok: false, text: '설정을 불러오지 못했습니다.' }); return; }
      const json = (await res.json()) as PushState;
      setState(json);
      setForm(json.settings);
      setTableMissing(false);
    } catch {
      setBanner({ ok: false, text: '설정을 불러오지 못했습니다. 네트워크를 확인해 주세요.' });
    }
  }, []);

  /** 이 브라우저가 지금 구독 중인지 확인한다 */
  const refreshLocalSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.getRegistration('/');
      const sub = await reg?.pushManager.getSubscription();
      setMyEndpointTail(sub ? sub.endpoint.slice(-24) : null);
    } catch {
      setMyEndpointTail(null);
    }
  }, []);

  useEffect(() => {
    const ok =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setSupported(ok);
    setIosInstallNeeded(needsIosInstall());
    if (ok) setPermission(Notification.permission);

    void (async () => {
      await Promise.all([loadState(), ok ? refreshLocalSubscription() : Promise.resolve()]);
      setLoading(false);
    })();
  }, [loadState, refreshLocalSubscription]);

  const subscribedHere = Boolean(
    myEndpointTail && state?.devices.some((d) => d.endpointTail === myEndpointTail && d.active),
  );

  async function enableHere() {
    setBusy('enable');
    setBanner(null);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') {
        setBanner({
          ok: false,
          text: result === 'denied'
            ? '이 브라우저에서 알림이 차단돼 있습니다. 주소창 왼쪽 자물쇠 → 알림을 «허용»으로 바꾼 뒤 다시 눌러 주세요.'
            : '알림 권한을 허용해야 알림을 받을 수 있습니다.',
        });
        return;
      }

      const publicKey = state?.publicKey;
      if (!publicKey) {
        setBanner({ ok: false, text: '서버에 VAPID 키가 설정돼 있지 않습니다. 아래 안내를 따라 환경변수를 먼저 넣어 주세요.' });
        return;
      }

      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      let sub = await reg.pushManager.getSubscription();
      if (sub) {
        // 서버 키가 바뀌었으면 옛 구독으로는 알림이 오지 않는다. 갈아끼운다.
        const current = sub.options?.applicationServerKey;
        const wanted = urlBase64ToUint8Array(publicKey);
        const currentBytes = current ? new Uint8Array(current) : null;
        const same =
          currentBytes !== null &&
          currentBytes.length === wanted.length &&
          currentBytes.every((b, i) => b === wanted[i]);
        if (!same) {
          await sub.unsubscribe();
          sub = null;
        }
      }
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setBanner({
          ok: false,
          text: json?.error === 'table_missing'
            ? 'DB에 알림 테이블이 없습니다. supabase/push-schema.sql을 먼저 실행해 주세요.'
            : '기기 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        });
        return;
      }

      await Promise.all([loadState(), refreshLocalSubscription()]);
      setBanner({ ok: true, text: '이 기기에서 알림을 받습니다. 아래 «시험 알림 보내기»로 확인해 보세요.' });
    } catch (e) {
      setBanner({ ok: false, text: `알림을 켜지 못했습니다. ${e instanceof Error ? e.message : ''}` });
    } finally {
      setBusy(null);
    }
  }

  async function disableHere() {
    setBusy('disable');
    setBanner(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration('/');
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      await Promise.all([loadState(), refreshLocalSubscription()]);
      setBanner({ ok: true, text: '이 기기의 알림을 껐습니다.' });
    } catch {
      setBanner({ ok: false, text: '알림을 끄지 못했습니다.' });
    } finally {
      setBusy(null);
    }
  }

  async function sendTest() {
    setBusy('test');
    setBanner(null);
    try {
      const res = await fetch('/api/push/test', { method: 'POST' });
      const json = (await res.json()) as { sent?: number; failed?: number; reason?: string };

      if (json.reason === 'not_configured') {
        setBanner({ ok: false, text: 'VAPID 키가 설정돼 있지 않습니다. 아래 준비 상태를 확인해 주세요.' });
      } else if (json.reason === 'no_service_role') {
        setBanner({ ok: false, text: 'SUPABASE_SERVICE_ROLE_KEY가 설정돼 있지 않습니다.' });
      } else if (json.reason === 'no_devices') {
        setBanner({ ok: false, text: '알림을 받을 기기가 없습니다. 먼저 «이 기기에서 알림 받기»를 눌러 주세요.' });
      } else {
        setBanner({
          ok: (json.sent ?? 0) > 0,
          text: (json.sent ?? 0) > 0
            ? `${json.sent}대에 시험 알림을 보냈습니다. 알림이 뜨는지 확인해 주세요.`
            : '발송에 실패했습니다. 기기 목록의 오류 메시지를 확인해 주세요.',
        });
      }
      await loadState();
    } catch {
      setBanner({ ok: false, text: '시험 알림 발송에 실패했습니다.' });
    } finally {
      setBusy(null);
    }
  }

  async function removeDevice(id: string, label: string) {
    if (!confirm(`'${label}' 기기를 목록에서 지웁니다. 계속할까요?`)) return;
    try {
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await Promise.all([loadState(), refreshLocalSubscription()]);
    } catch {
      setBanner({ ok: false, text: '기기를 지우지 못했습니다.' });
    }
  }

  function toggleType(type: NotifyType, next: boolean) {
    update({
      types: next ? [...form.types, type] : form.types.filter((t) => t !== type),
    });
  }

  /** 방해금지 켜기 — 처음 켤 때는 흔한 시간대(22시~07시)를 미리 넣어준다 */
  function toggleQuiet(next: boolean) {
    update(
      next
        ? { quietStart: form.quietStart ?? 22, quietEnd: form.quietEnd ?? 7 }
        : { quietStart: null, quietEnd: null },
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 py-10 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> 불러오는 중…
      </div>
    );
  }

  if (tableMissing) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 space-y-2">
        <p className="font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> DB 준비가 아직 안 됐습니다
        </p>
        <p className="leading-relaxed break-keep">
          Supabase SQL Editor에서 <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200">supabase/push-schema.sql</code>을
          한 번 실행한 뒤 이 화면을 새로고침해 주세요. 알림 기기 목록과 설정을 담을 테이블이 만들어집니다.
        </p>
      </div>
    );
  }

  const quietOn = form.quietStart !== null && form.quietEnd !== null;

  return (
    <div className="space-y-4">
      {banner && (
        <p
          className={`flex gap-2 items-start rounded-lg px-4 py-3 text-sm break-keep ${
            banner.ok
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {banner.ok
            ? <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          {banner.text}
        </p>
      )}

      {/* ── 서버 준비 상태 ── */}
      {!state?.ready && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 space-y-2">
          <p className="font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> 서버 설정이 아직 끝나지 않았습니다
          </p>
          <ul className="list-disc pl-5 space-y-1 leading-relaxed">
            {!state?.vapidConfigured && (
              <li>
                <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200">NEXT_PUBLIC_VAPID_PUBLIC_KEY</code> ·
                <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200 ml-1">VAPID_PRIVATE_KEY</code> 미설정
              </li>
            )}
            {!state?.serviceRoleConfigured && (
              <li>
                <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200">SUPABASE_SERVICE_ROLE_KEY</code> 미설정
              </li>
            )}
          </ul>
          <p className="leading-relaxed break-keep">
            <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200">npm run push:keys</code>로 키를 만들어
            Vercel 환경변수에 넣고 재배포하면 이 안내가 사라집니다. (자세한 순서: <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200">.env.example</code>)
          </p>
        </div>
      )}

      {/* ── ① 이 기기 ── */}
      <section className={cardClass}>
        <div className={sectionHeadClass}>
          <h2 className="font-bold text-ink">지금 보고 있는 기기</h2>
          <p className="text-sm text-slate-500 break-keep">
            알림을 받을 기기마다 한 번씩 켜 주세요. 휴대폰과 PC 둘 다 켜두면 양쪽에 다 뜹니다.
          </p>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {!supported ? (
            <p className="text-sm text-slate-600 break-keep">
              이 브라우저는 웹 알림을 지원하지 않습니다. 크롬·엣지·사파리(최신)에서 열어 주세요.
            </p>
          ) : iosInstallNeeded ? (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm text-slate-700">
              <p className="font-bold text-ink">아이폰·아이패드는 홈 화면에 추가해야 알림을 받을 수 있습니다</p>
              <ol className="space-y-1.5 leading-relaxed">
                <li className="flex gap-2">
                  <Share className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                  사파리 하단 <b>공유</b> 버튼을 누릅니다.
                </li>
                <li className="flex gap-2">
                  <PlusSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                  <b>홈 화면에 추가</b>를 선택합니다.
                </li>
                <li className="flex gap-2">
                  <Bell className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                  홈 화면에 생긴 아이콘으로 다시 들어와 이 화면에서 알림을 켭니다.
                </li>
              </ol>
              <p className="text-xs text-slate-500 break-keep">
                애플이 iOS 16.4부터 정한 규칙이라 우회할 방법이 없습니다. 안드로이드·PC는 그냥 켜면 됩니다.
              </p>
            </div>
          ) : subscribedHere ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 text-green-800 px-3 py-1.5 text-sm font-bold">
                <Bell className="w-4 h-4" /> 이 기기에서 알림 받는 중
              </span>
              <button
                onClick={disableHere}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:border-slate-400 disabled:opacity-50"
              >
                {busy === 'disable' ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellOff className="w-4 h-4" />}
                이 기기 알림 끄기
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={enableHere}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {busy === 'enable' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                이 기기에서 알림 받기
              </button>
              {permission === 'denied' && (
                <span className="text-sm text-red-600 break-keep">
                  브라우저에서 알림이 차단돼 있습니다. 주소창 왼쪽 자물쇠 → 알림 → 허용으로 바꿔 주세요.
                </span>
              )}
            </div>
          )}

          <button
            onClick={sendTest}
            disabled={busy !== null || !state?.ready}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:border-brand hover:text-brand disabled:opacity-50"
          >
            {busy === 'test' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            시험 알림 보내기
          </button>
        </div>
      </section>

      {/* ── ② 등록된 기기 ── */}
      <section className={cardClass}>
        <div className={sectionHeadClass}>
          <h2 className="font-bold text-ink">알림 받는 기기 ({state?.devices.length ?? 0})</h2>
          <p className="text-sm text-slate-500 break-keep">
            기기를 바꾸거나 더 이상 쓰지 않는 브라우저는 지워 주세요.
          </p>
        </div>

        {(state?.devices.length ?? 0) === 0 ? (
          <p className="p-5 text-sm text-slate-500">아직 등록된 기기가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {state?.devices.map((d) => {
              const isCurrent = d.endpointTail === myEndpointTail;
              return (
                <li key={d.id} className="flex items-start gap-3 px-4 sm:px-5 py-3.5">
                  <DeviceIcon device={d.device} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink text-[0.9375rem]">{d.label ?? '이름 없는 기기'}</span>
                      {isCurrent && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-tint text-brand-700">이 기기</span>
                      )}
                      {!d.active && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                          알림 중단됨
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      마지막 알림 도착 {formatDateTime(d.lastSuccessAt)}
                      {d.failureCount > 0 && ` · 연속 실패 ${d.failureCount}회`}
                    </p>
                    {d.lastError && (
                      <p className="text-xs text-red-600 mt-0.5 break-all">{d.lastError}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeDevice(d.id, d.label ?? '이름 없는 기기')}
                    aria-label="기기 삭제"
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── ③ 무엇을 알릴지 ── */}
      <section className={cardClass}>
        <div className={`${sectionHeadClass} flex flex-wrap items-center justify-between gap-2`}>
          <div className="min-w-0">
            <h2 className="font-bold text-ink">무엇을 알릴까요</h2>
            <p className="text-sm text-slate-500 break-keep">
              알림이 너무 잦으면 정작 중요한 문의를 놓칩니다. 필요 없는 항목은 꺼 두세요.
            </p>
          </div>
          <SaveStatus state={saveState} onRetry={() => { void flushSave(); }} />
        </div>

        {/* 대표 스위치 — 이것만 끄면 기기를 지우지 않고도 전부 멈춘다 */}
        <ToggleRow
          emphasis
          checked={form.enabled}
          onChange={(next) => update({ enabled: next })}
          title="알림 받기"
          hint={
            form.enabled
              ? '아래에서 켜 둔 항목의 알림이 등록된 기기로 갑니다.'
              : '모든 알림이 멈춰 있습니다. 등록된 기기는 그대로 남아 있습니다.'
          }
          icon={
            form.enabled
              ? <Bell className="w-5 h-5 text-brand" />
              : <BellOff className="w-5 h-5 text-slate-400" />
          }
        />

        <div className="border-t border-slate-200">
          <p className="px-4 sm:px-5 pt-4 pb-1 text-xs font-bold tracking-wide text-slate-400">
            알림 종류
          </p>
          <ul className="divide-y divide-slate-100">
            {NOTIFY_TYPES.map((type) => (
              <li key={type}>
                <ToggleRow
                  checked={form.types.includes(type)}
                  disabled={!form.enabled}
                  onChange={(next) => toggleType(type, next)}
                  title={NOTIFY_TYPE_LABELS[type]}
                  hint={NOTIFY_TYPE_HINTS[type]}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-200">
          <p className="px-4 sm:px-5 pt-4 pb-1 text-xs font-bold tracking-wide text-slate-400">
            알림 빈도
          </p>

          <div className={`px-4 sm:px-5 py-3.5 ${form.enabled ? '' : 'opacity-45'}`}>
            <label className="block">
              <span className="font-semibold text-ink block">같은 사람이 여러 번 눌렀을 때</span>
              <span className="text-sm text-slate-500 block mb-2 break-keep">
                한 방문자가 버튼을 반복해 눌러도 이 간격 안에는 한 번만 알립니다.
              </span>
              <select
                value={form.minIntervalMinutes}
                disabled={!form.enabled}
                onChange={(e) => update({ minIntervalMinutes: Number(e.target.value) })}
                className="w-full sm:max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand disabled:bg-slate-50"
              >
                <option value={0}>누를 때마다 알림</option>
                <option value={10}>10분에 한 번만</option>
                <option value={30}>30분에 한 번만 (권장)</option>
                <option value={60}>1시간에 한 번만</option>
                <option value={180}>3시간에 한 번만</option>
              </select>
            </label>
          </div>

          <div className="border-t border-slate-100">
            <ToggleRow
              checked={quietOn}
              disabled={!form.enabled}
              onChange={toggleQuiet}
              title="방해금지 시간"
              hint={
                quietOn
                  ? '이 시간대에는 클릭 알림을 보내지 않습니다. 견적문의 접수는 예외로 항상 옵니다.'
                  : '밤에 알림을 받고 싶지 않으면 켜세요. 견적문의 접수는 예외로 항상 옵니다.'
              }
              icon={<Moon className={`w-5 h-5 ${quietOn ? 'text-brand' : 'text-slate-400'}`} />}
            />

            {quietOn && (
              <div className={`px-4 sm:px-5 pb-4 -mt-1 ${form.enabled ? '' : 'opacity-45'}`}>
                <div className="flex items-center gap-2 max-w-sm">
                  <select
                    aria-label="방해금지 시작 시각"
                    value={form.quietStart ?? 22}
                    disabled={!form.enabled}
                    onChange={(e) => update({ quietStart: Number(e.target.value) })}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand disabled:bg-slate-50"
                  >
                    {Array.from({ length: 24 }, (_, h) => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}시부터</option>
                    ))}
                  </select>
                  <span className="text-slate-400 flex-shrink-0">~</span>
                  <select
                    aria-label="방해금지 종료 시각"
                    value={form.quietEnd ?? 7}
                    disabled={!form.enabled}
                    onChange={(e) => update({ quietEnd: Number(e.target.value) })}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand disabled:bg-slate-50"
                  >
                    {Array.from({ length: 24 }, (_, h) => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}시까지</option>
                    ))}
                  </select>
                </div>
                {form.quietStart === form.quietEnd && (
                  <p className="text-sm text-amber-700 mt-2 break-keep">
                    시작과 종료가 같으면 방해금지가 걸리지 않습니다. 다른 시각을 골라 주세요.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
