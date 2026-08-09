import type { CheckStatus, SeoCheck } from '@/lib/seo/analyze';
import type { CorpusPage } from '@/lib/seo/corpus';
import { COMPANY, SERVICE_AREAS } from '@/lib/site';

/**
 * AEO(답변엔진 최적화) 진단.
 *
 * [SEO와 무엇이 다른가]
 * SEO는 «검색 결과 목록에서 몇 번째로 나오는가»를 다룬다. AEO는 ChatGPT·
 * Perplexity·구글 AI 개요·네이버 큐: 같은 답변엔진이 **답을 만들 때 우리 문장을
 * 인용하는가**를 다룬다. 목록에 오르는 것과 인용되는 것은 조건이 다르다.
 *
 * 답변엔진은 페이지 전체를 요약하지 않는다. **문장 단위로 뽑아 쓴다.** 그래서
 * 「좋은 글」이 아니라 「뽑아 쓰기 좋은 문장이 있는 글」이 인용된다. 이 진단은
 * 그 조건을 아홉 가지로 나눠 본다.
 *
 * [무엇을 판정할 수 없는가 — 중요]
 * **실제로 인용됐는지는 코드가 알 수 없다.** 답변엔진은 순위·인용 조회 API를
 * 제공하지 않고, 같은 질문에도 답이 매번 달라진다. 그래서 이 파일은 «인용될
 * 준비가 됐는가»까지만 판정하고, 실제 인용 여부는 사람이 물어보고 기록한다
 * (어드민 → AEO 추적의 «관찰 기록»).
 *
 * 즉 이 점수는 **결과 지표가 아니라 선행 지표**다. 점수가 높다고 인용이
 * 보장되지 않지만, 점수가 낮으면 인용될 수 없다.
 */

export interface AeoInput {
  /** 노리는 키워드. 예: `계약전력 증설 비용` */
  keyword: string;
  /** 사람이 답변엔진에 실제로 던지는 질문 문장. 비우면 키워드로 대체한다 */
  question: string;
  corpus: CorpusPage[];
  /** 담당 페이지를 지정했다면 그 경로. 비우면 코퍼스에서 가장 잘 맞는 페이지를 고른다 */
  targetPath?: string | null;
}

export interface AeoReport {
  score: number;
  grade: 'good' | 'ok' | 'bad';
  checks: SeoCheck[];
  /** 이 키워드를 담당한다고 판정된 페이지 */
  matchedPath: string | null;
  matchedLabel: string | null;
  /** 인용될 가능성이 가장 높다고 본 문장 */
  bestAnswer: string | null;
  /** 그 문장이 본문에서 차지하는 위치(0~1). 작을수록 앞쪽 */
  bestAnswerPosition: number | null;
  stats: {
    /** 키워드를 언급하는 페이지 수 — 여러 곳에 흩어지면 담당이 모호해진다 */
    coveringPages: number;
    /** 담당 페이지 안에서 질문의 핵심어가 몇 개나 등장하는가 */
    questionTermHits: number;
    questionTermTotal: number;
    /** 인용 후보 문장 수 */
    answerCandidates: number;
    /** 담당 페이지의 질문·답변 쌍 수 */
    faqCount: number;
  };
}

// ── 텍스트 유틸 ──────────────────────────────────────────────

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '');
}

function includes(haystack: string, needle: string): boolean {
  if (!needle) return false;
  return normalize(haystack).includes(normalize(needle));
}

/**
 * 한국어 문장 분리.
 *
 * 「~다.」「~요.」로 끝나는 종결과 물음표·느낌표를 경계로 본다. 소수점(3.5kW)과
 * 번호(637-81-02833)에서 잘리지 않도록 마침표 뒤에 공백이나 끝이 와야 경계로
 * 인정한다.
 */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?。])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * 질문에서 검색에 쓸 핵심어를 뽑는다.
 *
 * 형태소 분석기를 쓰지 않는다 — 의존성이 커지고 무료 tier 밖이다. 대신
 * 조사·의문사·군더더기를 걷어내는 것으로 충분하다. 어차피 «질문의 낱말이
 * 페이지에 있는가»만 보면 되기 때문이다.
 */
const STOP_WORDS = new Set([
  // 의문사·지시어
  '무엇', '뭐', '어떻게', '어디', '언제', '얼마', '왜', '어느', '누가', '몇',
  '수', '것', '거', '좀', '들', '및', '등', '그리고', '또는', '의',
  // 서술 어간 — 어느 업체 페이지에나 있어 변별력이 없다
  '하는', '하다', '합니다', '입니다', '이다', '잘하', '좋', '좋은', '괜찮',
  '추천', '유명', '필요', '가능', '저렴', '빠르', '알려', '궁금', '진행',
]);

/** 문장 끝에 붙는 의문 어미. 「증설하나요」 → 「증설」 로 되돌린다. */
const QUESTION_ENDING =
  /(인가요|인가|하나요|한가요|되나요|드나요|있나요|없나요|할까요|일까요|시나요|나요|가요|까요|습니까|합니까|해요|되요|돼요)$/;

/** 체언 뒤 조사. 「전기공사를」 → 「전기공사」 */
const PARTICLE = /(은|는|이|가|을|를|에|에서|으로|로|와|과|도|만|의|께|한테|에게)$/;

export function questionTerms(question: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const raw of question.replace(/[?!.,·—–\-()[\]{}"'`]/g, ' ').split(/\s+/)) {
    let w = raw.trim();
    if (!w) continue;

    // 의문 어미를 먼저 떼고, 남은 것에서 조사를 뗀다. 순서를 바꾸면
    // 「증설하나요」의 «요»만 떨어져 「증설하나」라는 쓰레기 낱말이 남는다.
    w = w.replace(QUESTION_ENDING, '');
    w = w.replace(PARTICLE, '');
    w = w.trim();

    if (w.length < 2) continue;
    if (STOP_WORDS.has(w)) continue;
    if (seen.has(w)) continue;
    seen.add(w);
    out.push(w);
  }
  return out;
}

/** 인용 가치가 있는 «검증 가능한 수치»를 담고 있는가. */
function hasCitableFact(sentence: string): boolean {
  return (
    /\d/.test(sentence) &&
    /(kW|kw|㎾|V|㎡|m²|미터|m\b|년|개월|일|원|만원|%|호|번|건|면|회로|등록번호|[0-9]{2,3}-[0-9]{2}-[0-9]{5})/.test(
      sentence,
    )
  );
}

/**
 * 문장이 홀로 떼어놔도 뜻이 통하는가.
 *
 * 답변엔진은 문장을 문맥에서 **뽑아내** 쓴다. 「저희는 직접 시공합니다」는
 * 페이지 안에서는 읽히지만 뽑아 놓으면 «누가»가 사라져 인용되지 않는다.
 * 주체(상호)나 장소가 문장 안에 있어야 한다.
 */
const PRONOUN_START = /^(저희|우리|이|그|저|해당|본사|당사)\b/;

function isSelfContained(sentence: string): boolean {
  if (PRONOUN_START.test(sentence.trim())) return false;
  const entities = [
    COMPANY.name,
    '우앤주전력',
    COMPANY.brand,
    SERVICE_AREAS.primary,
    '대구',
    '경북',
    '경상북도',
  ];
  return entities.some((e) => includes(sentence, e));
}

/** 서술로 끝나는 완결 문장인가 (제목·목록 조각 배제). */
function isStatement(sentence: string): boolean {
  return /(다|요)[.!]?$/.test(sentence.trim());
}

// ── 진단 ────────────────────────────────────────────────────

/** 인용 후보 문장 — 길이·완결성·키워드 적중을 모두 만족하는 문장. */
interface AnswerCandidate {
  sentence: string;
  /** 본문에서의 상대 위치 0~1 */
  position: number;
  score: number;
  selfContained: boolean;
  citableFact: boolean;
}

/**
 * 인용에 알맞은 문장 길이.
 *
 * 너무 짧으면 답이 되지 않고(제목 조각), 너무 길면 답변엔진이 잘라 쓰면서
 * 뜻이 어긋난다. 한국어 기준 30~160자를 적정 구간으로 본다.
 */
const MIN_ANSWER_LEN = 30;
const MAX_ANSWER_LEN = 160;

function findAnswerCandidates(page: CorpusPage, keyword: string, terms: string[]): AnswerCandidate[] {
  const sentences = splitSentences(page.text);
  const total = sentences.length || 1;
  const out: AnswerCandidate[] = [];

  sentences.forEach((sentence, i) => {
    const len = sentence.replace(/\s/g, '').length;
    if (len < MIN_ANSWER_LEN || len > MAX_ANSWER_LEN) return;
    if (!isStatement(sentence)) return;

    const hitsKeyword = includes(sentence, keyword);
    const termHits = terms.filter((t) => includes(sentence, t)).length;

    // 질문어 하나만 스쳐도 후보로 잡으면, 「대구」 한 낱말 때문에 주제와 무관한
    // 문장이 인용 후보가 된다. 키워드가 통째로 들어 있거나 질문어 둘 이상이
    // 겹쳐야 «그 질문에 답하는 문장»으로 본다.
    if (!hitsKeyword && termHits < 2) return;

    const selfContained = isSelfContained(sentence);
    const citableFact = hasCitableFact(sentence);
    const position = i / total;

    // 키워드 직중 > 질문어 적중 > 앞쪽 위치 > 자립성 > 수치
    const score =
      (hitsKeyword ? 40 : 0) +
      Math.min(30, termHits * 10) +
      (1 - position) * 15 +
      (selfContained ? 10 : 0) +
      (citableFact ? 5 : 0);

    out.push({ sentence, position, score, selfContained, citableFact });
  });

  return out.sort((a, b) => b.score - a.score);
}

/** 키워드·질문어를 얼마나 담고 있는지로 페이지를 채점한다. */
function pageRelevance(page: CorpusPage, keyword: string, terms: string[]): number {
  let score = 0;
  if (includes(page.title, keyword)) score += 30;
  if (includes(page.lead, keyword)) score += 20;
  if (includes(page.text, keyword)) score += 20;
  if (page.declaredKeywords.some((k) => includes(k, keyword) || includes(keyword, k))) score += 25;
  score += terms.filter((t) => includes(page.text, t)).length * 4;
  return score;
}

export function analyzeAeo(input: AeoInput): AeoReport {
  const keyword = input.keyword.trim();
  const question = input.question.trim() || keyword;
  const terms = questionTerms(question);
  const checks: SeoCheck[] = [];

  const empty: AeoReport['stats'] = {
    coveringPages: 0,
    questionTermHits: 0,
    questionTermTotal: terms.length,
    answerCandidates: 0,
    faqCount: 0,
  };

  if (!keyword) {
    return {
      score: 0,
      grade: 'bad',
      checks: [
        {
          id: 'keyword-set',
          label: '추적할 키워드를 입력하지 않았습니다',
          status: 'bad',
          hint: '답변엔진에 물을 법한 말을 적으세요. 예: "대구 공장 전기공사 비용"',
          weight: 100,
        },
      ],
      matchedPath: null,
      matchedLabel: null,
      bestAnswer: null,
      bestAnswerPosition: null,
      stats: empty,
    };
  }

  // ── 1) 담당 페이지 ────────────────────────────────────────
  const covering = input.corpus.filter((p) => includes(p.text, keyword));
  const ranked = [...input.corpus].sort(
    (a, b) => pageRelevance(b, keyword, terms) - pageRelevance(a, keyword, terms),
  );
  const pinned = input.targetPath
    ? input.corpus.find((p) => p.path === input.targetPath)
    : undefined;
  const page = pinned ?? (pageRelevance(ranked[0], keyword, terms) > 0 ? ranked[0] : undefined);

  if (!page) {
    return {
      score: 0,
      grade: 'bad',
      checks: [
        {
          id: 'coverage',
          label: '이 키워드를 다루는 페이지가 없습니다',
          status: 'bad',
          hint:
            '답변엔진은 없는 내용을 인용할 수 없습니다. 이 주제를 다루는 페이지나 게시글을 먼저 만드세요.',
          weight: 100,
        },
      ],
      matchedPath: null,
      matchedLabel: null,
      bestAnswer: null,
      bestAnswerPosition: null,
      stats: { ...empty, coveringPages: 0 },
    };
  }

  const hitTerms = terms.filter((t) => includes(page.text, t));
  const hitRatio = terms.length > 0 ? hitTerms.length / terms.length : 1;
  const missing = terms.filter((t) => !includes(page.text, t));

  /*
   * 주제를 다루지 않으면 여기서 끝낸다 — 이하의 검사는 «페이지»의 품질이지
   * «이 키워드»의 준비도가 아니기 때문이다.
   *
   * 이 분기가 없으면 사이트에 한 줄도 없는 주제(예: 태양광)가 80점을 받는다.
   * 가장 가까운 페이지가 잘 쓰인 페이지라는 이유만으로 인용 후보·자립성·FAQ
   * 스키마 점수를 전부 가져가기 때문이다. 정작 그 페이지는 그 질문에 답하지
   * 않으므로 답변엔진은 절대 인용하지 않는다.
   */
  const coversTopic = covering.length > 0 || hitRatio >= 0.6;
  if (!coversTopic) {
    const gap: SeoCheck[] = [
      {
        id: 'coverage',
        label: '사이트가 이 주제를 다루지 않습니다',
        status: 'bad',
        hint: `답변엔진은 없는 내용을 인용할 수 없습니다. 가장 가까운 페이지는 «${page.label}»이지만 이 질문에 답하고 있지 않습니다.`,
        weight: 60,
      },
      {
        id: 'question-match',
        label:
          missing.length > 0
            ? `본문에 없는 핵심어 — ${missing.slice(0, 6).join(', ')}`
            : '질문과 겹치는 낱말이 부족합니다',
        status: 'bad',
        hint:
          '이 주제를 실제로 하신다면 전용 페이지나 게시글을 만드세요. 하지 않는 일이라면 추적 목록에서 빼는 편이 낫습니다 — 없는 서비스로 유입돼도 전환되지 않습니다.',
        weight: 40,
      },
    ];
    return {
      score: gradeScore(gap),
      grade: 'bad',
      checks: gap,
      matchedPath: null,
      matchedLabel: null,
      bestAnswer: null,
      bestAnswerPosition: null,
      stats: {
        coveringPages: 0,
        questionTermHits: hitTerms.length,
        questionTermTotal: terms.length,
        answerCandidates: 0,
        faqCount: 0,
      },
    };
  }

  checks.push({
    id: 'coverage',
    label: `담당 페이지 — ${page.label}`,
    status: covering.length === 0 ? 'warn' : 'good',
    hint:
      covering.length === 0
        ? '이 페이지가 주제는 다루지만 키워드가 그대로 나오지는 않습니다. 본문에 자연스럽게 넣어보세요.'
        : covering.length > 3
          ? `${covering.length}개 페이지가 같은 키워드를 다룹니다. 담당 페이지를 지정하면 관련성이 한 곳에 모입니다.`
          : undefined,
    weight: 12,
  });

  // ── 2) 질문어 적중 ───────────────────────────────────────
  checks.push({
    id: 'question-match',
    label:
      terms.length === 0
        ? '질문 문장을 적으면 더 정확히 진단합니다'
        : `질문의 핵심어 ${hitTerms.length}/${terms.length}개가 본문에 있습니다`,
    status: hitRatio >= 0.8 ? 'good' : hitRatio >= 0.5 ? 'warn' : 'bad',
    hint:
      missing.length > 0
        ? `본문에 없는 말: ${missing.slice(0, 5).join(', ')} — 답변엔진은 질문과 같은 낱말이 있는 문서를 먼저 찾습니다.`
        : undefined,
    weight: 14,
  });

  // ── 3) 인용 가능한 직답 문장 ─────────────────────────────
  const candidates = findAnswerCandidates(page, keyword, terms);
  const best = candidates[0] ?? null;
  checks.push({
    id: 'direct-answer',
    label: best
      ? `인용 후보 문장 ${candidates.length}개를 찾았습니다`
      : '뽑아 쓸 만한 문장이 없습니다',
    status: candidates.length >= 3 ? 'good' : candidates.length >= 1 ? 'warn' : 'bad',
    hint: best
      ? undefined
      : `답변엔진은 문장 하나를 뽑아 씁니다. ${MIN_ANSWER_LEN}~${MAX_ANSWER_LEN}자 사이에서 키워드를 포함하고 «~합니다»로 끝나는 문장을 본문에 넣으세요.`,
    weight: 20,
  });

  // ── 4) 직답의 위치 ───────────────────────────────────────
  if (best) {
    const early = best.position <= 0.35;
    checks.push({
      id: 'answer-position',
      label: early
        ? '직답이 페이지 앞쪽에 있습니다'
        : '직답이 페이지 뒤쪽에 묻혀 있습니다',
      status: early ? 'good' : 'warn',
      hint: early
        ? undefined
        : '답변엔진은 앞부분을 더 무겁게 봅니다. 결론 문장을 도입부로 올리고 설명을 뒤에 두세요.',
      weight: 10,
    });
  }

  // ── 5) 문장 자립성 ───────────────────────────────────────
  if (best) {
    checks.push({
      id: 'self-contained',
      label: best.selfContained
        ? '직답 문장이 홀로 떼어놔도 뜻이 통합니다'
        : '직답 문장에 «누가·어디서»가 없습니다',
      status: best.selfContained ? 'good' : 'bad',
      hint: best.selfContained
        ? undefined
        : '「저희는 …합니다」처럼 시작하면 문맥에서 뽑았을 때 주체가 사라져 인용되지 않습니다. 「주식회사 우앤주전력은 …」 또는 「대구·경북에서 …」로 시작하세요.',
      weight: 14,
    });
  }

  // ── 6) 검증 가능한 수치 ──────────────────────────────────
  const factful = candidates.filter((c) => c.citableFact).length;
  checks.push({
    id: 'citable-facts',
    label:
      factful > 0
        ? `수치가 들어간 인용 후보가 ${factful}개 있습니다`
        : '인용 후보에 구체적인 수치가 없습니다',
    status: factful >= 2 ? 'good' : factful === 1 ? 'warn' : 'bad',
    hint:
      factful >= 2
        ? undefined
        : '답변엔진은 「빠릅니다」보다 「1영업일 내 회신합니다」를 인용합니다. 기간·용량(kW)·거리·등록번호처럼 확인 가능한 값을 넣으세요.',
    weight: 12,
  });

  // ── 7) 질문·답변 쌍 ──────────────────────────────────────
  const relatedFaq = page.faqs.filter(
    (f) => includes(f.question, keyword) || terms.some((t) => includes(f.question, t)),
  );
  checks.push({
    id: 'faq-pair',
    label:
      relatedFaq.length > 0
        ? `이 질문에 대응하는 Q&A가 ${relatedFaq.length}개 있습니다`
        : page.faqs.length > 0
          ? '이 질문에 대응하는 Q&A가 없습니다'
          : '이 페이지에는 Q&A가 없습니다',
    status: relatedFaq.length > 0 ? 'good' : 'warn',
    hint:
      relatedFaq.length > 0
        ? undefined
        : '사람이 묻는 문장 그대로를 질문으로 쓰고 바로 아래 답을 두면 인용 확률이 크게 올라갑니다.',
    weight: 10,
  });

  // ── 8) FAQPage 구조화 데이터 ─────────────────────────────
  checks.push({
    id: 'faq-schema',
    label: page.hasFaqSchema
      ? '이 페이지는 FAQPage 구조화 데이터를 내보냅니다'
      : page.faqs.length > 0
        ? 'Q&A가 있는데 구조화 데이터로 내보내지 않습니다'
        : '구조화 데이터로 낼 Q&A가 없습니다',
    status: page.hasFaqSchema ? 'good' : page.faqs.length > 0 ? 'bad' : 'warn',
    hint: page.hasFaqSchema
      ? undefined
      : page.faqs.length > 0
        ? '화면에는 Q&A가 있는데 기계가 읽을 형태로는 없습니다. 이 페이지에 FaqSchema를 붙이면 답변엔진이 질문·답 쌍을 그대로 가져갑니다.'
        : undefined,
    weight: 8,
  });

  return {
    score: gradeScore(checks),
    grade: toGrade(gradeScore(checks)),
    checks,
    matchedPath: page.path,
    matchedLabel: page.label,
    bestAnswer: best?.sentence ?? null,
    bestAnswerPosition: best?.position ?? null,
    stats: {
      coveringPages: covering.length,
      questionTermHits: hitTerms.length,
      questionTermTotal: terms.length,
      answerCandidates: candidates.length,
      faqCount: page.faqs.length,
    },
  };
}

/** 가중 평균 — good 1.0, warn 0.5, bad 0. analyze.ts와 같은 방식이다. */
function gradeScore(checks: SeoCheck[]): number {
  const total = checks.reduce((sum, c) => sum + c.weight, 0);
  if (total === 0) return 0;
  const got = checks.reduce((sum, c) => sum + c.weight * statusValue(c.status), 0);
  return Math.round((got / total) * 100);
}

function statusValue(status: CheckStatus): number {
  return status === 'good' ? 1 : status === 'warn' ? 0.5 : 0;
}

function toGrade(score: number): AeoReport['grade'] {
  if (score >= 75) return 'good';
  if (score >= 45) return 'ok';
  return 'bad';
}

export const AEO_GRADE_LABELS: Record<AeoReport['grade'], string> = {
  good: '인용될 준비가 됐습니다',
  ok: '부분적으로 준비됐습니다',
  bad: '지금은 인용되기 어렵습니다',
};

/** 관찰 기록에 쓰는 답변엔진 목록. */
export const AEO_ENGINES = [
  'chatgpt',
  'perplexity',
  'google_ai',
  'naver_cue',
  'copilot',
  'gemini',
] as const;

export type AeoEngine = (typeof AEO_ENGINES)[number];

export const AEO_ENGINE_LABELS: Record<AeoEngine, string> = {
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  google_ai: '구글 AI 개요',
  naver_cue: '네이버 큐:',
  copilot: 'MS Copilot',
  gemini: 'Gemini',
};
