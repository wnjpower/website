import { COMPANY, SAME_AS, SITE_URL, VERIFY_LINKS } from '@/lib/site';

export default function SchemaOrg() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ElectricalContractor',
    name: COMPANY.name,
    alternateName: COMPANY.brand,
    legalName: COMPANY.name,
    description:
      '대구·경북 공장·산업 전기공사 전문 법인. 공장 신축·증축·증설, 수전설비·계약전력 증설, 동력설비, 배전반·분전반 자체 제작, 인테리어 전기공사.',
    image: [
      `${SITE_URL}/images/factory-electrical.jpg`,
      `${SITE_URL}/images/switchgear.jpg`,
    ],
    logo: `${SITE_URL}/images/logo.png`,
    url: SITE_URL,
    telephone: `+82-53-525-0424`,
    email: COMPANY.email,
    faxNumber: `+82-53-525-0414`,
    taxID: COMPANY.bizNumber,
    foundingDate: COMPANY.foundingDate,
    founder: { '@type': 'Person', name: COMPANY.ceo },
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.locality,
      addressRegion: COMPANY.address.region,
      postalCode: COMPANY.address.postalCode,
      addressCountry: 'KR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: COMPANY.geo.lat,
      longitude: COMPANY.geo.lng,
    },
    // 전기공사업 등록 — 발주처가 전기공사협회에서 직접 조회할 수 있는 자격
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: '전기공사업 등록',
      identifier: COMPANY.license,
      recognizedBy: {
        '@type': 'Organization',
        name: '대한전기공사협회',
        url: VERIFY_LINKS.keca,
      },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: '전기공사 서비스',
      itemListElement: [
        '공장·산업 전기공사',
        '수전설비·계약전력 증설',
        '배전반·분전반 자체 제작',
        '인테리어·일반 전기공사',
      ].map((name) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name },
      })),
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
    // 네이버 플레이스·블로그·구글 비즈니스 프로필 URL 확보 시 lib/site.ts에 입력하면 반영된다
    sameAs: SAME_AS,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
