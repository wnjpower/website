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

/** 공적 자격 검증 링크 — 발주처가 직접 조회할 수 있는 실제 조회 화면. */
export const VERIFY_LINKS = {
  /** 대한전기공사협회 전기공사종합정보시스템 — 전기공사업체 조회 */
  keca: 'https://www.keca.or.kr/ecic',
  /** 국세청 홈택스 — 사업자등록번호 상태(진위) 조회 */
  hometax:
    'https://teht.hometax.go.kr/websquare/websquare.html?w2xPath=/ui/ab/a/a/UTEABAAA13.xml',
} as const;
