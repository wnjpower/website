import { getAdminUser } from '@/lib/supabase-server';
import AdminNav from '@/components/admin/AdminNav';
import NotAdmin from '@/components/admin/NotAdmin';

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
    <>
      {/* 관리자 방문 제외 표식은 middleware가 심는다 (화면 렌더 여부와 무관하게 확실히) */}
      <AdminNav userName={user.name ?? user.email} />
      <div className="a-body">
        <main className="a-main">{children}</main>
      </div>
    </>
  );
}
