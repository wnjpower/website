# 02. JSON-LD 구조화 데이터 스키마

## 원칙

- **모든 페이지에 `@graph` 형태로 단일 `<script type="application/ld+json">` 하나만** 삽입 (스키마 분산 금지)
- 조직 정보는 `@id` 참조로 재사용 (중복 선언 금지)
- 사이트 전역 노드 ID 규칙:
  - 조직: `{{도메인}}/#organization`
  - 사이트: `{{도메인}}/#website`
  - 페이지: `{현재URL}#webpage`

---

## 1. 전역 조직 스키마 (모든 페이지 공통)

`schema.org/Electrician` 은 `LocalBusiness` 의 정식 하위 타입입니다. 전기공사업체에는 이것을 쓰세요.

```json
{
  "@context": "https://schema.org",
  "@type": ["Electrician", "GeneralContractor"],
  "@id": "{{도메인}}/#organization",
  "name": "주식회사 우앤주전력",
  "alternateName": ["우앤주전력", "WooJoo Electric Power"],
  "url": "{{도메인}}/",
  "logo": {
    "@type": "ImageObject",
    "url": "{{도메인}}/images/logo.png",
    "width": 512,
    "height": 512
  },
  "image": "{{도메인}}/images/og-default.jpg",
  "description": "대구 서구에 위치한 전기공사업 등록업체입니다. 전기내선공사, 분전반 교체, 승압공사, 공장 동력설비 배선을 종합건설사·인테리어 시공사·시설관리자·건축주를 대상으로 시공합니다.",
  "foundingDate": "{{설립연도}}",
  "telephone": "{{대표전화}}",
  "email": "{{이메일}}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{상세주소}}",
    "addressLocality": "서구",
    "addressRegion": "대구광역시",
    "postalCode": "{{우편번호}}",
    "addressCountry": "KR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{위도}}",
    "longitude": "{{경도}}"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "08:00",
      "closes": "18:00"
    }
  ],
  "areaServed": [
    { "@type": "AdministrativeArea", "name": "대구광역시 서구" },
    { "@type": "AdministrativeArea", "name": "대구광역시 달서구" },
    { "@type": "AdministrativeArea", "name": "대구광역시 북구" },
    { "@type": "AdministrativeArea", "name": "대구광역시 중구" },
    { "@type": "AdministrativeArea", "name": "대구광역시 달성군" },
    { "@type": "AdministrativeArea", "name": "경상북도 경산시" },
    { "@type": "AdministrativeArea", "name": "경상북도 칠곡군" }
  ],
  "identifier": [
    {
      "@type": "PropertyValue",
      "name": "사업자등록번호",
      "value": "{{사업자등록번호}}"
    },
    {
      "@type": "PropertyValue",
      "name": "전기공사업 등록번호",
      "value": "{{전기공사업_등록번호}}"
    }
  ],
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "license",
      "name": "전기공사업 등록 (전기공사업법 제4조)",
      "recognizedBy": {
        "@type": "GovernmentOrganization",
        "name": "대구광역시"
      }
    }
  ],
  "memberOf": {
    "@type": "Organization",
    "name": "한국전기공사협회",
    "url": "https://www.keca.or.kr/"
  },
  "knowsAbout": [
    "전기내선공사",
    "분전반 교체",
    "계약전력 변경 및 승압공사",
    "한국전기설비규정(KEC)",
    "전기공사 분리발주",
    "사용전점검 및 사용전검사",
    "공장 동력설비 배선",
    "LED 조명 교체 공사"
  ],
  "makesOffer": [
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "전기내선공사" } },
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "분전반 교체·증설" } },
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "승압공사·계약전력 변경" } },
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "공장 동력설비 배선" } }
  ],
  "sameAs": [
    "{{네이버_플레이스_URL}}",
    "{{구글_비즈니스_프로필_URL}}",
    "{{인스타그램_URL}}"
  ]
}
```

> **주의**: `aggregateRating` 은 실제 검증 가능한 리뷰가 있을 때만 넣으세요. 자체 입력 별점은 구글 스팸 정책 위반이며 리치리절트 제거 사유입니다.

---

## 2. WebSite 스키마 (홈에만)

```json
{
  "@type": "WebSite",
  "@id": "{{도메인}}/#website",
  "url": "{{도메인}}/",
  "name": "주식회사 우앤주전력",
  "publisher": { "@id": "{{도메인}}/#organization" },
  "inLanguage": "ko-KR"
}
```

---

## 3. 서비스 페이지 스키마

각 `/services/{slug}/` 페이지용.

```json
{
  "@type": "Service",
  "@id": "{{도메인}}/services/capacity-upgrade/#service",
  "name": "승압공사 · 계약전력 변경",
  "alternateName": ["전기 증설", "계약전력 증설", "승압"],
  "serviceType": "전기공사업 - 승압 및 계약전력 변경",
  "description": "기존 계약전력으로 설비 용량이 부족할 때 한국전력 신청부터 수용가 설비 공사, 사용전점검까지 일괄 진행하는 공사입니다.",
  "provider": { "@id": "{{도메인}}/#organization" },
  "areaServed": [
    { "@type": "AdministrativeArea", "name": "대구광역시" },
    { "@type": "AdministrativeArea", "name": "경상북도" }
  ],
  "audience": [
    { "@type": "Audience", "audienceType": "상가 임차인 및 자영업자" },
    { "@type": "Audience", "audienceType": "공장 시설관리 담당자" },
    { "@type": "Audience", "audienceType": "인테리어 시공사" }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "승압공사 범위",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "한국전력 계약전력 변경 신청 대행" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "인입선 및 계량기 주변 설비 공사" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "분전반 용량 증설" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "한국전기안전공사 사용전점검 대응" } }
    ]
  },
  "termsOfService": "{{도메인}}/about/process/",
  "url": "{{도메인}}/services/capacity-upgrade/"
}
```

---

## 4. 고객유형 페이지 스키마

각 `/clients/{slug}/` 페이지용. **`audience` 를 최상위로 끌어올리는 것이 핵심**입니다.

```json
{
  "@type": "WebPage",
  "@id": "{{도메인}}/clients/interior/#webpage",
  "url": "{{도메인}}/clients/interior/",
  "name": "인테리어·리모델링 시공사를 위한 전기공사 협력",
  "isPartOf": { "@id": "{{도메인}}/#website" },
  "about": { "@id": "{{도메인}}/#organization" },
  "audience": {
    "@type": "BusinessAudience",
    "audienceType": "인테리어 시공사 및 리모델링 업체",
    "geographicArea": { "@type": "AdministrativeArea", "name": "대구광역시" }
  },
  "significantLink": [
    "{{도메인}}/services/circuit-addition/",
    "{{도메인}}/services/led-retrofit/",
    "{{도메인}}/services/panel-replacement/"
  ],
  "primaryImageOfPage": {
    "@type": "ImageObject",
    "url": "{{도메인}}/images/clients/interior-hero.jpg"
  }
}
```

---

## 5. 시공사례 스키마

각 `/projects/{slug}/` 페이지용.

```json
{
  "@type": "Article",
  "@id": "{{도메인}}/projects/daegu-cafe-power-upgrade/#article",
  "headline": "대구 서구 카페 신규 개업 — 계약전력 5kW → 20kW 승압 및 내선공사",
  "description": "40평 규모 카페 개업에 맞춰 계약전력을 20kW로 승압하고 주방·홀 회로를 분리 시공한 사례입니다.",
  "author": { "@id": "{{도메인}}/#organization" },
  "publisher": { "@id": "{{도메인}}/#organization" },
  "datePublished": "2026-03-14",
  "dateModified": "2026-03-14",
  "image": ["{{도메인}}/images/projects/cafe-01.jpg"],
  "about": [
    { "@type": "Service", "name": "승압공사" },
    { "@type": "Service", "name": "전기내선공사" }
  ],
  "spatialCoverage": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "서구",
      "addressRegion": "대구광역시",
      "addressCountry": "KR"
    }
  },
  "mentions": [
    { "@type": "Thing", "name": "계약전력 변경" },
    { "@type": "Thing", "name": "사용전점검" },
    { "@type": "Organization", "name": "한국전기안전공사" }
  ],
  "inLanguage": "ko-KR"
}
```

---

## 6. FAQ 스키마

`/faq/` 및 각 페이지 하단 FAQ 블록용.

```json
{
  "@type": "FAQPage",
  "@id": "{{도메인}}/faq/capacity/#faqpage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "상가 계약전력을 5kW에서 20kW로 올리는 데 얼마나 걸리나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "대구 기준으로 통상 2~3주가 소요됩니다. 한국전력 신청 처리, 수용가 설비 공사, 한국전기안전공사 사용전점검 순으로 진행되며 이 중 한전 처리 기간이 가장 큰 변수입니다. 개업일이 확정돼 있다면 최소 1개월 전 착수를 권합니다."
      }
    }
  ]
}
```

> **주의**: 구글은 2023년부터 일반 사이트의 FAQ 리치리절트 노출을 축소했습니다. 그러나 **LLM은 FAQPage 마크업을 여전히 강하게 참조**합니다. 검색 리치리절트가 아니라 AI 인용을 위해 넣는 것임을 인지하고 유지하세요.

---

## 7. 빵부스러기(BreadcrumbList)

모든 하위 페이지 필수.

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "홈", "item": "{{도메인}}/" },
    { "@type": "ListItem", "position": 2, "name": "공사 항목", "item": "{{도메인}}/services/" },
    { "@type": "ListItem", "position": 3, "name": "승압공사·계약전력 변경" }
  ]
}
```

---

## 8. Next.js 구현 예시

```tsx
// components/JsonLd.tsx
type Props = { data: Record<string, unknown>[] };

export function JsonLd({ data }: Props) {
  const graph = {
    "@context": "https://schema.org",
    "@graph": data,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
```

```tsx
// app/services/[slug]/page.tsx (발췌)
import { JsonLd } from "@/components/JsonLd";
import { organizationNode, breadcrumbNode, serviceNode, faqNode } from "@/lib/schema";

export default function ServicePage({ params }) {
  const service = getService(params.slug);
  return (
    <>
      <JsonLd
        data={[
          organizationNode,
          breadcrumbNode(["홈", "공사 항목", service.name], service.url),
          serviceNode(service),
          faqNode(service.faqs, service.url),
        ]}
      />
      {/* 본문 */}
    </>
  );
}
```

---

## 9. 검증

배포 전 아래 3개 도구를 모두 통과시키세요.

1. [Schema Markup Validator](https://validator.schema.org/) — 문법 오류 0건
2. [Google Rich Results Test](https://search.google.com/test/rich-results) — 경고 확인
3. `curl -A "GPTBot" {{도메인}}/services/capacity-upgrade/ | grep "application/ld+json"` — **크롤러 UA로 요청했을 때도 JSON-LD가 HTML에 포함되는지 확인** (이게 실패하면 CSR 문제)
