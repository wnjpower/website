// 웹 푸시(실시간 알림)용 VAPID 키 쌍을 만든다.
//
// 실행: npm run push:keys
//
// VAPID는 "이 알림을 보낸 서버가 진짜 우앤주전력 서버가 맞다"를 푸시 서비스에
// 증명하는 키다. 공개키는 브라우저가 구독을 만들 때 쓰고(공개돼도 무방),
// 비밀키는 서버가 서명할 때만 쓴다(절대 커밋·노출 금지).
//
// ⚠️ 키를 바꾸면 이미 등록된 기기의 구독이 전부 무효가 된다.
//    한 번 만들어 두고 계속 쓸 것. 바꿨다면 각 기기에서 알림을 다시 켜야 한다.

import webpush from 'web-push';

const { publicKey, privateKey } = webpush.generateVAPIDKeys();

console.log(`
✅ VAPID 키를 만들었습니다.

아래 두 줄을 .env.local 에 넣고, Vercel에도 같은 값을 넣은 뒤 재배포하세요.
(Vercel은 대시보드 Settings → Environment Variables 에서 입력 —
 이 환경의 CLI \`vercel env add\`는 값이 빈 채로 저장되는 문제가 있습니다)

────────────────────────────────────────────────────────────
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}
VAPID_PRIVATE_KEY=${privateKey}
────────────────────────────────────────────────────────────

이어서 필요한 것:
  1) SUPABASE_SERVICE_ROLE_KEY  (Supabase → Project Settings → API Keys)
     방문자가 버튼을 누른 시점에는 로그인 세션이 없어서, 알림 발송 경로만
     이 키로 기기 목록을 읽습니다. 서버에서만 쓰이며 브라우저로 나가지 않습니다.
  2) supabase/push-schema.sql 을 Supabase SQL Editor에서 실행
  3) 배포 후 /admin/notifications 에서 기기마다 [이 기기에서 알림 받기]
`);
