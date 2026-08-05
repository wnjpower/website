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

/**
 * 편집 대상은 아니지만 클릭이 집계되는 자리.
 *
 * 1b 재구축에서 사업영역 카드·서비스 상세·실적 상세·퀵폼에 `data-cta-slot`을 달았다.
 * 이 자리들은 문구가 본문에 매여 있어 어드민에서 갈아끼우지 않는다. 그래도 실시간
 * 현황에는 성과가 뜨는데, 이름이 없으면 `service_card_factory` 같은 영문 id가
 * 그대로 보인다. 화면에 나오는 이상 한국어 이름을 붙인다.
 */
const CATEGORY_LABELS: Record<string, string> = {
  factory:  '공장·산업',
  power:    '수전·증설',
  panel:    '배전반',
  interior: '인테리어·일반',
};

const SLOT_PREFIXES: [string, string][] = [
  ['service_card_',   '사업영역 카드'],
  ['service_cta_',    '서비스 상세 하단'],
  ['portfolio_cta_',  '실적 상세 하단'],
];

const EXTRA_SLOT_LABELS: Record<string, string> = {
  quick_bar_submit: '빠른 견적 접수 — 제출',
  mobile_bar:       '모바일 하단 바',
};

/** 실시간 현황·리포트에서 슬롯 id를 사람이 읽는 이름으로 바꾼다. */
export function ctaSlotLabel(slot: string): string {
  if (slot in CTA_SLOT_LABELS) return CTA_SLOT_LABELS[slot as CtaSlot];
  if (slot in EXTRA_SLOT_LABELS) return EXTRA_SLOT_LABELS[slot];

  for (const [prefix, label] of SLOT_PREFIXES) {
    if (slot.startsWith(prefix)) {
      const rest = slot.slice(prefix.length);
      return `${label} — ${CATEGORY_LABELS[rest] ?? rest}`;
    }
  }
  return slot;
}

/*
 * 버튼 색(style)은 여기 있었다.
 *
 * 1b 블루프린트에는 강조색이 액센트 하나뿐이라 어느 값을 골라도 화면이 같았다.
 * 편집 화면 → 이름표 → 타입·조회·저장 순으로 걷어냈고, 마지막으로 DB 컬럼
 * ctas.style까지 지웠다(supabase/migrations). 색 선택을 되살릴 일이 생기면
 * 컬럼부터 다시 만들면 된다 — 지울 당시 ctas 테이블은 비어 있었으므로
 * 잃은 데이터는 없다.
 */

export interface Cta {
  id: string;
  slot: CtaSlot;
  variant: string;
  label: string;
  sublabel: string | null;
  href: string;
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
    href: `tel:${COMPANY.mobile}`, icon: 'Phone', weight: 100, active: true,
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
    href: '#quote', icon: null, weight: 100, active: true,
  },
  hero_secondary: {
    slot: 'hero_secondary', variant: 'A', label: COMPANY.mobile, sublabel: null,
    href: `tel:${COMPANY.mobile}`, icon: 'Phone', weight: 100, active: true,
  },
  pricing_cta: {
    slot: 'pricing_cta', variant: 'A', label: '무료 견적 받아보기', sublabel: null,
    href: '#quote', icon: null, weight: 100, active: true,
  },
  quote_submit: {
    slot: 'quote_submit', variant: 'A', label: '무료 견적 신청하기', sublabel: null,
    href: '#submit', icon: null, weight: 100, active: true,
  },
  floating_call: {
    slot: 'floating_call', variant: 'A', label: '전화상담', sublabel: null,
    href: `tel:${COMPANY.mobile}`, icon: 'Phone', weight: 100, active: true,
  },
  floating_quote: {
    slot: 'floating_quote', variant: 'A', label: '견적문의', sublabel: null,
    href: '#quote', icon: null, weight: 100, active: true,
  },
  contact_call: {
    slot: 'contact_call', variant: 'A', label: `${COMPANY.mobile}`, sublabel: null,
    href: `tel:${COMPANY.mobile}`, icon: 'Phone', weight: 100, active: true,
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
