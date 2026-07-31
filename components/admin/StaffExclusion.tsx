'use client';

import { useEffect, useState } from 'react';
import { EyeOff, Eye } from 'lucide-react';
import { isStaffCookieSet, setStaffCookie, clearStaffCookie } from '@/lib/analytics/staff';

/**
 * 관리자 표식을 심는다 (화면에 아무것도 그리지 않음).
 *
 * 어드민 레이아웃에서만 렌더된다. 그 레이아웃은 admins 화이트리스트를 통과한
 * 사용자에게만 도달하므로, "여기까지 왔다 = 관리자다"가 이미 증명된 상태다.
 * 덕분에 표식을 심기 위해 권한을 다시 조회할 필요가 없다.
 */
export function StaffCookieSetter() {
  useEffect(() => {
    setStaffCookie();
  }, []);
  return null;
}

/**
 * 제외 상태 표시 + 해제 토글.
 *
 * 통계에서 무엇이 빠지고 있는지 눈에 보이지 않으면, 나중에 "방문자가 왜 이렇게
 * 적지?"라고 의심하게 된다. 상태를 대시보드에 드러내고 직접 끌 수 있게 둔다.
 */
export function StaffExclusionToggle() {
  // 서버와 클라이언트의 첫 렌더를 맞추기 위해 마운트 후에만 실제 상태를 읽는다
  const [mounted, setMounted] = useState(false);
  const [excluded, setExcluded] = useState(false);

  useEffect(() => {
    setMounted(true);
    setExcluded(isStaffCookieSet());
  }, []);

  if (!mounted) return null;

  function toggle() {
    if (excluded) {
      clearStaffCookie();
      setExcluded(false);
    } else {
      setStaffCookie();
      setExcluded(true);
    }
  }

  return (
    <button
      onClick={toggle}
      title={
        excluded
          ? '지금 이 브라우저의 방문은 방문자 수에 포함되지 않습니다. 눌러서 포함시킬 수 있습니다.'
          : '지금 이 브라우저의 방문이 방문자 수에 포함되고 있습니다. 눌러서 제외할 수 있습니다.'
      }
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        excluded
          ? 'border-slate-200 bg-white text-slate-500 hover:border-brand hover:text-brand'
          : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
      }`}
    >
      {excluded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      {excluded ? '내 방문 제외 중' : '내 방문 집계 중'}
    </button>
  );
}
