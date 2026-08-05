import Link from 'next/link';
import { Plus, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { Chip, Notice, Empty } from '@/components/admin/ui';
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
    <div className="space-y-4">
      <PageHeader
        no="05"
        title="게시판"
        description="검색으로 사람들이 찾아오게 만드는 글을 씁니다. 글을 쓰는 동안 SEO 점수와 고칠 점이 실시간으로 표시됩니다."
        action={
          <Link href="/admin/posts/new" className="a-btn a-btn--solid">
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            새 글 쓰기
          </Link>
        }
      />

      <div className="bp-seg flex-wrap">
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
        <Notice tone="warn" title="게시판 테이블이 아직 없습니다">
          <p>
            Supabase SQL 편집기에서 <code>supabase/admin-schema.sql</code>을 실행하면 바로 사용할 수 있습니다.
          </p>
          <p className="opacity-70 mt-1">({error.message})</p>
        </Notice>
      ) : rows.length === 0 ? (
        <div className="a-panel">
          <Empty>
            아직 작성된 글이 없습니다.
            <br />
            &ldquo;대구 공장 전기공사 비용&rdquo;처럼 고객이 실제로 검색하는 말을 제목으로 잡아 보세요.
          </Empty>
          <div className="flex justify-center pb-10">
            <Link href="/admin/posts/new" className="a-btn a-btn--solid">
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              첫 글 쓰기
            </Link>
          </div>
        </div>
      ) : (
        <div className="a-panel a-rows">
          {rows.map((post) => (
            <div key={post.id} className="flex items-center gap-3 px-4 py-3 a-row-hover">
              <Link href={`/admin/posts/${post.id}`} className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                  <Chip tone={post.status === 'published' ? 'ok' : 'muted'}>
                    {post.status === 'published' ? '발행됨' : '임시저장'}
                  </Chip>
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    {POST_TYPE_LABELS[post.type as PostType] ?? post.type}
                  </span>
                  <ScoreChip score={post.seo_score} />
                </div>
                <p className="truncate" style={{ fontWeight: 500 }}>{post.title}</p>
                <p className="text-muted truncate" style={{ fontSize: 12 }}>
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
                  className="a-btn a-btn--icon a-btn--sm a-btn--ghost"
                >
                  <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
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
    <Link href={href} className="bp-seg-opt display" data-active={active ? '' : undefined}>
      {label}
    </Link>
  );
}

function ScoreChip({ score }: { score: number | null }) {
  if (score === null) return null;
  const tone = score >= 80 ? 'ok' : score >= 50 ? 'warn' : 'err';
  return (
    <Chip tone={tone}>
      <span className="mono-num">SEO {score}</span>
    </Chip>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' });
}
