// Resend → Naver 메일 도착 확인용 스모크 테스트.
//
// 실행: npm run test:resend
//   (내부적으로 node --env-file=.env.local 로 .env.local 값을 읽어 발송)
//
// 성공하면 message id 를 출력하고, 사장님 Naver 메일함(NOTIFY_TO_EMAIL)에
// "[테스트] 우앤주전력 견적알림 연동 확인" 메일이 도착해야 한다.
// 스팸함까지 함께 확인할 것 (도메인 인증 직후 몇 시간은 스팸으로 갈 수 있음).

import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.NOTIFY_FROM_EMAIL ?? 'onboarding@resend.dev';
const to = process.env.NOTIFY_TO_EMAIL ?? 'wnj-2023@naver.com';

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

if (!apiKey || apiKey.startsWith('re_여기에') || apiKey === 're_xxx') {
  fail('RESEND_API_KEY 가 비어 있거나 placeholder 입니다. .env.local 에 실제 키를 넣어주세요.');
}

if (from.includes('resend.dev')) {
  console.warn(
    '⚠️  발신 주소가 onboarding@resend.dev 입니다. Naver는 이 주소를 스팸 처리·거부할 수 있습니다.\n' +
    '   실운영은 wnjpower.com 도메인 인증 후 quote@wnjpower.com 사용을 권장합니다.\n',
  );
}

console.log(`▸ 발신(from): ${from}`);
console.log(`▸ 수신(to)  : ${to}`);
console.log('▸ Resend로 테스트 메일 발송 중...\n');

const resend = new Resend(apiKey);

const { data, error } = await resend.emails.send({
  from,
  to,
  subject: '[테스트] 우앤주전력 견적알림 연동 확인',
  html: `
    <div style="font-family:Arial,'Malgun Gothic',sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <h2 style="color:#0A3D91;margin:0 0 12px;">✅ Resend → Naver 연동 테스트</h2>
      <p style="color:#334155;line-height:1.7;">
        이 메일이 <b>${to}</b> 받은편지함에 도착했다면,<br>
        견적문의 폼 제출 시 알림 메일이 정상적으로 발송됩니다.
      </p>
      <p style="color:#94A3B8;font-size:13px;margin-top:20px;">
        발신 도메인: ${from}<br>
        이 메일은 scripts/test-resend.mjs 스모크 테스트로 발송되었습니다.
      </p>
    </div>`,
});

if (error) {
  fail(`Resend 발송 실패: ${JSON.stringify(error, null, 2)}`);
}

console.log(`✅ 발송 성공! message id: ${data?.id}`);
console.log(`   → ${to} 받은편지함(및 스팸함)에서 도착을 확인하세요.\n`);
