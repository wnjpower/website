/**
 * 사이트 전역 상수.
 *
 * 외부 채널(카카오톡·네이버 플레이스·블로그)은 개설 전까지 null로 둔다.
 * null이면 관련 버튼·링크가 화면에서 자동으로 빠지므로, 더미 URL이 노출돼
 * 신뢰를 깎는 일이 없다. URL을 확보하면 이 파일만 채우면 전역에 반영된다.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.wnjpower.com';

/** 카카오톡 채널. 개설 후 'https://pf.kakao.com/_XXXXX' 형태로 입력. */
export const KAKAO_CHANNEL_URL: string | null = null;

/** 네이버 플레이스(스마트플레이스). 등록 후 입력하면 SchemaOrg sameAs에 반영된다. */
export const NAVER_PLACE_URL: string | null = null;

/** 네이버 블로그. */
export const NAVER_BLOG_URL: string | null = null;

/** 구글 비즈니스 프로필. */
export const GOOGLE_BUSINESS_URL: string | null = null;

// as (string | null)[] — 값이 전부 null인 동안 TS가 null[]로 좁히는 것을 막는다
export const SAME_AS: string[] = (
  [
    NAVER_PLACE_URL,
    NAVER_BLOG_URL,
    GOOGLE_BUSINESS_URL,
    KAKAO_CHANNEL_URL,
  ] as (string | null)[]
).filter((url): url is string => Boolean(url));

export const COMPANY = {
  name: '주식회사 우앤주전력',
  brand: 'WNJ Electric',
  ceo: '임태훈',
  phone: '053-525-0424',
  mobile: '010-8552-9994',
  fax: '053-525-0414',
  email: 'wnj-2023@naver.com',
  /** 사업자등록번호 */
  bizNumber: '637-81-02833',
  /** 법인등록번호 */
  corpNumber: '170111-0899990',
  /** 전기공사업 등록번호 */
  license: '대구-01425',
  foundingDate: '2023-03-17',
  address: {
    full: '대구광역시 서구 문화로63길 19, 1층 (평리동)',
    street: '문화로63길 19, 1층',
    locality: '서구',
    region: '대구광역시',
    postalCode: '41709',
  },
  /**
   * 위경도 — OpenStreetMap 기준 '문화로63길' 도로 좌표(도로 단위 정확도).
   * 카카오맵에서 건물 핀을 확인하면 더 정밀한 값으로 갱신할 것.
   */
  geo: { lat: 35.8772, lng: 128.5678 },
} as const;

/**
 * 영업시간 — 여기가 단일 소스다.
 *
 * 이 값 하나에서 세 곳이 파생된다.
 *   1) 사이트 표시 문구      — HOURS_TEXT
 *   2) 구조화 데이터         — SchemaOrg의 openingHoursSpecification
 *   3) 네이버 플레이스 등록  — docs/네이버_스마트플레이스_등록.md
 *
 * 예전에는 표시 문구가 콘텐츠 기본값에, 구조화 데이터가 SchemaOrg에 따로 있었다.
 * 그래서 **사이트는 «토 09:00–13:00»을 보여주는데 구조화 데이터에는 토요일이
 * 아예 없는** 상태였다. 로컬 검색은 구조화 데이터의 영업시간으로 «영업 중»을
 * 판정하므로, 토요일에 검색한 발주처에게 닫힌 업체로 보였다는 뜻이다.
 *
 * 로컬 SEO에서 NAP(이름·주소·전화)와 영업시간은 **사이트·구조화 데이터·플레이스
 * 세 곳이 글자 단위로 같아야** 검색엔진이 동일 업체로 묶는다. 값을 한 곳에 둬야
 * 어긋날 수 없다.
 */
export const BUSINESS_HOURS = [
  {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const,
    label: '평일',
    opens: '09:00',
    closes: '18:00',
  },
  {
    days: ['Saturday'] as const,
    label: '토',
    opens: '09:00',
    closes: '13:00',
  },
] as const;

/** 휴무 안내 — 영업시간 문구 뒤에 붙는다. */
export const HOURS_NOTE = '일요일·공휴일 휴무 (긴급 A/S는 상시 접수)';

/** 사이트에 표시되는 영업시간 한 줄. 예: `평일 09:00–18:00 · 토 09:00–13:00` */
export const HOURS_TEXT = BUSINESS_HOURS
  .map((h) => `${h.label} ${h.opens}–${h.closes}`)
  .join(' · ');

/**
 * 시공 가능 지역.
 *
 * `areaServed` 구조화 데이터와 사이트 표시 문구가 같은 목록에서 나온다.
 * 로컬 검색은 «대구 전기공사»뿐 아니라 «경산 전기공사»처럼 시군구 단위로도
 * 들어오므로, 뭉뚱그린 '경상북도'보다 실제 시군을 나열하는 편이 유리하다.
 */
export const SERVICE_AREAS = {
  primary: '대구광역시',
  cities: ['경산시', '영천시', '칠곡군', '성주군', '고령군', '구미시'],
} as const;

/** 사이트에 표시되는 시공 가능 지역 한 줄. */
export const SERVICE_AREA_TEXT =
  `${SERVICE_AREAS.primary} 전 지역 · 경상북도(${SERVICE_AREAS.cities
    .map((c) => c.replace(/(시|군)$/, ''))
    .join('·')} 등)`;

/** 카카오맵 길찾기 링크 — Contact 약도와 구조화 데이터 hasMap이 같은 값을 쓴다. */
export const MAP_URL =
  `https://map.kakao.com/link/map/${encodeURIComponent(COMPANY.name)},${COMPANY.geo.lat},${COMPANY.geo.lng}`;

/** 공적 자격 검증 링크 — 발주처가 직접 조회할 수 있는 실제 조회 화면. */
export const VERIFY_LINKS = {
  /** 대한전기공사협회 전기공사종합정보시스템 — 전기공사업체 조회 */
  keca: 'https://www.keca.or.kr/ecic',
  /** 국세청 홈택스 — 사업자등록번호 상태(진위) 조회 */
  hometax:
    'https://teht.hometax.go.kr/websquare/websquare.html?w2xPath=/ui/ab/a/a/UTEABAAA13.xml',
} as const;
