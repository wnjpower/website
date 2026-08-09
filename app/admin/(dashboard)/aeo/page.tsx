import PageHeader from '@/components/admin/PageHeader';
import AeoManager, {
  type AeoKeywordRow,
  type AeoObservationRow,
  type AeoDiagnosis,
} from '@/components/admin/AeoManager';
import { createServerSupabase } from '@/lib/supabase-server';
import { getSiteContent } from '@/lib/content/get';
import { getPublishedPosts } from '@/lib/posts';
import { buildCorpus } from '@/lib/seo/corpus';
import { analyzeAeo } from '@/lib/seo/aeo';

/**
 * AEO 추적.
 *
 * 진단 점수는 **저장하지 않고 이 페이지를 열 때마다 다시 계산한다.** 사이트 문구를
 * 고치면 준비도가 바로 달라져야 하기 때문이다. 저장해 두면 «어제 고쳤는데 점수가
 * 그대로»가 되어 도구를 못 믿게 된다.
 *
 * 반대로 관찰 기록(그날 ChatGPT가 우리를 인용했는가)은 다시 계산할 수 없는
 * 관측이므로 DB에 남긴다.
 */
export default async function AeoPage() {
  const db = await createServerSupabase();

  const [{ data: keywords }, { data: observations }, content, posts] = await Promise.all([
    db
      .from('aeo_keywords')
      .select('id, keyword, question, target_path, priority, active, note')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true }),
    db
      .from('aeo_observations')
      .select('id, keyword_id, engine, observed_at, cited, snippet, note')
      .order('observed_at', { ascending: false })
      .limit(400),
    getSiteContent(),
    getPublishedPosts(),
  ]);

  const corpus = buildCorpus(content, posts);

  const rows: AeoKeywordRow[] = (keywords ?? []).map((k) => ({
    id: k.id as string,
    keyword: k.keyword as string,
    question: (k.question as string) ?? '',
    targetPath: (k.target_path as string | null) ?? null,
    priority: (k.priority as number) ?? 100,
    active: (k.active as boolean) ?? true,
    note: (k.note as string | null) ?? null,
  }));

  const diagnoses: AeoDiagnosis[] = rows.map((row) => ({
    keywordId: row.id,
    report: analyzeAeo({
      keyword: row.keyword,
      question: row.question,
      corpus,
      targetPath: row.targetPath,
    }),
  }));

  const obs: AeoObservationRow[] = (observations ?? []).map((o) => ({
    id: o.id as string,
    keywordId: o.keyword_id as string,
    engine: o.engine as string,
    observedAt: o.observed_at as string,
    cited: o.cited as boolean,
    snippet: (o.snippet as string | null) ?? null,
    note: (o.note as string | null) ?? null,
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        no="07"
        title="AEO 추적"
        description="ChatGPT·Perplexity 같은 답변엔진이 우리 문장을 인용할 준비가 됐는지 키워드마다 진단하고, 실제로 인용됐는지 기록합니다."
      />
      <AeoManager
        rows={rows}
        diagnoses={diagnoses}
        observations={obs}
        pages={corpus.map((p) => ({ path: p.path, label: p.label }))}
      />
    </div>
  );
}
