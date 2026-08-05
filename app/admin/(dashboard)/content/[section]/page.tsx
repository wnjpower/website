import { notFound } from 'next/navigation';
import SectionEditor from '@/components/admin/SectionEditor';
import { getSectionDef, type ContentKey } from '@/lib/content/schema';
import { getSectionState } from '@/lib/content/admin';

export default async function SectionEditPage(
  { params }: { params: Promise<{ section: string }> },
) {
  const { section: sectionKey } = await params;
  const section = getSectionDef(sectionKey);
  if (!section) notFound();

  const state = await getSectionState(section.key as ContentKey);

  return (
    <SectionEditor
      section={section}
      initialData={state.data}
      hasDraft={state.hasDraft}
    />
  );
}
