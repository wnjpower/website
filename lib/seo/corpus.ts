import type { SiteContent } from '@/lib/content/schema';
import { servicePages } from '@/content/service-pages';
import { portfolioItems } from '@/content/portfolio';
import { postPath, type Post } from '@/lib/posts';
import { stripMarkdown } from '@/lib/seo/analyze';
import { COMPANY } from '@/lib/site';

/**
 * 사이트 텍스트 코퍼스.
 *
 * AEO 진단은 «이 키워드로 물었을 때 우리 사이트의 어느 문장이 인용될 수 있는가»를
 * 따진다. 그러려면 페이지별 본문이 문장 단위로 필요하다. 이 파일은 흩어져 있는
 * 콘텐츠 소스(어드민 편집 콘텐츠·서비스 상세·실적·게시글)를 한 형태로 모은다.
 *
 * 실제 렌더된 HTML을 긁지 않는 이유:
 *   · 자기 사이트를 크롤링하려면 배포본에 HTTP 요청을 보내야 하는데, 어드민에서
 *     진단을 누를 때마다 그러면 느리고 미리보기(초안) 상태를 볼 수 없다
 *   · 여기 소스가 곧 렌더의 입력이므로 텍스트는 같다
 *
 * 한계도 분명히 해 둔다. 이 코퍼스는 **글자**를 본다. 실제 답변엔진은 페이지를
 * 렌더해 보이는 텍스트를 읽으므로, 접혀 있는 아코디언·이미지 안의 글자는 여기서
 * 잡히지만 저쪽에서는 불리할 수 있다.
 */

export interface CorpusPage {
  /** 사이트 경로 — 진단 결과에서 «어느 페이지가 담당하는가»로 쓴다 */
  path: string;
  /** 사장님이 읽을 페이지 이름 */
  label: string;
  /** 검색 결과에 나오는 제목 (metaTitle 우선, 없으면 h1) */
  title: string;
  /** 페이지를 여는 정의문 후보 — 답변엔진이 가장 먼저 보는 문장 */
  lead: string;
  /** 본문 전체 텍스트 (마크다운 기호 제거됨) */
  text: string;
  /** 화면에 노출된 질문·답변 쌍 */
  faqs: { question: string; answer: string }[];
  /** 이 경로가 FAQPage 구조화 데이터를 내보내는가 */
  hasFaqSchema: boolean;
  /** 콘텐츠가 스스로 선언한 대상 키워드 (있는 경우) */
  declaredKeywords: string[];
}

/**
 * FAQPage 구조화 데이터를 실제로 렌더하는 경로.
 *
 * ⚠️ 코드와 어긋나기 쉬운 값이다. 바꿀 때는 아래 두 파일을 함께 본다.
 *   · app/page.tsx      — <FaqSchema items={content.faq.items} />
 *   · app/faq/page.tsx  — <FaqSchema items={content.faq.items} />
 *
 * 서비스 상세(/services/*)는 고유한 FAQ를 갖고 있으면서도 구조화 데이터를 내지
 * 않는다. 진단이 이 점을 짚어낼 것이다.
 */
const FAQ_SCHEMA_PATHS = new Set(['/', '/faq']);

/** 여러 조각을 한 덩어리 본문으로 잇는다. 문장 경계를 살려 마침표로 잇는다. */
function join(...parts: (string | string[] | undefined | null)[]): string {
  const flat: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    if (Array.isArray(p)) flat.push(...p.filter(Boolean));
    else flat.push(p);
  }
  return flat
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (/[.!?。]$/.test(s) ? s : `${s}.`))
    .join(' ');
}

/** 홈 — 어드민에서 편집한 발행본 기준. */
function homePage(c: SiteContent): CorpusPage {
  return {
    path: '/',
    label: '홈',
    title: c.seo.title,
    lead: c.hero.lead,
    text: join(
      c.hero.eyebrow,
      c.hero.title.replace(/\n/g, ' '),
      c.hero.lead,
      c.hero.note,
      c.hero.trustStats.map((s) => `${s.label} ${s.sub}`),
      c.services.title,
      c.services.lead,
      c.services.items.map((s) => join(s.title, s.detail, s.points, s.audiences.join(', '))),
      c.whyus.title,
      c.whyus.lead,
      c.whyus.corpNote,
      c.whyus.industry,
      c.process.title,
      c.process.lead,
      c.process.steps.map((s) => join(s.title, s.duration, s.description)),
      c.pricing.title,
      c.pricing.lead,
      c.pricing.promise,
      c.pricing.footnote,
      c.pricing.variables.map((v) => join(v.title, v.note)),
      c.pricing.items.map((i) => join(i.work, i.audience, i.priceLabel)),
      c.quote.title,
      c.quote.lead,
      c.contact.hours,
      c.contact.hoursNote,
      c.contact.serviceArea,
      c.faq.items.map((f) => join(f.question, f.answer)),
    ),
    faqs: c.faq.items.map((f) => ({ question: f.question, answer: f.answer })),
    hasFaqSchema: FAQ_SCHEMA_PATHS.has('/'),
    declaredKeywords: [...c.seo.keywords],
  };
}

function faqPage(c: SiteContent): CorpusPage {
  return {
    path: '/faq',
    label: '자주 묻는 질문',
    title: c.faq.title,
    lead: c.faq.lead || c.faq.items[0]?.answer || '',
    text: join(c.faq.title, c.faq.lead, c.faq.items.map((f) => join(f.question, f.answer))),
    faqs: c.faq.items.map((f) => ({ question: f.question, answer: f.answer })),
    hasFaqSchema: FAQ_SCHEMA_PATHS.has('/faq'),
    declaredKeywords: [],
  };
}

function servicePagesCorpus(): CorpusPage[] {
  return servicePages.map((p) => ({
    path: `/services/${p.slug}`,
    label: `서비스 — ${p.tab}`,
    title: p.metaTitle,
    lead: p.lead,
    text: join(
      p.h1,
      p.lead,
      p.metaDescription,
      p.scope.map((s) => join(s.title, s.body)),
      p.process.map((s) => join(s.title, s.body)),
      p.considerations.map((s) => join(s.title, s.body)),
      p.faqs.map((f) => join(f.question, f.answer)),
      p.ctaTitle,
    ),
    faqs: p.faqs,
    hasFaqSchema: FAQ_SCHEMA_PATHS.has(`/services/${p.slug}`),
    declaredKeywords: [...p.keywords],
  }));
}

function portfolioCorpus(): CorpusPage[] {
  return portfolioItems.map((item) => ({
    path: `/portfolio/${item.slug}`,
    label: `실적 — ${item.title}`,
    title: item.title,
    lead: item.summary,
    text: join(
      item.title,
      `${item.location} ${item.region} ${item.facility}`,
      item.categoryLabel,
      item.summary,
      item.challenge,
      item.scopeItems,
      item.work,
      item.specs?.contractPower,
      item.specs?.duration,
      item.specs?.area,
    ),
    faqs: [],
    hasFaqSchema: false,
    declaredKeywords: [],
  }));
}

function aboutPage(c: SiteContent): CorpusPage {
  return {
    path: '/about',
    label: '회사소개',
    title: `회사소개 | ${COMPANY.name}`,
    lead: c.whyus.lead,
    text: join(
      COMPANY.name,
      c.whyus.title,
      c.whyus.lead,
      c.whyus.corpNote,
      c.whyus.industry,
      c.process.title,
      c.process.steps.map((s) => join(s.title, s.duration, s.description)),
    ),
    faqs: [],
    hasFaqSchema: false,
    declaredKeywords: [],
  };
}

function postsCorpus(posts: Post[]): CorpusPage[] {
  return posts
    .filter((p) => !p.noindex && p.status === 'published')
    .map((p) => {
      const plain = stripMarkdown(p.body);
      return {
        path: postPath(p.type, p.slug),
        label: `게시글 — ${p.title}`,
        title: p.metaTitle || p.title,
        lead: p.excerpt || plain.slice(0, 200),
        text: join(p.title, p.excerpt, plain),
        faqs: [],
        hasFaqSchema: false,
        declaredKeywords: p.focusKeyword ? [p.focusKeyword] : [],
      };
    });
}

/**
 * 진단 대상 전체 코퍼스.
 *
 * `/portfolio`(목록)와 `/privacy` 같은 페이지는 넣지 않는다. 목록 페이지는 고유
 * 본문이 거의 없어 어떤 키워드의 «담당 페이지»가 될 수 없고, 방침 페이지는
 * 검색 유입 대상이 아니다.
 */
export function buildCorpus(content: SiteContent, posts: Post[]): CorpusPage[] {
  return [
    homePage(content),
    ...servicePagesCorpus(),
    faqPage(content),
    aboutPage(content),
    ...portfolioCorpus(),
    ...postsCorpus(posts),
  ];
}
