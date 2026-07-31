import { notFound } from 'next/navigation';
import PostEditor from '@/components/admin/PostEditor';
import { createServerSupabase } from '@/lib/supabase-server';

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const db = createServerSupabase();
  const { data } = await db
    .from('posts')
    .select(
      'id, type, slug, title, excerpt, body, cover_image, cover_alt, status, focus_keyword, meta_title, meta_description, noindex',
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <PostEditor
      initial={{
        id: data.id,
        type: data.type,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt ?? '',
        body: data.body ?? '',
        coverImage: data.cover_image ?? '',
        coverAlt: data.cover_alt ?? '',
        status: data.status,
        focusKeyword: data.focus_keyword ?? '',
        metaTitle: data.meta_title ?? '',
        metaDescription: data.meta_description ?? '',
        noindex: data.noindex ?? false,
      }}
    />
  );
}
