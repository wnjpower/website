/**
 * 견적문의 처리 상태.
 *
 * 'use server' 파일은 async 함수만 내보낼 수 있어서(Next.js 제약) 상수는
 * 여기에 둔다. 서버 액션과 화면이 같은 목록을 보게 하려는 것이 목적이다.
 */

export const LEAD_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new:       '신규',
  contacted: '연락함',
  quoted:    '견적 발송',
  won:       '수주',
  lost:      '실패',
};
