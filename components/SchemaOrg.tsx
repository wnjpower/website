import {
  BUSINESS_HOURS,
  COMPANY,
  MAP_URL,
  SAME_AS,
  SERVICE_AREAS,
  SITE_URL,
  VERIFY_LINKS,
} from '@/lib/site';

export default function SchemaOrg() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ElectricalContractor',
    name: COMPANY.name,
    alternateName: COMPANY.brand,
    legalName: COMPANY.name,
    description:
      '대구·경북 공장·산업 전기공사 전문 법인. 공장 신축·증축·증설, 수전설비·계약전력 증설, 동력설비, 배전반·분전반 설계·설치, 인테리어 전기공사.',
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
        '배전반·분전반 설계·설치',
        '인테리어·일반 전기공사',
      ].map((name) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name },
      })),
    },
    /*
     * 시공 가능 지역 — 시군구 단위로 나열한다.
     *
     * '경상북도' 하나로 뭉뚱그리면 «경산 전기공사»처럼 시군 이름으로 들어오는
     * 로컬 검색에 걸리지 않는다. 실제로 시공하는 시군만 적어야 하며,
     * 넓히고 싶으면 lib/site.ts의 SERVICE_AREAS를 고친다.
     */
    areaServed: [
      { '@type': 'City', name: SERVICE_AREAS.primary },
      ...SERVICE_AREAS.cities.map((name) => ({ '@type': 'City', name })),
    ],
    priceRange: '₩₩',
    // 길찾기 — Contact 섹션의 «카카오맵 열기»와 같은 링크(lib/site.ts의 MAP_URL)
    hasMap: MAP_URL,
    /*
     * 영업시간은 lib/site.ts의 BUSINESS_HOURS에서 온다.
     * 예전에는 여기 월~금만 하드코딩돼 있어 사이트가 안내하는 토요일 영업이
     * 구조화 데이터에서 빠져 있었다. 단일 소스로 묶어 어긋날 수 없게 했다.
     */
    openingHoursSpecification: BUSINESS_HOURS.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [...h.days],
      opens: h.opens,
      closes: h.closes,
    })),
    /*
     * aggregateRating(별점)은 넣지 않는다.
     * 실제 리뷰가 없는데 넣으면 구글 구조화 데이터 정책 위반이고, 적발 시
     * 리치 결과 자격이 통째로 박탈된다. 네이버 플레이스에 리뷰가 쌓이면
     * 그때 «플레이스 리뷰 수»를 근거로 추가할 수 있다.
     */
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
