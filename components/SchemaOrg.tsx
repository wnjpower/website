export default function SchemaOrg() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ElectricalContractor',
    name: '주식회사 우앤주전력',
    alternateName: 'WNJ Electric',
    description:
      '대구·경북 공장·산업 전기공사 전문 법인. 공장 신축·증축·증설, 수전설비·계약전력 증설, 동력설비, 배전반·분전반 자체 제작, 인테리어 전기공사.',
    image: '/og-image.png',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    telephone: '+82-53-525-0424',
    email: 'wnj-2023@naver.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '문화로63길 19, 1층',
      addressLocality: '서구',
      addressRegion: '대구광역시',
      postalCode: '41709',
      addressCountry: 'KR',
    },
    areaServed: ['대구광역시', '경상북도'],
    priceRange: '₩₩',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
