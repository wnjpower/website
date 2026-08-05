import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /*
   * Next 15는 lockfile을 찾아 워크스페이스 루트를 추론하는데, 이 환경에는
   * 홈 디렉터리(C:\Users\...)에도 package-lock.json이 있어서 그쪽을 루트로
   * 잡는다. 그러면 서버리스 번들에 넣을 파일을 추적하는 범위가 어긋난다.
   * 이 저장소가 루트임을 명시해 둔다.
   */
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),

  async redirects() {
    return [
      // apex(wnjpower.com) → www 정규화.
      // 두 도메인이 모두 200을 반환하면 같은 문서가 서로 다른 URL로 색인되어
      // 검색엔진이 평가를 나눠 갖는다. canonical 태그만으로도 신호는 주지만,
      // 308 리다이렉트로 아예 한쪽만 남기는 편이 확실하다.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'wnjpower.com' }],
        destination: 'https://www.wnjpower.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
