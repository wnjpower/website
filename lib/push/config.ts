/**
 * 실시간 알림 — 공용 상수·타입.
 *
 * 이 파일은 서버·클라이언트 양쪽에서 import된다(어드민 알림 설정 화면이 쓴다).
 * 그래서 web-push나 service_role 클라이언트를 여기서 건드리지 않는다.
 * 실제 발송은 lib/push/send.ts, 발송 판단은 lib/push/dispatch.ts가 맡는다.
 */

/** 브라우저가 구독을 만들 때 쓰는 VAPID 공개키. 공개돼도 되는 값이다. */
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

/**
 * 알림을 보낼 수 있는 이벤트 종류.
 *
 * 값은 events 테이블의 type과 같다(app/api/track/route.ts). 새 종류를 늘리려면
 * 여기와 track의 ALLOWED_TYPES를 함께 본다.
 */
export const NOTIFY_TYPES = [
  'lead',
  'phone_click',
  'kakao_click',
  'cta_click',
  'form_start',
] as const;

export type NotifyType = (typeof NOTIFY_TYPES)[number];

export const NOTIFY_TYPE_LABELS: Record<NotifyType, string> = {
  lead:        '견적문의 접수',
  phone_click: '전화 버튼 클릭',
  kakao_click: '카카오톡 버튼 클릭',
  cta_click:   '그 밖의 버튼 클릭',
  form_start:  '견적폼 작성 시작',
};

export const NOTIFY_TYPE_HINTS: Record<NotifyType, string> = {
  lead:        '폼이 실제로 제출된 순간입니다. 끄지 않기를 권합니다.',
  phone_click: '곧 전화가 걸려올 수 있다는 신호입니다. 부재중 전화를 줄여줍니다.',
  kakao_click: '카카오톡 상담 버튼을 누른 경우입니다.',
  cta_click:   '첫 화면·비용 안내 등 나머지 버튼입니다. 알림이 잦다고 느껴지면 끄세요.',
  form_start:  '폼을 쓰기 시작만 하고 안 보낸 사람까지 잡습니다. 기본은 꺼져 있습니다.',
};

/** 기본으로 켜는 종류 — 의도가 뚜렷한 클릭만. 견적폼 작성 시작은 기본 꺼짐. */
export const DEFAULT_NOTIFY_TYPES: NotifyType[] = [
  'lead',
  'phone_click',
  'kakao_click',
  'cta_click',
];

export interface NotificationSettings {
  enabled: boolean;
  types: NotifyType[];
  /** 같은 방문자·같은 종류 알림을 다시 보내기까지의 최소 간격(분) */
  minIntervalMinutes: number;
  /** 방해금지 시작 시각(한국시간 0~23). null이면 방해금지 없음 */
  quietStart: number | null;
  /** 방해금지 종료 시각(한국시간 0~23) */
  quietEnd: number | null;
}

export const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  types: DEFAULT_NOTIFY_TYPES,
  minIntervalMinutes: 30,
  quietStart: null,
  quietEnd: null,
};

export function isNotifyType(v: unknown): v is NotifyType {
  return typeof v === 'string' && (NOTIFY_TYPES as readonly string[]).includes(v);
}

/** 등록된 기기 — 어드민 화면이 목록으로 보여준다(비밀키는 내려보내지 않는다). */
export interface PushDevice {
  id: string;
  label: string | null;
  device: string | null;
  active: boolean;
  failureCount: number;
  lastError: string | null;
  lastSuccessAt: string | null;
  createdAt: string;
  /**
   * 구독 주소의 뒷부분. 브라우저가 자기 구독과 대조해 "이 기기"를 표시하는 데만 쓴다.
   * 전체 주소를 화면까지 내려보낼 이유는 없다.
   */
  endpointTail: string;
}

/** 서비스워커로 보내는 알림 내용. sw.js의 push 핸들러와 형태를 맞춘다. */
export interface PushMessage {
  title: string;
  body: string;
  /** 알림을 눌렀을 때 열 주소 */
  url: string;
  /** 같은 tag의 알림은 겹쳐 쌓이지 않고 최신 것으로 대체된다 */
  tag: string;
  type: NotifyType | 'test';
}
