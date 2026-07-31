import CtaManager, { type CtaRow } from '@/components/admin/CtaManager';
import PageHeader from '@/components/admin/PageHeader';
import { createServerSupabase } from '@/lib/supabase-server';

export default async function CtaPage() {
  const db = createServerSupabase();
  const { data } = await db
    .from('ctas')
    .select('id, slot, variant, label, sublabel, href, style, icon, weight, active, note')
    .order('slot')
    .order('variant');

  return (
    <div className="space-y-5">
      <PageHeader
        title="CTA 버튼"
        description="사이트의 행동 유도 버튼을 문구·색·링크까지 직접 바꾸고, 같은 자리에 여러 문구를 두어 어느 쪽이 더 눌리는지 비교할 수 있습니다."
      />
      <CtaManager rows={(data ?? []) as CtaRow[]} />
    </div>
  );
}
