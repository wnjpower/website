import PostEditor from '@/components/admin/PostEditor';

export default function NewPostPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  return (
    <PostEditor
      initial={{
        type: searchParams.type ?? 'blog',
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
