import { getAdminUser } from '@/lib/supabase-server';
import AdminNav from '@/components/admin/AdminNav';
import NotAdmin from '@/components/admin/NotAdmin';
import { StaffCookieSetter } from '@/components/admin/StaffExclusion';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  /*
   * middleware가 비로그인 접근을 이미 로그인 화면으로 보낸다.
   * 여기서 한 번 더 확인하는 것은 "로그인은 됐지만 admins 화이트리스트에 없는 계정"을
   * 걸러내기 위해서다. 실제 데이터 접근은 DB의 RLS가 최종 판정하므로
   * 이 화면 검사가 뚫려도 남의 데이터가 새지는 않는다.
   */
  const user = await getAdminUser();
  if (!user) return <NotAdmin />;

  return (
    <div className="min-h-screen bg-slate-100 text-ink">
      {/* 여기 도달했다는 것 자체가 관리자임을 증명한다 — 그 시점에 표식을 심는다 */}
      <StaffCookieSetter />
      <AdminNav userName={user.name ?? user.email} />
      <div className="lg:pl-60">
        <main className="px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-10 max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
