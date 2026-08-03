import { COMPANY } from '@/lib/site';

/**
 * CTA 슬롯 — 화면에서 버튼이 놓이는 자리.
 *
 * 슬롯 목록은 코드가 정한다(자리가 없으면 렌더할 곳이 없으므로).
 * 그 자리에 "어떤 문구·색·링크의 버튼이 몇 개 변형으로 들어갈지"는 어드민이 정한다.
 */
export const CTA_SLOTS = [
  'header_phone',
  'hero_primary',
  'hero_secondary',
  'pricing_cta',
  'quote_submit',
  'floating_call',
  'floating_quote',
  'contact_call',
] as const;

export type CtaSlot = (typeof CTA_SLOTS)[number];

export const CTA_SLOT_LABELS: Record<CtaSlot, string> = {
  header_phone:    '헤더 — 전화 버튼',
  hero_primary:    '첫 화면 — 주 버튼',
  hero_secondary:  '첫 화면 — 보조 버튼',
  pricing_cta:     '비용 안내 — 하단 버튼',
  quote_submit:    '견적폼 — 제출 버튼',
  floating_call:   '떠있는 버튼 — 전화',
  floating_quote:  '떠있는 버튼 — 견적문의',
  contact_call:    '연락처 — 전화 버튼',
};

export const CTA_SLOT_HINTS: Record<CtaSlot, string> = {
  header_phone:    '모든 페이지 우측 상단에 항상 보이는 버튼입니다.',
  hero_primary:    '전환에 가장 큰 영향을 주는 버튼. 여기부터 실험하세요.',
  hero_secondary:  '주 버튼 옆 보조 버튼. 보통 견적폼으로 보냅니다.',
  pricing_cta:     '가격을 확인한 직후라 구매 의도가 높은 지점입니다.',
  quote_submit:    '폼을 다 채운 사람이 마지막으로 누르는 버튼입니다.',
  floating_call:   '모바일에서 스크롤 내내 따라다니는 전화 버튼입니다.',
  floating_quote:  '떠있는 버튼 중 견적문의 쪽입니다.',
  contact_call:    '연락처 섹션의 전화 버튼입니다.',
};

export type CtaStyle = 'primary' | 'signal' | 'outline' | 'ghost';

export const CTA_STYLE_LABELS: Record<CtaStyle, string> = {
  primary: '네이비 (기본)',
  signal:  '앰버 강조 (주목도 최상)',
  outline: '테두리만',
  ghost:   '투명 (어두운 배경용)',
};

export interface Cta {
  id: string;
  slot: CtaSlot;
  variant: string;
  label: string;
  sublabel: string | null;
  href: string;
  style: CtaStyle;
  icon: string | null;
  weight: number;
  active: boolean;
}

/**
 * DB에 CTA가 하나도 없을 때 쓰는 기본값 — 지금 사이트에 그려져 있는 버튼 그대로다.
 * 덕분에 마이그레이션 전에도 화면이 비지 않고, 어드민에서 "이 자리를 실험에 쓰겠다"고
 * 등록한 슬롯만 DB 값으로 갈아탄다.
 */
export const CTA_DEFAULTS: Record<CtaSlot, Omit<Cta, 'id'>> = {
  header_phone: {
    slot: 'header_phone', variant: 'A', label: COMPANY.mobile, sublabel: null,
    href: `tel:${COMPANY.mobile}`, style: 'signal', icon: 'Phone', weight: 100, active: true,
  },
  /*
   * 1b 재구축에서 히어로 CTA 위계를 뒤집었다 — 견적(채움) > 전화(테두리).
   *
   * 이전에는 전화가 주 버튼이었다. 공사 사양이 복잡할수록 통화 전환율이 높다는
   * 판단이었는데, 근무 중에 전화를 걸기 어려운 발주 담당자에게는 막다른 길이었다.
   * 견적폼을 주 경로로 두고 전화는 나란히 두어 둘 다 한 번에 보이게 한다.
   */
  hero_primary: {
    slot: 'hero_primary', variant: 'A', label: '무료 현장 견적 신청', sublabel: null,
    href: '#quote', style: 'primary', icon: null, weight: 100, active: true,
  },
  hero_secondary: {
    slot: 'hero_secondary', variant: 'A', label: COMPANY.mobile, sublabel: null,
    href: `tel:${COMPANY.mobile}`, style: 'outline', icon: 'Phone', weight: 100, active: true,
  },
  pricing_cta: {
    slot: 'pricing_cta', variant: 'A', label: '무료 견적 받아보기', sublabel: null,
    href: '#quote', style: 'primary', icon: null, weight: 100, active: true,
  },
  quote_submit: {
    slot: 'quote_submit', variant: 'A', label: '무료 견적 신청하기', sublabel: null,
    href: '#submit', style: 'primary', icon: null, weight: 100, active: true,
  },
  floating_call: {
    slot: 'floating_call', variant: 'A', label: '전화상담', sublabel: null,
    href: `tel:${COMPANY.mobile}`, style: 'signal', icon: 'Phone', weight: 100, active: true,
  },
  floating_quote: {
    slot: 'floating_quote', variant: 'A', label: '견적문의', sublabel: null,
    href: '#quote', style: 'primary', icon: null, weight: 100, active: true,
  },
  contact_call: {
    slot: 'contact_call', variant: 'A', label: `${COMPANY.mobile}`, sublabel: null,
    href: `tel:${COMPANY.mobile}`, style: 'signal', icon: 'Phone', weight: 100, active: true,
  },
};

/**
 * 세션 ID로 변형을 고정 배정한다.
 *
 * 난수를 쓰면 같은 사람이 새로고침할 때마다 다른 버튼을 보게 되어 실험이 무의미해지고,
 * 무엇보다 사용자 경험이 이상해진다. 세션 ID를 해시해 배정하면 같은 방문자는
 * 세션 내내 같은 버튼을 본다. 서버에서 계산하므로 화면 깜빡임도 없다.
 */
export function pickVariant<T extends { variant: string; weight: number }>(
  variants: T[],
  sessionId: string,
  slot: string,
): T | null {
  const usable = variants.filter((v) => v.weight > 0);
  if (usable.length === 0) return variants[0] ?? null;
  if (usable.length === 1) return usable[0];

  const total = usable.reduce((sum, v) => sum + v.weight, 0);
  if (total <= 0) return usable[0];

  // FNV-1a — 짧고 분포가 고르며 의존성이 없다
  let hash = 0x811c9dc5;
  const seed = `${sessionId}:${slot}`;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  let point = hash % total;
  for (const v of usable) {
    if (point < v.weight) return v;
    point -= v.weight;
  }
  return usable[usable.length - 1];
}
