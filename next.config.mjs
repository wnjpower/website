/** @type {import('next').NextConfig} */
const nextConfig = {
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
