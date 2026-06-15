import { z } from 'zod';

// 공사 종류 (사용자 요청 6개로 단순화)
export const QUOTE_CATEGORIES = [
  'factory_new',      // 공장 신축·증축 등 산업현장 전기공사
  'power_receiving',  // 수전설비 공사 (수전반, 계량, 인입)
  'switchboard',      // 배전반·분전반 제작 설치
  'interior_store',   // 상업공간·병원 인테리어 전기공사
  'interior_home',    // 주택·아파트 인테리어 전기공사
  'etc',              // 기타 문의
] as const;

export const CategoryLabels: Record<typeof QUOTE_CATEGORIES[number], string> = {
  factory_new:     '공장 신축·증축 등 산업현장 전기공사',
  power_receiving: '수전설비 공사 (수전반, 계량, 인입)',
  switchboard:     '배전반·분전반 제작 설치',
  interior_store:  '상업공간·병원 인테리어 전기공사',
  interior_home:   '주택·아파트 인테리어 전기공사',
  etc:             '기타 문의',
};

// STEP 1 선택에 따라 STEP 2 항목 필터링
export const CATEGORIES_BY_CUSTOMER_TYPE: Record<string, Array<typeof QUOTE_CATEGORIES[number]>> = {
  industrial: ['factory_new', 'power_receiving', 'switchboard', 'etc'],
  interior:   ['interior_store', 'interior_home', 'etc'],
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
  companyName:  z.string().trim().max(50).optional().or(z.literal('')),
  name:         z.string().trim().min(2, '성함은 2자 이상').max(20, '성함은 20자 이내'),
  phone:        z.string().trim().regex(phoneRegex, '연락처 형식이 올바르지 않습니다'),
  email:        z.string().trim().max(100).optional().or(z.literal('')),
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
