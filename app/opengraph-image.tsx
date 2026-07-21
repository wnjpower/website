import { ImageResponse } from 'next/og';
import { COMPANY } from '@/lib/site';

export const alt = '대구·경북 공장 전기공사 — 주식회사 우앤주전력';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Satori는 시스템 폰트에 한글 글리프가 없으면 빈 칸으로 렌더한다.
// 한글이 나오도록 Pretendard를 직접 주입한다.
const FONT_BASE =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static';

// WNJ 마크 — apple-icon.tsx와 같은 도형, 다크 배경용으로 흰 바탕만 제거
const MARK = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <polygon points="7,100 100,57 193,100 100,143" fill="none" stroke="#D4A82A" stroke-width="8" stroke-linejoin="miter"/>
  <polygon points="21,100 100,67 179,100 100,133" fill="none" stroke="#D4A82A" stroke-width="3.5" stroke-linejoin="miter"/>
  <text x="57" y="110" font-size="32" font-family="Georgia,serif" fill="#D4A82A" font-weight="bold" text-anchor="middle">W</text>
  <text x="143" y="110" font-size="32" font-family="Georgia,serif" fill="#D4A82A" font-weight="bold" text-anchor="middle">J</text>
  <path d="M 116,53 L 126,60 L 105,100 L 119,100 L 87,147 L 77,140 L 98,100 L 84,100 Z" fill="#FF5500"/>
</svg>`;

async function loadFont(file: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(`${FONT_BASE}/${file}`);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [bold, regular] = await Promise.all([
    loadFont('Pretendard-Bold.otf'),
    loadFont('Pretendard-Regular.otf'),
  ]);

  const fonts = [
    bold && { name: 'Pretendard', data: bold, weight: 700 as const, style: 'normal' as const },
    regular && { name: 'Pretendard', data: regular, weight: 400 as const, style: 'normal' as const },
  ].filter((f): f is NonNullable<typeof f> => Boolean(f));

  const mark = `data:image/svg+xml;base64,${Buffer.from(MARK).toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0A2138',
          fontFamily: 'Pretendard',
        }}
      >
        {/* 상단 안전 오렌지 액센트 바 */}
        <div style={{ display: 'flex', width: '100%', height: 14, backgroundColor: '#C2620E' }} />

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '54px 64px 48px',
          }}
        >
          {/* 브랜드 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mark} width={78} height={78} alt="" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 34, fontWeight: 700, color: '#FFFFFF' }}>
                {COMPANY.name}
              </span>
              <span style={{ fontSize: 19, color: '#94A3B8', letterSpacing: 5 }}>
                WNJ ELECTRIC
              </span>
            </div>
          </div>

          {/* 핵심 메시지 */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: '#C2620E', marginBottom: 16 }}>
              대구·경북 공장·산업 전기공사 전문
            </span>
            <span style={{ fontSize: 68, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.25 }}>
              수전설비 · 계약전력 증설
            </span>
            <span style={{ fontSize: 68, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.25 }}>
              배전반 설계·설치
            </span>
          </div>

          {/* 자격·연락처 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              paddingTop: 28,
            }}
          >
            <span style={{ fontSize: 23, color: '#94A3B8' }}>
              전기공사업 등록 {COMPANY.license} · 사업자 {COMPANY.bizNumber}
            </span>
            <span style={{ fontSize: 36, fontWeight: 700, color: '#FFFFFF' }}>
              {COMPANY.phone}
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
