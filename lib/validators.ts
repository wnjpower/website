import { z } from 'zod';

// 고객 유형별로 표시할 문의 유형 목록
export const QUOTE_CATEGORIES = [
  // 주택·아파트
  'apt_interior',      // 아파트·빌라 인테리어 전기
  'house_new',         // 단독주택 신축·증축 전기
  'panel_home',        // 분전함(두꺼비집) 교체·업그레이드
  'wiring_check',      // 노후 배선 교체·점검
  // 카페·상가
  'store_open',        // 카페·식당·상가 창업 전기
  'power_increase',    // 계약 전력 증설
  'store_remodel',     // 기존 매장 리모델링 전기
  // 상업건물·법인
  'building_new',      // 신축 건물 전기공사
  'building_remodel',  // 기존 건물 리모델링 전기
  'panel_pro',         // 배전반·분전반 제작·설치
  // 공통
  'etc',
] as const;

export const CategoryLabels: Record<typeof QUOTE_CATEGORIES[number], string> = {
  apt_interior:     '아파트·빌라 인테리어 전기',
  house_new:        '단독주택 신축·증축 전기공사',
  panel_home:       '분전함(두꺼비집) 교체·업그레이드',
  wiring_check:     '노후 배선 교체·점검',
  store_open:       '카페·식당·상가 창업 전기',
  power_increase:   '계약 전력 증설',
  store_remodel:    '기존 매장 리모델링 전기',
  building_new:     '신축 건물 전기공사',
  building_remodel: '기존 건물 리모델링 전기',
  panel_pro:        '배전반·분전반 제작·설치',
  etc:              '기타 문의',
};

// 고객 유형별 표시할 카테고리 목록
export const CATEGORIES_BY_CUSTOMER_TYPE: Record<string, Array<typeof QUOTE_CATEGORIES[number]>> = {
  residential:    ['apt_interior', 'house_new', 'panel_home', 'wiring_check', 'etc'],
  small_business: ['store_open', 'power_increase', 'store_remodel', 'panel_home', 'etc'],
  commercial:     ['building_new', 'building_remodel', 'panel_pro', 'power_increase', 'etc'],
  unknown:        ['apt_interior', 'house_new', 'store_open', 'building_new', 'panel_home', 'panel_pro', 'etc'],
};

export const CUSTOMER_TYPES = ['residential', 'small_business', 'commercial', 'unknown'] as const;

export const CustomerTypeLabels: Record<typeof CUSTOMER_TYPES[number], string> = {
  residential:    '개인 (주택·아파트)',
  small_business: '자영업 (카페·식당·상가)',
  commercial:     '사업자·법인 (상업건물·병원·공장)',
  unknown:        '기타',
};

const phoneRegex = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;

export const QuoteSchema = z.object({
  name:         z.string().trim().min(2, '이름은 2자 이상').max(20, '이름은 20자 이내'),
  phone:        z.string().trim().regex(phoneRegex, '연락처 형식이 올바르지 않습니다'),
  region:       z.string().trim().max(40).optional().or(z.literal('')),
  customerType: z.enum(CUSTOMER_TYPES).optional(),
  category:     z.enum(QUOTE_CATEGORIES, { message: '문의 유형을 선택하세요' }),
  message:      z.string().trim().max(1000).optional().or(z.literal('')),
  agree:        z.literal(true, { message: '개인정보 수집·이용에 동의해야 제출됩니다' }),
  website:      z.string().max(0).optional().or(z.literal('')),
  loadedAt:     z.number().int().nonnegative(),
  source:       z.string().max(40).optional().or(z.literal('')),
});

export type QuoteInput = z.infer<typeof QuoteSchema>;
