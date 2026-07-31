/**
 * 한국어 SEO 글쓰기 분석기 (RankMath·Yoast 방식).
 *
 * 브라우저에서 글을 쓰는 동안 실시간으로 돌고, 발행 시 서버에서도 같은 함수로
 * 점수를 계산해 저장한다. 순수 함수라 어디서 호출해도 결과가 같다.
 *
 * [영어권 도구를 그대로 쓰지 않는 이유]
 * Yoast/RankMath의 기준은 영어 단어 수(300 words)와 영어 문장 구조(수동태·
 * 전환어)를 전제로 한다. 한국어는 한 어절에 담기는 정보량이 달라서 단어 수를
 * 그대로 적용하면 충분한 글이 "너무 짧다"고 나온다. 그래서 아래 기준은
 * 글자 수·어절 수로 다시 잡았다.
 *
 *  - 본문 길이: 공백 제외 600자 이상(권장 1,500자 이상)
 *  - 제목 길이: 15~35자 (구글은 픽셀 폭 ~600px, 네이버는 40자 안팎에서 잘림)
 *  - 메타 설명: 70~90자
 *  - 수동태·전환어 검사는 한국어에 신뢰도가 낮아 넣지 않았다.
 */

export type CheckStatus = 'good' | 'warn' | 'bad';

export interface SeoCheck {
  id: string;
  /** 사장님이 읽을 한 줄 결과 */
  label: string;
  status: CheckStatus;
  /** 어떻게 고치면 되는지 */
  hint?: string;
  /** 점수 가중치 */
  weight: number;
}

export interface SeoInput {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  body: string;
  focusKeyword: string;
  coverAlt: string;
}

export interface SeoReport {
  score: number;
  grade: 'good' | 'ok' | 'bad';
  checks: SeoCheck[];
  stats: {
    charCount: number;
    wordCount: number;
    headingCount: number;
    imageCount: number;
    internalLinks: number;
    externalLinks: number;
    keywordCount: number;
    density: number;
  };
}

/** 공백·기호 차이를 무시하고 비교하기 위한 정규화. */
function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '');
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  const h = normalize(haystack);
  const n = normalize(needle);
  if (!n) return 0;

  let count = 0;
  let index = h.indexOf(n);
  while (index !== -1) {
    count++;
    index = h.indexOf(n, index + n.length);
  }
  return count;
}

function includesKeyword(haystack: string, keyword: string): boolean {
  return countOccurrences(haystack, keyword) > 0;
}

/** 마크다운 문법을 걷어낸 순수 본문. 길이·밀도 계산의 기준이 된다. */
export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')          // 코드 블록
    .replace(/`[^`]*`/g, ' ')                  // 인라인 코드
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')     // 이미지
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')   // 링크 → 텍스트만
    .replace(/^#{1,6}\s+/gm, '')               // 제목 기호
    .replace(/^>\s?/gm, '')                    // 인용
    .replace(/^[-*+]\s+/gm, '')                // 목록
    .replace(/^\d+\.\s+/gm, '')                // 번호 목록
    .replace(/[*_~]{1,3}/g, '')                // 강조
    .replace(/\|/g, ' ')                       // 표
    .replace(/^-{3,}$/gm, ' ')                 // 구분선
    .replace(/\s+/g, ' ')
    .trim();
}

interface Extracted {
  headings: string[];
  images: { alt: string; src: string }[];
  links: { href: string; text: string }[];
}

function extract(md: string): Extracted {
  const headings = Array.from(md.matchAll(/^(#{2,6})\s+(.+)$/gm)).map((m) => m[2].trim());

  const images = Array.from(md.matchAll(/!\[([^\]]*)\]\(([^)\s]+)/g)).map((m) => ({
    alt: m[1].trim(),
    src: m[2].trim(),
  }));

  // 이미지 문법(![...]())이 링크로도 잡히지 않도록 앞에 '!'가 없는 것만 센다
  const links = Array.from(md.matchAll(/(^|[^!])\[([^\]]*)\]\(([^)\s]+)/g)).map((m) => ({
    text: m[2].trim(),
    href: m[3].trim(),
  }));

  return { headings, images, links };
}

export function analyzeSeo(input: SeoInput): SeoReport {
  const keyword = input.focusKeyword.trim();
  const effectiveTitle = (input.metaTitle || input.title).trim();
  const plain = stripMarkdown(input.body);
  const { headings, images, links } = extract(input.body);

  const charCount = plain.replace(/\s/g, '').length;
  const wordCount = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  const keywordCount = countOccurrences(plain, keyword);
  const density = wordCount > 0 && keyword ? (keywordCount / wordCount) * 100 : 0;

  const internalLinks = links.filter(
    (l) => l.href.startsWith('/') || l.href.includes('wnjpower.com'),
  ).length;
  const externalLinks = links.filter(
    (l) => /^https?:\/\//.test(l.href) && !l.href.includes('wnjpower.com'),
  ).length;

  // 첫 문단 = 본문 앞 10%(최소 150자). 검색엔진은 도입부를 특히 중요하게 본다.
  const introLength = Math.max(150, Math.floor(plain.length * 0.1));
  const intro = plain.slice(0, introLength);

  const checks: SeoCheck[] = [];

  // ── 포커스 키워드가 없으면 나머지 검사가 의미 없다 ──
  if (!keyword) {
    checks.push({
      id: 'keyword-set',
      label: '핵심 키워드를 정하지 않았습니다',
      status: 'bad',
      hint: '이 글로 검색에 노출되고 싶은 말을 적으세요. 예: "대구 공장 전기공사 비용"',
      weight: 15,
    });
  } else {
    checks.push({ id: 'keyword-set', label: `핵심 키워드: "${keyword}"`, status: 'good', weight: 15 });

    // 1) 제목
    const inTitle = includesKeyword(effectiveTitle, keyword);
    const titleHead = includesKeyword(effectiveTitle.slice(0, Math.ceil(effectiveTitle.length / 2)), keyword);
    checks.push({
      id: 'keyword-title',
      label: inTitle
        ? titleHead ? '제목 앞부분에 키워드가 있습니다' : '제목에 키워드가 있습니다'
        : '제목에 키워드가 없습니다',
      status: inTitle ? (titleHead ? 'good' : 'warn') : 'bad',
      hint: inTitle
        ? titleHead ? undefined : '키워드를 제목 앞쪽으로 옮기면 더 좋습니다.'
        : '검색 결과 제목에 키워드를 넣어주세요.',
      weight: 12,
    });

    // 2) 메타 설명
    const inDesc = includesKeyword(input.metaDescription, keyword);
    checks.push({
      id: 'keyword-desc',
      label: inDesc ? '검색 설명에 키워드가 있습니다' : '검색 설명에 키워드가 없습니다',
      status: inDesc ? 'good' : 'bad',
      hint: inDesc ? undefined : '검색 결과에 보이는 설명문에도 키워드를 자연스럽게 넣으세요.',
      weight: 8,
    });

    // 3) 첫 문단
    const inIntro = includesKeyword(intro, keyword);
    checks.push({
      id: 'keyword-intro',
      label: inIntro ? '첫 문단에 키워드가 있습니다' : '첫 문단에 키워드가 없습니다',
      status: inIntro ? 'good' : 'bad',
      hint: inIntro ? undefined : '글을 시작하는 두세 문장 안에 키워드를 넣어주세요.',
      weight: 9,
    });

    // 4) 소제목
    const inHeading = headings.some((h) => includesKeyword(h, keyword));
    checks.push({
      id: 'keyword-heading',
      label: inHeading ? '소제목에 키워드가 있습니다' : '소제목에 키워드가 없습니다',
      status: inHeading ? 'good' : 'warn',
      hint: inHeading ? undefined : '소제목(## 로 시작하는 줄) 중 하나에 키워드를 넣어보세요.',
      weight: 6,
    });

    // 5) 키워드 밀도
    //    너무 낮으면 주제가 흐릿하고, 너무 높으면 검색엔진이 남용으로 본다.
    const densityOk = density >= 0.4 && density <= 2.5;
    const densityHigh = density > 2.5;
    checks.push({
      id: 'keyword-density',
      label: `키워드가 본문에 ${keywordCount}번 나옵니다 (밀도 ${density.toFixed(1)}%)`,
      status: densityOk ? 'good' : 'warn',
      hint: densityHigh
        ? '너무 자주 반복됩니다. 일부를 다른 표현으로 바꾸세요.'
        : densityOk ? undefined : '본문에서 키워드를 조금 더 언급해 주세요.',
      weight: 7,
    });

    // 6) 주소(slug)
    //    한글 주소는 인코딩되면 읽기 어려워지므로 영문 표기가 권장된다.
    //    그래서 이 항목은 감점 폭을 작게 둔다.
    const slugOk = includesKeyword(input.slug.replace(/-/g, ' '), keyword) || /^[a-z0-9-]+$/.test(input.slug);
    checks.push({
      id: 'slug',
      label: slugOk ? '주소가 올바른 형식입니다' : '주소를 정리해 주세요',
      status: slugOk ? 'good' : 'warn',
      hint: slugOk ? undefined : '영문 소문자·숫자·하이픈만 사용하세요. 예: daegu-factory-electric-cost',
      weight: 4,
    });

    // 7) 이미지 대체텍스트
    const altsWithKeyword =
      images.some((img) => includesKeyword(img.alt, keyword)) ||
      includesKeyword(input.coverAlt, keyword);
    checks.push({
      id: 'image-alt-keyword',
      label: altsWithKeyword ? '사진 설명에 키워드가 있습니다' : '사진 설명에 키워드가 없습니다',
      status: altsWithKeyword ? 'good' : 'warn',
      hint: altsWithKeyword ? undefined : '사진 설명(대체텍스트)에도 키워드를 넣으면 이미지 검색에 잡힙니다.',
      weight: 5,
    });
  }

  // ── 키워드와 무관한 기본 품질 검사 ──

  // 제목 길이
  const titleLen = effectiveTitle.length;
  const titleOk = titleLen >= 15 && titleLen <= 35;
  checks.push({
    id: 'title-length',
    label: `검색 제목 ${titleLen}자`,
    status: titleLen === 0 ? 'bad' : titleOk ? 'good' : 'warn',
    hint:
      titleLen === 0 ? '제목을 입력하세요.'
      : titleLen < 15 ? '너무 짧습니다. 15~35자를 권장합니다.'
      : titleLen > 35 ? '검색 결과에서 뒷부분이 잘릴 수 있습니다. 35자 이내를 권장합니다.'
      : undefined,
    weight: 7,
  });

  // 메타 설명 길이
  const descLen = input.metaDescription.trim().length;
  const descOk = descLen >= 60 && descLen <= 95;
  checks.push({
    id: 'desc-length',
    label: `검색 설명 ${descLen}자`,
    status: descLen === 0 ? 'bad' : descOk ? 'good' : 'warn',
    hint:
      descLen === 0 ? '검색 결과에 보일 설명을 적어주세요. 비워두면 검색엔진이 본문을 임의로 잘라 씁니다.'
      : descLen < 60 ? '조금 더 길게 쓰면 클릭률이 올라갑니다. 70~90자를 권장합니다.'
      : descLen > 95 ? '뒷부분이 잘립니다. 90자 이내로 줄여주세요.'
      : undefined,
    weight: 7,
  });

  // 본문 길이
  const lengthStatus: CheckStatus = charCount >= 1500 ? 'good' : charCount >= 600 ? 'warn' : 'bad';
  checks.push({
    id: 'content-length',
    label: `본문 ${charCount.toLocaleString('ko-KR')}자`,
    status: lengthStatus,
    hint:
      charCount < 600 ? '너무 짧습니다. 최소 600자, 검색 상위 노출을 노린다면 1,500자 이상을 권장합니다.'
      : charCount < 1500 ? '1,500자 이상이면 검색에서 더 유리합니다.'
      : undefined,
    weight: 10,
  });

  // 소제목
  const headingStatus: CheckStatus =
    headings.length >= 2 ? 'good' : headings.length === 1 ? 'warn' : charCount < 600 ? 'warn' : 'bad';
  checks.push({
    id: 'headings',
    label: `소제목 ${headings.length}개`,
    status: headingStatus,
    hint: headings.length >= 2 ? undefined : '## 로 시작하는 소제목을 2개 이상 넣어 글을 나눠주세요.',
    weight: 6,
  });

  // 이미지
  const totalImages = images.length + (input.coverAlt ? 1 : 0);
  checks.push({
    id: 'images',
    label: totalImages > 0 ? `이미지 ${totalImages}개` : '이미지가 없습니다',
    status: totalImages > 0 ? 'good' : 'warn',
    hint: totalImages > 0 ? undefined : '시공 사진을 넣으면 체류 시간과 신뢰도가 함께 올라갑니다.',
    weight: 5,
  });

  // 모든 이미지에 alt
  const missingAlt = images.filter((img) => !img.alt).length;
  if (images.length > 0) {
    checks.push({
      id: 'image-alt',
      label: missingAlt === 0 ? '모든 사진에 설명이 있습니다' : `사진 ${missingAlt}개에 설명이 없습니다`,
      status: missingAlt === 0 ? 'good' : 'bad',
      hint: missingAlt === 0 ? undefined : '![사진 설명](주소) 형태로 대괄호 안에 설명을 넣어주세요.',
      weight: 5,
    });
  }

  // 내부 링크
  checks.push({
    id: 'internal-links',
    label: internalLinks > 0 ? `내부 링크 ${internalLinks}개` : '내부 링크가 없습니다',
    status: internalLinks > 0 ? 'good' : 'warn',
    hint: internalLinks > 0 ? undefined : '사업영역이나 시공실적 페이지로 연결하면 사이트 전체 평가가 올라갑니다.',
    weight: 6,
  });

  // 외부 링크
  checks.push({
    id: 'external-links',
    label: externalLinks > 0 ? `외부 링크 ${externalLinks}개` : '외부 링크가 없습니다',
    status: externalLinks > 0 ? 'good' : 'warn',
    hint: externalLinks > 0 ? undefined : '한국전력·전기공사협회 같은 공신력 있는 출처를 링크하면 신뢰도가 올라갑니다.',
    weight: 3,
  });

  // 문장 길이 — 읽기 쉬움
  const sentences = plain.split(/[.!?。]\s*/).filter((s) => s.trim().length > 0);
  const avgSentence = sentences.length > 0 ? charCount / sentences.length : 0;
  checks.push({
    id: 'readability',
    label: `문장 평균 ${Math.round(avgSentence)}자`,
    status: avgSentence === 0 ? 'warn' : avgSentence <= 80 ? 'good' : 'warn',
    hint: avgSentence > 80 ? '문장이 깁니다. 한 문장에 한 가지만 말하도록 나눠보세요.' : undefined,
    weight: 4,
  });

  // ── 점수 ──
  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.reduce(
    (sum, c) => sum + c.weight * (c.status === 'good' ? 1 : c.status === 'warn' ? 0.5 : 0),
    0,
  );
  const score = totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0;

  return {
    score,
    grade: score >= 80 ? 'good' : score >= 50 ? 'ok' : 'bad',
    checks,
    stats: {
      charCount,
      wordCount,
      headingCount: headings.length,
      imageCount: totalImages,
      internalLinks,
      externalLinks,
      keywordCount,
      density,
    },
  };
}

export const GRADE_LABELS: Record<SeoReport['grade'], string> = {
  good: '좋음',
  ok: '보통',
  bad: '개선 필요',
};
