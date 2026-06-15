/**
 * 카카오 알림톡 발송 — Solapi 연동
 *
 * 활성화 조건: .env.local에 아래 변수가 모두 입력되어야 발송됨.
 *   SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_PF_ID,
 *   SOLAPI_TEMPLATE_TO_REQUESTER, SOLAPI_TEMPLATE_TO_OWNER
 * 변수 미입력 시 false를 반환하고 아무것도 하지 않음.
 *
 * 설치: npm install solapi  (이미 완료)
 * 대시보드: https://console.solapi.com
 */
import { SolapiMessageService } from 'solapi';

const isEnabled = Boolean(
  process.env.SOLAPI_API_KEY &&
  process.env.SOLAPI_API_SECRET &&
  process.env.SOLAPI_PF_ID &&
  process.env.SOLAPI_TEMPLATE_TO_REQUESTER &&
  process.env.SOLAPI_TEMPLATE_TO_OWNER,
);

const OWNER_PHONE = (process.env.OWNER_MOBILE ?? '01085529994').replace(/-/g, '');

export interface AlimtalkPayload {
  requesterPhone: string;
  requesterName:  string;
  companyName?:   string;
  categoryLabel:  string;
  region?:        string;
  timestamp:      string;
}

/**
 * 신청자 + 사장님 양쪽에 알림톡 발송.
 * @returns 발송 성공 여부 (false → 미설정 또는 오류)
 */
export async function sendAlimtalk(payload: AlimtalkPayload): Promise<boolean> {
  if (!isEnabled) return false;

  const pfId       = process.env.SOLAPI_PF_ID!;
  const senderNo   = (process.env.SOLAPI_SENDER_NUMBER ?? OWNER_PHONE).replace(/-/g, '');
  const tmplReq    = process.env.SOLAPI_TEMPLATE_TO_REQUESTER!;
  const tmplOwn    = process.env.SOLAPI_TEMPLATE_TO_OWNER!;
  const phone      = payload.requesterPhone.replace(/-/g, '');

  const service = new SolapiMessageService(
    process.env.SOLAPI_API_KEY!,
    process.env.SOLAPI_API_SECRET!,
  );

  try {
    // ① 견적 신청자에게 접수 확인 알림톡
    await service.send({
      to:   phone,
      from: senderNo,
      kakaoOptions: {
        pfId,
        templateId:  tmplReq,
        variables:   {
          '#{성함}':    payload.requesterName,
          '#{공사종류}': payload.categoryLabel,
          '#{접수일시}': payload.timestamp,
        },
        disableSms: false, // 카카오 미연동 번호 → SMS 대체 발송
      },
    });

    // ② 사장님(우앤주전력)에게 새 문의 알림
    await service.send({
      to:   OWNER_PHONE,
      from: senderNo,
      kakaoOptions: {
        pfId,
        templateId:  tmplOwn,
        variables:   {
          '#{업체명}':  payload.companyName ?? '(미입력)',
          '#{성함}':   payload.requesterName,
          '#{연락처}': payload.requesterPhone,
          '#{공사종류}': payload.categoryLabel,
          '#{지역}':   payload.region ?? '(미입력)',
          '#{접수일시}': payload.timestamp,
        },
        disableSms: false,
      },
    });

    return true;
  } catch (e) {
    console.error('[alimtalk] send failed', e);
    return false;
  }
}
