import { z } from 'zod';

// 고객 유형별로 표시할 문의 유형 목록
export const QUOTE_CATEGORIES = [
  // 공장·산업 (주력 — 먼저)
  'factory_new',      // 공장 신축·증축 전기공사
  'power_receiving',  // 수전설비 공사 (수전반·계량·인입)
  'power_increase',   // 계약전력 증설
  'factory_power',    // 동력설비 공사
  'switchboard',      // 배전반·분전반 제작·설치
  // 인테리어·일반 (부수)
  'interior_store',   // 상가·병원 인테리어 전기
  'interior_home',    // 주택·아파트 인테리어 전기
  'wiring_check',     // 노후 배선 교체·점검
  'panel_home',       // 분전함(두꺼비집) 교체·업그레이드
  // 공통
  'etc',
] as const;

export const CategoryLabels: Record<typeof QUOTE_CATEGORIES[number], string> = {
  factory_new:     '공장 신축·증축 전기공사',
  power_receiving: '수전설비 공사 (수전반·계량·인입)',
  power_increase:  '계약전력 증설',
  factory_power:   '동력설비 공사',
  switchboard:     '배전반·분전반 제작·설치',
  interior_store:  '상가·병원 인테리어 전기',
  interior_home:   '주택·아파트 인테리어 전기',
  wiring_check:    '노후 배선 교체·점검',
  panel_home:      '분전함(두꺼비집) 교체·업그레이드',
  etc:             '기타 문의',
};

// 고객 유형별 표시할 카테고리 목록
export const CATEGORIES_BY_CUSTOMER_TYPE: Record<string, Array<typeof QUOTE_CATEGORIES[number]>> = {
  industrial: ['factory_new', 'power_receiving', 'power_increase', 'factory_power', 'switchboard', 'etc'],
  interior:   ['interior_store', 'interior_home', 'wiring_check', 'panel_home', 'etc'],
  unknown:    ['factory_new', 'power_receiving', 'switchboard', 'interior_store', 'interior_home', 'etc'],
};

export const CUSTOMER_TYPES = ['industrial', 'interior', 'unknown'] as const;

export const CustomerTypeLabels: Record<typeof CUSTOMER_TYPES[number], string> = {
  industrial: '공장·산업 전기공사',
  interior:   '인테리어·일반 전기 (주택·상가·병원)',
  unknown:    '기타·잘 모르겠어요',
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
