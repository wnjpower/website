import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const SVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="white"/>
  <polygon points="7,100 100,57 193,100 100,143" fill="none" stroke="#B8911E" stroke-width="8" stroke-linejoin="miter"/>
  <polygon points="21,100 100,67 179,100 100,133" fill="none" stroke="#B8911E" stroke-width="3.5" stroke-linejoin="miter"/>
  <text x="57" y="110" font-size="32" font-family="Georgia,serif" fill="#B8911E" font-weight="bold" text-anchor="middle">W</text>
  <text x="143" y="110" font-size="32" font-family="Georgia,serif" fill="#B8911E" font-weight="bold" text-anchor="middle">J</text>
  <path d="M 116,53 L 126,60 L 105,100 L 119,100 L 87,147 L 77,140 L 98,100 L 84,100 Z" fill="#C82020"/>
</svg>`;

export default function AppleIcon() {
  const b64 = Buffer.from(SVG).toString('base64');
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/svg+xml;base64,${b64}`}
          width={160}
          height={160}
          alt=""
          style={{ objectFit: 'contain' }}
        />
      </div>
    ),
    { ...size },
  );
}
