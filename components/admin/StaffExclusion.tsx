'use client';

import { useEffect, useState } from 'react';
import { EyeOff, Eye } from 'lucide-react';
import { isStaffExcluded, excludeMyVisits, includeMyVisits } from '@/lib/analytics/staff';

/**
 * 제외 상태 표시 + 토글.
 *
 * 표식을 심는 일은 미들웨어(서버)가 한다. 여기서는 현재 상태를 보여주고
 * 직접 끄고 켜는 것만 담당한다.
 *
 * 무엇이 통계에서 빠지고 있는지 눈에 보이지 않으면 나중에 "방문자가 왜 이렇게
 * 적지?"라고 의심하게 되고, 수집이 실제로 되는지 확인하고 싶을 때도 막힌다.
 */
export function StaffExclusionToggle() {
  // 서버·클라이언트 첫 렌더를 맞추기 위해 마운트 후에만 실제 쿠키를 읽는다
  const [mounted, setMounted] = useState(false);
  const [excluded, setExcluded] = useState(false);

  useEffect(() => {
    setMounted(true);
    setExcluded(isStaffExcluded());
  }, []);

  if (!mounted) return null;

  function toggle() {
    if (excluded) {
      includeMyVisits();
      setExcluded(false);
    } else {
      excludeMyVisits();
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
