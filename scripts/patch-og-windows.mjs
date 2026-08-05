// Next 14가 안고 들어온 @vercel/og의 Windows 버그를 고친다.
//
// 실행: npm install 이 끝나면 postinstall로 자동 실행된다. 직접 부를 일은 없다.
//
// ── 무슨 버그인가
//
// next/og 가 쓰는 node_modules/next/dist/compiled/@vercel/og/index.node.js 는
// 폰트와 wasm 파일을 이렇게 읽는다.
//
//     fs.readFileSync(fileURLToPath(join(import.meta.url, "../yoga.wasm")))
//
// path.join()에 "파일 경로"가 아니라 "file:// URL"을 넘긴 게 잘못이다.
// POSIX에서는 join이 슬래시를 그대로 두어 'file:/home/…/yoga.wasm' 이 되고,
// 이건 (좀 이상해도) 유효한 URL이라 fileURLToPath가 통과시킨다. 그래서
// Vercel 빌드(리눅스)는 멀쩡하다.
//
// Windows에서는 path.win32.join이 슬래시를 역슬래시로 바꾸고 앞에 './'를 붙여
//
//     .\file:\C:\Users\…\yoga.wasm
//
// 가 되는데, 이건 URL이 아니다 → new URL()이 "Invalid URL"을 던진다.
// 모듈을 import 하는 순간(=최상위 코드) 터지므로 OG 이미지를 쓰는 곳은
// 전부 죽는다. `next build`는 /opengraph-image 프리렌더에서 실패하고
// `next dev`도 마찬가지다. 즉 Windows에서는 빌드를 통과시킬 방법이 없다.
//
// 한동안 "경로에 공백이 있어서"라고 알고 있었는데 아니다. 공백 없는 경로에서도
// 똑같이 터진다 — Windows면 무조건이다.
//
// ── 왜 이렇게 고치나
//
// 14.2.35가 14.x의 마지막이라 업스트림 수정판이 나올 일이 없다. 대안으로
//   · runtime = 'edge' → 빌드 시점 생성이 요청 시점 생성으로 바뀐다(운영 변경)
//   · 정적 PNG 커밋    → 소스와 이미지가 따로 놀 위험
// 을 검토했지만, 둘 다 "Windows 개발 환경 문제"를 고치자고 운영을 건드린다.
//
// 아래 치환은 리눅스에서도 정확히 같은 파일을 가리킨다. 즉 Vercel에서의
// 동작은 한 바이트도 달라지지 않고, Windows에서만 되살아난다.
//
// 이 스크립트는 절대 설치를 실패시키지 않는다(항상 exit 0). 못 고쳐도
// 리눅스에서는 원래 코드가 잘 돌기 때문에, 배포를 막는 쪽이 더 위험하다.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** join(import.meta.url, "../파일") → new URL("./파일", import.meta.url) */
const BROKEN = /join\(import\.meta\.url,\s*(["'])\.\.\/([^"']+)\1\)/g;

function patch(file) {
  const before = readFileSync(file, 'utf8');
  if (!BROKEN.test(before)) return 'clean'; // 이미 고쳤거나 버그가 없는 버전
  BROKEN.lastIndex = 0;

  const after = before.replace(BROKEN, (_m, q, name) => `new URL(${q}./${name}${q}, import.meta.url)`);
  writeFileSync(file, after);
  return 'patched';
}

try {
  const ogDir = require.resolve('next/dist/compiled/@vercel/og/index.node.js');
  if (!existsSync(ogDir)) process.exit(0);

  const result = patch(ogDir);
  if (result === 'patched') {
    console.log('[patch-og] @vercel/og의 Windows 경로 버그를 고쳤습니다.');
  }
} catch (err) {
  // next가 아직 안 깔렸거나(설치 순서), 구조가 바뀌었거나 — 어느 쪽이든 조용히 넘어간다.
  console.log(`[patch-og] 건너뜀: ${err instanceof Error ? err.message : err}`);
}
