import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, getAdminUser } from '@/lib/supabase-server';
import { getSiteContent } from '@/lib/content/get';
import { getPublishedPosts } from '@/lib/posts';
import { buildCorpus } from '@/lib/seo/corpus';
import { analyzeAeo, AEO_ENGINE_LABELS, AEO_GRADE_LABELS, type AeoEngine } from '@/lib/seo/aeo';
import { toCsv, contentDisposition, todayInSeoul, formatSeoul } from '@/lib/csv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * AEO 추적 결과 CSV 내보내기.
 *
 *   /api/admin/aeo/export?type=keywords      — 키워드별 진단 (스냅샷)
 *   /api/admin/aeo/export?type=observations  — 관찰 기록 (시계열)
 *
 * 왜 두 개로 나누는가: 성격이 다르다. 진단은 «오늘 기준 어떤 상태인가»라
 * 내보낼 때마다 갱신되는 스냅샷이고, 관찰 기록은 «언제 무엇을 봤는가»라
 * 쌓이는 시계열이다. 한 표에 섞으면 시트에서 둘 다 다루기 어려워진다.
 *
 * 진단 CSV의 첫 칸이 «기준일»인 이유도 같다. 같은 시트에 계속 덧붙이면
 * 날짜별로 점수가 어떻게 움직였는지 피벗으로 볼 수 있다.
 *
 * ⚠️ 이 주소를 구글 시트의 IMPORTDATA로 부를 수는 없다. 관리자 로그인이
 * 필요한데 시트는 쿠키를 보내지 못하고, 인증을 풀면 어떤 키워드를 노리는지가
 * 공개된다. 내려받아 올리는 것이 맞다.
 */

/*
 * 진단 8항목. 머리글에 «진단:» 접두어를 붙인다.
 *
 * 통계 칸에 «질문어적중»(숫자)이 이미 있어서, 접두어가 없으면 판정 칸
 * «질문어 적중»(양호/보통/미흡)과 띄어쓰기 하나로만 구분된다. 시트에서 두 칸이
 * 나란히 보이면 어느 쪽이 무엇인지 알 수 없다.
 */
const CHECK_COLUMNS: { id: string; label: string }[] = [
  { id: 'coverage',        label: '진단:담당 페이지' },
  { id: 'question-match',  label: '진단:질문어 적중' },
  { id: 'direct-answer',   label: '진단:인용 후보 문장' },
  { id: 'answer-position', label: '진단:직답 위치' },
  { id: 'self-contained',  label: '진단:문장 자립성' },
  { id: 'citable-facts',   label: '진단:검증 가능한 수치' },
  { id: 'faq-pair',        label: '진단:Q&A 대응' },
  { id: 'faq-schema',      label: '진단:FAQPage 구조화 데이터' },
];

/** 시트에서 필터·정렬하기 좋게 기호 대신 글자로 낸다. */
const STATUS_TEXT = { good: '양호', warn: '보통', bad: '미흡' } as const;

export async function GET(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get('type') ?? 'keywords';
  if (type !== 'keywords' && type !== 'observations') {
    return NextResponse.json({ error: 'type은 keywords 또는 observations' }, { status: 400 });
  }

  const db = await createServerSupabase();
  const { data: keywords, error } = await db
    .from('aeo_keywords')
    .select('id, keyword, question, target_path, priority, active, note')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const today = todayInSeoul();
  const rows = keywords ?? [];

  const csv =
    type === 'keywords'
      ? await keywordsCsv(rows, today)
      : await observationsCsv(db, rows);

  const filename =
    type === 'keywords'
      ? `우앤주전력-AEO-키워드진단-${today}.csv`
      : `우앤주전력-AEO-관찰기록-${today}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': contentDisposition(filename),
      // 내려받을 때마다 다시 계산한 값이어야 한다
      'Cache-Control': 'no-store',
    },
  });
}

type KeywordRow = {
  id: string;
  keyword: string;
  question: string | null;
  target_path: string | null;
  priority: number | null;
  active: boolean | null;
  note: string | null;
};

async function keywordsCsv(rows: KeywordRow[], today: string): Promise<string> {
  // 진단은 저장된 값이 아니라 지금 사이트 문구로 다시 계산한다 — 화면과 같은 경로.
  const [content, posts] = await Promise.all([getSiteContent(), getPublishedPosts()]);
  const corpus = buildCorpus(content, posts);

  const headers = [
    '기준일', '키워드', '질문', '추적상태', '우선순위',
    '준비도점수', '등급', '담당페이지명', '담당경로',
    '인용후보문장', '문장위치(%)',
    '통계:키워드포함페이지수', '통계:질문어적중', '통계:질문어총수',
    '통계:인용후보수', '통계:FAQ수',
    ...CHECK_COLUMNS.map((c) => c.label),
    '메모',
  ];

  const body = rows.map((row) => {
    const report = analyzeAeo({
      keyword: row.keyword,
      question: row.question ?? '',
      corpus,
      targetPath: row.target_path,
    });
    const byId = new Map(report.checks.map((c) => [c.id, c]));

    return [
      today,
      row.keyword,
      row.question ?? '',
      row.active === false ? '중지' : '추적중',
      row.priority ?? '',
      report.score,
      AEO_GRADE_LABELS[report.grade],
      report.matchedLabel ?? '',
      report.matchedPath ?? '',
      report.bestAnswer ?? '',
      report.bestAnswerPosition === null ? '' : Math.round(report.bestAnswerPosition * 100),
      report.stats.coveringPages,
      report.stats.questionTermHits,
      report.stats.questionTermTotal,
      report.stats.answerCandidates,
      report.stats.faqCount,
      // 주제를 안 다루면 검사가 두 개만 나온다. 없는 항목은 «해당없음»으로 채워
      // 칸이 밀리지 않게 한다.
      ...CHECK_COLUMNS.map((c) => {
        const check = byId.get(c.id);
        return check ? STATUS_TEXT[check.status] : '해당없음';
      }),
      row.note ?? '',
    ];
  });

  return toCsv(headers, body);
}

async function observationsCsv(
  db: Awaited<ReturnType<typeof createServerSupabase>>,
  rows: KeywordRow[],
): Promise<string> {
  const { data } = await db
    .from('aeo_observations')
    .select('keyword_id, engine, observed_at, cited, snippet, note')
    .order('observed_at', { ascending: false });

  const keywordOf = new Map(rows.map((r) => [r.id, r]));

  const headers = ['관찰일시', '키워드', '질문', '답변엔진', '인용여부', '인용된대목', '메모'];

  const body = (data ?? []).map((o) => {
    const k = keywordOf.get(o.keyword_id as string);
    return [
      formatSeoul(o.observed_at as string),
      k?.keyword ?? '(삭제된 키워드)',
      k?.question ?? '',
      AEO_ENGINE_LABELS[o.engine as AeoEngine] ?? (o.engine as string),
      o.cited ? '인용됨' : '안 나옴',
      (o.snippet as string | null) ?? '',
      (o.note as string | null) ?? '',
    ];
  });

  return toCsv(headers, body);
}
