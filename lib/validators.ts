import { z } from 'zod';

export const QUOTE_CATEGORIES = [
  'electric',
  'panel',
  'interior',
  'etc',
] as const;

export const CategoryLabels: Record<typeof QUOTE_CATEGORIES[number], string> = {
  electric: '전기공사',
  panel:    '분전함 자체 제작',
  interior: '실내 인테리어 전기',
  etc:      '기타',
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
