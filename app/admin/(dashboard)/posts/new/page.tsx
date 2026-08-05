import PostEditor from '@/components/admin/PostEditor';

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;

  return (
    <PostEditor
      initial={{
        type: type ?? 'blog',
        slug: '',
        title: '',
        excerpt: '',
        body: '',
        coverImage: '',
        coverAlt: '',
        status: 'draft',
        focusKeyword: '',
        metaTitle: '',
        metaDescription: '',
        noindex: false,
      }}
    />
  );
}
