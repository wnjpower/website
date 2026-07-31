/**
 * 유입 경로 판별 — "이 방문자가 어디서 왔나"를 한 단어(channel)로 정리한다.
 *
 * 어드민 대시보드의 모든 광고 성과 리포트가 이 값을 기준으로 묶인다.
 * 클라이언트·미들웨어·API 라우트가 전부 이 파일 하나를 쓰므로,
 * 분류 기준이 화면마다 달라지는 일이 없다.
 */

export const CHANNELS = [
  'naver_ad',
  'naver_organic',
  'naver_place',
  'naver_blog',
  'google_ad',
  'google_organic',
  'meta_ad',
  'kakao',
  'daum',
  'bing',
  'referral',
  'direct',
  'etc',
] as const;

export type Channel = (typeof CHANNELS)[number];

export const CHANNEL_LABELS: Record<Channel, string> = {
  naver_ad:       '네이버 광고',
  naver_organic:  '네이버 검색',
  naver_place:    '네이버 플레이스',
  naver_blog:     '네이버 블로그',
  google_ad:      '구글 광고',
  google_organic: '구글 검색',
  meta_ad:        '메타(인스타·페북) 광고',
  kakao:          '카카오',
  daum:           '다음 검색',
  bing:           '빙 검색',
  referral:       '다른 사이트',
  direct:         '직접 유입',
  etc:            '기타',
};

/** 광고비가 드는 채널 — 성과 리포트에서 따로 묶는다. */
export const PAID_CHANNELS: Channel[] = ['naver_ad', 'google_ad', 'meta_ad'];

export interface Attribution {
  channel: Channel;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  referrerHost: string | null;
  landingPath: string | null;
}

export const EMPTY_ATTRIBUTION: Attribution = {
  channel: 'direct',
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmTerm: null,
  utmContent: null,
  referrerHost: null,
  landingPath: null,
};

function clean(v: string | null | undefined, max = 120): string | null {
  if (!v) return null;
  const trimmed = v.trim().slice(0, max);
  return trimmed.length ? trimmed : null;
}

function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

const PAID_MEDIUMS = ['cpc', 'ppc', 'paid', 'paidsearch', 'cpm', 'display', 'banner', 'ad', 'ads'];

function isPaidMedium(medium: string | null): boolean {
  if (!medium) return false;
  const m = medium.toLowerCase();
  return PAID_MEDIUMS.some((p) => m.includes(p));
}

/**
 * UTM 파라미터와 referrer로 채널을 판정한다.
 *
 * UTM이 있으면 UTM을 우선한다. 광고 클릭은 referrer가 광고 플랫폼의
 * 리다이렉트 도메인으로 찍히거나 아예 비어 오는 경우가 많아서, 광고주가
 * 직접 심은 UTM이 referrer보다 언제나 정확하다.
 */
export function classifyChannel(
  params: URLSearchParams,
  referrer: string | null,
): Channel {
  const source = clean(params.get('utm_source'))?.toLowerCase() ?? null;
  const medium = clean(params.get('utm_medium'))?.toLowerCase() ?? null;
  const paid = isPaidMedium(medium);

  // 광고 플랫폼이 자동으로 붙이는 클릭 식별자 — UTM이 없어도 광고임을 알 수 있다
  if (params.has('gclid') || params.has('gbraid') || params.has('wbraid')) return 'google_ad';
  if (params.has('fbclid')) return 'meta_ad';
  if (params.has('n_ad_group') || params.has('n_query') || params.has('n_rank')) return 'naver_ad';

  if (source) {
    if (source.includes('naver')) {
      if (paid) return 'naver_ad';
      if (source.includes('place')) return 'naver_place';
      if (source.includes('blog')) return 'naver_blog';
      return 'naver_organic';
    }
    if (source.includes('google')) return paid ? 'google_ad' : 'google_organic';
    if (source.includes('facebook') || source.includes('instagram') || source.includes('meta')) {
      return 'meta_ad';
    }
    if (source.includes('kakao')) return 'kakao';
    if (source.includes('daum')) return 'daum';
    if (source.includes('bing')) return 'bing';
    return paid ? 'etc' : 'referral';
  }

  const host = hostOf(referrer);
  if (!host) return 'direct';

  if (host.includes('naver')) {
    if (host.startsWith('m.place.') || host.includes('place.naver')) return 'naver_place';
    if (host.includes('blog.naver')) return 'naver_blog';
    if (host.includes('ad.naver') || host.includes('adcr.naver')) return 'naver_ad';
    return 'naver_organic';
  }
  if (host.includes('google')) return 'google_organic';
  if (host.includes('daum')) return 'daum';
  if (host.includes('bing')) return 'bing';
  if (host.includes('kakao')) return 'kakao';
  if (host.includes('facebook') || host.includes('instagram')) return 'meta_ad';

  return 'referral';
}

/** 랜딩 시점의 유입 정보를 한 덩어리로 만든다. */
export function buildAttribution(
  url: URL,
  referrer: string | null,
): Attribution {
  const p = url.searchParams;
  return {
    channel:      classifyChannel(p, referrer),
    utmSource:    clean(p.get('utm_source'), 80),
    utmMedium:    clean(p.get('utm_medium'), 80),
    utmCampaign:  clean(p.get('utm_campaign')),
    utmTerm:      clean(p.get('utm_term')) ?? clean(p.get('n_query')),
    utmContent:   clean(p.get('utm_content')),
    referrerHost: hostOf(referrer),
    landingPath:  url.pathname.slice(0, 300),
  };
}

/** 쿠키에 담기 위한 최소 직렬화 (쿠키 4KB 제한을 넉넉히 지킨다). */
export function serializeAttribution(a: Attribution): string {
  return JSON.stringify({
    c:  a.channel,
    s:  a.utmSource,
    m:  a.utmMedium,
    cp: a.utmCampaign,
    t:  a.utmTerm,
    ct: a.utmContent,
    r:  a.referrerHost,
    l:  a.landingPath,
  });
}

export function parseAttribution(raw: string | null | undefined): Attribution | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Record<string, string | null>;
    const channel = (CHANNELS as readonly string[]).includes(o.c ?? '')
      ? (o.c as Channel)
      : 'etc';
    return {
      channel,
      utmSource:    o.s  ?? null,
      utmMedium:    o.m  ?? null,
      utmCampaign:  o.cp ?? null,
      utmTerm:      o.t  ?? null,
      utmContent:   o.ct ?? null,
      referrerHost: o.r  ?? null,
      landingPath:  o.l  ?? null,
    };
  } catch {
    return null;
  }
}

/** UA 문자열에서 기기·브라우저·OS를 뽑는다. 대략적인 분류로 충분하다. */
export function parseUserAgent(ua: string): {
  device: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
} {
  const s = ua.toLowerCase();

  const isTablet = /ipad|tablet|(android(?!.*mobile))/.test(s);
  const isMobile = /mobile|iphone|ipod|android|windows phone/.test(s);
  const device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  // 한국은 인앱 브라우저 비중이 크다. 카카오톡/네이버 앱 안에서 열린 트래픽을
  // 따로 볼 수 있어야 "카톡으로 공유한 링크가 실제로 먹히는지"를 판단할 수 있다.
  let browser = 'other';
  if (s.includes('kakaotalk')) browser = 'kakaotalk';
  else if (s.includes('naver(inapp') || s.includes('naver ')) browser = 'naver_app';
  else if (s.includes('instagram')) browser = 'instagram';
  else if (s.includes('fban') || s.includes('fbav')) browser = 'facebook';
  else if (s.includes('line/')) browser = 'line';
  else if (s.includes('samsungbrowser')) browser = 'samsung';
  else if (s.includes('whale')) browser = 'whale';
  else if (s.includes('edg/')) browser = 'edge';
  else if (s.includes('firefox')) browser = 'firefox';
  else if (s.includes('chrome') || s.includes('crios')) browser = 'chrome';
  else if (s.includes('safari')) browser = 'safari';

  let os = 'other';
  if (s.includes('windows')) os = 'windows';
  else if (s.includes('iphone') || s.includes('ipad') || s.includes('ipod')) os = 'ios';
  else if (s.includes('mac os')) os = 'macos';
  else if (s.includes('android')) os = 'android';
  else if (s.includes('linux')) os = 'linux';

  return { device, browser, os };
}
