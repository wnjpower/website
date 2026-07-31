import Link from 'next/link';
import { Plus, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { createServerSupabase } from '@/lib/supabase-server';
import { POST_TYPE_LABELS, POST_TYPES, postPath, type PostType } from '@/lib/posts';

interface Row {
  id: string; type: string; slug: string; title: string;
  status: string; published_at: string | null; updated_at: string;
  seo_score: number | null; focus_keyword: string | null;
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const type = searchParams.type;

  const db = createServerSupabase();
  let query = db
    .from('posts')
    .select('id, type, slug, title, status, published_at, updated_at, seo_score, focus_keyword')
    .order('updated_at', { ascending: false })
    .limit(200);

  if (type && POST_TYPES.includes(type as PostType)) query = query.eq('type', type);

  const { data, error } = await query;
  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-5">
      <PageHeader
        title="게시판"
        description="검색으로 사람들이 찾아오게 만드는 글을 씁니다. 글을 쓰는 동안 SEO 점수와 고칠 점이 실시간으로 표시됩니다."
        action={
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-700 text-white font-bold px-4 py-2.5 text-[0.9375rem] transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 글 쓰기
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        <FilterLink href="/admin/posts" active={!type} label="전체" />
        {POST_TYPES.map((t) => (
          <FilterLink
            key={t}
            href={`/admin/posts?type=${t}`}
            active={type === t}
            label={POST_TYPE_LABELS[t]}
          />
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800 break-keep">
          게시판 테이블이 아직 없습니다. Supabase SQL 편집기에서{' '}
          <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">supabase/admin-schema.sql</code>을
          실행하면 바로 사용할 수 있습니다.
          <br />
          <span className="text-xs opacity-70">({error.message})</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-500 mb-1">아직 작성된 글이 없습니다.</p>
          <p className="text-sm text-slate-400 mb-6 break-keep px-6">
            &ldquo;대구 공장 전기공사 비용&rdquo;처럼 고객이 실제로 검색하는 말을 제목으로 잡아 보세요.
          </p>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-700 text-white font-bold px-5 py-3 transition-colors"
          >
            <Plus className="w-4 h-4" />
            첫 글 쓰기
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
          {rows.map((post) => (
            <div key={post.id} className="flex items-center gap-3 px-4 py-3.5">
              <Link href={`/admin/posts/${post.id}`} className="flex-1 min-w-0 group">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-0.5">
                  <span
                    className={`text-[0.6875rem] font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {post.status === 'published' ? '발행됨' : '임시저장'}
                  </span>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {POST_TYPE_LABELS[post.type as PostType] ?? post.type}
                  </span>
                  <ScoreBadge score={post.seo_score} />
                </div>
                <p className="font-semibold text-ink truncate group-hover:text-brand transition-colors">
                  {post.title}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {post.focus_keyword ? `키워드: ${post.focus_keyword} · ` : ''}
                  {formatDate(post.published_at ?? post.updated_at)}
                </p>
              </Link>

              {post.status === 'published' && (
                <a
                  href={postPath(post.type, post.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="사이트에서 보기"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand hover:bg-slate-50 flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
        active ? 'bg-brand text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand hover:text-brand'
      }`}
    >
      {label}
    </Link>
  );
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const color =
    score >= 80 ? 'bg-green-100 text-green-700'
    : score >= 50 ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700';
  return (
    <span className={`text-[0.6875rem] font-bold px-2 py-0.5 rounded tabular-nums flex-shrink-0 ${color}`}>
      SEO {score}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' });
}
