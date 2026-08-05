import 'server-only';
import { unstable_cache, revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  CTA_DEFAULTS,
  CTA_SLOTS,
  pickVariant,
  type Cta,
  type CtaSlot,
} from './schema';

export const CTA_TAG = 'ctas';

type Row = {
  id: string; slot: string; variant: string; label: string; sublabel: string | null;
  href: string; icon: string | null; weight: number; active: boolean;
};

const getActiveCtas = unstable_cache(
  async (): Promise<Row[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('ctas')
        .select('id, slot, variant, label, sublabel, href, icon, weight, active')
        .eq('active', true);
      if (error) {
        console.error('[cta] 조회 실패 — 기본 버튼 사용', error.message);
        return [];
      }
      return (data ?? []) as Row[];
    } catch {
      return [];
    }
  },
  ['ctas-active'],
  { tags: [CTA_TAG], revalidate: 3600 },
);

/**
 * 이번 요청에 노출할 CTA를 슬롯별로 확정한다.
 *
 * 세션 쿠키(미들웨어가 심음)를 기준으로 변형을 고르므로 서버 렌더링 시점에
 * 이미 최종 버튼이 정해진다. 클라이언트에서 바꿔치기하지 않기 때문에
 * 레이아웃이 밀리거나 버튼이 깜빡이는 일이 없다.
 */
export async function resolveCtas(): Promise<Record<CtaSlot, Cta>> {
  const rows = await getActiveCtas();

  let sessionId = 'anon';
  try {
    sessionId = (await cookies()).get('wnj_sid')?.value ?? 'anon';
  } catch {
    // 정적 렌더링 컨텍스트 — 기본 변형으로 간다
  }

  const bySlot = new Map<string, Row[]>();
  for (const row of rows) {
    const list = bySlot.get(row.slot);
    if (list) list.push(row);
    else bySlot.set(row.slot, [row]);
  }

  const out = {} as Record<CtaSlot, Cta>;
  for (const slot of CTA_SLOTS) {
    const candidates = bySlot.get(slot);
    if (!candidates || candidates.length === 0) {
      out[slot] = { id: `default:${slot}`, ...CTA_DEFAULTS[slot] };
      continue;
    }
    const chosen = pickVariant(candidates, sessionId, slot) ?? candidates[0];
    out[slot] = {
      id: chosen.id,
      slot,
      variant: chosen.variant,
      label: chosen.label,
      sublabel: chosen.sublabel,
      href: chosen.href,
      icon: chosen.icon,
      weight: chosen.weight,
      active: chosen.active,
    };
  }
  return out;
}

export function invalidateCtas(): void {
  revalidateTag(CTA_TAG);
}
